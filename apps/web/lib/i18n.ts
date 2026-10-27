import en from "../messages/en.json";
import vi from "../messages/vi.json";
import type { Locale } from "./models";

const dictionaries: Record<Locale, Record<string, string>> = { en, vi };
export function translate(locale: Locale, key: string): string {
  return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
}
