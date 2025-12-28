"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitFeedback(formData: FormData) {
  const email = formData.get("email")?.toString() || "Not provided";
  const useCase = formData.get("useCase")?.toString();
  const message = formData.get("message")?.toString();

  if (!useCase || !message) {
    throw new Error("Missing required fields");
  }

  await resend.emails.send({
    from: "AndesMap Feedback <feedback@resend.dev>",
    to: process.env.FEEDBACK_TO_EMAIL!,
    subject: "New AndesMap feedback",
    text: `
Use case:
${useCase}

From:
${email}

Message:
${message}
    `.trim(),
  });
}
