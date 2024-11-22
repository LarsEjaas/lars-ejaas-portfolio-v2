import { type Context, type Config } from '@netlify/functions';
import { z, ZodError } from 'zod';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import { type NodemailerExpressHandlebarsOptions } from 'nodemailer-express-handlebars';
//@ts-ignore
import type { Options as MailOptions } from '@types/nodemailer/lib/smtp-transport';
import { create } from 'express-handlebars';
import path from 'path';
import dotenv from 'dotenv';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const UNIQUE_IDENTIFIER = 'contact';

const GITHUB_ICON = 'github_icon.png';
const LINKEDIN_ICON = 'linkedin_icon.png';
const X_ICON = 'x_icon.png';
const LETTER_ICON = 'letter_icon.png';
const WRITE_TO_ME = 'write_to_me.png';
const SKRIV_TIL_MIG = 'skriv_til_mig.png';
const EJAAS_LOGO_1 = 'logo1_email.png';
const EJAAS_LOGO_2 = 'logo2_email.png';
const EJAAS_SIGNATURE = 'signature.png';
const PROFILE_PIC = 'profile.png';

const sanitizedHTML = (dirtyHTML: string) =>
  purify.sanitize(dirtyHTML, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'b',
      'i',
      'em',
      'strong',
      'span',
      'div',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'pre',
      'code',
      'blockquote',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'hr',
      'small',
      'sub',
      'sup',
    ],
    ALLOWED_ATTR: ['class', 'href', 'style', 'target', 'rel', 'id'],
  });

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

/**
 * Remove trailing slash from a slug or url, preserving literal type
 */
export function removeTrailingSlash<T extends string>(
  url: T
): T extends `${infer Rest}/` ? Rest : T {
  return (
    url.endsWith('/') ? url.slice(0, -1) : url
  ) as T extends `${infer Rest}/` ? Rest : T;
}

const getRedirectUrl = (
  language: 'en' | 'da',
  referer: string | null,
  type: 'success' | 'error' = 'success'
) => {
  const slug = REDIRECT_SLUGS[language][type];

  if (!referer) {
    return `../${slug}`;
  }

  try {
    const url = new URL(referer);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    pathSegments.pop();
    const newPath = pathSegments.length
      ? `/${pathSegments.join('/')}/${slug}`
      : `/${slug}`;

    return `${url.origin}${newPath}`;
  } catch {
    return `../${slug}`;
  }
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
  language: 'en' | 'da'
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

    case error instanceof TypeError && error.message.includes('MAIL_USER'):
    case error instanceof TypeError && error.message.includes('MAIL_PASSWORD'):
      return {
        errorCode: 'CONFIG_ERROR',
        errorMessage:
          language === 'en'
            ? 'A technical issue occurred while processing the message. Please try again later.'
            : 'Der opstod et teknisk problem under behandlingen af beskeden. Prøv venligst igen senere.',
      };

    case error instanceof Error && isNodemailerError(error):
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

const FUNCTION_ENDPOINT = '/.netlify/functions/send-email';

const formDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z
    .string()
    .min(1, 'Message is required')
    .transform((val) => sanitizedHTML(val)),
  language: z.enum(['en', 'da'], {
    errorMap: () => ({ message: "Language must be either 'en' or 'da'" }),
  }),
});

type EmailTemplateContext = {
  first_name: string;
  siteURL: string;
  logo1: `cid:logo1@${typeof UNIQUE_IDENTIFIER}`;
  logo2: `cid:logo2@${typeof UNIQUE_IDENTIFIER}`;
  linkedIn: `cid:linkedin@${typeof UNIQUE_IDENTIFIER}`;
  github: `cid:github@${typeof UNIQUE_IDENTIFIER}`;
  x: `cid:x@${typeof UNIQUE_IDENTIFIER}`;
  letter: `cid:letter@${typeof UNIQUE_IDENTIFIER}`;
  writeToMe: `cid:write@${typeof UNIQUE_IDENTIFIER}`;
  profilePic: `cid:profile@${typeof UNIQUE_IDENTIFIER}`;
  signature: `cid:signature@${typeof UNIQUE_IDENTIFIER}`;
  message: string;
};

type Identifier =
  | 'logo1'
  | 'logo2'
  | 'linkedin'
  | 'github'
  | 'x'
  | 'letter'
  | 'write'
  | 'profile'
  | 'signature';

type MailAttachment = {
  filename:
    | typeof LINKEDIN_ICON
    | typeof GITHUB_ICON
    | typeof X_ICON
    | typeof LETTER_ICON
    | typeof WRITE_TO_ME
    | typeof SKRIV_TIL_MIG
    | typeof EJAAS_LOGO_1
    | typeof EJAAS_LOGO_2
    | typeof PROFILE_PIC
    | typeof EJAAS_SIGNATURE;
  path: string;
  cid: `${Identifier}@${typeof UNIQUE_IDENTIFIER}`;
};

const getMailAttachments = (
  lang: 'en' | 'da',
  type: 'notification' | 'confirmation'
): MailAttachment[] => {
  const attachments: MailAttachment[] = [];
  attachments.push(
    {
      filename: LINKEDIN_ICON,
      path: path.resolve(__dirname, `./${LINKEDIN_ICON}`),
      cid: `linkedin@${UNIQUE_IDENTIFIER}`,
    },
    {
      filename: GITHUB_ICON,
      path: path.resolve(__dirname, `./${GITHUB_ICON}`),
      cid: `github@${UNIQUE_IDENTIFIER}`,
    },
    {
      filename: X_ICON,
      path: path.resolve(__dirname, `./${X_ICON}`),
      cid: `x@${UNIQUE_IDENTIFIER}`,
    },
    {
      filename: LETTER_ICON,
      path: path.resolve(__dirname, `./${LETTER_ICON}`),
      cid: `letter@${UNIQUE_IDENTIFIER}`,
    }
  );
  if (type === 'notification') {
    attachments.push({
      filename: `${lang === 'da' ? SKRIV_TIL_MIG : WRITE_TO_ME}`,
      path: path.resolve(
        __dirname,
        `./${lang === 'da' ? SKRIV_TIL_MIG : WRITE_TO_ME}`
      ),
      cid: `write@${UNIQUE_IDENTIFIER}`,
    });
  }
  if (type === 'confirmation') {
    attachments.push(
      {
        filename: EJAAS_LOGO_1,
        path: path.resolve(__dirname, `./${EJAAS_LOGO_1}`),
        cid: `logo1@${UNIQUE_IDENTIFIER}`,
      },
      {
        filename: EJAAS_LOGO_2,
        path: path.resolve(__dirname, `./${EJAAS_LOGO_2}`),
        cid: `logo2@${UNIQUE_IDENTIFIER}`,
      },
      {
        filename: PROFILE_PIC,
        path: path.resolve(__dirname, `./${PROFILE_PIC}`),
        cid: `profile@${UNIQUE_IDENTIFIER}`,
      },
      {
        filename: EJAAS_SIGNATURE,
        path: path.resolve(__dirname, `./${EJAAS_SIGNATURE}`),
        cid: `signature@${UNIQUE_IDENTIFIER}`,
      }
    );
  }

  return attachments;
};

type TemplateOptions = {
  template:
    | 'mailTemplateDa'
    | 'mailTemplateEn'
    | 'newMessageDa'
    | 'newMessageEn';
  context?: EmailTemplateContext;
};

type MailWithTemplateOptions = MailOptions & TemplateOptions;

// Helper to get first name from full name
const getFirstName = (fullName: string): string => {
  return fullName.split(' ')[0] || fullName;
};

const parseFormData = async (
  request: Request
): Promise<Record<string, string>> => {
  const formData = await request.formData();
  const data: Record<string, string> = {};

  formData.forEach((value, key) => {
    if (typeof value === 'string') {
      data[key] = value;
    }
  });

  return data;
};

// Create handlebars instance
const exphbs = create({
  extname: '.handlebars',
  defaultLayout: false,
});

// Configure handlebars options with correct typing
const handlebarsOptions: NodemailerExpressHandlebarsOptions = {
  viewEngine: exphbs,
  viewPath: path.resolve(__dirname, './'),
  extName: '.handlebars',
};

//Load environment variables during development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

/** Mocking nodemailer.createTransport in local development testing */
const mockTransporter = {
  verify: async () => true,
  use: () => {},
  sendMail: async (options: MailWithTemplateOptions) => {
    console.info('Development mode: Email would be sent with:', options);
    return { messageId: 'mock-id' };
  },
};

export default async (req: Request, context: Context) => {
  // Enable CORS for local development
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  } as const;

  // Default to English redirect
  let redirectUrl = getRedirectUrl('en', req.headers.get('referer') || '');
  let language: 'en' | 'da' = 'en';

  if (context.url.pathname !== FUNCTION_ENDPOINT) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Not Found' }),
      headers: { 'content-type': 'application/json' },
    };
  }

  try {
    const formData = await parseFormData(req as Request);
    const parseResult = formDataSchema.safeParse(formData);

    const refererUrl = req.headers.get('referer') || req.headers.get('origin');

    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: parseResult.error.errors,
        }),
        {
          status: 400,
          headers,
        }
      );
    }

    const { data } = parseResult;
    const first_name = getFirstName(data.name);
    const site_url = context.url.origin;
    const {
      name: sender_name,
      email: sender_email,
      message: sender_message,
      subject: sender_subject,
      language: sender_language,
    } = data;

    language = sender_language;

    if (sender_language === 'da') {
      redirectUrl = getRedirectUrl('da', refererUrl);
    }

    const createNodeMailerTransporter = () =>
      nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      });

    const transporter =
      process.env.NODE_ENV === 'production'
        ? createNodeMailerTransporter()
        : mockTransporter;

    if (process.env.NODE_ENV === 'production') {
      transporter.verify(function (error, success) {
        if (error) {
          console.error(error);
        } else {
          console.info('Server is ready to take our messages:', success);
        }
      });
    }

    const confirmationTemplate =
      sender_language === 'da' ? 'mailTemplateDa' : 'mailTemplateEn';
    const subject =
      sender_language === 'da'
        ? '🎈 Tak for din besked!'
        : '🎈 Thank you for your message!';

    // Only set up handlebars in production
    if (process.env.NODE_ENV === 'production') {
      transporter.use('compile', hbs(handlebarsOptions));
    }

    const mailConfirmationOptions: MailWithTemplateOptions = {
      from: `Lars 👨‍💻 Ejaas <${process.env.NOREPLY_PRIVATE_EMAIL_USER}>`,
      to: `${sender_name} <${sender_email}>`,
      subject: subject,
      template: confirmationTemplate,
      context: {
        first_name: first_name,
        siteURL: site_url,
        linkedIn: `cid:linkedin@${UNIQUE_IDENTIFIER}`,
        github: `cid:github@${UNIQUE_IDENTIFIER}`,
        x: `cid:x@${UNIQUE_IDENTIFIER}`,
        letter: `cid:letter@${UNIQUE_IDENTIFIER}`,
        writeToMe: `cid:write@${UNIQUE_IDENTIFIER}`,
        logo1: `cid:logo1@${UNIQUE_IDENTIFIER}`,
        logo2: `cid:logo2@${UNIQUE_IDENTIFIER}`,
        profilePic: `cid:profile@${UNIQUE_IDENTIFIER}`,
        signature: `cid:signature@${UNIQUE_IDENTIFIER}`,
        message: sender_message,
      },
      attachments: getMailAttachments(language, 'confirmation'),
    };

    const notificationTemplate =
      sender_language === 'da' ? 'newMessageDa' : 'newMessageEn';

    const mailNotificationOptions: MailWithTemplateOptions = {
      from: `${sender_name} <${sender_email}>`,
      to: process.env.PRIVATE_EMAIL_USER,
      subject: sender_subject,
      template: notificationTemplate,
      context: {
        first_name: first_name,
        siteURL: site_url,
        linkedIn: `cid:linkedin@${UNIQUE_IDENTIFIER}`,
        github: `cid:github@${UNIQUE_IDENTIFIER}`,
        x: `cid:x@${UNIQUE_IDENTIFIER}`,
        letter: `cid:letter@${UNIQUE_IDENTIFIER}`,
        writeToMe: `cid:write@${UNIQUE_IDENTIFIER}`,
        logo1: `cid:logo1@${UNIQUE_IDENTIFIER}`,
        logo2: `cid:logo2@${UNIQUE_IDENTIFIER}`,
        profilePic: `cid:profile@${UNIQUE_IDENTIFIER}`,
        signature: `cid:signature@${UNIQUE_IDENTIFIER}`,
        message: sender_message,
      },
      attachments: getMailAttachments(language, 'notification'),
    };

    await Promise.all([
      // send confirmation email to sender
      transporter.sendMail(mailConfirmationOptions),
      // Notification email to receiver
      transporter.sendMail(mailNotificationOptions),
    ]);

    // Redirect to confirmation page
    return new Response(
      JSON.stringify({
        message: `Emails ${
          process.env.NODE_ENV === 'production' ? 'was' : 'would be'
        } sent successfully. Confirmation sent to ${sender_name} at ${sender_email}`,
      }),
      {
        status: 303,
        headers: {
          ...headers,
          Location: redirectUrl,
        },
      }
    );
  } catch (error) {
    console.error(error);
    // Handle errors and redirect to error page
    const clientsideError = getErrorMessage(error, language);
    const refererUrl = req.headers.get('referer') || req.headers.get('origin');

    redirectUrl = `${getRedirectUrl(language, refererUrl, 'error')}?error=${encodeURIComponent(clientsideError.errorMessage)}&code=${encodeURIComponent(clientsideError.errorCode)}`;

    return new Response(
      JSON.stringify({
        error: clientsideError.errorCode,
        message: clientsideError.errorMessage,
      }),
      {
        status: 303,
        headers: {
          ...headers,
          Location: redirectUrl,
        },
      }
    );
  }
};

export const config: Config = {
  method: 'POST',
  path: FUNCTION_ENDPOINT,
};
