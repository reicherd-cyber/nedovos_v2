import { z } from "zod";

export type PublicOption = {
  key: string;
  title: string;
  description?: string;
  tone: "progress-coral" | "progress-amber" | "neutral" | "soft";
  currentAmount?: number;
  targetAmount?: number;
  recurringDefault?: boolean;
};

const publicOptionSchema = z.object({
  key: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  tone: z.enum(["progress-coral", "progress-amber", "neutral", "soft"]),
  currentAmount: z.number().finite().nonnegative().optional(),
  targetAmount: z.number().finite().positive().optional(),
  recurringDefault: z.boolean().optional(),
});

const publicOptionsSchema = z.array(publicOptionSchema);

export const DEFAULT_PUBLIC_OPTION: PublicOption = {
  key: "general",
  title: "תרומה כללית",
  description: "מעבר למסלול תרומה כללי של הארגון.",
  tone: "soft",
};

export function getPublicOptionsFromDefinition(definition: unknown): PublicOption[] {
  const parsed = publicOptionsSchema.safeParse(definition);

  if (!parsed.success || parsed.data.length === 0) {
    return [DEFAULT_PUBLIC_OPTION];
  }

  return parsed.data;
}

export function getPublicOptionByKey(options: PublicOption[], key?: string) {
  return options.find((option) => option.key === key) ?? options[0] ?? DEFAULT_PUBLIC_OPTION;
}
