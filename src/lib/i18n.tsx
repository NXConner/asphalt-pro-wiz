import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export type Locale = "en" | "es";

type Dictionary = Record<string, string>;

const EN: Dictionary = {
  "app.title": "CONNER Asphalt Estimator",
  "app.subtitle": "Professional Estimate & Invoice Generator",
};

const ES: Dictionary = {
  "app.title": "CONNER Estimador de Asfalto",
  "app.subtitle": "Generador profesional de presupuestos y facturas",
};

const DICTS: Record<Locale, Dictionary> = { en: EN, es: ES };

interface I18nContextValue {
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(
    (localStorage.getItem("pps:locale") as Locale) || "en",
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: (l: Locale) => {
        localStorage.setItem("pps:locale", l);
        setLocale(l);
      },
      t: (key: string, vars?: Record<string, string | number>) => {
        const dict = DICTS[locale] || DICTS.en;
        let out = dict[key] || key;
        if (vars) {
          for (const [k, v] of Object.entries(vars))
            out = out.replace(new RegExp(`{${k}}`, "g"), String(v));
        }
        return out;
      },
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
