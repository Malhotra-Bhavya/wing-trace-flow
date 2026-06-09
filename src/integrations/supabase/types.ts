export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          iata_code: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          iata_code?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          iata_code?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      airlines: {
        Row: {
          awb_prefix: string | null
          contact: string | null
          created_at: string
          iata_code: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          awb_prefix?: string | null
          contact?: string | null
          created_at?: string
          iata_code?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          awb_prefix?: string | null
          contact?: string | null
          created_at?: string
          iata_code?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      awb_stock: {
        Row: {
          airline_id: string | null
          created_at: string
          id: string
          notes: string | null
          prefix: string
          serial_from: number
          serial_to: number
          updated_at: string
        }
        Insert: {
          airline_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          prefix: string
          serial_from: number
          serial_to: number
          updated_at?: string
        }
        Update: {
          airline_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          prefix?: string
          serial_from?: number
          serial_to?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "awb_stock_airline_id_fkey"
            columns: ["airline_id"]
            isOneToOne: false
            referencedRelation: "airlines"
            referencedColumns: ["id"]
          },
        ]
      }
      awb_stock_numbers: {
        Row: {
          awb_number: string
          created_at: string
          id: string
          shipment_id: string | null
          status: string
          stock_id: string
          updated_at: string
          used_at: string | null
        }
        Insert: {
          awb_number: string
          created_at?: string
          id?: string
          shipment_id?: string | null
          status?: string
          stock_id: string
          updated_at?: string
          used_at?: string | null
        }
        Update: {
          awb_number?: string
          created_at?: string
          id?: string
          shipment_id?: string | null
          status?: string
          stock_id?: string
          updated_at?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "awb_stock_numbers_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "awb_stock_numbers_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "awb_stock"
            referencedColumns: ["id"]
          },
        ]
      }
      consignees: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          gstin: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      courier_consignments: {
        Row: {
          consignment_date: string
          consignment_no: string
          contents: string | null
          created_at: string
          created_by: string | null
          declared_value: number | null
          delivery_instructions: string | null
          id: string
          mode: string
          receiver_address: string | null
          receiver_name: string
          receiver_phone: string | null
          receiver_pincode: string | null
          sender_address: string | null
          sender_name: string
          sender_phone: string | null
          status: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          consignment_date?: string
          consignment_no: string
          contents?: string | null
          created_at?: string
          created_by?: string | null
          declared_value?: number | null
          delivery_instructions?: string | null
          id?: string
          mode?: string
          receiver_address?: string | null
          receiver_name: string
          receiver_phone?: string | null
          receiver_pincode?: string | null
          sender_address?: string | null
          sender_name: string
          sender_phone?: string | null
          status?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          consignment_date?: string
          consignment_no?: string
          contents?: string | null
          created_at?: string
          created_by?: string | null
          declared_value?: number | null
          delivery_instructions?: string | null
          id?: string
          mode?: string
          receiver_address?: string | null
          receiver_name?: string
          receiver_phone?: string | null
          receiver_pincode?: string | null
          sender_address?: string | null
          sender_name?: string
          sender_phone?: string | null
          status?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          created_at: string
          description: string
          expense_date: string
          id: string
          job_id: string
          notes: string | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          job_id: string
          notes?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          job_id?: string
          notes?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      fy_counters: {
        Row: {
          fy: string
          last_value: number
          prefix: string
        }
        Insert: {
          fy: string
          last_value?: number
          prefix: string
        }
        Update: {
          fy?: string
          last_value?: number
          prefix?: string
        }
        Relationships: []
      }
      invoice_lines: {
        Row: {
          amount: number
          description: string
          id: string
          invoice_id: string
          quantity: number
          rate: number
          sac_hsn: string | null
          sort_order: number
        }
        Insert: {
          amount?: number
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          rate?: number
          sac_hsn?: string | null
          sort_order?: number
        }
        Update: {
          amount?: number
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          rate?: number
          sac_hsn?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_in_words: string | null
          bill_to_address: string | null
          bill_to_city: string | null
          bill_to_gstin: string | null
          bill_to_name: string
          bill_to_state: string | null
          cgst: number
          created_at: string
          created_by: string | null
          gst_mode: string
          id: string
          igst: number
          invoice_date: string
          invoice_no: string
          job_id: string | null
          notes: string | null
          paid: boolean
          paid_at: string | null
          payment_terms: string | null
          reference_hawb: string | null
          sgst: number
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          amount_in_words?: string | null
          bill_to_address?: string | null
          bill_to_city?: string | null
          bill_to_gstin?: string | null
          bill_to_name: string
          bill_to_state?: string | null
          cgst?: number
          created_at?: string
          created_by?: string | null
          gst_mode?: string
          id?: string
          igst?: number
          invoice_date?: string
          invoice_no: string
          job_id?: string | null
          notes?: string | null
          paid?: boolean
          paid_at?: string | null
          payment_terms?: string | null
          reference_hawb?: string | null
          sgst?: number
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          amount_in_words?: string | null
          bill_to_address?: string | null
          bill_to_city?: string | null
          bill_to_gstin?: string | null
          bill_to_name?: string
          bill_to_state?: string | null
          cgst?: number
          created_at?: string
          created_by?: string | null
          gst_mode?: string
          id?: string
          igst?: number
          invoice_date?: string
          invoice_no?: string
          job_id?: string | null
          notes?: string | null
          paid?: boolean
          paid_at?: string | null
          payment_terms?: string | null
          reference_hawb?: string | null
          sgst?: number
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          agent_id: string | null
          airline_id: string | null
          consignee_id: string | null
          created_at: string
          created_by: string | null
          id: string
          invoice_status: string
          job_date: string
          job_no: string
          notes: string | null
          shipper_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          airline_id?: string | null
          consignee_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_status?: string
          job_date?: string
          job_no: string
          notes?: string | null
          shipper_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          airline_id?: string | null
          consignee_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_status?: string
          job_date?: string
          job_no?: string
          notes?: string | null
          shipper_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_airline_id_fkey"
            columns: ["airline_id"]
            isOneToOne: false
            referencedRelation: "airlines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_consignee_id_fkey"
            columns: ["consignee_id"]
            isOneToOne: false
            referencedRelation: "consignees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_shipper_id_fkey"
            columns: ["shipper_id"]
            isOneToOne: false
            referencedRelation: "shippers"
            referencedColumns: ["id"]
          },
        ]
      }
      mawbs: {
        Row: {
          airline_id: string | null
          airline_name: string | null
          created_at: string
          departure_date: string | null
          destination_airport: string | null
          flight_number: string | null
          id: string
          mawb_no: string
          notes: string | null
          origin_airport: string | null
          total_pieces: number | null
          total_weight: number | null
          updated_at: string
        }
        Insert: {
          airline_id?: string | null
          airline_name?: string | null
          created_at?: string
          departure_date?: string | null
          destination_airport?: string | null
          flight_number?: string | null
          id?: string
          mawb_no: string
          notes?: string | null
          origin_airport?: string | null
          total_pieces?: number | null
          total_weight?: number | null
          updated_at?: string
        }
        Update: {
          airline_id?: string | null
          airline_name?: string | null
          created_at?: string
          departure_date?: string | null
          destination_airport?: string | null
          flight_number?: string | null
          id?: string
          mawb_no?: string
          notes?: string | null
          origin_airport?: string | null
          total_pieces?: number | null
          total_weight?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mawbs_airline_id_fkey"
            columns: ["airline_id"]
            isOneToOne: false
            referencedRelation: "airlines"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_cards: {
        Row: {
          agent_id: string | null
          airline_id: string | null
          created_at: string
          documentation_flat: number
          fuel_surcharge_pct: number
          handling_flat: number
          id: string
          min_charge: number
          notes: string | null
          per_kg_rate: number
          security_per_kg: number
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          airline_id?: string | null
          created_at?: string
          documentation_flat?: number
          fuel_surcharge_pct?: number
          handling_flat?: number
          id?: string
          min_charge?: number
          notes?: string | null
          per_kg_rate?: number
          security_per_kg?: number
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          airline_id?: string | null
          created_at?: string
          documentation_flat?: number
          fuel_surcharge_pct?: number
          handling_flat?: number
          id?: string
          min_charge?: number
          notes?: string | null
          per_kg_rate?: number
          security_per_kg?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_cards_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_cards_airline_id_fkey"
            columns: ["airline_id"]
            isOneToOne: false
            referencedRelation: "airlines"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_status_events: {
        Row: {
          created_at: string
          created_by: string | null
          event_at: string
          id: string
          location: string | null
          remarks: string | null
          shipment_id: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_at?: string
          id?: string
          location?: string | null
          remarks?: string | null
          shipment_id: string
          status: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_at?: string
          id?: string
          location?: string | null
          remarks?: string | null
          shipment_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_status_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          airline: string | null
          awb_number: string
          cargo_description: string | null
          consignee_address: string
          consignee_city: string
          consignee_name: string
          created_at: string
          created_by: string | null
          current_status: Database["public"]["Enums"]["shipment_status"]
          destination_airport: string
          dgr_class_division: string | null
          dgr_gross_quantity: string | null
          dgr_net_quantity: string | null
          dgr_packing_group: string | null
          dgr_packing_instructions: string | null
          dgr_shipping_name: string | null
          dgr_un_number: string | null
          flight_number: string | null
          handling_info: string | null
          height_cm: number | null
          id: string
          is_dgr: boolean
          issuing_agent: string | null
          job_id: string | null
          length_cm: number | null
          mawb_id: string | null
          origin_airport: string
          pieces: number | null
          said_to_contain: string | null
          shipment_date: string
          shipper_address: string
          shipper_city: string
          shipper_name: string
          updated_at: string
          weight_kg: number | null
          width_cm: number | null
        }
        Insert: {
          airline?: string | null
          awb_number: string
          cargo_description?: string | null
          consignee_address: string
          consignee_city: string
          consignee_name: string
          created_at?: string
          created_by?: string | null
          current_status?: Database["public"]["Enums"]["shipment_status"]
          destination_airport: string
          dgr_class_division?: string | null
          dgr_gross_quantity?: string | null
          dgr_net_quantity?: string | null
          dgr_packing_group?: string | null
          dgr_packing_instructions?: string | null
          dgr_shipping_name?: string | null
          dgr_un_number?: string | null
          flight_number?: string | null
          handling_info?: string | null
          height_cm?: number | null
          id?: string
          is_dgr?: boolean
          issuing_agent?: string | null
          job_id?: string | null
          length_cm?: number | null
          mawb_id?: string | null
          origin_airport: string
          pieces?: number | null
          said_to_contain?: string | null
          shipment_date?: string
          shipper_address: string
          shipper_city: string
          shipper_name: string
          updated_at?: string
          weight_kg?: number | null
          width_cm?: number | null
        }
        Update: {
          airline?: string | null
          awb_number?: string
          cargo_description?: string | null
          consignee_address?: string
          consignee_city?: string
          consignee_name?: string
          created_at?: string
          created_by?: string | null
          current_status?: Database["public"]["Enums"]["shipment_status"]
          destination_airport?: string
          dgr_class_division?: string | null
          dgr_gross_quantity?: string | null
          dgr_net_quantity?: string | null
          dgr_packing_group?: string | null
          dgr_packing_instructions?: string | null
          dgr_shipping_name?: string | null
          dgr_un_number?: string | null
          flight_number?: string | null
          handling_info?: string | null
          height_cm?: number | null
          id?: string
          is_dgr?: boolean
          issuing_agent?: string | null
          job_id?: string | null
          length_cm?: number | null
          mawb_id?: string | null
          origin_airport?: string
          pieces?: number | null
          said_to_contain?: string | null
          shipment_date?: string
          shipper_address?: string
          shipper_city?: string
          shipper_name?: string
          updated_at?: string
          weight_kg?: number | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_mawb_id_fkey"
            columns: ["mawb_id"]
            isOneToOne: false
            referencedRelation: "mawbs"
            referencedColumns: ["id"]
          },
        ]
      }
      shippers: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          gstin: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_fy_label: { Args: never; Returns: string }
      format_fy_no: { Args: { _prefix: string; _val: number }; Returns: string }
      next_fy_seq: { Args: { _prefix: string }; Returns: number }
    }
    Enums: {
      shipment_status:
        | "Booked"
        | "Picked Up"
        | "At Origin Airport"
        | "In Transit"
        | "At Destination Airport"
        | "Out for Delivery"
        | "Delivered"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      shipment_status: [
        "Booked",
        "Picked Up",
        "At Origin Airport",
        "In Transit",
        "At Destination Airport",
        "Out for Delivery",
        "Delivered",
      ],
    },
  },
} as const
