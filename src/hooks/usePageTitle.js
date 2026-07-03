import { useEffect } from "react";

const SITE_NAME = "Fahari Grand Hotel & Suites";

export function usePageTitle(title) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
