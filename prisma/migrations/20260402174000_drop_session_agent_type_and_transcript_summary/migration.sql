ALTER TABLE "PreScreenSession"
  DROP COLUMN IF EXISTS "agentType",
  DROP COLUMN IF EXISTS "transcriptSummary";

ALTER TABLE "DiagnosticSession"
  DROP COLUMN IF EXISTS "agentType",
  DROP COLUMN IF EXISTS "transcriptSummary";

