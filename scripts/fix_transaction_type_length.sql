-- Increase the length of transaction_type to accommodate 'international_transfer' (which is 22 characters long)
ALTER TABLE public.transactions ALTER COLUMN transaction_type TYPE VARCHAR(50);
