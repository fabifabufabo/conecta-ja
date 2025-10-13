"use server";

import { JOBS_PAGE_SIZE } from "@/lib/constants";
import { createClient } from "@/utils/supabase/server";

export async function getJobs({
  searchQuery,
  category,
  page = 1,
  pageSize = JOBS_PAGE_SIZE,
}: {
  searchQuery?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("status", "open");

  if (searchQuery) {
    const searchFields = ["title", "description", "location_text"]
      .map((field) => `${field}.ilike.%${searchQuery}%`)
      .join(",");
    query = query.or(searchFields);
  }

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to).order("created_at", { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching jobs:", error);
    return { data: null, error: error.message, count: 0 };
  }

  return { data, error: null, count: count ?? 0 };
}
