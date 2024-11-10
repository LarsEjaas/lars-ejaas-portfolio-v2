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

// Parse form data helper function
const formDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  language: z.enum(['en', 'da'], {
    errorMap: () => ({ message: "Language must be either 'en' or 'da'" }),
  }),
});

type EmailTemplateContext = {
  first_name: string;
  siteURL: string;
  logo1: string;
  logo2: string;
  linkedIn: string;
  signature: string;
  message?: string;
};

type TemplateOptions = {
  template: 'mailTemplateDa' | 'mailTemplateEn' | 'newMessage';
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

    const template =
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
      from: `Lars 🍀 Ejaas <${process.env.NOREPLY_PRIVATE_EMAIL_USER}>`,
      to: `${sender_name} <${sender_email}>`,
      subject: subject,
      template: template,
      context: {
        first_name: first_name,
        siteURL: site_url,
        logo1: `${site_url}/logo1_email.png`,
        logo2: `${site_url}/logo2_email.png`,
        linkedIn: `${site_url}/linkedIn_email.png`,
        signature: `${site_url}/signature.png`,
      },
    };

    const mailNotificationOptions: MailWithTemplateOptions = {
      from: `${sender_name} <${sender_email}>`,
      to: process.env.PRIVATE_EMAIL_USER,
      subject: sender_subject,
      template: 'newMessage',
      context: {
        first_name: first_name,
        siteURL: site_url,
        logo1: `${site_url}/logo1_email.png`,
        logo2: `${site_url}/logo2_email.png`,
        linkedIn: `${site_url}/linkedIn_email.png`,
        signature: `${site_url}/signature.png`,
        message: sender_message,
      },
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
