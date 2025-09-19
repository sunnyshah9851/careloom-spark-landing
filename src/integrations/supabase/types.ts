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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      catchup_reminder_logs: {
        Row: {
          created_at: string
          id: string
          relationship_id: string
          sent_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          relationship_id: string
          sent_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          relationship_id?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: []
      }
      date_idea_logs: {
        Row: {
          created_at: string
          id: string
          relationship_id: string
          sent_at: string
          user_id: string
          week_of: string
        }
        Insert: {
          created_at?: string
          id?: string
          relationship_id: string
          sent_at?: string
          user_id: string
          week_of: string
        }
        Update: {
          created_at?: string
          id?: string
          relationship_id?: string
          sent_at?: string
          user_id?: string
          week_of?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          event_date: string
          event_type: string
          id: string
          metadata: Json | null
          relationship_id: string
        }
        Insert: {
          created_at?: string
          event_date?: string
          event_type: string
          id?: string
          metadata?: Json | null
          relationship_id: string
        }
        Update: {
          created_at?: string
          event_date?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          relationship_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          current_url: string
          disliked: string | null
          id: string
          liked: string | null
          pricing_feedback: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_url: string
          disliked?: string | null
          id?: string
          liked?: string | null
          pricing_feedback?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_url?: string
          disliked?: string | null
          id?: string
          liked?: string | null
          pricing_feedback?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gift_ideas: {
        Row: {
          category: string
          created_at: string
          date_added: string
          description: string | null
          id: string
          price: string | null
          priority: string
          relationship_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          date_added?: string
          description?: string | null
          id?: string
          price?: string | null
          priority?: string
          relationship_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          date_added?: string
          description?: string | null
          id?: string
          price?: string | null
          priority?: string
          relationship_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      math_tutoring_leads: {
        Row: {
          created_at: string
          current_score: string | null
          email: string
          exam_type: string | null
          first_name: string
          id: string
          last_name: string
          message: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_score?: string | null
          email: string
          exam_type?: string | null
          first_name: string
          id?: string
          last_name: string
          message?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_score?: string | null
          email?: string
          exam_type?: string | null
          first_name?: string
          id?: string
          last_name?: string
          message?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          anniversary_reminders_enabled: boolean
          birthday_reminders_enabled: boolean
          created_at: string
          date_ideas_enabled: boolean
          email_reminders_enabled: boolean
          id: string
          nudge_reminders_enabled: boolean
          push_notifications_enabled: boolean
          reminder_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anniversary_reminders_enabled?: boolean
          birthday_reminders_enabled?: boolean
          created_at?: string
          date_ideas_enabled?: boolean
          email_reminders_enabled?: boolean
          id?: string
          nudge_reminders_enabled?: boolean
          push_notifications_enabled?: boolean
          reminder_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anniversary_reminders_enabled?: boolean
          birthday_reminders_enabled?: boolean
          created_at?: string
          date_ideas_enabled?: boolean
          email_reminders_enabled?: boolean
          id?: string
          nudge_reminders_enabled?: boolean
          push_notifications_enabled?: boolean
          reminder_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          nudge_frequency: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          nudge_frequency?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          nudge_frequency?: string | null
        }
        Relationships: []
      }
      relationships: {
        Row: {
          anniversary: string | null
          anniversary_notification_frequency: string | null
          birthday: string | null
          birthday_notification_frequency: string | null
          city: string | null
          created_at: string
          date_ideas_frequency: string | null
          email: string | null
          id: string
          last_nudge_sent: string | null
          name: string
          notes: string | null
          phone_number: string | null
          profile_id: string
          relationship_type: string
          tags: string[] | null
        }
        Insert: {
          anniversary?: string | null
          anniversary_notification_frequency?: string | null
          birthday?: string | null
          birthday_notification_frequency?: string | null
          city?: string | null
          created_at?: string
          date_ideas_frequency?: string | null
          email?: string | null
          id?: string
          last_nudge_sent?: string | null
          name: string
          notes?: string | null
          phone_number?: string | null
          profile_id: string
          relationship_type: string
          tags?: string[] | null
        }
        Update: {
          anniversary?: string | null
          anniversary_notification_frequency?: string | null
          birthday?: string | null
          birthday_notification_frequency?: string | null
          city?: string | null
          created_at?: string
          date_ideas_frequency?: string | null
          email?: string | null
          id?: string
          last_nudge_sent?: string | null
          name?: string
          notes?: string | null
          phone_number?: string | null
          profile_id?: string
          relationship_type?: string
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "relationships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_logs: {
        Row: {
          created_at: string
          event_date: string
          id: string
          relationship_id: string
          reminder_date: string
          reminder_type: string
          sent_at: string
        }
        Insert: {
          created_at?: string
          event_date: string
          id?: string
          relationship_id: string
          reminder_date: string
          reminder_type: string
          sent_at?: string
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: string
          relationship_id?: string
          reminder_date?: string
          reminder_type?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_logs_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      vibe_fix_requests: {
        Row: {
          assigned_developer_id: string | null
          created_at: string
          email: string
          id: string
          problem: string
          status: string
          updated_at: string
          url: string
        }
        Insert: {
          assigned_developer_id?: string | null
          created_at?: string
          email: string
          id?: string
          problem: string
          status?: string
          updated_at?: string
          url: string
        }
        Update: {
          assigned_developer_id?: string | null
          created_at?: string
          email?: string
          id?: string
          problem?: string
          status?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      vibe_fixers: {
        Row: {
          available: boolean
          bio: string
          created_at: string
          email: string
          expertise: string[]
          id: string
          updated_at: string
        }
        Insert: {
          available?: boolean
          bio: string
          created_at?: string
          email: string
          expertise: string[]
          id?: string
          updated_at?: string
        }
        Update: {
          available?: boolean
          bio?: string
          created_at?: string
          email?: string
          expertise?: string[]
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { data: Json; uri: string } | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { data: Json; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      setup_catchup_cron: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      setup_date_ideas_cron: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      setup_reminder_cron: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
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
    Enums: {},
  },
} as const
