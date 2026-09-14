import React from "react";
import { ButtonProps } from "./MyButton.type";

const MyButton : React.FC<ButtonProps> = ({
    children,
    variant="primary",
    icon,
    onClick,
    disabled=false,
}) =>{

    const variantClasses = {
        primary: "bg-brand-500 text-white dark:text-white",
        success: "bg-success-500 text-white dark:text-white",
        danger: "bg-error-500 text-white dark:text-white",
        warning: "bg-warning-500 text-white dark:text-white",
        info: "bg-blue-light-500 text-white dark:text-white",
        light: "bg-gray-400 dark:bg-white/5 text-white dark:text-white/80",
        dark: "bg-gray-700 text-white dark:text-white",        
    }

    return (
        <button 
            className={`text-white font-medium rounded-lg text-sm inline-flex items-center px-3 py-2 text-center
            ${variantClasses[variant]}
            `} 
            onClick={onClick} 
            disabled={disabled}
        >
            {icon}
            {children}
        </button>
    );
};

export default MyButton;






