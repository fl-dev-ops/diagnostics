import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "#/db.server";
import { retryDiagnosticSessionEvaluation } from "#/diagnostic/diagnostic-webhook";
import { asJsonObject } from "#/pre-screening/pre-screening-metadata";
import { auth } from "#/lib/auth.server";

export async function postHandler({
  request,
  params,
}: {
  request: Request;
  params: { sessionId: string };
}) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const diagnosticSession = await prisma.diagnosticSession.findUnique({
    where: { id: params.sessionId },
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

  try {
    await retryDiagnosticSessionEvaluation(params.sessionId);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to retry diagnostic evaluation",
      },
      { status: 500 },
    );
  }
}

export const Route = createFileRoute("/api/livekit/diagnostic/$sessionId/retry-evaluation")({
  server: {
    handlers: {
      POST: postHandler,
    },
  },
});
