"use client";
import { useDemo } from "../lib/demo-context";
export default function Loading() {
  const { t } = useDemo();
  return (
    <div className="app-loading" role="status">
      <div className="loading-spinner" aria-hidden="true" />
      {t("common.loading")}
    </div>
  );
}
