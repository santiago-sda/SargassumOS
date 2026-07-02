import type { Condition } from '@/types'

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      beaches: {
        Row: {
          id: string
          name: string
          lat: number
          lng: number
          country: string
          satellite_condition: Condition | null
          current_condition: Condition
          last_updated: string | null
        }
        Insert: Omit<Database['public']['Tables']['beaches']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['beaches']['Insert']>
      }
      reports: {
        Row: {
          id: string
          beach_id: string
          condition: Condition
          photo_url: string | null
          note: string | null
          created_at: string
          user_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reports']['Insert']>
      }
      waitlist: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: { email: string }
        Update: never
      }
    }
    Functions: {
      derive_condition: {
        Args: { beach_id: string }
        Returns: Condition
      }
    }
  }
}
