import { useState } from "react";

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export function useFormErrors<T>() {
    const [errors, setErrors] = useState<FormErrors<T>>({});

    function setFieldError(field: keyof T, message: string) {
        setErrors((prev) => ({ ...prev, [field]: message }));
    }

    function clearFieldError(field: keyof T) {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }

    function clearAll() {
        setErrors({});
    }

    function validate(rules: { field: keyof T; value: unknown; label: string; required?: boolean }[]): boolean {
        const next: FormErrors<T> = {};
        for (const rule of rules) {
            if (rule.required) {
                const v = rule.value;
                const empty =
                    v === null ||
                    v === undefined ||
                    (typeof v === "string" && v.trim() === "");
                if (empty) {
                    next[rule.field] = `${rule.label} cannot be empty.`;
                }
            }
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    return { errors, setFieldError, clearFieldError, clearAll, validate };
}
