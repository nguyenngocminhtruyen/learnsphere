"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Globe2,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useDemo } from "../lib/demo-context";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${inverse ? "brand-inverse" : ""}`}
      aria-label="LearnSphere"
    >
      <span className="brand-mark">
        <BookOpen size={23} strokeWidth={2.4} />
      </span>
      Learn<span>Sphere</span>
      <span className="brand-dot">.</span>
    </Link>
  );
}
export function SiteHeader() {
  const { locale, setLocale, t } = useDemo();
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  return (
    <>
      <div className="demo-bar">
        <div className="container">
          <span>
            <span className="live-dot" />
            {t("nav.demo")}
          </span>
          <span className="demo-bar-caption">
            {t("nav.demoCaption")}
            <Sparkles size={13} />
          </span>
        </div>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <Link href="/courses" className="explore-link">
            {t("nav.explore")}
            <ChevronDown size={15} />
          </Link>
          <form
            className="header-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              setMenu(false);
              router.push(`/courses?q=${encodeURIComponent(query)}`);
            }}
          >
            <label className="sr-only" htmlFor="global-search">
              {t("nav.search")}
            </label>
            <input
              id="global-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("nav.searchPlaceholder")}
            />
            <button aria-label={t("nav.search")}>
              <Search size={18} />
            </button>
          </form>
          <nav className="desktop-nav" aria-label={t("nav.main")}>
            <Link
              href="/my-learning"
              className={pathname.startsWith("/my-learning") ? "active" : ""}
            >
              {t("nav.myLearning")}
            </Link>
            <Link
              href="/admin"
              className={pathname.startsWith("/admin") ? "active" : ""}
            >
              {t("nav.admin")}
            </Link>
          </nav>
          <button
            className="language-switch"
            onClick={() => setLocale(locale === "en" ? "vi" : "en")}
            aria-label={t("nav.language")}
          >
            <Globe2 size={17} />
            <span>{locale.toUpperCase()}</span>
          </button>
          <Link href="/login" className="btn btn-primary btn-sm header-login">
            {t("nav.login")}
            <ArrowRight size={14} />
          </Link>
          <button
            className="icon-button menu-toggle"
            onClick={() => setMenu(!menu)}
            aria-label={t(menu ? "nav.close" : "nav.menu")}
            aria-expanded={menu}
            aria-controls="mobile-navigation"
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menu && (
          <nav
            id="mobile-navigation"
            className="mobile-nav container"
            aria-label={t("nav.main")}
            onClick={() => setMenu(false)}
          >
            <Link href="/courses">{t("nav.courses")}</Link>
            <Link href="/my-learning">{t("nav.myLearning")}</Link>
            <Link href="/admin">{t("nav.admin")}</Link>
            <Link href="/login">{t("nav.login")}</Link>
          </nav>
        )}
      </header>
    </>
  );
}
export function SiteFooter() {
  const { t } = useDemo();
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Brand inverse />
          <p>{t("footer.description")}</p>
          <span className="footer-caption">{t("footer.original")}</span>
        </div>
        <div>
          <h3>{t("footer.discover")}</h3>
          <Link href="/courses">{t("nav.courses")}</Link>
          <Link href="/courses?subject=AI">{t("subject.AI")}</Link>
          <Link href="/courses?subject=Cloud">{t("subject.Cloud")}</Link>
        </div>
        <div>
          <h3>{t("footer.workspace")}</h3>
          <Link href="/my-learning">{t("nav.myLearning")}</Link>
          <Link href="/admin">{t("nav.admin")}</Link>
          <Link href="/admin/ai-studio">{t("nav.aiStudio")}</Link>
        </div>
        <div>
          <h3>{t("footer.ready")}</h3>
          <p>{t("footer.smallSteps")}</p>
          <Link href="/courses" className="footer-cta">
            {t("home.explore")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 LearnSphere. {t("footer.demo")}</span>
        <span>
          {t("footer.crafted")}
          <span className="footer-spark">✳</span>
        </span>
      </div>
    </footer>
  );
}
export function SiteShell({ children }: { children: ReactNode }) {
  const { t } = useDemo();
  return (
    <>
      <a href="#main-content" className="skip-link">
        {t("nav.skip")}
      </a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
