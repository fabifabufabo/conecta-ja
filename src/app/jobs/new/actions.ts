"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { newJobSchema } from "../schemas";

export async function createJob(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const rawData = {
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    location: formData.get("location"),
    price: formData.get("price")
      ? Number.parseFloat(formData.get("price") as string)
      : undefined,
  };

  const validationResult = newJobSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      error: "Dados inválidos. Verifique os campos e tente novamente.",
    };
  }

  const data = validationResult.data;

  const { error } = await supabase.from("jobs").insert({
    title: data.title,
    category: data.category,
    description: data.description,
    location_text: data.location,
    value: data.price,
    contractor_id: user.id,
    status: "open",
  });

  if (error) {
    console.error("Error creating job:", error);
    return {
      error: "Erro ao criar trabalho. Tente novamente.",
    };
  }

  revalidatePath("/jobs", "layout");
  redirect("/jobs");
}
