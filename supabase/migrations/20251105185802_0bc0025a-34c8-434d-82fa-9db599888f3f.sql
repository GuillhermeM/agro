-- Remove the unique constraint on user_id from farms table
-- This allows users to have multiple farms
ALTER TABLE public.farms 
DROP CONSTRAINT IF EXISTS farms_user_id_key;