-- AlterTable: add passwordHash for local auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS passwordHash TEXT;
