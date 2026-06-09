
-- =========================================================
-- Helper: fiscal-year sequence per prefix
-- =========================================================
CREATE OR REPLACE FUNCTION public.current_fy_label()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN EXTRACT(MONTH FROM now() AT TIME ZONE 'Asia/Kolkata') >= 4
      THEN to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YY') || '-' ||
           to_char((now() AT TIME ZONE 'Asia/Kolkata') + interval '1 year', 'YY')
    ELSE
      to_char((now() AT TIME ZONE 'Asia/Kolkata') - interval '1 year', 'YY') || '-' ||
      to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YY')
  END;
$$;

CREATE TABLE IF NOT EXISTS public.fy_counters (
  prefix text NOT NULL,
  fy text NOT NULL,
  last_value bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (prefix, fy)
);
GRANT SELECT ON public.fy_counters TO authenticated;
GRANT ALL ON public.fy_counters TO service_role;
ALTER TABLE public.fy_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fy_counters readable to auth" ON public.fy_counters FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.next_fy_seq(_prefix text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _fy text := public.current_fy_label();
  _val bigint;
BEGIN
  INSERT INTO public.fy_counters (prefix, fy, last_value)
  VALUES (_prefix, _fy, 1)
  ON CONFLICT (prefix, fy)
  DO UPDATE SET last_value = public.fy_counters.last_value + 1
  RETURNING last_value INTO _val;
  RETURN _val;
END;
$$;

CREATE OR REPLACE FUNCTION public.format_fy_no(_prefix text, _val bigint)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT _prefix || '/' || public.current_fy_label() || '/' || lpad(_val::text, 5, '0');
$$;

-- =========================================================
-- Updated-at trigger (reuse if already present)
-- =========================================================
-- public.update_updated_at_column() already exists.

-- =========================================================
-- Party masters
-- =========================================================
CREATE TABLE public.shippers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  country text,
  phone text,
  email text,
  gstin text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shippers TO authenticated;
GRANT ALL ON public.shippers TO service_role;
ALTER TABLE public.shippers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage shippers" ON public.shippers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER set_updated_at_shippers BEFORE UPDATE ON public.shippers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.consignees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  country text,
  phone text,
  email text,
  gstin text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consignees TO authenticated;
GRANT ALL ON public.consignees TO service_role;
ALTER TABLE public.consignees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage consignees" ON public.consignees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER set_updated_at_consignees BEFORE UPDATE ON public.consignees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.airlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  iata_code text,
  awb_prefix text,
  contact text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.airlines TO authenticated;
GRANT ALL ON public.airlines TO service_role;
ALTER TABLE public.airlines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage airlines" ON public.airlines FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER set_updated_at_airlines BEFORE UPDATE ON public.airlines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  iata_code text,
  address text,
  city text,
  country text,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agents TO authenticated;
GRANT ALL ON public.agents TO service_role;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage agents" ON public.agents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER set_updated_at_agents BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- Jobs
-- =========================================================
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_no text UNIQUE NOT NULL,
  job_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'Open',
  invoice_status text NOT NULL DEFAULT 'Unbilled',
  shipper_id uuid REFERENCES public.shippers(id) ON DELETE SET NULL,
  consignee_id uuid REFERENCES public.consignees(id) ON DELETE SET NULL,
  airline_id uuid REFERENCES public.airlines(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage jobs" ON public.jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER set_updated_at_jobs BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.assign_job_no()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.job_no IS NULL OR NEW.job_no = '' THEN
    NEW.job_no := public.format_fy_no('MW', public.next_fy_seq('MW'));
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_assign_job_no BEFORE INSERT ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.assign_job_no();

-- =========================================================
-- MAWBs
-- =========================================================
CREATE TABLE public.mawbs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mawb_no text NOT NULL,
  airline_id uuid REFERENCES public.airlines(id) ON DELETE SET NULL,
  airline_name text,
  flight_number text,
  origin_airport text,
  destination_airport text,
  departure_date date,
  total_pieces integer,
  total_weight numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mawbs TO authenticated;
GRANT ALL ON public.mawbs TO service_role;
ALTER TABLE public.mawbs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage mawbs" ON public.mawbs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER set_updated_at_mawbs BEFORE UPDATE ON public.mawbs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- Extend shipments (HAWB) with job link, MAWB link, DGR fields
-- =========================================================
ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS mawb_id uuid REFERENCES public.mawbs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_dgr boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dgr_un_number text,
  ADD COLUMN IF NOT EXISTS dgr_shipping_name text,
  ADD COLUMN IF NOT EXISTS dgr_class_division text,
  ADD COLUMN IF NOT EXISTS dgr_packing_group text,
  ADD COLUMN IF NOT EXISTS dgr_net_quantity text,
  ADD COLUMN IF NOT EXISTS dgr_gross_quantity text,
  ADD COLUMN IF NOT EXISTS dgr_packing_instructions text,
  ADD COLUMN IF NOT EXISTS pieces integer;

CREATE INDEX IF NOT EXISTS shipments_job_id_idx ON public.shipments(job_id);
CREATE INDEX IF NOT EXISTS shipments_mawb_id_idx ON public.shipments(mawb_id);

-- =========================================================
-- Shipment status events (public-readable for tracking)
-- =========================================================
CREATE TABLE public.shipment_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  status text NOT NULL,
  event_at timestamptz NOT NULL DEFAULT now(),
  location text,
  remarks text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipment_status_events TO authenticated;
GRANT SELECT ON public.shipment_status_events TO anon;
GRANT ALL ON public.shipment_status_events TO service_role;
ALTER TABLE public.shipment_status_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon can read status events" ON public.shipment_status_events FOR SELECT USING (true);
CREATE POLICY "staff manage status events" ON public.shipment_status_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX shipment_status_events_shipment_idx ON public.shipment_status_events(shipment_id, event_at DESC);

-- =========================================================
-- Invoices
-- =========================================================
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no text UNIQUE NOT NULL,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  bill_to_name text NOT NULL,
  bill_to_address text,
  bill_to_city text,
  bill_to_state text,
  bill_to_gstin text,
  reference_hawb text,
  subtotal numeric NOT NULL DEFAULT 0,
  cgst numeric NOT NULL DEFAULT 0,
  sgst numeric NOT NULL DEFAULT 0,
  igst numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  gst_mode text NOT NULL DEFAULT 'cgst_sgst',
  amount_in_words text,
  payment_terms text,
  paid boolean NOT NULL DEFAULT false,
  paid_at timestamptz,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage invoices" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER set_updated_at_invoices BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.assign_invoice_no()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.invoice_no IS NULL OR NEW.invoice_no = '' THEN
    NEW.invoice_no := public.format_fy_no('MW/INV', public.next_fy_seq('MW/INV'));
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_assign_invoice_no BEFORE INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.assign_invoice_no();

CREATE TABLE public.invoice_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  sac_hsn text,
  quantity numeric NOT NULL DEFAULT 1,
  rate numeric NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_lines TO authenticated;
GRANT ALL ON public.invoice_lines TO service_role;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage invoice lines" ON public.invoice_lines FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX invoice_lines_invoice_idx ON public.invoice_lines(invoice_id);

-- =========================================================
-- Expenses
-- =========================================================
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  description text NOT NULL,
  vendor text,
  amount numeric NOT NULL DEFAULT 0,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage expenses" ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER set_updated_at_expenses BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- Rate cards
-- =========================================================
CREATE TABLE public.rate_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airline_id uuid REFERENCES public.airlines(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  per_kg_rate numeric NOT NULL DEFAULT 0,
  min_charge numeric NOT NULL DEFAULT 0,
  fuel_surcharge_pct numeric NOT NULL DEFAULT 0,
  security_per_kg numeric NOT NULL DEFAULT 0,
  handling_flat numeric NOT NULL DEFAULT 0,
  documentation_flat numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_cards TO authenticated;
GRANT ALL ON public.rate_cards TO service_role;
ALTER TABLE public.rate_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage rate cards" ON public.rate_cards FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER set_updated_at_rate_cards BEFORE UPDATE ON public.rate_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- AWB Stock
-- =========================================================
CREATE TABLE public.awb_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airline_id uuid REFERENCES public.airlines(id) ON DELETE CASCADE,
  prefix text NOT NULL,
  serial_from bigint NOT NULL,
  serial_to bigint NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.awb_stock TO authenticated;
GRANT ALL ON public.awb_stock TO service_role;
ALTER TABLE public.awb_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage awb stock" ON public.awb_stock FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER set_updated_at_awb_stock BEFORE UPDATE ON public.awb_stock FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.awb_stock_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id uuid NOT NULL REFERENCES public.awb_stock(id) ON DELETE CASCADE,
  awb_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'unused',
  shipment_id uuid REFERENCES public.shipments(id) ON DELETE SET NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.awb_stock_numbers TO authenticated;
GRANT ALL ON public.awb_stock_numbers TO service_role;
ALTER TABLE public.awb_stock_numbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage awb stock numbers" ON public.awb_stock_numbers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX awb_stock_numbers_stock_idx ON public.awb_stock_numbers(stock_id);
CREATE INDEX awb_stock_numbers_status_idx ON public.awb_stock_numbers(status);
CREATE TRIGGER set_updated_at_awb_stock_numbers BEFORE UPDATE ON public.awb_stock_numbers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- Courier consignments
-- =========================================================
CREATE TABLE public.courier_consignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consignment_no text UNIQUE NOT NULL,
  consignment_date date NOT NULL DEFAULT CURRENT_DATE,
  sender_name text NOT NULL,
  sender_address text,
  sender_phone text,
  receiver_name text NOT NULL,
  receiver_address text,
  receiver_phone text,
  receiver_pincode text,
  contents text,
  weight_kg numeric,
  declared_value numeric,
  mode text NOT NULL DEFAULT 'Air',
  delivery_instructions text,
  status text NOT NULL DEFAULT 'Booked',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courier_consignments TO authenticated;
GRANT SELECT ON public.courier_consignments TO anon;
GRANT ALL ON public.courier_consignments TO service_role;
ALTER TABLE public.courier_consignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon can track courier" ON public.courier_consignments FOR SELECT USING (true);
CREATE POLICY "staff manage courier" ON public.courier_consignments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER set_updated_at_courier BEFORE UPDATE ON public.courier_consignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.assign_consignment_no()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.consignment_no IS NULL OR NEW.consignment_no = '' THEN
    NEW.consignment_no := public.format_fy_no('MW/CN', public.next_fy_seq('MW/CN'));
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_assign_consignment_no BEFORE INSERT ON public.courier_consignments FOR EACH ROW EXECUTE FUNCTION public.assign_consignment_no();
