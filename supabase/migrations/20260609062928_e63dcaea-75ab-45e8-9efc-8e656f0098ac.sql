
CREATE TYPE public.shipment_status AS ENUM (
  'Booked','Picked Up','At Origin Airport','In Transit','At Destination Airport','Out for Delivery','Delivered'
);

CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  awb_number TEXT NOT NULL UNIQUE,
  shipment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  shipper_name TEXT NOT NULL,
  shipper_address TEXT NOT NULL,
  shipper_city TEXT NOT NULL,
  consignee_name TEXT NOT NULL,
  consignee_address TEXT NOT NULL,
  consignee_city TEXT NOT NULL,
  handling_info TEXT,
  cargo_description TEXT,
  length_cm NUMERIC,
  width_cm NUMERIC,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  said_to_contain TEXT,
  origin_airport TEXT NOT NULL,
  destination_airport TEXT NOT NULL,
  flight_number TEXT,
  airline TEXT,
  issuing_agent TEXT,
  current_status public.shipment_status NOT NULL DEFAULT 'Booked',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipments TO authenticated;
GRANT SELECT ON public.shipments TO anon;
GRANT ALL ON public.shipments TO service_role;

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can track shipments" ON public.shipments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated staff can insert shipments" ON public.shipments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated staff can update shipments" ON public.shipments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated staff can delete shipments" ON public.shipments FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_shipments_updated_at
BEFORE UPDATE ON public.shipments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_shipments_awb ON public.shipments(awb_number);
CREATE INDEX idx_shipments_updated_at ON public.shipments(updated_at DESC);
