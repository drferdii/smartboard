UPDATE public.branches
SET
    name = 'Pusat Bengkayang',
    address = 'Bumi Amas, depan Kantor Camat Bengkayang',
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000001'
  AND (
      name ILIKE '%pontianak%'
      OR address ILIKE '%gajah mada%'
      OR address ILIKE '%pontianak%'
  );
