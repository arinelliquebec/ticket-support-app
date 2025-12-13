"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function HashScrollHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Function to handle scrolling to the hash
    const scrollToHash = () => {
      const hash = window.location.hash;

      if (hash) {
        // Remove the # from the hash
        const id = hash.replace("#", "");
        const element = document.getElementById(id);

        if (element) {
          // Add a small delay to ensure the component is fully rendered
          setTimeout(() => {
            // Use a conservative header height estimate
            const headerHeight = 80; // Adjust based on actual header height

            // Calculate the position accounting for the header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition =
              elementPosition + window.scrollY - headerHeight;

            // Scroll to the position
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }, 100);
        }
      }
    };

    // Initial scroll on mount
    scrollToHash();

    // Also handle hash changes while on the page
    const handleHashChange = () => {
      scrollToHash();
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [pathname, searchParams]);

  return null;
}
