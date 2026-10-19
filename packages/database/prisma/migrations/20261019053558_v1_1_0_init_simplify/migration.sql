-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "workerId" TEXT;

-- CreateTable
CREATE TABLE "workers" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Usta Elektrikçi',
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "organizationId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workers_organizationId_idx" ON "workers"("organizationId");

-- CreateIndex
CREATE INDEX "workers_lastName_firstName_idx" ON "workers"("lastName", "firstName");

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
