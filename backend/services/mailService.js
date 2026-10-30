import nodemailer from "nodemailer";

// ==========================================
// FIXHUB EMAIL SERVICE
// HOSTINGER SMTP
// ==========================================

// ==========================================
// 1. EMAIL CONFIGURATION
// ==========================================

function getEmailConfig() {
  const host = String(process.env.SMTP_HOST || "smtp.hostinger.com").trim();

  const port = Number(process.env.SMTP_PORT || 465);
  const user = String(process.env.SMTP_USER || "").trim();
  const password = process.env.SMTP_APP_PASSWORD || "";
  const from = String(process.env.MAIL_FROM || user).trim();
  const clientUrl = String(process.env.CLIENT_URL || "").trim();

  if (!host) {
    throw new Error("SMTP_HOST is missing.");
  }

  if (![465, 587].includes(port)) {
    throw new Error("SMTP_PORT must be 465 or 587.");
  }

  const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

  if (!emailPattern.test(user)) {
    throw new Error("SMTP_USER must be a valid email address.");
  }

  if (!emailPattern.test(from)) {
    throw new Error("MAIL_FROM must be a valid email address.");
  }

  if (!password) {
    throw new Error("SMTP_APP_PASSWORD is missing from .env.");
  }

  if (!clientUrl) {
    throw new Error("CLIENT_URL is missing from .env.");
  }

  let websiteUrl;

  try {
    websiteUrl = new URL(clientUrl);
  } catch {
    throw new Error("CLIENT_URL is not a valid URL.");
  }

  if (!["http:", "https:"].includes(websiteUrl.protocol)) {
    throw new Error("CLIENT_URL must use HTTP or HTTPS.");
  }

  if (
    process.env.NODE_ENV === "production" &&
    websiteUrl.protocol !== "https:"
  ) {
    throw new Error("Production CLIENT_URL must use HTTPS.");
  }

  return {
    host,
    port,
    user,
    password,
    from,
    clientUrl: websiteUrl.origin,
  };
}

// ==========================================
// 2. CHECK EMAIL CONFIGURATION
// ==========================================

export function assertMailConfigured() {
  const config = getEmailConfig();

  return {
    host: config.host,
    port: config.port,
    user: config.user,
    from: config.from,
    clientUrl: config.clientUrl,
  };
}

// ==========================================
// 3. CREATE HOSTINGER TRANSPORTER
// ==========================================

function createMailTransporter(config) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: config.port === 587,

    auth: {
      user: config.user,
      pass: config.password,
    },

    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,

    tls: {
      minVersion: "TLSv1.2",
    },
  });
}

// ==========================================
// 4. ESCAPE HTML
// ==========================================

function escapeHtml(value) {
  const entities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) => entities[character],
  );
}

// ==========================================
// 5. GENERATE VERIFICATION / RESET LINK
// ==========================================

function createEmailLink(clientUrl, path, token) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
    throw new Error("Invalid verification/reset token.");
  }

  const url = new URL(path, clientUrl);

  url.hash = new URLSearchParams({
    token,
  }).toString();

  return url.toString();
}

// ==========================================
// 6. FIXHUB HTML EMAIL TEMPLATE
// ==========================================

function createEmailTemplate({ heading, message, buttonText, actionUrl }) {
  const safeHeading = escapeHtml(heading);
  const safeMessage = escapeHtml(message);
  const safeButton = escapeHtml(buttonText);
  const safeUrl = escapeHtml(actionUrl);

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
      />
      <title>FIXHUB Security</title>
    </head>

    <body style="
      margin:0;
      padding:30px 15px;
      background:#edf4fb;
      font-family:Arial,Helvetica,sans-serif;
    ">

      <div style="
        max-width:560px;
        margin:0 auto;
        background:#06182b;
        border:1px solid #16436c;
        border-radius:18px;
        overflow:hidden;
      ">

        <div style="
          background:#08223e;
          padding:30px;
          border-bottom:1px solid #16436c;
        ">

          <h1 style="
            margin:0;
            color:#00bfff;
            font-size:34px;
            letter-spacing:1px;
          ">
            FIXHUB
          </h1>

          <p style="
            color:#a9c2d8;
            font-size:12px;
            letter-spacing:2px;
            margin:8px 0 0;
          ">
            MOBILE CARE EXPERTS
          </p>

        </div>

        <div style="padding:35px 30px;">

          <h2 style="
            color:#ffffff;
            font-size:25px;
            margin:0 0 20px;
          ">
            ${safeHeading}
          </h2>

          <p style="
            color:#c6d7e9;
            font-size:15px;
            line-height:1.8;
          ">
            ${safeMessage}
          </p>

          <div style="margin:30px 0;">

            <a
              href="${safeUrl}"
              style="
                display:inline-block;
                background:#008cff;
                color:#ffffff;
                text-decoration:none;
                padding:16px 28px;
                border-radius:10px;
                font-weight:bold;
                font-size:15px;
              "
            >
              ${safeButton}
            </a>

          </div>

          <div style="
            background:#092a45;
            border:1px solid #18527a;
            border-radius:10px;
            padding:18px;
          ">

            <p style="
              margin:0;
              color:#c5e3f4;
              font-size:13px;
              line-height:1.8;
            ">
              This security link expires in
              <strong>15 minutes</strong>
              and can only be used once.
            </p>

          </div>

          <p style="
            margin:25px 0 0;
            color:#9bb6ce;
            font-size:13px;
            line-height:1.8;
          ">
            If you did not request this action,
            you can ignore this message.

            Never share your security link with anyone.
          </p>

          <p style="
            margin-top:25px;
            color:#b0c7db;
            font-size:12px;
            line-height:1.7;
          ">
            Button not working? Copy this link into your browser:
          </p>

          <p style="
            font-size:11px;
            overflow-wrap:anywhere;
          ">
            <a
              href="${safeUrl}"
              style="color:#00bfff;"
            >
              ${safeUrl}
            </a>
          </p>

        </div>

        <div style="
          background:#041222;
          border-top:1px solid #163a5a;
          padding:24px 30px;
        ">

          <p style="
            margin:0;
            color:#8ba8c0;
            font-size:12px;
            line-height:1.8;
          ">
            FIXHUB — Mobile Care Experts
            <br />
            Secure Customer Account Services
          </p>

        </div>

      </div>

    </body>
  </html>
  `;
}

// ==========================================
// 7. SEND SECURITY EMAIL
// ==========================================

async function sendFixHubEmail({
  to,
  subject,
  heading,
  message,
  buttonText,
  path,
  token,
}) {
  const config = getEmailConfig();
  const recipient = String(to || "").trim();

  const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

  if (!emailPattern.test(recipient)) {
    throw new Error("Recipient email address is invalid.");
  }

  const actionUrl = createEmailLink(config.clientUrl, path, token);

  const transporter = createMailTransporter(config);

  const html = createEmailTemplate({
    heading,
    message,
    buttonText,
    actionUrl,
  });

  const text = `
FIXHUB — MOBILE CARE EXPERTS

${heading}

${message}

${buttonText}:

${actionUrl}

This link expires in 15 minutes.

This link can be used only once.

If you did not request this action,
you can safely ignore this email.

Do not share this link with anyone.

FIXHUB Team
  `.trim();

  try {
    const info = await transporter.sendMail({
      from: {
        name: "FIXHUB",
        address: config.from,
      },

      to: recipient,
      subject,
      text,
      html,

      envelope: {
        from: config.user,
        to: [recipient],
      },
    });

    const accepted = info.accepted || [];
    const rejected = info.rejected || [];

    if (
      !accepted.some(
        (address) => String(address).toLowerCase() === recipient.toLowerCase(),
      )
    ) {
      throw new Error("Recipient was not accepted by SMTP.");
    }

    console.log("FIXHUB EMAIL ACCEPTED BY HOSTINGER");
    console.log("Accepted recipients:", accepted.length);
    console.log("Rejected recipients:", rejected.length);

    return {
      success: true,
      messageId: info.messageId,
      accepted: accepted.length,
      rejected: rejected.length,
    };
  } catch (error) {
    console.error("FIXHUB EMAIL FAILED");
    console.error("SMTP Code:", error.code || "UNKNOWN");
    console.error("SMTP Status:", error.responseCode || "N/A");
    console.error("SMTP Command:", error.command || "N/A");

    throw new Error("FIXHUB could not send the security email.");
  } finally {
    transporter.close();
  }
}

// ==========================================
// 8. EMAIL VERIFICATION
// ==========================================

export async function sendVerificationEmail(email, token) {
  return sendFixHubEmail({
    to: email,
    subject: "Verify Your FIXHUB Email Address",
    heading: "Verify Your Email",

    message:
      "Welcome to FIXHUB! Please verify your email address to activate your customer account.",

    buttonText: "Verify My Email",
    path: "/verify-email",
    token,
  });
}

// ==========================================
// 9. FORGOT PASSWORD
// ==========================================

export async function sendPasswordResetEmail(email, token) {
  return sendFixHubEmail({
    to: email,
    subject: "Reset Your FIXHUB Password",
    heading: "Reset Your Password",

    message:
      "We received a request to reset your FIXHUB account password. Click below to create a new password.",

    buttonText: "Reset My Password",
    path: "/reset-password",
    token,
  });
}

// ==========================================
// 10. CUSTOMER WELCOME EMAIL
// ==========================================

export async function sendWelcomeEmail({ email, fullName }) {
  const config = getEmailConfig();

  const recipient = String(email || "").trim();

  const safeName = escapeHtml(fullName || "there");

  const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

  if (!emailPattern.test(recipient)) {
    throw new Error("Recipient email address is invalid.");
  }

  const transporter = createMailTransporter(config);

  const html = `
    <!DOCTYPE html>
    <html lang="en">

      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>Welcome to FIXHUB</title>
      </head>

      <body style="
        margin:0;
        padding:30px 15px;
        background:#edf4fb;
        font-family:Arial,Helvetica,sans-serif;
      ">

        <div style="
          max-width:560px;
          margin:0 auto;
          background:#06182b;
          border:1px solid #16436c;
          border-radius:18px;
          overflow:hidden;
        ">

          <div style="
            background:#08223e;
            padding:30px;
            border-bottom:1px solid #16436c;
          ">

            <h1 style="
              margin:0;
              color:#00bfff;
              font-size:34px;
              letter-spacing:1px;
            ">
              FIXHUB
            </h1>

            <p style="
              color:#a9c2d8;
              font-size:12px;
              letter-spacing:2px;
              margin:8px 0 0;
            ">
              MOBILE CARE EXPERTS
            </p>

          </div>

          <div style="padding:35px 30px;">

            <h2 style="
              color:#ffffff;
              font-size:25px;
              margin:0 0 20px;
            ">
              Welcome to FIXHUB, ${safeName}!
            </h2>

            <p style="
              color:#c6d7e9;
              font-size:15px;
              line-height:1.8;
            ">
              Your customer account has been created successfully.
              We're happy to have you with us.

              You can now log in to manage your account
              and explore our mobile repair services.
            </p>

            <a
              href="${escapeHtml(config.clientUrl)}"
              style="
                display:inline-block;
                margin:20px 0;
                background:#008cff;
                color:#ffffff;
                text-decoration:none;
                padding:15px 26px;
                border-radius:10px;
                font-weight:bold;
              "
            >
              Visit FIXHUB
            </a>

            <p style="
              color:#9bb6ce;
              font-size:13px;
              line-height:1.8;
            ">
              If you did not create this account,
              please contact FIXHUB support.
            </p>

          </div>

          <div style="
            background:#041222;
            border-top:1px solid #163a5a;
            padding:24px 30px;
          ">

            <p style="
              margin:0;
              color:#8ba8c0;
              font-size:12px;
              line-height:1.8;
            ">
              FIXHUB — Mobile Care Experts
            </p>

          </div>

        </div>

      </body>
    </html>
  `;

  const text = `
FIXHUB — MOBILE CARE EXPERTS

Welcome to FIXHUB, ${fullName || "there"}!

Your customer account has been created successfully.

You can now log in and explore our mobile repair services.

${config.clientUrl}

FIXHUB Team
  `.trim();

  try {
    const info = await transporter.sendMail({
      from: {
        name: "FIXHUB",
        address: config.from,
      },

      to: recipient,

      subject: "Welcome to FIXHUB — Your Account Is Ready!",

      text,
      html,

      envelope: {
        from: config.user,
        to: [recipient],
      },
    });

    const accepted = info.accepted || [];

    const wasAccepted = accepted.some(
      (address) => String(address).toLowerCase() === recipient.toLowerCase(),
    );

    if (!wasAccepted) {
      throw new Error("Recipient was not accepted by SMTP.");
    }

    console.log("FIXHUB welcome email accepted by Hostinger.");

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("FIXHUB welcome email failed:", error.code || error.message);

    throw new Error("FIXHUB could not send the welcome email.");
  } finally {
    transporter.close();
  }
}
