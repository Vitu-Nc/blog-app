import { z } from "zod";

export const postFormSchema = z
  .object({
    title: z.string().trim().min(1, "Enter a title.").max(200),
    slug: z
      .string()
      .trim()
      .min(1, "Enter a slug.")
      .max(180)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers, and hyphens.",
      ),
    excerpt: z.string().trim().min(1, "Enter an excerpt.").max(500),
    content: z
      .string()
      .max(100_000, "Content must be 100,000 characters or fewer."),
    intent: z.enum(["draft", "publish", "schedule"]),
    publishedAt: z.string(),
  })
  .superRefine((post, context) => {
    if (post.intent === "schedule") {
      const parsed = z
        .string()
        .datetime({ offset: true })
        .safeParse(post.publishedAt);

      if (!parsed.success) {
        context.addIssue({
          code: "custom",
          path: ["publishedAt"],
          message: "Choose a valid date and time to schedule this post.",
        });
      } else if (new Date(post.publishedAt).getTime() <= Date.now()) {
        context.addIssue({
          code: "custom",
          path: ["publishedAt"],
          message: "Choose a future date and time.",
        });
      }
    }
  });

export type PostFormInput = z.infer<typeof postFormSchema>;

export type PostActionState = {
  fieldErrors: Partial<Record<keyof PostFormInput, string[]>>;
  message: string | null;
};

export function validatePostForm(formData: FormData) {
  return postFormSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    intent: formData.get("intent"),
    publishedAt: formData.get("publishedAt"),
  });
}

export function getPostFieldErrors(
  issues: z.ZodIssue[],
): PostActionState["fieldErrors"] {
  const fieldErrors: PostActionState["fieldErrors"] = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && field in postFormSchema.shape) {
      const key = field as keyof PostFormInput;
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
  }

  return fieldErrors;
}
