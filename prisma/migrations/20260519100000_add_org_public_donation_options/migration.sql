-- AlterTable
ALTER TABLE `Org`
    ADD COLUMN `publicDonationOptions` JSON NULL;

-- Seed a minimal public option definition for existing public orgs
UPDATE `Org`
SET `publicDonationOptions` = JSON_ARRAY(
    JSON_OBJECT(
      'key', 'general',
      'title', 'תרומה כללית',
      'description', 'מעבר למסלול תרומה כללי של הארגון.',
      'tone', 'soft'
    )
  )
WHERE `publicListingEnabled` = true
  AND `publicDonationOptions` IS NULL;
