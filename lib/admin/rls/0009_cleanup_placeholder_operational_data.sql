-- Remove legacy placeholder operational records that should never appear in live dashboards.

DELETE FROM public.inventory
WHERE branch_id = '00000000-0000-0000-0000-000000000001'
  AND name IN (
    'Daging Babi Segar (Karkas)',
    'Bumbu Rica-Rica Dasar',
    'Beras Premium',
    'Kotak Takeaway (Besar)'
  )
  AND category IN ('Bahan Baku Utama', 'Bumbu', 'Bahan Pendukung', 'Kemasan')
  AND (
    (name = 'Daging Babi Segar (Karkas)' AND stock = 125.5 AND unit = 'Kg' AND cost_per_unit = 80000 AND min_stock_alert = 20)
    OR (name = 'Bumbu Rica-Rica Dasar' AND stock = 12.0 AND unit = 'Kg' AND cost_per_unit = 45000 AND min_stock_alert = 5)
    OR (name = 'Beras Premium' AND stock = 250 AND unit = 'Kg' AND cost_per_unit = 14000 AND min_stock_alert = 50)
    OR (name = 'Kotak Takeaway (Besar)' AND stock = 50 AND unit = 'Pcs' AND cost_per_unit = 1200 AND min_stock_alert = 100)
  );

DELETE FROM public.customers
WHERE
  (phone = '081234567890' AND name = 'Budi Santoso' AND points = 15000 AND total_visits = 5 AND total_spent = 450000)
  OR (phone = '089876543210' AND name = 'Agus Salim' AND points = 45000 AND total_visits = 12 AND total_spent = 1200000);
