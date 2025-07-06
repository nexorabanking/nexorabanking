-- Migration script to update balance field precision
-- This allows for larger balance amounts (up to 999,999,999,999.99999999)

-- Update the balance column to allow larger values
ALTER TABLE accounts ALTER COLUMN balance TYPE DECIMAL(20, 8);

-- Verify the change
SELECT column_name, data_type, numeric_precision, numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'accounts' AND column_name = 'balance'; 