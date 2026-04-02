import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "#/db.server";
import {
  buildDiagnosticSessionTranscript,
  sanitizeDiagnosticTranscriptMessages,
} from "#/diagnostic/diagnostic-transcript";
import { getDiagnosticSessionStatus } from "#/diagnostic/diagnostic.server";
import { triggerDiagnosticSessionEvaluation } from "#/diagnostic/diagnostic-webhook";
import { asJsonObject, toJsonValue } from "#/pre-screening/pre-screening-metadata";
import { auth } from "#/lib/auth.server";

export async function getHandler({
  request,
  params,
}: {
  request: Request;
  params: { sessionId: string };
}) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const diagnosticSession = await getDiagnosticSessionStatus({
    sessionId: params.sessionId,
    userId: session.user.id,
  });

  if (!diagnosticSession) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  return Response.json(diagnosticSession);
}

export async function postHandler({
  request,
  params,
}: {
  request: Request;
  params: { sessionId: string };
}) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const diagnosticSession = await prisma.diagnosticSession.findUnique({
    where: { id: params.sessionId },
    include: { report: true },
  });

  if (!diagnosticSession) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  const sessionMetadata = asJsonObject(diagnosticSession.sessionMetadata);
  const studentIdFromMetadata =
    typeof sessionMetadata.studentId === "string" ? sessionMetadata.studentId : null;

  if (diagnosticSession.userId !== session.user.id && studentIdFromMetadata !== session.user.id) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const body = asJsonObject(payload);
  const messages = sanitizeDiagnosticTranscriptMessages(body.messages);

  if (messages.length === 0) {
    return Response.json({ error: "No transcript messages provided" }, { status: 400 });
  }

  const now = new Date();
  const shouldTriggerEvaluation =
    !diagnosticSession.report || diagnosticSession.report.status === "PENDING";

  await prisma.diagnosticSession.update({
    where: { id: diagnosticSession.id },
    data: {
      transcript: toJsonValue(buildDiagnosticSessionTranscript(messages)),
      endedAt: diagnosticSession.endedAt ?? now,
      status: diagnosticSession.status === "REPORT_READY" ? "REPORT_READY" : "COMPLETED",
    },
  });

  if (shouldTriggerEvaluation) {
    void triggerDiagnosticSessionEvaluation(diagnosticSession.id).catch((error) => {
      console.error("[diagnostic finalize] evaluation trigger failed", error);
    });
  }

  return Response.json({
    success: true,
    messageCount: messages.length,
    evaluationTriggered: shouldTriggerEvaluation,
  });
}

export const Route = createFileRoute("/api/livekit/diagnostic/$sessionId")({
  server: {
    handlers: {
      GET: getHandler,
      POST: postHandler,
    },
  },
});
