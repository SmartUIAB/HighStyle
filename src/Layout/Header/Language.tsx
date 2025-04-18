import { Href } from "@/Constants";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

interface LanguageProps {
  onLanguageChange: (lang: string) => void;
}

const Language = ({ onLanguageChange }: LanguageProps) => {
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { i18n } = useTranslation(i18LangStatus);
  const pathname = usePathname();
  const router = useRouter();

  const changeLng = (lng: string) => {
    i18n.changeLanguage(lng);
    const languageCodeRegex = /^\/[a-z]{2}(\/|$)/;
    const updatedPath = pathname.replace(languageCodeRegex, `/${lng}$1`);
    router.push(updatedPath);

    onLanguageChange(lng);
  };

  const LanguageData = [
    { lang: "en", icon: "is", title: "English" },
    { lang: "es", icon: "um", title: "Spanish" },
    { lang: "pt", icon: "uy", title: "Portuguese" },
    { lang: "fr", icon: "nz", title: "French" },
    { lang: "ar", icon: "ar", title: "Arabic" },
    { lang: "sv", icon: "sv", title: "Swedish" },
  ];

  return (
    <ul className="language-dropdown onhover-show-div p-20">
      {LanguageData.map((item, i) => (
        <li key={i}>
          <a href={Href} onClick={() => changeLng(item.lang)}>
            <i className={`flag-icon flag-icon-${item.icon}`}></i>
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  );
};


export default Language;
