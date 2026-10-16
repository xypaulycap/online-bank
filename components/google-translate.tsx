"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
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
          InlineLayout: {
            SIMPLE: number;
            HORIZONTAL: number;
            VERTICAL: number;
          };
        };
      };
    };
  }
}

interface GoogleTranslateProps {
  id?: string;
  className?: string;
}

export function GoogleTranslate({
  id = "google_translate_element",
  className = "",
}: GoogleTranslateProps) {
  const initializedRef = useRef(false);

  useEffect(() => {
    const initWidget = () => {
      const container = document.getElementById(id);
      if (!container) return;

      // Avoid duplicate widget rendering inside the same container
      if (container.children.length > 0) return;

      if (
        window.google &&
        window.google.translate &&
        window.google.translate.TranslateElement
      ) {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              layout: window.google.translate.TranslateElement.InlineLayout?.SIMPLE ?? 0,
              autoDisplay: false,
            },
            id
          );
          initializedRef.current = true;
        } catch (e) {
          console.error("Error initializing Google Translate element:", e);
        }
      }
    };

    // If Google Translate is already available on window, initialize right away
    if (
      window.google &&
      window.google.translate &&
      window.google.translate.TranslateElement
    ) {
      initWidget();
      return;
    }

    // Register / chain the global callback function
    const prevCallback = window.googleTranslateElementInit;
    window.googleTranslateElementInit = () => {
      if (typeof prevCallback === "function") {
        try {
          prevCallback();
        } catch (_) {}
      }
      initWidget();
    };

    // Inject the script if not yet present
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Script already injected; wait for window.google to be initialized
      const interval = setInterval(() => {
        if (
          window.google &&
          window.google.translate &&
          window.google.translate.TranslateElement
        ) {
          clearInterval(interval);
          initWidget();
        }
      }, 150);

      const timeout = setTimeout(() => clearInterval(interval), 6000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [id]);

  return <div id={id} className={`google-translate-container ${className}`} />;
}
