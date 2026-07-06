// Generated-style Supabase types for Semayot.
// Source of truth: local schema snapshots under lib/admin/rls plus fields used
// by the currently verified application surface.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ai_summaries: {
        Row: {
          generated_at: string;
          id: string;
          period_end: string;
          period_start: string;
          summary_text: string;
        };
        Insert: {
          generated_at?: string;
          id?: string;
          period_end: string;
          period_start: string;
          summary_text: string;
        };
        Update: {
          generated_at?: string;
          id?: string;
          period_end?: string;
          period_start?: string;
          summary_text?: string;
        };
        Relationships: [];
      };
      branches: {
        Row: {
          address: string | null;
          created_at: string | null;
          id: string;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          address?: string | null;
          created_at?: string | null;
          id?: string;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          address?: string | null;
          created_at?: string | null;
          id?: string;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          created_at: string | null;
          id: string;
          last_visit: string | null;
          name: string;
          phone: string;
          points: number | null;
          total_spent: number | null;
          total_visits: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          last_visit?: string | null;
          name: string;
          phone: string;
          points?: number | null;
          total_spent?: number | null;
          total_visits?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          last_visit?: string | null;
          name?: string;
          phone?: string;
          points?: number | null;
          total_spent?: number | null;
          total_visits?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          amount_cents: number;
          category: "bahan" | "operasional" | "gaji" | "lain";
          created_at: string;
          description: string | null;
          id: string;
          incurred_at: string;
          incurred_by: string | null;
        };
        Insert: {
          amount_cents: number;
          category: "bahan" | "operasional" | "gaji" | "lain";
          created_at?: string;
          description?: string | null;
          id?: string;
          incurred_at?: string;
          incurred_by?: string | null;
        };
        Update: {
          amount_cents?: number;
          category?: "bahan" | "operasional" | "gaji" | "lain";
          created_at?: string;
          description?: string | null;
          id?: string;
          incurred_at?: string;
          incurred_by?: string | null;
        };
        Relationships: [];
      };
      fraud_logs: {
        Row: {
          action_type: string;
          branch_id: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          shift_id: string | null;
          user_id: string | null;
        };
        Insert: {
          action_type: string;
          branch_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          shift_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          action_type?: string;
          branch_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          shift_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      inventory: {
        Row: {
          branch_id: string | null;
          category: string;
          cost_per_unit: number;
          created_at: string | null;
          id: string;
          last_restock: string | null;
          min_stock_alert: number;
          name: string;
          stock: number;
          unit: string;
          updated_at: string | null;
        };
        Insert: {
          branch_id?: string | null;
          category: string;
          cost_per_unit?: number;
          created_at?: string | null;
          id?: string;
          last_restock?: string | null;
          min_stock_alert?: number;
          name: string;
          stock?: number;
          unit: string;
          updated_at?: string | null;
        };
        Update: {
          branch_id?: string | null;
          category?: string;
          cost_per_unit?: number;
          created_at?: string | null;
          id?: string;
          last_restock?: string | null;
          min_stock_alert?: number;
          name?: string;
          stock?: number;
          unit?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      menu_items: {
        Row: {
          badge: string | null;
          category: "dayak" | "smoked" | "pedas" | "minuman";
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          needs_owner_confirmation: boolean;
          photo_url: string | null;
          price_cents: number;
          updated_at: string;
        };
        Insert: {
          badge?: string | null;
          category: "dayak" | "smoked" | "pedas" | "minuman";
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          needs_owner_confirmation?: boolean;
          photo_url?: string | null;
          price_cents: number;
          updated_at?: string;
        };
        Update: {
          badge?: string | null;
          category?: "dayak" | "smoked" | "pedas" | "minuman";
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          needs_owner_confirmation?: boolean;
          photo_url?: string | null;
          price_cents?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string;
          id: string;
          is_active: boolean;
          role: "owner" | "staff";
        };
        Insert: {
          created_at?: string;
          full_name: string;
          id: string;
          is_active?: boolean;
          role: "owner" | "staff";
        };
        Update: {
          created_at?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          role?: "owner" | "staff";
        };
        Relationships: [];
      };
      recipes: {
        Row: {
          created_at: string | null;
          id: string;
          inventory_id: string | null;
          menu_item_id: string | null;
          quantity_required: number;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          inventory_id?: string | null;
          menu_item_id?: string | null;
          quantity_required: number;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          inventory_id?: string | null;
          menu_item_id?: string | null;
          quantity_required?: number;
        };
        Relationships: [];
      };
      sema_memories: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          is_read: boolean;
          recipient_name: string;
          sender_name: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          recipient_name: string;
          sender_name: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          recipient_name?: string;
          sender_name?: string;
        };
        Relationships: [];
      };
      shifts: {
        Row: {
          branch_id: string | null;
          end_time: string | null;
          ending_cash: number | null;
          id: string;
          start_time: string | null;
          starting_cash: number;
          status: string | null;
          user_id: string | null;
        };
        Insert: {
          branch_id?: string | null;
          end_time?: string | null;
          ending_cash?: number | null;
          id?: string;
          start_time?: string | null;
          starting_cash: number;
          status?: string | null;
          user_id?: string | null;
        };
        Update: {
          branch_id?: string | null;
          end_time?: string | null;
          ending_cash?: number | null;
          id?: string;
          start_time?: string | null;
          starting_cash?: number;
          status?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      transaction_items: {
        Row: {
          id: string;
          menu_item_id: string;
          name_snapshot: string;
          price_cents_snapshot: number;
          quantity: number;
          subtotal_cents: number;
          transaction_id: string;
        };
        Insert: {
          id?: string;
          menu_item_id: string;
          name_snapshot: string;
          price_cents_snapshot: number;
          quantity: number;
          subtotal_cents: number;
          transaction_id: string;
        };
        Update: {
          id?: string;
          menu_item_id?: string;
          name_snapshot?: string;
          price_cents_snapshot?: number;
          quantity?: number;
          subtotal_cents?: number;
          transaction_id?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          branch_id: string | null;
          change_cents: number;
          created_at: string;
          customer_id: string | null;
          id: string;
          note: string | null;
          paid_cents: number;
          payment_method: "cash";
          staff_id: string;
          total_cents: number;
        };
        Insert: {
          branch_id?: string | null;
          created_at?: string;
          customer_id?: string | null;
          id?: string;
          note?: string | null;
          paid_cents: number;
          payment_method?: "cash";
          staff_id: string;
          total_cents: number;
        };
        Update: {
          branch_id?: string | null;
          created_at?: string;
          customer_id?: string | null;
          id?: string;
          note?: string | null;
          paid_cents?: number;
          payment_method?: "cash";
          staff_id?: string;
          total_cents?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      current_user_role: {
        Args: Record<string, never>;
        Returns: "owner" | "staff";
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

type PublicSchema = Database["public"];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Row: infer Row;
    }
    ? Row
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Row: infer Row;
      }
      ? Row
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer Insert;
    }
    ? Insert
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer Insert;
      }
      ? Insert
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer Update;
    }
    ? Update
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer Update;
      }
      ? Update
      : never
    : never;
