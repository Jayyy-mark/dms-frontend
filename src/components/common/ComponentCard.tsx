
import React from "react";
import { useTranslation } from "react-i18next";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  headerBtn?: React.ReactNode;
  footerChildren?: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  icon,
  headerBtn,
  footerChildren,
  className = "",
  desc = "",
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`rounded-xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/50 ${className}`}
    >
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800/80">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-gray-800 dark:text-white flex items-center gap-2.5">
            {icon && (
              <span className="text-gray-500 dark:text-gray-400 flex items-center justify-center">
                {icon}
              </span>
            )}
            <span>{t(title)}</span>
          </h3>

          {headerBtn}
        </div>

        {/* Description */}
        {desc && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t(desc)}
          </p>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6">{children}</div>

      {/* Card Footer */}
      {footerChildren && (
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/30 rounded-b-xl">
          {footerChildren}
        </div>
      )}
    </div>
  );
};

export default ComponentCard;
