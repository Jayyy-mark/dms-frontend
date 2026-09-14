interface FieldErrorProps {
    message?: string;
}

export default function FieldError({ message }: FieldErrorProps) {
    if (!message) return null;

    return (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-500 dark:text-red-400">
            <svg
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3m0 4h.01M5.07 19h13.86A2 2 0 0021 16.13L14.14 5a2 2 0 00-3.27 0L3.07 16.13A2 2 0 005.07 19z"
                />
            </svg>
            {message}
        </p>
    );
}
