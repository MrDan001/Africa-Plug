// Shared by the Work With FK application form (client) and its API route (server).
import { z } from "zod";

// ISO 3166-1 alpha-2 country and territory codes. Labels are generated using
// the platform's English locale data so the list stays consistent in browser and server.
const COUNTRY_CODES = [
  "AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR","AS","AT","AU","AW","AX","AZ",
  "BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR","BS","BT","BV","BW","BY","BZ",
  "CA","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","CR","CU","CV","CW","CX","CY","CZ",
  "DE","DJ","DK","DM","DO","DZ",
  "EC","EE","EG","EH","ER","ES","ET",
  "FI","FJ","FK","FM","FO","FR",
  "GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU","GW","GY",
  "HK","HM","HN","HR","HT","HU",
  "ID","IE","IL","IM","IN","IO","IQ","IR","IS","IT",
  "JE","JM","JO","JP",
  "KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ",
  "LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY",
  "MA","MC","MD","ME","MF","MG","MH","MK","ML","MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV","MW","MX","MY","MZ",
  "NA","NC","NE","NF","NG","NI","NL","NO","NP","NR","NU","NZ",
  "OM",
  "PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PS","PT","PW","PY",
  "QA",
  "RE","RO","RS","RU","RW",
  "SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","SS","ST","SV","SX","SY","SZ",
  "TC","TD","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TR","TT","TV","TW","TZ",
  "UA","UG","UM","US","UY","UZ",
  "VA","VC","VE","VG","VI","VN","VU",
  "WF","WS",
  "YE","YT",
  "ZA","ZM","ZW"
] as const;

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
// Retain the Africa-only list for existing T.A.P IN interfaces and filters.
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

export const COUNTRIES = COUNTRY_CODES
  .map((code) => countryNames.of(code) ?? code)
  .filter((name) => name.length > 0)
  .sort((a, b) => a.localeCompare(b, "en"));

const countryField = z.string().trim().min(1, "Please choose a country.").max(100)
  .refine((value) => COUNTRIES.includes(value), "Please choose a country from the list.");

export const DEAL_STAGES = ["Before we commit", "While it’s moving", "It has stalled"] as const;
export const TIMEFRAMES = ["Now", "Within 3 months", "Within 6 months", "Later than 6 months"] as const;
export const HEAR_ABOUT = ["LinkedIn", "Instagram", "YouTube", "Search", "Referral", "Other"] as const;

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
  country: countryField,
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
  country: countryField,
  question: required("your question", 500),
  consent: z.literal(true, { message: "Please agree to the Privacy Policy and Terms." }),
  sessionConsent: z.literal(true, { message: "Please confirm the session cancellation terms." }),
  website: z.string().max(300).optional().or(z.literal("")), // honeypot
  turnstileToken: z.string().max(5000).optional().or(z.literal("")),
});

export type CallInput = z.infer<typeof callSchema>;
