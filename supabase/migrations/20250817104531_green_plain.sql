/*
  # Admin RPC Functions

  1. RFQ Management
    - admin_approve_rfq
    - admin_reject_rfq
    - admin_assign_suppliers

  2. Supplier Management
    - admin_verify_supplier

  3. Quotation Management
    - admin_set_quotation_status

  4. Sample Management
    - admin_approve_sample

  5. Q&A Management
    - admin_approve_question
    - admin_answer_question
*/

-- RFQ Management RPCs
create or replace function public.admin_approve_rfq(p_rfq_id uuid)
returns void language plpgsql security definer as $$
begin
  if not public.is_admin() then 
    raise exception 'Access denied: Admin role required'; 
  end if;
  
  update public.rfqs 
  set status = 'approved', 
      approved_at = now(), 
      approved_by = auth.uid(),
      updated_at = now()
  where id = p_rfq_id;
  
  if not found then
    raise exception 'RFQ not found';
  end if;
end; $$;

create or replace function public.admin_reject_rfq(p_rfq_id uuid, p_reason text default null)
returns void language plpgsql security definer as $$
begin
  if not public.is_admin() then 
    raise exception 'Access denied: Admin role required'; 
  end if;
  
  -- For now, we'll delete rejected RFQs. In production, you might want to keep them with a 'rejected' status
  delete from public.rfqs where id = p_rfq_id;
  
  if not found then
    raise exception 'RFQ not found';
  end if;
end; $$;

create or replace function public.admin_assign_suppliers(p_rfq_id uuid, p_supplier_ids uuid[])
returns void language plpgsql security definer as $$
begin
  if not public.is_admin() then 
    raise exception 'Access denied: Admin role required'; 
  end if;
  
  -- Verify RFQ exists and is approved
  if not exists(select 1 from public.rfqs where id = p_rfq_id and status = 'approved') then
    raise exception 'RFQ not found or not approved';
  end if;
  
  -- Insert supplier assignments
  insert into public.rfq_suppliers(rfq_id, supplier_id, invited_by)
  select p_rfq_id, unnest(p_supplier_ids), auth.uid()
  on conflict (rfq_id, supplier_id) do nothing;
  
  -- Update RFQ status to matched
  update public.rfqs 
  set status = 'matched', updated_at = now() 
  where id = p_rfq_id;
end; $$;

-- Supplier Management RPCs
create or replace function public.admin_verify_supplier(p_supplier_id uuid, p_status text)
returns void language plpgsql security definer as $$
begin
  if not public.is_admin() then 
    raise exception 'Access denied: Admin role required'; 
  end if;
  
  if p_status not in ('verified', 'rejected') then
    raise exception 'Invalid status. Must be verified or rejected';
  end if;
  
  update public.suppliers 
  set verification_status = p_status, 
      verified_at = now(), 
      verified_by = auth.uid(),
      updated_at = now()
  where id = p_supplier_id;
  
  if not found then
    raise exception 'Supplier not found';
  end if;
end; $$;

-- Quotation Management RPCs
create or replace function public.admin_set_quotation_status(p_quote_id uuid, p_status quotation_status)
returns void language plpgsql security definer as $$
begin
  if not public.is_admin() then 
    raise exception 'Access denied: Admin role required'; 
  end if;
  
  update public.supplier_quotations 
  set status = p_status, 
      reviewed_at = now(), 
      reviewed_by = auth.uid()
  where id = p_quote_id;
  
  if not found then
    raise exception 'Quotation not found';
  end if;
end; $$;

-- Sample Management RPCs
create or replace function public.admin_approve_sample(p_sample_id uuid)
returns void language plpgsql security definer as $$
begin
  if not public.is_admin() then 
    raise exception 'Access denied: Admin role required'; 
  end if;
  
  update public.sample_requests 
  set status = 'approved_by_admin', 
      approved_at = now(), 
      approved_by = auth.uid()
  where id = p_sample_id and status = 'requested';
  
  if not found then
    raise exception 'Sample request not found or already processed';
  end if;
end; $$;

-- Q&A Management RPCs
create or replace function public.admin_approve_question(p_question_id uuid)
returns void language plpgsql security definer as $$
begin
  if not public.is_admin() then 
    raise exception 'Access denied: Admin role required'; 
  end if;
  
  update public.rfq_questions 
  set status = 'approved_by_admin'
  where id = p_question_id and status = 'pending_admin';
  
  if not found then
    raise exception 'Question not found or already processed';
  end if;
end; $$;

create or replace function public.admin_answer_question(p_question_id uuid, p_answer text)
returns void language plpgsql security definer as $$
begin
  if not public.is_admin() then 
    raise exception 'Access denied: Admin role required'; 
  end if;
  
  update public.rfq_questions 
  set answer = p_answer,
      status = 'published',
      answered_at = now(),
      answered_by = auth.uid(),
      published_at = now()
  where id = p_question_id;
  
  if not found then
    raise exception 'Question not found';
  end if;
end; $$;