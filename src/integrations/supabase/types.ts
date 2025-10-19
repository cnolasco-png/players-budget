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
          plan: "free" | "pro"
          plan_interval: "monthly" | "yearly" | null
          pro: boolean | null
          country: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          player_level?: string | null
          travels_with_coach?: boolean | null
          role?: "free" | "pro"
          plan?: "free" | "pro"
          plan_interval?: "monthly" | "yearly" | null
          pro?: boolean | null
          country?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          player_level?: string | null
          travels_with_coach?: boolean | null
          role?: "free" | "pro"
          plan?: "free" | "pro"
          plan_interval?: "monthly" | "yearly" | null
          pro?: boolean | null
          country?: string | null
          stripe_customer_id?: string | null
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
          created_at: string | null
          role: "player" | "sponsor" | "coach"
          user_id: string | null
          prospect_id: string | null
          activation_id: string | null
          name: string | null
          org: string | null
          title: string | null
          rating: number | null
          quote: string
          media_url: string | null
          avatar_url: string | null
          consent_publish: boolean | null
          tags: string[] | null
          sentiment: string | null
          status: "pending" | "approved" | "rejected"
        }
        Insert: {
          id?: string
          created_at?: string | null
          role: "player" | "sponsor" | "coach"
          user_id?: string | null
          prospect_id?: string | null
          activation_id?: string | null
          name?: string | null
          org?: string | null
          title?: string | null
          rating?: number | null
          quote: string
          media_url?: string | null
          avatar_url?: string | null
          consent_publish?: boolean | null
          tags?: string[] | null
          sentiment?: string | null
          status?: "pending" | "approved" | "rejected"
        }
        Update: {
          id?: string
          created_at?: string | null
          role?: "player" | "sponsor" | "coach"
          user_id?: string | null
          prospect_id?: string | null
          activation_id?: string | null
          name?: string | null
          org?: string | null
          title?: string | null
          rating?: number | null
          quote?: string
          media_url?: string | null
          avatar_url?: string | null
          consent_publish?: boolean | null
          tags?: string[] | null
          sentiment?: string | null
          status?: "pending" | "approved" | "rejected"
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          key: string
          enabled: boolean
          release_at: string | null
          updated_at: string | null
        }
        Insert: {
          key: string
          enabled?: boolean
          release_at?: string | null
          updated_at?: string | null
        }
        Update: {
          key?: string
          enabled?: boolean
          release_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sponsor_asset_events: {
        Row: {
          id: string
          user_id: string | null
          asset: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          asset: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          asset?: string
          created_at?: string
        }
        Relationships: []
      }
      course_modules: {
        Row: {
          slug: string
          title: string
          description: string | null
          min_tier: Database["public"]["Enums"]["module_tier"]
          release_at: string | null
          created_at: string
        }
        Insert: {
          slug: string
          title: string
          description?: string | null
          min_tier?: Database["public"]["Enums"]["module_tier"]
          release_at?: string | null
          created_at?: string
        }
        Update: {
          slug?: string
          title?: string
          description?: string | null
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
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: "trialing" | "active" | "past_due" | "canceled" | "unpaid"
          plan: "pro_monthly" | "pro_yearly" | null
          current_period_end: string | null
          cancel_at_period_end: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: "trialing" | "active" | "past_due" | "canceled" | "unpaid"
          plan?: "pro_monthly" | "pro_yearly" | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: "trialing" | "active" | "past_due" | "canceled" | "unpaid"
          plan?: "pro_monthly" | "pro_yearly" | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      upgrade_events: {
        Row: {
          id: string
          created_at: string | null
          user_id: string | null
          source: string
          interval: "monthly" | "yearly"
        }
        Insert: {
          id?: string
          created_at?: string | null
          user_id?: string | null
          source: string
          interval: "monthly" | "yearly"
        }
        Update: {
          id?: string
          created_at?: string | null
          user_id?: string | null
          source?: string
          interval?: "monthly" | "yearly"
        }
        Relationships: []
      }
      checkout_sessions: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          user_id: string | null
          session_id: string
          plan: string | null
          interval: "monthly" | "yearly"
          plan_interval: "monthly" | "yearly" | null
          status: string
          payment_status: string | null
          completed_at: string | null
          error: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          session_id: string
          plan?: string | null
          interval: "monthly" | "yearly"
          plan_interval?: "monthly" | "yearly" | null
          status?: string
          payment_status?: string | null
          completed_at?: string | null
          error?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          session_id?: string
          plan?: string | null
          interval?: "monthly" | "yearly"
          plan_interval?: "monthly" | "yearly" | null
          status?: string
          payment_status?: string | null
          completed_at?: string | null
          error?: string | null
        }
        Relationships: []
      }
      user_flags: {
        Row: {
          user_id: string
          pro_annual_trial_eligible: boolean | null
        }
        Insert: {
          user_id: string
          pro_annual_trial_eligible?: boolean | null
        }
        Update: {
          user_id?: string
          pro_annual_trial_eligible?: boolean | null
        }
        Relationships: []
      }
      feedback_tokens: {
        Row: {
          id: string
          feedback_id: string | null
          token: string
          expires_at: string
          used: boolean | null
        }
        Insert: {
          id?: string
          feedback_id?: string | null
          token: string
          expires_at: string
          used?: boolean | null
        }
        Update: {
          id?: string
          feedback_id?: string | null
          token?: string
          expires_at?: string
          used?: boolean | null
        }
        Relationships: []
      }
      homepage_stats: {
        Row: {
          id: number
          updated_at: string | null
          total_activations: number | null
          total_qr_scans: number | null
          total_redemptions: number | null
          avg_time_to_first_sponsor: number | null
          rolling_30d_testimonials: number | null
        }
        Insert: {
          id?: number
          updated_at?: string | null
          total_activations?: number | null
          total_qr_scans?: number | null
          total_redemptions?: number | null
          avg_time_to_first_sponsor?: number | null
          rolling_30d_testimonials?: number | null
        }
        Update: {
          id?: number
          updated_at?: string | null
          total_activations?: number | null
          total_qr_scans?: number | null
          total_redemptions?: number | null
          avg_time_to_first_sponsor?: number | null
          rolling_30d_testimonials?: number | null
        }
        Relationships: []
      }
      ab_flags: {
        Row: {
          key: string
          variant: string
        }
        Insert: {
          key: string
          variant: string
        }
        Update: {
          key?: string
          variant?: string
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
