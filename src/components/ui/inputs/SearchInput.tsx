import { X } from "lucide-react";
import Input from "../../form/input/InputField";

interface ClearableInputProps extends React.InputHTMLAttributes<HTMLInputElement>{
    value:string;
    onChange:(e:React.ChangeEvent<HTMLInputElement>)=>void;
}

export default function SearchInput({
  value,
  onChange,
  ...props
}: ClearableInputProps) {
  return (
    <div className="relative">
      {value && (
        <button
          type="button"
          onClick={() =>
            onChange({
              target: { value: "" },
            } as React.ChangeEvent<HTMLInputElement>)
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      )}

      <Input
        value={value}
        onChange={onChange}
        className={`${props.className ?? ""}`}
      />
    </div>
  );
}
