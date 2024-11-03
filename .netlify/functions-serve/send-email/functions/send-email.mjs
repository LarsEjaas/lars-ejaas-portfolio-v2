
import {createRequire as ___nfyCreateRequire} from "module";
import {fileURLToPath as ___nfyFileURLToPath} from "url";
import {dirname as ___nfyPathDirname} from "path";
let __filename=___nfyFileURLToPath(import.meta.url);
let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
let require=___nfyCreateRequire(import.meta.url);


// functions/send-email.mts
import "@netlify/functions";
import { z, ZodError } from "zod";
import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import "nodemailer-express-handlebars";
import { create } from "express-handlebars";
import path from "path";
import dotenv from "dotenv";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
var window = new JSDOM("").window;
var purify = DOMPurify(window);
var UNIQUE_IDENTIFIER = "contact";
var GITHUB_ICON = "github_icon.png";
var LINKEDIN_ICON = "linkedin_icon.png";
var BLUESKY_ICON = "bluesky_icon.png";
var LETTER_ICON = "letter_icon.png";
var WRITE_TO_ME = "write_to_me.png";
var SKRIV_TIL_MIG = "skriv_til_mig.png";
var EJAAS_LOGO_1 = "logo1_email.png";
var EJAAS_LOGO_2 = "logo2_email.png";
var EJAAS_SIGNATURE = "signature.png";
var PROFILE_PIC = "profile.png";
var sanitizedHTML = (dirtyHTML) => purify.sanitize(dirtyHTML, {
  ALLOWED_TAGS: [
    "p",
    "br",
    "b",
    "i",
    "em",
    "strong",
    "span",
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "a",
    "pre",
    "code",
    "blockquote",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "hr",
    "small",
    "sub",
    "sup"
  ],
  ALLOWED_ATTR: ["class", "href", "style", "target", "rel", "id"]
});
var REDIRECT_SLUGS = {
  en: {
    success: "message-received",
    error: "message-error"
  },
  da: {
    success: "besked-modtaget",
    error: "besked-fejl"
  }
};
function removeTrailingSlash(url) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}
var getRedirectUrl = (language, referer, type = "success") => {
  const slug = REDIRECT_SLUGS[language][type];
  if (!referer) {
    return `../${slug}`;
  }
  try {
    const url = new URL(referer);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    pathSegments.pop();
    const newPath = pathSegments.length ? `/${pathSegments.join("/")}/${slug}` : `/${slug}`;
    return `${url.origin}${newPath}`;
  } catch {
    return `../${slug}`;
  }
};
var isNodemailerError = (error) => {
  if (!(error instanceof Error) || !("code" in error) || typeof error.code !== "string") {
    return false;
  }
  const nodemailerErrorCodes = [
    "EENVELOPE",
    "EENVELOPEFORMAT",
    "EENCODE",
    "EMESSAGEID",
    "ETXTBSY",
    "EFILE",
    "ECONNECTION",
    "EAUTH",
    "ENOAUTH",
    "ETLS",
    "ESTARTTLS",
    "EUPGRADE",
    "EENOTFOUND",
    "EENOTEMPTY",
    "EMSGBIG",
    "EINVALIDDATE",
    "ETOOMANYTOS",
    "ETOOMANYMSGS"
  ];
  return nodemailerErrorCodes.includes(error.code);
};
var getErrorMessage = (error, language) => {
  switch (true) {
    case error instanceof ZodError:
      return {
        errorCode: "VALIDATION_ERROR",
        errorMessage: language === "en" ? "One or more fields in the contact form are invalid. Please review your information and try again." : "En eller flere felter i kontaktformularen er ugyldige. Gennemg\xE5 venligst dine oplysninger og pr\xF8v igen."
      };
    case (error instanceof TypeError && error.message.includes("MAIL_USER")):
    case (error instanceof TypeError && error.message.includes("MAIL_PASSWORD")):
      return {
        errorCode: "CONFIG_ERROR",
        errorMessage: language === "en" ? "A technical issue occurred while processing the message. Please try again later." : "Der opstod et teknisk problem under behandlingen af beskeden. Pr\xF8v venligst igen senere."
      };
    case (error instanceof Error && isNodemailerError(error)):
      return {
        errorCode: "EMAIL_ERROR",
        errorMessage: language === "en" ? "There was an issue sending the message. Please try again later." : "Der opstod et problem med at sende beskeden. Pr\xF8v venligst igen senere."
      };
    case (error instanceof Error && error.message.includes("ENOTFOUND")):
      return {
        errorCode: "NETWORK_ERROR",
        errorMessage: language === "en" ? "There was a problem connecting to the email service. Please try sending your message again later." : "Der opstod et problem med at oprette forbindelse til email-tjenesten. Pr\xF8v venligst at sende din besked igen senere."
      };
    default:
      return {
        errorCode: "UNKNOWN_ERROR",
        errorMessage: language === "en" ? "An unexpected issue occurred while submitting the message. Please try again later." : "Der opstod et uventet problem under indsendelsen af beskeden. Pr\xF8v venligst igen senere."
      };
  }
};
var FUNCTION_ENDPOINT = "/.netlify/functions/send-email";
var formDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required").transform((val) => sanitizedHTML(val)),
  language: z.enum(["en", "da"], {
    errorMap: () => ({ message: "Language must be either 'en' or 'da'" })
  })
});
var getMailAttachments = (lang, type) => {
  const attachments = [];
  attachments.push(
    {
      filename: LINKEDIN_ICON,
      path: path.resolve(__dirname, `./${LINKEDIN_ICON}`),
      cid: `linkedin@${UNIQUE_IDENTIFIER}`
    },
    {
      filename: GITHUB_ICON,
      path: path.resolve(__dirname, `./${GITHUB_ICON}`),
      cid: `github@${UNIQUE_IDENTIFIER}`
    },
    {
      filename: BLUESKY_ICON,
      path: path.resolve(__dirname, `./${BLUESKY_ICON}`),
      cid: `bluesky@${UNIQUE_IDENTIFIER}`
    },
    {
      filename: LETTER_ICON,
      path: path.resolve(__dirname, `./${LETTER_ICON}`),
      cid: `letter@${UNIQUE_IDENTIFIER}`
    }
  );
  if (type === "notification") {
    attachments.push({
      filename: `${lang === "da" ? SKRIV_TIL_MIG : WRITE_TO_ME}`,
      path: path.resolve(
        __dirname,
        `./${lang === "da" ? SKRIV_TIL_MIG : WRITE_TO_ME}`
      ),
      cid: `write@${UNIQUE_IDENTIFIER}`
    });
  }
  if (type === "confirmation") {
    attachments.push(
      {
        filename: EJAAS_LOGO_1,
        path: path.resolve(__dirname, `./${EJAAS_LOGO_1}`),
        cid: `logo1@${UNIQUE_IDENTIFIER}`
      },
      {
        filename: EJAAS_LOGO_2,
        path: path.resolve(__dirname, `./${EJAAS_LOGO_2}`),
        cid: `logo2@${UNIQUE_IDENTIFIER}`
      },
      {
        filename: PROFILE_PIC,
        path: path.resolve(__dirname, `./${PROFILE_PIC}`),
        cid: `profile@${UNIQUE_IDENTIFIER}`
      },
      {
        filename: EJAAS_SIGNATURE,
        path: path.resolve(__dirname, `./${EJAAS_SIGNATURE}`),
        cid: `signature@${UNIQUE_IDENTIFIER}`
      }
    );
  }
  return attachments;
};
var getFirstName = (fullName) => {
  return fullName.split(" ")[0] || fullName;
};
var parseFormData = async (request) => {
  const formData = await request.formData();
  const data = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      data[key] = value;
    }
  });
  return data;
};
var exphbs = create({
  extname: ".handlebars",
  defaultLayout: false
});
var handlebarsOptions = {
  viewEngine: exphbs,
  viewPath: path.resolve(__dirname, "./"),
  extName: ".handlebars"
};
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
var mockTransporter = {
  verify: async () => true,
  use: () => {
  },
  sendMail: async (options) => {
    console.info("Development mode: Email would be sent with:", options);
    return { messageId: "mock-id" };
  }
};
var send_email_default = async (req, context) => {
  const devHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
  const site_url = removeTrailingSlash(context.url.origin);
  if (req.headers.get("origin") !== site_url) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: process.env.NODE_ENV === "development" ? devHeaders : { "content-type": "application/json" }
    });
  }
  let redirectUrl = getRedirectUrl("en", req.headers.get("referer") || "");
  let language = "en";
  if (context.url.pathname !== FUNCTION_ENDPOINT) {
    return new Response(JSON.stringify({ message: "Not Found" }), {
      status: 404,
      headers: process.env.NODE_ENV === "development" ? devHeaders : { "content-type": "application/json" }
    });
  }
  try {
    const formData = await parseFormData(req);
    const parseResult = formDataSchema.safeParse(formData);
    const refererUrl = req.headers.get("referer") || req.headers.get("origin");
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: parseResult.error.errors
        }),
        {
          status: 400,
          headers: process.env.NODE_ENV === "development" ? devHeaders : void 0
        }
      );
    }
    const { data } = parseResult;
    const first_name = getFirstName(data.name);
    const {
      name: sender_name,
      email: sender_email,
      message: sender_message,
      subject: sender_subject,
      language: sender_language
    } = data;
    language = sender_language;
    if (sender_language === "da") {
      redirectUrl = getRedirectUrl("da", refererUrl);
    }
    const createNodeMailerTransporter = () => nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
      }
    });
    const transporter = process.env.NODE_ENV === "production" ? createNodeMailerTransporter() : mockTransporter;
    if (process.env.NODE_ENV === "production") {
      transporter.verify(function(error, success) {
        if (error) {
          console.error(error);
        } else {
          console.info("Server is ready to take our messages:", success);
        }
      });
    }
    const confirmationTemplate = sender_language === "da" ? "mailTemplateDa" : "mailTemplateEn";
    const subject = sender_language === "da" ? "\u{1F388} Tak for din besked!" : "\u{1F388} Thank you for your message!";
    if (process.env.NODE_ENV === "production") {
      transporter.use("compile", hbs(handlebarsOptions));
    }
    const mailConfirmationOptions = {
      from: `Lars \u{1F468}\u200D\u{1F4BB} Ejaas <${process.env.NOREPLY_PRIVATE_EMAIL_USER}>`,
      to: `${sender_name} <${sender_email}>`,
      subject,
      template: confirmationTemplate,
      context: {
        first_name,
        siteURL: site_url,
        linkedIn: `cid:linkedin@${UNIQUE_IDENTIFIER}`,
        github: `cid:github@${UNIQUE_IDENTIFIER}`,
        bluesky: `cid:bluesky@${UNIQUE_IDENTIFIER}`,
        letter: `cid:letter@${UNIQUE_IDENTIFIER}`,
        writeToMe: `cid:write@${UNIQUE_IDENTIFIER}`,
        logo1: `cid:logo1@${UNIQUE_IDENTIFIER}`,
        logo2: `cid:logo2@${UNIQUE_IDENTIFIER}`,
        profilePic: `cid:profile@${UNIQUE_IDENTIFIER}`,
        signature: `cid:signature@${UNIQUE_IDENTIFIER}`,
        message: sender_message
      },
      attachments: getMailAttachments(language, "confirmation")
    };
    const notificationTemplate = sender_language === "da" ? "newMessageDa" : "newMessageEn";
    const mailNotificationOptions = {
      from: `Lars \u{1F468}\u200D\u{1F4BB} Ejaas <${process.env.PRIVATE_EMAIL_USER}>`,
      // this has to be the actual email address as the email client will otherwise rewriting it.
      replyTo: `${sender_name} <${sender_email}>`,
      // Sender's email for replies
      to: process.env.PRIVATE_EMAIL_USER,
      subject: sender_subject,
      template: notificationTemplate,
      context: {
        first_name,
        siteURL: site_url,
        linkedIn: `cid:linkedin@${UNIQUE_IDENTIFIER}`,
        github: `cid:github@${UNIQUE_IDENTIFIER}`,
        bluesky: `cid:bluesky@${UNIQUE_IDENTIFIER}`,
        letter: `cid:letter@${UNIQUE_IDENTIFIER}`,
        writeToMe: `cid:write@${UNIQUE_IDENTIFIER}`,
        logo1: `cid:logo1@${UNIQUE_IDENTIFIER}`,
        logo2: `cid:logo2@${UNIQUE_IDENTIFIER}`,
        profilePic: `cid:profile@${UNIQUE_IDENTIFIER}`,
        signature: `cid:signature@${UNIQUE_IDENTIFIER}`,
        message: sender_message
      },
      attachments: getMailAttachments(language, "notification")
    };
    await Promise.all([
      // send confirmation email to sender
      transporter.sendMail(mailConfirmationOptions),
      // Notification email to receiver
      transporter.sendMail(mailNotificationOptions)
    ]);
    return new Response(
      JSON.stringify({
        message: `Emails ${process.env.NODE_ENV === "production" ? "was" : "would be"} sent successfully. Confirmation sent to ${sender_name} at ${sender_email}`
      }),
      {
        status: 303,
        headers: {
          ...devHeaders,
          Location: redirectUrl
        }
      }
    );
  } catch (error) {
    console.error(error);
    const clientsideError = getErrorMessage(error, language);
    const refererUrl = req.headers.get("referer") || req.headers.get("origin");
    redirectUrl = `${getRedirectUrl(language, refererUrl, "error")}?error=${encodeURIComponent(clientsideError.errorMessage)}&code=${encodeURIComponent(clientsideError.errorCode)}`;
    return new Response(
      JSON.stringify({
        error: clientsideError.errorCode,
        message: clientsideError.errorMessage
      }),
      {
        status: 303,
        headers: {
          ...process.env.NODE_ENV === "development" ? devHeaders : {},
          Location: redirectUrl
        }
      }
    );
  }
};
var config = {
  method: "POST",
  path: FUNCTION_ENDPOINT,
  rateLimit: {
    action: "rate_limit",
    windowSize: 2
  }
};
export {
  config,
  send_email_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiZnVuY3Rpb25zL3NlbmQtZW1haWwubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyB0eXBlIENvbnRleHQsIHR5cGUgQ29uZmlnIH0gZnJvbSAnQG5ldGxpZnkvZnVuY3Rpb25zJztcclxuaW1wb3J0IHsgeiwgWm9kRXJyb3IgfSBmcm9tICd6b2QnO1xyXG5pbXBvcnQgbm9kZW1haWxlciBmcm9tICdub2RlbWFpbGVyJztcclxuaW1wb3J0IGhicyBmcm9tICdub2RlbWFpbGVyLWV4cHJlc3MtaGFuZGxlYmFycyc7XHJcbmltcG9ydCB7IHR5cGUgTm9kZW1haWxlckV4cHJlc3NIYW5kbGViYXJzT3B0aW9ucyB9IGZyb20gJ25vZGVtYWlsZXItZXhwcmVzcy1oYW5kbGViYXJzJztcclxuLy9AdHMtaWdub3JlXHJcbmltcG9ydCB0eXBlIHsgT3B0aW9ucyBhcyBNYWlsT3B0aW9ucyB9IGZyb20gJ0B0eXBlcy9ub2RlbWFpbGVyL2xpYi9zbXRwLXRyYW5zcG9ydCc7XHJcbmltcG9ydCB7IGNyZWF0ZSB9IGZyb20gJ2V4cHJlc3MtaGFuZGxlYmFycyc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgZG90ZW52IGZyb20gJ2RvdGVudic7XHJcbmltcG9ydCBET01QdXJpZnkgZnJvbSAnZG9tcHVyaWZ5JztcclxuaW1wb3J0IHsgSlNET00gfSBmcm9tICdqc2RvbSc7XHJcblxyXG5jb25zdCB3aW5kb3cgPSBuZXcgSlNET00oJycpLndpbmRvdztcclxuY29uc3QgcHVyaWZ5ID0gRE9NUHVyaWZ5KHdpbmRvdyk7XHJcblxyXG5jb25zdCBVTklRVUVfSURFTlRJRklFUiA9ICdjb250YWN0JztcclxuXHJcbmNvbnN0IEdJVEhVQl9JQ09OID0gJ2dpdGh1Yl9pY29uLnBuZyc7XHJcbmNvbnN0IExJTktFRElOX0lDT04gPSAnbGlua2VkaW5faWNvbi5wbmcnO1xyXG5jb25zdCBCTFVFU0tZX0lDT04gPSAnYmx1ZXNreV9pY29uLnBuZyc7XHJcbmNvbnN0IExFVFRFUl9JQ09OID0gJ2xldHRlcl9pY29uLnBuZyc7XHJcbmNvbnN0IFdSSVRFX1RPX01FID0gJ3dyaXRlX3RvX21lLnBuZyc7XHJcbmNvbnN0IFNLUklWX1RJTF9NSUcgPSAnc2tyaXZfdGlsX21pZy5wbmcnO1xyXG5jb25zdCBFSkFBU19MT0dPXzEgPSAnbG9nbzFfZW1haWwucG5nJztcclxuY29uc3QgRUpBQVNfTE9HT18yID0gJ2xvZ28yX2VtYWlsLnBuZyc7XHJcbmNvbnN0IEVKQUFTX1NJR05BVFVSRSA9ICdzaWduYXR1cmUucG5nJztcclxuY29uc3QgUFJPRklMRV9QSUMgPSAncHJvZmlsZS5wbmcnO1xyXG5cclxuY29uc3Qgc2FuaXRpemVkSFRNTCA9IChkaXJ0eUhUTUw6IHN0cmluZykgPT5cclxuICBwdXJpZnkuc2FuaXRpemUoZGlydHlIVE1MLCB7XHJcbiAgICBBTExPV0VEX1RBR1M6IFtcclxuICAgICAgJ3AnLFxyXG4gICAgICAnYnInLFxyXG4gICAgICAnYicsXHJcbiAgICAgICdpJyxcclxuICAgICAgJ2VtJyxcclxuICAgICAgJ3N0cm9uZycsXHJcbiAgICAgICdzcGFuJyxcclxuICAgICAgJ2RpdicsXHJcbiAgICAgICdoMScsXHJcbiAgICAgICdoMicsXHJcbiAgICAgICdoMycsXHJcbiAgICAgICdoNCcsXHJcbiAgICAgICdoNScsXHJcbiAgICAgICdoNicsXHJcbiAgICAgICd1bCcsXHJcbiAgICAgICdvbCcsXHJcbiAgICAgICdsaScsXHJcbiAgICAgICdhJyxcclxuICAgICAgJ3ByZScsXHJcbiAgICAgICdjb2RlJyxcclxuICAgICAgJ2Jsb2NrcXVvdGUnLFxyXG4gICAgICAndGFibGUnLFxyXG4gICAgICAndGhlYWQnLFxyXG4gICAgICAndGJvZHknLFxyXG4gICAgICAndHInLFxyXG4gICAgICAndGgnLFxyXG4gICAgICAndGQnLFxyXG4gICAgICAnaHInLFxyXG4gICAgICAnc21hbGwnLFxyXG4gICAgICAnc3ViJyxcclxuICAgICAgJ3N1cCcsXHJcbiAgICBdLFxyXG4gICAgQUxMT1dFRF9BVFRSOiBbJ2NsYXNzJywgJ2hyZWYnLCAnc3R5bGUnLCAndGFyZ2V0JywgJ3JlbCcsICdpZCddLFxyXG4gIH0pO1xyXG5cclxuY29uc3QgUkVESVJFQ1RfU0xVR1MgPSB7XHJcbiAgZW46IHtcclxuICAgIHN1Y2Nlc3M6ICdtZXNzYWdlLXJlY2VpdmVkJyxcclxuICAgIGVycm9yOiAnbWVzc2FnZS1lcnJvcicsXHJcbiAgfSxcclxuICBkYToge1xyXG4gICAgc3VjY2VzczogJ2Jlc2tlZC1tb2R0YWdldCcsXHJcbiAgICBlcnJvcjogJ2Jlc2tlZC1mZWpsJyxcclxuICB9LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLyoqXHJcbiAqIFJlbW92ZSB0cmFpbGluZyBzbGFzaCBmcm9tIGEgc2x1ZyBvciB1cmwsIHByZXNlcnZpbmcgbGl0ZXJhbCB0eXBlXHJcbiAqL1xyXG5mdW5jdGlvbiByZW1vdmVUcmFpbGluZ1NsYXNoPFQgZXh0ZW5kcyBzdHJpbmc+KFxyXG4gIHVybDogVFxyXG4pOiBUIGV4dGVuZHMgYCR7aW5mZXIgUmVzdH0vYCA/IFJlc3QgOiBUIHtcclxuICByZXR1cm4gKFxyXG4gICAgdXJsLmVuZHNXaXRoKCcvJykgPyB1cmwuc2xpY2UoMCwgLTEpIDogdXJsXHJcbiAgKSBhcyBUIGV4dGVuZHMgYCR7aW5mZXIgUmVzdH0vYCA/IFJlc3QgOiBUO1xyXG59XHJcblxyXG5jb25zdCBnZXRSZWRpcmVjdFVybCA9IChcclxuICBsYW5ndWFnZTogJ2VuJyB8ICdkYScsXHJcbiAgcmVmZXJlcjogc3RyaW5nIHwgbnVsbCxcclxuICB0eXBlOiAnc3VjY2VzcycgfCAnZXJyb3InID0gJ3N1Y2Nlc3MnXHJcbikgPT4ge1xyXG4gIGNvbnN0IHNsdWcgPSBSRURJUkVDVF9TTFVHU1tsYW5ndWFnZV1bdHlwZV07XHJcblxyXG4gIGlmICghcmVmZXJlcikge1xyXG4gICAgcmV0dXJuIGAuLi8ke3NsdWd9YDtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHJlZmVyZXIpO1xyXG4gICAgY29uc3QgcGF0aFNlZ21lbnRzID0gdXJsLnBhdGhuYW1lLnNwbGl0KCcvJykuZmlsdGVyKEJvb2xlYW4pO1xyXG4gICAgcGF0aFNlZ21lbnRzLnBvcCgpO1xyXG4gICAgY29uc3QgbmV3UGF0aCA9IHBhdGhTZWdtZW50cy5sZW5ndGhcclxuICAgICAgPyBgLyR7cGF0aFNlZ21lbnRzLmpvaW4oJy8nKX0vJHtzbHVnfWBcclxuICAgICAgOiBgLyR7c2x1Z31gO1xyXG5cclxuICAgIHJldHVybiBgJHt1cmwub3JpZ2lufSR7bmV3UGF0aH1gO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgcmV0dXJuIGAuLi8ke3NsdWd9YDtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBpc05vZGVtYWlsZXJFcnJvciA9IChlcnJvcjogdW5rbm93bik6IGJvb2xlYW4gPT4ge1xyXG4gIGlmIChcclxuICAgICEoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikgfHxcclxuICAgICEoJ2NvZGUnIGluIGVycm9yKSB8fFxyXG4gICAgdHlwZW9mIGVycm9yLmNvZGUgIT09ICdzdHJpbmcnXHJcbiAgKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIGNvbnN0IG5vZGVtYWlsZXJFcnJvckNvZGVzID0gW1xyXG4gICAgJ0VFTlZFTE9QRScsXHJcbiAgICAnRUVOVkVMT1BFRk9STUFUJyxcclxuICAgICdFRU5DT0RFJyxcclxuICAgICdFTUVTU0FHRUlEJyxcclxuICAgICdFVFhUQlNZJyxcclxuICAgICdFRklMRScsXHJcbiAgICAnRUNPTk5FQ1RJT04nLFxyXG4gICAgJ0VBVVRIJyxcclxuICAgICdFTk9BVVRIJyxcclxuICAgICdFVExTJyxcclxuICAgICdFU1RBUlRUTFMnLFxyXG4gICAgJ0VVUEdSQURFJyxcclxuICAgICdFRU5PVEZPVU5EJyxcclxuICAgICdFRU5PVEVNUFRZJyxcclxuICAgICdFTVNHQklHJyxcclxuICAgICdFSU5WQUxJRERBVEUnLFxyXG4gICAgJ0VUT09NQU5ZVE9TJyxcclxuICAgICdFVE9PTUFOWU1TR1MnLFxyXG4gIF07XHJcblxyXG4gIHJldHVybiBub2RlbWFpbGVyRXJyb3JDb2Rlcy5pbmNsdWRlcyhlcnJvci5jb2RlKTtcclxufTtcclxuXHJcbmNvbnN0IGdldEVycm9yTWVzc2FnZSA9IChcclxuICBlcnJvcjogdW5rbm93bixcclxuICBsYW5ndWFnZTogJ2VuJyB8ICdkYSdcclxuKTogeyBlcnJvck1lc3NhZ2U6IHN0cmluZzsgZXJyb3JDb2RlOiBzdHJpbmcgfSA9PiB7XHJcbiAgc3dpdGNoICh0cnVlKSB7XHJcbiAgICBjYXNlIGVycm9yIGluc3RhbmNlb2YgWm9kRXJyb3I6XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgZXJyb3JDb2RlOiAnVkFMSURBVElPTl9FUlJPUicsXHJcbiAgICAgICAgZXJyb3JNZXNzYWdlOlxyXG4gICAgICAgICAgbGFuZ3VhZ2UgPT09ICdlbidcclxuICAgICAgICAgICAgPyAnT25lIG9yIG1vcmUgZmllbGRzIGluIHRoZSBjb250YWN0IGZvcm0gYXJlIGludmFsaWQuIFBsZWFzZSByZXZpZXcgeW91ciBpbmZvcm1hdGlvbiBhbmQgdHJ5IGFnYWluLidcclxuICAgICAgICAgICAgOiAnRW4gZWxsZXIgZmxlcmUgZmVsdGVyIGkga29udGFrdGZvcm11bGFyZW4gZXIgdWd5bGRpZ2UuIEdlbm5lbWdcdTAwRTUgdmVubGlnc3QgZGluZSBvcGx5c25pbmdlciBvZyBwclx1MDBGOHYgaWdlbi4nLFxyXG4gICAgICB9O1xyXG5cclxuICAgIGNhc2UgZXJyb3IgaW5zdGFuY2VvZiBUeXBlRXJyb3IgJiYgZXJyb3IubWVzc2FnZS5pbmNsdWRlcygnTUFJTF9VU0VSJyk6XHJcbiAgICBjYXNlIGVycm9yIGluc3RhbmNlb2YgVHlwZUVycm9yICYmIGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ01BSUxfUEFTU1dPUkQnKTpcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBlcnJvckNvZGU6ICdDT05GSUdfRVJST1InLFxyXG4gICAgICAgIGVycm9yTWVzc2FnZTpcclxuICAgICAgICAgIGxhbmd1YWdlID09PSAnZW4nXHJcbiAgICAgICAgICAgID8gJ0EgdGVjaG5pY2FsIGlzc3VlIG9jY3VycmVkIHdoaWxlIHByb2Nlc3NpbmcgdGhlIG1lc3NhZ2UuIFBsZWFzZSB0cnkgYWdhaW4gbGF0ZXIuJ1xyXG4gICAgICAgICAgICA6ICdEZXIgb3BzdG9kIGV0IHRla25pc2sgcHJvYmxlbSB1bmRlciBiZWhhbmRsaW5nZW4gYWYgYmVza2VkZW4uIFByXHUwMEY4diB2ZW5saWdzdCBpZ2VuIHNlbmVyZS4nLFxyXG4gICAgICB9O1xyXG5cclxuICAgIGNhc2UgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBpc05vZGVtYWlsZXJFcnJvcihlcnJvcik6XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgZXJyb3JDb2RlOiAnRU1BSUxfRVJST1InLFxyXG4gICAgICAgIGVycm9yTWVzc2FnZTpcclxuICAgICAgICAgIGxhbmd1YWdlID09PSAnZW4nXHJcbiAgICAgICAgICAgID8gJ1RoZXJlIHdhcyBhbiBpc3N1ZSBzZW5kaW5nIHRoZSBtZXNzYWdlLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLidcclxuICAgICAgICAgICAgOiAnRGVyIG9wc3RvZCBldCBwcm9ibGVtIG1lZCBhdCBzZW5kZSBiZXNrZWRlbi4gUHJcdTAwRjh2IHZlbmxpZ3N0IGlnZW4gc2VuZXJlLicsXHJcbiAgICAgIH07XHJcblxyXG4gICAgY2FzZSBlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmIGVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ0VOT1RGT1VORCcpOlxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGVycm9yQ29kZTogJ05FVFdPUktfRVJST1InLFxyXG4gICAgICAgIGVycm9yTWVzc2FnZTpcclxuICAgICAgICAgIGxhbmd1YWdlID09PSAnZW4nXHJcbiAgICAgICAgICAgID8gJ1RoZXJlIHdhcyBhIHByb2JsZW0gY29ubmVjdGluZyB0byB0aGUgZW1haWwgc2VydmljZS4gUGxlYXNlIHRyeSBzZW5kaW5nIHlvdXIgbWVzc2FnZSBhZ2FpbiBsYXRlci4nXHJcbiAgICAgICAgICAgIDogJ0RlciBvcHN0b2QgZXQgcHJvYmxlbSBtZWQgYXQgb3ByZXR0ZSBmb3JiaW5kZWxzZSB0aWwgZW1haWwtdGplbmVzdGVuLiBQclx1MDBGOHYgdmVubGlnc3QgYXQgc2VuZGUgZGluIGJlc2tlZCBpZ2VuIHNlbmVyZS4nLFxyXG4gICAgICB9O1xyXG5cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgZXJyb3JDb2RlOiAnVU5LTk9XTl9FUlJPUicsXHJcbiAgICAgICAgZXJyb3JNZXNzYWdlOlxyXG4gICAgICAgICAgbGFuZ3VhZ2UgPT09ICdlbidcclxuICAgICAgICAgICAgPyAnQW4gdW5leHBlY3RlZCBpc3N1ZSBvY2N1cnJlZCB3aGlsZSBzdWJtaXR0aW5nIHRoZSBtZXNzYWdlLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLidcclxuICAgICAgICAgICAgOiAnRGVyIG9wc3RvZCBldCB1dmVudGV0IHByb2JsZW0gdW5kZXIgaW5kc2VuZGVsc2VuIGFmIGJlc2tlZGVuLiBQclx1MDBGOHYgdmVubGlnc3QgaWdlbiBzZW5lcmUuJyxcclxuICAgICAgfTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBGVU5DVElPTl9FTkRQT0lOVCA9ICcvLm5ldGxpZnkvZnVuY3Rpb25zL3NlbmQtZW1haWwnO1xyXG5cclxuY29uc3QgZm9ybURhdGFTY2hlbWEgPSB6Lm9iamVjdCh7XHJcbiAgbmFtZTogei5zdHJpbmcoKS5taW4oMSwgJ05hbWUgaXMgcmVxdWlyZWQnKSxcclxuICBlbWFpbDogei5zdHJpbmcoKS5lbWFpbCgnSW52YWxpZCBlbWFpbCBhZGRyZXNzJyksXHJcbiAgc3ViamVjdDogei5zdHJpbmcoKS5taW4oMSwgJ1N1YmplY3QgaXMgcmVxdWlyZWQnKSxcclxuICBtZXNzYWdlOiB6XHJcbiAgICAuc3RyaW5nKClcclxuICAgIC5taW4oMSwgJ01lc3NhZ2UgaXMgcmVxdWlyZWQnKVxyXG4gICAgLnRyYW5zZm9ybSgodmFsKSA9PiBzYW5pdGl6ZWRIVE1MKHZhbCkpLFxyXG4gIGxhbmd1YWdlOiB6LmVudW0oWydlbicsICdkYSddLCB7XHJcbiAgICBlcnJvck1hcDogKCkgPT4gKHsgbWVzc2FnZTogXCJMYW5ndWFnZSBtdXN0IGJlIGVpdGhlciAnZW4nIG9yICdkYSdcIiB9KSxcclxuICB9KSxcclxufSk7XHJcblxyXG50eXBlIEVtYWlsVGVtcGxhdGVDb250ZXh0ID0ge1xyXG4gIGZpcnN0X25hbWU6IHN0cmluZztcclxuICBzaXRlVVJMOiBzdHJpbmc7XHJcbiAgbG9nbzE6IGBjaWQ6bG9nbzFAJHt0eXBlb2YgVU5JUVVFX0lERU5USUZJRVJ9YDtcclxuICBsb2dvMjogYGNpZDpsb2dvMkAke3R5cGVvZiBVTklRVUVfSURFTlRJRklFUn1gO1xyXG4gIGxpbmtlZEluOiBgY2lkOmxpbmtlZGluQCR7dHlwZW9mIFVOSVFVRV9JREVOVElGSUVSfWA7XHJcbiAgZ2l0aHViOiBgY2lkOmdpdGh1YkAke3R5cGVvZiBVTklRVUVfSURFTlRJRklFUn1gO1xyXG4gIGJsdWVza3k6IGBjaWQ6Ymx1ZXNreUAke3R5cGVvZiBVTklRVUVfSURFTlRJRklFUn1gO1xyXG4gIGxldHRlcjogYGNpZDpsZXR0ZXJAJHt0eXBlb2YgVU5JUVVFX0lERU5USUZJRVJ9YDtcclxuICB3cml0ZVRvTWU6IGBjaWQ6d3JpdGVAJHt0eXBlb2YgVU5JUVVFX0lERU5USUZJRVJ9YDtcclxuICBwcm9maWxlUGljOiBgY2lkOnByb2ZpbGVAJHt0eXBlb2YgVU5JUVVFX0lERU5USUZJRVJ9YDtcclxuICBzaWduYXR1cmU6IGBjaWQ6c2lnbmF0dXJlQCR7dHlwZW9mIFVOSVFVRV9JREVOVElGSUVSfWA7XHJcbiAgbWVzc2FnZTogc3RyaW5nO1xyXG59O1xyXG5cclxudHlwZSBJZGVudGlmaWVyID1cclxuICB8ICdsb2dvMSdcclxuICB8ICdsb2dvMidcclxuICB8ICdsaW5rZWRpbidcclxuICB8ICdnaXRodWInXHJcbiAgfCAnYmx1ZXNreSdcclxuICB8ICdsZXR0ZXInXHJcbiAgfCAnd3JpdGUnXHJcbiAgfCAncHJvZmlsZSdcclxuICB8ICdzaWduYXR1cmUnO1xyXG5cclxudHlwZSBNYWlsQXR0YWNobWVudCA9IHtcclxuICBmaWxlbmFtZTpcclxuICAgIHwgdHlwZW9mIExJTktFRElOX0lDT05cclxuICAgIHwgdHlwZW9mIEdJVEhVQl9JQ09OXHJcbiAgICB8IHR5cGVvZiBCTFVFU0tZX0lDT05cclxuICAgIHwgdHlwZW9mIExFVFRFUl9JQ09OXHJcbiAgICB8IHR5cGVvZiBXUklURV9UT19NRVxyXG4gICAgfCB0eXBlb2YgU0tSSVZfVElMX01JR1xyXG4gICAgfCB0eXBlb2YgRUpBQVNfTE9HT18xXHJcbiAgICB8IHR5cGVvZiBFSkFBU19MT0dPXzJcclxuICAgIHwgdHlwZW9mIFBST0ZJTEVfUElDXHJcbiAgICB8IHR5cGVvZiBFSkFBU19TSUdOQVRVUkU7XHJcbiAgcGF0aDogc3RyaW5nO1xyXG4gIGNpZDogYCR7SWRlbnRpZmllcn1AJHt0eXBlb2YgVU5JUVVFX0lERU5USUZJRVJ9YDtcclxufTtcclxuXHJcbmNvbnN0IGdldE1haWxBdHRhY2htZW50cyA9IChcclxuICBsYW5nOiAnZW4nIHwgJ2RhJyxcclxuICB0eXBlOiAnbm90aWZpY2F0aW9uJyB8ICdjb25maXJtYXRpb24nXHJcbik6IE1haWxBdHRhY2htZW50W10gPT4ge1xyXG4gIGNvbnN0IGF0dGFjaG1lbnRzOiBNYWlsQXR0YWNobWVudFtdID0gW107XHJcbiAgYXR0YWNobWVudHMucHVzaChcclxuICAgIHtcclxuICAgICAgZmlsZW5hbWU6IExJTktFRElOX0lDT04sXHJcbiAgICAgIHBhdGg6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIGAuLyR7TElOS0VESU5fSUNPTn1gKSxcclxuICAgICAgY2lkOiBgbGlua2VkaW5AJHtVTklRVUVfSURFTlRJRklFUn1gLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgZmlsZW5hbWU6IEdJVEhVQl9JQ09OLFxyXG4gICAgICBwYXRoOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBgLi8ke0dJVEhVQl9JQ09OfWApLFxyXG4gICAgICBjaWQ6IGBnaXRodWJAJHtVTklRVUVfSURFTlRJRklFUn1gLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgZmlsZW5hbWU6IEJMVUVTS1lfSUNPTixcclxuICAgICAgcGF0aDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgYC4vJHtCTFVFU0tZX0lDT059YCksXHJcbiAgICAgIGNpZDogYGJsdWVza3lAJHtVTklRVUVfSURFTlRJRklFUn1gLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgZmlsZW5hbWU6IExFVFRFUl9JQ09OLFxyXG4gICAgICBwYXRoOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBgLi8ke0xFVFRFUl9JQ09OfWApLFxyXG4gICAgICBjaWQ6IGBsZXR0ZXJAJHtVTklRVUVfSURFTlRJRklFUn1gLFxyXG4gICAgfVxyXG4gICk7XHJcbiAgaWYgKHR5cGUgPT09ICdub3RpZmljYXRpb24nKSB7XHJcbiAgICBhdHRhY2htZW50cy5wdXNoKHtcclxuICAgICAgZmlsZW5hbWU6IGAke2xhbmcgPT09ICdkYScgPyBTS1JJVl9USUxfTUlHIDogV1JJVEVfVE9fTUV9YCxcclxuICAgICAgcGF0aDogcGF0aC5yZXNvbHZlKFxyXG4gICAgICAgIF9fZGlybmFtZSxcclxuICAgICAgICBgLi8ke2xhbmcgPT09ICdkYScgPyBTS1JJVl9USUxfTUlHIDogV1JJVEVfVE9fTUV9YFxyXG4gICAgICApLFxyXG4gICAgICBjaWQ6IGB3cml0ZUAke1VOSVFVRV9JREVOVElGSUVSfWAsXHJcbiAgICB9KTtcclxuICB9XHJcbiAgaWYgKHR5cGUgPT09ICdjb25maXJtYXRpb24nKSB7XHJcbiAgICBhdHRhY2htZW50cy5wdXNoKFxyXG4gICAgICB7XHJcbiAgICAgICAgZmlsZW5hbWU6IEVKQUFTX0xPR09fMSxcclxuICAgICAgICBwYXRoOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBgLi8ke0VKQUFTX0xPR09fMX1gKSxcclxuICAgICAgICBjaWQ6IGBsb2dvMUAke1VOSVFVRV9JREVOVElGSUVSfWAsXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBmaWxlbmFtZTogRUpBQVNfTE9HT18yLFxyXG4gICAgICAgIHBhdGg6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIGAuLyR7RUpBQVNfTE9HT18yfWApLFxyXG4gICAgICAgIGNpZDogYGxvZ28yQCR7VU5JUVVFX0lERU5USUZJRVJ9YCxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGZpbGVuYW1lOiBQUk9GSUxFX1BJQyxcclxuICAgICAgICBwYXRoOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBgLi8ke1BST0ZJTEVfUElDfWApLFxyXG4gICAgICAgIGNpZDogYHByb2ZpbGVAJHtVTklRVUVfSURFTlRJRklFUn1gLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgZmlsZW5hbWU6IEVKQUFTX1NJR05BVFVSRSxcclxuICAgICAgICBwYXRoOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBgLi8ke0VKQUFTX1NJR05BVFVSRX1gKSxcclxuICAgICAgICBjaWQ6IGBzaWduYXR1cmVAJHtVTklRVUVfSURFTlRJRklFUn1gLFxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGF0dGFjaG1lbnRzO1xyXG59O1xyXG5cclxudHlwZSBUZW1wbGF0ZU9wdGlvbnMgPSB7XHJcbiAgdGVtcGxhdGU6XHJcbiAgICB8ICdtYWlsVGVtcGxhdGVEYSdcclxuICAgIHwgJ21haWxUZW1wbGF0ZUVuJ1xyXG4gICAgfCAnbmV3TWVzc2FnZURhJ1xyXG4gICAgfCAnbmV3TWVzc2FnZUVuJztcclxuICBjb250ZXh0PzogRW1haWxUZW1wbGF0ZUNvbnRleHQ7XHJcbn07XHJcblxyXG50eXBlIE1haWxXaXRoVGVtcGxhdGVPcHRpb25zID0gTWFpbE9wdGlvbnMgJiBUZW1wbGF0ZU9wdGlvbnM7XHJcblxyXG4vLyBIZWxwZXIgdG8gZ2V0IGZpcnN0IG5hbWUgZnJvbSBmdWxsIG5hbWVcclxuY29uc3QgZ2V0Rmlyc3ROYW1lID0gKGZ1bGxOYW1lOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xyXG4gIHJldHVybiBmdWxsTmFtZS5zcGxpdCgnICcpWzBdIHx8IGZ1bGxOYW1lO1xyXG59O1xyXG5cclxuY29uc3QgcGFyc2VGb3JtRGF0YSA9IGFzeW5jIChcclxuICByZXF1ZXN0OiBSZXF1ZXN0XHJcbik6IFByb21pc2U8UmVjb3JkPHN0cmluZywgc3RyaW5nPj4gPT4ge1xyXG4gIGNvbnN0IGZvcm1EYXRhID0gYXdhaXQgcmVxdWVzdC5mb3JtRGF0YSgpO1xyXG4gIGNvbnN0IGRhdGE6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcclxuXHJcbiAgZm9ybURhdGEuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgZGF0YVtrZXldID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBkYXRhO1xyXG59O1xyXG5cclxuLy8gQ3JlYXRlIGhhbmRsZWJhcnMgaW5zdGFuY2VcclxuY29uc3QgZXhwaGJzID0gY3JlYXRlKHtcclxuICBleHRuYW1lOiAnLmhhbmRsZWJhcnMnLFxyXG4gIGRlZmF1bHRMYXlvdXQ6IGZhbHNlLFxyXG59KTtcclxuXHJcbi8vIENvbmZpZ3VyZSBoYW5kbGViYXJzIG9wdGlvbnMgd2l0aCBjb3JyZWN0IHR5cGluZ1xyXG5jb25zdCBoYW5kbGViYXJzT3B0aW9uczogTm9kZW1haWxlckV4cHJlc3NIYW5kbGViYXJzT3B0aW9ucyA9IHtcclxuICB2aWV3RW5naW5lOiBleHBoYnMsXHJcbiAgdmlld1BhdGg6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLycpLFxyXG4gIGV4dE5hbWU6ICcuaGFuZGxlYmFycycsXHJcbn07XHJcblxyXG4vL0xvYWQgZW52aXJvbm1lbnQgdmFyaWFibGVzIGR1cmluZyBkZXZlbG9wbWVudFxyXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xyXG4gIGRvdGVudi5jb25maWcoKTtcclxufVxyXG5cclxuLyoqIE1vY2tpbmcgbm9kZW1haWxlci5jcmVhdGVUcmFuc3BvcnQgaW4gbG9jYWwgZGV2ZWxvcG1lbnQgdGVzdGluZyAqL1xyXG5jb25zdCBtb2NrVHJhbnNwb3J0ZXIgPSB7XHJcbiAgdmVyaWZ5OiBhc3luYyAoKSA9PiB0cnVlLFxyXG4gIHVzZTogKCkgPT4ge30sXHJcbiAgc2VuZE1haWw6IGFzeW5jIChvcHRpb25zOiBNYWlsV2l0aFRlbXBsYXRlT3B0aW9ucykgPT4ge1xyXG4gICAgY29uc29sZS5pbmZvKCdEZXZlbG9wbWVudCBtb2RlOiBFbWFpbCB3b3VsZCBiZSBzZW50IHdpdGg6Jywgb3B0aW9ucyk7XHJcbiAgICByZXR1cm4geyBtZXNzYWdlSWQ6ICdtb2NrLWlkJyB9O1xyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhc3luYyAocmVxOiBSZXF1ZXN0LCBjb250ZXh0OiBDb250ZXh0KSA9PiB7XHJcbiAgLy8gRW5hYmxlIENPUlMgZm9yIGxvY2FsIGRldmVsb3BtZW50XHJcbiAgY29uc3QgZGV2SGVhZGVycyA9IHtcclxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXHJcbiAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUnLFxyXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnUE9TVCwgT1BUSU9OUycsXHJcbiAgfTtcclxuXHJcbiAgY29uc3Qgc2l0ZV91cmwgPSByZW1vdmVUcmFpbGluZ1NsYXNoKGNvbnRleHQudXJsLm9yaWdpbik7XHJcbiAgaWYgKHJlcS5oZWFkZXJzLmdldCgnb3JpZ2luJykgIT09IHNpdGVfdXJsKSB7XHJcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogJ1VuYXV0aG9yaXplZCcgfSksIHtcclxuICAgICAgc3RhdHVzOiA0MDEsXHJcbiAgICAgIGhlYWRlcnM6XHJcbiAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCdcclxuICAgICAgICAgID8gZGV2SGVhZGVyc1xyXG4gICAgICAgICAgOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gRGVmYXVsdCB0byBFbmdsaXNoIHJlZGlyZWN0XHJcbiAgbGV0IHJlZGlyZWN0VXJsID0gZ2V0UmVkaXJlY3RVcmwoJ2VuJywgcmVxLmhlYWRlcnMuZ2V0KCdyZWZlcmVyJykgfHwgJycpO1xyXG4gIGxldCBsYW5ndWFnZTogJ2VuJyB8ICdkYScgPSAnZW4nO1xyXG5cclxuICBpZiAoY29udGV4dC51cmwucGF0aG5hbWUgIT09IEZVTkNUSU9OX0VORFBPSU5UKSB7XHJcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogJ05vdCBGb3VuZCcgfSksIHtcclxuICAgICAgc3RhdHVzOiA0MDQsXHJcbiAgICAgIGhlYWRlcnM6XHJcbiAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCdcclxuICAgICAgICAgID8gZGV2SGVhZGVyc1xyXG4gICAgICAgICAgOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGZvcm1EYXRhID0gYXdhaXQgcGFyc2VGb3JtRGF0YShyZXEgYXMgUmVxdWVzdCk7XHJcbiAgICBjb25zdCBwYXJzZVJlc3VsdCA9IGZvcm1EYXRhU2NoZW1hLnNhZmVQYXJzZShmb3JtRGF0YSk7XHJcblxyXG4gICAgY29uc3QgcmVmZXJlclVybCA9IHJlcS5oZWFkZXJzLmdldCgncmVmZXJlcicpIHx8IHJlcS5oZWFkZXJzLmdldCgnb3JpZ2luJyk7XHJcblxyXG4gICAgaWYgKCFwYXJzZVJlc3VsdC5zdWNjZXNzKSB7XHJcbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoXHJcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgZXJyb3I6ICdWYWxpZGF0aW9uIGZhaWxlZCcsXHJcbiAgICAgICAgICBkZXRhaWxzOiBwYXJzZVJlc3VsdC5lcnJvci5lcnJvcnMsXHJcbiAgICAgICAgfSksXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgc3RhdHVzOiA0MDAsXHJcbiAgICAgICAgICBoZWFkZXJzOlxyXG4gICAgICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyA/IGRldkhlYWRlcnMgOiB1bmRlZmluZWQsXHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgZGF0YSB9ID0gcGFyc2VSZXN1bHQ7XHJcbiAgICBjb25zdCBmaXJzdF9uYW1lID0gZ2V0Rmlyc3ROYW1lKGRhdGEubmFtZSk7XHJcbiAgICBjb25zdCB7XHJcbiAgICAgIG5hbWU6IHNlbmRlcl9uYW1lLFxyXG4gICAgICBlbWFpbDogc2VuZGVyX2VtYWlsLFxyXG4gICAgICBtZXNzYWdlOiBzZW5kZXJfbWVzc2FnZSxcclxuICAgICAgc3ViamVjdDogc2VuZGVyX3N1YmplY3QsXHJcbiAgICAgIGxhbmd1YWdlOiBzZW5kZXJfbGFuZ3VhZ2UsXHJcbiAgICB9ID0gZGF0YTtcclxuXHJcbiAgICBsYW5ndWFnZSA9IHNlbmRlcl9sYW5ndWFnZTtcclxuXHJcbiAgICBpZiAoc2VuZGVyX2xhbmd1YWdlID09PSAnZGEnKSB7XHJcbiAgICAgIHJlZGlyZWN0VXJsID0gZ2V0UmVkaXJlY3RVcmwoJ2RhJywgcmVmZXJlclVybCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY3JlYXRlTm9kZU1haWxlclRyYW5zcG9ydGVyID0gKCkgPT5cclxuICAgICAgbm9kZW1haWxlci5jcmVhdGVUcmFuc3BvcnQoe1xyXG4gICAgICAgIGhvc3Q6ICdzbXRwLmdtYWlsLmNvbScsXHJcbiAgICAgICAgcG9ydDogNTg3LFxyXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgICAgYXV0aDoge1xyXG4gICAgICAgICAgdXNlcjogcHJvY2Vzcy5lbnYuTUFJTF9VU0VSLFxyXG4gICAgICAgICAgcGFzczogcHJvY2Vzcy5lbnYuTUFJTF9QQVNTV09SRCxcclxuICAgICAgICB9LFxyXG4gICAgICB9KTtcclxuXHJcbiAgICBjb25zdCB0cmFuc3BvcnRlciA9XHJcbiAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbidcclxuICAgICAgICA/IGNyZWF0ZU5vZGVNYWlsZXJUcmFuc3BvcnRlcigpXHJcbiAgICAgICAgOiBtb2NrVHJhbnNwb3J0ZXI7XHJcblxyXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHtcclxuICAgICAgdHJhbnNwb3J0ZXIudmVyaWZ5KGZ1bmN0aW9uIChlcnJvciwgc3VjY2Vzcykge1xyXG4gICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvbnNvbGUuaW5mbygnU2VydmVyIGlzIHJlYWR5IHRvIHRha2Ugb3VyIG1lc3NhZ2VzOicsIHN1Y2Nlc3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY29uZmlybWF0aW9uVGVtcGxhdGUgPVxyXG4gICAgICBzZW5kZXJfbGFuZ3VhZ2UgPT09ICdkYScgPyAnbWFpbFRlbXBsYXRlRGEnIDogJ21haWxUZW1wbGF0ZUVuJztcclxuICAgIGNvbnN0IHN1YmplY3QgPVxyXG4gICAgICBzZW5kZXJfbGFuZ3VhZ2UgPT09ICdkYSdcclxuICAgICAgICA/ICdcdUQ4M0NcdURGODggVGFrIGZvciBkaW4gYmVza2VkISdcclxuICAgICAgICA6ICdcdUQ4M0NcdURGODggVGhhbmsgeW91IGZvciB5b3VyIG1lc3NhZ2UhJztcclxuXHJcbiAgICAvLyBPbmx5IHNldCB1cCBoYW5kbGViYXJzIGluIHByb2R1Y3Rpb25cclxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB7XHJcbiAgICAgIHRyYW5zcG9ydGVyLnVzZSgnY29tcGlsZScsIGhicyhoYW5kbGViYXJzT3B0aW9ucykpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG1haWxDb25maXJtYXRpb25PcHRpb25zOiBNYWlsV2l0aFRlbXBsYXRlT3B0aW9ucyA9IHtcclxuICAgICAgZnJvbTogYExhcnMgXHVEODNEXHVEQzY4XHUyMDBEXHVEODNEXHVEQ0JCIEVqYWFzIDwke3Byb2Nlc3MuZW52Lk5PUkVQTFlfUFJJVkFURV9FTUFJTF9VU0VSfT5gLFxyXG4gICAgICB0bzogYCR7c2VuZGVyX25hbWV9IDwke3NlbmRlcl9lbWFpbH0+YCxcclxuICAgICAgc3ViamVjdDogc3ViamVjdCxcclxuICAgICAgdGVtcGxhdGU6IGNvbmZpcm1hdGlvblRlbXBsYXRlLFxyXG4gICAgICBjb250ZXh0OiB7XHJcbiAgICAgICAgZmlyc3RfbmFtZTogZmlyc3RfbmFtZSxcclxuICAgICAgICBzaXRlVVJMOiBzaXRlX3VybCxcclxuICAgICAgICBsaW5rZWRJbjogYGNpZDpsaW5rZWRpbkAke1VOSVFVRV9JREVOVElGSUVSfWAsXHJcbiAgICAgICAgZ2l0aHViOiBgY2lkOmdpdGh1YkAke1VOSVFVRV9JREVOVElGSUVSfWAsXHJcbiAgICAgICAgYmx1ZXNreTogYGNpZDpibHVlc2t5QCR7VU5JUVVFX0lERU5USUZJRVJ9YCxcclxuICAgICAgICBsZXR0ZXI6IGBjaWQ6bGV0dGVyQCR7VU5JUVVFX0lERU5USUZJRVJ9YCxcclxuICAgICAgICB3cml0ZVRvTWU6IGBjaWQ6d3JpdGVAJHtVTklRVUVfSURFTlRJRklFUn1gLFxyXG4gICAgICAgIGxvZ28xOiBgY2lkOmxvZ28xQCR7VU5JUVVFX0lERU5USUZJRVJ9YCxcclxuICAgICAgICBsb2dvMjogYGNpZDpsb2dvMkAke1VOSVFVRV9JREVOVElGSUVSfWAsXHJcbiAgICAgICAgcHJvZmlsZVBpYzogYGNpZDpwcm9maWxlQCR7VU5JUVVFX0lERU5USUZJRVJ9YCxcclxuICAgICAgICBzaWduYXR1cmU6IGBjaWQ6c2lnbmF0dXJlQCR7VU5JUVVFX0lERU5USUZJRVJ9YCxcclxuICAgICAgICBtZXNzYWdlOiBzZW5kZXJfbWVzc2FnZSxcclxuICAgICAgfSxcclxuICAgICAgYXR0YWNobWVudHM6IGdldE1haWxBdHRhY2htZW50cyhsYW5ndWFnZSwgJ2NvbmZpcm1hdGlvbicpLFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBub3RpZmljYXRpb25UZW1wbGF0ZSA9XHJcbiAgICAgIHNlbmRlcl9sYW5ndWFnZSA9PT0gJ2RhJyA/ICduZXdNZXNzYWdlRGEnIDogJ25ld01lc3NhZ2VFbic7XHJcblxyXG4gICAgY29uc3QgbWFpbE5vdGlmaWNhdGlvbk9wdGlvbnM6IE1haWxXaXRoVGVtcGxhdGVPcHRpb25zID0ge1xyXG4gICAgICBmcm9tOiBgTGFycyBcdUQ4M0RcdURDNjhcdTIwMERcdUQ4M0RcdURDQkIgRWphYXMgPCR7cHJvY2Vzcy5lbnYuUFJJVkFURV9FTUFJTF9VU0VSfT5gLCAvLyB0aGlzIGhhcyB0byBiZSB0aGUgYWN0dWFsIGVtYWlsIGFkZHJlc3MgYXMgdGhlIGVtYWlsIGNsaWVudCB3aWxsIG90aGVyd2lzZSByZXdyaXRpbmcgaXQuXHJcbiAgICAgIHJlcGx5VG86IGAke3NlbmRlcl9uYW1lfSA8JHtzZW5kZXJfZW1haWx9PmAsIC8vIFNlbmRlcidzIGVtYWlsIGZvciByZXBsaWVzXHJcbiAgICAgIHRvOiBwcm9jZXNzLmVudi5QUklWQVRFX0VNQUlMX1VTRVIsXHJcbiAgICAgIHN1YmplY3Q6IHNlbmRlcl9zdWJqZWN0LFxyXG4gICAgICB0ZW1wbGF0ZTogbm90aWZpY2F0aW9uVGVtcGxhdGUsXHJcbiAgICAgIGNvbnRleHQ6IHtcclxuICAgICAgICBmaXJzdF9uYW1lOiBmaXJzdF9uYW1lLFxyXG4gICAgICAgIHNpdGVVUkw6IHNpdGVfdXJsLFxyXG4gICAgICAgIGxpbmtlZEluOiBgY2lkOmxpbmtlZGluQCR7VU5JUVVFX0lERU5USUZJRVJ9YCxcclxuICAgICAgICBnaXRodWI6IGBjaWQ6Z2l0aHViQCR7VU5JUVVFX0lERU5USUZJRVJ9YCxcclxuICAgICAgICBibHVlc2t5OiBgY2lkOmJsdWVza3lAJHtVTklRVUVfSURFTlRJRklFUn1gLFxyXG4gICAgICAgIGxldHRlcjogYGNpZDpsZXR0ZXJAJHtVTklRVUVfSURFTlRJRklFUn1gLFxyXG4gICAgICAgIHdyaXRlVG9NZTogYGNpZDp3cml0ZUAke1VOSVFVRV9JREVOVElGSUVSfWAsXHJcbiAgICAgICAgbG9nbzE6IGBjaWQ6bG9nbzFAJHtVTklRVUVfSURFTlRJRklFUn1gLFxyXG4gICAgICAgIGxvZ28yOiBgY2lkOmxvZ28yQCR7VU5JUVVFX0lERU5USUZJRVJ9YCxcclxuICAgICAgICBwcm9maWxlUGljOiBgY2lkOnByb2ZpbGVAJHtVTklRVUVfSURFTlRJRklFUn1gLFxyXG4gICAgICAgIHNpZ25hdHVyZTogYGNpZDpzaWduYXR1cmVAJHtVTklRVUVfSURFTlRJRklFUn1gLFxyXG4gICAgICAgIG1lc3NhZ2U6IHNlbmRlcl9tZXNzYWdlLFxyXG4gICAgICB9LFxyXG4gICAgICBhdHRhY2htZW50czogZ2V0TWFpbEF0dGFjaG1lbnRzKGxhbmd1YWdlLCAnbm90aWZpY2F0aW9uJyksXHJcbiAgICB9O1xyXG5cclxuICAgIGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgLy8gc2VuZCBjb25maXJtYXRpb24gZW1haWwgdG8gc2VuZGVyXHJcbiAgICAgIHRyYW5zcG9ydGVyLnNlbmRNYWlsKG1haWxDb25maXJtYXRpb25PcHRpb25zKSxcclxuICAgICAgLy8gTm90aWZpY2F0aW9uIGVtYWlsIHRvIHJlY2VpdmVyXHJcbiAgICAgIHRyYW5zcG9ydGVyLnNlbmRNYWlsKG1haWxOb3RpZmljYXRpb25PcHRpb25zKSxcclxuICAgIF0pO1xyXG5cclxuICAgIC8vIFJlZGlyZWN0IHRvIGNvbmZpcm1hdGlvbiBwYWdlXHJcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKFxyXG4gICAgICBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgbWVzc2FnZTogYEVtYWlscyAke1xyXG4gICAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyA/ICd3YXMnIDogJ3dvdWxkIGJlJ1xyXG4gICAgICAgIH0gc2VudCBzdWNjZXNzZnVsbHkuIENvbmZpcm1hdGlvbiBzZW50IHRvICR7c2VuZGVyX25hbWV9IGF0ICR7c2VuZGVyX2VtYWlsfWAsXHJcbiAgICAgIH0pLFxyXG4gICAgICB7XHJcbiAgICAgICAgc3RhdHVzOiAzMDMsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgLi4uZGV2SGVhZGVycyxcclxuICAgICAgICAgIExvY2F0aW9uOiByZWRpcmVjdFVybCxcclxuICAgICAgICB9LFxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgIC8vIEhhbmRsZSBlcnJvcnMgYW5kIHJlZGlyZWN0IHRvIGVycm9yIHBhZ2VcclxuICAgIGNvbnN0IGNsaWVudHNpZGVFcnJvciA9IGdldEVycm9yTWVzc2FnZShlcnJvciwgbGFuZ3VhZ2UpO1xyXG4gICAgY29uc3QgcmVmZXJlclVybCA9IHJlcS5oZWFkZXJzLmdldCgncmVmZXJlcicpIHx8IHJlcS5oZWFkZXJzLmdldCgnb3JpZ2luJyk7XHJcblxyXG4gICAgcmVkaXJlY3RVcmwgPSBgJHtnZXRSZWRpcmVjdFVybChsYW5ndWFnZSwgcmVmZXJlclVybCwgJ2Vycm9yJyl9P2Vycm9yPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGNsaWVudHNpZGVFcnJvci5lcnJvck1lc3NhZ2UpfSZjb2RlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGNsaWVudHNpZGVFcnJvci5lcnJvckNvZGUpfWA7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShcclxuICAgICAgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgIGVycm9yOiBjbGllbnRzaWRlRXJyb3IuZXJyb3JDb2RlLFxyXG4gICAgICAgIG1lc3NhZ2U6IGNsaWVudHNpZGVFcnJvci5lcnJvck1lc3NhZ2UsXHJcbiAgICAgIH0pLFxyXG4gICAgICB7XHJcbiAgICAgICAgc3RhdHVzOiAzMDMsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgLi4uKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnID8gZGV2SGVhZGVycyA6IHt9KSxcclxuICAgICAgICAgIExvY2F0aW9uOiByZWRpcmVjdFVybCxcclxuICAgICAgICB9LFxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBjb25maWc6IENvbmZpZyA9IHtcclxuICBtZXRob2Q6ICdQT1NUJyxcclxuICBwYXRoOiBGVU5DVElPTl9FTkRQT0lOVCxcclxuICByYXRlTGltaXQ6IHtcclxuICAgIGFjdGlvbjogJ3JhdGVfbGltaXQnLFxyXG4gICAgd2luZG93U2l6ZTogMixcclxuICB9LFxyXG59O1xyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7O0FBQUEsT0FBMEM7QUFDMUMsU0FBUyxHQUFHLGdCQUFnQjtBQUM1QixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLFNBQVM7QUFDaEIsT0FBd0Q7QUFHeEQsU0FBUyxjQUFjO0FBQ3ZCLE9BQU8sVUFBVTtBQUNqQixPQUFPLFlBQVk7QUFDbkIsT0FBTyxlQUFlO0FBQ3RCLFNBQVMsYUFBYTtBQUV0QixJ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
