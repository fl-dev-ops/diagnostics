import { prisma } from "#/db.server";
import type {
  DiagnosticConnectionDetails,
  DiagnosticReport,
  DiagnosticSessionStatusResponse,
} from "#/diagnostic/types";
import { isDiagnosticEgressEnabled } from "#/diagnostic/livekit.server";
import {
  buildDiagnosticParticipantIdentity,
  buildDiagnosticRoomName,
  createDiagnosticLiveKitRoom,
  createDiagnosticLiveKitToken,
  getDiagnosticLiveKitServerUrl,
  startDiagnosticRoomRecording,
} from "#/diagnostic/livekit.server";
import { asJsonObject, toJsonValue } from "#/pre-screening/pre-screening-metadata";
import { buildParticipantName } from "#/shared/user/participant-name";

type StartDiagnosticUser = {
  id: string;
  name: string;
};

function buildDiagnosticSessionMetadata(input: { user: StartDiagnosticUser }) {
  return {
    studentId: input.user.id,
    egressEnabled: isDiagnosticEgressEnabled(),
  };
}

export async function startDiagnosticInterviewSession(input: {
  user: StartDiagnosticUser;
}): Promise<DiagnosticConnectionDetails> {
  const roomName = buildDiagnosticRoomName(input.user.id);
  const participantIdentity = buildDiagnosticParticipantIdentity(input.user.id);
  const participantName = buildParticipantName(input.user.name);
  const sessionMetadata = buildDiagnosticSessionMetadata({
    user: input.user,
  });

  const diagnosticSession = await prisma.diagnosticSession.create({
    data: {
      userId: input.user.id,
      status: "STARTED",
      roomName,
      sessionMetadata: toJsonValue(sessionMetadata),
    },
  });

  await createDiagnosticLiveKitRoom({
    roomName,
    metadata: {
      mode: "diagnostic_interview",
      student_id: input.user.id,
      student_name: participantName,
      session_id: diagnosticSession.id,
    },
  });

  if (isDiagnosticEgressEnabled()) {
    const egress = await startDiagnosticRoomRecording({
      roomName,
      sessionId: diagnosticSession.id,
    });

    await prisma.diagnosticSession.update({
      where: { id: diagnosticSession.id },
      data: {
        egressId: egress.egressId,
      },
    });
  }

  const participantToken = await createDiagnosticLiveKitToken({
    roomName,
    participantIdentity,
    participantName,
  });

  return {
    sessionId: diagnosticSession.id,
    serverUrl: getDiagnosticLiveKitServerUrl(),
    roomName,
    participantName,
    participantIdentity,
    participantToken,
  };
}

export async function getDiagnosticSessionStatus(input: {
  sessionId: string;
  userId: string;
}): Promise<DiagnosticSessionStatusResponse | null> {
  const session = await prisma.diagnosticSession.findUnique({
    where: { id: input.sessionId },
    include: { report: true },
  });

  if (!session) {
    return null;
  }

  const sessionMetadata = asJsonObject(session.sessionMetadata);
  const studentIdFromMetadata =
    typeof sessionMetadata.studentId === "string" ? sessionMetadata.studentId : null;
  const isOwner = session.userId === input.userId || studentIdFromMetadata === input.userId;

  if (!isOwner) {
    return null;
  }

  return {
    session: {
      id: session.id,
      status: session.status,
      roomName: session.roomName,
      videoUrl: session.videoUrl,
      startedAt: session.startedAt.toISOString(),
      endedAt: session.endedAt?.toISOString() ?? null,
    },
    report: session.report
      ? {
          id: session.report.id,
          status: session.report.status,
          promptVersion: session.report.promptVersion,
          fileUri: session.report.fileUri,
          reportJson: (session.report.reportJson as DiagnosticReport | null) ?? null,
          errorMessage: session.report.errorMessage,
          metadata: session.report.metadata,
        }
      : null,
  };
}
