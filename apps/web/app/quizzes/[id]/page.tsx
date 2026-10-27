import { QuizPage } from "../../../components/learning";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuizPage key={id} id={id} />;
}
