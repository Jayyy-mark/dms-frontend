import { useState, useRef, useEffect } from "react";
import "flag-icons/css/flag-icons.min.css";
import i18n from "../../translate/i18n";

const languages = [
  { code: "gb", label: "EN", flag: "🇬🇧", lang:"en" },
  { code: "mm", label: "MM", flag: "🇲🇲", lang:"my" },
];

type Language = {
  code: string;
  label: string;
  flag: string;
  lang: string;
};

export default function LanguageDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Language>(languages[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lang");

    if (!saved) return;

    const language = languages.find((l) => l.lang === saved);

    if (language) {
      setSelected(language);
    }
  }, []);

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSelect = (lang: any) => {
    setSelected(lang);
    setOpen(false);

    // 👉 later connect with i18n
    i18n.changeLanguage(lang.lang);
    localStorage.setItem("lang", lang.lang);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <span>{selected.flag}</span>
        <span>{selected.label}</span>
        <svg
          className="w-4 h-4 ml-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-700 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang)}
              className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className={`fi fi-${lang.code}`}></span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}