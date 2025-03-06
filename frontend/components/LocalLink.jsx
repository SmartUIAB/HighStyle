import Link from 'next/link';

const LocalLink = ({ href, children, ...props }) => {
    const savedLanguage =
        typeof window !== "undefined" && localStorage.getItem("i18nextLng")
            ? localStorage.getItem("i18nextLng")
            : "en";

    const normalizedHref = href?.startsWith("/") ? href : `/${href}`;

    const localizedHref = `/${savedLanguage}${normalizedHref}`;

    return (
        <Link href={localizedHref} {...props}>
            {children}
        </Link>
    );
};

export default LocalLink;
