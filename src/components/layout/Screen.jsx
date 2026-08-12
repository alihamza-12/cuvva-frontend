import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const SCREEN_BG = "bg-black";
export const TOP_SPACE = "pt-[calc(env(safe-area-inset-top)+1rem)]";

export default function Screen({ children, className = "", header = null }) {
  const top = header ? "pt-[calc(env(safe-area-inset-top)+4.5rem)]" : TOP_SPACE;
  return (
    <div className={`min-h-dvh ${SCREEN_BG} ${top} ${className}`}>
      {header && (
        <div className="fixed top-0 left-0 right-0 z-40 pt-[env(safe-area-inset-top)] bg-black/95 backdrop-blur">
          {header}
        </div>
      )}
      {children}
    </div>
  );
}

export function BackHeader({ title }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 px-4 h-14">
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white active:opacity-60" aria-label="Back">
        <ArrowLeft size={22} />
      </button>
      <h1 className="text-[17px] font-bold text-white truncate">{title}</h1>
    </div>
  );
}
