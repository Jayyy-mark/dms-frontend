import { useTranslation } from "react-i18next";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: string;                 // 👈 REQUIRED
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  placeholder = "Select an option",
  onChange,
  className = "",
}) => {
  const { t } = useTranslation();

  return (
    <select
      value={value} // 👈 controlled by parent
      onChange={(e) => onChange(e.target.value)}
      className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm
        ${value ? "text-gray-800 dark:text-white/90" : "text-gray-400"}
        ${className}`}
    >
      <option value="" disabled>
        {placeholder ? t(placeholder) : placeholder}
      </option>

      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {t(option.label)}
        </option>
      ))}
    </select>
  );
};

export default Select;
