"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { loginSchema, signupSchema } from "./schemas";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validationResult = loginSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      error: "Dados inválidos. Verifique os campos e tente novamente.",
    };
  }

  const data = validationResult.data;

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error("Error during login:", error);
    return {
      error: error.message || "Erro ao fazer login. Tente novamente.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userType = user?.user_metadata?.user_type;

  revalidatePath("/", "layout");

  if (userType === "contractor") {
    redirect("/jobs/new");
  } else {
    redirect("/");
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    userType: formData.get("userType"),
  };

  const validationResult = signupSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      error: "Dados inválidos. Verifique os campos e tente novamente.",
    };
  }

  const data = validationResult.data;

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.name,
        user_type: data.userType,
      },
    },
  });

  if (error) {
    console.error("Error during sign up:", error);
    return { error: error.message || "Erro ao criar conta. Tente novamente." };
  }

  revalidatePath("/", "layout");

  if (data.userType === "contractor") {
    redirect("/jobs/new");
  } else {
    redirect("/");
  }
}
