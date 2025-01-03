import { usePathname, useRouter } from "next/navigation";
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next"; // Import i18next for language change

interface LanguageContextProps {
    language: string;
    changeLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter(); // Next.js router for navigation
    const pathName = usePathname(); // Current path
    const { i18n } = useTranslation(); // Access i18next instance for language switching

    const [language, setLanguage] = useState<string>("en"); // Default language is "en"

    useEffect(() => {
        // Get the language from the URL or localStorage on initial load
        const savedLanguage = typeof window !== "undefined" ? localStorage.getItem("i18nextLng") : null;
        const initialLanguage = pathName?.split("/")[1] || savedLanguage || "en";

        setLanguage(initialLanguage);

        // Save the language to localStorage and update <html> lang attribute
        if (typeof window !== "undefined") {
            localStorage.setItem("i18nextLng", initialLanguage);
            document.documentElement.lang = initialLanguage; // Update <html lang="">
        }

        // Initialize i18n with the detected language
        i18n.changeLanguage(initialLanguage);
    }, [pathName, i18n]);

    const changeLanguage = (lang: string) => {
        setLanguage(lang);

        // Update localStorage and <html> lang attribute
        if (typeof window !== "undefined") {
            localStorage.setItem("i18nextLng", lang);
            document.documentElement.lang = lang;
        }

        // Use i18n to change the language dynamically
        i18n.changeLanguage(lang);

        // Update the URL dynamically
        const segments = pathName?.split("/").filter(Boolean) || []; // Get the path segments without slashes
        segments[0] = lang; // Replace the first segment with the new language
        const newPath = `/${segments.join("/")}`;
        router.push(newPath); // Navigate to the new path with the updated language
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
