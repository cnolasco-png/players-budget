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
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      budget_snapshots: {
        Row: {
          budget_id: string
          created_at: string
          id: string
          income_total: number
          note: string | null
          restored_at: string | null
          scenario_totals: Json
          snapshot_data: Json
          spend_total: number
          user_id: string
        }
        Insert: {
          budget_id: string
          created_at?: string
          id?: string
          income_total?: number
          note?: string | null
          restored_at?: string | null
          scenario_totals?: Json
          snapshot_data: Json
          spend_total?: number
          user_id: string
        }
        Update: {
          budget_id?: string
          created_at?: string
          id?: string
          income_total?: number
          note?: string | null
          restored_at?: string | null
          scenario_totals?: Json
          snapshot_data?: Json
          spend_total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_snapshots_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_entries: {
        Row: {
          amount: number
          budget_id: string | null
          category: string
          created_at: string
          currency: string
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          amount: number
          budget_id?: string | null
          category: string
          created_at?: string
          currency?: string
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          budget_id?: string | null
          category?: string
          created_at?: string
          currency?: string
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_entries_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          base_currency: string | null
          contingency_pct: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          season_year: number
          target_monthly_funding: number | null
          tax_country: string | null
          tax_pct: number | null
          title: string
          user_id: string
        }
        Insert: {
          base_currency?: string | null
          contingency_pct?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          season_year: number
          target_monthly_funding?: number | null
          tax_country?: string | null
          tax_pct?: number | null
          title: string
          user_id: string
        }
        Update: {
          base_currency?: string | null
          contingency_pct?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          season_year?: number
          target_monthly_funding?: number | null
          tax_country?: string | null
          tax_pct?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      income_sources: {
        Row: {
          amount_monthly: number | null
          budget_id: string
          created_at: string | null
          currency: string | null
          id: string
          label: string
          type: string | null
        }
        Insert: {
          amount_monthly?: number | null
          budget_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          label: string
          type?: string | null
        }
        Update: {
          amount_monthly?: number | null
          budget_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          label?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "income_sources_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      line_item_categories: {
        Row: {
          id: string
          kind: string
          label: string
          sort_order: number | null
        }
        Insert: {
          id: string
          kind: string
          label: string
          sort_order?: number | null
        }
        Update: {
          id?: string
          kind?: string
          label?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      line_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          label: string
          qty: number | null
          scenario_id: string
          unit: string | null
          unit_cost: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          label: string
          qty?: number | null
          scenario_id: string
          unit?: string | null
          unit_cost?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          label?: string
          qty?: number | null
          scenario_id?: string
          unit?: string | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "line_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "line_item_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_items_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          coach_day_rate: number | null
          coach_percent_of_prize: number | null
          country: string | null
          created_at: string | null
          email: string | null
          home_currency: string | null
          id: string
          name: string | null
          player_level: string | null
          restrings_per_week: number | null
          role: string | null
          stringing_cost_per_racquet: number | null
          travels_with_coach: boolean | null
        }
        Insert: {
          coach_day_rate?: number | null
          coach_percent_of_prize?: number | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          home_currency?: string | null
          id: string
          name?: string | null
          player_level?: string | null
          restrings_per_week?: number | null
          role?: string | null
          stringing_cost_per_racquet?: number | null
          travels_with_coach?: boolean | null
        }
        Update: {
          coach_day_rate?: number | null
          coach_percent_of_prize?: number | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          home_currency?: string | null
          id?: string
          name?: string | null
          player_level?: string | null
          restrings_per_week?: number | null
          role?: string | null
          stringing_cost_per_racquet?: number | null
          travels_with_coach?: boolean | null
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          airfare_per_leg: number | null
          budget_id: string
          coach_days_per_month: number | null
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          meals_per_day: number | null
          name: string
          nights_per_tournament: number | null
          tournaments_per_month: number | null
        }
        Insert: {
          airfare_per_leg?: number | null
          budget_id: string
          coach_days_per_month?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          meals_per_day?: number | null
          name: string
          nights_per_tournament?: number | null
          tournaments_per_month?: number | null
        }
        Update: {
          airfare_per_leg?: number | null
          budget_id?: string
          coach_days_per_month?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          meals_per_day?: number | null
          name?: string
          nights_per_tournament?: number | null
          tournaments_per_month?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scenarios_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_rates: {
        Row: {
          country: string
          default_pct: number
          id: string
          updated_at: string | null
        }
        Insert: {
          country: string
          default_pct: number
          id?: string
          updated_at?: string | null
        }
        Update: {
          country?: string
          default_pct?: number
          id?: string
          updated_at?: string | null
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
