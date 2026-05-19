-- AlterTable
ALTER TABLE `Org`
    ADD COLUMN `publicListingEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `publicCategory` VARCHAR(191) NULL,
    ADD COLUMN `publicSubtitle` VARCHAR(191) NULL,
    ADD COLUMN `directoryOrder` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Org_directoryOrder_key` ON `Org`(`directoryOrder`);

-- CreateIndex
CREATE INDEX `Org_publicListingEnabled_idx` ON `Org`(`publicListingEnabled`);
