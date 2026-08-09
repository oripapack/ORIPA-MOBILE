-- App Store account deletion support.
-- The caller is derived exclusively from the signed Clerk JWT. No user id is accepted.

create or replace function public.delete_my_account_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id text;
  v_pull_ids uuid[];
begin
  v_user_id := public.auth_user_id();
  if v_user_id is null or length(trim(v_user_id)) = 0 then
    raise exception 'UNAUTHORIZED';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id, 0));

  select coalesce(array_agg(pr.id), array[]::uuid[])
  into v_pull_ids
  from public.pull_results pr
  where pr.user_id = v_user_id;

  delete from public.shipping_order_items soi
  using public.shipping_orders so
  where soi.shipping_order_id = so.id
    and so.user_id = v_user_id;

  delete from public.shipping_orders where user_id = v_user_id;
  delete from public.shipping_addresses where user_id = v_user_id;

  delete from public.vault_fulfillments
  where pull_id = any(v_pull_ids);

  delete from public.digital_twins
  where pull_id = any(v_pull_ids);

  delete from public.user_vault_items where user_id = v_user_id;
  delete from public.credit_transactions where user_id = v_user_id;
  delete from public.user_credits where user_id = v_user_id;
  delete from public.first_time_pack_claims where user_id = v_user_id;
  delete from public.pull_results where user_id = v_user_id;
  delete from public.profiles where id = v_user_id;

  return jsonb_build_object('status', 'deleted');
end;
$$;

revoke all on function public.delete_my_account_data() from public;
grant execute on function public.delete_my_account_data() to authenticated;

comment on function public.delete_my_account_data() is
  'Deletes all application records owned by the signed-in user before Clerk identity deletion.';
