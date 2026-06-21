import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

import { useLoginMutation } from "../../app/api/authApi";
import { setCredentials } from "../../features/authSlice";

// Schema checking both requirements during final submission
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Track current wizard node (1: Email, 2: Password)
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading, error: apiError }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const currentEmail = watch("email");

  // Validate the email field completely before transitioning to step 2
  const handleNextStep = async (e) => {
    e.preventDefault();
    const isEmailValid = await trigger("email");
    if (isEmailValid) {
      setStep(2);
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await login(data).unwrap();
      dispatch(setCredentials({ user: response.user }));
      navigate(response.redirectTo || "/", { replace: true });
    } catch (err) {
      console.error("Authentication framework rejection:", err);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between p-6 md:p-12 bg-[#060814] overflow-hidden select-none">
      {/* Top Header Layer: Authentic Brand Mark */}
      <div className="z-10 flex items-center w-full gap-2 mx-auto max-w-7xl">
        <svg className="text-white fill-current w-7 h-7" viewBox="0 0 32 32">
          <path d="M16 0C7.16 0 0 7.16 0 16s7.16 16 16 16 16-7.16 16-16S24.84 0 16 0zm0 26c-5.52 0-10-4.48-10-10 0-1.33.26-2.6.73-3.77 2.14 2.25 5.17 3.65 8.54 3.65 3.37 0 6.4-1.4 8.54-3.65.47 1.17.73 2.44.73 3.77 0 5.52-4.48 10-10 10z" />
        </svg>
        <span className="font-sans text-2xl font-extrabold tracking-tight text-white">
          cuvva
        </span>
      </div>

      {/* Center Layout Container */}
      <div className="z-10 flex items-center justify-center w-full my-auto">
        <div className="w-full max-w-[460px] bg-white rounded-2xl p-8 md:p-10 shadow-2xl transition-all duration-300 relative">
          {/* Back Action Trigger (Only shows on Password step) */}
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="absolute top-8 left-6 text-[#525775] hover:text-[#0f111a] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div className="mb-8 text-center">
            <h1 className="text-[26px] font-bold text-[#0f111a] flex items-center justify-center gap-2 tracking-tight">
              {step === 1 ? "Welcome back " : "Enter password "}
              <span className="animate-bounce">👋</span>
            </h1>
            <p className="text-[14.5px] text-[#525775] mt-2 leading-relaxed px-2 break-all">
              {step === 1
                ? "Enter your email address and we'll verify your administrator profile"
                : `Please provide the security security key for ${currentEmail}`}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Global Context Errors (Server Rejections) */}
            {apiError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-[#ef4444] text-xs font-semibold text-center">
                {apiError?.data?.message ||
                  "Invalid administrator credentials."}
              </div>
            )}

            {/* ================= STEP 1: EMAIL CAPTURE ================= */}
            {step === 1 && (
              <div className="flex flex-col gap-2 animate-fadeIn">
                <label className="text-[14px] font-bold text-[#31354c] tracking-wide">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={`w-full px-4 py-3.5 border rounded-xl text-[#0f111a] text-[15px] font-medium outline-none transition-all duration-200 bg-white
                    ${
                      errors.email
                        ? "border-[#ef4444] focus:border-[#ef4444]"
                        : "border-[#d1d4e3] focus:border-[#b4a6ff] focus:ring-1 focus:ring-[#b4a6ff]"
                    }`}
                />
                {errors.email && (
                  <span className="text-xs text-[#ef4444] font-semibold mt-0.5 pl-1">
                    {errors.email.message}
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full mt-4 py-3.5 bg-[#beafff] hover:bg-[#ae9dff] text-white font-bold rounded-xl text-[15px] shadow-sm tracking-wide transition-all duration-200 flex items-center justify-center"
                >
                  Continue
                </button>
              </div>
            )}

            {/* ================= STEP 2: PASSWORD ENTRY ================= */}
            {step === 2 && (
              <div className="flex flex-col gap-2 animate-fadeIn">
                <label className="text-[14px] font-bold text-[#31354c] tracking-wide">
                  Security Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    autoFocus
                    className={`w-full pl-4 pr-12 py-3.5 border rounded-xl text-[#0f111a] text-[15px] font-medium outline-none transition-all duration-200 bg-white
                      ${
                        errors.password
                          ? "border-[#ef4444] focus:border-[#ef4444]"
                          : "border-[#d1d4e3] focus:border-[#b4a6ff] focus:ring-1 focus:ring-[#b4a6ff]"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[15px] text-[#525775] hover:text-[#0f111a]"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-xs text-[#ef4444] font-semibold mt-0.5 pl-1">
                    {errors.password.message}
                  </span>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 py-3.5 bg-[#644aff] hover:bg-[#533be0] text-white font-bold rounded-xl text-[15px] shadow-sm tracking-wide transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-h-[52px]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                  ) : (
                    "Sign in with email"
                  )}
                </button>
              </div>
            )}

            {/* Bottom Redirect Anchor */}
            <div className="pt-2 text-center">
              <p className="text-[14.5px] font-medium text-[#0f111a]">
                No account?{" "}
                <a
                  href="https://www.cuvva.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#644aff] hover:underline font-semibold"
                >
                  Get a quote
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Footer Frame Layer */}
      <div className="flex items-center w-full gap-2 mx-auto transform translate-y-4 pointer-events-none max-w-7xl opacity-10 md:translate-y-8">
        <svg className="text-white fill-current w-7 h-7" viewBox="0 0 32 32">
          <path d="M16 0C7.16 0 0 7.16 0 16s7.16 16 16 16 16-7.16 16-16S24.84 0 16 0zm0 26c-5.52 0-10-4.48-10-10 0-1.33.26-2.6.73-3.77 2.14 2.25 5.17 3.65 8.54 3.65 3.37 0 6.4-1.4 8.54-3.65.47 1.17.73 2.44.73 3.77 0 5.52-4.48 10-10 10z" />
        </svg>
        <span className="text-2xl font-extrabold tracking-tight text-white">
          cuvva
        </span>
      </div>
    </div>
  );
}
