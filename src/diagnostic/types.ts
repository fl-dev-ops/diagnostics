import type {
  LiveKitConnectionDetails,
  LiveKitTranscriptMessage,
  LiveKitTranscriptRole,
} from "#/shared/livekit/types";

export type DiagnosticConnectionDetails = LiveKitConnectionDetails;

export type DiagnosticTranscriptRole = LiveKitTranscriptRole;
export type DiagnosticTranscriptMessage = LiveKitTranscriptMessage;

export type DiagnosticSessionTranscript = {
  source: string;
  updatedAt: string;
  messages: DiagnosticTranscriptMessage[];
};

export type DiagnosticScoreBand = "MIN" | "LOW" | "HIGH";
export type DiagnosticCefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type DiagnosticDimensionScore = {
  score: number;
  band: DiagnosticScoreBand;
};

export type DiagnosticReport = {
  overallScore: number;
  overallBand: DiagnosticScoreBand;
  cefrLevel: DiagnosticCefrLevel;
  cefrLabel: string;
  rangeLabel: string;
  thinking: DiagnosticDimensionScore;
  confidence: DiagnosticDimensionScore;
  language: DiagnosticDimensionScore;
};

export type DiagnosticSessionStatusResponse = {
  session: {
    id: string;
    status: string;
    roomName: string;
    videoUrl: string | null;
    startedAt: string;
    endedAt: string | null;
  };
  report: null | {
    id: string;
    status: string;
    promptVersion: string | null;
    fileUri: string | null;
    reportJson: DiagnosticReport | null;
    errorMessage: string | null;
    metadata: unknown;
  };
};
