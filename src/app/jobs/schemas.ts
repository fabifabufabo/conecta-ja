import * as z from "zod";

export const JOB_CATEGORIES = [
  "painting",
  "plumbing",
  "cleaning",
  "moving",
  "other",
] as const;

export const JOB_CATEGORY_LABELS = {
  painting: "Pintura",
  plumbing: "Encanamento",
  cleaning: "Limpeza",
  moving: "Mudança",
  other: "Outro",
} satisfies Record<(typeof JOB_CATEGORIES)[number], string>;

export const jobCategoriesOptions = JOB_CATEGORIES.map((value) => ({
  value,
  label: JOB_CATEGORY_LABELS[value],
}));

export const newJobSchema = z.object({
  title: z.string().min(5, "O título deve ter no mínimo 5 caracteres"),
  category: z.enum(JOB_CATEGORIES),
  description: z
    .string()
    .min(10, "A descrição deve ter no mínimo 10 caracteres"),
  location: z.string().min(3, "A localização deve ter no mínimo 3 caracteres"),
  price: z
    .number({ error: "O preço é obrigatório" })
    .min(0, "O preço deve ser um valor positivo"),
});

export type NewJobFormData = z.infer<typeof newJobSchema>;

export type Job = {
  id: number;
  title: string;
  description: string;
  category: (typeof JOB_CATEGORIES)[number];
  location_text: string;
  value: number;
  status: string;
  created_at: string;
  contractor_id: string;
  freelancer_id: string | null;
};
