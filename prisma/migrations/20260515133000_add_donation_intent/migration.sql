-- CreateTable
CREATE TABLE `DonationIntent` (
    `id` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `donorFullName` VARCHAR(191) NOT NULL,
    `donorEmail` VARCHAR(191) NULL,
    `donorPhone` VARCHAR(191) NULL,
    `amountMinor` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'ILS',
    `purpose` VARCHAR(191) NOT NULL,
    `recurring` BOOLEAN NOT NULL DEFAULT false,
    `note` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DonationIntent_orgId_createdAt_idx`(`orgId`, `createdAt`),
    INDEX `DonationIntent_orgId_status_idx`(`orgId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DonationIntent` ADD CONSTRAINT `DonationIntent_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Org`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
