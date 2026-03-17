import { z } from "zod";

const socialLinkSchema = z.object({
  platform: z.string().min(1),
  label: z.string().min(1),
  url: z.url(),
  color: z.string().min(1),
  logo: z.string().min(1),
});

const svgDimensionsSchema = z.object({
  width: z.number().int().positive().max(3000),
  height: z.number().int().positive().max(3000),
});

const techItemSchema = z.object({
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color (e.g. #ff9900)"),
  iconType: z.enum(["svg", "rect-text"]),
  iconData: z.string().min(1),
});

const skillsSchema = z.object({
  languages: z.array(z.string().min(1)),
  frontend: z.array(z.string().min(1)),
  backend: z.array(z.string().min(1)),
  databases: z.array(z.string().min(1)),
  tools: z.array(z.string().min(1)),
  learning: z.array(z.string().min(1)),
});

const validThemes = ["dark", "light", "dracula", "nord"] as const;

export const profileConfigSchema = z.object({
  defaults: z.object({
    name: z.string().min(1),
    location: z.string().min(1),
    bio: z.string().min(1),
    company: z.string().min(1),
    blog: z.string().min(1),
  }),
  techStack: z.array(techItemSchema).min(1),
  quote: z.string().min(1),
  socialLinks: z.array(socialLinkSchema).min(1),
  svg: svgDimensionsSchema,
  theme: z.enum(validThemes),
  skills: skillsSchema,
});

export type ValidatedProfileConfig = z.infer<typeof profileConfigSchema>;

export function validateConfig(config: unknown): ValidatedProfileConfig {
  return profileConfigSchema.parse(config);
}
