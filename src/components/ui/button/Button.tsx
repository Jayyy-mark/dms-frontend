import React, { ReactNode, useRef, useState } from "react";
import { SpinnerIcon } from "./ActionButton";

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?: "sm" | "md"; // Button size
  variant?: "primary" | "danger" | "warning" | "info" | "success" | "light" | "outline"; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => unknown | Promise<unknown>; // Click handler
  disabled?: boolean; // Disabled state
  loading?: boolean; // Explicit loading state
  loadingText?: ReactNode; // Optional label while loading
  className?: string; // Additional classes
  type?: "button" | "submit" | "reset"; // Button type
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  loading: externalLoading = false,
  loadingText,
  type = "button",
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const busyRef = useRef(false);

  const isBusy = externalLoading || internalLoading;
  const isDisabled = disabled || isBusy;

  // Size Classes
  const sizeClasses = {
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
  };

  // Variant Classes
  const variantClasses = {
    primary: "bg-brand-500 text-white dark:text-white",
    success: "bg-success-500 text-white dark:text-white",
    danger: "bg-error-500 text-white dark:text-white",
    warning: "bg-warning-500 text-white dark:text-white",
    info: "bg-blue-light-500 text-white dark:text-white",
    light: "bg-gray-400 dark:bg-white/5 text-white dark:text-white/80",
    dark: "bg-gray-700 text-white dark:text-white",
    outline:
      "border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100 dark:border-white/20 dark:text-white dark:hover:bg-white/5",
  };

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled || busyRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (!onClick) return;

    busyRef.current = true;
    setInternalLoading(true);
    try {
      await Promise.resolve(onClick(e));
    } finally {
      busyRef.current = false;
      setInternalLoading(false);
    }
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        isDisabled ? "cursor-not-allowed opacity-60 pointer-events-none" : ""
      }`}
      onClick={onClick ? handleClick : undefined}
      disabled={isDisabled}
    >
      {isBusy ? (
        <>
          <SpinnerIcon className="h-4 w-4" />
          {loadingText !== undefined ? <span>{loadingText}</span> : children}
        </>
      ) : (
        <>
          {startIcon && <span className="flex items-center">{startIcon}</span>}
          {children}
          {endIcon && <span className="flex items-center">{endIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
