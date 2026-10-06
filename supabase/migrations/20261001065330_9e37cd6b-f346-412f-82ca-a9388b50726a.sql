CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(id uuid, email text, full_name text, phone text, city text, created_at timestamptz, last_sign_in_at timestamptz, email_confirmed_at timestamptz, is_admin boolean, orders_count bigint, orders_total bigint, cart_count bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  RETURN QUERY
  SELECT u.id, u.email::text, p.full_name, p.phone, p.city, u.created_at, u.last_sign_in_at, u.email_confirmed_at,
    public.has_role(u.id, 'admin'),
    (SELECT count(*) FROM public.orders o WHERE o.user_id = u.id),
    (SELECT coalesce(sum(o.total),0)::bigint FROM public.orders o WHERE o.user_id = u.id),
    (SELECT coalesce(sum(c.qty),0)::bigint FROM public.cart_items c WHERE c.user_id = u.id)
  FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id
  ORDER BY u.created_at DESC;
END $$;
REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

CREATE POLICY cart_admin_all ON public.cart_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY wishlist_admin_read ON public.wishlist_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));