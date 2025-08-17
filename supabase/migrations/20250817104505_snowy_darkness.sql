/*
  # Row Level Security Policies

  1. Enable RLS on all tables
  2. Create helper functions for role checking
  3. Add comprehensive policies for each role
*/

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.suppliers enable row level security;
alter table public.buyers enable row level security;
alter table public.rfqs enable row level security;
alter table public.rfq_suppliers enable row level security;
alter table public.supplier_quotations enable row level security;
alter table public.sample_requests enable row level security;
alter table public.orders enable row level security;
alter table public.rfq_questions enable row level security;

-- Helper functions
create or replace function public.is_admin() returns boolean language sql stable as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin');
$$;

create or replace function public.get_user_type() returns text language sql stable as $$
  select user_type from public.profiles where id = auth.uid();
$$;

-- Profiles policies
create policy "Users can read own profile or admin can read all" 
  on public.profiles for select 
  using (id = auth.uid() or public.is_admin());

create policy "Users can update own profile" 
  on public.profiles for update 
  using (id = auth.uid());

create policy "Admin can manage all profiles" 
  on public.profiles for all 
  using (public.is_admin());

create policy "Users can insert own profile" 
  on public.profiles for insert 
  with check (id = auth.uid());

-- Categories policies
create policy "Everyone can read active categories" 
  on public.categories for select 
  using (active = true or public.is_admin());

create policy "Admin can manage categories" 
  on public.categories for all 
  using (public.is_admin());

-- Suppliers policies
create policy "Suppliers can read own data or admin can read all" 
  on public.suppliers for select 
  using (id = auth.uid() or public.is_admin());

create policy "Suppliers can insert own data" 
  on public.suppliers for insert 
  with check (id = auth.uid());

create policy "Suppliers can update own data" 
  on public.suppliers for update 
  using (id = auth.uid());

create policy "Admin can manage suppliers" 
  on public.suppliers for all 
  using (public.is_admin());

-- Buyers policies
create policy "Buyers can read own data or admin can read all" 
  on public.buyers for select 
  using (id = auth.uid() or public.is_admin());

create policy "Buyers can insert own data" 
  on public.buyers for insert 
  with check (id = auth.uid());

create policy "Buyers can update own data" 
  on public.buyers for update 
  using (id = auth.uid());

create policy "Admin can manage buyers" 
  on public.buyers for all 
  using (public.is_admin());

-- RFQs policies
create policy "Buyers can read own RFQs or admin can read all" 
  on public.rfqs for select 
  using (buyer_id = auth.uid() or public.is_admin());

create policy "Suppliers can read assigned or open bidding RFQs" 
  on public.rfqs for select 
  using (
    public.is_admin() OR
    exists(select 1 from public.rfq_suppliers rs where rs.rfq_id = rfqs.id and rs.supplier_id = auth.uid()) OR
    (open_for_bidding = true and status in ('approved', 'matched') and exists(
       select 1 from public.suppliers s where s.id = auth.uid() and rfqs.category = any(s.product_categories)
    ))
  );

create policy "Buyers can create RFQs" 
  on public.rfqs for insert 
  with check (buyer_id = auth.uid());

create policy "Buyers can update own pending RFQs" 
  on public.rfqs for update 
  using (buyer_id = auth.uid() and status = 'pending_approval');

create policy "Admin can manage all RFQs" 
  on public.rfqs for all 
  using (public.is_admin());

-- RFQ Suppliers policies
create policy "Admin can manage supplier assignments" 
  on public.rfq_suppliers for all 
  using (public.is_admin());

create policy "Users can read relevant assignments" 
  on public.rfq_suppliers for select 
  using (
    public.is_admin() OR
    supplier_id = auth.uid() OR
    exists(select 1 from public.rfqs r where r.id = rfq_id and r.buyer_id = auth.uid())
  );

-- Supplier Quotations policies
create policy "Suppliers can insert quotations when allowed" 
  on public.supplier_quotations for insert 
  with check (
    supplier_id = auth.uid() and (
      exists(select 1 from public.rfq_suppliers rs where rs.rfq_id = rfq_id and rs.supplier_id = auth.uid()) or
      exists(select 1 from public.rfqs r join public.suppliers s on s.id = auth.uid()
             where r.id = supplier_quotations.rfq_id and r.open_for_bidding = true and r.category = any(s.product_categories))
    )
  );

create policy "Suppliers can read own quotations" 
  on public.supplier_quotations for select 
  using (supplier_id = auth.uid() or public.is_admin());

create policy "Buyers can read approved quotations for own RFQs" 
  on public.supplier_quotations for select 
  using (
    public.is_admin() OR (
      status = 'approved_for_buyer' AND exists(select 1 from public.rfqs r where r.id = rfq_id and r.buyer_id = auth.uid())
    )
  );

create policy "Suppliers can update own draft quotations" 
  on public.supplier_quotations for update 
  using (supplier_id = auth.uid() and status = 'draft');

create policy "Admin can manage all quotations" 
  on public.supplier_quotations for all 
  using (public.is_admin());

-- Sample Requests policies
create policy "Buyers can create sample requests for own RFQs" 
  on public.sample_requests for insert 
  with check (
    buyer_id = auth.uid() and exists(select 1 from public.rfqs r where r.id = rfq_id and r.buyer_id = auth.uid())
  );

create policy "Suppliers can update own sample tracking" 
  on public.sample_requests for update 
  using (supplier_id = auth.uid() and status = 'approved_by_admin');

create policy "Buyers can read own sample requests" 
  on public.sample_requests for select 
  using (buyer_id = auth.uid() or public.is_admin());

create policy "Suppliers can read own sample requests" 
  on public.sample_requests for select 
  using (supplier_id = auth.uid() or public.is_admin());

create policy "Admin can manage all sample requests" 
  on public.sample_requests for all 
  using (public.is_admin());

-- Orders policies
create policy "Buyers and suppliers can read own orders" 
  on public.orders for select 
  using (buyer_id = auth.uid() or supplier_id = auth.uid() or public.is_admin());

create policy "Buyers can create orders for own RFQs" 
  on public.orders for insert 
  with check (buyer_id = auth.uid());

create policy "Suppliers can update own order status" 
  on public.orders for update 
  using (supplier_id = auth.uid());

create policy "Admin can manage all orders" 
  on public.orders for all 
  using (public.is_admin());

-- RFQ Questions policies
create policy "Suppliers can ask questions when allowed" 
  on public.rfq_questions for insert 
  with check (
    supplier_id = auth.uid() and (
      exists(select 1 from public.rfq_suppliers rs where rs.rfq_id = rfq_id and rs.supplier_id = auth.uid()) or
      exists(select 1 from public.rfqs r join public.suppliers s on s.id = auth.uid()
             where r.id = rfq_id and r.open_for_bidding = true and r.category = any(s.product_categories))
    )
  );

create policy "Users can read relevant questions" 
  on public.rfq_questions for select 
  using (
    public.is_admin() OR 
    exists(select 1 from public.rfqs r where r.id = rfq_id and r.buyer_id = auth.uid()) OR 
    supplier_id = auth.uid()
  );

create policy "Admin can manage all questions" 
  on public.rfq_questions for all 
  using (public.is_admin());