import { CatalogPage } from "../../components/catalog";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; subject?: string }>;
}) {
  const params = await searchParams;
  return (
    <CatalogPage
      key={`${params.q ?? ""}/${params.subject ?? ""}`}
      initialQuery={typeof params.q === "string" ? params.q : ""}
      initialSubject={typeof params.subject === "string" ? params.subject : ""}
    />
  );
}
