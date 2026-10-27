"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  courses as fixtureCourses,
  initialEnrollments,
  initialProgress,
} from "./fixtures";
import { enrollInCourse, markLessonComplete } from "./models";
import type {
  Course,
  Enrollment,
  GeneratedDraft,
  Locale,
  StudentProgress,
} from "./models";
import { translate } from "./i18n";

interface DemoContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  courses: Course[];
  enrollments: Enrollment[];
  progress: StudentProgress[];
  drafts: GeneratedDraft[];
  enroll: (courseId: string) => void;
  completeLesson: (courseId: string, lessonId: string) => void;
  saveCourse: (course: Course) => void;
  addDraft: (draft: GeneratedDraft) => void;
}
const DemoContext = createContext<DemoContextValue | null>(null);
const LOCALE_KEY = "learnsphere.locale";

/** Demo state is intentionally ephemeral. Only the non-sensitive locale preference is stored. */
export function DemoProvider({ children }: { children: ReactNode }) {
  const [locale, updateLocale] = useState<Locale>("en");
  const [courses, setCourses] = useState<Course[]>(fixtureCourses);
  const [enrollments, setEnrollments] =
    useState<Enrollment[]>(initialEnrollments);
  const [progress, setProgress] = useState<StudentProgress[]>(initialProgress);
  const [drafts, setDrafts] = useState<GeneratedDraft[]>([]);

  useEffect(() => {
    try {
      const preference = window.localStorage.getItem(LOCALE_KEY);
      if (preference === "en" || preference === "vi") updateLocale(preference);
    } catch {
      // Storage may be unavailable in private browser contexts; the demo still works.
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const setLocale = useCallback((next: Locale) => {
    updateLocale(next);
    try {
      window.localStorage.setItem(LOCALE_KEY, next);
    } catch {
      /* Preference persistence is optional. */
    }
  }, []);
  const t = useCallback((key: string) => translate(locale, key), [locale]);
  const enroll = useCallback(
    (courseId: string) => {
      setEnrollments((current) =>
        enrollInCourse(courses, current, courseId, new Date().toISOString()),
      );
    },
    [courses],
  );
  const completeLesson = useCallback(
    (courseId: string, lessonId: string) => {
      setProgress((current) =>
        markLessonComplete(courses, enrollments, current, courseId, lessonId),
      );
    },
    [courses, enrollments],
  );
  const saveCourse = useCallback((course: Course) => {
    if (!course.id.trim() || !course.title.trim()) return;
    setCourses((current) =>
      current.some((item) => item.id === course.id)
        ? current.map((item) => (item.id === course.id ? course : item))
        : [...current, course],
    );
  }, []);
  const addDraft = useCallback((draft: GeneratedDraft) => {
    setDrafts((current) =>
      current.some((item) => item.id === draft.id)
        ? current.map((item) => (item.id === draft.id ? draft : item))
        : [...current, draft],
    );
  }, []);
  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      courses,
      enrollments,
      progress,
      drafts,
      enroll,
      completeLesson,
      saveCourse,
      addDraft,
    }),
    [
      locale,
      setLocale,
      t,
      courses,
      enrollments,
      progress,
      drafts,
      enroll,
      completeLesson,
      saveCourse,
      addDraft,
    ],
  );
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo requires DemoProvider");
  return context;
}
