-- Tighten expansion-table RLS so direct table access matches actual app roles.

DO $$ BEGIN
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.branches;
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.inventory;
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.recipes;
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.customers;
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.shifts;
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.fraud_logs;

    DROP POLICY IF EXISTS "owner_full_branches" ON public.branches;
    DROP POLICY IF EXISTS "owner_full_inventory" ON public.inventory;
    DROP POLICY IF EXISTS "staff_read_inventory" ON public.inventory;
    DROP POLICY IF EXISTS "staff_update_inventory" ON public.inventory;
    DROP POLICY IF EXISTS "owner_full_recipes" ON public.recipes;
    DROP POLICY IF EXISTS "staff_read_recipes" ON public.recipes;
    DROP POLICY IF EXISTS "owner_full_customers" ON public.customers;
    DROP POLICY IF EXISTS "staff_read_customers" ON public.customers;
    DROP POLICY IF EXISTS "staff_update_customers" ON public.customers;
    DROP POLICY IF EXISTS "owner_full_shifts" ON public.shifts;
    DROP POLICY IF EXISTS "owner_full_fraud_logs" ON public.fraud_logs;
EXCEPTION WHEN OTHERS THEN
END $$;

CREATE POLICY "owner_full_branches" ON public.branches
FOR ALL USING (public.current_user_role() = 'owner')
WITH CHECK (public.current_user_role() = 'owner');

CREATE POLICY "owner_full_inventory" ON public.inventory
FOR ALL USING (public.current_user_role() = 'owner')
WITH CHECK (public.current_user_role() = 'owner');

CREATE POLICY "staff_read_inventory" ON public.inventory
FOR SELECT USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.is_active = true
          AND p.role IN ('staff', 'owner')
    )
);

CREATE POLICY "staff_update_inventory" ON public.inventory
FOR UPDATE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.is_active = true
          AND p.role IN ('staff', 'owner')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.is_active = true
          AND p.role IN ('staff', 'owner')
    )
);

CREATE POLICY "owner_full_recipes" ON public.recipes
FOR ALL USING (public.current_user_role() = 'owner')
WITH CHECK (public.current_user_role() = 'owner');

CREATE POLICY "staff_read_recipes" ON public.recipes
FOR SELECT USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.is_active = true
          AND p.role IN ('staff', 'owner')
    )
);

CREATE POLICY "owner_full_customers" ON public.customers
FOR ALL USING (public.current_user_role() = 'owner')
WITH CHECK (public.current_user_role() = 'owner');

CREATE POLICY "staff_read_customers" ON public.customers
FOR SELECT USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.is_active = true
          AND p.role IN ('staff', 'owner')
    )
);

CREATE POLICY "staff_update_customers" ON public.customers
FOR UPDATE USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.is_active = true
          AND p.role IN ('staff', 'owner')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.is_active = true
          AND p.role IN ('staff', 'owner')
    )
);

CREATE POLICY "owner_full_shifts" ON public.shifts
FOR ALL USING (public.current_user_role() = 'owner')
WITH CHECK (public.current_user_role() = 'owner');

CREATE POLICY "owner_full_fraud_logs" ON public.fraud_logs
FOR ALL USING (public.current_user_role() = 'owner')
WITH CHECK (public.current_user_role() = 'owner');
