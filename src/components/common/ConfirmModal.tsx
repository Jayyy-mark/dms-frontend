import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import React, { useRef, useState } from "react";
import { SpinnerIcon } from "../ui/button/ActionButton";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "primary" | "success" | "info";
  isLoading?: boolean;
  onConfirm: () => unknown | Promise<unknown>;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  isLoading: externalLoading = false,
  onConfirm,
  onCancel,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const busyRef = useRef(false);

  const isBusy = externalLoading || internalLoading;

  const styles = {
    danger: {
      iconBg: "bg-red-50 dark:bg-red-900/20",
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      btn: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      bar: "bg-red-600",
    },
    info: {
      iconBg: "bg-yellow-50 dark:bg-yellow-900/20",
      icon: <Info className="w-5 h-5 text-yellow-600" />,
      btn: "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400",
      bar: "bg-yellow-500",
    },
    success: {
      iconBg: "bg-green-50 dark:bg-green-900/20",
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      btn: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
      bar: "bg-green-600",
    },
    primary: {
      iconBg: "bg-[#FEF3C7] dark:bg-blue-900/20",
      icon: <Info className="w-5 h-5 text-[#997524]" />,
      btn: "bg-blue-600 hover:bg-blue-700 focus:ring-[#B88E2F]",
      bar: "bg-blue-600",
    },
  };

  const t = styles[type];

  const handleConfirmClick = async () => {
    if (isBusy || busyRef.current) return;
    busyRef.current = true;
    setInternalLoading(true);
    try {
      await Promise.resolve(onConfirm());
    } finally {
      busyRef.current = false;
      setInternalLoading(false);
    }
  };

  const handleCancelClick = () => {
    if (isBusy || busyRef.current) return;
    onCancel();
  };

  return (
    <div
      className={`
    fixed inset-0 z-[9999] flex items-center justify-center
    bg-black/40 backdrop-blur-[2px]
    transition-all duration-200
    ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}
  `}
    >
      <div
        className={`
      w-[460px] bg-white dark:bg-gray-900
      rounded-lg shadow-lg border border-gray-200 dark:border-gray-800
      overflow-hidden
      transform transition-all duration-200
      ${isOpen ? "scale-100" : "scale-95"}
    `}
      >
        {/* ERP TOP BAR */}
        <div className={`h-1 w-full ${t.bar}`} />

        {/* HEADER */}
        <div className="flex items-start gap-4 px-6 pt-6">
          <div className={`p-3 rounded-md ${t.iconBg}`}>{t.icon}</div>

          <div className="flex-1">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-5 mt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            disabled={isBusy}
            onClick={handleCancelClick}
            className="px-4 py-2 text-sm rounded-md border border-gray-300
                   text-gray-700 hover:bg-gray-50
                   dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800
                   transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={handleConfirmClick}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md text-white
                    focus:outline-none focus:ring-2 transition disabled:opacity-65 disabled:cursor-not-allowed ${t.btn}`}
          >
            {isBusy && <SpinnerIcon className="h-4 w-4 text-white" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
