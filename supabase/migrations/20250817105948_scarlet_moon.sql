@@ .. @@
 -- profiles
 create policy "own profile read" on public.profiles for select using (id = auth.uid() or public.is_admin());
 create policy "own profile update" on public.profiles for update using (id = auth.uid());
+create policy "allow profile creation on signup" on public.profiles for insert with check (auth.uid() = id);
+create policy "admin can manage all profiles" on public.profiles for all using (public.is_admin());
 
 -- categories
 create policy "everyone can read active categories" on public.categories for select using (active = true);
@@ .. @@
 -- suppliers
 create policy "supplier self read" on public.suppliers for select using (id = auth.uid() or public.is_admin());
 create policy "supplier self upsert" on public.suppliers for insert with check (id = auth.uid());
 create policy "supplier update self" on public.suppliers for update using (id = auth.uid());
+create policy "admin can manage all suppliers" on public.suppliers for all using (public.is_admin());
 
 -- buyers
 create policy "buyer self read" on public.buyers for select using (id = auth.uid() or public.is_admin());
 create policy "buyer upsert self" on public.buyers for insert with check (id = auth.uid());
+create policy "admin can manage all buyers" on public.buyers for all using (public.is_admin());