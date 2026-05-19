-- CreateTable
CREATE TABLE `Donor` (
    `id` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `nationalId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `addressLine1` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `language` VARCHAR(191) NULL,
    `customFields` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Donor_orgId_fullName_idx`(`orgId`, `fullName`),
    INDEX `Donor_orgId_email_idx`(`orgId`, `email`),
    INDEX `Donor_orgId_phone_idx`(`orgId`, `phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DonorTag` (
    `id` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `donorId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DonorTag_orgId_label_idx`(`orgId`, `label`),
    UNIQUE INDEX `DonorTag_donorId_label_key`(`donorId`, `label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DonorNote` (
    `id` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `donorId` VARCHAR(191) NOT NULL,
    `createdByUserId` VARCHAR(191) NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DonorNote_orgId_createdAt_idx`(`orgId`, `createdAt`),
    INDEX `DonorNote_donorId_createdAt_idx`(`donorId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Donor` ADD CONSTRAINT `Donor_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Org`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DonorTag` ADD CONSTRAINT `DonorTag_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Org`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DonorTag` ADD CONSTRAINT `DonorTag_donorId_fkey` FOREIGN KEY (`donorId`) REFERENCES `Donor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DonorNote` ADD CONSTRAINT `DonorNote_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Org`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DonorNote` ADD CONSTRAINT `DonorNote_donorId_fkey` FOREIGN KEY (`donorId`) REFERENCES `Donor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
