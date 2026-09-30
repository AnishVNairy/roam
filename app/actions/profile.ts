"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { initialActionState, type ActionState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";
import { normalizeUsername, validateAvatarUrl, validateMotorcycle, validateRiderDetails } from "@/lib/validation";

function value(data: FormData, key: string) { return String(data.get(key) ?? "").trim(); }
function motorcycleValues(data: FormData) { return { make: value(data, "make"), model: value(data, "model"), year: value(data, "year") }; }

export async function completeOnboardingAction(state: ActionState = initialActionState, data: FormData): Promise<ActionState> {
  void state;
  const username = normalizeUsername(value(data, "username"));
  const displayName = value(data, "displayName");
  const city = value(data, "city");
  const bio = value(data, "bio");
  const riderErrors = validateRiderDetails({ username, displayName, city, bio });
  const bike = motorcycleValues(data);
  const bikeErrors = validateMotorcycle(bike);
  const errors = { ...riderErrors, ...bikeErrors };
  if (Object.keys(errors).length) return { status: "error", message: "Check the highlighted fields.", fieldErrors: errors };

  try {
    const client = await createClient();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError || !authData.user) return { status: "error", message: "Your session expired. Sign in again." };
    const { error } = await client.from("profiles").upsert({
      id: authData.user.id, username, display_name: displayName, city: city || null, bio: bio || null,
    });
    if (error) {
      if (error.code === "23505" || error.message.toLowerCase().includes("profiles_username_key")) {
        return { status: "error", message: "That username is already in use.", fieldErrors: { username: "Choose another username." } };
      }
      return { status: "error", message: "We couldn't save your rider card. Try again." };
    }
    if (bike.make && bike.model) {
      const { error: bikeError } = await client.from("motorcycles").insert({
        user_id: authData.user.id, make: bike.make, model: bike.model, year: bike.year ? Number(bike.year) : null,
      });
      if (bikeError) return { status: "error", message: "Your rider card is saved, but we couldn't save the motorcycle. You can add it from your profile." };
    }
    revalidatePath("/profile");
  } catch {
    return { status: "error", message: "We couldn't connect to ROAM. Try again." };
  }
  redirect("/profile");
}

export async function updateProfileAction(state: ActionState = initialActionState, data: FormData): Promise<ActionState> {
  void state;
  const username = normalizeUsername(value(data, "username"));
  const displayName = value(data, "displayName");
  const city = value(data, "city");
  const bio = value(data, "bio");
  const avatarUrl = value(data, "avatarUrl");
  const bike = motorcycleValues(data);
  const fieldErrors = {
    ...validateRiderDetails({ username, displayName, city, bio }),
    ...validateMotorcycle(bike),
    ...(validateAvatarUrl(avatarUrl) ? { avatarUrl: validateAvatarUrl(avatarUrl)! } : {}),
  };
  if (Object.keys(fieldErrors).length) return { status: "error", message: "Check the highlighted fields.", fieldErrors };

  try {
    const client = await createClient();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError || !authData.user) return { status: "error", message: "Your session expired. Sign in again." };
    const userId = authData.user.id;
    const { error } = await client.from("profiles").update({ username, display_name: displayName, city: city || null, bio: bio || null, avatar_url: avatarUrl || null }).eq("id", userId);
    if (error) {
      if (error.code === "23505") return { status: "error", message: "That username is already in use.", fieldErrors: { username: "Choose another username." } };
      return { status: "error", message: "We couldn't update your rider card. Try again." };
    }

    const { data: bikes, error: readError } = await client.from("motorcycles").select("id").eq("user_id", userId).order("created_at").limit(1);
    if (readError) return { status: "error", message: "Your rider card is saved, but we couldn't load your motorcycle." };
    if (bike.make && bike.model) {
      const bikeData = { make: bike.make, model: bike.model, year: bike.year ? Number(bike.year) : null };
      const bikeResult = bikes?.[0]
        ? await client.from("motorcycles").update(bikeData).eq("id", bikes[0].id).eq("user_id", userId)
        : await client.from("motorcycles").insert({ user_id: userId, ...bikeData });
      if (bikeResult.error) return { status: "error", message: "Your rider card is saved, but we couldn't update your motorcycle." };
    } else if (bikes?.[0]) {
      const { error: deleteError } = await client.from("motorcycles").delete().eq("id", bikes[0].id).eq("user_id", userId);
      if (deleteError) return { status: "error", message: "Your rider card is saved, but we couldn't remove your motorcycle." };
    }
    revalidatePath("/profile");
    revalidatePath("/profile/edit");
  } catch {
    return { status: "error", message: "We couldn't connect to ROAM. Try again." };
  }
  redirect("/profile");
}
