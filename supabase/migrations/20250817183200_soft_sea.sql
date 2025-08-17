/*
  # Fix Authentication and RLS Policies

  1. Security Updates
    - Update RLS policies to work with auth.uid()
    - Add helper function for admin check
    - Ensure proper user access controls

  2. Policy Updates
    - Fix profiles table policies
    - Fix buyers table policies  
    - Fix suppliers table policies
    - Ensure users can create and read their own data
*/

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND user_type = 'admin'
  );
$$;

-- Update profiles table policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile or admin can read all" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles" ON profiles;

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can read own profile or admin can read all"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admin can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update buyers table policies
DROP POLICY IF EXISTS "Buyers can insert own data" ON buyers;
DROP POLICY IF EXISTS "Buyers can read own data or admin can read all" ON buyers;
DROP POLICY IF EXISTS "Buyers can update own data" ON buyers;
DROP POLICY IF EXISTS "Admin can manage buyers" ON buyers;

CREATE POLICY "Buyers can insert own data"
  ON buyers
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Buyers can read own data or admin can read all"
  ON buyers
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "Buyers can update own data"
  ON buyers
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admin can manage buyers"
  ON buyers
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update suppliers table policies
DROP POLICY IF EXISTS "Suppliers can insert own data" ON suppliers;
DROP POLICY IF EXISTS "Suppliers can read own data or admin can read all" ON suppliers;
DROP POLICY IF EXISTS "Suppliers can update own data" ON suppliers;
DROP POLICY IF EXISTS "Admin can manage suppliers" ON suppliers;

CREATE POLICY "Suppliers can insert own data"
  ON suppliers
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Suppliers can read own data or admin can read all"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "Suppliers can update own data"
  ON suppliers
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admin can manage suppliers"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());