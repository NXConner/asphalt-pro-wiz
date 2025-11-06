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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achieved_at: string | null
          description: string | null
          id: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          achieved_at?: string | null
          description?: string | null
          id?: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          achieved_at?: string | null
          description?: string | null
          id?: string
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_estimates: {
        Row: {
          areas_sqft: number
          created_at: string
          currency: string
          id: string
          items: Json
          job_id: string | null
          linear_ft: number
          region: string | null
          scope: string
          subtotal: number
          tax: number
          tax_rate: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          areas_sqft?: number
          created_at?: string
          currency?: string
          id?: string
          items?: Json
          job_id?: string | null
          linear_ft?: number
          region?: string | null
          scope?: string
          subtotal?: number
          tax?: number
          tax_rate?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          areas_sqft?: number
          created_at?: string
          currency?: string
          id?: string
          items?: Json
          job_id?: string | null
          linear_ft?: number
          region?: string | null
          scope?: string
          subtotal?: number
          tax?: number
          tax_rate?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_estimates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_jobs: {
        Row: {
          aoi: Json
          created_at: string
          created_by: string
          error: string | null
          id: string
          max_retries: number
          params: Json
          result: Json | null
          retries: number
          status: string
        }
        Insert: {
          aoi: Json
          created_at?: string
          created_by?: string
          error?: string | null
          id?: string
          max_retries?: number
          params: Json
          result?: Json | null
          retries?: number
          status?: string
        }
        Update: {
          aoi?: Json
          created_at?: string
          created_by?: string
          error?: string | null
          id?: string
          max_retries?: number
          params?: Json
          result?: Json | null
          retries?: number
          status?: string
        }
        Relationships: []
      }
      ai_site_analysis: {
        Row: {
          ai_notes: string | null
          analysis_type: string
          area_sqft: number | null
          area_sqm: number | null
          condition_score: number | null
          confidence_score: number | null
          created_at: string
          detected_boundaries: Json | null
          detected_issues: Json | null
          id: string
          image_url: string | null
          job_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_notes?: string | null
          analysis_type: string
          area_sqft?: number | null
          area_sqm?: number | null
          condition_score?: number | null
          confidence_score?: number | null
          created_at?: string
          detected_boundaries?: Json | null
          detected_issues?: Json | null
          id?: string
          image_url?: string | null
          job_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          ai_notes?: string | null
          analysis_type?: string
          area_sqft?: number | null
          area_sqm?: number | null
          condition_score?: number | null
          confidence_score?: number | null
          created_at?: string
          detected_boundaries?: Json | null
          detected_issues?: Json | null
          id?: string
          image_url?: string | null
          job_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_site_analysis_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          employee_id: string | null
          id: string
          is_read: boolean | null
          message: string
          severity: string | null
          title: string
          vehicle_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          employee_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          severity?: string | null
          title: string
          vehicle_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          employee_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          severity?: string | null
          title?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics: {
        Row: {
          created_at: string | null
          details: Json | null
          event: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_configs: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      app_usage_metrics: {
        Row: {
          action_type: string | null
          created_at: string | null
          device_id: string | null
          duration: number | null
          feature_name: string
          id: string
          metadata: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          action_type?: string | null
          created_at?: string | null
          device_id?: string | null
          duration?: number | null
          feature_name: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string | null
          created_at?: string | null
          device_id?: string | null
          duration?: number | null
          feature_name?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_usage_metrics_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "mobile_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_usage_metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mobile_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_assignments: {
        Row: {
          asset_id: string | null
          asset_type: string
          assigned_at: string | null
          assigned_to: string | null
          condition_in: string | null
          condition_out: string | null
          id: string
          job_id: string | null
          notes: string | null
          returned_at: string | null
        }
        Insert: {
          asset_id?: string | null
          asset_type: string
          assigned_at?: string | null
          assigned_to?: string | null
          condition_in?: string | null
          condition_out?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          returned_at?: string | null
        }
        Update: {
          asset_id?: string | null
          asset_type?: string
          assigned_at?: string | null
          assigned_to?: string | null
          condition_in?: string | null
          condition_out?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          returned_at?: string | null
        }
        Relationships: []
      }
      backups: {
        Row: {
          createdat: string | null
          description: string | null
          downloadurl: string | null
          id: string
          name: string | null
          recordcount: number | null
          size: number | null
          status: string | null
          tables: string[] | null
        }
        Insert: {
          createdat?: string | null
          description?: string | null
          downloadurl?: string | null
          id?: string
          name?: string | null
          recordcount?: number | null
          size?: number | null
          status?: string | null
          tables?: string[] | null
        }
        Update: {
          createdat?: string | null
          description?: string | null
          downloadurl?: string | null
          id?: string
          name?: string | null
          recordcount?: number | null
          size?: number | null
          status?: string | null
          tables?: string[] | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          awarded_at: string | null
          description: string | null
          id: string
          name: string | null
          user_id: string | null
        }
        Insert: {
          awarded_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
          user_id?: string | null
        }
        Update: {
          awarded_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blockchain_transactions: {
        Row: {
          block_number: number | null
          created_at: string | null
          created_by: string | null
          from_address: string
          gas_price: number | null
          gas_used: number | null
          id: string
          status: string | null
          to_address: string
          transaction_hash: string
          updated_at: string | null
          value: number | null
        }
        Insert: {
          block_number?: number | null
          created_at?: string | null
          created_by?: string | null
          from_address: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          status?: string | null
          to_address: string
          transaction_hash: string
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          block_number?: number | null
          created_at?: string | null
          created_by?: string | null
          from_address?: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          status?: string | null
          to_address?: string
          transaction_hash?: string
          updated_at?: string | null
          value?: number | null
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          state: Json
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          state: Json
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          state?: Json
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      budget_allocations: {
        Row: {
          allocated_amount: number
          category_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          job_id: string | null
          spent_amount: number | null
        }
        Insert: {
          allocated_amount: number
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          job_id?: string | null
          spent_amount?: number | null
        }
        Update: {
          allocated_amount?: number
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          job_id?: string | null
          spent_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_allocations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_categories: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      chart_of_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_subtype: string | null
          account_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
        }
        Insert: {
          account_code: string
          account_name: string
          account_subtype?: string | null
          account_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
        }
        Update: {
          account_code?: string
          account_name?: string
          account_subtype?: string | null
          account_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      clients: {
        Row: {
          contact: string | null
          created_at: string
          id: string
          name: string | null
          phone: string | null
          user_id: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          user_id?: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          billing_info: Json | null
          business_type: string | null
          contact_info: Json | null
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          registration_number: string | null
          settings: Json | null
          status: string | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_info?: Json | null
          business_type?: string | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          registration_number?: string | null
          settings?: Json | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_info?: Json | null
          business_type?: string | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          registration_number?: string | null
          settings?: Json | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      compliance_notifications: {
        Row: {
          acknowledged: boolean | null
          employee_id: string
          id: string
          message: string
          notification_type: string
          read_at: string | null
          rule_id: string | null
          sent_at: string | null
          task_id: string | null
          title: string
        }
        Insert: {
          acknowledged?: boolean | null
          employee_id: string
          id?: string
          message: string
          notification_type: string
          read_at?: string | null
          rule_id?: string | null
          sent_at?: string | null
          task_id?: string | null
          title: string
        }
        Update: {
          acknowledged?: boolean | null
          employee_id?: string
          id?: string
          message?: string
          notification_type?: string
          read_at?: string | null
          rule_id?: string | null
          sent_at?: string | null
          task_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_notifications_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "compliance_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_rules: {
        Row: {
          auto_enforce: boolean | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          point_deduction: number
          severity: string
          updated_at: string | null
        }
        Insert: {
          auto_enforce?: boolean | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          point_deduction?: number
          severity?: string
          updated_at?: string | null
        }
        Update: {
          auto_enforce?: boolean | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          point_deduction?: number
          severity?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      compliance_zones: {
        Row: {
          created_at: string | null
          geom: unknown
          id: string
          name: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          geom?: unknown
          id?: string
          name?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          geom?: unknown
          id?: string
          name?: string | null
          type?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          contract_url: string | null
          created_at: string | null
          customer: string | null
          id: string
          job_id: string | null
          signed: boolean | null
          signed_at: string | null
          signed_by: string | null
          template_id: string | null
          terms: Json | null
        }
        Insert: {
          contract_url?: string | null
          created_at?: string | null
          customer?: string | null
          id?: string
          job_id?: string | null
          signed?: boolean | null
          signed_at?: string | null
          signed_by?: string | null
          template_id?: string | null
          terms?: Json | null
        }
        Update: {
          contract_url?: string | null
          created_at?: string | null
          customer?: string | null
          id?: string
          job_id?: string | null
          signed?: boolean | null
          signed_at?: string | null
          signed_by?: string | null
          template_id?: string | null
          terms?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_catalog: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_default: boolean
          region: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: string
          is_default?: boolean
          region: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_default?: boolean
          region?: string
        }
        Relationships: []
      }
      cost_items: {
        Row: {
          catalog_id: string
          code: string
          created_at: string
          id: string
          material_type: string | null
          name: string
          notes: string | null
          unit: string
          unit_cost: number
        }
        Insert: {
          catalog_id: string
          code: string
          created_at?: string
          id?: string
          material_type?: string | null
          name: string
          notes?: string | null
          unit: string
          unit_cost: number
        }
        Update: {
          catalog_id?: string
          code?: string
          created_at?: string
          id?: string
          material_type?: string | null
          name?: string
          notes?: string | null
          unit?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "cost_items_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "cost_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_tracking: {
        Row: {
          created_at: string | null
          employee_id: string | null
          id: string
          negative_cost: number | null
          operational_cost: number | null
          period_end: string
          period_start: string
          period_type: string
          positive_cost: number | null
          project_cost: number | null
          project_id: string | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          negative_cost?: number | null
          operational_cost?: number | null
          period_end: string
          period_start: string
          period_type: string
          positive_cost?: number | null
          project_cost?: number | null
          project_id?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          negative_cost?: number | null
          operational_cost?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          positive_cost?: number | null
          project_cost?: number | null
          project_id?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_tracking_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_telemetry: {
        Row: {
          created_at: string
          crew_id: string
          event_type: string
          id: string
          location_lat: number | null
          location_lng: number | null
          metadata: Json | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          crew_id: string
          event_type: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          metadata?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          crew_id?: string
          event_type?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          metadata?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      custom_spatial_data: {
        Row: {
          description: string | null
          geom: unknown
          id: number
          name: string | null
          user_id: string | null
        }
        Insert: {
          description?: string | null
          geom?: unknown
          id?: never
          name?: string | null
          user_id?: string | null
        }
        Update: {
          description?: string | null
          geom?: unknown
          id?: never
          name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          billing_address: string | null
          company_name: string | null
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          customer_name: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          payment_terms: number | null
          phone: string | null
          shipping_address: string | null
          tax_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          billing_address?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          customer_name?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          payment_terms?: number | null
          phone?: string | null
          shipping_address?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          address?: string | null
          billing_address?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          customer_name?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          payment_terms?: number | null
          phone?: string | null
          shipping_address?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_activity_summary: {
        Row: {
          created_at: string
          date: string
          employee_id: string
          first_location_time: string | null
          id: string
          jobs_visited: number | null
          last_location_time: string | null
          locations_count: number | null
          path_geojson: Json | null
          total_distance_km: number | null
          total_time_minutes: number | null
        }
        Insert: {
          created_at?: string
          date: string
          employee_id: string
          first_location_time?: string | null
          id?: string
          jobs_visited?: number | null
          last_location_time?: string | null
          locations_count?: number | null
          path_geojson?: Json | null
          total_distance_km?: number | null
          total_time_minutes?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          employee_id?: string
          first_location_time?: string | null
          id?: string
          jobs_visited?: number | null
          last_location_time?: string | null
          locations_count?: number | null
          path_geojson?: Json | null
          total_distance_km?: number | null
          total_time_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_activity_summary_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_field_reports: {
        Row: {
          created_at: string
          created_by: string | null
          crew_members: string[] | null
          employee_id: string | null
          equipment_used: string[] | null
          hours_worked: number | null
          id: string
          issues_encountered: string | null
          job_id: string | null
          materials_used: Json | null
          progress_percentage: number | null
          report_date: string
          safety_notes: string | null
          temperature: number | null
          updated_at: string
          weather_conditions: string | null
          work_performed: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          crew_members?: string[] | null
          employee_id?: string | null
          equipment_used?: string[] | null
          hours_worked?: number | null
          id?: string
          issues_encountered?: string | null
          job_id?: string | null
          materials_used?: Json | null
          progress_percentage?: number | null
          report_date?: string
          safety_notes?: string | null
          temperature?: number | null
          updated_at?: string
          weather_conditions?: string | null
          work_performed: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          crew_members?: string[] | null
          employee_id?: string | null
          equipment_used?: string[] | null
          hours_worked?: number | null
          id?: string
          issues_encountered?: string | null
          job_id?: string | null
          materials_used?: Json | null
          progress_percentage?: number | null
          report_date?: string
          safety_notes?: string | null
          temperature?: number | null
          updated_at?: string
          weather_conditions?: string | null
          work_performed?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_field_reports_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_field_reports_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      debriefs: {
        Row: {
          content: string | null
          created_at: string
          date: string
          id: string
          title: string | null
          type: string
          user_id: string
          week_end: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          date: string
          id?: string
          title?: string | null
          type: string
          user_id: string
          week_end?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          date?: string
          id?: string
          title?: string | null
          type?: string
          user_id?: string
          week_end?: string | null
        }
        Relationships: []
      }
      device_usage_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          created_at: string | null
          id: string
          last_seen: string | null
          metadata: Json | null
          name: string
          status: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_seen?: string | null
          metadata?: Json | null
          name: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_seen?: string | null
          metadata?: Json | null
          name?: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devices_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "fleet_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplinary_actions: {
        Row: {
          action_type: string
          auto_generated: boolean | null
          created_at: string | null
          created_by: string | null
          description: string
          duration_days: number | null
          effective_date: string
          employee_id: string | null
          id: string
          violation_id: string | null
        }
        Insert: {
          action_type: string
          auto_generated?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description: string
          duration_days?: number | null
          effective_date?: string
          employee_id?: string | null
          id?: string
          violation_id?: string | null
        }
        Update: {
          action_type?: string
          auto_generated?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          duration_days?: number | null
          effective_date?: string
          employee_id?: string | null
          id?: string
          violation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disciplinary_actions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disciplinary_actions_violation_id_fkey"
            columns: ["violation_id"]
            isOneToOne: false
            referencedRelation: "employee_violations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_hashes: {
        Row: {
          blockchain_tx_id: string | null
          created_at: string | null
          created_by: string | null
          document_id: string | null
          hash: string
          id: string
          status: string | null
          version_id: string | null
        }
        Insert: {
          blockchain_tx_id?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          hash: string
          id?: string
          status?: string | null
          version_id?: string | null
        }
        Update: {
          blockchain_tx_id?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          hash?: string
          id?: string
          status?: string | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_hashes_blockchain_tx_id_fkey"
            columns: ["blockchain_tx_id"]
            isOneToOne: false
            referencedRelation: "blockchain_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_hashes_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_hashes_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_permissions: {
        Row: {
          created_at: string | null
          document_id: string | null
          id: string
          permission_level: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          id?: string
          permission_level?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          id?: string
          permission_level?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_permissions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          changes_description: string | null
          created_at: string | null
          created_by: string | null
          document_id: string | null
          file_path: string
          file_size: number
          id: string
          version: number
        }
        Insert: {
          changes_description?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          file_path: string
          file_size: number
          id?: string
          version: number
        }
        Update: {
          changes_description?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string | null
          file_path?: string
          file_size?: number
          id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          description: string | null
          file_path: string
          file_size: number
          file_type: string
          id: string
          owner_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          version: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_path: string
          file_size: number
          file_type: string
          id?: string
          owner_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          version?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          owner_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          version?: number
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          error_message: string | null
          from_email: string
          id: string
          sent_at: string | null
          status: string | null
          subject: string
          template_name: string | null
          to_email: string
        }
        Insert: {
          error_message?: string | null
          from_email: string
          id?: string
          sent_at?: string | null
          status?: string | null
          subject: string
          template_name?: string | null
          to_email: string
        }
        Update: {
          error_message?: string | null
          from_email?: string
          id?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_name?: string | null
          to_email?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          name: string
          subject: string
          variables: Json | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          name: string
          subject: string
          variables?: Json | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
          variables?: Json | null
        }
        Relationships: []
      }
      employee_certifications: {
        Row: {
          certificate_number: string | null
          employee_id: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuing_authority: string | null
          name: string | null
          status: string | null
        }
        Insert: {
          certificate_number?: string | null
          employee_id?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          name?: string | null
          status?: string | null
        }
        Update: {
          certificate_number?: string | null
          employee_id?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          name?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_certifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_compliance_scores: {
        Row: {
          created_at: string | null
          employee_id: string | null
          grade: string | null
          id: string
          period_end: string
          period_start: string
          score: number
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          grade?: string | null
          id?: string
          period_end: string
          period_start: string
          score?: number
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          grade?: string | null
          id?: string
          period_end?: string
          period_start?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_compliance_scores_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_contacts: {
        Row: {
          address: string | null
          city: string | null
          contact_name: string
          contact_type: string
          created_at: string | null
          email: string | null
          employee_id: string | null
          id: string
          is_primary: boolean | null
          phone_primary: string | null
          phone_secondary: string | null
          relationship: string | null
          state: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_name: string
          contact_type: string
          created_at?: string | null
          email?: string | null
          employee_id?: string | null
          id?: string
          is_primary?: boolean | null
          phone_primary?: string | null
          phone_secondary?: string | null
          relationship?: string | null
          state?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_name?: string
          contact_type?: string
          created_at?: string | null
          email?: string | null
          employee_id?: string | null
          id?: string
          is_primary?: boolean | null
          phone_primary?: string | null
          phone_secondary?: string | null
          relationship?: string | null
          state?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_contacts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_costs: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          created_by: string | null
          date_recorded: string
          description: string | null
          employee_id: string | null
          id: string
          project_id: string | null
          type: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          created_by?: string | null
          date_recorded?: string
          description?: string | null
          employee_id?: string | null
          id?: string
          project_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          created_by?: string | null
          date_recorded?: string
          description?: string | null
          employee_id?: string | null
          id?: string
          project_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_costs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          document_name: string | null
          document_type: string
          document_url: string | null
          employee_id: string | null
          expiry_date: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          is_verified: boolean | null
          mime_type: string | null
          notes: string | null
          upload_date: string | null
          uploaded_at: string | null
        }
        Insert: {
          document_name?: string | null
          document_type: string
          document_url?: string | null
          employee_id?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          upload_date?: string | null
          uploaded_at?: string | null
        }
        Update: {
          document_name?: string | null
          document_type?: string
          document_url?: string | null
          employee_id?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          upload_date?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_locations: {
        Row: {
          accuracy: number | null
          created_at: string | null
          employee_id: string
          heading: number | null
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          speed: number | null
          timestamp: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          employee_id: string
          heading?: number | null
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          speed?: number | null
          timestamp?: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          employee_id?: string
          heading?: number | null
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          speed?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_locations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_performance: {
        Row: {
          certifications_earned: string[] | null
          created_at: string | null
          employee_id: string | null
          goals_achieved: string[] | null
          goals_set: string[] | null
          id: string
          improvement_areas: string[] | null
          notes: string | null
          overall_score: number | null
          punctuality_score: number | null
          quality_score: number | null
          review_date: string | null
          review_period_end: string | null
          review_period_start: string | null
          reviewer_id: string | null
          safety_score: number | null
          strengths: string[] | null
          teamwork_score: number | null
          training_completed: string[] | null
        }
        Insert: {
          certifications_earned?: string[] | null
          created_at?: string | null
          employee_id?: string | null
          goals_achieved?: string[] | null
          goals_set?: string[] | null
          id?: string
          improvement_areas?: string[] | null
          notes?: string | null
          overall_score?: number | null
          punctuality_score?: number | null
          quality_score?: number | null
          review_date?: string | null
          review_period_end?: string | null
          review_period_start?: string | null
          reviewer_id?: string | null
          safety_score?: number | null
          strengths?: string[] | null
          teamwork_score?: number | null
          training_completed?: string[] | null
        }
        Update: {
          certifications_earned?: string[] | null
          created_at?: string | null
          employee_id?: string | null
          goals_achieved?: string[] | null
          goals_set?: string[] | null
          id?: string
          improvement_areas?: string[] | null
          notes?: string | null
          overall_score?: number | null
          punctuality_score?: number | null
          quality_score?: number | null
          review_date?: string | null
          review_period_end?: string | null
          review_period_start?: string | null
          reviewer_id?: string | null
          safety_score?: number | null
          strengths?: string[] | null
          teamwork_score?: number | null
          training_completed?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_performance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_scores: {
        Row: {
          created_at: string | null
          current_score: number | null
          employee_id: string
          id: string
          last_updated: string | null
          total_violations: number | null
        }
        Insert: {
          created_at?: string | null
          current_score?: number | null
          employee_id: string
          id?: string
          last_updated?: string | null
          total_violations?: number | null
        }
        Update: {
          created_at?: string | null
          current_score?: number | null
          employee_id?: string
          id?: string
          last_updated?: string | null
          total_violations?: number | null
        }
        Relationships: []
      }
      employee_status: {
        Row: {
          last_seen: string | null
          lat: number | null
          lng: number | null
          speed_kmh: number | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          last_seen?: string | null
          lat?: number | null
          lng?: number | null
          speed_kmh?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          last_seen?: string | null
          lat?: number | null
          lng?: number | null
          speed_kmh?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      employee_time_tracking: {
        Row: {
          break_end_time: string | null
          break_start_time: string | null
          clock_in_time: string
          clock_out_time: string | null
          created_at: string
          employee_id: number
          hourly_rate: number | null
          id: string
          location_data: Json | null
          status: string
          total_hours: number | null
          total_pay: number | null
          work_date: string
        }
        Insert: {
          break_end_time?: string | null
          break_start_time?: string | null
          clock_in_time: string
          clock_out_time?: string | null
          created_at?: string
          employee_id: number
          hourly_rate?: number | null
          id?: string
          location_data?: Json | null
          status?: string
          total_hours?: number | null
          total_pay?: number | null
          work_date: string
        }
        Update: {
          break_end_time?: string | null
          break_start_time?: string | null
          clock_in_time?: string
          clock_out_time?: string | null
          created_at?: string
          employee_id?: number
          hourly_rate?: number | null
          id?: string
          location_data?: Json | null
          status?: string
          total_hours?: number | null
          total_pay?: number | null
          work_date?: string
        }
        Relationships: []
      }
      employee_violations: {
        Row: {
          auto_generated: boolean | null
          created_at: string | null
          description: string | null
          employee_id: string
          id: string
          points_deducted: number
          resolved: boolean | null
          resolved_at: string | null
          rule_id: string | null
          violation_date: string | null
        }
        Insert: {
          auto_generated?: boolean | null
          created_at?: string | null
          description?: string | null
          employee_id: string
          id?: string
          points_deducted: number
          resolved?: boolean | null
          resolved_at?: string | null
          rule_id?: string | null
          violation_date?: string | null
        }
        Update: {
          auto_generated?: boolean | null
          created_at?: string | null
          description?: string | null
          employee_id?: string
          id?: string
          points_deducted?: number
          resolved?: boolean | null
          resolved_at?: string | null
          rule_id?: string | null
          violation_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_violations_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "compliance_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          age: number | null
          avatar_url: string | null
          birthday: string | null
          contract_signed: boolean | null
          created_at: string | null
          department: string | null
          driver_license_expiry: string | null
          driver_license_number: string | null
          email: string
          emergency_contact: string | null
          emergency_contact_name: string | null
          employment_status: string | null
          first_name: string
          handbook_received: boolean | null
          hire_date: string | null
          hourly_rate: number | null
          id: string
          last_name: string
          license_number: string | null
          notes: string | null
          performance_score: number | null
          phone: string | null
          role: string | null
          salary: number | null
          skills: string[] | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          w2_filed: boolean | null
          weekly_hours: number | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          avatar_url?: string | null
          birthday?: string | null
          contract_signed?: boolean | null
          created_at?: string | null
          department?: string | null
          driver_license_expiry?: string | null
          driver_license_number?: string | null
          email: string
          emergency_contact?: string | null
          emergency_contact_name?: string | null
          employment_status?: string | null
          first_name: string
          handbook_received?: boolean | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          last_name: string
          license_number?: string | null
          notes?: string | null
          performance_score?: number | null
          phone?: string | null
          role?: string | null
          salary?: number | null
          skills?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          w2_filed?: boolean | null
          weekly_hours?: number | null
        }
        Update: {
          address?: string | null
          age?: number | null
          avatar_url?: string | null
          birthday?: string | null
          contract_signed?: boolean | null
          created_at?: string | null
          department?: string | null
          driver_license_expiry?: string | null
          driver_license_number?: string | null
          email?: string
          emergency_contact?: string | null
          emergency_contact_name?: string | null
          employment_status?: string | null
          first_name?: string
          handbook_received?: boolean | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          last_name?: string
          license_number?: string | null
          notes?: string | null
          performance_score?: number | null
          phone?: string | null
          role?: string | null
          salary?: number | null
          skills?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          w2_filed?: boolean | null
          weekly_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          created_at: string | null
          id: string
          last_maintenance: string | null
          location: string | null
          model: string | null
          name: string
          next_maintenance: string | null
          purchase_date: string | null
          serial_number: string | null
          status: string | null
          type: string
          warranty_expiry: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_maintenance?: string | null
          location?: string | null
          model?: string | null
          name: string
          next_maintenance?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          type: string
          warranty_expiry?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_maintenance?: string | null
          location?: string | null
          model?: string | null
          name?: string
          next_maintenance?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          type?: string
          warranty_expiry?: string | null
        }
        Relationships: []
      }
      equipment_telemetry: {
        Row: {
          created_at: string
          equipment_id: string
          event_type: string
          fuel_level: number | null
          hours_used: number | null
          id: string
          location_lat: number | null
          location_lng: number | null
          metadata: Json | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          equipment_id: string
          event_type: string
          fuel_level?: number | null
          hours_used?: number | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          metadata?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          equipment_id?: string
          event_type?: string
          fuel_level?: number | null
          hours_used?: number | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          metadata?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      estimate_line_items: {
        Row: {
          cost_item_id: string | null
          created_at: string
          description: string | null
          estimate_id: string
          id: string
          item_code: string | null
          item_name: string
          line_total: number
          quantity: number
          unit: string
          unit_cost: number
        }
        Insert: {
          cost_item_id?: string | null
          created_at?: string
          description?: string | null
          estimate_id: string
          id?: string
          item_code?: string | null
          item_name: string
          line_total: number
          quantity: number
          unit: string
          unit_cost: number
        }
        Update: {
          cost_item_id?: string | null
          created_at?: string
          description?: string | null
          estimate_id?: string
          id?: string
          item_code?: string | null
          item_name?: string
          line_total?: number
          quantity?: number
          unit?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimate_line_items_cost_item_id_fkey"
            columns: ["cost_item_id"]
            isOneToOne: false
            referencedRelation: "cost_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_line_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          amount: number | null
          created_at: string | null
          created_by: string | null
          customer: string | null
          id: string
          job_id: string | null
          line_items: Json | null
          notes: string | null
          status: string | null
          valid_until: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          created_by?: string | null
          customer?: string | null
          id?: string
          job_id?: string | null
          line_items?: Json | null
          notes?: string | null
          status?: string | null
          valid_until?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          created_by?: string | null
          customer?: string | null
          id?: string
          job_id?: string | null
          line_items?: Json | null
          notes?: string | null
          status?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_category_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_category_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_category_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          created_by: string | null
          date: string | null
          description: string | null
          id: string
          job_id: string | null
          receipt_url: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          id?: string
          job_id?: string | null
          receipt_url?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          id?: string
          job_id?: string | null
          receipt_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      export_logs: {
        Row: {
          created_at: string
          error: string | null
          export_type: string
          id: string
          options: Json
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          export_type: string
          id?: string
          options: Json
          status: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          export_type?: string
          id?: string
          options?: Json
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      export_queue: {
        Row: {
          created_at: string
          created_by: string
          error: string | null
          export_type: string
          id: string
          max_retries: number
          options: Json
          result: Json | null
          retries: number
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          error?: string | null
          export_type: string
          id?: string
          max_retries?: number
          options: Json
          result?: Json | null
          retries?: number
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          error?: string | null
          export_type?: string
          id?: string
          max_retries?: number
          options?: Json
          result?: Json | null
          retries?: number
          status?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          rating: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          id: string
          metadata: Json | null
          name: string | null
          path: string | null
          size: number | null
          type: string | null
          uploadedat: string | null
          uploadedby: string | null
          url: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          name?: string | null
          path?: string | null
          size?: number | null
          type?: string | null
          uploadedat?: string | null
          uploadedby?: string | null
          url?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          name?: string | null
          path?: string | null
          size?: number | null
          type?: string | null
          uploadedat?: string | null
          uploadedby?: string | null
          url?: string | null
        }
        Relationships: []
      }
      fleet_assets: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          license_plate: string | null
          make: string | null
          model: string | null
          name: string
          registration_card_url: string | null
          registration_expiry: string | null
          type: string
          vin: string | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          name: string
          registration_card_url?: string | null
          registration_expiry?: string | null
          type: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          name?: string
          registration_card_url?: string | null
          registration_expiry?: string | null
          type?: string
          vin?: string | null
          year?: number | null
        }
        Relationships: []
      }
      fleet_assignments: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          start_date: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: []
      }
      fleet_vehicles: {
        Row: {
          created_at: string | null
          driver_id: string | null
          fuel_level: number | null
          id: string
          last_maintenance: string | null
          license_plate: string
          name: string
          next_maintenance: string | null
          odometer: number | null
          status: string | null
          type: string | null
          updated_at: string | null
          vin: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id?: string | null
          fuel_level?: number | null
          id?: string
          last_maintenance?: string | null
          license_plate: string
          name: string
          next_maintenance?: string | null
          odometer?: number | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          vin?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string | null
          fuel_level?: number | null
          id?: string
          last_maintenance?: string | null
          license_plate?: string
          name?: string
          next_maintenance?: string | null
          odometer?: number | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          vin?: string | null
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      geofences: {
        Row: {
          center_latitude: number
          center_longitude: number
          color: string | null
          created_at: string | null
          created_by: string | null
          enable_notifications: boolean | null
          id: string
          is_active: boolean | null
          name: string
          radius: number
          type: string | null
          updated_at: string | null
        }
        Insert: {
          center_latitude: number
          center_longitude: number
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          enable_notifications?: boolean | null
          id?: string
          is_active?: boolean | null
          name: string
          radius: number
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          center_latitude?: number
          center_longitude?: number
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          enable_notifications?: boolean | null
          id?: string
          is_active?: boolean | null
          name?: string
          radius?: number
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gps_locations: {
        Row: {
          accuracy: number
          altitude: number | null
          battery_level: number | null
          created_at: string | null
          device_id: string
          heading: number | null
          id: string
          latitude: number
          longitude: number
          signal_strength: number | null
          speed: number | null
          timestamp: string
        }
        Insert: {
          accuracy: number
          altitude?: number | null
          battery_level?: number | null
          created_at?: string | null
          device_id: string
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          signal_strength?: number | null
          speed?: number | null
          timestamp: string
        }
        Update: {
          accuracy?: number
          altitude?: number | null
          battery_level?: number | null
          created_at?: string | null
          device_id?: string
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          signal_strength?: number | null
          speed?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "gps_locations_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      gps_points: {
        Row: {
          accuracy_m: number | null
          captured_at: string
          created_at: string
          heading: number | null
          id: string
          is_stationary: boolean | null
          lat: number
          lng: number
          source: string | null
          speed_kmh: number | null
          user_id: string
        }
        Insert: {
          accuracy_m?: number | null
          captured_at?: string
          created_at?: string
          heading?: number | null
          id?: string
          is_stationary?: boolean | null
          lat: number
          lng: number
          source?: string | null
          speed_kmh?: number | null
          user_id: string
        }
        Update: {
          accuracy_m?: number | null
          captured_at?: string
          created_at?: string
          heading?: number | null
          id?: string
          is_stationary?: boolean | null
          lat?: number
          lng?: number
          source?: string | null
          speed_kmh?: number | null
          user_id?: string
        }
        Relationships: []
      }
      inspection_checklists: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          template: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          template?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          template?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_checklists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_results: {
        Row: {
          answers: Json | null
          checklist_id: string | null
          completed_at: string | null
          id: string
          job_id: string | null
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          checklist_id?: string | null
          completed_at?: string | null
          id?: string
          job_id?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          checklist_id?: string | null
          completed_at?: string | null
          id?: string
          job_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_results_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "inspection_checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      installed_apps: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_installed: boolean
          launch_data: Json | null
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id: string
          is_installed?: boolean
          launch_data?: Json | null
          title?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_installed?: boolean
          launch_data?: Json | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          name: string
          quantity: number | null
          sku: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: string | null
          name: string
          quantity?: number | null
          sku?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
          quantity?: number | null
          sku?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          job_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          job_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          job_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          employee_id: string | null
          file_name: string | null
          file_path: string | null
          id: string
          job_id: string | null
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          photo_type: string | null
          taken_at: string | null
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          employee_id?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          job_id?: string | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          photo_type?: string | null
          taken_at?: string | null
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          employee_id?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          job_id?: string | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          photo_type?: string | null
          taken_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      job_sites: {
        Row: {
          address: string
          area: number | null
          crack_length: number | null
          created_at: string | null
          id: string
          labor_cost: number | null
          latitude: number | null
          longitude: number | null
          materials_cost: number | null
          name: string
          notes: string | null
          polygon_coords: Json | null
          profit_margin: number | null
          schedule_date: string | null
          status: string
          total_price: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          area?: number | null
          crack_length?: number | null
          created_at?: string | null
          id?: string
          labor_cost?: number | null
          latitude?: number | null
          longitude?: number | null
          materials_cost?: number | null
          name: string
          notes?: string | null
          polygon_coords?: Json | null
          profit_margin?: number | null
          schedule_date?: string | null
          status?: string
          total_price?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          area?: number | null
          crack_length?: number | null
          created_at?: string | null
          id?: string
          labor_cost?: number | null
          latitude?: number | null
          longitude?: number | null
          materials_cost?: number | null
          name?: string
          notes?: string | null
          polygon_coords?: Json | null
          profit_margin?: number | null
          schedule_date?: string | null
          status?: string
          total_price?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      job_telemetry: {
        Row: {
          area_sqft: number | null
          created_at: string
          customer_address: string | null
          event_type: string
          id: string
          job_id: string
          location_lat: number | null
          location_lng: number | null
          metadata: Json | null
          quote_value: number | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          area_sqft?: number | null
          created_at?: string
          customer_address?: string | null
          event_type: string
          id?: string
          job_id: string
          location_lat?: number | null
          location_lng?: number | null
          metadata?: Json | null
          quote_value?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          area_sqft?: number | null
          created_at?: string
          customer_address?: string | null
          event_type?: string
          id?: string
          job_id?: string
          location_lat?: number | null
          location_lng?: number | null
          metadata?: Json | null
          quote_value?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          completed_date: string | null
          created_at: string | null
          crew_size_required: number | null
          customer_id: string | null
          description: string | null
          end_date: string | null
          equipment_needed: string[] | null
          estimated_duration: unknown
          final_value: number | null
          id: string
          latitude: number | null
          location_address: string | null
          longitude: number | null
          priority: string | null
          progress: number | null
          quote_value: number | null
          start_date: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          completed_date?: string | null
          created_at?: string | null
          crew_size_required?: number | null
          customer_id?: string | null
          description?: string | null
          end_date?: string | null
          equipment_needed?: string[] | null
          estimated_duration?: unknown
          final_value?: number | null
          id?: string
          latitude?: number | null
          location_address?: string | null
          longitude?: number | null
          priority?: string | null
          progress?: number | null
          quote_value?: number | null
          start_date?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          completed_date?: string | null
          created_at?: string | null
          crew_size_required?: number | null
          customer_id?: string | null
          description?: string | null
          end_date?: string | null
          equipment_needed?: string[] | null
          estimated_duration?: unknown
          final_value?: number | null
          id?: string
          latitude?: number | null
          location_address?: string | null
          longitude?: number | null
          priority?: string | null
          progress?: number | null
          quote_value?: number | null
          start_date?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban: {
        Row: {
          column_id: string | null
          content: string | null
          created_at: string
          id: string
          job_id: string | null
          user_id: string
        }
        Insert: {
          column_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          user_id?: string
        }
        Update: {
          column_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard: {
        Row: {
          last_updated: string | null
          points: number | null
          user_id: string
        }
        Insert: {
          last_updated?: string | null
          points?: number | null
          user_id: string
        }
        Update: {
          last_updated?: string | null
          points?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger: {
        Row: {
          amount: number | null
          created_at: string
          date: string | null
          id: string
          job_id: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          date?: string | null
          id?: string
          job_id?: string | null
          type?: string | null
          user_id?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          date?: string | null
          id?: string
          job_id?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      location_tracking: {
        Row: {
          accuracy: number | null
          employee_id: string | null
          heading: number | null
          id: string
          inside_geofence: boolean | null
          is_driving: boolean | null
          latitude: number
          longitude: number
          speed: number | null
          timestamp: string | null
          vehicle_id: string | null
        }
        Insert: {
          accuracy?: number | null
          employee_id?: string | null
          heading?: number | null
          id?: string
          inside_geofence?: boolean | null
          is_driving?: boolean | null
          latitude: number
          longitude: number
          speed?: number | null
          timestamp?: string | null
          vehicle_id?: string | null
        }
        Update: {
          accuracy?: number | null
          employee_id?: string | null
          heading?: number | null
          id?: string
          inside_geofence?: boolean | null
          is_driving?: boolean | null
          latitude?: number
          longitude?: number
          speed?: number | null
          timestamp?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_tracking_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_tracking_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          coordinates: unknown
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          coordinates?: unknown
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          coordinates?: unknown
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      maintenance_logs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          performed_at: string | null
          performed_by: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          performed_at?: string | null
          performed_by?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          performed_at?: string | null
          performed_by?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          asset_id: string
          created_at: string | null
          filter_notes: string | null
          id: string
          maintenance_notes: string | null
          oil_change_date: string | null
          oil_filter_change_date: string | null
          oil_filter_number: string | null
          oil_quantity: number | null
          oil_type: string | null
          oil_weight: string | null
          plug_size: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          filter_notes?: string | null
          id?: string
          maintenance_notes?: string | null
          oil_change_date?: string | null
          oil_filter_change_date?: string | null
          oil_filter_number?: string | null
          oil_quantity?: number | null
          oil_type?: string | null
          oil_weight?: string | null
          plug_size?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          filter_notes?: string | null
          id?: string
          maintenance_notes?: string | null
          oil_change_date?: string | null
          oil_filter_change_date?: string | null
          oil_filter_number?: string | null
          oil_quantity?: number | null
          oil_type?: string | null
          oil_weight?: string | null
          plug_size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "fleet_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      map_drawings: {
        Row: {
          coordinates: Json
          created_at: string | null
          drawing_type: string
          id: string
          properties: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coordinates: Json
          created_at?: string | null
          drawing_type: string
          id?: string
          properties?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          coordinates?: Json
          created_at?: string | null
          drawing_type?: string
          id?: string
          properties?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      Mapmeasurements: {
        Row: {
          created_at: string
          geojson: Json | null
          id: string
          job_id: string | null
          type: string | null
          unit: string | null
          value: number | null
        }
        Insert: {
          created_at?: string
          geojson?: Json | null
          id?: string
          job_id?: string | null
          type?: string | null
          unit?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string
          geojson?: Json | null
          id?: string
          job_id?: string | null
          type?: string | null
          unit?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Mapmeasurements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      measurements: {
        Row: {
          created_at: string
          geojson: Json | null
          id: string
          job_id: string | null
          type: string | null
          unit: string | null
          value: number | null
        }
        Insert: {
          created_at?: string
          geojson?: Json | null
          id?: string
          job_id?: string | null
          type?: string | null
          unit?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string
          geojson?: Json | null
          id?: string
          job_id?: string | null
          type?: string | null
          unit?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "measurements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      "measurements on map": {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      mobile_app_errors: {
        Row: {
          app_version: string | null
          created_at: string | null
          device_id: string | null
          error_message: string
          error_type: string
          id: string
          metadata: Json | null
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          created_at?: string | null
          device_id?: string | null
          error_message: string
          error_type: string
          id?: string
          metadata?: Json | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          created_at?: string | null
          device_id?: string | null
          error_message?: string
          error_type?: string
          id?: string
          metadata?: Json | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobile_app_errors_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "mobile_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_devices: {
        Row: {
          app_version: string | null
          created_at: string | null
          device_id: string
          device_token: string | null
          device_type: string | null
          id: string
          last_login: string | null
          model: string | null
          os_version: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          created_at?: string | null
          device_id: string
          device_token?: string | null
          device_type?: string | null
          id?: string
          last_login?: string | null
          model?: string | null
          os_version?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          created_at?: string | null
          device_id?: string
          device_token?: string | null
          device_type?: string | null
          id?: string
          last_login?: string | null
          model?: string | null
          os_version?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      mobile_notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          device_id: string | null
          id: string
          read_at: string | null
          sent_at: string | null
          status: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          device_id?: string | null
          id?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          device_id?: string | null
          id?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobile_notifications_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "mobile_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_sessions: {
        Row: {
          created_at: string | null
          device_id: string | null
          duration: number | null
          end_time: string | null
          id: string
          ip_address: string | null
          location: Json | null
          session_token: string
          start_time: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          ip_address?: string | null
          location?: Json | null
          session_token: string
          start_time: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          ip_address?: string | null
          location?: Json | null
          session_token?: string
          start_time?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobile_sessions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "mobile_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_date: string | null
          proposal_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_date?: string | null
          proposal_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_date?: string | null
          proposal_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll: {
        Row: {
          created_at: string
          employee_id: number
          federal_tax: number
          gross_pay: number
          id: string
          medicare: number
          net_pay: number
          other_deductions: number
          overtime_hours: number
          pay_date: string
          pay_period_end: string
          pay_period_start: string
          regular_hours: number
          social_security: number
          state_tax: number
          status: string
        }
        Insert: {
          created_at?: string
          employee_id: number
          federal_tax?: number
          gross_pay?: number
          id?: string
          medicare?: number
          net_pay?: number
          other_deductions?: number
          overtime_hours?: number
          pay_date: string
          pay_period_end: string
          pay_period_start: string
          regular_hours?: number
          social_security?: number
          state_tax?: number
          status?: string
        }
        Update: {
          created_at?: string
          employee_id?: number
          federal_tax?: number
          gross_pay?: number
          id?: string
          medicare?: number
          net_pay?: number
          other_deductions?: number
          overtime_hours?: number
          pay_date?: string
          pay_period_end?: string
          pay_period_start?: string
          regular_hours?: number
          social_security?: number
          state_tax?: number
          status?: string
        }
        Relationships: []
      }
      payroll_records: {
        Row: {
          created_at: string | null
          gross_amount: number | null
          id: string
          net_amount: number | null
          pay_period_end: string | null
          pay_period_start: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          gross_amount?: number | null
          id?: string
          net_amount?: number | null
          pay_period_end?: string | null
          pay_period_start?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          gross_amount?: number | null
          id?: string
          net_amount?: number | null
          pay_period_end?: string | null
          pay_period_start?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_reviews: {
        Row: {
          areas_for_improvement: string[] | null
          comments: string | null
          communication: number | null
          employee_id: string | null
          goals: string[] | null
          id: string
          overall_rating: number | null
          productivity: number | null
          quality_of_work: number | null
          reliability: number | null
          review_date: string | null
          review_period_end: string | null
          review_period_start: string | null
          reviewer_id: string | null
          strengths: string[] | null
          teamwork: number | null
        }
        Insert: {
          areas_for_improvement?: string[] | null
          comments?: string | null
          communication?: number | null
          employee_id?: string | null
          goals?: string[] | null
          id?: string
          overall_rating?: number | null
          productivity?: number | null
          quality_of_work?: number | null
          reliability?: number | null
          review_date?: string | null
          review_period_end?: string | null
          review_period_start?: string | null
          reviewer_id?: string | null
          strengths?: string[] | null
          teamwork?: number | null
        }
        Update: {
          areas_for_improvement?: string[] | null
          comments?: string | null
          communication?: number | null
          employee_id?: string | null
          goals?: string[] | null
          id?: string
          overall_rating?: number | null
          productivity?: number | null
          quality_of_work?: number | null
          reliability?: number | null
          review_date?: string | null
          review_period_end?: string | null
          review_period_start?: string | null
          reviewer_id?: string | null
          strengths?: string[] | null
          teamwork?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          contract_signed: boolean | null
          contract_signed_date: string | null
          created_at: string | null
          driver_license_url: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          first_name: string | null
          full_name: string | null
          hire_date: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          contract_signed?: boolean | null
          contract_signed_date?: string | null
          created_at?: string | null
          driver_license_url?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name?: string | null
          full_name?: string | null
          hire_date?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          contract_signed?: boolean | null
          contract_signed_date?: string | null
          created_at?: string | null
          driver_license_url?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name?: string | null
          full_name?: string | null
          hire_date?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          username?: string | null
        }
        Relationships: []
      }
      project_calculations: {
        Row: {
          calculation_type: string
          created_at: string
          id: string
          inputs: Json
          project_id: string | null
          results: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          calculation_type: string
          created_at?: string
          id?: string
          inputs: Json
          project_id?: string | null
          results: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          calculation_type?: string
          created_at?: string
          id?: string
          inputs?: Json
          project_id?: string | null
          results?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_documents: {
        Row: {
          id: string
          name: string | null
          project_id: string | null
          size: number | null
          type: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          url: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          project_id?: string | null
          size?: number | null
          type?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          url?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          project_id?: string | null
          size?: number | null
          type?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          completed_date: string | null
          description: string | null
          id: string
          project_id: string | null
          status: string | null
          target_date: string | null
          tasks: string[] | null
          title: string | null
        }
        Insert: {
          completed_date?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          target_date?: string | null
          tasks?: string[] | null
          title?: string | null
        }
        Update: {
          completed_date?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          target_date?: string | null
          tasks?: string[] | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          completed_date: string | null
          dependencies: string[] | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          priority: string | null
          progress: number | null
          project_id: string | null
          project_name: string | null
          start_date: string | null
          status: string | null
          title: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string | null
          progress?: number | null
          project_id?: string | null
          project_name?: string | null
          start_date?: string | null
          status?: string | null
          title?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string | null
          progress?: number | null
          project_id?: string | null
          project_name?: string | null
          start_date?: string | null
          status?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_cost: number | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          description: string | null
          end_date: string | null
          estimated_cost: number | null
          id: string
          name: string
          project_type: Database["public"]["Enums"]["project_type"] | null
          site_address: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          end_date?: string | null
          estimated_cost?: number | null
          id?: string
          name: string
          project_type?: Database["public"]["Enums"]["project_type"] | null
          site_address?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          end_date?: string | null
          estimated_cost?: number | null
          id?: string
          name?: string
          project_type?: Database["public"]["Enums"]["project_type"] | null
          site_address?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          acreage: number | null
          id: string
          latitude: number | null
          longitude: number | null
          owner_name: string | null
          parcel_id: string
          property_address: string | null
          tax_value: number | null
          zoning: string | null
        }
        Insert: {
          acreage?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          owner_name?: string | null
          parcel_id: string
          property_address?: string | null
          tax_value?: number | null
          zoning?: string | null
        }
        Update: {
          acreage?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          owner_name?: string | null
          parcel_id?: string
          property_address?: string | null
          tax_value?: number | null
          zoning?: string | null
        }
        Relationships: []
      }
      property_assessments: {
        Row: {
          assessment_year: number | null
          exemptions: string | null
          id: string
          improvement_value: number | null
          land_value: number | null
          property_id: string
          taxable_value: number | null
          total_value: number | null
        }
        Insert: {
          assessment_year?: number | null
          exemptions?: string | null
          id?: string
          improvement_value?: number | null
          land_value?: number | null
          property_id: string
          taxable_value?: number | null
          total_value?: number | null
        }
        Update: {
          assessment_year?: number | null
          exemptions?: string | null
          id?: string
          improvement_value?: number | null
          land_value?: number | null
          property_id?: string
          taxable_value?: number | null
          total_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_assessments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_sales: {
        Row: {
          buyer_name: string | null
          deed_book: string | null
          deed_page: string | null
          id: string
          property_id: string
          sale_date: string | null
          sale_price: number | null
          seller_name: string | null
        }
        Insert: {
          buyer_name?: string | null
          deed_book?: string | null
          deed_page?: string | null
          id?: string
          property_id: string
          sale_date?: string | null
          sale_price?: number | null
          seller_name?: string | null
        }
        Update: {
          buyer_name?: string | null
          deed_book?: string | null
          deed_page?: string | null
          id?: string
          property_id?: string
          sale_date?: string | null
          sale_price?: number | null
          seller_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_sales_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_utilities: {
        Row: {
          id: string
          property_id: string
          utility_name: string
        }
        Insert: {
          id?: string
          property_id: string
          utility_name: string
        }
        Update: {
          id?: string
          property_id?: string
          utility_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_utilities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          amount: number
          client_name: string
          created_at: string | null
          created_by: string | null
          id: string
          project_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          client_name: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_name?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      quickbooks_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: string
          realm_id: string
          refresh_expires_at: string
          refresh_token: string
          token_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: string
          realm_id: string
          refresh_expires_at: string
          refresh_token: string
          token_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          realm_id?: string
          refresh_expires_at?: string
          refresh_token?: string
          token_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          count: number
          created_at: string
          id: string
          identifier: string
          window_start: string
        }
        Insert: {
          action: string
          count?: number
          created_at?: string
          id?: string
          identifier: string
          window_start?: string
        }
        Update: {
          action?: string
          count?: number
          created_at?: string
          id?: string
          identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          cost_id: string | null
          created_at: string | null
          file_url: string | null
          id: string
          receipt_date: string
          uploaded_by: string | null
        }
        Insert: {
          cost_id?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          receipt_date: string
          uploaded_by?: string | null
        }
        Update: {
          cost_id?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          receipt_date?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipts_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_allocations: {
        Row: {
          allocated_at: string | null
          id: string
          job_id: string | null
          quantity: number | null
          resource_id: string | null
        }
        Insert: {
          allocated_at?: string | null
          id?: string
          job_id?: string | null
          quantity?: number | null
          resource_id?: string | null
        }
        Update: {
          allocated_at?: string | null
          id?: string
          job_id?: string | null
          quantity?: number | null
          resource_id?: string | null
        }
        Relationships: []
      }
      rewards: {
        Row: {
          awarded_at: string | null
          description: string | null
          id: string
          reward_type: string | null
          user_id: string | null
        }
        Insert: {
          awarded_at?: string | null
          description?: string | null
          id?: string
          reward_type?: string | null
          user_id?: string | null
        }
        Update: {
          awarded_at?: string | null
          description?: string | null
          id?: string
          reward_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: never
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: never
          name?: string
        }
        Relationships: []
      }
      route_optimizations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          optimization_method: string | null
          optimized_route: Json | null
          start_location: Json
          stops: Json
          total_distance: number | null
          total_duration: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          optimization_method?: string | null
          optimized_route?: Json | null
          start_location: Json
          stops?: Json
          total_distance?: number | null
          total_duration?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          optimization_method?: string | null
          optimized_route?: Json | null
          start_location?: Json
          stops?: Json
          total_distance?: number | null
          total_duration?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          assigned_driver_id: string | null
          assigned_vehicle_id: string | null
          created_at: string | null
          created_by: string | null
          end_time: string | null
          estimated_distance: number | null
          estimated_duration: number | null
          id: string
          name: string
          start_time: string | null
          status: string | null
          updated_at: string | null
          waypoints: Json
        }
        Insert: {
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          created_at?: string | null
          created_by?: string | null
          end_time?: string | null
          estimated_distance?: number | null
          estimated_duration?: number | null
          id?: string
          name: string
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          waypoints: Json
        }
        Update: {
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          created_at?: string | null
          created_by?: string | null
          end_time?: string | null
          estimated_distance?: number | null
          estimated_duration?: number | null
          id?: string
          name?: string
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          waypoints?: Json
        }
        Relationships: [
          {
            foreignKeyName: "routes_assigned_vehicle_id_fkey"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "fleet_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_incidents: {
        Row: {
          corrective_action: string | null
          created_at: string
          description: string
          employee_id: string | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          immediate_action: string | null
          incident_date: string
          incident_type: string
          job_id: string | null
          location: string | null
          reported_by: string | null
          severity: string
          status: string
          updated_at: string
          witnesses: string[] | null
        }
        Insert: {
          corrective_action?: string | null
          created_at?: string
          description: string
          employee_id?: string | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          immediate_action?: string | null
          incident_date?: string
          incident_type: string
          job_id?: string | null
          location?: string | null
          reported_by?: string | null
          severity?: string
          status?: string
          updated_at?: string
          witnesses?: string[] | null
        }
        Update: {
          corrective_action?: string | null
          created_at?: string
          description?: string
          employee_id?: string | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          immediate_action?: string | null
          incident_date?: string
          incident_type?: string
          job_id?: string | null
          location?: string | null
          reported_by?: string | null
          severity?: string
          status?: string
          updated_at?: string
          witnesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_incidents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_incidents_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_inspections: {
        Row: {
          checklist_items: Json
          corrective_actions: string | null
          created_at: string
          created_by: string | null
          id: string
          inspection_date: string
          inspection_type: string
          inspector_id: string | null
          job_id: string | null
          notes: string | null
          overall_score: number | null
          passed: boolean | null
        }
        Insert: {
          checklist_items: Json
          corrective_actions?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          inspection_date?: string
          inspection_type: string
          inspector_id?: string | null
          job_id?: string | null
          notes?: string | null
          overall_score?: number | null
          passed?: boolean | null
        }
        Update: {
          checklist_items?: Json
          corrective_actions?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          inspection_date?: string
          inspection_type?: string
          inspector_id?: string | null
          job_id?: string | null
          notes?: string | null
          overall_score?: number | null
          passed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_inspections_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      samples: {
        Row: {
          collected_by: string | null
          created_at: string | null
          data: Json | null
          id: string
          project_id: string | null
        }
        Insert: {
          collected_by?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          project_id?: string | null
        }
        Update: {
          collected_by?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "samples_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "samples_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduling_entries: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_time: string | null
          id: string
          job_id: string | null
          resource_id: string | null
          start_time: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_time?: string | null
          id?: string
          job_id?: string | null
          resource_id?: string | null
          start_time?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_time?: string | null
          id?: string
          job_id?: string | null
          resource_id?: string | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduling_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_access_logs: {
        Row: {
          action: string | null
          created_at: string | null
          id: string
          resource_id: string | null
          resource_type: string
          source_ip: string | null
          status: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          id?: string
          resource_id?: string | null
          resource_type: string
          source_ip?: string | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          id?: string
          resource_id?: string | null
          resource_type?: string
          source_ip?: string | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string
          event_id: string | null
          id: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description: string
          event_id?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string
          event_id?: string | null
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_alerts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "security_events"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_audits: {
        Row: {
          created_at: string | null
          end_time: string | null
          findings: string | null
          id: string
          performed_by: string | null
          risk_level: string | null
          start_time: string | null
          status: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          end_time?: string | null
          findings?: string | null
          id?: string
          performed_by?: string | null
          risk_level?: string | null
          start_time?: string | null
          status?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string | null
          findings?: string | null
          id?: string
          performed_by?: string | null
          risk_level?: string | null
          start_time?: string | null
          status?: string | null
          type?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          severity: string | null
          source_ip: string | null
          type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string | null
          source_ip?: string | null
          type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string | null
          source_ip?: string | null
          type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_policies: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          settings: Json
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          settings: Json
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          settings?: Json
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      smart_contracts: {
        Row: {
          abi: Json
          address: string
          bytecode: string
          created_at: string | null
          id: string
          name: string
          network: string
          owner_id: string | null
          status: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          abi: Json
          address: string
          bytecode: string
          created_at?: string | null
          id?: string
          name: string
          network: string
          owner_id?: string | null
          status?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          abi?: Json
          address?: string
          bytecode?: string
          created_at?: string | null
          id?: string
          name?: string
          network?: string
          owner_id?: string | null
          status?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      sync_status: {
        Row: {
          errormessage: string | null
          id: string
          lastsync: string | null
          recordcount: number | null
          status: string | null
          table: string | null
        }
        Insert: {
          errormessage?: string | null
          id?: string
          lastsync?: string | null
          recordcount?: number | null
          status?: string | null
          table?: string | null
        }
        Update: {
          errormessage?: string | null
          id?: string
          lastsync?: string | null
          recordcount?: number | null
          status?: string | null
          table?: string | null
        }
        Relationships: []
      }
      system_telemetry: {
        Row: {
          created_at: string
          event_category: string | null
          event_type: string
          id: string
          message: string | null
          metadata: Json | null
          severity: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_category?: string | null
          event_type: string
          id?: string
          message?: string | null
          metadata?: Json | null
          severity?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_category?: string | null
          event_type?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          severity?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tax_records: {
        Row: {
          amount_owed: number | null
          amount_paid: number | null
          created_at: string
          due_date: string | null
          filed_date: string | null
          id: string
          notes: string | null
          status: string
          tax_type: string
          tax_year: number
        }
        Insert: {
          amount_owed?: number | null
          amount_paid?: number | null
          created_at?: string
          due_date?: string | null
          filed_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          tax_type: string
          tax_year: number
        }
        Update: {
          amount_owed?: number | null
          amount_paid?: number | null
          created_at?: string
          due_date?: string | null
          filed_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          tax_type?: string
          tax_year?: number
        }
        Relationships: []
      }
      tests: {
        Row: {
          created_at: string | null
          id: string
          result: Json | null
          sample_id: string | null
          test_type: string
          tested_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          result?: Json | null
          sample_id?: string | null
          test_type: string
          tested_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          result?: Json | null
          sample_id?: string | null
          test_type?: string
          tested_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tests_sample_id_fkey"
            columns: ["sample_id"]
            isOneToOne: false
            referencedRelation: "samples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tests_tested_by_fkey"
            columns: ["tested_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          colors: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          is_system: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          colors: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_system?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          colors?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_system?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          break_duration: number | null
          clock_in: string
          clock_out: string | null
          created_at: string | null
          date: string
          employee_id: string
          id: string
          job_id: string | null
          location_in: Json | null
          location_out: Json | null
          notes: string | null
          total_hours: number | null
        }
        Insert: {
          break_duration?: number | null
          clock_in: string
          clock_out?: string | null
          created_at?: string | null
          date?: string
          employee_id: string
          id?: string
          job_id?: string | null
          location_in?: Json | null
          location_out?: Json | null
          notes?: string | null
          total_hours?: number | null
        }
        Update: {
          break_duration?: number | null
          clock_in?: string
          clock_out?: string | null
          created_at?: string | null
          date?: string
          employee_id?: string
          id?: string
          job_id?: string | null
          location_in?: Json | null
          location_out?: Json | null
          notes?: string | null
          total_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      time_records: {
        Row: {
          break_duration: number | null
          clock_in: string | null
          clock_out: string | null
          date: string | null
          employee_id: string | null
          id: string
          notes: string | null
          overtime_hours: number | null
          project_id: string | null
          status: string | null
          total_hours: number | null
        }
        Insert: {
          break_duration?: number | null
          clock_in?: string | null
          clock_out?: string | null
          date?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          project_id?: string | null
          status?: string | null
          total_hours?: number | null
        }
        Update: {
          break_duration?: number | null
          clock_in?: string | null
          clock_out?: string | null
          date?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          project_id?: string | null
          status?: string | null
          total_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "time_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events: {
        Row: {
          created_at: string | null
          device_id: string | null
          driver_id: string | null
          geofence_id: string | null
          id: string
          is_read: boolean | null
          location_id: string | null
          message: string
          severity: string | null
          type: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          driver_id?: string | null
          geofence_id?: string | null
          id?: string
          is_read?: boolean | null
          location_id?: string | null
          message: string
          severity?: string | null
          type?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          driver_id?: string | null
          geofence_id?: string | null
          id?: string
          is_read?: boolean | null
          location_id?: string | null
          message?: string
          severity?: string | null
          type?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_events_geofence_id_fkey"
            columns: ["geofence_id"]
            isOneToOne: false
            referencedRelation: "geofences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "gps_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_events_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "fleet_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          custom_settings: Json | null
          id: string
          theme_id: string | null
          theme_mode: string | null
          updated_at: string | null
          user_id: string
          wallpaper_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_settings?: Json | null
          id?: string
          theme_id?: string | null
          theme_mode?: string | null
          updated_at?: string | null
          user_id: string
          wallpaper_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_settings?: Json | null
          id?: string
          theme_id?: string | null
          theme_mode?: string | null
          updated_at?: string | null
          user_id?: string
          wallpaper_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_wallpaper_id_fkey"
            columns: ["wallpaper_id"]
            isOneToOne: false
            referencedRelation: "wallpapers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vehicle_details: {
        Row: {
          brake_fluid_type: string | null
          coolant_capacity_quarts: number | null
          coolant_type: string | null
          created_at: string | null
          engine_type: string | null
          front_tire_size: string | null
          id: string
          insurance_company: string | null
          insurance_expiry: string | null
          insurance_policy_number: string | null
          last_oil_change_date: string | null
          last_oil_change_mileage: number | null
          license_plate: string | null
          next_oil_change_due_mileage: number | null
          oil_capacity_quarts: number | null
          oil_change_interval_miles: number | null
          oil_filter_part_number: string | null
          oil_type: string | null
          rear_tire_size: string | null
          registration_expiry: string | null
          registration_number: string | null
          tire_pressure_front: number | null
          tire_pressure_rear: number | null
          transmission_capacity_quarts: number | null
          transmission_fluid_type: string | null
          updated_at: string | null
          vehicle_id: string | null
          vin: string | null
        }
        Insert: {
          brake_fluid_type?: string | null
          coolant_capacity_quarts?: number | null
          coolant_type?: string | null
          created_at?: string | null
          engine_type?: string | null
          front_tire_size?: string | null
          id?: string
          insurance_company?: string | null
          insurance_expiry?: string | null
          insurance_policy_number?: string | null
          last_oil_change_date?: string | null
          last_oil_change_mileage?: number | null
          license_plate?: string | null
          next_oil_change_due_mileage?: number | null
          oil_capacity_quarts?: number | null
          oil_change_interval_miles?: number | null
          oil_filter_part_number?: string | null
          oil_type?: string | null
          rear_tire_size?: string | null
          registration_expiry?: string | null
          registration_number?: string | null
          tire_pressure_front?: number | null
          tire_pressure_rear?: number | null
          transmission_capacity_quarts?: number | null
          transmission_fluid_type?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          vin?: string | null
        }
        Update: {
          brake_fluid_type?: string | null
          coolant_capacity_quarts?: number | null
          coolant_type?: string | null
          created_at?: string | null
          engine_type?: string | null
          front_tire_size?: string | null
          id?: string
          insurance_company?: string | null
          insurance_expiry?: string | null
          insurance_policy_number?: string | null
          last_oil_change_date?: string | null
          last_oil_change_mileage?: number | null
          license_plate?: string | null
          next_oil_change_due_mileage?: number | null
          oil_capacity_quarts?: number | null
          oil_change_interval_miles?: number | null
          oil_filter_part_number?: string | null
          oil_type?: string | null
          rear_tire_size?: string | null
          registration_expiry?: string | null
          registration_number?: string | null
          tire_pressure_front?: number | null
          tire_pressure_rear?: number | null
          transmission_capacity_quarts?: number | null
          transmission_fluid_type?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          vin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_details_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "fleet_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_inspections: {
        Row: {
          brake_condition: string | null
          created_at: string | null
          emergency_kit_check: boolean | null
          engine_condition: string | null
          fire_extinguisher_check: boolean | null
          first_aid_kit_check: boolean | null
          fluid_levels: Json | null
          id: string
          inspection_date: string | null
          inspection_type: string | null
          inspector_id: string | null
          issues_found: string[] | null
          lights_condition: string | null
          next_inspection_due: string | null
          overall_condition: string | null
          passed: boolean | null
          photos: string[] | null
          recommendations: string[] | null
          safety_equipment_check: boolean | null
          signature_url: string | null
          tire_condition: string | null
          vehicle_id: string | null
        }
        Insert: {
          brake_condition?: string | null
          created_at?: string | null
          emergency_kit_check?: boolean | null
          engine_condition?: string | null
          fire_extinguisher_check?: boolean | null
          first_aid_kit_check?: boolean | null
          fluid_levels?: Json | null
          id?: string
          inspection_date?: string | null
          inspection_type?: string | null
          inspector_id?: string | null
          issues_found?: string[] | null
          lights_condition?: string | null
          next_inspection_due?: string | null
          overall_condition?: string | null
          passed?: boolean | null
          photos?: string[] | null
          recommendations?: string[] | null
          safety_equipment_check?: boolean | null
          signature_url?: string | null
          tire_condition?: string | null
          vehicle_id?: string | null
        }
        Update: {
          brake_condition?: string | null
          created_at?: string | null
          emergency_kit_check?: boolean | null
          engine_condition?: string | null
          fire_extinguisher_check?: boolean | null
          first_aid_kit_check?: boolean | null
          fluid_levels?: Json | null
          id?: string
          inspection_date?: string | null
          inspection_type?: string | null
          inspector_id?: string | null
          issues_found?: string[] | null
          lights_condition?: string | null
          next_inspection_due?: string | null
          overall_condition?: string | null
          passed?: boolean | null
          photos?: string[] | null
          recommendations?: string[] | null
          safety_equipment_check?: boolean | null
          signature_url?: string | null
          tire_condition?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "fleet_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_maintenance_records: {
        Row: {
          after_photos: string[] | null
          before_photos: string[] | null
          cost: number | null
          created_at: string | null
          description: string
          fluids_added: Json | null
          id: string
          maintenance_type: string | null
          next_maintenance_due: string | null
          notes: string | null
          odometer_reading: number | null
          parts_used: Json | null
          performed_at: string
          performed_by: string | null
          type: string | null
          vehicle_id: string | null
        }
        Insert: {
          after_photos?: string[] | null
          before_photos?: string[] | null
          cost?: number | null
          created_at?: string | null
          description: string
          fluids_added?: Json | null
          id?: string
          maintenance_type?: string | null
          next_maintenance_due?: string | null
          notes?: string | null
          odometer_reading?: number | null
          parts_used?: Json | null
          performed_at: string
          performed_by?: string | null
          type?: string | null
          vehicle_id?: string | null
        }
        Update: {
          after_photos?: string[] | null
          before_photos?: string[] | null
          cost?: number | null
          created_at?: string | null
          description?: string
          fluids_added?: Json | null
          id?: string
          maintenance_type?: string | null
          next_maintenance_due?: string | null
          notes?: string | null
          odometer_reading?: number | null
          parts_used?: Json | null
          performed_at?: string
          performed_by?: string | null
          type?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "fleet_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          id: string
          last_maintenance: string | null
          license_plate: string | null
          location: string | null
          name: string
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          last_maintenance?: string | null
          license_plate?: string | null
          location?: string | null
          name: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          last_maintenance?: string | null
          license_plate?: string | null
          location?: string | null
          name?: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          company_name: string | null
          contact_info: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          payment_terms: number | null
          phone: string | null
          tax_id: string | null
          vendor_name: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          contact_info?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          payment_terms?: number | null
          phone?: string | null
          tax_id?: string | null
          vendor_name?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          contact_info?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          payment_terms?: number | null
          phone?: string | null
          tax_id?: string | null
          vendor_name?: string | null
        }
        Relationships: []
      }
      wallpapers: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string
          is_public: boolean | null
          is_system: boolean | null
          name: string
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url: string
          is_public?: boolean | null
          is_system?: boolean | null
          name: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string
          is_public?: boolean | null
          is_system?: boolean | null
          name?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      weather_data: {
        Row: {
          condition: Database["public"]["Enums"]["weather_condition"] | null
          humidity: number | null
          id: string
          location_id: string | null
          recorded_at: string | null
          temperature: number | null
          wind_speed: number | null
        }
        Insert: {
          condition?: Database["public"]["Enums"]["weather_condition"] | null
          humidity?: number | null
          id?: string
          location_id?: string | null
          recorded_at?: string | null
          temperature?: number | null
          wind_speed?: number | null
        }
        Update: {
          condition?: Database["public"]["Enums"]["weather_condition"] | null
          humidity?: number | null
          id?: string
          location_id?: string | null
          recorded_at?: string | null
          temperature?: number | null
          wind_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_data_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      work_schedules: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          created_at: string | null
          crew_member_id: string | null
          id: string
          job_id: string | null
          notes: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          status: string | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string | null
          crew_member_id?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: string | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string | null
          crew_member_id?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: string | null
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
          workspace_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
          workspace_name: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
          workspace_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_name_fkey"
            columns: ["workspace_name"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["name"]
          },
        ]
      }
      workspace_versions: {
        Row: {
          created_at: string
          id: string
          payload: Json
          version: number
          workspace_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload: Json
          version: number
          workspace_name: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          version?: number
          workspace_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_versions_workspace_name_fkey"
            columns: ["workspace_name"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["name"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          created_by: string
          name: string
          payload: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          name: string
          payload: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          name?: string
          payload?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      spatial_reference_systems: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number | null
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number | null
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number | null
          srtext?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      calculate_compliance_score: {
        Args: { emp_id: string; end_date: string; start_date: string }
        Returns: number
      }
      calculate_daily_hours: { Args: { entry_id: string }; Returns: number }
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_limit?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_user_role:
        | {
            Args: { allowed_roles: string[]; user_id: string }
            Returns: boolean
          }
        | { Args: { allowed_roles: string[] }; Returns: boolean }
      create_violation: {
        Args: { description_text?: string; emp_id: string; rule_id: string }
        Returns: string
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      dropgeometrytable:
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      generate_daily_summary: {
        Args: { p_date: string; p_employee_id: string }
        Returns: undefined
      }
      generate_weekly_compliance_scores: { Args: never; Returns: undefined }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_current_user_role: { Args: never; Returns: string }
      get_security_status: { Args: never; Returns: Json }
      get_user_role: { Args: never; Returns: string }
      gettransactionid: { Args: never; Returns: unknown }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_current_user_admin: { Args: never; Returns: boolean }
      log_security_event: {
        Args: {
          p_action: string
          p_details?: Json
          p_resource_id?: string
          p_resource_type?: string
        }
        Returns: undefined
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { use_typmod?: boolean }; Returns: string }
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      properties_within_radius: {
        Args: { p_lat: number; p_lng: number; p_radius_miles: number }
        Returns: {
          acreage: number | null
          id: string
          latitude: number | null
          longitude: number | null
          owner_name: string | null
          parcel_id: string
          property_address: string | null
          tax_value: number | null
          zoning: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "properties"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_askml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geom: unknown }; Returns: number }
        | { Args: { geog: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      update_employee_score: {
        Args: { emp_id: string; points_change: number }
        Returns: undefined
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "Super Administrator"
        | "Administrator"
        | "Estimator"
        | "Field Crew Lead"
        | "Field Technician"
        | "Client"
      equipment_status:
        | "available"
        | "in_use"
        | "maintenance"
        | "out_of_service"
      equipment_type:
        | "paver"
        | "roller"
        | "truck"
        | "trailer"
        | "compactor"
        | "seal_coating_tank"
        | "line_striper"
        | "crack_sealer"
        | "tools"
      project_status: "pending" | "in_progress" | "completed" | "cancelled"
      project_type:
        | "asphalt_paving"
        | "sealcoating"
        | "line_striping"
        | "crack_sealing"
        | "pothole_repair"
        | "overlay"
        | "maintenance"
      user_role: "admin" | "manager" | "user" | "super_admin"
      weather_condition: "sunny" | "cloudy" | "rainy" | "snowy" | "windy"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
      app_role: [
        "Super Administrator",
        "Administrator",
        "Estimator",
        "Field Crew Lead",
        "Field Technician",
        "Client",
      ],
      equipment_status: [
        "available",
        "in_use",
        "maintenance",
        "out_of_service",
      ],
      equipment_type: [
        "paver",
        "roller",
        "truck",
        "trailer",
        "compactor",
        "seal_coating_tank",
        "line_striper",
        "crack_sealer",
        "tools",
      ],
      project_status: ["pending", "in_progress", "completed", "cancelled"],
      project_type: [
        "asphalt_paving",
        "sealcoating",
        "line_striping",
        "crack_sealing",
        "pothole_repair",
        "overlay",
        "maintenance",
      ],
      user_role: ["admin", "manager", "user", "super_admin"],
      weather_condition: ["sunny", "cloudy", "rainy", "snowy", "windy"],
    },
  },
} as const
