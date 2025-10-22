"use server";

import { APPLICATIONS_PAGE_SIZE } from "@/lib/constants";
import { createClient } from "@/utils/supabase/server";

export async function getApplications({
  category,
  page = 1,
  pageSize = APPLICATIONS_PAGE_SIZE,
}: {
  category?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("applications")
    .select("*, profiles(full_name), jobs(title, value)", {
      count: "exact",
    });

  if (category && category !== "all") {
    query = query.eq("status", category);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to).order("created_at", { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching applications:", error);
    return { data: null, error: error.message, count: 0 };
  }

  return { data, error: null, count: count ?? 0 };
}

export async function acceptJobApplication(applicationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Usuário não autenticado. Faça login para continuar." };
  }

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select("status")
    .eq("id", applicationId)
    .single();

  if (applicationError || !application) {
    console.error("Error fetching job application status:", applicationError);
    return { error: "Erro ao buscar status da proposta. Tente novamente." };
  }

  if (application.status !== "pending") {
    return { error: "Esta proposta já foi aceita." };
  }

  const { error: updateError } = await supabase
    .from("applications")
    .update({ status: "accepted" })
    .eq("id", applicationId);

  if (updateError) {
    console.error("Error accepting job application:", updateError);
    return { error: "Erro ao aceitar proposta. Tente novamente." };
  }

  return { success: true };
}
