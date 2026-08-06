-- Fix: CREATE OR REPLACE re-grants EXECUTE to Supabase roles (anon).
-- Phase 5 revoked PUBLIC/authenticated but left anon=X, so clients could
-- call deduct_user_credits / credit_user_credits with the anon key.

revoke all on function public.deduct_user_credits(text, bigint, text, uuid, jsonb) from public;
revoke all on function public.deduct_user_credits(text, bigint, text, uuid, jsonb) from anon;
revoke all on function public.deduct_user_credits(text, bigint, text, uuid, jsonb) from authenticated;
grant execute on function public.deduct_user_credits(text, bigint, text, uuid, jsonb) to service_role;

revoke all on function public.credit_user_credits(text, bigint, text, uuid, jsonb) from public;
revoke all on function public.credit_user_credits(text, bigint, text, uuid, jsonb) from anon;
revoke all on function public.credit_user_credits(text, bigint, text, uuid, jsonb) from authenticated;
grant execute on function public.credit_user_credits(text, bigint, text, uuid, jsonb) to service_role;
