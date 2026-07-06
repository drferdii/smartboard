-- 1. Create Branches Table
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default branch
INSERT INTO public.branches (id, name, address) VALUES 
('00000000-0000-0000-0000-000000000001', 'Pusat Bengkayang', 'Bumi Amas, depan Kantor Camat Bengkayang')
ON CONFLICT DO NOTHING;

-- Add branch_id to transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) DEFAULT '00000000-0000-0000-0000-000000000001';

-- 2. Create Inventory Table
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES public.branches(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    stock NUMERIC NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    cost_per_unit NUMERIC NOT NULL DEFAULT 0,
    min_stock_alert NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Recipes Table (Links Menu Items to Inventory)
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
    quantity_required NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Customers Table (CRM)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    total_spent NUMERIC DEFAULT 0,
    last_visit TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link customers to transactions
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id);

-- 5. Create Shifts & Fraud Logs
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES public.branches(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    user_id UUID REFERENCES auth.users(id),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    starting_cash NUMERIC NOT NULL,
    ending_cash NUMERIC,
    status TEXT DEFAULT 'OPEN'
);

CREATE TABLE IF NOT EXISTS public.fraud_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES public.branches(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    user_id UUID REFERENCES auth.users(id),
    shift_id UUID REFERENCES public.shifts(id),
    action_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS setup for new tables
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_logs ENABLE ROW LEVEL SECURITY;

-- Note: The following lines will drop policies if they exist so the script is idempotent
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
