import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle } from "lucide-react";

export default function ConnectedAccountsPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/account", { replace: true });
  };

  const handleConnectGoogle = () => {
    console.log(
      "Connect with Google tapped — no OAuth integration exists yet.",
    );
  };

  return (
    <div className="text-white pb-10">
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-[16px] font-bold text-white">Connected accounts</h1>
        <button
          type="button"
          onClick={() => navigate("/customer/support")}
          aria-label="Help"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <HelpCircle size={18} className="text-white" />
        </button>
      </div>

      <div className="px-4 pt-4">
        <h2 className="text-[20px] font-extrabold text-white">
          Connected accounts
        </h2>
        <p className="text-[15px] text-[#9497a1] leading-relaxed mt-2">
          You can use your connected accounts to sign in.
        </p>

        <div className="mt-5 space-y-3">
          <div className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-[#3a3a41] text-[#7a7a82] cursor-not-allowed">
            <AppleGlyph className="text-[#7a7a82]" />
            <span className="text-[15px] font-semibold">Connected</span>
          </div>

          <button
            type="button"
            onClick={handleConnectGoogle}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-white hover:bg-[#f2f2f2] active:scale-[0.98] transition-all"
          >
            <GoogleGlyph />
            <span className="text-[15px] font-semibold text-black">
              Connect with Google
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function AppleGlyph({ className }) {
  return (
    <svg
      width="16"
      height="18"
      viewBox="0 0 15 17"
      fill="currentColor"
      className={className}
    >
      <path d="M10.6 2.7c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z" />
      <path d="M13.3 6.3c-1.3-.1-2.4.8-3 .8-.6 0-1.5-.7-2.5-.7-1.3 0-2.5.8-3.1 1.9-1.3 2.3-.3 5.7 1 7.6.6.9 1.3 1.9 2.3 1.9.9 0 1.3-.6 2.4-.6s1.4.6 2.4.6c1 0 1.6-.9 2.2-1.9.7-1 1-2 1-2.1-.1 0-1.9-.7-1.9-2.8 0-1.8 1.4-2.6 1.5-2.6-.8-1.2-2.1-1.3-2.3-1.1z" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h11.8c-.5 2.7-2 5-4.3 6.5v5.4h7C42.3 37 45.1 31.3 45.1 24.5z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.9 0 10.9-2 14.5-5.3l-7-5.4c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.7-3.9-12.4-9.1H4.3v5.6C7.9 41.1 15.3 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.6 28.3c-.4-1.3-.7-2.7-.7-4.1s.2-2.8.7-4.1v-5.6H4.3C2.8 17.4 2 20.6 2 24s.8 6.6 2.3 9.6z"
      />
      <path
        fill="#EA4335"
        d="M24 10.7c3.2 0 6.1 1.1 8.4 3.3l6.2-6.2C34.9 4.2 29.9 2 24 2 15.3 2 7.9 6.9 4.3 14.4l7.3 5.6c1.7-5.2 6.6-9.3 12.4-9.3z"
      />
    </svg>
  );
}
