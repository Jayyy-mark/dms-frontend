import { ReactHTMLElement, ReactNode } from "react";

export interface ButtonProps extends ReactHTMLElement<HTMLButtonElement>{
    variant?: "primary" | "danger" | "warning" | "info";
    icon?:ReactNode;
    children:ReactNode;
    disabled:boolean;
    onClick:()=>void;
}