import { Link } from "react-router";
import { Info } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface BreadcrumbProps {
  pageTitle: string;
  helpText?: string[];
}

const PageBreadCrumb: React.FC<BreadcrumbProps> = ({ pageTitle, helpText }) => {
  const { t } = useTranslation();
  const [showHelp, setShowHelp] = useState(false);
  console.log("this is help text ", helpText);

  return (
    <div className="flex flex-col gap-2 mb-6">

      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {t(pageTitle)}
          </h2>

          {/* ✅ Show icon ONLY if helpText exists */}
          {helpText && helpText.length > 0 && (
            <div className="relative group inline-block">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-gray-500 hover:text-[#B88E2F] transition"
              >
                <Info size={16} />
              </button>

              <span className="z-99999 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 
                   hidden group-hover:block 
                   bg-white border border-gray-300 text-gray text-xs px-2 py-1 rounded whitespace-nowrap">
                tooltips
              </span>
            </div>
          )}
        </div>

        <nav className="ml-auto flex-shrink-0 max-w-full overflow-hidden">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
                to="/"
              >
                {t("Home")}
              </Link>
            </li>
            <li className="text-gray-400 text-sm">{">"}</li>
            <li className="text-sm text-gray-800 dark:text-white/90">
              {t(pageTitle)}
            </li>
          </ol>
        </nav>
      </div>

      {/* ✅ Help panel */}
      {showHelp && helpText && (
        <div className="p-3 text-sm bg-[#FEF3C7] border border-blue-200 rounded-lg dark:bg-gray-800 dark:border-gray-700 transition-all">
          <ul className="list-disc pl-5 space-y-1">
            {helpText.map((text, index) => (
              <li key={index}>{t(text)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PageBreadCrumb;