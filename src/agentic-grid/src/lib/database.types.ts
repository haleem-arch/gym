export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          gender: 'Male' | 'Female' | 'Unspecified'
          role: 'user' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone?: string | null
          gender?: 'Male' | 'Female' | 'Unspecified'
          role?: 'user' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          gender?: 'Male' | 'Female' | 'Unspecified'
          role?: 'user' | 'admin'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      runs: {
        Row: {
          id: string
          title: string
          date_time: string
          location_name: string
          distance_km: number
          target_paces: string[]
          description: string | null
          max_capacity: number | null
          status: 'upcoming' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          date_time: string
          location_name: string
          distance_km: number
          target_paces?: string[]
          description?: string | null
          max_capacity?: number | null
          status?: 'upcoming' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          date_time?: string
          location_name?: string
          distance_km?: number
          target_paces?: string[]
          description?: string | null
          max_capacity?: number | null
          status?: 'upcoming' | 'completed' | 'cancelled'
          created_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          id: string
          run_id: string
          user_id: string
          status: 'registered' | 'checked_in'
          created_at: string
        }
        Insert: {
          id?: string
          run_id: string
          user_id: string
          status?: 'registered' | 'checked_in'
          created_at?: string
        }
        Update: {
          id?: string
          run_id?: string
          user_id?: string
          status?: 'registered' | 'checked_in'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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
