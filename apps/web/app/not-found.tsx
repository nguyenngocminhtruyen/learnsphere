"use client";
import Link from "next/link";
import { Compass } from "lucide-react";
import { useDemo } from "../lib/demo-context";
export default function NotFound() {
  const { t } = useDemo();
  return (
    <div className="container section" style={{ paddingBottom: 72 }}>
      <div className="empty-state">
        <Compass size={42} />
        <h1>{t("common.notFound")}</h1>
        <p>{t("common.notFoundBody")}</p>
        <Link className="btn btn-primary" href="/courses">
          {t("home.explore")}
        </Link>
      </div>
    </div>
  );
}
