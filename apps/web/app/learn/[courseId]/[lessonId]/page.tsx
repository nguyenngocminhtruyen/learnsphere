import { LessonPlayerPage } from "../../../../components/learning";
export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  return (
    <LessonPlayerPage
      key={`${courseId}:${lessonId}`}
      courseId={courseId}
      lessonId={lessonId}
    />
  );
}
