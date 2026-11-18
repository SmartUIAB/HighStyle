import { useRouter } from "next/router";
import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";

const languages = ["en", "es", "fr", "pt", "ar", "sv"];
const LanguageContext = createContext<{ language: string; changeLanguage: (language: string) => void } | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const language = typeof router.query.lng === "string" && languages.includes(router.query.lng) ? router.query.lng : "en";
  useEffect(() => {
    try { localStorage.setItem("i18nextLng", language); } catch (_) {}
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.body.classList.remove("dark", "rtl", "ltr");
    i18n.changeLanguage(language);
  }, [language, i18n]);
  const changeLanguage = (next: string) => {
    if (!languages.includes(next)) return;
    const path = router.asPath.replace(/^\/(en|ar|sv|es|fr|pt)(?=\/|\?|#|$)/, `/${next}`);
    router.push(path.startsWith(`/${next}`) ? path : `/${next}`);
  };
  return <LanguageContext.Provider value={{ language, changeLanguage }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
