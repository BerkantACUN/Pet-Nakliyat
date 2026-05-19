/**
 * Patiyolu — Supabase Database tipleri (hand-rolled, supabase-js v2 ile uyumlu).
 */

export type AppRole = "customer" | "transporter" | "sitter" | "vet";
export type Species = "dog" | "cat" | "bird" | "rabbit" | "other";
export type VehicleType = "car" | "van" | "truck";
export type Region =
  | "marmara"
  | "ege"
  | "akdeniz"
  | "ic_anadolu"
  | "karadeniz"
  | "dogu_anadolu"
  | "guneydogu_anadolu";
export type FoodType = "dry" | "wet" | "raw" | "home_cooked" | "mixed" | "other";
export type CarrierProvided = "customer" | "transporter" | "none";
export type TemperaturePreference = "cool" | "normal" | "warm";
export type KycStatus = "pending" | "approved" | "rejected";
export type Urgency = "standard" | "express" | "sameday";
export type ListingStatus =
  | "draft"
  | "published"
  | "closed"
  | "expired"
  | "cancelled";
export type BidStatus = "pending" | "accepted" | "rejected" | "withdrawn";
export type ContractAudience = "transporter" | "customer";
export type KycDocType =
  | "id_front"
  | "id_back"
  | "plate_photo"
  | "vehicle_registration";
export type KycDocStatus = "pending" | "approved" | "rejected";
export type BookingStatus =
  | "pending_payment"
  | "accepted"
  | "en_route"
  | "delivered"
  | "completed"
  | "cancelled"
  | "disputed";
export type PaymentType =
  | "listing_fee"
  | "booking_commission"
  | "booking_full"
  | "refund";
export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

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
          bio: string | null;
          cover_url: string | null;
          last_seen_at: string | null;
          region: Region | null;
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
          bio?: string | null;
          cover_url?: string | null;
          last_seen_at?: string | null;
          region?: Region | null;
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
          bio?: string | null;
          cover_url?: string | null;
          last_seen_at?: string | null;
          region?: Region | null;
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
          contract_signed_at: string | null;
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
          contract_signed_at?: string | null;
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
          contract_signed_at?: string | null;
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
          food_brand: string | null;
          food_type: FoodType | null;
          feeding_times: string[];
          toilet_times: string[];
          medications: string | null;
          is_neutered: boolean;
          is_vaccinated: boolean;
          vet_contact: string | null;
          emergency_contact: string | null;
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
          food_brand?: string | null;
          food_type?: FoodType | null;
          feeding_times?: string[];
          toilet_times?: string[];
          medications?: string | null;
          is_neutered?: boolean;
          is_vaccinated?: boolean;
          vet_contact?: string | null;
          emergency_contact?: string | null;
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
          food_brand?: string | null;
          food_type?: FoodType | null;
          feeding_times?: string[];
          toilet_times?: string[];
          medications?: string | null;
          is_neutered?: boolean;
          is_vaccinated?: boolean;
          vet_contact?: string | null;
          emergency_contact?: string | null;
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
          care_notes: string | null;
          feeding_during_transit: boolean;
          carrier_provided: CarrierProvided | null;
          temperature_preference: TemperaturePreference | null;
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
          published_at?: string | null;
          listing_fee_paid_at?: string | null;
          listing_fee_amount?: number | null;
          iyzico_listing_ref?: string | null;
          care_notes?: string | null;
          feeding_during_transit?: boolean;
          carrier_provided?: CarrierProvided | null;
          temperature_preference?: TemperaturePreference | null;
        };
        Update: {
          pet_id?: string | null;
          pickup_address?: string;
          pickup_lat?: number;
          pickup_lng?: number;
          pickup_city?: string | null;
          dropoff_address?: string;
          dropoff_lat?: number;
          dropoff_lng?: number;
          dropoff_city?: string | null;
          distance_km?: number;
          urgency?: Urgency;
          est_price_min?: number;
          est_price_max?: number;
          scheduled_at?: string | null;
          notes?: string | null;
          status?: ListingStatus;
          published_at?: string | null;
          listing_fee_paid_at?: string | null;
          listing_fee_amount?: number | null;
          iyzico_listing_ref?: string | null;
          care_notes?: string | null;
          feeding_during_transit?: boolean;
          carrier_provided?: CarrierProvided | null;
          temperature_preference?: TemperaturePreference | null;
        };
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
      contract_templates: {
        Row: {
          id: string;
          version: string;
          audience: ContractAudience;
          title: string;
          content_md: string;
          word_count: number;
          effective_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          version: string;
          audience: ContractAudience;
          title: string;
          content_md: string;
          word_count?: number;
          effective_at?: string;
        };
        Update: {
          version?: string;
          audience?: ContractAudience;
          title?: string;
          content_md?: string;
          word_count?: number;
          effective_at?: string;
        };
        Relationships: [];
      };
      contract_signatures: {
        Row: {
          id: string;
          user_id: string;
          template_id: string;
          signed_full_name: string;
          signed_ip: string | null;
          signed_user_agent: string | null;
          signature_hash: string;
          signed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id: string;
          signed_full_name: string;
          signed_ip?: string | null;
          signed_user_agent?: string | null;
          signature_hash: string;
          signed_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          listing_id: string;
          bid_id: string;
          transporter_id: string;
          customer_id: string;
          agreed_price: number;
          platform_fee: number;
          status: BookingStatus;
          iyzico_payment_ref: string | null;
          paid_at: string | null;
          started_at: string | null;
          delivered_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          cancelled_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          bid_id: string;
          transporter_id: string;
          customer_id: string;
          agreed_price: number;
          platform_fee: number;
          status?: BookingStatus;
          iyzico_payment_ref?: string | null;
          paid_at?: string | null;
        };
        Update: {
          status?: BookingStatus;
          iyzico_payment_ref?: string | null;
          paid_at?: string | null;
          started_at?: string | null;
          delivered_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancelled_reason?: string | null;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          listing_id: string | null;
          customer_id: string;
          transporter_id: string;
          booking_id: string | null;
          last_message_at: string | null;
          customer_unread_count: number;
          transporter_unread_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id?: string | null;
          customer_id: string;
          transporter_id: string;
          booking_id?: string | null;
          last_message_at?: string | null;
          customer_unread_count?: number;
          transporter_unread_count?: number;
        };
        Update: {
          booking_id?: string | null;
          last_message_at?: string | null;
          customer_unread_count?: number;
          transporter_unread_count?: number;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          read_at?: string | null;
        };
        Update: {
          read_at?: string | null;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          type: PaymentType;
          amount: number;
          currency: string;
          provider: string;
          provider_ref: string | null;
          status: PaymentStatus;
          related_listing: string | null;
          related_booking: string | null;
          raw_response: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: PaymentType;
          amount: number;
          currency?: string;
          provider?: string;
          provider_ref?: string | null;
          status?: PaymentStatus;
          related_listing?: string | null;
          related_booking?: string | null;
          raw_response?: Json | null;
        };
        Update: {
          status?: PaymentStatus;
          provider_ref?: string | null;
          raw_response?: Json | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          author_id: string;
          target_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          author_id: string;
          target_id: string;
          rating: number;
          comment?: string | null;
        };
        Update: never;
        Relationships: [];
      };
      kyc_documents: {
        Row: {
          id: string;
          user_id: string;
          doc_type: KycDocType;
          storage_path: string;
          status: KycDocStatus;
          reviewer_note: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          doc_type: KycDocType;
          storage_path: string;
          status?: KycDocStatus;
          reviewer_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          storage_path?: string;
          status?: KycDocStatus;
          reviewer_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Relationships: [];
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type:
            | "follow"
            | "bid_received"
            | "bid_accepted"
            | "bid_rejected"
            | "message"
            | "booking_update"
            | "review_received"
            | "post_like"
            | "post_comment";
          actor_id: string | null;
          related_listing: string | null;
          related_bid: string | null;
          related_booking: string | null;
          related_conversation: string | null;
          related_post: string | null;
          payload: Json | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type:
            | "follow"
            | "bid_received"
            | "bid_accepted"
            | "bid_rejected"
            | "message"
            | "booking_update"
            | "review_received"
            | "post_like"
            | "post_comment";
          actor_id?: string | null;
          related_listing?: string | null;
          related_bid?: string | null;
          related_booking?: string | null;
          related_conversation?: string | null;
          related_post?: string | null;
          payload?: Json | null;
          read_at?: string | null;
        };
        Update: {
          read_at?: string | null;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          body: string;
          image_url: string | null;
          pet_id: string | null;
          like_count: number;
          comment_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          body: string;
          image_url?: string | null;
          pet_id?: string | null;
          like_count?: number;
          comment_count?: number;
        };
        Update: {
          body?: string;
          image_url?: string | null;
          pet_id?: string | null;
        };
        Relationships: [];
      };
      post_likes: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
        };
        Update: never;
        Relationships: [];
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          body: string;
        };
        Update: {
          body?: string;
        };
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
      profile_stats: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          cover_url: string | null;
          bio: string | null;
          city: string | null;
          region: Region | null;
          created_at: string;
          last_seen_at: string | null;
          rating_avg: number;
          rating_count: number;
          completed_count: number;
          service_cities: string[] | null;
          vehicle_type: VehicleType | null;
          transporter_slug: string | null;
          is_transporter: boolean;
          is_customer: boolean;
          followers_count: number;
          following_count: number;
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
export type ContractTemplate =
  Database["public"]["Tables"]["contract_templates"]["Row"];
export type ContractSignature =
  Database["public"]["Tables"]["contract_signatures"]["Row"];
export type KycDocument = Database["public"]["Tables"]["kyc_documents"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Follow = Database["public"]["Tables"]["follows"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationType = Notification["type"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type PostLike = Database["public"]["Tables"]["post_likes"]["Row"];
export type PostComment = Database["public"]["Tables"]["post_comments"]["Row"];
