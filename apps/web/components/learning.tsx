"use client";

import Link from "next/link";
import "./learning.css";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code2,
  Download,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Lightbulb,
  List,
  LockKeyhole,
  MessageCircle,
  Pause,
  Play,
  Send,
  Sparkles,
} from "lucide-react";
import { useDemo } from "../lib/demo-context";
import { quizzes } from "../lib/fixtures";
import {
  getCourseProgress,
  type Course,
  type Quiz,
  type StudentProgress,
} from "../lib/models";

function quizForLesson(
  course: Course,
  lessonId: string,
  t: (key: string) => string,
): Quiz | undefined {
  const existing = quizzes.find(
    (quiz) => quiz.courseId === course.id && quiz.lessonId === lessonId,
  );
  if (existing) return existing;
  const lesson = course.modules
    .flatMap((module) => module.lessons)
    .find((item) => item.id === lessonId && item.type === "quiz");
  if (!lesson) return undefined;
  return {
    id: `demo-${course.id}--${lesson.id}`,
    courseId: course.id,
    lessonId: lesson.id,
    title: lesson.title,
    questions: [
      {
        id: "practice-1",
        prompt: t("quiz.practiceQuestionOne"),
        options: [
          t("quiz.practiceOneCorrect"),
          t("quiz.practiceOneWrongA"),
          t("quiz.practiceOneWrongB"),
        ],
        correctIndex: 0,
        explanation: t("quiz.practiceOneExplanation"),
      },
      {
        id: "practice-2",
        prompt: t("quiz.practiceQuestionTwo"),
        options: [
          t("quiz.practiceTwoWrongA"),
          t("quiz.practiceTwoCorrect"),
          t("quiz.practiceTwoWrongB"),
        ],
        correctIndex: 1,
        explanation: t("quiz.practiceTwoExplanation"),
      },
    ],
  };
}

export function ProgressIndicator({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const percent = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-indicator">
      <div
        className="row"
        style={{ justifyContent: "space-between", marginBottom: 8 }}
      >
        <span className="muted">{label}</span>
        <strong>{percent}%</strong>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function CourseAccessMessage({
  course,
  missing = false,
}: {
  course?: Course;
  missing?: boolean;
}) {
  const { t } = useDemo();
  return (
    <section className="container section">
      <div
        className="empty-state panel"
        style={{ maxWidth: 640, margin: "48px auto" }}
      >
        <BookOpen size={40} aria-hidden="true" />
        <h1>{t(missing ? "learning.unknownTitle" : "learning.enrollTitle")}</h1>
        <p className="muted">
          {t(missing ? "learning.unknownBody" : "learning.enrollBody")}
        </p>
        <Link
          className="btn btn-primary"
          href={course ? `/courses/${course.slug}` : "/courses"}
        >
          {t(course ? "learning.viewCourse" : "learning.explore")}
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function MyLearningPage() {
  const { t, courses, enrollments, progress } = useDemo();
  const [tab, setTab] = useState<"all" | "inProgress" | "completed">("all");
  const enrolled = courses.filter((course) =>
    enrollments.some((entry) => entry.courseId === course.id),
  );
  const completed = enrolled.filter(
    (course) => getCourseProgress(course, progress) === 100,
  ).length;
  const completedLessons = progress.reduce(
    (total, entry) => total + entry.completedLessonIds.length,
    0,
  );
  const visible = enrolled.filter(
    (course) =>
      tab === "all" ||
      (tab === "completed"
        ? getCourseProgress(course, progress) === 100
        : getCourseProgress(course, progress) < 100),
  );
  return (
    <section className="container section learning-dashboard">
      <div
        className="page-heading row"
        style={{
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p className="eyebrow">{t("learning.eyebrow")}</p>
          <h1>{t("learning.title")}</h1>
          <p className="muted">{t("learning.subtitle")}</p>
        </div>
        <Link className="btn btn-secondary" href="/courses">
          {t("learning.explore")}
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
      <div className="learning-stats stat-grid">
        {[
          {
            icon: BookOpen,
            value: enrolled.length,
            label: "learning.enrolled",
          },
          {
            icon: CheckCircle2,
            value: completedLessons,
            label: "learning.lessonsCompleted",
          },
          { icon: Award, value: completed, label: "learning.coursesCompleted" },
        ].map(({ icon: Icon, value, label }) => (
          <div className="stat-card panel" key={label}>
            <div className="stat-icon">
              <Icon size={22} aria-hidden="true" />
            </div>
            <div>
              <strong className="stat-value">{value}</strong>
              <p className="muted">{t(label)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="tabs" role="group" aria-label={t("learning.title")}>
        {(["all", "inProgress", "completed"] as const).map((value) => (
          <button
            className={tab === value ? "active" : ""}
            aria-pressed={tab === value}
            key={value}
            onClick={() => setTab(value)}
          >
            {t(`learning.${value}`)}
            <span className="tab-count">
              {value === "all"
                ? enrolled.length
                : value === "completed"
                  ? completed
                  : enrolled.length - completed}
            </span>
          </button>
        ))}
      </div>
      {visible.length ? (
        <div className="learning-course-grid grid-2">
          {visible.map((course) => {
            const percentage = getCourseProgress(course, progress);
            const done =
              progress.find((entry) => entry.courseId === course.id)
                ?.completedLessonIds ?? [];
            const lessons = course.modules.flatMap((module) => module.lessons);
            const next =
              lessons.find((lesson) => !done.includes(lesson.id)) ?? lessons[0];
            return (
              <article key={course.id} className="learning-course-card panel">
                <div className={`learning-course-art art-${course.art}`}>
                  <Code2 size={56} aria-hidden="true" />
                  <span>{t(`subject.${course.subject}`)}</span>
                  <span className="badge">LearnSphere</span>
                </div>
                <div className="learning-course-body stack">
                  <span className="eyebrow">{course.instructor.name}</span>
                  <h2>
                    <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                  </h2>
                  <ProgressIndicator
                    value={percentage}
                    label={t("learning.progress")}
                  />
                  {next && (
                    <div
                      className="row"
                      style={{
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                      }}
                    >
                      <span className="muted text-sm">
                        <Clock3 size={14} aria-hidden="true" /> {next.duration}
                      </span>
                      <Link
                        className="btn btn-primary btn-sm"
                        href={`/learn/${course.id}/${next.id}`}
                      >
                        {t(
                          percentage === 100
                            ? "learning.revisit"
                            : "learning.continue",
                        )}
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state panel">
          <GraduationCap size={42} aria-hidden="true" />
          <h2>
            {t(
              tab === "completed"
                ? "learning.emptyCompletedTitle"
                : "learning.emptyTitle",
            )}
          </h2>
          <p className="muted">
            {t(
              tab === "completed"
                ? "learning.emptyCompletedBody"
                : "learning.emptyBody",
            )}
          </p>
          <Link className="btn btn-primary" href="/courses">
            {t("learning.explore")}
          </Link>
        </div>
      )}
    </section>
  );
}

export function LearningSidebar({
  course,
  lessonId,
  progress,
}: {
  course: Course;
  lessonId: string;
  progress: StudentProgress[];
}) {
  const { t } = useDemo();
  const done =
    progress.find((item) => item.courseId === course.id)?.completedLessonIds ??
    [];
  return (
    <aside className="learning-sidebar" aria-label={t("learning.curriculum")}>
      <div className="sidebar-heading">
        <p className="eyebrow">{t("learning.curriculum")}</p>
        <h2>{course.title}</h2>
        <ProgressIndicator
          value={getCourseProgress(course, progress)}
          label={t("learning.progress")}
        />
      </div>
      <div className="curriculum-list">
        {course.modules.map((module, index) => (
          <details className="curriculum-module" key={module.id} open>
            <summary>
              <span>
                <span className="eyebrow">
                  {t("learning.module")} {index + 1}
                </span>
                <strong>{module.title}</strong>
              </span>
              <ChevronDown size={17} aria-hidden="true" />
            </summary>
            <div>
              {module.lessons.map((lesson) => {
                const Icon = done.includes(lesson.id)
                  ? CheckCircle2
                  : lesson.type === "video"
                    ? Play
                    : lesson.type === "quiz"
                      ? Award
                      : FileText;
                return (
                  <Link
                    key={lesson.id}
                    href={`/learn/${course.id}/${lesson.id}`}
                    className={`curriculum-item ${lesson.id === lessonId ? "active" : ""}`}
                    aria-current={lesson.id === lessonId ? "page" : undefined}
                  >
                    <Icon size={17} aria-hidden="true" />
                    <span>
                      <strong>{lesson.title}</strong>
                      <small>
                        {t(`learning.${lesson.type}`)} · {lesson.duration}
                      </small>
                    </span>
                  </Link>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </aside>
  );
}

export function AITutorPanel() {
  const { t } = useDemo();
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { author: "you" | "companion"; text?: string }[]
  >([]);
  const [thinking, setThinking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function send(event: FormEvent) {
    event.preventDefault();
    const question = input.trim();
    if (!question || thinking) return;
    setMessages((current) => [...current, { author: "you", text: question }]);
    setInput("");
    setThinking(true);
    timer.current = setTimeout(() => {
      setMessages((current) => [...current, { author: "companion" }]);
      setThinking(false);
    }, 700);
  }
  return (
    <section className={`tutor-panel ${open ? "" : "is-collapsed"}`}>
      <div className="tutor-header">
        <div className="row">
          <Sparkles size={20} aria-hidden="true" />
          <div>
            <h3>{t("learning.tutor")}</h3>
            <small className="muted">{t("learning.tutorDemo")}</small>
          </div>
        </div>
        <button
          className="icon-button"
          aria-expanded={open}
          aria-controls="tutor-content"
          aria-label={t(
            open ? "learning.collapseTutor" : "learning.expandTutor",
          )}
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronDown size={18} /> : <MessageCircle size={18} />}
        </button>
      </div>
      {open && (
        <div id="tutor-content">
          <div className="tutor-messages" role="log" aria-live="polite">
            <div className="chat-message companion">
              <Sparkles size={16} aria-hidden="true" />
              <p>{t("learning.tutorIntro")}</p>
            </div>
            {messages.map((message, index) => (
              <div className={`chat-message ${message.author}`} key={index}>
                <span className="eyebrow">
                  {t(`learning.${message.author}`)}
                </span>
                <p>
                  {message.author === "you"
                    ? message.text
                    : t("learning.tutorReply")}
                </p>
              </div>
            ))}
            {thinking && (
              <p className="muted" role="status">
                {t("learning.tutorThinking")}
              </p>
            )}
          </div>
          <form className="chat-form" onSubmit={send}>
            <label className="sr-only" htmlFor="tutor-question">
              {t("learning.tutorQuestion")}
            </label>
            <input
              className="input"
              id="tutor-question"
              maxLength={500}
              value={input}
              placeholder={t("learning.tutorPlaceholder")}
              onChange={(event) => setInput(event.target.value)}
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={!input.trim() || thinking}
              aria-label={t("learning.tutorSend")}
            >
              <Send size={17} aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

function lessonExample(art: Course["art"]) {
  if (art === "java")
    return '@RestController\nclass WelcomeController {\n  @GetMapping("/welcome")\n  String welcome() { return "Hello, builder!"; }\n}';
  if (art === "cloud")
    return "application:\n  name: my-first-cloud-project\n  environment: learning\n  principle: least-privilege";
  if (art === "rag" || art === "llm")
    return 'question = "What evidence supports this?"\ncontext = retrieve(approved_sources, question)\nanswer = explain_with_sources(context)';
  return 'skills = ["curiosity", "practice", "persistence"]\n\nfor skill in skills:\n    print(f"Keep building {skill}.")';
}

export function LessonPlayerPage({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const { t, courses, enrollments, progress, completeLesson } = useDemo();
  const [sidebar, setSidebar] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState<"overview" | "notes" | "resources">(
    "overview",
  );
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [justCompleted, setJustCompleted] = useState("");
  const course = courses.find(
    (item) => item.id === courseId && item.status === "published",
  );
  const lessons = course?.modules.flatMap((module) => module.lessons) ?? [];
  const lessonIndex = lessons.findIndex((item) => item.id === lessonId);
  const lesson = lessons[lessonIndex];
  if (!course || !lesson) return <CourseAccessMessage missing />;
  if (!enrollments.some((item) => item.courseId === course.id))
    return <CourseAccessMessage course={course} />;
  const done =
    progress
      .find((item) => item.courseId === course.id)
      ?.completedLessonIds.includes(lesson.id) ?? false;
  const quiz = quizForLesson(course, lesson.id, t);
  const previous = lessons[lessonIndex - 1];
  const next = lessons[lessonIndex + 1];
  function download() {
    if (!course || !lesson) return;
    const blob = new Blob(
      [
        `LearnSphere\n${course.title}\n${lesson.title}\n\n${lesson.content}\n\n${t("learning.practiceBody")}\n`,
      ],
      { type: "text/plain;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${lesson.id}-companion.txt`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  return (
    <section className="lesson-page">
      <div className="lesson-header">
        <Link className="lesson-breadcrumb" href="/my-learning">
          <ArrowLeft size={17} aria-hidden="true" />
          {t("learning.back")}
        </Link>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setSidebar(!sidebar)}
          aria-expanded={sidebar}
          aria-controls="course-curriculum"
        >
          <List size={17} aria-hidden="true" />
          {t(sidebar ? "learning.hideCurriculum" : "learning.showCurriculum")}
        </button>
      </div>
      <div className={`learning-layout ${sidebar ? "" : "sidebar-hidden"}`}>
        {sidebar && (
          <div id="course-curriculum">
            <LearningSidebar
              course={course}
              lessonId={lesson.id}
              progress={progress}
            />
          </div>
        )}
        <div className="lesson-main">
          <div className="lesson-main-inner">
            <div
              className="row"
              style={{ justifyContent: "space-between", flexWrap: "wrap" }}
            >
              <p className="eyebrow">
                {t("learning.lesson")} {lessonIndex + 1} / {lessons.length}
              </p>
              <span className="badge">
                <Clock3 size={13} aria-hidden="true" /> {lesson.duration}
              </span>
            </div>
            <h1>{lesson.title}</h1>
            {lesson.type === "video" ? (
              <div className="video-preview">
                <div className="video-code" aria-hidden="true">
                  <span className="video-window-dots">● ● ●</span>
                  <pre>{lessonExample(course.art)}</pre>
                </div>
                <div className="video-overlay">
                  <span className="eyebrow">{t("learning.previewLabel")}</span>
                  <button
                    className="video-play"
                    aria-label={t(
                      playing
                        ? "learning.pausePreview"
                        : "learning.playPreview",
                    )}
                    onClick={() => setPlaying(!playing)}
                  >
                    {playing ? (
                      <Pause size={27} fill="currentColor" />
                    ) : (
                      <Play size={27} fill="currentColor" />
                    )}
                  </button>
                  <strong role="status">
                    {t(
                      playing
                        ? "learning.previewPlaying"
                        : "learning.previewPaused",
                    )}
                  </strong>
                </div>
                <div className="video-controls">
                  <span>00:00 / {lesson.duration}</span>
                  <span>{t("learning.video")}</span>
                </div>
              </div>
            ) : lesson.type === "quiz" ? (
              <div className="panel empty-state quiz-preview">
                <Award size={45} aria-hidden="true" />
                <h2>{t("learning.quizIntro")}</h2>
                {quiz ? (
                  <Link
                    className="btn btn-primary"
                    href={`/quizzes/${quiz.id}`}
                  >
                    {t("learning.startQuiz")}
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                ) : (
                  <p className="muted">{t("quiz.notFoundBody")}</p>
                )}
              </div>
            ) : (
              <div className="reading-banner">
                <FileText size={28} aria-hidden="true" />
                <span>{t("learning.reading")}</span>
                <strong>{lesson.title}</strong>
              </div>
            )}
            {lesson.type === "video" && (
              <p className="muted text-sm" style={{ marginTop: 12 }}>
                {t("learning.previewDescription")}
              </p>
            )}
            <div
              className="lesson-tabs tabs"
              role="group"
              aria-label={t("learning.overview")}
            >
              {(["overview", "notes", "resources"] as const).map((value) => (
                <button
                  key={value}
                  className={tab === value ? "active" : ""}
                  aria-pressed={tab === value}
                  onClick={() => setTab(value)}
                >
                  {value === "overview" ? (
                    <BookOpen size={16} aria-hidden="true" />
                  ) : value === "notes" ? (
                    <FileText size={16} aria-hidden="true" />
                  ) : (
                    <Download size={16} aria-hidden="true" />
                  )}
                  {t(`learning.${value}`)}
                </button>
              ))}
            </div>
            <div className="lesson-content">
              {tab === "overview" ? (
                <div className="stack">
                  <p>{lesson.content}</p>
                  <h2>{t("learning.practice")}</h2>
                  <p>{t("learning.practiceBody")}</p>
                  <pre className="code-block">
                    <code>{lessonExample(course.art)}</code>
                  </pre>
                  <div className="takeaway">
                    <Lightbulb size={21} aria-hidden="true" />
                    <div>
                      <h3>{t("learning.keyTakeaway")}</h3>
                      <p>{t("learning.takeawayBody")}</p>
                    </div>
                  </div>
                </div>
              ) : tab === "notes" ? (
                <div className="stack">
                  <label className="field" htmlFor="lesson-notes">
                    {t("learning.notesLabel")}
                  </label>
                  <textarea
                    id="lesson-notes"
                    className="textarea note-area"
                    rows={8}
                    placeholder={t("learning.notesPlaceholder")}
                    value={notes[lesson.id] ?? ""}
                    onChange={(event) =>
                      setNotes((current) => ({
                        ...current,
                        [lesson.id]: event.target.value,
                      }))
                    }
                  />
                  <p className="muted text-sm">{t("learning.notesHint")}</p>
                  {notes[lesson.id] && (
                    <p className="text-sm" role="status">
                      <CheckCircle2 size={15} aria-hidden="true" />{" "}
                      {t("learning.notesSaved")}
                    </p>
                  )}
                </div>
              ) : (
                <div
                  className="panel row"
                  style={{ alignItems: "flex-start", flexWrap: "wrap" }}
                >
                  <div className="stat-icon">
                    <FileText size={25} aria-hidden="true" />
                  </div>
                  <div style={{ flex: "1 1 220px" }}>
                    <h3>{t("learning.downloadNotes")}</h3>
                    <p className="muted">{t("learning.resourceDescription")}</p>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={download}
                  >
                    <Download size={16} aria-hidden="true" />
                    TXT
                  </button>
                </div>
              )}
            </div>
            {justCompleted === lesson.id && (
              <div className="alert alert-success" role="status">
                <CheckCircle2 size={18} aria-hidden="true" />
                {t("learning.completeSuccess")}
              </div>
            )}
            <div className="lesson-toolbar">
              <div>
                {previous && (
                  <Link
                    className="btn btn-secondary btn-sm"
                    href={`/learn/${course.id}/${previous.id}`}
                  >
                    <ArrowLeft size={16} aria-hidden="true" />
                    {t("learning.previous")}
                  </Link>
                )}
              </div>
              <div className="row" style={{ flexWrap: "wrap" }}>
                {lesson.type !== "quiz" && (
                  <button
                    className={`btn ${done ? "btn-secondary" : "btn-primary"} btn-sm`}
                    disabled={done}
                    onClick={() => {
                      completeLesson(course.id, lesson.id);
                      setJustCompleted(lesson.id);
                    }}
                  >
                    <Check size={17} aria-hidden="true" />
                    {t(
                      done
                        ? "learning.lessonComplete"
                        : "learning.markComplete",
                    )}
                  </button>
                )}
                {next ? (
                  <Link
                    className="btn btn-secondary btn-sm"
                    href={`/learn/${course.id}/${next.id}`}
                  >
                    {t("learning.next")}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                ) : (
                  <Link
                    className="btn btn-secondary btn-sm"
                    href="/my-learning"
                  >
                    {t("learning.title")}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
            <AITutorPanel key={lesson.id} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function QuizPage({ id }: { id: string }) {
  const { t, courses, enrollments, completeLesson } = useDemo();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const quiz =
    quizzes.find((item) => item.id === id) ??
    courses
      .flatMap((course) =>
        course.modules
          .flatMap((module) => module.lessons)
          .filter((lesson) => lesson.type === "quiz")
          .map((lesson) => quizForLesson(course, lesson.id, t)),
      )
      .find((item) => item?.id === id);
  const course = courses.find(
    (item) => item.id === quiz?.courseId && item.status === "published",
  );
  if (!quiz || !course)
    return (
      <section className="container section">
        <div className="empty-state panel">
          <Award size={42} aria-hidden="true" />
          <h1>{t("quiz.notFound")}</h1>
          <p className="muted">{t("quiz.notFoundBody")}</p>
          <Link className="btn btn-primary" href="/my-learning">
            {t("learning.title")}
          </Link>
        </div>
      </section>
    );
  if (!enrollments.some((item) => item.courseId === course.id))
    return <CourseAccessMessage course={course} />;
  const score = Math.round(
    (quiz.questions.filter(
      (question) => answers[question.id] === question.correctIndex,
    ).length /
      quiz.questions.length) *
      100,
  );
  const lessons = course.modules.flatMap((module) => module.lessons);
  const lessonIndex = lessons.findIndex((item) => item.id === quiz.lessonId);
  const next = lessons[lessonIndex + 1];
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!quiz) return;
    if (quiz.questions.some((question) => answers[question.id] === undefined)) {
      setError(true);
      return;
    }
    setError(false);
    setSubmitted(true);
    completeLesson(quiz.courseId, quiz.lessonId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  return (
    <section className="container section quiz-layout">
      <Link
        className="lesson-breadcrumb"
        href={`/learn/${course.id}/${quiz.lessonId}`}
      >
        <ArrowLeft size={17} aria-hidden="true" />
        {t("quiz.returnLesson")}
      </Link>
      <header className="quiz-header">
        <p className="eyebrow">{t("quiz.eyebrow")}</p>
        <h1>{quiz.title}</h1>
        <p className="muted">{t("quiz.intro")}</p>
        <span className="badge">
          <Award size={14} aria-hidden="true" />
          {t("quiz.demo")}
        </span>
      </header>
      {submitted && (
        <section className="quiz-feedback panel" role="status">
          <div className="quiz-score">{score}%</div>
          <div>
            <h2>{t(score >= 70 ? "quiz.successTitle" : "quiz.retryTitle")}</h2>
            <p className="muted">{t("quiz.progressSaved")}</p>
            <div className="row" style={{ flexWrap: "wrap" }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
              >
                {t("quiz.tryAgain")}
              </button>
              <Link
                className="btn btn-primary"
                href={next ? `/learn/${course.id}/${next.id}` : "/my-learning"}
              >
                {t(next ? "quiz.nextLesson" : "learning.title")}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}
      <form onSubmit={submit} className="stack" noValidate>
        {quiz.questions.map((question, index) => (
          <fieldset className="quiz-question panel" key={question.id}>
            <legend>
              <span className="eyebrow">
                {t("quiz.question")} {index + 1} {t("quiz.of")}{" "}
                {quiz.questions.length}
              </span>
              <span>{question.prompt}</span>
            </legend>
            <div className="quiz-choices">
              {question.options.map((option, optionIndex) => (
                <label
                  className={`quiz-option ${answers[question.id] === optionIndex ? "selected" : ""} ${submitted && question.correctIndex === optionIndex ? "correct" : ""}`}
                  key={optionIndex}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={optionIndex}
                    checked={answers[question.id] === optionIndex}
                    disabled={submitted}
                    onChange={() => {
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: optionIndex,
                      }));
                      setError(false);
                    }}
                  />
                  <span className="option-letter" aria-hidden="true">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span>{option}</span>
                  {submitted && question.correctIndex === optionIndex && (
                    <CheckCircle2 size={18} aria-hidden="true" />
                  )}
                </label>
              ))}
            </div>
            {submitted && (
              <div
                className={`quiz-explanation ${answers[question.id] === question.correctIndex ? "is-correct" : ""}`}
              >
                <strong>
                  {t(
                    answers[question.id] === question.correctIndex
                      ? "quiz.correct"
                      : "quiz.incorrect",
                  )}
                </strong>
                <p>
                  <span className="sr-only">{t("quiz.explanation")}: </span>
                  {question.explanation}
                </p>
              </div>
            )}
          </fieldset>
        ))}
        {error && (
          <p className="alert" role="alert">
            {t("quiz.required")}
          </p>
        )}
        {!submitted && (
          <button className="btn btn-primary" type="submit">
            {t("quiz.submit")}
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        )}
      </form>
    </section>
  );
}

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { t } = useDemo();
  const register = mode === "register";
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const next: Record<string, string> = {};
    if (register && String(data.get("name") ?? "").trim().length < 2)
      next.name = "auth.nameError";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.get("email") ?? "")))
      next.email = "auth.emailError";
    if (String(data.get("password") ?? "").length < 8)
      next.password = "auth.passwordError";
    setErrors(next);
    if (!Object.keys(next).length) {
      form.reset();
      setShowPassword(false);
      setSuccess(true);
    }
  }
  return (
    <section className="auth-layout container section">
      <section className="auth-intro">
        <span className="eyebrow">{t("auth.eyebrow")}</span>
        <h1>{t("auth.hero")}</h1>
        <p>{t("auth.heroBody")}</p>
        <div className="auth-decor" aria-hidden="true">
          <div className="auth-orbit" />
          <div className="auth-orbit second" />
          <GraduationCap size={80} />
          <span className="auth-float auth-float-one">
            <Code2 size={25} />
          </span>
          <span className="auth-float auth-float-two">
            <Sparkles size={25} />
          </span>
        </div>
        <ul className="auth-benefits">
          {["auth.benefitOne", "auth.benefitTwo", "auth.benefitThree"].map(
            (key) => (
              <li key={key}>
                <CheckCircle2 size={18} aria-hidden="true" />
                {t(key)}
              </li>
            ),
          )}
        </ul>
      </section>
      <section className="auth-card panel">
        <h2>{t(register ? "auth.registerTitle" : "auth.loginTitle")}</h2>
        <p className="muted">
          {t(register ? "auth.registerSubtitle" : "auth.loginSubtitle")}
        </p>
        <div className="alert demo-auth">
          <LockKeyhole size={20} aria-hidden="true" />
          <div>
            <strong>{t("auth.demoTitle")}</strong>
            <p>{t("auth.demoBody")}</p>
          </div>
        </div>
        {success ? (
          <div className="stack">
            <div className="alert alert-success" role="status">
              <CheckCircle2 size={24} aria-hidden="true" />
              <p>{t("auth.success")}</p>
            </div>
            <Link className="btn btn-primary" href="/my-learning">
              {t("auth.openWorkspace")}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <form className="stack" method="post" onSubmit={submit} noValidate>
            <noscript>
              <p className="alert">{t("auth.jsRequired")}</p>
            </noscript>
            <fieldset className="auth-form-fields" disabled={!ready}>
              {register && (
                <div className="field">
                  <label htmlFor="auth-name">{t("auth.name")}</label>
                  <input
                    className="input"
                    id="auth-name"
                    name="name"
                    autoComplete="off"
                    placeholder={t("auth.namePlaceholder")}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={
                      errors.name ? "auth-name-error" : undefined
                    }
                  />
                  {errors.name && (
                    <p className="form-error" id="auth-name-error" role="alert">
                      {t(errors.name)}
                    </p>
                  )}
                </div>
              )}
              <div className="field">
                <label htmlFor="auth-email">{t("auth.email")}</label>
                <input
                  className="input"
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  placeholder={t("auth.emailPlaceholder")}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "auth-email-error" : undefined
                  }
                />
                {errors.email && (
                  <p className="form-error" id="auth-email-error" role="alert">
                    {t(errors.email)}
                  </p>
                )}
              </div>
              <div className="field">
                <label htmlFor="auth-password">{t("auth.password")}</label>
                <div className="auth-input-wrap">
                  <input
                    className="input"
                    id="auth-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password
                        ? "auth-password-error"
                        : "auth-password-hint"
                    }
                  />
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={t(
                      showPassword ? "auth.hidePassword" : "auth.showPassword",
                    )}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <small className="muted" id="auth-password-hint">
                  {t("auth.passwordHint")}
                </small>
                {errors.password && (
                  <p
                    className="form-error"
                    id="auth-password-error"
                    role="alert"
                  >
                    {t(errors.password)}
                  </p>
                )}
              </div>
              <button className="btn btn-primary" type="submit">
                {t(register ? "auth.submitRegister" : "auth.submitLogin")}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </fieldset>
          </form>
        )}
        <p className="auth-switch muted">
          {t(register ? "auth.haveAccount" : "auth.needAccount")}{" "}
          <Link href={register ? "/login" : "/register"}>
            {t(register ? "auth.loginLink" : "auth.registerLink")}
          </Link>
        </p>
      </section>
    </section>
  );
}
