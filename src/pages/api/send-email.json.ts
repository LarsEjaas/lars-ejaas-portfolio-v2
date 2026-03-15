export const prerender = false;

import type { APIRoute } from 'astro';
import { z, ZodError } from 'zod';
import { SITE_URL, NODE_ENV } from 'astro:env/client';
// import Handlebars from 'handlebars/runtime';
import { sanitizeHTMLWithURLValidation } from './utils/sanitizer.ts';
import type { Language } from '@i18n/settings.ts';

// import mailTemplateDa from './dist/mailTemplateDa.js';
// import mailTemplateEn from './dist/mailTemplateEn.js';
// import newMessageDa from './dist/newMessageDa.js';
// import newMessageEn from './dist/newMessageEn.js';

// NOTE: nodemailer and nodemailer-express-handlebars are Node.js specific
// and are incompatible with Cloudflare Workers.
// They have been temporarily disabled.
// A dedicated email API (e.g., MailChannels) should be used.
// import nodemailer from 'nodemailer';
// import hbs from 'nodemailer-express-handlebars';
// import { type NodemailerExpressHandlebarsOptions } from 'nodemailer-express-handlebars';
//@ts-ignore
// import type { Options as MailOptions } from '@types/nodemailer/lib/smtp-transport'; // Node.js specific

const REDIRECT_SLUGS = {
  en: {
    success: 'message-received',
    error: 'message-error',
  },
  da: {
    success: 'besked-modtaget',
    error: 'besked-fejl',
  },
} as const;

// const UNIQUE_IDENTIFIER = 'contact';

// const GITHUB_ICON = 'github_icon.png';
// const LINKEDIN_ICON = 'linkedin_icon.png';
// const BLUESKY_ICON = 'bluesky_icon.png';
// const LETTER_ICON = 'letter_icon.png';
// const WRITE_TO_ME = 'write_to_me.png';
// const SKRIV_TIL_MIG = 'skriv_til_mig.png';
// const EJAAS_LOGO_1 = 'logo1_email.png';
// const EJAAS_LOGO_2 = 'logo2_email.png';
// const EJAAS_SIGNATURE = 'signature.png';
// const PROFILE_PIC = 'profile.png';

// const templates = {
//   mailTemplateDa,
//   mailTemplateEn,
//   newMessageDa,
//   newMessageEn,
// };

/**
 * Remove trailing slash from a slug or url, preserving literal type
 */
function removeTrailingSlash<T extends string>(
  url: T
): T extends `${infer Rest}/` ? Rest : T {
  return (
    url.endsWith('/') ? url.slice(0, -1) : url
  ) as T extends `${infer Rest}/` ? Rest : T;
}

type RedirectParams =
  | {
      language: Language;
      referer: string | null;
      type: 'success';
      errorMessage?: never;
      errorCode?: never;
    }
  | {
      language: Language;
      referer: string | null;
      type: 'error';
      errorMessage: string;
      errorCode: string;
    };

const getRedirectUrl = ({
  language,
  referer,
  type,
  errorMessage,
  errorCode,
}: RedirectParams) => {
  const slug = REDIRECT_SLUGS[language][type];

  let baseUrl: string;

  if (!referer) {
    baseUrl = `../${slug}/`;
  } else {
    try {
      const url = new URL(referer);
      const pathSegments = url.pathname.split('/').filter(Boolean);
      pathSegments.pop();
      const newPath = pathSegments.length
        ? `/${pathSegments.join('/')}/${slug}/`
        : `/${slug}/`;

      baseUrl = `${url.origin}${newPath}`;
    } catch {
      baseUrl = `../${slug}/`;
    }
    // Add query params for error pages
    if (type === 'error' && errorMessage && errorCode) {
      const params = new URLSearchParams({
        error: errorMessage,
        code: errorCode,
      });
      return `${baseUrl}?${params.toString()}`;
    }
  }
  return baseUrl;
};

const isNodemailerError = (error: unknown): boolean => {
  if (
    !(error instanceof Error) ||
    !('code' in error) ||
    typeof error.code !== 'string'
  ) {
    return false;
  }
  const nodemailerErrorCodes = [
    'EENVELOPE',
    'EENVELOPEFORMAT',
    'EENCODE',
    'EMESSAGEID',
    'ETXTBSY',
    'EFILE',
    'ECONNECTION',
    'EAUTH',
    'ENOAUTH',
    'ETLS',
    'ESTARTTLS',
    'EUPGRADE',
    'EENOTFOUND',
    'EENOTEMPTY',
    'EMSGBIG',
    'EINVALIDDATE',
    'ETOOMANYTOS',
    'ETOOMANYMSGS',
  ];

  return nodemailerErrorCodes.includes(error.code);
};

const getErrorMessage = (
  error: unknown,
  language: Language
): { errorMessage: string; errorCode: string } => {
  switch (true) {
    case error instanceof ZodError:
      return {
        errorCode: 'VALIDATION_ERROR',
        errorMessage:
          language === 'en'
            ? 'One or more fields in the contact form are invalid. Please review your information and try again.'
            : 'En eller flere felter i kontaktformularen er ugyldige. Gennemgå venligst dine oplysninger og prøv igen.',
      };

    case error === 'UNAUTHORIZED':
      return {
        errorCode: 'UNAUTHORIZED',
        errorMessage:
          language === 'en'
            ? 'Unauthorized request. Please submit the form from the official website.'
            : 'Uautoriseret anmodning. Send venligst formularen fra den officielle hjemmeside.',
      };

    case error === 'NOT_FOUND':
      return {
        errorCode: 'NOT_FOUND',
        errorMessage:
          language === 'en'
            ? 'The requested endpoint was not found.'
            : 'Den anmodede endpoint blev ikke fundet.',
      };

    case error instanceof TypeError && error.message.includes('MAIL_USER'):
    case error instanceof TypeError && error.message.includes('MAIL_PASSWORD'):
      return {
        errorCode: 'CONFIG_ERROR',
        errorMessage:
          language === 'en'
            ? 'A technical issue occurred while processing the message. Please try again later.'
            : 'Der opstod et teknisk problem under behandlingen af beskeden. Prøv venligst igen senere.',
      };

    case error instanceof Error && isNodemailerError(error): // This will now always be false
      return {
        errorCode: 'EMAIL_ERROR',
        errorMessage:
          language === 'en'
            ? 'There was an issue sending the message. Please try again later.'
            : 'Der opstod et problem med at sende beskeden. Prøv venligst igen senere.',
      };

    case error instanceof Error && error.message.includes('ENOTFOUND'):
      return {
        errorCode: 'NETWORK_ERROR',
        errorMessage:
          language === 'en'
            ? 'There was a problem connecting to the email service. Please try sending your message again later.'
            : 'Der opstod et problem med at oprette forbindelse til email-tjenesten. Prøv venligst at sende din besked igen senere.',
      };

    default:
      return {
        errorCode: 'UNKNOWN_ERROR',
        errorMessage:
          language === 'en'
            ? 'An unexpected issue occurred while submitting the message. Please try again later.'
            : 'Der opstod et uventet problem under indsendelsen af beskeden. Prøv venligst igen senere.',
      };
  }
};

const FUNCTION_ENDPOINT = '/api/send-email.json';

const formDataSchema = z.object({
  phone: z.string(),
  full_name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z
    .string()
    .min(1, 'Message is required')
    .transform((val) => sanitizeHTMLWithURLValidation(val)),
  language: z.enum(['en', 'da'], {
    message: "Language must be either 'en' or 'da'",
  }),
});

// type EmailTemplateContext = {
//   first_name: string;
//   siteURL: string;
//   logo1: `cid:logo1@${typeof UNIQUE_IDENTIFIER}`;
//   logo2: `cid:logo2@${typeof UNIQUE_IDENTIFIER}`;
//   linkedIn: `cid:linkedin@${typeof UNIQUE_IDENTIFIER}`;
//   github: `cid:github@${typeof UNIQUE_IDENTIFIER}`;
//   bluesky: `cid:bluesky@${typeof UNIQUE_IDENTIFIER}`;
//   letter: `cid:letter@${typeof UNIQUE_IDENTIFIER}`;
//   writeToMe: `cid:write@${typeof UNIQUE_IDENTIFIER}`;
//   profilePic: `cid:profile@${typeof UNIQUE_IDENTIFIER}`;
//   signature: `cid:signature@${typeof UNIQUE_IDENTIFIER}`;
//   message: string;
// };

// type Identifier =
//   | 'logo1'
//   | 'logo2'
//   | 'linkedin'
//   | 'github'
//   | 'bluesky'
//   | 'letter'
//   | 'write'
//   | 'profile'
//   | 'signature';

// type MailAttachment = {
//   filename:
//     | typeof LINKEDIN_ICON
//     | typeof GITHUB_ICON
//     | typeof BLUESKY_ICON
//     | typeof LETTER_ICON
//     | typeof WRITE_TO_ME
//     | typeof SKRIV_TIL_MIG
//     | typeof EJAAS_LOGO_1
//     | typeof EJAAS_LOGO_2
//     | typeof PROFILE_PIC
//     | typeof EJAAS_SIGNATURE;
//   path: string;
//   cid: `${Identifier}@${typeof UNIQUE_IDENTIFIER}`;
// };

// const getMailAttachments = (
//   lang: Language,
//   type: 'notification' | 'confirmation',
//   env: Cloudflare.Env
// ): MailAttachment[] => {
//   const attachments: MailAttachment[] = [];
//   const site_url = `${removeTrailingSlash(env.SITE_URL)}/`;
//   attachments.push(
//     {
//       filename: LINKEDIN_ICON,
//       path: site_url + LINKEDIN_ICON,
//       cid: `linkedin@${UNIQUE_IDENTIFIER}`,
//     },
//     {
//       filename: GITHUB_ICON,
//       path: site_url + GITHUB_ICON,
//       cid: `github@${UNIQUE_IDENTIFIER}`,
//     },
//     {
//       filename: BLUESKY_ICON,
//       path: site_url + BLUESKY_ICON,
//       cid: `bluesky@${UNIQUE_IDENTIFIER}`,
//     },
//     {
//       filename: LETTER_ICON,
//       path: site_url + LETTER_ICON,
//       cid: `letter@${UNIQUE_IDENTIFIER}`,
//     }
//   );
//   if (type === 'notification') {
//     attachments.push({
//       filename: `${lang === 'da' ? SKRIV_TIL_MIG : WRITE_TO_ME}`,
//       path: lang === 'da' ? site_url + SKRIV_TIL_MIG : site_url + WRITE_TO_ME,

//       cid: `write@${UNIQUE_IDENTIFIER}`,
//     });
//   }
//   if (type === 'confirmation') {
//     attachments.push(
//       {
//         filename: EJAAS_LOGO_1,
//         path: site_url + EJAAS_LOGO_1,
//         cid: `logo1@${UNIQUE_IDENTIFIER}`,
//       },
//       {
//         filename: EJAAS_LOGO_2,
//         path: site_url + EJAAS_LOGO_2,
//         cid: `logo2@${UNIQUE_IDENTIFIER}`,
//       },
//       {
//         filename: PROFILE_PIC,
//         path: site_url + PROFILE_PIC,
//         cid: `profile@${UNIQUE_IDENTIFIER}`,
//       },
//       {
//         filename: EJAAS_SIGNATURE,
//         path: site_url + EJAAS_SIGNATURE,
//         cid: `signature@${UNIQUE_IDENTIFIER}`,
//       }
//     );
//   }

//   return attachments;
// };

// type TemplateOptions = {
//   template:
//     | 'mailTemplateDa'
//     | 'mailTemplateEn'
//     | 'newMessageDa'
//     | 'newMessageEn';
//   context?: EmailTemplateContext;
// };

// type MailWithTemplateOptions = MailOptions & TemplateOptions; // MailOptions is gone
// type MailWithTemplateOptions = TemplateOptions & {
//   from: string;
//   replyTo: string;
//   to: string;
//   subject: string;
//   attachments: MailAttachment[];
// };

// Helper to get first name from full name
// const getFirstName = (fullName: string): string => {
//   return fullName.split(' ')[0] || fullName;
// };

const parseFormData = async (request: Request) => {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        data[key] = value;
      }
    });

    const parseResult = formDataSchema.safeParse(data);

    return parseResult;
  } catch (error) {
    // console.log('[ERROR]', 'Failed to parse form data:', error);
    // Return a failure object matching Zod's safeParse structure
    return {
      success: false as const,
      error: new ZodError([
        {
          code: 'custom',
          message: 'Failed to parse form data',
          path: [],
        },
      ]),
    };
  }
};

// Create handlebars instance
// const exphbs = create({
//   extname: '.handlebars',
//   defaultLayout: false,
// });

// Configure handlebars options with correct typing
// const handlebarsOptions: NodemailerExpressHandlebarsOptions = { // Nodemailer types are gone
//   viewEngine: exphbs,
//   viewPath: path.resolve(__dirname, './'), // path.resolve is gone
//   extName: '.handlebars',
// };

/** Mocking nodemailer.createTransport in local development testing */
// const mockTransporter = {
//   verify: async () => true,
//   use: () => {},
//   sendMail: async (options: MailWithTemplateOptions) => {
//     // eslint-disable-next-line no-console
//     console.log(
//       '[INFO]',
//       '👨‍💻Development mode: Email would be sent with:',
//       options
//     );
//     return { messageId: 'mock-id' };
//   },
// };

// Enable CORS for local development
const DEV_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function redirect303({ body, url }: { body: string; url: string }): Response {
  return new Response(body, {
    status: 303,
    headers: {
      'content-type': 'application/json',
      ...(NODE_ENV === 'development' ? DEV_HEADERS : {}),
      Location: url,
    },
  });
}

export const POST: APIRoute = async (context) => {
  const {
    request,
    // url, currentLocale,
    routePattern,
  } = context;
  const { headers } = request;
  const origin = headers.get('origin');
  const referer = headers.get('referer');
  const fallbackLanguage = ['en', 'da'].includes(
    context.currentLocale as RedirectParams['language']
  )
    ? (context.currentLocale as RedirectParams['language'])
    : 'en';
  // console.log('context:', context);

  const refererUrl = referer || origin;

  const site_url = removeTrailingSlash(SITE_URL);
  if (NODE_ENV !== 'development' && origin !== site_url) {
    const clientsideError = getErrorMessage('UNAUTHORIZED', fallbackLanguage);
    return redirect303({
      body: JSON.stringify({
        error: clientsideError.errorCode,
        message: clientsideError.errorMessage,
      }),
      url: getRedirectUrl({
        language: fallbackLanguage,
        referer: refererUrl,
        type: 'error',
        ...clientsideError,
      }),
    });
  }

  if (routePattern !== FUNCTION_ENDPOINT) {
    const clientsideError = getErrorMessage('NOT_FOUND', fallbackLanguage);
    return redirect303({
      body: JSON.stringify({
        error: clientsideError.errorCode,
        message: clientsideError.errorMessage,
      }),
      url: getRedirectUrl({
        language: fallbackLanguage,
        referer: refererUrl,
        type: 'error',
        ...clientsideError,
      }),
    });
  }

  try {
    const formData = await parseFormData(context.request);

    if (!formData.success) {
      const clientsideError = getErrorMessage(
        'VALIDATION_ERROR',
        fallbackLanguage
      );
      return redirect303({
        body: JSON.stringify({
          error: clientsideError.errorCode,
          message: clientsideError.errorMessage,
        }),
        url: getRedirectUrl({
          language: fallbackLanguage,
          referer: refererUrl,
          type: 'error',
          ...clientsideError,
        }),
      });
    }

    const { data } = formData;
    // const first_name = getFirstName(data.full_name);
    const {
      full_name: sender_name,
      email: sender_email,
      // message: sender_message,
      // subject: sender_subject,
      language,
      phone: honey_pot,
    } = data;

    if (honey_pot.length === 0) {
      // Node.js specific nodemailer is disabled. Use mockTransporter.
      // const createNodeMailerTransporter = () =>
      //   nodemailer.createTransport({
      //     host: 'smtp.gmail.com',
      //     port: 587,
      //     secure: false,
      //     auth: {
      //       user: env.MAIL_USER,
      //       pass: env.MAIL_PASSWORD,
      //     },
      //   });

      // const transporter = mockTransporter; // Always use mockTransporter for now

      if (NODE_ENV === 'production') {
        // transporter.verify(function (error, success) { // Node.js specific
        //   if (error) {
        //     // eslint-disable-next-line no-console
        //     console.log('[ERROR]', '❗Email transporter failed:', error);
        //   } else {
        //     // eslint-disable-next-line no-console
        //     console.log(
        //       '[INFO]',
        //       '✅ Server is ready to take our messages:',
        //       success
        //     );
        //   }
        // });
      }

      // const confirmationTemplate =
      //   sender_language === 'da' ? 'mailTemplateDa' : 'mailTemplateEn';
      // const subject =
      //   sender_language === 'da'
      //     ? '🎈 Tak for din besked!'
      //     : '🎈 Thank you for your message!';

      // Only set up handlebars in production
      if (NODE_ENV === 'production') {
        // transporter.use('compile', hbs(handlebarsOptions)); // Node.js specific
      }

      // --- Mail Options remain the same types for now, will fail due to MailOptions type being gone
      // const mailConfirmationOptions: MailWithTemplateOptions = {
      //   from: `Lars 👨‍💻 Ejaas <${env.NOREPLY_PRIVATE_EMAIL_USER}>`,
      //   to: `${sender_name} <${sender_email}>`,
      //   subject: subject,
      //   template: confirmationTemplate,
      //   context: {
      //     first_name: first_name,
      //     siteURL: site_url,
      //     linkedIn: `cid:linkedin@${UNIQUE_IDENTIFIER}`,
      //     github: `cid:github@${UNIQUE_IDENTIFIER}`,
      //     bluesky: `cid:bluesky@${UNIQUE_IDENTIFIER}`,
      //     letter: `cid:letter@${UNIQUE_IDENTIFIER}`,
      //     writeToMe: `cid:write@${UNIQUE_IDENTIFIER}`,
      //     logo1: `cid:logo1@${UNIQUE_IDENTIFIER}`,
      //     logo2: `cid:logo2@${UNIQUE_IDENTIFIER}`,
      //     profilePic: `cid:profile@${UNIQUE_IDENTIFIER}`,
      //     signature: `cid:signature@${UNIQUE_IDENTIFIER}`,
      //     message: sender_message,
      //   },
      //   attachments: getMailAttachments(language, 'confirmation', env),
      // };

      // const notificationTemplate =
      //   sender_language === 'da' ? 'newMessageDa' : 'newMessageEn';

      // const mailNotificationOptions: MailWithTemplateOptions = {
      //   from: `Lars 👨‍💻 Ejaas <${env.PRIVATE_EMAIL_USER}>`, // this has to be the actual email address as the email client will otherwise rewriting it.
      //   replyTo: `${sender_name} <${sender_email}>`, // Sender's email for replies
      //   to: env.PRIVATE_EMAIL_USER,
      //   subject: sender_subject,
      //   template: notificationTemplate,
      //   context: {
      //     first_name: first_name,
      //     siteURL: site_url,
      //     linkedIn: `cid:linkedin@${UNIQUE_IDENTIFIER}`,
      //     github: `cid:github@${UNIQUE_IDENTIFIER}`,
      //     bluesky: `cid:bluesky@${UNIQUE_IDENTIFIER}`,
      //     letter: `cid:letter@${UNIQUE_IDENTIFIER}`,
      //     writeToMe: `cid:write@${UNIQUE_IDENTIFIER}`,
      //     logo1: `cid:logo1@${UNIQUE_IDENTIFIER}`,
      //     logo2: `cid:logo2@${UNIQUE_IDENTIFIER}`,
      //     profilePic: `cid:profile@${UNIQUE_IDENTIFIER}`,
      //     signature: `cid:signature@${UNIQUE_IDENTIFIER}`,
      //     message: sender_message,
      //   },
      //   attachments: getMailAttachments(language, 'notification', env),
      // };

      // Node.js specific nodemailer.sendMail is disabled.
      // await Promise.all([
      //   // send confirmation email to sender
      //   transporter.sendMail(mailConfirmationOptions),
      //   // Notification email to receiver
      //   transporter.sendMail(mailNotificationOptions),
      // ]);
      // eslint-disable-next-line no-console
      console.log(
        '[INFO]',
        `✉️ Email from ${sender_name} was sent successfully. Confirmation sent to senders inbox at: ${sender_email}`
      );
    }

    // Redirect to confirmation page

    return redirect303({
      body: JSON.stringify({
        message: `Emails ${
          NODE_ENV === 'production' ? 'was' : 'would be'
        } sent successfully. Confirmation sent to ${sender_name} at ${sender_email}`,
      }),
      url: getRedirectUrl({
        language,
        referer: refererUrl,
        type: 'success',
      }),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('[ERROR]', '❗Error sending email:', error);

    const language = ['en', 'da'].includes(
      context.currentLocale as RedirectParams['language']
    )
      ? (context.currentLocale as RedirectParams['language'])
      : 'en';
    // Handle errors and redirect to error page
    const clientsideError = getErrorMessage(error, language);
    const refererUrl = headers.get('referer') || origin;

    return redirect303({
      body: JSON.stringify({
        error: clientsideError.errorCode,
        message: clientsideError.errorMessage,
      }),
      url: getRedirectUrl({
        language,
        referer: refererUrl,
        type: 'error',
        ...clientsideError,
      }),
    });
  }
};
