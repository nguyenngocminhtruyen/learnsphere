export type Locale = "en" | "vi";
export type LocalizedText = Record<Locale, string>;
export interface Lesson {
  id: string;
  title: string;
  type: "video" | "reading" | "quiz";
  duration: string;
  content: string;
}
export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}
export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  subject: "AI" | "Development" | "Cloud" | "Data";
  level: "Beginner" | "Intermediate" | "Advanced";
  language: Locale;
  instructor: { name: string; title: string; initials: string };
  rating: number;
  learners: number;
  duration: string;
  skills: string[];
  outcomes: string[];
  modules: Module[];
  status: "draft" | "published";
  color: string;
  art: "python" | "java" | "cloud" | "rag" | "ml" | "llm";
  featured: boolean;
}
export interface Enrollment {
  courseId: string;
  enrolledAt: string;
}
export interface StudentProgress {
  courseId: string;
  completedLessonIds: string[];
}
export interface Quiz {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  questions: {
    id: string;
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}
export interface GeneratedDraft {
  id: string;
  title: string;
  courseId: string;
  modules: Module[];
  status: "review" | "approved";
  createdAt: string;
}
export interface CourseFilterOptions {
  query?: string;
  subject?: string;
  level?: string;
  language?: string;
  sort?: "popular" | "rating" | "title" | string;
}

/** A future Java API adapter can implement this boundary without changing UI models. */
export interface CourseRepository {
  list(): Course[];
  find(idOrSlug: string): Course | undefined;
}

export function findCourse(
  courses: Course[],
  idOrSlug: string,
): Course | undefined {
  return courses.find(
    (course) => course.id === idOrSlug || course.slug === idOrSlug,
  );
}

export function firstLesson(course: Course): Lesson | undefined {
  return course.modules.flatMap((module) => module.lessons)[0];
}

export function getCourseProgress(
  course: Course,
  progress: StudentProgress[],
): number {
  const lessons = course.modules.flatMap((module) => module.lessons);
  if (!lessons.length) return 0;
  const completed = new Set(
    progress.find((item) => item.courseId === course.id)?.completedLessonIds ??
      [],
  );
  return Math.round(
    (lessons.filter((lesson) => completed.has(lesson.id)).length /
      lessons.length) *
      100,
  );
}

export function filterCourses(
  courses: Course[],
  filters: CourseFilterOptions = {},
): Course[] {
  const query = (filters.query ?? "").trim().toLocaleLowerCase();
  const isAll = (value: string | undefined) => !value || value === "all";
  return courses
    .filter((course) => {
      const searchable = [
        course.title,
        course.subtitle,
        course.instructor.name,
        course.subject,
        ...course.skills,
      ]
        .join(" ")
        .toLocaleLowerCase();
      return (
        course.status === "published" &&
        (!query || searchable.includes(query)) &&
        (isAll(filters.subject) || course.subject === filters.subject) &&
        (isAll(filters.level) || course.level === filters.level) &&
        (isAll(filters.language) || course.language === filters.language)
      );
    })
    .sort((a, b) =>
      filters.sort === "title"
        ? a.title.localeCompare(b.title)
        : filters.sort === "rating"
          ? b.rating - a.rating
          : b.learners - a.learners,
    );
}

export function enrollInCourse(
  courses: Course[],
  enrollments: Enrollment[],
  courseId: string,
  enrolledAt: string,
): Enrollment[] {
  if (
    !courses.some(
      (course) => course.id === courseId && course.status === "published",
    ) ||
    enrollments.some((item) => item.courseId === courseId)
  )
    return enrollments;
  return [...enrollments, { courseId, enrolledAt }];
}

export function markLessonComplete(
  courses: Course[],
  enrollments: Enrollment[],
  progress: StudentProgress[],
  courseId: string,
  lessonId: string,
): StudentProgress[] {
  const course = courses.find((item) => item.id === courseId);
  if (
    !course ||
    course.status !== "published" ||
    !enrollments.some((item) => item.courseId === courseId) ||
    !course.modules.some((module) =>
      module.lessons.some((lesson) => lesson.id === lessonId),
    )
  )
    return progress;
  const existing = progress.find((item) => item.courseId === courseId);
  if (existing?.completedLessonIds.includes(lessonId)) return progress;
  if (!existing)
    return [...progress, { courseId, completedLessonIds: [lessonId] }];
  return progress.map((item) =>
    item.courseId === courseId
      ? { ...item, completedLessonIds: [...item.completedLessonIds, lessonId] }
      : item,
  );
}
