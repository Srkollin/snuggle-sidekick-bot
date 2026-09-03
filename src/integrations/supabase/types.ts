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
      clients: {
        Row: {
          account_holder: string | null
          address: string | null
          billing_address: string | null
          billing_city: string | null
          billing_postal_code: string | null
          billing_province: string | null
          billing_same: boolean
          city: string | null
          client_type: string
          collegiate_number: string | null
          company_id: string
          contact_person: string | null
          contact_role: string | null
          created_at: string
          created_by: string
          email: string | null
          iban: string | null
          id: string
          is_draft: boolean
          logo_path: string | null
          managed_communities: Json
          name: string
          notes: string | null
          payment_method: string | null
          phone: string | null
          phone_secondary: string | null
          postal_code: string | null
          province: string | null
          requires_invoice: boolean
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          account_holder?: string | null
          address?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_postal_code?: string | null
          billing_province?: string | null
          billing_same?: boolean
          city?: string | null
          client_type: string
          collegiate_number?: string | null
          company_id: string
          contact_person?: string | null
          contact_role?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          iban?: string | null
          id?: string
          is_draft?: boolean
          logo_path?: string | null
          managed_communities?: Json
          name: string
          notes?: string | null
          payment_method?: string | null
          phone?: string | null
          phone_secondary?: string | null
          postal_code?: string | null
          province?: string | null
          requires_invoice?: boolean
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          account_holder?: string | null
          address?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_postal_code?: string | null
          billing_province?: string | null
          billing_same?: boolean
          city?: string | null
          client_type?: string
          collegiate_number?: string | null
          company_id?: string
          contact_person?: string | null
          contact_role?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          iban?: string | null
          id?: string
          is_draft?: boolean
          logo_path?: string | null
          managed_communities?: Json
          name?: string
          notes?: string | null
          payment_method?: string | null
          phone?: string | null
          phone_secondary?: string | null
          postal_code?: string | null
          province?: string | null
          requires_invoice?: boolean
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          country: string
          created_at: string
          email: string | null
          employees_range: string | null
          id: string
          legal_name: string | null
          marketing_opt_in: boolean
          modules: Json
          owner_id: string
          phone: string | null
          postal_code: string | null
          province: string | null
          services: Json
          services_other: string | null
          tax_id: string | null
          trade_name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string
          created_at?: string
          email?: string | null
          employees_range?: string | null
          id?: string
          legal_name?: string | null
          marketing_opt_in?: boolean
          modules?: Json
          owner_id: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          services?: Json
          services_other?: string | null
          tax_id?: string | null
          trade_name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string
          created_at?: string
          email?: string | null
          employees_range?: string | null
          id?: string
          legal_name?: string | null
          marketing_opt_in?: boolean
          modules?: Json
          owner_id?: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          services?: Json
          services_other?: string | null
          tax_id?: string | null
          trade_name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      employee_invites: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          expires_at: string
          id: string
          is_active: boolean
          max_uses: number | null
          roles: Json
          roles_other: string | null
          token: string
          updated_at: string
          used_count: number
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          roles?: Json
          roles_other?: string | null
          token: string
          updated_at?: string
          used_count?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          roles?: Json
          roles_other?: string | null
          token?: string
          updated_at?: string
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_invites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          account_holder: string | null
          address: string | null
          approval_status: string
          ats_cert_path: string | null
          ats_expires_at: string | null
          ats_issued_at: string | null
          birth_date: string | null
          birth_place: string | null
          birth_province: string | null
          city: string | null
          company_id: string
          created_at: string
          education_level: string | null
          email: string | null
          father_name: string | null
          first_job_in_spain: boolean | null
          full_name: string
          has_ssn: boolean
          iban: string | null
          id: string
          id_back_path: string | null
          id_front_path: string | null
          invite_id: string | null
          lifeguard_cert_path: string | null
          lifeguard_expires_at: string | null
          lifeguard_issued_at: string | null
          marital_status: string | null
          mother_name: string | null
          national_id: string | null
          nationality: string | null
          pending_ssn: boolean
          phone: string | null
          photo_path: string | null
          postal_code: string | null
          roles: Json
          roles_other: string | null
          ssn: string | null
          technician_cert_path: string | null
          updated_at: string
          work_permit_path: string | null
          work_status: string
        }
        Insert: {
          account_holder?: string | null
          address?: string | null
          approval_status?: string
          ats_cert_path?: string | null
          ats_expires_at?: string | null
          ats_issued_at?: string | null
          birth_date?: string | null
          birth_place?: string | null
          birth_province?: string | null
          city?: string | null
          company_id: string
          created_at?: string
          education_level?: string | null
          email?: string | null
          father_name?: string | null
          first_job_in_spain?: boolean | null
          full_name: string
          has_ssn?: boolean
          iban?: string | null
          id?: string
          id_back_path?: string | null
          id_front_path?: string | null
          invite_id?: string | null
          lifeguard_cert_path?: string | null
          lifeguard_expires_at?: string | null
          lifeguard_issued_at?: string | null
          marital_status?: string | null
          mother_name?: string | null
          national_id?: string | null
          nationality?: string | null
          pending_ssn?: boolean
          phone?: string | null
          photo_path?: string | null
          postal_code?: string | null
          roles?: Json
          roles_other?: string | null
          ssn?: string | null
          technician_cert_path?: string | null
          updated_at?: string
          work_permit_path?: string | null
          work_status?: string
        }
        Update: {
          account_holder?: string | null
          address?: string | null
          approval_status?: string
          ats_cert_path?: string | null
          ats_expires_at?: string | null
          ats_issued_at?: string | null
          birth_date?: string | null
          birth_place?: string | null
          birth_province?: string | null
          city?: string | null
          company_id?: string
          created_at?: string
          education_level?: string | null
          email?: string | null
          father_name?: string | null
          first_job_in_spain?: boolean | null
          full_name?: string
          has_ssn?: boolean
          iban?: string | null
          id?: string
          id_back_path?: string | null
          id_front_path?: string | null
          invite_id?: string | null
          lifeguard_cert_path?: string | null
          lifeguard_expires_at?: string | null
          lifeguard_issued_at?: string | null
          marital_status?: string | null
          mother_name?: string | null
          national_id?: string | null
          nationality?: string | null
          pending_ssn?: boolean
          phone?: string | null
          photo_path?: string | null
          postal_code?: string | null
          roles?: Json
          roles_other?: string | null
          ssn?: string | null
          technician_cert_path?: string | null
          updated_at?: string
          work_permit_path?: string | null
          work_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "employee_invites"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_records: {
        Row: {
          aerobic_count: number | null
          alerts: Json
          bathers_count: number | null
          bromine_total: number | null
          combined_chlorine: number | null
          company_id: string
          control_type: string
          corrective_action: string | null
          created_at: string
          created_by: string
          disinfectant_type: string | null
          ecoli: string | null
          free_chlorine: number | null
          has_incident: boolean
          id: string
          incident_description: string | null
          incident_photo_path: string | null
          isocyanuric_acid: number | null
          lab_certificate_path: string | null
          legionella: number | null
          ph: number
          pool_id: string
          pseudomonas: string | null
          recirculation_hours: number | null
          record_date: string
          record_time: string
          redox: number | null
          reopening_time: string | null
          signed_at: string | null
          signed_by: string | null
          technician_name: string | null
          total_coliforms: number | null
          transparency: string | null
          turbidity: number
          updated_at: string
          vessel: string
          vessel_status: string
          water_meter: number | null
          water_temperature: number | null
        }
        Insert: {
          aerobic_count?: number | null
          alerts?: Json
          bathers_count?: number | null
          bromine_total?: number | null
          combined_chlorine?: number | null
          company_id: string
          control_type?: string
          corrective_action?: string | null
          created_at?: string
          created_by: string
          disinfectant_type?: string | null
          ecoli?: string | null
          free_chlorine?: number | null
          has_incident?: boolean
          id?: string
          incident_description?: string | null
          incident_photo_path?: string | null
          isocyanuric_acid?: number | null
          lab_certificate_path?: string | null
          legionella?: number | null
          ph: number
          pool_id: string
          pseudomonas?: string | null
          recirculation_hours?: number | null
          record_date: string
          record_time: string
          redox?: number | null
          reopening_time?: string | null
          signed_at?: string | null
          signed_by?: string | null
          technician_name?: string | null
          total_coliforms?: number | null
          transparency?: string | null
          turbidity: number
          updated_at?: string
          vessel?: string
          vessel_status?: string
          water_meter?: number | null
          water_temperature?: number | null
        }
        Update: {
          aerobic_count?: number | null
          alerts?: Json
          bathers_count?: number | null
          bromine_total?: number | null
          combined_chlorine?: number | null
          company_id?: string
          control_type?: string
          corrective_action?: string | null
          created_at?: string
          created_by?: string
          disinfectant_type?: string | null
          ecoli?: string | null
          free_chlorine?: number | null
          has_incident?: boolean
          id?: string
          incident_description?: string | null
          incident_photo_path?: string | null
          isocyanuric_acid?: number | null
          lab_certificate_path?: string | null
          legionella?: number | null
          ph?: number
          pool_id?: string
          pseudomonas?: string | null
          recirculation_hours?: number | null
          record_date?: string
          record_time?: string
          redox?: number | null
          reopening_time?: string | null
          signed_at?: string | null
          signed_by?: string | null
          technician_name?: string | null
          total_coliforms?: number | null
          transparency?: string | null
          turbidity?: number
          updated_at?: string
          vessel?: string
          vessel_status?: string
          water_meter?: number | null
          water_temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_records_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pools: {
        Row: {
          address: string | null
          client_id: string | null
          closing_date: string | null
          company_id: string
          created_at: string
          created_by: string
          doormen_count: number
          dosing_other: string | null
          dosing_type: string | null
          has_doorman: boolean
          has_kids_pool: boolean
          has_lifeguard: boolean
          id: string
          kids_dosing_other: string | null
          kids_dosing_type: string | null
          kids_name: string | null
          lifeguards_count: number
          name: string
          open_all_year: boolean
          opening_date: string | null
          other_staff: Json
          photo_path: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          client_id?: string | null
          closing_date?: string | null
          company_id: string
          created_at?: string
          created_by: string
          doormen_count?: number
          dosing_other?: string | null
          dosing_type?: string | null
          has_doorman?: boolean
          has_kids_pool?: boolean
          has_lifeguard?: boolean
          id?: string
          kids_dosing_other?: string | null
          kids_dosing_type?: string | null
          kids_name?: string | null
          lifeguards_count?: number
          name: string
          open_all_year?: boolean
          opening_date?: string | null
          other_staff?: Json
          photo_path?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          client_id?: string | null
          closing_date?: string | null
          company_id?: string
          created_at?: string
          created_by?: string
          doormen_count?: number
          dosing_other?: string | null
          dosing_type?: string | null
          has_doorman?: boolean
          has_kids_pool?: boolean
          has_lifeguard?: boolean
          id?: string
          kids_dosing_other?: string | null
          kids_dosing_type?: string | null
          kids_name?: string | null
          lifeguards_count?: number
          name?: string
          open_all_year?: boolean
          opening_date?: string | null
          other_staff?: Json
          photo_path?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pools_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pools_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role_title: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role_title?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role_title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
