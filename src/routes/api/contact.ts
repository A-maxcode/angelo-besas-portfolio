import { createFileRoute } from "@tanstack/react-router";
import { contactSchema } from "@/lib/contact-schema";

function json(data: object, status = 200) {
  return Response.json(data, { status });
}

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const origin = request.headers.get("origin");
          const allowedOrigin = new URL(request.url).origin;

          if (origin && origin !== allowedOrigin) {
            return json({ error: "Invalid request origin." }, 403);
          }

          const contentType = request.headers.get("content-type") ?? "";
          if (!contentType.includes("application/json")) {
            return json({ error: "Invalid request format." }, 415);
          }

          const body = await request.json();
          const parsed = contactSchema.safeParse(body);

          if (!parsed.success) {
            return json({ error: "Please check your form details." }, 400);
          }

          const apiKey = process.env.RESEND_API_KEY;

          if (!apiKey) {
            console.error("RESEND_API_KEY is not configured.");
            return json({ error: "Email service is not configured." }, 503);
          }

          const { name, email, subject, message } = parsed.data;

          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Portfolio Contact <onboarding@resend.dev>",
              to: ["besasangelo28@gmail.com"],
              reply_to: email,
              subject: `Portfolio Contact: ${subject}`,
              text: [
                `Name: ${name}`,
                `Email: ${email}`,
                `Subject: ${subject}`,
                "",
                "Message:",
                message,
              ].join("\n"),
            }),
          });

          if (!emailResponse.ok) {
            const errorDetails = await emailResponse.text();
            console.error("Resend delivery error:", errorDetails);
            return json({ error: "Message could not be sent. Please try again." }, 502);
          }

          return json({ success: true });
        } catch (error) {
          console.error("Contact form error:", error);
          return json({ error: "Something went wrong. Please try again." }, 500);
        }
      },
    },
  },
});
