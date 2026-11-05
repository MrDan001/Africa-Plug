import { notFound } from "next/navigation";
import AdminModuleClient from "@/components/admin/AdminModuleClient";

type ModuleKey = Parameters<typeof AdminModuleClient>[0]["moduleKey"];
const moduleMap = {
  blog: "blog",
  store: "store",
  "work-with-fk": "work-with-fk",
  "review-required": "review-required",
  enquiries: "enquiries",
  subscribers: "subscribers",
  analytics: "analytics",
  media: "media",
  settings: "settings",
  "site-settings": "site-settings",
} satisfies Record<string, ModuleKey>;

export const dynamic = "force-dynamic";

export default async function AdminModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const moduleKey = moduleMap[module as keyof typeof moduleMap];
  if (!moduleKey) notFound();
  return <AdminModuleClient moduleKey={moduleKey} />;
}
