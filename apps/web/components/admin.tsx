"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LoaderCircle,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useDemo } from "../lib/demo-context";
import { translate } from "../lib/i18n";
import type { Course, GeneratedDraft, Lesson, Module } from "../lib/models";

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
function lessonCount(course: Course) {
  return course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
}

export function AdminSidebar() {
  const { t } = useDemo();
  const path = usePathname();
  const items = [
    { href: "/admin", key: "admin.overview", icon: LayoutDashboard },
    { href: "/admin/courses", key: "admin.courses", icon: BookOpen },
    { href: "/admin/ai-studio", key: "admin.studio", icon: Sparkles },
  ];
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-title">
        <span className="eyebrow">LEARNSPHERE</span>
        <strong>{t("admin.workspace")}</strong>
      </div>
      <nav aria-label={t("admin.workspace")}>
        {items.map(({ href, key, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`admin-nav-link ${path === href || (href !== "/admin" && path.startsWith(href)) ? "active" : ""}`}
            aria-current={path === href ? "page" : undefined}
          >
            <Icon size={19} />
            {t(key)}
          </Link>
        ))}
      </nav>
      <div className="admin-sidebar-bottom">
        <div className="avatar">LS</div>
        <div>
          <strong>LearnSphere</strong>
          <small>{t("admin.workspace")}</small>
        </div>
      </div>
      <Link className="admin-nav-link" href="/my-learning">
        <ArrowLeft size={17} />
        {t("admin.backSite")}
      </Link>
    </aside>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { t } = useDemo();
  return (
    <div className="admin-layout container">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-demo-note">
          <CircleDashed size={14} />
          {t("admin.demo")}
        </div>
        {children}
      </div>
    </div>
  );
}

export function DataTable({ courses }: { courses: Course[] }) {
  const { t } = useDemo();
  return courses.length ? (
    <div
      className="table-wrap"
      tabIndex={0}
      role="region"
      aria-label={t("admin.courses")}
    >
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">{t("admin.courseTitle")}</th>
            <th scope="col">{t("admin.status")}</th>
            <th scope="col">{t("admin.curriculum")}</th>
            <th scope="col">
              <span className="sr-only">{t("admin.actions")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>
                <div className="table-course">
                  <div className={`table-course-icon art-${course.art}`}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <strong>{course.title}</strong>
                    <small>
                      {t(`admin.${course.subject.toLowerCase()}`)} ·{" "}
                      {course.language.toUpperCase()}
                    </small>
                  </div>
                </div>
              </td>
              <td>
                <span
                  className={`badge ${course.status === "published" ? "badge-green" : "badge-amber"}`}
                >
                  {t(`admin.${course.status}`)}
                </span>
              </td>
              <td>
                <span>
                  {course.modules.length} {t("admin.modules")}
                </span>
                <small>
                  {lessonCount(course)} {t("admin.lessons")}
                </small>
              </td>
              <td>
                <Link
                  href={`/admin/courses/${course.id}/edit`}
                  className="btn btn-ghost btn-sm"
                  aria-label={`${t("admin.edit")}: ${course.title}`}
                >
                  {t("admin.edit")}
                  <ChevronRight size={15} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="empty-state">
      <BookOpen size={32} />
      <h3>{t("admin.noCourses")}</h3>
      <p>{t("admin.noCoursesText")}</p>
      <Link className="btn btn-primary" href="/admin/courses/new">
        <Plus size={16} />
        {t("admin.create")}
      </Link>
    </div>
  );
}

export function AdminDashboard() {
  const { t, courses, enrollments } = useDemo();
  const drafts = courses.filter((course) => course.status === "draft");
  const stats = [
    {
      key: "admin.totalCourses",
      value: courses.length,
      hint: "admin.thisWorkspace",
      icon: BookOpen,
      color: "blue",
    },
    {
      key: "admin.published",
      value: courses.filter((course) => course.status === "published").length,
      hint: "admin.readyToLearn",
      icon: GraduationCap,
      color: "green",
    },
    {
      key: "admin.drafts",
      value: drafts.length,
      hint: "admin.awaitingReview",
      icon: FileText,
      color: "amber",
    },
    {
      key: "admin.enrollments",
      value: enrollments.length,
      hint: "admin.simulated",
      icon: Users,
      color: "violet",
    },
  ];
  return (
    <div className="stack admin-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("admin.overview")}</span>
          <h1>{t("admin.welcome")}</h1>
          <p className="muted">{t("admin.welcomeText")}</p>
        </div>
        <Link className="btn btn-primary" href="/admin/courses/new">
          <Plus size={17} />
          {t("admin.create")}
        </Link>
      </div>
      <div className="stat-grid">
        {stats.map(({ key, value, hint, icon: Icon, color }) => (
          <div className="stat-card" key={key}>
            <span className={`stat-icon ${color}`}>
              <Icon size={22} />
            </span>
            <span className="muted">{t(key)}</span>
            <strong>{value.toString().padStart(2, "0")}</strong>
            <small>{t(hint)}</small>
          </div>
        ))}
      </div>
      <section className="panel">
        <div className="panel-heading">
          <h2>{t("admin.recentDrafts")}</h2>
          <Link href="/admin/courses" className="text-link">
            {t("admin.viewAll")}
            <ArrowRight size={15} />
          </Link>
        </div>
        <DataTable courses={drafts.slice(0, 3)} />
      </section>
      <div className="grid-2">
        <section className="panel">
          <h2>{t("admin.activity")}</h2>
          <div className="activity-list">
            {[
              "admin.activityOne",
              "admin.activityTwo",
              "admin.activityThree",
            ].map((key, i) => (
              <div className="activity-item" key={key}>
                <span className={`activity-dot ${i === 0 ? "green" : ""}`}>
                  <Check size={13} />
                </span>
                <div>
                  <p>{t(key)}</p>
                  <small>{t("admin.today")}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="studio-promo">
          <div className="studio-promo-icon">
            <Sparkles size={25} />
          </div>
          <h2>{t("admin.studioPromo")}</h2>
          <p>{t("admin.studioPromoText")}</p>
          <Link className="btn btn-primary" href="/admin/ai-studio">
            {t("admin.openStudio")}
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </div>
  );
}

export function CourseManagement() {
  const { t, courses } = useDemo();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const visible = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(query.toLowerCase()) &&
      (status === "all" || course.status === status),
  );
  return (
    <div className="stack admin-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("admin.courses")}</span>
          <h1>{t("admin.manageTitle")}</h1>
          <p className="muted">{t("admin.manageText")}</p>
        </div>
        <Link href="/admin/courses/new" className="btn btn-primary">
          <Plus size={17} />
          {t("admin.create")}
        </Link>
      </div>
      <section className="panel">
        <div className="admin-filter-row">
          <label className="search-input">
            <Search size={18} />
            <span className="sr-only">{t("admin.search")}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("admin.search")}
            />
          </label>
          <label>
            <span className="sr-only">{t("admin.status")}</span>
            <select
              className="select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">{t("admin.allStatuses")}</option>
              <option value="draft">{t("admin.draft")}</option>
              <option value="published">{t("admin.published")}</option>
            </select>
          </label>
        </div>
        <DataTable courses={visible} />
      </section>
    </div>
  );
}

function emptyCourse(): Course {
  return {
    id: newId("course"),
    slug: "",
    title: "",
    subtitle: "",
    description: "",
    subject: "Development",
    level: "Beginner",
    language: "en",
    instructor: {
      name: "LearnSphere Studio",
      title: "LearnSphere",
      initials: "LS",
    },
    rating: 0,
    learners: 0,
    duration: "2 hours",
    skills: [],
    outcomes: [],
    modules: [],
    status: "draft",
    color: "#1858D8",
    art: "java",
    featured: false,
  };
}

export function CourseEditor({ courseId }: { courseId?: string }) {
  const { t, courses } = useDemo();
  const course = courseId
    ? courses.find((item) => item.id === courseId)
    : undefined;
  if (courseId && !course)
    return (
      <section className="empty-state">
        <BookOpen size={32} />
        <h1>{t("admin.notFound")}</h1>
        <Link className="btn btn-primary" href="/admin/courses">
          {t("admin.viewAll")}
        </Link>
      </section>
    );
  return <EditorForm key={courseId ?? "new-course"} initial={course} />;
}

function EditorForm({ initial }: { initial?: Course }) {
  const { t, saveCourse } = useDemo();
  const router = useRouter();
  const [course, setCourse] = useState<Course>(() =>
    initial ? structuredClone(initial) : emptyCourse(),
  );
  const [preview, setPreview] = useState(false);
  const [skillsText, setSkillsText] = useState(
    initial?.skills.join(", ") ?? "",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const patch = (values: Partial<Course>) => {
    setCourse((current) => ({ ...current, ...values }));
    setMessage("");
  };
  const updateModule = (id: string, update: Partial<Module>) =>
    patch({
      modules: course.modules.map((module) =>
        module.id === id ? { ...module, ...update } : module,
      ),
    });
  const updateLesson = (
    moduleId: string,
    lessonId: string,
    update: Partial<Lesson>,
  ) =>
    patch({
      modules: course.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, ...update } : lesson,
              ),
            }
          : module,
      ),
    });
  function save(event: FormEvent) {
    event.preventDefault();
    const next = {
      ...course,
      status: "draft" as const,
      slug:
        course.slug ||
        course.title
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") ||
        course.id,
    };
    setCourse(next);
    saveCourse(next);
    setError(false);
    setMessage("admin.saved");
    if (!initial) router.replace(`/admin/courses/${next.id}/edit`);
  }
  function publish() {
    const valid =
      course.title.trim().length >= 3 &&
      course.description.trim().length >= 10 &&
      course.modules.length > 0 &&
      course.modules.every(
        (module) =>
          module.title.trim() &&
          module.lessons.length > 0 &&
          module.lessons.every((lesson) => lesson.title.trim()),
      );
    if (!valid) {
      setError(true);
      setMessage("admin.validation");
      return;
    }
    const next = {
      ...course,
      status: "published" as const,
      slug: course.slug || course.id,
    };
    setCourse(next);
    saveCourse(next);
    setError(false);
    setMessage("admin.publishedSuccess");
  }
  return (
    <div className="stack admin-page">
      <div className="page-heading">
        <div>
          <Link href="/admin/courses" className="text-link">
            <ArrowLeft size={15} />
            {t("admin.courses")}
          </Link>
          <h1>{t(initial ? "admin.editTitle" : "admin.newCourse")}</h1>
          <p className="muted">{t("admin.editorText")}</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setPreview(!preview)}
        >
          {t(preview ? "admin.closePreview" : "admin.preview")}
        </button>
      </div>
      {message && (
        <div
          role={error ? "alert" : "status"}
          className={`alert ${error ? "alert-error" : "alert-success"}`}
        >
          {!error && <CheckCircle2 size={18} />}
          {t(message)}
        </div>
      )}
      <form className="stack" onSubmit={save}>
        <section className="panel">
          <div className="panel-heading">
            <h2>{t("admin.courseDetails")}</h2>
            <span
              className={`badge ${course.status === "published" ? "badge-green" : "badge-amber"}`}
            >
              {t(`admin.${course.status}`)}
            </span>
          </div>
          <div className="stack">
            <label className="field">
              {t("admin.courseTitle")}
              <input
                className="input"
                required
                minLength={3}
                maxLength={120}
                value={course.title}
                onChange={(event) => patch({ title: event.target.value })}
                placeholder={t("admin.courseNameHint")}
              />
            </label>
            <label className="field">
              {t("admin.subtitle")}
              <input
                className="input"
                required
                maxLength={200}
                value={course.subtitle}
                onChange={(event) => patch({ subtitle: event.target.value })}
              />
            </label>
            <label className="field">
              {t("admin.description")}
              <textarea
                className="textarea"
                required
                minLength={10}
                rows={4}
                value={course.description}
                onChange={(event) => patch({ description: event.target.value })}
              />
            </label>
            <div className="editor-select-grid">
              <label className="field">
                {t("admin.subject")}
                <select
                  className="select"
                  value={course.subject}
                  onChange={(event) =>
                    patch({ subject: event.target.value as Course["subject"] })
                  }
                >
                  {["Development", "Data", "Cloud", "AI"].map((value) => (
                    <option key={value} value={value}>
                      {t(`admin.${value.toLowerCase()}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                {t("admin.level")}
                <select
                  className="select"
                  value={course.level}
                  onChange={(event) =>
                    patch({ level: event.target.value as Course["level"] })
                  }
                >
                  {["Beginner", "Intermediate", "Advanced"].map((value) => (
                    <option key={value} value={value}>
                      {t(`admin.${value.toLowerCase()}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                {t("admin.language")}
                <select
                  className="select"
                  value={course.language}
                  onChange={(event) =>
                    patch({
                      language: event.target.value as Course["language"],
                    })
                  }
                >
                  <option value="en">{t("admin.english")}</option>
                  <option value="vi">{t("admin.vietnamese")}</option>
                </select>
              </label>
            </div>
            <label className="field">
              {t("admin.skills")}
              <input
                className="input"
                value={skillsText}
                onChange={(event) => {
                  setSkillsText(event.target.value);
                  patch({
                    skills: event.target.value
                      .split(",")
                      .map((value) => value.trim())
                      .filter(Boolean),
                  });
                }}
              />
            </label>
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>{t("admin.curriculum")}</h2>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() =>
                patch({
                  modules: [
                    ...course.modules,
                    {
                      id: newId("module"),
                      title: t("admin.newModule"),
                      lessons: [],
                    },
                  ],
                })
              }
            >
              <Plus size={16} />
              {t("admin.addModule")}
            </button>
          </div>
          {course.modules.length ? (
            <div className="stack">
              {course.modules.map((module, index) => (
                <div className="editor-module" key={module.id}>
                  <div className="row">
                    <span className="module-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <label className="field grow">
                      <span className="sr-only">
                        {t("admin.moduleTitle")} {index + 1}
                      </span>
                      <input
                        className="input"
                        aria-label={`${t("admin.moduleTitle")} ${index + 1}`}
                        value={module.title}
                        onChange={(event) =>
                          updateModule(module.id, { title: event.target.value })
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`${t("admin.remove")}: ${module.title}`}
                      onClick={() =>
                        patch({
                          modules: course.modules.filter(
                            (item) => item.id !== module.id,
                          ),
                        })
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="stack editor-lessons">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <details className="editor-lesson" key={lesson.id}>
                        <summary>
                          <FileText size={15} />
                          <span>
                            {lesson.title ||
                              `${t("admin.newLesson")} ${lessonIndex + 1}`}
                          </span>
                          <ChevronRight size={15} />
                        </summary>
                        <div className="stack">
                          <label className="field">
                            {t("admin.lessonTitle")}
                            <input
                              className="input"
                              value={lesson.title}
                              onChange={(event) =>
                                updateLesson(module.id, lesson.id, {
                                  title: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="field">
                            {t("admin.lessonType")}
                            <select
                              className="select"
                              value={lesson.type}
                              onChange={(event) =>
                                updateLesson(module.id, lesson.id, {
                                  type: event.target.value as Lesson["type"],
                                })
                              }
                            >
                              {["reading", "video", "quiz"].map((value) => (
                                <option key={value} value={value}>
                                  {t(`admin.${value}`)}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="field">
                            {t("admin.lessonBody")}
                            <textarea
                              rows={3}
                              className="textarea"
                              value={lesson.content}
                              onChange={(event) =>
                                updateLesson(module.id, lesson.id, {
                                  content: event.target.value,
                                })
                              }
                            />
                          </label>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() =>
                              updateModule(module.id, {
                                lessons: module.lessons.filter(
                                  (item) => item.id !== lesson.id,
                                ),
                              })
                            }
                          >
                            <Trash2 size={15} />
                            {t("admin.remove")}
                          </button>
                        </div>
                      </details>
                    ))}
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        updateModule(module.id, {
                          lessons: [
                            ...module.lessons,
                            {
                              id: newId("lesson"),
                              title: t("admin.newLesson"),
                              type: "reading",
                              duration: "10 min",
                              content: "",
                            },
                          ],
                        })
                      }
                    >
                      <Plus size={15} />
                      {t("admin.addLesson")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <ClipboardList size={30} />
              <h3>{t("admin.emptyCurriculum")}</h3>
              <p>{t("admin.emptyCurriculumText")}</p>
            </div>
          )}
        </section>
        <div className="editor-actionbar">
          <Link href="/admin/courses" className="btn btn-ghost">
            {t("admin.back")}
          </Link>
          <button type="submit" className="btn btn-primary">
            <Check size={17} />
            {t("admin.save")}
          </button>
        </div>
      </form>
      {preview && (
        <section className="panel publish-preview">
          <div className="panel-heading">
            <h2>{t("admin.preview")}</h2>
            <span className="badge badge-blue">{t("admin.draft")}</span>
          </div>
          <p className="muted">{t("admin.previewNote")}</p>
          <h2>{course.title || t("admin.courseTitle")}</h2>
          <p>{course.description}</p>
          <div className="skill-list">
            {course.skills.map((skill) => (
              <span className="badge" key={skill}>
                {skill}
              </span>
            ))}
          </div>
          <div className="stack">
            {course.modules.map((module) => (
              <div key={module.id}>
                <h3>{module.title}</h3>
                <ul>
                  {module.lessons.map((lesson) => (
                    <li key={lesson.id}>{lesson.title}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" type="button" onClick={publish}>
            <CheckCircle2 size={17} />
            {t("admin.publish")}
          </button>
        </section>
      )}
    </div>
  );
}

function generateModules(t: (key: string) => string): Module[] {
  const lesson = (
    id: string,
    titleKey: string,
    type: Lesson["type"],
  ): Lesson => ({
    id,
    title: t(titleKey),
    type,
    duration: "12 min",
    content: t("admin.generatedContent"),
  });
  return [
    {
      id: newId("module"),
      title: t("admin.generatedModuleOne"),
      lessons: [
        lesson(newId("lesson"), "admin.generatedLessonOne", "reading"),
        lesson(newId("lesson"), "admin.generatedLessonTwo", "reading"),
      ],
    },
    {
      id: newId("module"),
      title: t("admin.generatedModuleTwo"),
      lessons: [
        lesson(newId("lesson"), "admin.generatedLessonThree", "video"),
        lesson(newId("lesson"), "admin.generatedLessonFour", "quiz"),
      ],
    },
  ];
}

export function GenerationWizard() {
  const { t, locale, saveCourse, addDraft } = useDemo();
  const [step, setStep] = useState(0);
  const [source, setSource] = useState<{ name: string; size: number } | null>(
    null,
  );
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<"en" | "vi">(locale);
  const [level, setLevel] = useState<Course["level"]>("Beginner");
  const [error, setError] = useState("");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [modules, setModules] = useState<Module[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const [approved, setApproved] = useState(false);
  const [resultCourseId, setResultCourseId] = useState("");
  useEffect(() => {
    if (step !== 2) return;
    const timer = window.setTimeout(() => {
      if (generation < 2) setGeneration((value) => value + 1);
      else if (simulateFailure) {
        setError("admin.generationError");
        setStep(1);
      } else {
        setModules(generateModules((key) => translate(language, key)));
        setStep(3);
      }
    }, 650);
    return () => window.clearTimeout(timer);
  }, [step, generation, simulateFailure, language]);
  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      !/\.(pdf|docx|pptx|md)$/i.test(file.name) ||
      file.size === 0 ||
      file.size > 10 * 1024 * 1024
    ) {
      setSource(null);
      setError("admin.fileError");
      return;
    }
    setSource({ name: file.name, size: file.size });
    setError("");
  }
  function start(event: FormEvent) {
    event.preventDefault();
    setError("");
    setGeneration(0);
    setStep(2);
  }
  function approve() {
    if (!reviewed) {
      setError("admin.reviewRequired");
      return;
    }
    const id = newId("generated");
    const course = {
      ...emptyCourse(),
      id,
      slug: id,
      title: title.trim() || t("admin.defaultDraftTitle"),
      subtitle: translate(language, "admin.generatedModuleOne"),
      description: translate(language, "admin.generatedContent"),
      language,
      level,
      subject: "AI" as const,
      modules,
      art: "rag" as const,
      skills: ["AI", "Prototyping", "Evaluation"],
    };
    const draft: GeneratedDraft = {
      id: newId("draft"),
      title: course.title,
      courseId: id,
      modules,
      status: "approved",
      createdAt: new Date().toISOString(),
    };
    saveCourse(course);
    addDraft(draft);
    setResultCourseId(id);
    setApproved(true);
    setError("");
  }
  const steps = [
    "admin.stepSource",
    "admin.stepSettings",
    "admin.stepGenerate",
    "admin.stepReview",
  ];
  return (
    <div className="stack admin-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            <Sparkles size={14} />
            {t("admin.studio")}
          </span>
          <h1>{t("admin.studioTitle")}</h1>
          <p className="muted">{t("admin.studioText")}</p>
        </div>
      </div>
      <ol className="stepper" aria-label={t("admin.studio")}>
        {steps.map((key, index) => (
          <li
            key={key}
            className={`wizard-step ${step >= index ? "active" : ""}`}
            aria-current={step === index ? "step" : undefined}
          >
            <span>{step > index ? <Check size={16} /> : index + 1}</span>
            <strong>{t(key)}</strong>
          </li>
        ))}
      </ol>
      {error && (
        <div className="alert alert-error" role="alert">
          {t(error)}
        </div>
      )}
      {step === 0 && (
        <section className="panel wizard-panel">
          <div className="wizard-heading">
            <span className="wizard-icon">
              <Upload size={28} />
            </span>
            <h2>{t("admin.uploadTitle")}</h2>
            <p className="muted">{t("admin.uploadText")}</p>
          </div>
          <div className="upload-zone">
            <Upload size={34} />
            <label className="btn btn-secondary" htmlFor="source-upload">
              {t("admin.chooseFile")}
            </label>
            <input
              className="input file-input"
              id="source-upload"
              type="file"
              accept=".pdf,.docx,.pptx,.md"
              onChange={selectFile}
            />
            <p>{t("admin.fileHelp")}</p>
            <button
              className="text-link"
              type="button"
              onClick={() => {
                setSource({ name: t("admin.sourceName"), size: 245760 });
                setError("");
              }}
            >
              {t("admin.sampleSource")}
              <ArrowRight size={15} />
            </button>
          </div>
          {source && (
            <div className="source-selected">
              <FileText size={22} />
              <div>
                <small>{t("admin.selected")}</small>
                <strong>{source.name}</strong>
                <span>{Math.max(1, Math.round(source.size / 1024))} KB</span>
              </div>
              <CheckCircle2 size={20} />
            </div>
          )}
          <div className="wizard-actions">
            <span />
            <button
              type="button"
              className="btn btn-primary"
              disabled={!source}
              onClick={() => {
                setStep(1);
                setError("");
              }}
            >
              {t("admin.continue")}
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}
      {step === 1 && (
        <form className="panel wizard-panel stack" onSubmit={start}>
          <h2>{t("admin.directionTitle")}</h2>
          <p className="muted">{t("admin.directionText")}</p>
          <label className="field">
            {t("admin.courseTitle")}
            <input
              className="input"
              required
              minLength={3}
              maxLength={120}
              value={title}
              placeholder={t("admin.defaultDraftTitle")}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <div className="grid-2">
            <label className="field">
              {t("admin.language")}
              <select
                className="select"
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as "en" | "vi")
                }
              >
                <option value="en">{t("admin.english")}</option>
                <option value="vi">{t("admin.vietnamese")}</option>
              </select>
            </label>
            <label className="field">
              {t("admin.level")}
              <select
                className="select"
                value={level}
                onChange={(event) =>
                  setLevel(event.target.value as Course["level"])
                }
              >
                {["Beginner", "Intermediate", "Advanced"].map((value) => (
                  <option key={value} value={value}>
                    {t(`admin.${value.toLowerCase()}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(event) => setSimulateFailure(event.target.checked)}
            />
            {t("admin.simulateFailure")}
          </label>
          <div className="wizard-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setStep(0)}
            >
              <ArrowLeft size={16} />
              {t("admin.back")}
            </button>
            <button type="submit" className="btn btn-primary">
              <Sparkles size={17} />
              {t("admin.generate")}
            </button>
          </div>
        </form>
      )}
      {step === 2 && (
        <section
          className="panel wizard-panel generation-loading"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="generation-orbit">
            <Sparkles size={38} />
          </div>
          <h2>{t("admin.generating")}</h2>
          <p className="muted">{t("admin.generatingText")}</p>
          <div className="generation-stages">
            {["admin.stageOne", "admin.stageTwo", "admin.stageThree"].map(
              (key, index) => (
                <div key={key} className={generation >= index ? "active" : ""}>
                  {generation > index ? (
                    <CheckCircle2 size={18} />
                  ) : generation === index ? (
                    <LoaderCircle size={18} className="spin" />
                  ) : (
                    <CircleDashed size={18} />
                  )}
                  {t(key)}
                </div>
              ),
            )}
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${((generation + 1) / 3) * 100}%` }}
            />
          </div>
        </section>
      )}
      {step === 3 && (
        <section className="panel wizard-panel stack">
          <div className="panel-heading">
            <div>
              <span className="badge badge-green">
                <CheckCircle2 size={13} />
                {t("admin.stepReview")}
              </span>
              <h2>{t("admin.reviewTitle")}</h2>
            </div>
            <Sparkles className="studio-color" size={28} />
          </div>
          <p className="muted">{t("admin.reviewText")}</p>
          {approved ? (
            <div className="approved-panel" role="status">
              <CheckCircle2 size={42} />
              <h3>{t("admin.approved")}</h3>
              <Link
                className="btn btn-primary"
                href={`/admin/courses/${resultCourseId}/edit`}
              >
                {t("admin.edit")}
                <ArrowRight size={16} />
              </Link>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => {
                  setStep(0);
                  setSource(null);
                  setTitle("");
                  setReviewed(false);
                  setApproved(false);
                }}
              >
                {t("admin.startAgain")}
              </button>
            </div>
          ) : (
            <>
              <h3>{title || t("admin.defaultDraftTitle")}</h3>
              <div className="stack generated-curriculum">
                {modules.map((module, index) => (
                  <details key={module.id} open={index === 0}>
                    <summary>
                      <span className="module-number">{index + 1}</span>
                      <strong>{module.title}</strong>
                      <span>
                        {module.lessons.length} {t("admin.lessons")}
                      </span>
                      <ChevronRight size={17} />
                    </summary>
                    <ul>
                      {module.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <FileText size={15} />
                          <span>{lesson.title}</span>
                          <small>{t(`admin.${lesson.type}`)}</small>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
              <details className="review-sample">
                <summary>
                  {t("admin.reviewLesson")}
                  <ChevronRight size={16} />
                </summary>
                <p>{modules[0]?.lessons[0]?.content}</p>
              </details>
              <details className="review-sample">
                <summary>
                  {t("admin.reviewQuiz")}
                  <ChevronRight size={16} />
                </summary>
                <h4>{translate(language, "admin.quizQuestion")}</h4>
                <p className="review-answer">
                  <CheckCircle2 size={15} />
                  {translate(language, "admin.quizOptionA")}
                </p>
                <p>{translate(language, "admin.quizOptionB")}</p>
                <small className="muted">
                  {translate(language, "admin.quizExplanation")}
                </small>
              </details>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={reviewed}
                  onChange={(event) => setReviewed(event.target.checked)}
                />
                {t("admin.reviewCheck")}
              </label>
              <div className="wizard-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setStep(1);
                    setReviewed(false);
                  }}
                >
                  <ArrowLeft size={16} />
                  {t("admin.back")}
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={!reviewed}
                  onClick={approve}
                >
                  <CheckCircle2 size={17} />
                  {t("admin.approve")}
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
