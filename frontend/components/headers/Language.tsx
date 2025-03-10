import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";

const Language = () => {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  const LanguageData = [
    { lang: "en", icon: "us", title: "English" },
    { lang: "es", icon: "es", title: "Spanish" },
    { lang: "pt", icon: "pt", title: "Portuguese" },
    { lang: "fr", icon: "fr", title: "French" },
    { lang: "ar", icon: "ar", title: "Arabic" },
    { lang: "sv", icon: "sv", title: "Swedish" },
  ];

  const handleChangeLanguage = (lng: string) => {
    changeLanguage(lng);
  };

  return (
    <div className="language-dropdown">
      <select
        value={language}
        onChange={(e) => handleChangeLanguage(e.target.value)}
        className="language-select"
      >
        {LanguageData.map((item) => (
          <option key={item.lang} value={item.lang}>
            {item.title}
          </option>
        ))}
      </select>
      <style jsx>{`
        .language-dropdown {
          position: relative;
        }
        .language-select {
          appearance: none;
          background: url('https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/${LanguageData.find(
        (item) => item.lang === language
      )?.icon}.svg') no-repeat right center;
          background-size: 20px 15px;
          padding-right: 40px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 16px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default Language;
