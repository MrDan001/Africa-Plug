// FILE PATH: src/lib/tap-in/forms.ts
// Validation shared by the T.A.P IN forms (browser options and server routes).
import { z } from "zod";
import { COUNTRIES } from "@/lib/work-with-fk/application-schema";
import { REGION_FILTERS } from "@/lib/tap-in/public";

export { COUNTRIES };
export const INTEREST_TIMEFRAMES = ["Now", "Within 3 months", "Exploring"] as const;
export const REGISTER_REGIONS = ["Any region", ...REGION_FILTERS] as const;

const text = (label: string, max: number) =>
  z.string().trim().min(1, `Please enter ${label}.`).max(max, `${label[0].toUpperCase()}${label.slice(1)} is too long.`);
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const email = z.string().trim().email("Enter a valid email address.").max(254);
const consent = z.literal(true, { message: "Please agree to the Privacy Policy and Terms." });
const spam = {
  website: z.string().max(300).optional().or(z.literal("")), // honeypot
  turnstileToken: z.string().max(5000).optional().or(z.literal("")),
};

export const interestSchema = z.object({
  name: text("your full name", 120),
  company: optionalText(160),
  email,
  phone: z.string().trim().max(30).regex(/^\+[0-9][0-9 ()-]{5,28}$/, "Please include your country code, for example +234.").optional().or(z.literal("")),
  country: z.enum(COUNTRIES, { message: "Please choose the country you are based in." }),
  looking: text("what you are looking for", 500),
  timeframe: z.enum(INTEREST_TIMEFRAMES).optional().or(z.literal("")),
  consent,
  ...spam,
});

export const registerSchema = z.object({
  name: text("your name", 120),
  company: optionalText(160),
  email,
  looking: text("what you are looking for", 1000),
  region: z.enum(REGISTER_REGIONS, { message: "Please choose a region of interest." }),
  consent,
  ...spam,
});

export const opportunitySchema = z.object({
  name: text("your name", 120),
  company: optionalText(160),
  email,
  offer: text("what’s on offer", 2000),
  location: text("the location", 200),
  partner: text("the type of commercial partner sought", 300),
  consent,
  ...spam,
});

export const alertsSchema = z.object({
  email,
  website: z.string().max(300).optional().or(z.literal("")),
});

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;