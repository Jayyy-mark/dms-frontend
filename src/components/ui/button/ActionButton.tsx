import React, { useRef, useState } from "react";

export function SpinnerIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin shrink-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export interface ActionButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => unknown | Promise<unknown>;
  loading?: boolean;
  loadingText?: React.ReactNode;
  spinnerClassName?: string;
  hideIconWhenLoading?: boolean;
}

/**
 * Drop-in replacement for <button> that automatically prevents simultaneous
 * clicks, disables the button while an async onClick handler is running,
 * and displays a spinning loader indicator.
 */
export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      children,
      onClick,
      loading: externalLoading = false,
      loadingText,
      spinnerClassName = "h-4 w-4",
      disabled = false,
      className = "",
      type = "button",
      ...rest
    },
    ref
  ) => {
    const [internalLoading, setInternalLoading] = useState(false);
    const busyRef = useRef(false);

    const isBusy = externalLoading || internalLoading;
    const isDisabled = disabled || isBusy;

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
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={handleClick}
        className={`${className} ${
          isDisabled ? "opacity-65 cursor-not-allowed pointer-events-none" : ""
        }`}
        {...rest}
      >
        {isBusy ? (
          <>
            <SpinnerIcon className={spinnerClassName} />
            {loadingText !== undefined ? <span>{loadingText}</span> : children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

ActionButton.displayName = "ActionButton";

export default ActionButton;

