"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    __googleTranslateInitialized?: boolean;
    google?: {
      translate: {
        TranslateElement: {
          new (
            options: {
              pageLanguage: string;
              layout?: number;
              autoDisplay?: boolean;
              includedLanguages?: string;
            },
            elementId: string
          ): void;
          InlineLayout?: {
            SIMPLE: number;
            HORIZONTAL: number;
            VERTICAL: number;
          };
        };
      };
    };
  }
}

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "zh-CN", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
] as const;

interface GoogleTranslateProps {
  id?: string;
  selectId?: string;
  className?: string;
}

export function GoogleTranslate({
  id = "google_translate_element",
  selectId,
  className = "",
}: GoogleTranslateProps) {
  const [currentLang, setCurrentLang] = useState<string>("en");

  useEffect(() => {
    // 1. Detect current language from cookies or localStorage
    // const getSavedLang = () => {
    //   try {
    //     const match = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([^;]+)/);
    //     if (match && match[1]) {
    //       return match[1];
    //     }
    //     return localStorage.getItem("preferred_language") || "en";
    //   } catch (_) {
    //     return "en";
    //   }
    // };
    const getSavedLang = () => {
  try {
    const match = document.cookie.match(
      /(?:^|;\s*)googtrans=\/en\/([^;]+)/
    );

    const saved =
      match?.[1] ||
      localStorage.getItem("preferred_language") ||
      "en";

    return SUPPORTED_LANGUAGES.some(
      (lang) => lang.code === saved
    )
      ? saved
      : "en";
  } catch {
    return "en";
  }
};
    setCurrentLang(getSavedLang());

    // 2. Ensure the hidden background Google Translate container exists
    const hiddenContainerId = "google_translate_hidden_container";
    let container = document.getElementById(hiddenContainerId);
    if (!container) {
      container = document.createElement("div");
      container.id = hiddenContainerId;
      container.setAttribute("aria-hidden", "true");
      document.body.appendChild(container);
    }

    // 3. Initialize Google Translate script once globally
    const initGoogleTranslate = () => {
      if (
        window.google &&
        window.google.translate &&
        window.google.translate.TranslateElement
      ) {
        if (!window.__googleTranslateInitialized) {
          try {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: "en",
                autoDisplay: false,
                includedLanguages: SUPPORTED_LANGUAGES.map(
      (lang) => lang.code
    ).join(","),
              },
              hiddenContainerId
            );
            window.__googleTranslateInitialized = true;
          } catch (e) {
            console.error("Google Translate initialization error:", e);
          }
        }
      }
    };

    if (
      window.google &&
      window.google.translate &&
      window.google.translate.TranslateElement
    ) {
      initGoogleTranslate();
    } else {
      const prevCallback = window.googleTranslateElementInit;
      window.googleTranslateElementInit = () => {
        if (typeof prevCallback === "function") {
          try {
            prevCallback();
          } catch (_) {}
        }
        initGoogleTranslate();
      };

      if (!document.getElementById("google-translate-script")) {
        const script = document.createElement("script");
        script.id = "google-translate-script";
        script.src =
  "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  // const handleLanguageChange = (newLang: string) => {
  //   setCurrentLang(newLang);
  //   try {
  //     localStorage.setItem("preferred_language", newLang);
  //   } catch (_) {}

  //   const hostname = window.location.hostname;
  //   const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  //   if (newLang === "en") {
  //     // Clear translation cookie
  //     document.cookie =
  //       "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  //     document.cookie = `googtrans=; path=/; domain=${hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
  //     if (!isLocalhost && hostname) {
  //       document.cookie = `googtrans=; path=/; domain=.${hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
  //     }
  //   } else {
  //     const cookieVal = `/en/${newLang}`;
  //     document.cookie = `googtrans=${cookieVal}; path=/;`;
  //     document.cookie = `googtrans=${cookieVal}; path=/; domain=${hostname};`;
  //     if (!isLocalhost && hostname) {
  //       document.cookie = `googtrans=${cookieVal}; path=/; domain=.${hostname};`;
  //     }
  //   }

  //   // Try setting the hidden Google Translate combo directly for instant translation
  //   const selectElem = document.querySelector(
  //     ".goog-te-combo"
  //   ) as HTMLSelectElement | null;
  //   if (selectElem) {
  //     selectElem.value = newLang;
  //     selectElem.dispatchEvent(new Event("change", { bubbles: true }));
  //   }

  //   // Reload page to guarantee full translation across all DOM elements and components
  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 150);
  // };

  
// const handleLanguageChange = (newLang: string) => {
//   setCurrentLang(newLang);

//   try {
//     localStorage.setItem("preferred_language", newLang);
//   } catch {}

//   const hostname = window.location.hostname;
//   const isLocalhost =
//     hostname === "localhost" || hostname === "127.0.0.1";

//   // Remove old cookie variants so a stale language cannot override
//   // the user's new selection.
//   const expireCookie = (domain?: string) => {
//     const domainPart = domain ? `; domain=${domain}` : "";
//     document.cookie =
//       `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domainPart}`;
//   };

//   expireCookie();

//   if (hostname) {
//     expireCookie(hostname);

//     if (!isLocalhost) {
//       expireCookie(`.${hostname}`);
//     }
//   }

//   // Google Translate uses an empty target value to return to English.
//   if (newLang !== "en") {
//     const cookieValue = `/en/${newLang}`;

//     document.cookie = `googtrans=${cookieValue}; path=/; SameSite=Lax`;

//     if (!isLocalhost && hostname) {
//       document.cookie =
//         `googtrans=${cookieValue}; path=/; domain=.${hostname}; SameSite=Lax`;
//     }
//   }

//   // Trigger Google Translate directly. Do not reload the page.
//   const translateSelect = document.querySelector(
//     ".goog-te-combo"
//   ) as HTMLSelectElement | null;

//   if (translateSelect) {
//     translateSelect.value = newLang === "en" ? "" : newLang;

//     translateSelect.dispatchEvent(
//       new Event("change", { bubbles: true })
//     );
//   }
// };


const handleLanguageChange = (newLang: string) => {
  setCurrentLang(newLang);

  try {
    localStorage.setItem("preferred_language", newLang);
  } catch {}

  const hostname = window.location.hostname;
  const isLocalhost =
    hostname === "localhost" || hostname === "127.0.0.1";

  const expireCookie = (domain?: string) => {
    const domainPart = domain ? `; domain=${domain}` : "";

    document.cookie =
      `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domainPart}`;
  };

  // Remove previous cookie values.
  expireCookie();

  if (hostname) {
    expireCookie(hostname);

    if (!isLocalhost) {
      expireCookie(`.${hostname}`);
    }
  }

  const translateSelect = document.querySelector(
    ".goog-te-combo"
  ) as HTMLSelectElement | null;

  if (newLang === "en") {
    // Remove the saved target-language cookie.
    window.location.reload();
  return;
    // try {
    //   localStorage.setItem("preferred_language", "en");
    // } catch {}

    // // Select the original language in Google Translate.
    // if (translateSelect) {
    //   translateSelect.value = "";
    //   translateSelect.dispatchEvent(
    //     new Event("change", { bubbles: true })
    //   );
    // }

    // return;
  }

  // Save the selected target language.
  const cookieValue = `/en/${newLang}`;

  document.cookie =
    `googtrans=${cookieValue}; path=/; SameSite=Lax`;

  if (!isLocalhost && hostname) {
    document.cookie =
      `googtrans=${cookieValue}; path=/; domain=.${hostname}; SameSite=Lax`;
  }

  // Apply the new language without refreshing the page.
  if (translateSelect) {
    translateSelect.value = newLang;
    translateSelect.dispatchEvent(
      new Event("change", { bubbles: true })
    );
  }
};



  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) ||
    SUPPORTED_LANGUAGES[0];

  return (
    <div
      id={id}
      className={cn(
        "relative inline-flex items-center google-translate-container cursor-pointer",
        className
      )}
    >
      <div className="inline-flex items-center gap-2 px-3 py-2 min-h-[38px] rounded-xl border border-emerald-500/40 hover:border-emerald-500/70 bg-white/95 dark:bg-gray-800/95 text-gray-800 dark:text-gray-100 text-xs font-semibold shadow-sm transition-all pointer-events-none select-none">
        <span className="text-base leading-none shrink-0">
          {currentLangObj.flag}
        </span>
        <span className="truncate max-w-[90px] sm:max-w-[110px]">
          {currentLangObj.name}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 shrink-0 ml-auto" />
      </div>
      <select
        id={selectId || (id ? `${id}_select` : undefined)}
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base bg-transparent z-20"
        aria-label="Select language"
        title="Select language"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option
            key={lang.code}
            value={lang.code}
            className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-1"
          >
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
