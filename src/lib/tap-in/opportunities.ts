import "server-only";
import { cmsBridge } from "@/lib/cms-bridge";

export type OpportunityStatus = "draft" | "live" | "closed" | "archived";

export type TapInOpportunity = {
  id: string;
  slug: string;
  title: string;
  country: string;
  region: string;
  sector: string;
  opportunity_type: string;
  description: string;
  who_this_is_for: string;
  enquiry_questions: string[];
  status: OpportunityStatus;
  image_url: string | null;
  share_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

export type OpportunityInput = Omit<TapInOpportunity, "id" | "created_at" | "updated_at">;

export async function listAllOpportunities() {
  const result = await cmsBridge<{ opportunities?: TapInOpportunity[] }>({ action: "tap-in.listAll" });
  return result.opportunities ?? [];
}

export async function listLiveOpportunities() {
  const result = await cmsBridge<{ opportunities?: TapInOpportunity[] }>({ action: "tap-in.listLive" });
  return result.opportunities ?? [];
}

export async function findPublicOpportunityBySlug(slug: string) {
  const result = await cmsBridge<{ opportunity?: TapInOpportunity | null }>({ action: "tap-in.findPublicBySlug", slug });
  return result.opportunity ?? null;
}

export async function findOpportunityBySlug(slug: string) {
  const result = await cmsBridge<{ opportunity?: Pick<TapInOpportunity, "id" | "slug"> | null }>({ action: "tap-in.findBySlug", slug });
  return result.opportunity ?? null;
}

export async function createOpportunity(input: OpportunityInput) {
  const result = await cmsBridge<{ opportunity: TapInOpportunity }>({ action: "tap-in.create", opportunity: input as unknown as Record<string, unknown> });
  return result.opportunity;
}

export async function updateOpportunity(id: string, input: OpportunityInput) {
  const result = await cmsBridge<{ opportunity: TapInOpportunity | null }>({ action: "tap-in.update", id, opportunity: input as unknown as Record<string, unknown> });
  return result.opportunity;
}
