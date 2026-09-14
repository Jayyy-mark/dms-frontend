import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  static?: boolean;
};

const DatePicker = forwardRef(({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  disabled,
  static: isStatic = false,
}: PropsType, ref) => {

  const pickerRef = useRef<any>(null);

  useEffect(() => {
    pickerRef.current = flatpickr(`#${id}`, {
      mode: mode || "single",
      static: isStatic,
      appendTo: typeof document !== "undefined" ? document.body : undefined,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate,
      onChange,
      clickOpens: !disabled,
    });

    return () => {
      pickerRef.current?.destroy?.();
    };
  }, [mode, onChange, id, defaultDate, isStatic, disabled]);

  // ✅ expose clear method
  useImperativeHandle(ref, () => ({
    clear: () => pickerRef.current?.clear?.(),
  }));

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          disabled={disabled}
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-[#B88E2F] focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/20 transition-all cursor-pointer"
        />

        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <CalenderIcon className="size-5" />
        </span>
      </div>
    </div>
  );
});

export default DatePicker;
