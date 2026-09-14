import { AxiosError } from "axios";

export function parseApiError(error: unknown, fallback = "An unexpected error occurred."): string {
    if (error instanceof AxiosError) {
        const data = error.response?.data;

        if (!data) {
            if (!navigator.onLine) return "No internet connection. Please check your network.";
            return fallback;
        }

        if (typeof data.error === "string" && data.error.trim()) {
            return data.error;
        }

        if (typeof data.message === "string" && data.message.trim()) {
            return data.message;
        }

        if (typeof data.detail === "string" && data.detail.trim()) {
            return data.detail;
        }

        if (typeof data === "object") {
            const parts: string[] = [];
            for (const [field, messages] of Object.entries(data)) {
                const label = field === "non_field_errors"
                    ? ""
                    : field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) + ": ";

                if (Array.isArray(messages)) {
                    parts.push(`${label}${(messages as string[]).join(", ")}`);
                } else if (typeof messages === "string") {
                    parts.push(`${label}${messages}`);
                }
            }
            if (parts.length > 0) return parts.join(" | ");
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}
