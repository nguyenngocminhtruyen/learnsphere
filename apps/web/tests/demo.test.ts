import assert from "node:assert/strict";
import test from "node:test";
import {
  courses,
  initialEnrollments,
  initialProgress,
  quizzes,
} from "../lib/fixtures";
import {
  enrollInCourse,
  filterCourses,
  findCourse,
  firstLesson,
  getCourseProgress,
  markLessonComplete,
} from "../lib/models";
import { translate } from "../lib/i18n";

test("catalog excludes drafts and searches title, skills, and instructor without case sensitivity", () => {
  assert.equal(filterCourses(courses).length, 6);
  assert.deepEqual(
    filterCourses(courses, { query: "  SPRING BOOT  " }).map(
      (course) => course.id,
    ),
    ["java"],
  );
  assert.deepEqual(
    filterCourses(courses, { query: "maya chen" }).map((course) => course.id),
    ["python"],
  );
  assert.deepEqual(filterCourses(courses, { query: "does not exist" }), []);
  assert.equal(
    filterCourses(courses, { query: "Cloud Design Patterns" }).length,
    0,
  );
});

test("subject, level and language filters combine, and sorting is deterministic", () => {
  assert.deepEqual(
    filterCourses(courses, {
      subject: "AI",
      language: "vi",
      level: "Advanced",
    }).map((course) => course.id),
    ["llm"],
  );
  assert.equal(
    filterCourses(courses, { subject: "Cloud", level: "Advanced" }).length,
    0,
  );
  const popular = filterCourses(courses, { sort: "popular" });
  assert.equal(popular[0].id, "python");
  const rated = filterCourses(courses, { sort: "rating" });
  assert.ok(
    rated.every(
      (course, index) => !index || rated[index - 1].rating >= course.rating,
    ),
  );
  const alphabetical = filterCourses(courses, { sort: "title" });
  assert.deepEqual(
    alphabetical.map((course) => course.title),
    alphabetical
      .map((course) => course.title)
      .sort((a, b) => a.localeCompare(b)),
  );
});

test("enrollment rejects unknown/draft courses and duplicate enrollment", () => {
  assert.equal(
    enrollInCourse(courses, initialEnrollments, "unknown", "demo-date"),
    initialEnrollments,
  );
  assert.equal(
    enrollInCourse(courses, initialEnrollments, "draft-cloud", "demo-date"),
    initialEnrollments,
  );
  assert.equal(
    enrollInCourse(courses, initialEnrollments, "python", "demo-date"),
    initialEnrollments,
  );
  const next = enrollInCourse(courses, initialEnrollments, "java", "demo-date");
  assert.equal(next.length, initialEnrollments.length + 1);
  assert.deepEqual(next.at(-1), { courseId: "java", enrolledAt: "demo-date" });
  assert.equal(initialEnrollments.length, 1);
});

test("progress rejects unenrolled courses, unknown courses and cross-course lesson IDs", () => {
  assert.equal(
    markLessonComplete(
      courses,
      initialEnrollments,
      initialProgress,
      "java",
      "java-1",
    ),
    initialProgress,
  );
  const draftCourses = courses.map((course) =>
    course.id === "python" ? { ...course, status: "draft" as const } : course,
  );
  assert.equal(
    markLessonComplete(
      draftCourses,
      initialEnrollments,
      initialProgress,
      "python",
      "python-2",
    ),
    initialProgress,
  );
  assert.equal(
    markLessonComplete(
      courses,
      initialEnrollments,
      initialProgress,
      "unknown",
      "unknown-1",
    ),
    initialProgress,
  );
  assert.equal(
    markLessonComplete(
      courses,
      initialEnrollments,
      initialProgress,
      "python",
      "java-1",
    ),
    initialProgress,
  );
  assert.equal(
    markLessonComplete(
      courses,
      initialEnrollments,
      initialProgress,
      "python",
      "python-1",
    ),
    initialProgress,
  );
});

test("lesson completion updates immutable unique progress and reaches 100 percent", () => {
  const course = findCourse(courses, "python-for-everyone")!;
  assert.equal(firstLesson(course)?.id, "python-1");
  assert.equal(getCourseProgress(course, initialProgress), 13);
  let progress = initialProgress;
  for (const lesson of course.modules.flatMap((module) => module.lessons)) {
    progress = markLessonComplete(
      courses,
      initialEnrollments,
      progress,
      course.id,
      lesson.id,
    );
  }
  assert.equal(getCourseProgress(course, progress), 100);
  assert.equal(progress[0].completedLessonIds.length, 8);
  assert.equal(initialProgress[0].completedLessonIds.length, 1);
  assert.equal(getCourseProgress({ ...course, modules: [] }, progress), 0);
});

test("all quiz fixtures refer to existing lessons and coherent correct answers", () => {
  for (const quiz of quizzes) {
    const course = findCourse(courses, quiz.courseId)!;
    assert.ok(
      course.modules.some((module) =>
        module.lessons.some(
          (lesson) => lesson.id === quiz.lessonId && lesson.type === "quiz",
        ),
      ),
    );
    assert.ok(
      quiz.questions.every(
        (question) =>
          question.options[question.correctIndex] && question.explanation,
      ),
    );
  }
});

test("localization switches chrome and has an explicit missing-key fallback", () => {
  assert.equal(translate("en", "nav.courses"), "Courses");
  assert.equal(translate("vi", "nav.courses"), "Khóa học");
  assert.equal(
    translate("vi", "unknown.translation.key"),
    "unknown.translation.key",
  );
});
