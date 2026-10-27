export type Language = "en" | "hi";

export const DEFAULT_LANGUAGE: Language = "en";
export const LANGUAGE_STORAGE_KEY = "satark_language";

export const LANGUAGE_LABELS: Record<Language, { short: string; name: string }> = {
  en: { short: "EN", name: "English" },
  hi: { short: "हिं", name: "हिन्दी" },
};

export function normalizeLanguage(value: unknown): Language {
  return value === "hi" ? "hi" : "en";
}

/** Return the value for the active language. */
export function pick<T>(language: Language, english: T, hindi: T): T {
  return language === "hi" ? hindi : english;
}

/** Replace simple {name} placeholders in a translated template. */
export function formatTemplate(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  );
}

/**
 * Widen literal types so a second-language copy object can be type-checked
 * against the shape of the English copy without requiring identical literals.
 */
export type LocalizedShape<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? readonly LocalizedShape<Item>[]
    : T extends object
      ? { [Key in keyof T]: LocalizedShape<T[Key]> }
      : T;
