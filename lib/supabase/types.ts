/**
 * Patiyolu — Supabase Database tipleri (hand-rolled, supabase-js v2 ile uyumlu).
 */

export type AppRole = "customer" | "transporter" | "sitter" | "vet";
export type Species = "dog" | "cat" | "bird" | "rabbit" | "other";
export type VehicleType = "car" | "van" | "truck";
export type KycStatus = "pending" | "approved" | "rejected";
export type Urgency = "standard" | "express" | "sameday";
export type ListingStatus =
  | "draft"
  | "published"
  | "closed"
  | "expired"
  | "cancelled";
export type BidStatus = "pending" | "accepted" | "rejected" | "withdrawn";

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
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          phone: string | null;
          city: string | null;
          kvkk_consent_at: string;
          marketing_consent: boolean;
          default_role: AppRole;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          avatar_url?: string | null;
          phone?: string | null;
          city?: string | null;
          kvkk_consent_at: string;
          marketing_consent?: boolean;
          default_role?: AppRole;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string | null;
          phone?: string | null;
          city?: string | null;
          kvkk_consent_at?: string;
          marketing_consent?: boolean;
          default_role?: AppRole;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          user_id: string;
          role: AppRole;
          enabled_at: string;
        };
        Insert: {
          user_id: string;
          role: AppRole;
          enabled_at?: string;
        };
        Update: {
          user_id?: string;
          role?: AppRole;
          enabled_at?: string;
        };
        Relationships: [];
      };
      transporter_profiles: {
        Row: {
          user_id: string;
          display_name: string;
          slug: string;
          bio: string | null;
          company_name: string | null;
          vehicle_type: VehicleType | null;
          plate: string | null;
          service_cities: string[];
          base_rate_per_km: number;
          min_charge: number;
          kyc_status: KycStatus;
          contract_signature_id: string | null;
          rating_avg: number;
          rating_count: number;
          completed_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name: string;
          slug: string;
          bio?: string | null;
          company_name?: string | null;
          vehicle_type?: VehicleType | null;
          plate?: string | null;
          service_cities?: string[];
          base_rate_per_km?: number;
          min_charge?: number;
          kyc_status?: KycStatus;
          contract_signature_id?: string | null;
          rating_avg?: number;
          rating_count?: number;
          completed_count?: number;
        };
        Update: {
          user_id?: string;
          display_name?: string;
          slug?: string;
          bio?: string | null;
          company_name?: string | null;
          vehicle_type?: VehicleType | null;
          plate?: string | null;
          service_cities?: string[];
          base_rate_per_km?: number;
          min_charge?: number;
          kyc_status?: KycStatus;
          contract_signature_id?: string | null;
          rating_avg?: number;
          rating_count?: number;
          completed_count?: number;
        };
        Relationships: [];
      };
      pets: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          species: Species;
          breed: string | null;
          weight_kg: number | null;
          age_years: number | null;
          photo_url: string | null;
          special_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          species: Species;
          breed?: string | null;
          weight_kg?: number | null;
          age_years?: number | null;
          photo_url?: string | null;
          special_notes?: string | null;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          species?: Species;
          breed?: string | null;
          weight_kg?: number | null;
          age_years?: number | null;
          photo_url?: string | null;
          special_notes?: string | null;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          customer_id: string;
          pet_id: string | null;
          pickup_address: string;
          pickup_lat: number;
          pickup_lng: number;
          pickup_city: string | null;
          dropoff_address: string;
          dropoff_lat: number;
          dropoff_lng: number;
          dropoff_city: string | null;
          distance_km: number;
          urgency: Urgency;
          est_price_min: number;
          est_price_max: number;
          scheduled_at: string | null;
          notes: string | null;
          status: ListingStatus;
          listing_fee_paid_at: string | null;
          listing_fee_amount: number | null;
          iyzico_listing_ref: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          pet_id?: string | null;
          pickup_address: string;
          pickup_lat: number;
          pickup_lng: number;
          pickup_city?: string | null;
          dropoff_address: string;
          dropoff_lat: number;
          dropoff_lng: number;
          dropoff_city?: string | null;
          distance_km: number;
          urgency?: Urgency;
          est_price_min: number;
          est_price_max: number;
          scheduled_at?: string | null;
          notes?: string | null;
          status?: ListingStatus;
        };
        Update: Partial<
          Database["public"]["Tables"]["listings"]["Insert"]
        >;
        Relationships: [];
      };
      bids: {
        Row: {
          id: string;
          listing_id: string;
          transporter_id: string;
          price: number;
          eta_hours: number | null;
          message: string | null;
          status: BidStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          transporter_id: string;
          price: number;
          eta_hours?: number | null;
          message?: string | null;
          status?: BidStatus;
        };
        Update: Partial<Database["public"]["Tables"]["bids"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      public_profiles: {
        Row: {
          id: string | null;
          full_name: string | null;
          avatar_url: string | null;
          city: string | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];
export type TransporterProfile =
  Database["public"]["Tables"]["transporter_profiles"]["Row"];
export type Pet = Database["public"]["Tables"]["pets"]["Row"];
export type Listing = Database["public"]["Tables"]["listings"]["Row"];
export type Bid = Database["public"]["Tables"]["bids"]["Row"];
