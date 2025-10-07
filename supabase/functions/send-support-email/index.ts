import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface SupportPayload {
  topic?: string;
  message?: string;
  replyTo?: string | null;
  userId?: string | null;
  userEmail?: string | null;
}

interface ErrorResponse {
  error: string;
}

const SUPPORT_EMAIL = Deno.env.get("SUPPORT_TEAM_EMAIL") ?? "team@wolfprocommunity.com";
const FROM_EMAIL = Deno.env.get("SUPPORT_FROM_EMAIL") ?? "Players Budget <support@playersbudget.com>";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendWithResend(payload: Required<SupportPayload>) {
  if (!RESEND_API_KEY) {
    return { sent: false, reason: "Missing RESEND_API_KEY" } as const;
  }

  // Dynamic import keeps cold starts small when email disabled
  const { Resend } = await import("npm:resend@2.2.0");
  const resend = new Resend(RESEND_API_KEY);

  const subject = payload.topic ? `Player's Budget – ${payload.topic}` : "Player's Budget – Feedback";

  const textLines = [
    `Message: ${payload.message}`,
    "",
    `Reply-to: ${payload.replyTo ?? "Not provided"}`,
    `User Email: ${payload.userEmail ?? "Not provided"}`,
    `User ID: ${payload.userId ?? "Unknown"}`,
  ];

  const text = textLines.join("\n");

  await resend.emails.send({
    from: FROM_EMAIL,
    to: SUPPORT_EMAIL,
    subject,
    text,
    reply_to: payload.replyTo ?? undefined,
  });

  return { sent: true } as const;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" satisfies ErrorResponse }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as SupportPayload;

    if (!body.message || body.message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Message is required" satisfies ErrorResponse }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const safePayload: Required<SupportPayload> = {
      topic: body.topic ?? "General",
      message: body.message,
      replyTo: body.replyTo ?? null,
      userId: body.userId ?? null,
      userEmail: body.userEmail ?? body.replyTo ?? null,
    };

    const result = await sendWithResend(safePayload);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-support-email error", error);
    return new Response(JSON.stringify({ error: "Failed to send support email" satisfies ErrorResponse }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
