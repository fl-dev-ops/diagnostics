import { asJsonObject } from "#/pre-screening/pre-screening-metadata";
import type { DiagnosticSessionTranscript, DiagnosticTranscriptMessage } from "#/diagnostic/types";

const TRANSCRIPT_SOURCE = "livekit_client_transcriptions";

function toIsoTimestamp(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return null;
  }

  return timestamp.toISOString();
}

export function sanitizeDiagnosticTranscriptMessages(
  messages: unknown,
): DiagnosticTranscriptMessage[] {
  if (!Array.isArray(messages)) {
    return [];
  }

  const latestById = new Map<string, DiagnosticTranscriptMessage>();

  messages.forEach((message, index) => {
    const item = asJsonObject(message);
    const role = item.role;
    const text = typeof item.text === "string" ? item.text.trim() : "";
    const participantIdentity =
      typeof item.participantIdentity === "string" ? item.participantIdentity.trim() : "";
    const timestamp = toIsoTimestamp(item.timestamp);
    const rawId = typeof item.id === "string" ? item.id.trim() : "";

    if ((role !== "agent" && role !== "user") || !text || !participantIdentity || !timestamp) {
      return;
    }

    const id = rawId || `${participantIdentity}-${timestamp}-${index}`;

    latestById.set(id, {
      id,
      participantIdentity,
      role,
      text,
      timestamp,
    });
  });

  return Array.from(latestById.values()).sort((left, right) =>
    left.timestamp.localeCompare(right.timestamp),
  );
}

export function buildDiagnosticSessionTranscript(
  messages: DiagnosticTranscriptMessage[],
): DiagnosticSessionTranscript {
  return {
    source: TRANSCRIPT_SOURCE,
    updatedAt: new Date().toISOString(),
    messages,
  };
}

export function getDiagnosticSessionTranscriptMessages(
  transcript: unknown,
): DiagnosticTranscriptMessage[] {
  const value = asJsonObject(transcript);
  return sanitizeDiagnosticTranscriptMessages(value.messages);
}

export function buildDiagnosticTranscriptPromptText(messages: DiagnosticTranscriptMessage[]) {
  return messages
    .map((message, index) => {
      const speaker = message.role === "user" ? "Student" : "Agent";
      return `${index + 1}. [${message.timestamp}] ${speaker}: ${message.text}`;
    })
    .join("\n");
}
