import { CourseDetailsPage } from "../../../components/catalog";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CourseDetailsPage key={slug} slug={slug} />;
}
