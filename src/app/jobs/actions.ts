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

export async function sendJobApplication(jobId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Usuário não autenticado. Faça login para continuar." };
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("status")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    console.error("Error fetching job status:", jobError);
    return { error: "Erro ao buscar status da vaga. Tente novamente." };
  }

  if (job.status !== "open") {
    return { error: "Esta vaga não está mais aceitando candidaturas." };
  }

  const { data: existingApplication, error: applicationError } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", jobId)
    .eq("freelancer_id", user.id)
    .maybeSingle();

  if (applicationError) {
    console.error("Error checking existing application:", applicationError);
    return { error: "Erro ao verificar candidatura. Tente novamente." };
  }

  if (existingApplication) {
    return { error: "Você já se candidatou para esta vaga." };
  }

  const { error: insertError } = await supabase.from("applications").insert({
    job_id: jobId,
    freelancer_id: user.id,
    status: "pending",
  });

  if (insertError) {
    console.error("Error sending job application:", insertError);
    return { error: "Erro ao enviar candidatura. Tente novamente." };
  }

  return { success: true };
}
