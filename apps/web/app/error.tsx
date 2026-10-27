"use client";
import Link from "next/link";
import { useDemo } from "../lib/demo-context";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = useDemo();
  return (
    <div className="container section">
      <div className="empty-state">
        <h1>{t("common.error")}</h1>
        <p>{t("common.errorBody")}</p>
        <button className="btn btn-primary" onClick={reset}>
          {t("common.retry")}
        </button>
        <Link className="text-link" href="/courses">
          {t("nav.courses")}
        </Link>
      </div>
    </div>
  );
}
