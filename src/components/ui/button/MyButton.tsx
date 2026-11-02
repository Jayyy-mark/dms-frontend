import React, { useRef, useState } from "react";
import { ButtonProps } from "./MyButton.type";
import { SpinnerIcon } from "./ActionButton";

const MyButton: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  icon,
  onClick,
  disabled = false,
  loading: externalLoading = false,
  loadingText,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const busyRef = useRef(false);

  const isBusy = externalLoading || internalLoading;
  const isDisabled = disabled || isBusy;

  const variantClasses = {
    primary: "bg-brand-500 text-white dark:text-white",
    success: "bg-success-500 text-white dark:text-white",
    danger: "bg-error-500 text-white dark:text-white",
    warning: "bg-warning-500 text-white dark:text-white",
    info: "bg-blue-light-500 text-white dark:text-white",
    light: "bg-gray-400 dark:bg-white/5 text-white dark:text-white/80",
    dark: "bg-gray-700 text-white dark:text-white",
  };

  const handleClick = async () => {
    if (isDisabled || busyRef.current || !onClick) return;
    busyRef.current = true;
    setInternalLoading(true);
    try {
      await Promise.resolve(onClick());
    } finally {
      busyRef.current = false;
      setInternalLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`text-white font-medium rounded-lg text-sm inline-flex items-center gap-1.5 px-3 py-2 text-center transition ${
        variantClasses[variant]
      } ${isDisabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
      onClick={handleClick}
      disabled={isDisabled}
    >
      {isBusy ? (
        <>
          <SpinnerIcon className="h-4 w-4" />
          {loadingText !== undefined ? <span>{loadingText}</span> : children}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
};

export default MyButton;
