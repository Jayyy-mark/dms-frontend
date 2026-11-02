import { ReactNode } from "react";

export interface ButtonProps {
  variant?: "primary" | "danger" | "warning" | "info" | "success" | "light" | "dark";
  icon?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: ReactNode;
  onClick?: () => unknown | Promise<unknown>;
}
