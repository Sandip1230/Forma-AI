const nodemailer = require("nodemailer");

function getCredentials() {
  const user = process.env.GMAIL_USER;
  // Google's UI displays app passwords as 4 space-separated groups
  // (e.g. "abcd efgh ijkl mnop"); people often paste that verbatim.
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  return { user, pass };
}

async function sendOtpEmail(toEmail, code) {
  const { user, pass } = getCredentials();
  // Gmail app passwords are always exactly 16 characters. This catches an
  // unfilled placeholder (or an accidentally-pasted regular account
  // password) before wasting a doomed SMTP round-trip and surfacing Gmail's
  // cryptic "535 Username and Password not accepted" instead.
  if (!user || !pass || pass.length !== 16) {
    const err = new Error(
      "Email sending is not configured on the server (GMAIL_APP_PASSWORD is missing or not a real app password)."
    );
    err.status = 503;
    throw err;
  }

  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  await transporter.sendMail({
    from: `"Forma AI" <${user}>`,
    to: toEmail,
    subject: "Your Forma AI login code",
    text: `Your login code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your login code is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
  });
}

module.exports = { sendOtpEmail };
