/*
  # Fix Row Level Security policies for user registration

  1. Security Updates
    - Drop existing problematic policies
    - Create new policies that allow authenticated users to manage their own data
    - Ensure users can insert, select, update their own records
    - Allow admin users to manage all data

  2. Tables Updated
    - `profiles` - Allow users to manage their own profile
    - `buyers` - Allow users to insert and manage their own buyer record  
    - `suppliers` - Allow users to insert and manage their own supplier record
*/

-- Ensure RLS is enabled for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  );
$$;

-- Drop all existing policies for profiles table
DROP POLICY IF EXISTS "Admin can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile or admin can read all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to manage their own profile" ON public.profiles;

-- Create comprehensive policy for profiles table
CREATE POLICY "Users can manage own profile, admins can manage all"
ON public.profiles
FOR ALL
TO authenticated
USING (auth.uid() = id OR is_admin())
WITH CHECK (auth.uid() = id OR is_admin());

-- Drop all existing policies for buyers table
DROP POLICY IF EXISTS "Admin can manage buyers" ON public.buyers;
DROP POLICY IF EXISTS "Buyers can insert own data" ON public.buyers;
DROP POLICY IF EXISTS "Buyers can read own data or admin can read all" ON public.buyers;
DROP POLICY IF EXISTS "Buyers can update own data" ON public.buyers;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own buyer record" ON public.buyers;

-- Create comprehensive policy for buyers table
CREATE POLICY "Users can manage own buyer record, admins can manage all"
ON public.buyers
FOR ALL
TO authenticated
USING (auth.uid() = id OR is_admin())
WITH CHECK (auth.uid() = id OR is_admin());

-- Drop all existing policies for suppliers table
DROP POLICY IF EXISTS "Admin can manage suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Suppliers can insert own data" ON public.suppliers;
DROP POLICY IF EXISTS "Suppliers can read own data or admin can read all" ON public.suppliers;
DROP POLICY IF EXISTS "Suppliers can update own data" ON public.suppliers;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own supplier record" ON public.suppliers;

-- Create comprehensive policy for suppliers table
CREATE POLICY "Users can manage own supplier record, admins can manage all"
ON public.suppliers
FOR ALL
TO authenticated
USING (auth.uid() = id OR is_admin())
WITH CHECK (auth.uid() = id OR is_admin());