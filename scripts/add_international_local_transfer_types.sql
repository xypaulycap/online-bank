-- Add international_transfer and local_transfer to transaction types
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_transaction_type_check;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_transaction_type_check
  CHECK (
    transaction_type IN (
      'deposit',
      'withdrawal',
      'transfer',
      'payment',
      'local_transfer',
      'wire_transfer',
      'international_transfer'
    )
  );

-- No other changes required since the new types are handled via the API layer.
