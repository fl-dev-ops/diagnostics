-- CreateEnum
CREATE TYPE "DiagnosticSessionStatus" AS ENUM ('STARTED', 'COMPLETED', 'REPORT_READY');

-- CreateEnum
CREATE TYPE "DiagnosticSessionReportStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "DiagnosticSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "DiagnosticSessionStatus" NOT NULL DEFAULT 'STARTED',
    "roomName" TEXT NOT NULL,
    "egressId" TEXT,
    "videoUrl" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "transcript" JSONB,
    "sessionMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagnosticSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticSessionReport" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" "DiagnosticSessionReportStatus" NOT NULL DEFAULT 'PENDING',
    "promptVersion" TEXT,
    "fileUri" TEXT,
    "reportJson" JSONB,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagnosticSessionReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosticSession_roomName_key" ON "DiagnosticSession"("roomName");

-- CreateIndex
CREATE INDEX "DiagnosticSession_userId_idx" ON "DiagnosticSession"("userId");

-- CreateIndex
CREATE INDEX "DiagnosticSession_status_idx" ON "DiagnosticSession"("status");

-- CreateIndex
CREATE INDEX "DiagnosticSession_startedAt_idx" ON "DiagnosticSession"("startedAt");

-- CreateIndex
CREATE INDEX "DiagnosticSession_egressId_idx" ON "DiagnosticSession"("egressId");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosticSessionReport_sessionId_key" ON "DiagnosticSessionReport"("sessionId");

-- CreateIndex
CREATE INDEX "DiagnosticSessionReport_status_idx" ON "DiagnosticSessionReport"("status");

-- AddForeignKey
ALTER TABLE "DiagnosticSession" ADD CONSTRAINT "DiagnosticSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticSessionReport" ADD CONSTRAINT "DiagnosticSessionReport_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DiagnosticSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
