import { createFileRoute } from "@tanstack/react-router";
import {
  handlePreScreenLiveKitWebhookEvent,
  parseLiveKitWebhookEvent,
} from "#/pre-screening/pre-screening-webhook";
import { handleDiagnosticLiveKitWebhookEvent } from "#/diagnostic/diagnostic-webhook";

export async function postHandler({ request }: { request: Request }) {
  try {
    const event = await parseLiveKitWebhookEvent(request);
    console.log("event received from Livekit", event.event);

    await handlePreScreenLiveKitWebhookEvent(event);
    await handleDiagnosticLiveKitWebhookEvent(event);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[livekit webhook] processing failed", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: error instanceof Response ? error.status : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const Route = createFileRoute("/api/webhooks/livekit")({
  server: {
    handlers: {
      POST: postHandler,
    },
  },
});
