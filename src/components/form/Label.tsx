import { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

const Label: FC<LabelProps> = ({ htmlFor, children, className }) => {
  const { t } = useTranslation();

  const translateLabel = (content: ReactNode): ReactNode => {
    if (typeof content !== "string") return content;
    const cleanText = content.trim();
    const hasColon = cleanText.endsWith(":");
    const key = hasColon ? cleanText.slice(0, -1).trim() : cleanText;
    const translated = t(key);
    return hasColon ? `${translated}:` : translated;
  };

  return (
    <label
      htmlFor={htmlFor}
      className={clsx(
        twMerge(
          "mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300",
          className,
        ),
      )}
    >
      {translateLabel(children)}
    </label>
  );
};

export default Label;
