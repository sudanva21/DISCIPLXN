-- =============================================
-- DISCIPLXN - Complete Supabase Database Setup
-- Run this entire script in Supabase SQL Editor
-- =============================================

-- =============================================
-- 0. CLEANUP EXISTING TRIGGERS AND FUNCTIONS (Prevents conflicts)
-- =============================================

-- Drop trigger on auth.users (always exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop triggers on other tables (wrapped in exception handler for fresh DB)
DO $$ BEGIN
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    DROP TRIGGER IF EXISTS update_memberships_updated_at ON memberships;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    DROP TRIGGER IF EXISTS update_receipts_updated_at ON receipts;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Now drop functions (CASCADE forces removal of dependencies)
DROP FUNCTION IF EXISTS make_user_admin(text) CASCADE;
DROP FUNCTION IF EXISTS make_user_super_admin(text) CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS get_admin_dashboard_stats() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- =============================================
-- 1. ENUMS (Custom Types) - Drop if exists first
-- =============================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'member', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE membership_plan AS ENUM ('basic', 'premium', 'elite', 'trial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE membership_status AS ENUM ('active', 'expired', 'pending', 'cancelled', 'frozen');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE day_type AS ENUM ('working', 'holiday', 'special');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- =============================================
-- 2. PROFILES TABLE (Extends Supabase Auth)
-- =============================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'member' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Simple policies for profiles
CREATE POLICY "Public profiles are viewable" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Trigger to auto-create profile on signup (FIXED - handles null values)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))),
        'member'::user_role
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log the error but don't fail the signup
        RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =============================================
-- 3. GYMS TABLE (For Multi-Gym Support)
-- =============================================

CREATE TABLE IF NOT EXISTS gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view gyms" ON gyms;
CREATE POLICY "Anyone can view gyms" ON gyms FOR SELECT USING (true);


-- =============================================
-- 4. MEMBERSHIPS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
    plan membership_plan NOT NULL DEFAULT 'basic',
    status membership_status NOT NULL DEFAULT 'pending',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view own membership" ON memberships;
DROP POLICY IF EXISTS "Admins can manage memberships" ON memberships;

CREATE POLICY "Members can view own membership" ON memberships
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage memberships" ON memberships
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );


-- =============================================
-- 5. RECEIPTS TABLE (Digital Fee Receipts)
-- =============================================

-- Create sequence first
CREATE SEQUENCE IF NOT EXISTS receipt_number_seq START 1;

CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number TEXT NOT NULL DEFAULT ('RCP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('receipt_number_seq')::TEXT, 4, '0')),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    membership_id UUID REFERENCES memberships(id) ON DELETE SET NULL,
    gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT DEFAULT 'cash',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_date TIMESTAMPTZ,
    description TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view own receipts" ON receipts;
DROP POLICY IF EXISTS "Admins can manage receipts" ON receipts;

CREATE POLICY "Members can view own receipts" ON receipts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage receipts" ON receipts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );


-- =============================================
-- 6. NOTIFICATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info' NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    is_global BOOLEAN DEFAULT FALSE NOT NULL,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can view notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id OR is_global = TRUE);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);


-- =============================================
-- 7. GYM SCHEDULE TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS gym_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    day_type day_type NOT NULL DEFAULT 'working',
    open_time TIME,
    close_time TIME,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(gym_id, date)
);

ALTER TABLE gym_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view schedules" ON gym_schedules;
CREATE POLICY "Anyone can view schedules" ON gym_schedules FOR SELECT USING (true);


-- =============================================
-- 8. GYM WORKING HOURS (Default Weekly Schedule)
-- =============================================

CREATE TABLE IF NOT EXISTS gym_working_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    is_open BOOLEAN DEFAULT TRUE NOT NULL,
    open_time TIME DEFAULT '06:00:00',
    close_time TIME DEFAULT '22:00:00',
    UNIQUE(gym_id, day_of_week)
);

ALTER TABLE gym_working_hours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view working hours" ON gym_working_hours;
CREATE POLICY "Anyone can view working hours" ON gym_working_hours FOR SELECT USING (true);


-- =============================================
-- 9. ACTIVITY LOGS (Audit Trail)
-- =============================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view logs" ON activity_logs;
DROP POLICY IF EXISTS "System can insert logs" ON activity_logs;

CREATE POLICY "Admins can view logs" ON activity_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

CREATE POLICY "System can insert logs" ON activity_logs
    FOR INSERT WITH CHECK (true);


-- =============================================
-- 10. ANNOUNCEMENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    priority INTEGER DEFAULT 0,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active announcements" ON announcements;
CREATE POLICY "Anyone can view active announcements" ON announcements
    FOR SELECT USING (is_active = TRUE);


-- =============================================
-- 11. MEMBERSHIP PLANS CONFIG TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    plan_type membership_plan NOT NULL,
    duration_days INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active plans" ON membership_plans;
CREATE POLICY "Anyone can view active plans" ON membership_plans
    FOR SELECT USING (is_active = TRUE);


-- =============================================
-- 12. FUTURE TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS supplements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    category TEXT,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view supplements" ON supplements;
CREATE POLICY "Anyone can view supplements" ON supplements FOR SELECT USING (is_available = TRUE);


CREATE TABLE IF NOT EXISTS diet_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    meals JSONB DEFAULT '[]',
    calories_target INTEGER,
    protein_target INTEGER,
    carbs_target INTEGER,
    fat_target INTEGER,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view diet plans" ON diet_plans;
CREATE POLICY "Members can view diet plans" ON diet_plans FOR SELECT USING (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view sessions" ON training_sessions;
CREATE POLICY "Members can view sessions" ON training_sessions
    FOR SELECT USING (auth.uid() = member_id OR auth.uid() = trainer_id);


-- =============================================
-- 13. INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_payment_status ON receipts(payment_status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);


-- =============================================
-- 14. HELPER FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_members', (SELECT COUNT(*) FROM profiles WHERE role = 'member'),
        'active_memberships', (SELECT COUNT(*) FROM memberships WHERE status = 'active'),
        'pending_payments', (SELECT COUNT(*) FROM receipts WHERE payment_status = 'pending'),
        'total_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM receipts WHERE payment_status = 'paid')
    ) INTO stats;
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 15. UPDATED_AT TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_memberships_updated_at ON memberships;
CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_receipts_updated_at ON receipts;
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =============================================
-- 16. SEED DATA
-- =============================================

-- Insert default gym (ignore if exists)
INSERT INTO gyms (id, name, address, phone, email) VALUES
('00000000-0000-0000-0000-000000000001', 'DISCIPLXN Elite Fitness', '123 Fitness Street', '+1 (555) 000-0000', 'info@disciplxn.com')
ON CONFLICT (id) DO NOTHING;

-- Insert default working hours
INSERT INTO gym_working_hours (gym_id, day_of_week, is_open, open_time, close_time) VALUES
('00000000-0000-0000-0000-000000000001', 0, true, '08:00', '20:00'),
('00000000-0000-0000-0000-000000000001', 1, true, '06:00', '22:00'),
('00000000-0000-0000-0000-000000000001', 2, true, '06:00', '22:00'),
('00000000-0000-0000-0000-000000000001', 3, true, '06:00', '22:00'),
('00000000-0000-0000-0000-000000000001', 4, true, '06:00', '22:00'),
('00000000-0000-0000-0000-000000000001', 5, true, '06:00', '22:00'),
('00000000-0000-0000-0000-000000000001', 6, true, '06:00', '22:00')
ON CONFLICT (gym_id, day_of_week) DO NOTHING;

-- Insert default membership plans
INSERT INTO membership_plans (gym_id, name, plan_type, duration_days, price, description, features) VALUES
('00000000-0000-0000-0000-000000000001', 'Basic Monthly', 'basic', 30, 49.99, 'Access to gym equipment', '["Gym access", "Locker room"]'),
('00000000-0000-0000-0000-000000000001', 'Premium Monthly', 'premium', 30, 99.99, 'Full access with classes', '["Gym access", "All classes", "Locker room", "Towel service"]'),
('00000000-0000-0000-0000-000000000001', 'Elite Monthly', 'elite', 30, 149.99, 'VIP membership with PT', '["Gym access", "All classes", "Personal trainer", "Locker room", "Supplements discount"]')
ON CONFLICT DO NOTHING;

-- Insert welcome announcement
INSERT INTO announcements (gym_id, title, content, priority) VALUES
('00000000-0000-0000-0000-000000000001', 'Welcome to DISCIPLXN!', 'Welcome to the elite fitness experience.', 10)
ON CONFLICT DO NOTHING;


-- =============================================
-- 17. ADMIN FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE profiles SET role = 'admin', updated_at = NOW() WHERE email = user_email;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count = 0 THEN
        RETURN 'User not found: ' || user_email;
    END IF;
    RETURN 'User ' || user_email || ' is now admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION make_user_super_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE profiles SET role = 'super_admin', updated_at = NOW() WHERE email = user_email;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count = 0 THEN
        RETURN 'User not found: ' || user_email;
    END IF;
    RETURN 'User ' || user_email || ' is now super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- SETUP COMPLETE!
-- =============================================
-- 
-- 1. Run this script in Supabase SQL Editor
-- 2. Sign up a user in your app
-- 3. Make them admin:
--    SELECT make_user_admin('your@email.com');
--
-- =============================================
