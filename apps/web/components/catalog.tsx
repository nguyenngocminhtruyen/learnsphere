"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type CSSProperties } from "react";
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  Cloud,
  Code2,
  Cpu,
  Database,
  Globe2,
  Layers3,
  Lightbulb,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { useDemo } from "../lib/demo-context";
import {
  filterCourses,
  firstLesson,
  type Course,
  type Module,
} from "../lib/models";
import { Button } from "./ui/button";

const topicIcons = { AI: Cpu, Development: Code2, Cloud, Data: Database };
export function CourseArtwork({
  course,
  large = false,
}: {
  course: Course;
  large?: boolean;
}) {
  const symbols = {
    python: "Py",
    java: "{ }",
    cloud: "AWS",
    rag: "RAG",
    ml: "ML",
    llm: "AI",
  };
  return (
    <div
      className={`course-art art-${course.art} ${large ? "course-art-large" : ""}`}
      aria-hidden="true"
      style={{ "--art-color": course.color } as CSSProperties}
    >
      <div className="art-dot-grid" />
      <span className="art-top-label">
        LEARNSPHERE / {course.subject.toUpperCase()}
      </span>
      <svg viewBox="0 0 320 180" className="art-geometry">
        <circle
          cx="244"
          cy="64"
          r="65"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity=".2"
        />
        <circle
          cx="244"
          cy="64"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity=".2"
        />
        <path
          d="M208 60 242 40 277 60 277 100 242 120 208 100Z"
          fill="currentColor"
          opacity=".12"
        />
        <path
          d="m208 60 34 20 35-20M242 80v40M242 40v40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          opacity=".4"
        />
        <path
          d="M30 150h100M30 140h60"
          stroke="currentColor"
          opacity=".15"
          strokeWidth="2"
        />
      </svg>
      <span className="art-symbol">{symbols[course.art]}</span>
      <span className="art-bottom-label">
        {course.art === "python"
          ? "hello, possibility."
          : course.art === "java"
            ? "build something solid."
            : course.art === "cloud"
              ? "above & beyond."
              : course.art === "rag"
                ? "ground your intelligence."
                : course.art === "ml"
                  ? "find the patterns."
                  : "think in possibilities."}
      </span>
      <span className="art-arrow">
        <ArrowUpRight size={20} />
      </span>
    </div>
  );
}
export function CourseCard({ course }: { course: Course }) {
  const { t, locale } = useDemo();
  const [saved, setSaved] = useState(false);
  return (
    <article className="course-card">
      <Link href={`/courses/${course.slug}`} aria-label={course.title}>
        <CourseArtwork course={course} />
      </Link>
      <div className="course-card-body">
        <div className="course-provider">
          <span className="provider-icon">
            <BookOpen size={11} />
          </span>
          LearnSphere{" "}
          <button
            className={`bookmark-button ${saved ? "saved" : ""}`}
            onClick={() => setSaved(!saved)}
            aria-label={`${t(saved ? "course.unsave" : "course.save")}: ${course.title}`}
            aria-pressed={saved}
          >
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
        <Link href={`/courses/${course.slug}`} className="course-title">
          {course.title}
        </Link>
        <p className="course-description">{course.subtitle}</p>
        <div className="course-rating">
          <Star size={13} fill="currentColor" />
          <strong>{course.rating.toFixed(1)}</strong>
          <span>
            (
            {new Intl.NumberFormat(locale, { notation: "compact" }).format(
              course.learners,
            )}{" "}
            {t("course.learners")})
          </span>
        </div>
        <div className="course-meta">
          <span>{t(`level.${course.level}`)}</span>
          <span className="meta-dot">·</span>
          <span>{course.duration}</span>
          <span className="free-label">{t("course.free")}</span>
        </div>
      </div>
    </article>
  );
}
export function CourseGrid({ courses }: { courses: Course[] }) {
  return (
    <div className="course-grid">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
export function SearchBar({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const { t } = useDemo();
  return (
    <div className="search-input">
      <Search size={20} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label || t("catalog.search")}
        placeholder={label || t("catalog.search")}
      />
      {value && (
        <button
          className="clear-search"
          onClick={() => onChange("")}
          aria-label={t("catalog.clearSearch")}
        >
          ×
        </button>
      )}
    </div>
  );
}
export function CourseFilters({
  subject,
  level,
  language,
  setSubject,
  setLevel,
  setLanguage,
  clear,
}: {
  subject: string;
  level: string;
  language: string;
  setSubject: (s: string) => void;
  setLevel: (s: string) => void;
  setLanguage: (s: string) => void;
  clear: () => void;
}) {
  const { t } = useDemo();
  return (
    <aside className="catalog-filters" aria-label={t("catalog.filters")}>
      <div className="filter-heading">
        <h2>
          <SlidersHorizontal size={18} />
          {t("catalog.filters")}
        </h2>
        <button className="text-button" onClick={clear}>
          {t("catalog.reset")}
        </button>
      </div>
      <fieldset>
        <legend>{t("catalog.subject")}</legend>
        {["", "AI", "Development", "Cloud", "Data"].map((s) => (
          <label className="filter-option" key={s}>
            <input
              type="radio"
              name="subject"
              value={s}
              checked={subject === s}
              onChange={() => setSubject(s)}
            />
            {t(s ? `subject.${s}` : "catalog.allSubjects")}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>{t("catalog.level")}</legend>
        {["", "Beginner", "Intermediate", "Advanced"].map((s) => (
          <label className="filter-option" key={s}>
            <input
              type="radio"
              name="level"
              value={s}
              checked={level === s}
              onChange={() => setLevel(s)}
            />
            {t(s ? `level.${s}` : "catalog.allLevels")}
          </label>
        ))}
      </fieldset>
      <label className="field">
        <span>{t("catalog.language")}</span>
        <select
          className="select"
          aria-label={t("catalog.language")}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="">{t("catalog.allLanguages")}</option>
          <option value="en">English</option>
          <option value="vi">Tiếng Việt</option>
        </select>
      </label>
      <div className="filter-note">
        <Lightbulb size={24} />
        <h3>{t("catalog.curiosity")}</h3>
        <p>{t("catalog.curiosityDescription")}</p>
      </div>
    </aside>
  );
}
export function CurriculumAccordion({
  modules,
  courseId,
}: {
  modules: Module[];
  courseId?: string;
}) {
  const { t } = useDemo();
  return (
    <div className="curriculum-accordion">
      {modules.map((module, index) => (
        <details key={module.id} open={index === 0}>
          <summary>
            <span className="module-count">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <strong>{module.title}</strong>
              <span>
                {module.lessons.length} {t("course.lessons")}
              </span>
            </div>
            <ChevronDown size={18} />
          </summary>
          <div className="curriculum-lessons">
            {module.lessons.map((lesson) => (
              <div key={lesson.id} className="curriculum-preview">
                <BookOpen size={16} />
                {courseId ? (
                  <Link href={`/learn/${courseId}/${lesson.id}`}>
                    {lesson.title}
                  </Link>
                ) : (
                  <span>{lesson.title}</span>
                )}
                <span className="muted">{lesson.duration}</span>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
function HeroArtwork() {
  const { t } = useDemo();
  return (
    <div className="hero-artwork" aria-label={t("home.artLabel")} role="img">
      <div className="hero-orbit orbit-one" />
      <div className="hero-orbit orbit-two" />
      <div className="hero-spark spark-one">✳</div>
      <div className="hero-spark spark-two">+</div>
      <div className="hero-code-window">
        <div className="code-window-bar">
          <span />
          <span />
          <span />
          <small>your_next_chapter.py</small>
          <Code2 size={16} />
        </div>
        <div className="code-window-body">
          <span className="code-comment"># {t("home.codeComment")}</span>
          <p>
            <b>from</b> curiosity <b>import</b> possibility
          </p>
          <p>
            <b>def</b> <em>build_your_future</em>():
          </p>
          <p className="code-indent">
            skills = [<i>&quot;Python&quot;</i>, <i>&quot;AI&quot;</i>,{" "}
            <i>&quot;Cloud&quot;</i>]
          </p>
          <p className="code-indent">
            <b>for</b> day <b>in</b> your_journey:
          </p>
          <p className="code-indent double-indent">
            you.<em>learn</em>(something_new)
          </p>
          <p className="code-indent">
            <b>return</b> <i>&quot;A world of possibility&quot;</i>
          </p>
          <div className="code-output">
            <span>❯</span>
            {t("home.readyOutput")}
            <span className="code-cursor" />
          </div>
        </div>
      </div>
      <div className="hero-progress-card">
        <span className="hero-icon-check">
          <Check size={20} />
        </span>
        <div>
          <strong>{t("home.progressTitle")}</strong>
          <span>{t("home.progressCaption")}</span>
          <div className="hero-progress-line">
            <i />
          </div>
        </div>
        <span>75%</span>
      </div>
      <div className="hero-topic-card">
        <span>
          <Sparkles size={22} />
        </span>
        <div>
          <small>{t("home.nextSkill")}</small>
          <strong>Generative AI</strong>
        </div>
        <ArrowUpRight size={19} />
      </div>
      <div className="hero-lesson-card">
        <div>
          <Code2 size={25} />
        </div>
        <span>
          {t("home.smallWin")}
          <strong>{t("home.bigFuture")}</strong>
        </span>
      </div>
    </div>
  );
}
export function HomePage() {
  const { courses, t } = useDemo();
  const published = courses.filter((c) => c.status === "published");
  const [query, setQuery] = useState("");
  const router = useRouter();
  return (
    <>
      <div className="subject-navigation">
        <div className="container">
          <span className="subject-nav-label">{t("home.discover")}</span>
          {Object.entries(topicIcons).map(([subject, Icon]) => (
            <Link key={subject} href={`/courses?subject=${subject}`}>
              <Icon size={15} />
              {t(`subject.${subject}`)}
            </Link>
          ))}
          <Link href="/courses" className="subject-nav-all">
            {t("home.allCourses")}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow hero-eyebrow">
              <span className="tiny-spark">✳</span>
              {t("home.eyebrow")}
            </span>
            <h1>
              {t("home.headlineA")}
              <br />
              <span>{t("home.headlineB")}</span>
            </h1>
            <p className="hero-description">{t("home.description")}</p>
            <div className="hero-actions">
              <Button asChild>
                <Link href="/courses">
                  {t("home.explore")}
                  <ArrowRight size={17} />
                </Link>
              </Button>
              <Link href="/courses?subject=AI" className="hero-secondary">
                {t("home.findPath")}
                <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="hero-benefits">
              <span>
                <Check size={15} />
                {t("home.free")}
              </span>
              <span>
                <Check size={15} />
                {t("home.atYourPace")}
              </span>
              <span>
                <Check size={15} />
                {t("home.realSkills")}
              </span>
            </div>
          </div>
          <HeroArtwork />
        </div>
      </section>
      <section className="trust-strip">
        <div className="container trust-inner">
          <span>{t("home.skillsFor")}</span>
          <div>
            <Code2 />
            {t("subject.Development")}
          </div>
          <div>
            <Cloud />
            {t("subject.Cloud")}
          </div>
          <div>
            <Cpu />
            {t("subject.AI")}
          </div>
          <div>
            <Database />
            {t("subject.Data")}
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t("home.startHere")}</span>
            <h2>{t("home.featured")}</h2>
            <p>{t("home.featuredDescription")}</p>
          </div>
          <Link className="text-link" href="/courses">
            {t("home.viewAll")}
            <ArrowRight size={17} />
          </Link>
        </div>
        <CourseGrid courses={published.slice(0, 4)} />
      </section>
      <section className="category-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{t("home.followCuriosity")}</span>
              <h2>{t("home.categories")}</h2>
            </div>
            <span className="muted category-note">
              {t("home.categoriesNote")}
            </span>
          </div>
          <div className="category-grid">
            {Object.entries(topicIcons).map(([subject, Icon], index) => (
              <Link
                href={`/courses?subject=${subject}`}
                key={subject}
                className={`category-card category-${index}`}
              >
                <span className="category-icon">
                  <Icon size={26} />
                </span>
                <h3>{t(`subject.${subject}`)}</h3>
                <p>{t(`category.${subject}`)}</p>
                <span>
                  {published.filter((c) => c.subject === subject).length}{" "}
                  {t("home.courses")}
                  <ArrowUpRight size={18} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="path-banner">
          <div className="path-illustration" aria-hidden="true">
            <span className="path-node">
              <BookOpen />
            </span>
            <span className="path-line" />
            <span className="path-node">
              <Code2 />
            </span>
            <span className="path-line" />
            <span className="path-node filled">
              <Sparkles />
            </span>
          </div>
          <div>
            <span className="eyebrow">{t("home.pathEyebrow")}</span>
            <h2>{t("home.pathTitle")}</h2>
            <p>{t("home.pathDescription")}</p>
          </div>
          <Link href="/courses?subject=AI" className="btn btn-primary">
            {t("home.pathAction")}
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <section className="section container recommendation-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t("home.keepGoing")}</span>
            <h2>{t("home.recommended")}</h2>
            <p>{t("home.recommendedDescription")}</p>
          </div>
          <span className="recommendation-label">
            <Sparkles size={16} />
            {t("home.editorsPick")}
          </span>
        </div>
        <CourseGrid courses={published.slice(3, 6)} />
      </section>
      <section className="learning-cta">
        <div className="container cta-inner">
          <div>
            <span className="eyebrow">{t("home.oneSmallStep")}</span>
            <h2>{t("home.ctaTitle")}</h2>
            <p>{t("home.ctaDescription")}</p>
          </div>
          <form
            className="cta-search"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/courses?q=${encodeURIComponent(query)}`);
            }}
          >
            <label className="sr-only" htmlFor="cta-search">
              {t("catalog.search")}
            </label>
            <Search size={20} />
            <input
              id="cta-search"
              placeholder={t("nav.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button aria-label={t("nav.search")}>
              <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
export function CatalogPage({
  initialQuery = "",
  initialSubject = "",
}: {
  initialQuery?: string;
  initialSubject?: string;
}) {
  const { courses, t } = useDemo();
  const [query, setQuery] = useState(initialQuery);
  const [subject, setSubject] = useState(initialSubject);
  const [level, setLevel] = useState("");
  const [language, setLanguage] = useState("");
  const [sort, setSort] = useState<"popular" | "rating" | "title">("popular");
  const [showFilters, setShowFilters] = useState(false);
  const filtered = useMemo(
    () => filterCourses(courses, { query, subject, level, language, sort }),
    [courses, query, subject, level, language, sort],
  );
  const clear = () => {
    setQuery("");
    setSubject("");
    setLevel("");
    setLanguage("");
  };
  return (
    <>
      <section className="catalog-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">{t("nav.home")}</Link>
            <span>/</span>
            {t("nav.courses")}
          </div>
          <span className="eyebrow">{t("catalog.eyebrow")}</span>
          <h1>{t("catalog.title")}</h1>
          <p>{t("catalog.description")}</p>
          <div className="catalog-search">
            <SearchBar value={query} onChange={setQuery} />
          </div>
          <div className="catalog-quick-links">
            <span>{t("catalog.trending")}</span>
            {["Python", "AWS", "RAG", "Machine Learning"].map((term) => (
              <button
                key={term}
                onClick={() => {
                  clear();
                  setQuery(term);
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="container catalog-section">
        <div className="catalog-toolbar">
          <span role="status">
            <strong>{filtered.length}</strong> {t("catalog.results")}
            {query && (
              <>
                {" "}
                {t("catalog.for")} “{query}”
              </>
            )}
          </span>
          <div className="row">
            <button
              className="btn btn-secondary btn-sm mobile-filter-button"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal size={16} />
              {t("catalog.filters")}
            </button>
            <label className="sort-control">
              <ArrowDownUp size={16} />
              <span>{t("catalog.sort")}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                aria-label={t("catalog.sort")}
              >
                <option value="popular">{t("catalog.popular")}</option>
                <option value="rating">{t("catalog.rating")}</option>
                <option value="title">{t("catalog.alphabetical")}</option>
              </select>
            </label>
          </div>
        </div>
        <div className="catalog-layout">
          <div className={showFilters ? "filter-column show" : "filter-column"}>
            <CourseFilters
              {...{
                subject,
                level,
                language,
                setSubject,
                setLevel,
                setLanguage,
                clear,
              }}
            />
          </div>
          <div className="catalog-results">
            {filtered.length ? (
              <CourseGrid courses={filtered} />
            ) : (
              <div className="empty-state">
                <Search size={38} />
                <h2>{t("catalog.emptyTitle")}</h2>
                <p>{t("catalog.emptyDescription")}</p>
                <button className="btn btn-primary" onClick={clear}>
                  {t("catalog.reset")}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
export function CourseDetailsPage({ slug }: { slug: string }) {
  const { courses, enrollments, enroll, t } = useDemo();
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const course = courses.find(
    (c) => c.slug === slug && c.status === "published",
  );
  if (!course)
    return (
      <div className="container section empty-state">
        <BookOpen size={40} />
        <h1>{t("course.notFound")}</h1>
        <Link className="btn btn-primary" href="/courses">
          {t("home.explore")}
        </Link>
      </div>
    );
  const enrolled = enrollments.some((e) => e.courseId === course.id);
  const lessonCount = course.modules.reduce(
    (count, module) => count + module.lessons.length,
    0,
  );
  const start = () => {
    enroll(course.id);
    const lesson = firstLesson(course);
    if (lesson) router.push(`/learn/${course.id}/${lesson.id}`);
  };
  return (
    <>
      <section className="course-detail-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/courses">{t("nav.courses")}</Link>
            <span>/</span>
            <Link href={`/courses?subject=${course.subject}`}>
              {t(`subject.${course.subject}`)}
            </Link>
          </div>
          <div className="detail-hero-copy">
            <span className="badge badge-blue">
              {t("course.learningSeries")}
            </span>
            <h1>{course.title}</h1>
            <p>{course.subtitle}</p>
            <div className="detail-rating">
              <Star size={16} fill="currentColor" />
              <strong>{course.rating}</strong>
              <span>
                ({course.learners.toLocaleString()} {t("course.learners")})
              </span>
              <span className="detail-divider" />{" "}
              <span>
                <Globe2 size={15} />
                {course.language === "vi" ? "Tiếng Việt" : "English"}
              </span>
            </div>
            <div className="instructor-line">
              <span className="avatar">{course.instructor.initials}</span>
              <span>
                {t("course.taughtBy")} <strong>{course.instructor.name}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>
      <div className="container detail-layout">
        <div className="detail-main">
          <div className="course-facts">
            <div>
              <Layers3 size={20} />
              <strong>
                {course.modules.length} {t("course.modules")}
              </strong>
              <span>{t("course.structured")}</span>
            </div>
            <div>
              <Clock3 size={20} />
              <strong>{course.duration}</strong>
              <span>{t("course.selfPaced")}</span>
            </div>
            <div>
              <Zap size={20} />
              <strong>{t(`level.${course.level}`)}</strong>
              <span>{t("course.practical")}</span>
            </div>
          </div>
          <div
            className="detail-tabs"
            role="tablist"
            aria-label={t("course.sections")}
          >
            {["overview", "curriculum", "instructor"].map((item) => (
              <button
                key={item}
                role="tab"
                id={`tab-${item}`}
                aria-controls={`panel-${item}`}
                aria-selected={tab === item}
                tabIndex={tab === item ? 0 : -1}
                onKeyDown={(event) => {
                  const items = ["overview", "curriculum", "instructor"];
                  const index = items.indexOf(item);
                  const next =
                    event.key === "ArrowRight"
                      ? items[(index + 1) % 3]
                      : event.key === "ArrowLeft"
                        ? items[(index + 2) % 3]
                        : event.key === "Home"
                          ? items[0]
                          : event.key === "End"
                            ? items[2]
                            : undefined;
                  if (next) {
                    event.preventDefault();
                    setTab(next);
                    document.getElementById(`tab-${next}`)?.focus();
                  }
                }}
                onClick={() => setTab(item)}
              >
                {t(`course.${item}`)}
              </button>
            ))}
          </div>
          <section
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`tab-${tab}`}
            className="detail-tab-content"
          >
            {tab === "overview" ? (
              <>
                <h2>{t("course.about")}</h2>
                <p className="course-about">{course.description}</p>
                <h2>{t("course.outcomes")}</h2>
                <ul className="outcomes-grid">
                  {course.outcomes.map((outcome) => (
                    <li key={outcome}>
                      <span>
                        <Check size={16} />
                      </span>
                      {outcome}
                    </li>
                  ))}
                </ul>
                <h2>{t("course.skills")}</h2>
                <div className="skill-list">
                  {course.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
                <div className="detail-curriculum-preview">
                  <div className="section-heading">
                    <h2>{t("course.curriculum")}</h2>
                    <button
                      className="text-button"
                      onClick={() => setTab("curriculum")}
                    >
                      {t("course.viewCurriculum")}
                      <ArrowRight size={15} />
                    </button>
                  </div>
                  <CurriculumAccordion
                    modules={course.modules.slice(0, 1)}
                    courseId={course.id}
                  />
                </div>
              </>
            ) : tab === "curriculum" ? (
              <>
                <h2>{t("course.curriculum")}</h2>
                <p className="muted">
                  {course.modules.length} {t("course.modules")} · {lessonCount}{" "}
                  {t("course.lessons")}
                </p>
                <CurriculumAccordion
                  modules={course.modules}
                  courseId={course.id}
                />
              </>
            ) : (
              <>
                <h2>{t("course.meetInstructor")}</h2>
                <div className="instructor-profile">
                  <span className="avatar avatar-large">
                    {course.instructor.initials}
                  </span>
                  <div>
                    <h3>{course.instructor.name}</h3>
                    <p>{course.instructor.title}</p>
                    <span className="badge">{t("course.demoInstructor")}</span>
                  </div>
                </div>
                <p className="course-about">
                  {t("course.instructorDescription")}
                </p>
              </>
            )}
          </section>
        </div>
        <aside className="enrollment-card">
          <CourseArtwork course={course} large />
          <div className="enrollment-card-body">
            <span className="eyebrow">{t("course.investInYou")}</span>
            <div className="enrollment-price">
              {t("course.free")}
              <span>{t("course.alwaysCurious")}</span>
            </div>
            <button className="btn btn-primary w-full" onClick={start}>
              {t(enrolled ? "course.continue" : "course.enroll")}
              <ArrowRight size={17} />
            </button>
            <p className="enrollment-note">{t("course.enrollDemo")}</p>
            <div className="enrollment-includes">
              <h3>{t("course.includes")}</h3>
              <span>
                <BookOpen size={17} />
                {lessonCount} {t("course.lessons")}
              </span>
              <span>
                <Clock3 size={17} />
                {t("course.flexible")}
              </span>
              <span>
                <Users size={17} />
                {t("course.practice")}
              </span>
              <span>
                <Sparkles size={17} />
                {t("course.tutorPreview")}
              </span>
            </div>
          </div>
        </aside>
      </div>
      <section className="section container related-courses">
        <div className="section-heading">
          <h2>{t("course.nextCuriosity")}</h2>
          <Link href="/courses" className="text-link">
            {t("home.viewAll")}
            <ArrowRight size={16} />
          </Link>
        </div>
        <CourseGrid
          courses={courses
            .filter((c) => c.status === "published" && c.id !== course.id)
            .slice(0, 3)}
        />
      </section>
    </>
  );
}
