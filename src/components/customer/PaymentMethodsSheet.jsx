import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, Plus } from "lucide-react";
import { getPaymentMethod, savePaymentMethod } from "../../utils/profileLocalStorage";

export default function PaymentMethodsSheet({ onClose }) {
  const [selected, setSelected] = useState("apple-pay");

  useEffect(() => {
    setSelected(getPaymentMethod());
  }, []);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const handleSelect = (method) => {
    setSelected(method);
    savePaymentMethod(method);
  };

  const handleAddMethod = () => {

    console.log("Add payment method tapped — not wired up yet.");
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end">

      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      <div className="relative w-full bg-[#1c1d22] rounded-t-3xl px-4 pt-4 pb-8 z-10">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        <h2 className="text-[22px] font-extrabold text-white mt-2">
          Manage your payment methods
        </h2>

        <div className="flex items-start gap-4 mt-6">
          
          <button
            type="button"
            onClick={handleAddMethod}
            className="flex flex-col items-center gap-2.5"
          >
            <div className="w-[108px] h-[70px] rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-[#4a4a52] flex items-center justify-center">
                <Plus size={22} className="text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="text-[14px] font-semibold text-white">+ Add</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect("apple-pay")}
            className="flex flex-col items-center gap-2.5 relative"
          >
            <div
              className={`w-[108px] h-[70px] rounded-2xl border-2 flex items-center justify-center ${
                selected === "apple-pay" ? "border-[#7c6bff]" : "border-white/10"
              }`}
            >
              <ApplePayBadge />
            </div>
            {selected === "apple-pay" && (
              <span className="absolute top-[46px] right-[-6px] w-6 h-6 rounded-full bg-[#7c6bff] border-2 border-[#1c1d22] flex items-center justify-center">
                <Check size={13} className="text-white" strokeWidth={3.5} />
              </span>
            )}
            <span className="text-[14px] font-semibold text-white">Apple Pay</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ApplePayBadge() {
  return (
    <div className="w-[72px] h-[38px] rounded-lg bg-white flex items-center justify-center gap-1">
      <svg width="15" height="17" viewBox="0 0 15 17" fill="black">
        <path d="M10.6 2.7c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z" />
        <path d="M13.3 6.3c-1.3-.1-2.4.8-3 .8-.6 0-1.5-.7-2.5-.7-1.3 0-2.5.8-3.1 1.9-1.3 2.3-.3 5.7 1 7.6.6.9 1.3 1.9 2.3 1.9.9 0 1.3-.6 2.4-.6s1.4.6 2.4.6c1 0 1.6-.9 2.2-1.9.7-1 1-2 1-2.1-.1 0-1.9-.7-1.9-2.8 0-1.8 1.4-2.6 1.5-2.6-.8-1.2-2.1-1.3-2.3-1.1z" />
      </svg>
      <span className="text-[15px] font-bold text-black leading-none tracking-tight">
        Pay
      </span>
    </div>
  );
}
