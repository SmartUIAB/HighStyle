import Link from 'next/link';

const LocaleLink = ({ href, children, ...props }) => {
    // Get the saved language from localStorage
    const savedLanguage =
        typeof window !== "undefined" && localStorage.getItem("i18nextLng")
            ? localStorage.getItem("i18nextLng")
            : "en"; // Default to "en" if no language is saved

    // Ensure href starts with a slash for consistency
    const normalizedHref = href?.startsWith("/") ? href : `/${href}`;

    // Construct the localized href
    const localizedHref = `/${savedLanguage}${normalizedHref}`;

    return (
        <Link href={localizedHref} {...props}>
            {children}
        </Link>
    );
};

export default LocaleLink;
