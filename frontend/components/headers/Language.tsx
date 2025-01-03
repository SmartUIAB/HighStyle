import { useLanguage } from "../../context/LanguageContext";
import { usePathname, useRouter } from "next/navigation";

const Language = () => {
  const { language, changeLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const LanguageData = [
    { lang: "en", icon: "us", title: "English" }, // Update icons to ISO country codes
    { lang: "es", icon: "es", title: "Spanish" },
    { lang: "pt", icon: "pt", title: "Portuguese" },
    { lang: "fr", icon: "fr", title: "French" },
  ];

  const handleChangeLanguage = (lng: string) => {
    changeLanguage(lng);
    const languageCodeRegex = /^\/[a-z]{2}(\/|$)/;
    const updatedPath = pathname.replace(languageCodeRegex, `/${lng}$1`);
    console.log(updatedPath, '=============');
    router.push(updatedPath);
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
