import { ENV } from "./env.js";
const escapeHtml = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
const buildResetHtml = ({ fullName, resetUrl, token }) => {
    const safeName = escapeHtml(fullName || "usuário");
    const safeUrl = escapeHtml(resetUrl);
    const safeToken = escapeHtml(token);
    return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Redefinição de senha - TaskNest</h2>
      <p>Olá, ${safeName}.</p>
      <p>Recebemos um pedido para redefinir sua senha. Este token expira em 15 minutos.</p>
      <p style="margin: 16px 0;">
        <a href="${safeUrl}" style="background:#4a044e;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;">
          Redefinir senha
        </a>
      </p>
      <p>Se preferir, use este token manualmente:</p>
      <p style="font-family: monospace; font-size: 16px; letter-spacing: 0.02em;"><strong>${safeToken}</strong></p>
      <p>Se você não solicitou essa ação, ignore este e-mail.</p>
    </div>
  `;
};
export const sendPasswordResetEmail = async ({ to, fullName, resetUrl, token, }) => {
    const apiKey = ENV.RESEND_API_KEY;
    const from = ENV.RESEND_FROM_EMAIL;
    if (!apiKey || !from) {
        console.info(`[auth] Password reset requested for ${to}. Configure RESEND_API_KEY and RESEND_FROM_EMAIL to send e-mails.`);
        console.info(`[auth] Reset URL for ${to}: ${resetUrl}`);
        return { sent: false, provider: "console" };
    }
    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from,
                to: [to],
                subject: "TaskNest: redefinição de senha",
                html: buildResetHtml({ fullName, resetUrl, token }),
            }),
        });
        if (!response.ok) {
            const responseText = await response.text();
            throw new Error(`Resend API error (${response.status}): ${responseText || "unknown error"}`);
        }
        return { sent: true, provider: "resend" };
    }
    catch (error) {
        console.error("Error sending password reset email:", error);
        return { sent: false, provider: "resend" };
    }
};
