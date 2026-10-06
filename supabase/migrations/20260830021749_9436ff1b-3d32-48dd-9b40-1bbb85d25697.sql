CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  pin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  image_key TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT TO anon, authenticated USING (is_active);
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_slug TEXT NOT NULL REFERENCES public.categories(slug) ON UPDATE CASCADE,
  price INT NOT NULL,
  mrp INT NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.5,
  reviews INT NOT NULL DEFAULT 0,
  image_key TEXT,
  image_url TEXT,
  brand TEXT NOT NULL DEFAULT 'Balaji Prime',
  finish TEXT NOT NULL DEFAULT 'Satin SS',
  material TEXT NOT NULL DEFAULT 'Stainless Steel 304',
  unit TEXT NOT NULL DEFAULT 'Piece',
  stock INT NOT NULL DEFAULT 0,
  highlights TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON public.products FOR SELECT TO anon, authenticated USING (is_active);
CREATE INDEX idx_products_category ON public.products(category_slug);
CREATE INDEX idx_products_price ON public.products(price);
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  qty INT NOT NULL DEFAULT 1 CHECK (qty > 0 AND qty <= 999),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart_own" ON public.cart_items FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_cart_user ON public.cart_items(user_id);
CREATE TRIGGER trg_cart_updated BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, DELETE ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wishlist_own" ON public.wishlist_items FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_wishlist_user ON public.wishlist_items(user_id);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  pin TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  subtotal INT NOT NULL,
  shipping INT NOT NULL DEFAULT 0,
  total INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'placed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "orders_admin_update" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_orders_user ON public.orders(user_id, created_at DESC);
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_slug TEXT,
  qty INT NOT NULL,
  price INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_select_own" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id
    AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE INDEX idx_order_items_order ON public.order_items(order_id);

CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL DEFAULT 'contact',
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  company TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enquiries_admin_read" ON public.enquiries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "enquiries_admin_update" ON public.enquiries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_enquiries_created ON public.enquiries(created_at DESC);
CREATE TRIGGER trg_enquiries_updated BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.place_order(
  _customer_name TEXT, _phone TEXT, _email TEXT, _address TEXT, _city TEXT,
  _pin TEXT, _payment_method TEXT, _items JSONB
) RETURNS TABLE (order_id UUID, order_no TEXT, total INT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid UUID := auth.uid();
  _order_id UUID;
  _order_no TEXT;
  _subtotal INT := 0;
  _shipping INT := 0;
  _item JSONB;
  _p RECORD;
  _qty INT;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _items IS NULL OR jsonb_array_length(_items) = 0 THEN RAISE EXCEPTION 'Cart is empty'; END IF;

  _order_no := 'SBE' || to_char(now(), 'YYMMDD') || lpad((floor(random()*100000))::text, 5, '0');
  INSERT INTO public.orders (order_no, user_id, customer_name, phone, email, address, city, pin, payment_method, subtotal, shipping, total)
  VALUES (_order_no, _uid, _customer_name, _phone, _email, _address, _city, _pin, _payment_method, 0, 0, 0)
  RETURNING id INTO _order_id;

  FOR _item IN SELECT * FROM jsonb_array_elements(_items) LOOP
    _qty := (_item->>'qty')::int;
    IF _qty IS NULL OR _qty < 1 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
    SELECT id, name, slug, price, stock INTO _p FROM public.products
      WHERE slug = (_item->>'slug') AND is_active FOR UPDATE;
    IF _p.id IS NULL THEN RAISE EXCEPTION 'Product not available: %', _item->>'slug'; END IF;
    IF _p.stock < _qty THEN RAISE EXCEPTION 'Only % left in stock for %', _p.stock, _p.name; END IF;
    UPDATE public.products SET stock = stock - _qty WHERE id = _p.id;
    INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, qty, price)
    VALUES (_order_id, _p.id, _p.name, _p.slug, _qty, _p.price);
    _subtotal := _subtotal + _p.price * _qty;
  END LOOP;

  IF _subtotal <= 4999 THEN _shipping := 149; END IF;
  UPDATE public.orders SET subtotal = _subtotal, shipping = _shipping, total = _subtotal + _shipping
    WHERE id = _order_id;
  DELETE FROM public.cart_items WHERE user_id = _uid;

  RETURN QUERY SELECT _order_id, _order_no, _subtotal + _shipping;
END; $$;
REVOKE ALL ON FUNCTION public.place_order(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,JSONB) TO authenticated, service_role;

INSERT INTO public.categories (slug, name, tagline, image_key, sort_order) VALUES
('ss-handles','SS Door Handles','Pull, lever & mortise handles in 304 grade steel','cat-handles',1),
('hinges','Hinges (All Types)','Butt, concealed, soft-close & piano hinges','cat-hinges',2),
('door-closers','Door Closers','Hydraulic overhead & floor spring closers','cat-closers',3),
('curtain-holders','Curtain Holders & Rods','Brackets, finials, rods & rings','cat-curtain',4),
('locks','Locks & Cylinders','Mortise, night latch, pin cylinder & padlocks','cat-locks',5),
('bolts-aldrops','Tower Bolts & Aldrops','Heavy duty SS latches, hasps & baby latches','cat-bolts',6),
('knobs-pulls','Cabinet Knobs & Pulls','Designer knobs, edge pulls & wardrobe handles','cat-knobs',7),
('drawer-channels','Drawer Channels','Telescopic, ball bearing & soft-close slides','cat-channels',8),
('glass-fittings','Glass Door Fittings','Patch fittings, spider, hinges & D-pulls','cat-glass',9),
('screws-fasteners','Screws & Fasteners','SS screws, anchors, wall plugs & bolts','cat-screws',10),
('bath-accessories','Bath Accessories','Towel rods, hooks, shelves & holders','cat-bath',11),
('kitchen-fittings','Kitchen Fittings','Pull-out baskets, lift-ups & organizers','cat-kitchen',12);

INSERT INTO public.products (slug, name, category_slug, price, mrp, rating, reviews, image_key, brand, finish, unit, stock, highlights, description)
SELECT s.slug, s.base || ' (' || s.finish || ')', s.cat, s.price, s.mrp, s.rating, s.reviews, c.image_key, s.brand, s.finish, s.unit, s.stock,
 ARRAY[
  'Premium ' || lower(s.finish) || ' finish, anti-rust and anti-tarnish',
  'Sold per ' || lower(s.unit) || ' with mounting screws included',
  'ISI-grade raw material with 12 month replacement warranty',
  'Suitable for residential, commercial and hotel projects'
 ]::text[],
 s.base || ' from the ' || s.brand || ' range by Shree Balaji Enterprises. Precision engineered from Stainless Steel 304 with a ' || lower(s.finish) || ' finish for long life in Indian weather. Bulk and contractor rates available on request.'
FROM (VALUES
('ss-304-square-pull-handle-12-antique-brass','SS 304 Square Pull Handle 12"','ss-handles',640,1030,4.5,76,'Balaji Prime','Antique Brass','Piece',34),
('ss-round-pipe-pull-handle-18-mirror-polish','SS Round Pipe Pull Handle 18"','ss-handles',890,1415,4.4,824,'Balaji Prime','Mirror Polish','Piece',92),
('ss-mortise-lever-handle-on-rose-chrome','SS Mortise Lever Handle on Rose','ss-handles',1240,1710,4.3,53,'Balaji Steelline','Chrome','Piece',41),
('ss-baluster-main-door-handle-24-inch-antique-brass','SS Baluster Main Door Handle 24 inch','ss-handles',2150,3395,4.3,623,'Balaji Heavy Duty','Antique Brass','Piece',61),
('ss-h-type-glass-door-handle-pair-mirror-polish','SS H-Type Glass Door Handle Pair','ss-handles',1580,2370,4.5,735,'Balaji Heavy Duty','Mirror Polish','Piece',83),
('ss-c-type-cabinet-pull-handle-8-inch-rose-gold','SS C-Type Cabinet Pull Handle 8 inch','ss-handles',320,485,4.6,377,'Balaji Steelline','Rose Gold','Piece',25),
('ss-designer-wave-door-handle-pair-antique-brass','SS Designer Wave Door Handle Pair','ss-handles',1890,2815,4.4,224,'Balaji Prime','Antique Brass','Piece',82),
('ss-hollow-tube-handle-300mm-mirror-polish','SS Hollow Tube Handle 300mm','ss-handles',720,1015,4.5,56,'Balaji Prime','Mirror Polish','Piece',14),
('ss-push-plate-pull-handle-set-matte-black','SS Push Plate & Pull Handle Set','ss-handles',1120,1790,4.5,565,'Balaji Steelline','Matte Black','Piece',63),
('ss-flush-sliding-door-handle-mirror-polish','SS Flush Sliding Door Handle','ss-handles',380,530,4.4,634,'Balaji Gold','Mirror Polish','Piece',72),
('ss-304-butt-hinge-4-x-3-inch-rose-gold','SS 304 Butt Hinge 4 x 3 inch','hinges',210,315,4.5,376,'Balaji Prime','Rose Gold','Pair',54),
('ss-bearing-hinge-5-x-3-5-inch-heavy-satin-ss','SS Bearing Hinge 5 x 3.5 inch Heavy','hinges',340,475,4.5,145,'Balaji Steelline','Satin SS','Pair',73),
('soft-close-concealed-hinge-0-crank-satin-ss','Soft Close Concealed Hinge 0 Crank','hinges',145,210,4,50,'Balaji Gold','Satin SS','Piece',18),
('auto-close-hydraulic-hinge-full-overlay-matte-black','Auto Close Hydraulic Hinge Full Overlay','hinges',165,260,4.4,654,'Balaji Gold','Matte Black','Piece',62),
('ss-piano-hinge-3-feet-chrome','SS Piano Hinge 3 Feet','hinges',480,770,4.5,375,'Balaji Heavy Duty','Chrome','Piece',93),
('ss-butterfly-hinge-3-inch-rose-gold','SS Butterfly Hinge 3 inch','hinges',120,190,4.3,793,'Balaji Steelline','Rose Gold','Pair',31),
('glass-door-pivot-hinge-ss-mirror-polish','Glass Door Pivot Hinge SS','hinges',690,1020,4.3,733,'Balaji Steelline','Mirror Polish','Piece',51),
('ss-parliament-hinge-4-inch-mirror-polish','SS Parliament Hinge 4 inch','hinges',420,565,4,270,'Balaji Gold','Mirror Polish','Pair',38),
('lift-off-hinge-ss-right-hand-satin-ss','Lift Off Hinge SS Right Hand','hinges',260,395,4.5,736,'Balaji Prime','Satin SS','Piece',54),
('ss-t-hinge-6-inch-gate-rose-gold','SS T-Hinge 6 inch Gate','hinges',380,585,4.8,829,'Balaji Steelline','Rose Gold','Pair',27),
('hydraulic-door-closer-45-65-kg-satin-ss','Hydraulic Door Closer 45-65 Kg','door-closers',1490,2010,4,240,'Balaji Prime','Satin SS','Piece',8),
('hydraulic-door-closer-65-85-kg-heavy-rose-gold','Hydraulic Door Closer 65-85 Kg Heavy','door-closers',1980,2970,4.5,495,'Balaji Heavy Duty','Rose Gold','Piece',23),
('slide-rail-door-closer-silver-antique-brass','Slide Rail Door Closer Silver','door-closers',2650,3580,4,310,'Balaji Gold','Antique Brass','Piece',38),
('floor-spring-door-closer-100-kg-chrome','Floor Spring Door Closer 100 Kg','door-closers',3450,4935,4.7,808,'Balaji Prime','Chrome','Piece',76),
('concealed-door-closer-adjustable-matte-black','Concealed Door Closer Adjustable','door-closers',2280,3465,4.6,877,'Balaji Steelline','Matte Black','Piece',85),
('glass-door-overhead-closer-kit-mirror-polish','Glass Door Overhead Closer Kit','door-closers',3150,4505,4.7,608,'Balaji Prime','Mirror Polish','Piece',16),
('door-closer-25-45-kg-compact-rose-gold','Door Closer 25-45 Kg Compact','door-closers',1150,1600,4.4,814,'Balaji Gold','Rose Gold','Piece',42),
('hold-open-door-closer-80-kg-rose-gold','Hold Open Door Closer 80 Kg','door-closers',2480,3570,4.8,829,'Balaji Steelline','Rose Gold','Piece',47),
('door-closer-arm-bracket-spare-matte-black','Door Closer Arm Bracket Spare','door-closers',340,485,4.6,157,'Balaji Steelline','Matte Black','Piece',75),
('ss-curtain-bracket-heavy-single-rod-antique-brass','SS Curtain Bracket Heavy Single Rod','curtain-holders',240,370,4,410,'Balaji Gold','Antique Brass','Pair',88),
('ss-curtain-bracket-double-rod-chrome','SS Curtain Bracket Double Rod','curtain-holders',390,610,4.2,62,'Balaji Gold','Chrome','Pair',30),
('curtain-rod-1-inch-x-8-feet-ss-antique-brass','Curtain Rod 1 inch x 8 Feet SS','curtain-holders',860,1215,4.5,826,'Balaji Gold','Antique Brass','Piece',14),
('designer-crown-finial-set-antique-brass','Designer Crown Finial Set','curtain-holders',420,590,4.5,465,'Balaji Steelline','Antique Brass','Pair',43),
('curtain-rings-with-clip-pack-of-20-rose-gold','Curtain Rings with Clip - Pack of 20','curtain-holders',310,435,4.5,576,'Balaji Prime','Rose Gold','Pack',74),
('wall-mount-curtain-holder-antique-mirror-polish','Wall Mount Curtain Holder Antique','curtain-holders',520,775,4.4,54,'Balaji Gold','Mirror Polish','Pair',52),
('curtain-tie-back-hook-pair-antique-brass','Curtain Tie Back Hook Pair','curtain-holders',260,420,4.5,256,'Balaji Prime','Antique Brass','Pair',94),
('ceiling-mount-curtain-bracket-matte-black','Ceiling Mount Curtain Bracket','curtain-holders',330,470,4.7,548,'Balaji Prime','Matte Black','Pair',46),
('telescopic-curtain-rod-4-6-feet-matte-black','Telescopic Curtain Rod 4-6 Feet','curtain-holders',640,910,4.6,807,'Balaji Heavy Duty','Matte Black','Piece',15),
('mortise-lock-body-6-lever-with-keys-satin-ss','Mortise Lock Body 6 Lever with Keys','locks',890,1310,4.2,52,'Balaji Prime','Satin SS','Piece',50),
('brass-pin-cylinder-lock-both-side-key-matte-black','Brass Pin Cylinder Lock Both Side Key','locks',720,1160,4.5,596,'Balaji Prime','Matte Black','Piece',94),
('night-latch-rim-lock-ss-mirror-polish','Night Latch Rim Lock SS','locks',980,1430,4.1,291,'Balaji Heavy Duty','Mirror Polish','Piece',79),
('godrej-style-drawer-lock-22mm-matte-black','Godrej Style Drawer Lock 22mm','locks',240,380,4.4,714,'Balaji Gold','Matte Black','Piece',32),
('cupboard-multipurpose-lock-ss-antique-brass','Cupboard Multipurpose Lock SS','locks',310,470,4.5,766,'Balaji Gold','Antique Brass','Piece',54),
('heavy-duty-padlock-65mm-brass-rose-gold','Heavy Duty Padlock 65mm Brass','locks',560,885,4.3,803,'Balaji Heavy Duty','Rose Gold','Piece',91),
('digital-keyless-door-lock-matte-black','Digital Keyless Door Lock','locks',6450,10060,4.1,701,'Balaji Steelline','Matte Black','Piece',59),
('sliding-door-hook-lock-ss-chrome','Sliding Door Hook Lock SS','locks',420,635,4.5,276,'Balaji Prime','Chrome','Piece',24),
('main-door-mortise-handle-lock-set-matte-black','Main Door Mortise Handle Lock Set','locks',2790,4130,4.3,613,'Balaji Steelline','Matte Black','Piece',51),
('bathroom-thumb-turn-lock-set-matte-black','Bathroom Thumb Turn Lock Set','locks',640,900,4.5,376,'Balaji Prime','Matte Black','Piece',44),
('ss-tower-bolt-8-inch-heavy-mirror-polish','SS Tower Bolt 8 inch Heavy','bolts-aldrops',260,400,4.8,879,'Balaji Heavy Duty','Mirror Polish','Piece',57),
('ss-tower-bolt-12-inch-round-antique-brass','SS Tower Bolt 12 inch Round','bolts-aldrops',340,505,4.3,233,'Balaji Steelline','Antique Brass','Piece',51),
('ss-aldrop-12-inch-square-section-mirror-polish','SS Aldrop 12 inch Square Section','bolts-aldrops',690,1090,4.3,353,'Balaji Steelline','Mirror Polish','Piece',61),
('ss-aldrop-10-inch-round-heavy-mirror-polish','SS Aldrop 10 inch Round Heavy','bolts-aldrops',580,840,4,300,'Balaji Prime','Mirror Polish','Piece',48),
('ss-baby-latch-4-inch-rose-gold','SS Baby Latch 4 inch','bolts-aldrops',180,275,4.7,78,'Balaji Gold','Rose Gold','Piece',26),
('ss-hasp-staple-6-inch-antique-brass','SS Hasp & Staple 6 inch','bolts-aldrops',240,345,4.8,869,'Balaji Steelline','Antique Brass','Piece',17),
('ss-door-stopper-with-rubber-mirror-polish','SS Door Stopper with Rubber','bolts-aldrops',210,285,4.1,541,'Balaji Steelline','Mirror Polish','Piece',9),
('magnetic-door-catcher-heavy-rose-gold','Magnetic Door Catcher Heavy','bolts-aldrops',190,285,4.5,835,'Balaji Heavy Duty','Rose Gold','Piece',83),
('ss-gate-hook-eye-8-inch-matte-black','SS Gate Hook & Eye 8 inch','bolts-aldrops',160,225,4.6,757,'Balaji Steelline','Matte Black','Piece',45),
('designer-cabinet-knob-antique-brass-matte-black','Designer Cabinet Knob Antique Brass','knobs-pulls',110,150,4.3,893,'Balaji Steelline','Matte Black','Piece',11),
('ss-wardrobe-handle-6-inch-matte-black','SS Wardrobe Handle 6 inch','knobs-pulls',230,315,4.2,382,'Balaji Gold','Matte Black','Piece',70),
('matte-black-cabinet-pull-128mm-rose-gold','Matte Black Cabinet Pull 128mm','knobs-pulls',190,270,4.7,858,'Balaji Gold','Rose Gold','Piece',46),
('ceramic-print-drawer-knob-matte-black','Ceramic Print Drawer Knob','knobs-pulls',140,195,4.5,146,'Balaji Gold','Matte Black','Piece',44),
('aluminium-edge-profile-pull-3-feet-matte-black','Aluminium Edge Profile Pull 3 Feet','knobs-pulls',640,975,4.6,737,'Balaji Steelline','Matte Black','Piece',85),
('rose-gold-kitchen-cabinet-handle-8-inch-satin-ss','Rose Gold Kitchen Cabinet Handle 8 inch','knobs-pulls',320,475,4.3,733,'Balaji Steelline','Satin SS','Piece',51),
('concealed-gola-profile-handle-rose-gold','Concealed Gola Profile Handle','knobs-pulls',520,815,4.2,542,'Balaji Gold','Rose Gold','Piece',30),
('crystal-diamond-drawer-knob-rose-gold','Crystal Diamond Drawer Knob','knobs-pulls',170,275,4.6,437,'Balaji Steelline','Rose Gold','Piece',65),
('ss-zinc-alloy-mini-knob-pack-of-10-mirror-polish','SS Zinc Alloy Mini Knob Pack of 10','knobs-pulls',480,730,4.6,637,'Balaji Steelline','Mirror Polish','Pack',25),
('telescopic-drawer-channel-18-inch-rose-gold','Telescopic Drawer Channel 18 inch','drawer-channels',520,755,4,130,'Balaji Gold','Rose Gold','Pair',78),
('ball-bearing-slide-20-inch-soft-close-matte-black','Ball Bearing Slide 20 inch Soft Close','drawer-channels',890,1275,4.7,348,'Balaji Prime','Matte Black','Pair',76),
('two-way-drawer-channel-14-inch-rose-gold','Two Way Drawer Channel 14 inch','drawer-channels',340,465,4.2,812,'Balaji Prime','Rose Gold','Pair',70),
('push-to-open-undermount-slide-antique-brass','Push to Open Undermount Slide','drawer-channels',1180,1795,4.6,257,'Balaji Steelline','Antique Brass','Pair',25),
('heavy-duty-45mm-channel-24-inch-matte-black','Heavy Duty 45mm Channel 24 inch','drawer-channels',1240,1735,4.5,145,'Balaji Steelline','Matte Black','Pair',43),
('soft-close-tandem-box-set-500mm-antique-brass','Soft Close Tandem Box Set 500mm','drawer-channels',2380,3285,4.3,883,'Balaji Heavy Duty','Antique Brass','Set',11),
('keyboard-tray-channel-set-satin-ss','Keyboard Tray Channel Set','drawer-channels',460,620,4,300,'Balaji Prime','Satin SS','Pair',68),
('roller-drawer-slide-16-inch-economy-rose-gold','Roller Drawer Slide 16 inch Economy','drawer-channels',260,375,4.8,859,'Balaji Heavy Duty','Rose Gold','Pair',17),
('full-extension-channel-22-inch-matte-black','Full Extension Channel 22 inch','drawer-channels',780,1110,4.6,127,'Balaji Heavy Duty','Matte Black','Pair',45),
('ss-patch-fitting-top-bottom-set-satin-ss','SS Patch Fitting Top & Bottom Set','glass-fittings',1980,3030,4.7,638,'Balaji Gold','Satin SS','Set',56),
('spider-fitting-4-way-ss-304-satin-ss','Spider Fitting 4 Way SS 304','glass-fittings',2450,4020,4.8,259,'Balaji Heavy Duty','Satin SS','Piece',67),
('glass-door-d-pull-handle-24-inch-rose-gold','Glass Door D Pull Handle 24 inch','glass-fittings',1690,2720,4.5,486,'Balaji Gold','Rose Gold','Pair',64),
('shower-glass-hinge-90-degree-satin-ss','Shower Glass Hinge 90 Degree','glass-fittings',780,1170,4.5,675,'Balaji Heavy Duty','Satin SS','Piece',23),
('glass-to-glass-connector-ss-mirror-polish','Glass to Glass Connector SS','glass-fittings',420,680,4.6,227,'Balaji Heavy Duty','Mirror Polish','Piece',95),
('sliding-glass-door-roller-kit-antique-brass','Sliding Glass Door Roller Kit','glass-fittings',2280,3695,4.6,587,'Balaji Heavy Duty','Antique Brass','Set',65),
('glass-railing-baluster-ss-36-inch-antique-brass','Glass Railing Baluster SS 36 inch','glass-fittings',1890,2815,4.4,504,'Balaji Prime','Antique Brass','Piece',52),
('glass-shelf-bracket-pair-ss-rose-gold','Glass Shelf Bracket Pair SS','glass-fittings',340,490,4.8,239,'Balaji Heavy Duty','Rose Gold','Pair',17),
('patch-lock-with-strike-plate-antique-brass','Patch Lock with Strike Plate','glass-fittings',1450,2305,4.4,894,'Balaji Gold','Antique Brass','Piece',92),
('ss-self-tapping-screw-8x1-5-100-pcs-rose-gold','SS Self Tapping Screw 8x1.5 - 100 Pcs','screws-fasteners',210,305,4,500,'Balaji Prime','Rose Gold','Box',78),
('ss-csk-screw-10x2-inch-100-pcs-rose-gold','SS CSK Screw 10x2 inch - 100 Pcs','screws-fasteners',290,420,4.8,109,'Balaji Steelline','Rose Gold','Box',47),
('nylon-wall-plug-8mm-100-pcs-chrome','Nylon Wall Plug 8mm - 100 Pcs','screws-fasteners',120,180,4.5,475,'Balaji Heavy Duty','Chrome','Box',53),
('fischer-style-anchor-bolt-10mm-25-pcs-rose-gold','Fischer Style Anchor Bolt 10mm - 25 Pcs','screws-fasteners',480,655,4.1,611,'Balaji Heavy Duty','Rose Gold','Box',39),
('ss-hex-bolt-nut-m10-20-pcs-mirror-polish','SS Hex Bolt & Nut M10 - 20 Pcs','screws-fasteners',420,630,4.5,795,'Balaji Heavy Duty','Mirror Polish','Box',83),
('drywall-screw-6x1-inch-200-pcs-matte-black','Drywall Screw 6x1 inch - 200 Pcs','screws-fasteners',260,425,4.7,808,'Balaji Prime','Matte Black','Box',66),
('ss-washer-assorted-pack-chrome','SS Washer Assorted Pack','screws-fasteners',180,295,4.8,579,'Balaji Heavy Duty','Chrome','Pack',97),
('concrete-sleeve-anchor-12mm-10-pcs-chrome','Concrete Sleeve Anchor 12mm - 10 Pcs','screws-fasteners',520,850,4.7,318,'Balaji Gold','Chrome','Box',96),
('allen-cap-screw-m8-50-pcs-antique-brass','Allen Cap Screw M8 - 50 Pcs','screws-fasteners',390,595,4.7,728,'Balaji Prime','Antique Brass','Box',26),
('ss-towel-rod-24-inch-round-satin-ss','SS Towel Rod 24 inch Round','bath-accessories',690,1095,4.4,394,'Balaji Gold','Satin SS','Piece',62),
('ss-towel-rack-with-shelf-18-inch-satin-ss','SS Towel Rack with Shelf 18 inch','bath-accessories',1280,2020,4.3,493,'Balaji Steelline','Satin SS','Piece',31),
('ss-robe-hook-heavy-rose-gold','SS Robe Hook Heavy','bath-accessories',240,385,4.5,876,'Balaji Prime','Rose Gold','Piece',94),
('ss-soap-dish-with-bracket-rose-gold','SS Soap Dish with Bracket','bath-accessories',380,610,4.5,625,'Balaji Steelline','Rose Gold','Piece',63),
('ss-corner-shelf-bathroom-chrome','SS Corner Shelf Bathroom','bath-accessories',720,1020,4.6,757,'Balaji Steelline','Chrome','Piece',45),
('ss-toilet-paper-holder-antique-brass','SS Toilet Paper Holder','bath-accessories',420,605,4.8,829,'Balaji Steelline','Antique Brass','Piece',77),
('ss-napkin-ring-chrome-matte-black','SS Napkin Ring Chrome','bath-accessories',290,420,4.8,679,'Balaji Heavy Duty','Matte Black','Piece',77),
('ss-grab-bar-18-inch-chrome','SS Grab Bar 18 inch','bath-accessories',860,1300,4.5,536,'Balaji Prime','Chrome','Piece',54),
('ss-towel-ladder-rack-4-bar-matte-black','SS Towel Ladder Rack 4 Bar','bath-accessories',2450,3625,4.3,433,'Balaji Steelline','Matte Black','Piece',21),
('ss-pull-out-basket-21-x-20-inch-matte-black','SS Pull Out Basket 21 x 20 inch','kitchen-fittings',3480,5430,4.1,291,'Balaji Heavy Duty','Matte Black','Piece',59),
('ss-cutlery-basket-15-inch-satin-ss','SS Cutlery Basket 15 inch','kitchen-fittings',1980,3245,4.8,789,'Balaji Steelline','Satin SS','Piece',67),
('ss-plate-rack-pull-out-24-inch-mirror-polish','SS Plate Rack Pull Out 24 inch','kitchen-fittings',3980,6525,4.8,379,'Balaji Heavy Duty','Mirror Polish','Piece',97),
('corner-carousel-kitchen-unit-chrome','Corner Carousel Kitchen Unit','kitchen-fittings',6480,9265,4.7,678,'Balaji Gold','Chrome','Piece',16),
('lift-up-gas-spring-fitting-pair-satin-ss','Lift Up Gas Spring Fitting Pair','kitchen-fittings',640,1030,4.5,666,'Balaji Gold','Satin SS','Pair',64),
('ss-bottle-pull-out-basket-8-inch-mirror-polish','SS Bottle Pull Out Basket 8 inch','kitchen-fittings',2280,3670,4.5,706,'Balaji Gold','Mirror Polish','Piece',34),
('detergent-holder-pull-out-ss-satin-ss','Detergent Holder Pull Out SS','kitchen-fittings',1780,2830,4.4,514,'Balaji Gold','Satin SS','Piece',92),
('tandem-cutlery-organizer-tray-rose-gold','Tandem Cutlery Organizer Tray','kitchen-fittings',1450,2260,4.1,161,'Balaji Steelline','Rose Gold','Piece',29),
('ss-wicker-basket-18-inch-soft-close-matte-black','SS Wicker Basket 18 inch Soft Close','kitchen-fittings',4280,6590,4.8,139,'Balaji Heavy Duty','Matte Black','Piece',27)
) AS s(slug, base, cat, price, mrp, rating, reviews, brand, finish, unit, stock)
JOIN public.categories c ON c.slug = s.cat;