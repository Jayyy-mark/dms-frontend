import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { SignInFormData } from "../../interfaces/auth/SignInFormData";
import { authApi } from "../../api/auth/authApi";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const navigate = useNavigate();
  const { setUser, refreshPermissions } = useAuth();
  const [form, setForm] = useState<SignInFormData>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Prevent simultaneous or repeated submissions while request is in flight
    if (submittingRef.current || isSubmitting) return;

    if (!form.email.trim() || !form.password.trim()) {
      await toast.warning("Please enter both email and password.");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const response = await authApi.login(form);
      const user = response?.user;

      if (!user) throw new Error("User not returned from login");

      if (user.is_active === false) {
        await toast.error("Your account has been banned.");
        submittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      setUser(user);
      await refreshPermissions();
      await toast.success("Login Successful!");

      setTimeout(() => {
        navigate("/");
      }, 600);
    } catch (error: unknown) {
      const errObj = error as {
        response?: {
          data?: {
            non_field_errors?: string[];
            detail?: string;
            error?: string;
            message?: string;
            email?: string[];
          };
        };
      };
      const data = errObj?.response?.data;
      const errorMsg =
        data?.non_field_errors?.[0] ||
        data?.email?.[0] ||
        data?.detail ||
        data?.error ||
        data?.message ||
        "Invalid Credentials";

      if (typeof errorMsg === "string" && errorMsg.toLowerCase().includes("banned")) {
        await toast.error(errorMsg);
      } else {
        await toast.warning(errorMsg);
      }

      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
            </div>
            <form onSubmit={handleSignIn}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    id="email"
                    name="email"
                    value={form.email}
                    disabled={isSubmitting}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      id="password"
                      name="password"
                      value={form.password}
                      disabled={isSubmitting}
                      onChange={handleChange}
                    />
                    <span
                      onClick={() => !isSubmitting && setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
