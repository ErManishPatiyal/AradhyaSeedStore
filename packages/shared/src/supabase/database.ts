/**
 * Hand-written Supabase Database types.
 * Replace with `supabase gen types typescript` output once project is live.
 *
 * Must match supabase-js GenericSchema: Tables need Relationships;
 * schema needs Views + Functions.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          hsn_code: string;
          unit: "kg" | "ltr";
          stock_qty: number;
          mfg_date: string | null;
          exp_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          hsn_code: string;
          unit: "kg" | "ltr";
          stock_qty?: number;
          mfg_date?: string | null;
          exp_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          hsn_code?: string;
          unit?: "kg" | "ltr";
          stock_qty?: number;
          mfg_date?: string | null;
          exp_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      sales: {
        Row: {
          id: string;
          customer_id: string;
          sale_date: string;
          total_amount: number;
          received_amount: number;
          balance_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          sale_date: string;
          total_amount: number;
          received_amount: number;
          balance_amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          sale_date?: string;
          total_amount?: number;
          received_amount?: number;
          balance_amount?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          hsn_code: string;
          quantity: number;
          rate: number;
          amount: number;
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_id: string;
          hsn_code: string;
          quantity: number;
          rate: number;
          amount: number;
        };
        Update: {
          id?: string;
          sale_id?: string;
          product_id?: string;
          hsn_code?: string;
          quantity?: number;
          rate?: number;
          amount?: number;
        };
        Relationships: [
          {
            foreignKeyName: "sale_items_sale_id_fkey";
            columns: ["sale_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sale_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      stock_movements: {
        Row: {
          id: string;
          product_id: string;
          movement_type: "in" | "out";
          quantity: number;
          reference_type: "sale" | "purchase" | "adjustment" | null;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          movement_type: "in" | "out";
          quantity: number;
          reference_type?: "sale" | "purchase" | "adjustment" | null;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          movement_type?: "in" | "out";
          quantity?: number;
          reference_type?: "sale" | "purchase" | "adjustment" | null;
          reference_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_sale_with_items: {
        Args: {
          p_customer_id: string;
          p_sale_date: string;
          p_items: Json;
          p_received_amount: number;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
