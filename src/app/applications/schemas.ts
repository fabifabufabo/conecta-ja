export const APPLICATIONS_STATUSES = ["pending", "accepted"] as const;

export const APPLICATIONS_STATUSES_LABELS = {
  pending: "Pendente",
  accepted: "Aceito",
} satisfies Record<(typeof APPLICATIONS_STATUSES)[number], string>;

export type Application = {
  id: number;
  job_id: number;
  freelancer_id: string;
  status: (typeof APPLICATIONS_STATUSES)[number];
  created_at: string;
};

export type ApplicatioWithDetails = Application & {
  profiles: {
    full_name: string;
  };
  jobs: {
    title: string;
    value: number;
  };
};
