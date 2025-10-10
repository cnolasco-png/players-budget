export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          player_level: string | null
          travels_with_coach: boolean | null
          role: "free" | "pro"
          country: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          player_level?: string | null
          travels_with_coach?: boolean | null
          role?: "free" | "pro"
          country?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          player_level?: string | null
          travels_with_coach?: boolean | null
          role?: "free" | "pro"
          country?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          title: string
          base_currency: string
          season_year: number
          tax_country: string | null
          tax_pct: number | null
          is_active: boolean | null
          contingency_pct: number | null
          target_monthly_funding: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          base_currency?: string
          season_year?: number
          tax_country?: string | null
          tax_pct?: number | null
          is_active?: boolean | null
          contingency_pct?: number | null
          target_monthly_funding?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          base_currency?: string
          season_year?: number
          tax_country?: string | null
          tax_pct?: number | null
          is_active?: boolean | null
          contingency_pct?: number | null
          target_monthly_funding?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          id: string
          budget_id: string
          name: string
          is_default: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          budget_id: string
          name: string
          is_default?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          budget_id?: string
          name?: string
          is_default?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      line_items: {
        Row: {
          id: string
          scenario_id: string
          category_id: string
          amount: number
          note: string | null
          label: string | null
          qty: number | null
          unit_cost: number | null
          unit: string | null
          currency: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          scenario_id: string
          category_id: string
          amount: number
          note?: string | null
          label?: string | null
          qty?: number | null
          unit_cost?: number | null
          unit?: string | null
          currency?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          scenario_id?: string
          category_id?: string
          amount?: number
          note?: string | null
          label?: string | null
          qty?: number | null
          unit_cost?: number | null
          unit?: string | null
          currency?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      expense_entries: {
        Row: {
          id: string
          user_id: string
          budget_id: string | null
          category: string
          amount: number
          currency: string
          date: string
          note: string | null
          label: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          budget_id?: string | null
          category: string
          amount: number
          currency?: string
          date?: string
          note?: string | null
          label?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          budget_id?: string | null
          category?: string
          amount?: number
          currency?: string
          date?: string
          note?: string | null
          label?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      budget_snapshots: {
        Row: {
          id: string
          budget_id: string
          note: string | null
          scenario_totals: Json
          spend_total: number | null
          income_total: number | null
          snapshot_data: Json | null
          restored_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          budget_id: string
          note?: string | null
          scenario_totals: Json
          spend_total?: number | null
          income_total?: number | null
          snapshot_data?: Json | null
          restored_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          budget_id?: string
          note?: string | null
          scenario_totals?: Json
          spend_total?: number | null
          income_total?: number | null
          snapshot_data?: Json | null
          restored_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          id: string
          user_id: string | null
          email: string | null
          topic: string | null
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email?: string | null
          topic?: string | null
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string | null
          topic?: string | null
          message?: string
          created_at?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          key: string
          enabled: boolean
          release_at: string | null
          created_at: string
        }
        Insert: {
          key: string
          enabled?: boolean
          release_at?: string | null
          created_at?: string
        }
        Update: {
          key?: string
          enabled?: boolean
          release_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      course_modules: {
        Row: {
          slug: string
          title: string
          min_tier: Database["public"]["Enums"]["module_tier"]
          release_at: string | null
          created_at: string
        }
        Insert: {
          slug: string
          title: string
          min_tier?: Database["public"]["Enums"]["module_tier"]
          release_at?: string | null
          created_at?: string
        }
        Update: {
          slug?: string
          title?: string
          min_tier?: Database["public"]["Enums"]["module_tier"]
          release_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          id: string
          user_id: string | null
          module_slug: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          module_slug: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          module_slug?: string
          email?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_signups_module_slug_fkey"
            columns: ["module_slug"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["slug"]
          }
        ]
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          status: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status: string
          current_period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_progress: {
        Row: {
          id: string
          user_id: string
          course_id: string
          day0: boolean
          day1: boolean
          day2: boolean
          day3: boolean
          day4: boolean
          day5: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          day0?: boolean
          day1?: boolean
          day2?: boolean
          day3?: boolean
          day4?: boolean
          day5?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          day0?: boolean
          day1?: boolean
          day2?: boolean
          day3?: boolean
          day4?: boolean
          day5?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      income_sources: {
        Row: {
          id: string
          budget_id: string
          label: string
          amount: number
          amount_monthly: number | null
          type: string | null
          currency: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          budget_id: string
          label: string
          amount: number
          amount_monthly?: number | null
          type?: string | null
          currency?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          budget_id?: string
          label?: string
          amount?: number
          amount_monthly?: number | null
          type?: string | null
          currency?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      line_item_categories: {
        Row: {
          id: string
          label: string
          kind: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          label: string
          kind: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          label?: string
          kind?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tax_rates: {
        Row: {
          id: string
          country: string
          default_pct: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          country: string
          default_pct: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          country?: string
          default_pct?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      module_tier: "free" | "pro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}