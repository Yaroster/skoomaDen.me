import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z
      .string()
      .or(z.date())
      .transform((val) =>
        new Date(val).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      ),
    tags: z.array(z.string()).optional(),
    cover: z.string().optional(),
    lang: z.enum(["en", "fr"]), // Champ de langue
    translationOf: z.string().optional(), // Champ de traduction, optionnel
  }),
});

export const collections = { blog };
