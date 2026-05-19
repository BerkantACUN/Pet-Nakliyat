"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRoute } from "@/lib/mapbox/directions";
import { quote } from "@/lib/pricing";
import {
  listingDraftSchema,
  type ListingDraftInput,
} from "@/lib/validations/listing";
import type { ActionResult } from "@/app/(auth)/actions";

function flattenZodError(err: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function createListingDraftAction(
  input: ListingDraftInput,
): Promise<ActionResult & { id?: string }> {
  const parsed = listingDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZodError(parsed.error) };
  }
  const {
    petId,
    pickup,
    dropoff,
    scheduledAt,
    urgency,
    notes,
    careNotes,
    feedingDuringTransit,
    carrierProvided,
    temperaturePreference,
  } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  // Distance Mapbox üzerinden — token yoksa haversine × yol faktörü fallback
  let distanceKm: number;
  if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    try {
      const route = await getRoute(
        [pickup.lng, pickup.lat],
        [dropoff.lng, dropoff.lat],
      );
      distanceKm = route.distanceKm;
    } catch {
      distanceKm = estimateRoadKm(
        pickup.lat,
        pickup.lng,
        dropoff.lat,
        dropoff.lng,
      );
    }
  } else {
    distanceKm = estimateRoadKm(
      pickup.lat,
      pickup.lng,
      dropoff.lat,
      dropoff.lng,
    );
  }

  // Pet ağırlığını al (fiyat çarpanı için)
  const { data: pet } = await supabase
    .from("pets")
    .select("weight_kg")
    .eq("id", petId)
    .eq("owner_id", user.id)
    .maybeSingle();

  const q = quote({
    distanceKm,
    baseRatePerKm: 8,
    minCharge: 350,
    urgency,
    weightKg: pet?.weight_kg ?? 10,
  });

  const { data: inserted, error } = await supabase
    .from("listings")
    .insert({
      customer_id: user.id,
      pet_id: petId,
      pickup_address: pickup.address,
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
      pickup_city: pickup.city,
      dropoff_address: dropoff.address,
      dropoff_lat: dropoff.lat,
      dropoff_lng: dropoff.lng,
      dropoff_city: dropoff.city,
      distance_km: distanceKm,
      urgency,
      est_price_min: q.estMin,
      est_price_max: q.estMax,
      scheduled_at: new Date(scheduledAt).toISOString(),
      notes: notes || null,
      care_notes: careNotes || null,
      feeding_during_transit: feedingDuringTransit ?? false,
      carrier_provided: carrierProvided
        ? (carrierProvided as "customer" | "transporter" | "none")
        : null,
      temperature_preference: temperaturePreference
        ? (temperaturePreference as "cool" | "normal" | "warm")
        : null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/musteri/ilanlarim");
  return { ok: true, id: inserted.id };
}

export async function redirectToListingAction(id: string): Promise<void> {
  redirect(`/musteri/${id}`);
}

function estimateRoadKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const greatCircle = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // TR yol ağı için ortalama bükülme faktörü ~1.3
  return Math.round(greatCircle * 1.3 * 10) / 10;
}
