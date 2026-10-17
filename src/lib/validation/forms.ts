import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const publicEnquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  organisation: optionalText(160),
  phone: optionalText(50),
  enquiryType: optionalText(120),
  opportunityName: optionalText(200),
  countryMarket: optionalText(200),
  role: optionalText(120),
  projectMandate: optionalText(2000),
  timeframe: optionalText(120),
  budgetRange: optionalText(120),
  message: z.string().trim().min(10, "Please add a little more detail.").max(5000),
  website: z.string().max(300).optional().or(z.literal("")),
  turnstileToken: z.string().max(5000).optional().or(z.literal("")),
});
