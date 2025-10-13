"use server";

import { createClient } from "@/utils/supabase/server";

export async function getJobs() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching jobs:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
