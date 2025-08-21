/*
  # Add Missing Enum Values to Existing Types
  
  This migration adds missing enum values to existing enum types that were created
  by previous migrations but are missing values used by the application.

  1. Enum Updates
    - Add 'quoted' to rfq_status enum
    - Add 'accepted' to quotation_status enum
    - Ensure all application status values are supported

  2. Safety
    - Uses ALTER TYPE ADD VALUE which is safe for existing data
    - Only adds values, doesn't remove or modify existing ones
*/

-- Add 'quoted' to rfq_status enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'quoted' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'rfq_status')
  ) THEN
    ALTER TYPE rfq_status ADD VALUE 'quoted';
  END IF;
END $$;

-- Add 'accepted' to quotation_status enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'accepted' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'quotation_status')
  ) THEN
    ALTER TYPE quotation_status ADD VALUE 'accepted';
  END IF;
END $$;

-- Verify enum values are properly added
DO $$
BEGIN
  -- Check if rfq_status has all required values
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'rfq_status' AND e.enumlabel = 'quoted'
  ) THEN
    RAISE EXCEPTION 'Failed to add quoted value to rfq_status enum';
  END IF;

  -- Check if quotation_status has all required values  
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'quotation_status' AND e.enumlabel = 'accepted'
  ) THEN
    RAISE EXCEPTION 'Failed to add accepted value to quotation_status enum';
  END IF;
  
  RAISE NOTICE 'All enum values successfully added';
END $$;