import { usePathname } from "next/navigation";
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface LanguageContextProps {
    language: string;
    changeLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    // Check if there is a language in localStorage, otherwise default to "en"
    const pathName = usePathname();
    if (typeof window !== "undefined") {
        localStorage.setItem("i18nextLng", pathName.split("/")[1]);
    }

    const savedLanguage = typeof window !== "undefined" ? localStorage.getItem("i18nextLng") : null;
    const [language, setLanguage] = useState<string>(savedLanguage || "en");
    // console.log(pathName.split("/")[1], '=======firstPath==============');
    // console.log(savedLanguage, '=======SecondPath==============');

    const changeLanguage = (lang: string) => {
        setLanguage(lang);
        // Save the new language to localStorage
        if (typeof window !== "undefined") {
            localStorage.setItem("i18nextLng", lang);
        }
    };

    useEffect(() => {
        // Set the language in the body tag or handle any other global settings
        if (typeof window !== "undefined") {
            document.documentElement.lang = language; // Optional: Update the `lang` attribute on the HTML tag
        }
    }, [language]);

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
