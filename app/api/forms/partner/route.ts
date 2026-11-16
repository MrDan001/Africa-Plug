import { handleLeadSubmission } from "@/lib/forms/submit-lead";
export async function POST(request: Request) { return handleLeadSubmission(request, "partner"); }
