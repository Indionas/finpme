-- The trigger function is only meant to be called by the auth trigger internally.
-- Revoke execute from public/authenticated to satisfy the security linter.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;