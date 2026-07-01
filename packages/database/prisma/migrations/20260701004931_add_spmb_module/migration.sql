-- CreateEnum
CREATE TYPE "SpmbStatus" AS ENUM ('REGISTERED', 'DOCUMENT_CHECK', 'PAYMENT_PENDING', 'PAID', 'SELECTION', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SpmbResultStatus" AS ENUM ('LULUS', 'CADANGAN', 'TIDAK_LULUS');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED');

-- CreateTable
CREATE TABLE "spmb_periods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spmb_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spmb_paths" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "periodId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quota" INTEGER NOT NULL DEFAULT 0,
    "registrationFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spmb_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spmb_applicants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "periodId" UUID NOT NULL,
    "pathId" UUID NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "nik" TEXT,
    "birthPlace" TEXT,
    "birthDate" TIMESTAMP(3),
    "gender" "Gender",
    "address" TEXT,
    "parentName" TEXT,
    "parentPhone" TEXT,
    "previousSchool" TEXT,
    "major" TEXT,
    "status" "SpmbStatus" NOT NULL DEFAULT 'REGISTERED',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spmb_applicants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spmb_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "applicantId" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spmb_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spmb_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "applicantId" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" TEXT,
    "externalRef" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spmb_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spmb_results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "applicantId" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "status" "SpmbResultStatus" NOT NULL,
    "score" DECIMAL(6,2),
    "notes" TEXT,
    "announcedAt" TIMESTAMP(3),
    "reregisteredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spmb_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "spmb_periods_tenantId_idx" ON "spmb_periods"("tenantId");

-- CreateIndex
CREATE INDEX "spmb_paths_tenantId_idx" ON "spmb_paths"("tenantId");

-- CreateIndex
CREATE INDEX "spmb_paths_periodId_idx" ON "spmb_paths"("periodId");

-- CreateIndex
CREATE INDEX "spmb_applicants_tenantId_idx" ON "spmb_applicants"("tenantId");

-- CreateIndex
CREATE INDEX "spmb_applicants_tenantId_status_idx" ON "spmb_applicants"("tenantId", "status");

-- CreateIndex
CREATE INDEX "spmb_applicants_periodId_idx" ON "spmb_applicants"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "spmb_applicants_tenantId_registrationNo_key" ON "spmb_applicants"("tenantId", "registrationNo");

-- CreateIndex
CREATE INDEX "spmb_documents_tenantId_idx" ON "spmb_documents"("tenantId");

-- CreateIndex
CREATE INDEX "spmb_documents_applicantId_idx" ON "spmb_documents"("applicantId");

-- CreateIndex
CREATE INDEX "spmb_payments_tenantId_idx" ON "spmb_payments"("tenantId");

-- CreateIndex
CREATE INDEX "spmb_payments_applicantId_idx" ON "spmb_payments"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "spmb_results_applicantId_key" ON "spmb_results"("applicantId");

-- CreateIndex
CREATE INDEX "spmb_results_tenantId_idx" ON "spmb_results"("tenantId");

-- AddForeignKey
ALTER TABLE "spmb_paths" ADD CONSTRAINT "spmb_paths_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "spmb_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spmb_applicants" ADD CONSTRAINT "spmb_applicants_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "spmb_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spmb_applicants" ADD CONSTRAINT "spmb_applicants_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "spmb_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spmb_documents" ADD CONSTRAINT "spmb_documents_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "spmb_applicants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spmb_payments" ADD CONSTRAINT "spmb_payments_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "spmb_applicants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spmb_results" ADD CONSTRAINT "spmb_results_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "spmb_applicants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
