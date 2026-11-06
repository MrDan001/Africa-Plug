// FILE PATH: src/lib/work-with-fk/application-schema.ts
// Shared by the Work With FK application form (client) and its API route (server).
import { z } from "zod";

export const DEAL_STAGES = ["Before we commit", "While it’s moving", "It has stalled"] as const;
export const TIMEFRAMES = ["Now", "Within 3 months", "Within 6 months"] as const;
export const HEAR_ABOUT = ["LinkedIn", "Instagram", "YouTube", "Search", "Referral", "Other"] as const;

export const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan",
  "Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi",
  "Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (Republic)","Congo (Democratic Republic)","Costa Rica","Côte d’Ivoire","Croatia","Cuba","Cyprus","Czechia",
  "Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
  "Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
  "Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan",
  "Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
  "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar",
  "Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Macedonia","Norway","Oman",
  "Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda",
  "Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","São Tomé and Príncipe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria",
  "Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Türkiye","Turkmenistan","Tuvalu",
  "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe","Other",
] as const;

export const AFRICAN_COUNTRIES = [
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde",
  "Cameroon", "Central African Republic", "Chad", "Comoros", "Congo (Democratic Republic)",
  "Congo (Republic)", "Côte d’Ivoire", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea",
  "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya",
  "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius",
  "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "São Tomé and Príncipe",
  "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan",
  "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe",
] as const;

const required = (label: string, max: number) =>
  z.string().trim().min(1, `Please enter ${label}.`).max(max, `${label[0].toUpperCase()}${label.slice(1)} is too long.`);

export const applicationSchema = z.object({
  fullName: required("your full name", 120),
  role: required("your role", 120),
  company: required("your company or organisation", 160),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^\+[0-9][0-9 ()-]{5,28}$/, "Please include your country code, for example +234.")
    .optional()
    .or(z.literal("")),
  country: z.enum(COUNTRIES, { message: "Please choose the country you are based in." }),
  markets: required("the market or markets involved", 200),
  dealStage: z.enum(DEAL_STAGES, { message: "Please tell us where the deal is now." }),
  goal: required("what you are trying to get done", 1000),
  obstacle: required("what is in the way", 1000),
  timeframe: z.enum(TIMEFRAMES, { message: "Please choose a timeframe." }),
  hearAbout: z.enum(HEAR_ABOUT).optional().or(z.literal("")),
  consent: z.literal(true, { message: "Please agree to the Privacy Policy and Terms." }),
  website: z.string().max(300).optional().or(z.literal("")), // honeypot
  turnstileToken: z.string().max(5000).optional().or(z.literal("")),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

// 30 minute call request (/work-with-fk/call)
export const callSchema = z.object({
  fullName: required("your full name", 120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  country: z.enum(COUNTRIES, { message: "Please choose the country you are based in." }),
  question: required("your question", 500),
  consent: z.literal(true, { message: "Please agree to the Privacy Policy and Terms." }),
  website: z.string().max(300).optional().or(z.literal("")), // honeypot
  turnstileToken: z.string().max(5000).optional().or(z.literal("")),
});

export type CallInput = z.infer<typeof callSchema>;