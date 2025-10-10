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