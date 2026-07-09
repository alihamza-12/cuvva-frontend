import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  HelpCircle,
  Check,
  X as XIcon,
  AlertTriangle,
} from "lucide-react";

/**
 * frontend/src/pages/customer/InsuranceSummaryPage.jsx
 *
 * "Insurance summary (IPID)" — full real text/JSX content page, built
 * from the exact wording across your 7 reference screenshots (in the
 * order: 1 -> 7). This is ONE continuous scrollable page with ONE
 * sticky header (not repeated per screenshot), matching how the real
 * app renders it.
 *
 * Sections in order:
 *   1. Motor Insurance hero card (Wakam underwriter info)
 *   2. What is this type of Insurance?
 *   3. What is Insured?        (green, checkmarks)
 *   4. What is Not Insured?    (red, X marks)
 *   5. Are there any restrictions on cover?  (orange, ! marks)
 *   6. Where am I covered?     (purple globe)
 *   7. What are my obligations? (green handshake, bullets)
 *   8. When and how do I pay?  (yellow)
 *   9. When does the cover start and end? (purple hourglass)
 *   10. How do I cancel the contract? (black shield)
 *
 * Route suggestion: /customer/policies/documents/ipid
 *
 * NOTE: this content references a specific underwriter (Wakam) and
 * specific cover limits (£2,000,000 / £60,000 / £500 / £100 / £150 /
 * £5,000 / £2,500). Your Policy schema supports THREE underwriters
 * (Wakam, ERS Syndicate, Crawford) — if a policy is underwritten by
 * ERS Syndicate or Crawford instead of Wakam, this static copy would be
 * factually wrong for that policy. Flagging this so you can decide
 * whether to make the underwriter name/limits dynamic based on
 * policy.underwriter, or whether this IPID template is Wakam-only by
 * design (e.g. because you currently only issue Wakam policies).
 */
export default function InsuranceSummaryPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      {/* Header — single sticky header for the whole scrollable page */}
      <div className="flex items-center justify-between px-3 py-3 sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-black/5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="w-9 h-9 rounded-full bg-[#f2f2f2] flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-[#1a1a1a]" />
        </button>
        <h1 className="text-[15px] font-bold text-[#1a1a1a]">
          Insurance summary (IPID)
        </h1>
        <button
          type="button"
          aria-label="Help"
          className="w-9 h-9 rounded-full bg-[#f2f2f2] flex items-center justify-center"
        >
          <HelpCircle size={18} className="text-[#1a1a1a]" />
        </button>
      </div>

      {/* 1. Hero card */}
      <div className="bg-[#3d6d8c] text-white px-6 pt-6 pb-8">
        <div className="h-px bg-white/25 mb-6" />
        <h2 className="text-[34px] font-light text-white/60 leading-tight mb-4">
          Motor Insurance
        </h2>
        <p className="text-[15px] font-semibold text-white mb-4">
          Insurance Product Information Document
        </p>

        <p className="text-[15px] mb-1">
          <span className="text-white/60 font-semibold">Company </span>
          <span className="font-semibold">Wakam</span>
        </p>
        <p className="text-[14px] text-white/90 leading-relaxed mb-4">
          Wakam UK Limited is a company registered in England and Wales with
          company number 14778827, having its registered office at 18th &amp;
          19th Floors 100 Bishopsgate, London, United Kingdom, EC2N 4AG.
          Authorised by the Prudential Regulation Authority and regulated by the
          Financial Conduct Authority and the Prudential Regulation Authority
          under Firm Reference Number 995565.
        </p>

        <p className="text-[15px] mb-1">
          <span className="text-white/60 font-semibold">Product </span>
          <span className="font-semibold">
            Cuvva short-term motor insurance
          </span>
        </p>
        <p className="text-[14px] text-white/90 leading-relaxed">
          This Insurance Product Information Document is only intended to
          provide a summary of the main coverage and exclusions and is not
          personalised to your specific individual needs. Complete
          pre-contractual and contractual information on the product is provided
          in your policy documentation.
        </p>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* 2. What is this type of Insurance? */}
        <section>
          <h3 className="text-[17px] font-semibold text-[#1a1a1a] mb-2">
            What is this type of Insurance?
          </h3>
          <p className="text-[15px] font-bold text-[#1a1a1a] leading-relaxed">
            This comprehensive motor insurance policy provides short term cover
            against loss or damage to your vehicle and for injury or damage
            caused by your vehicle.
          </p>
        </section>

        {/* 3. What is Insured? */}
        <section className="bg-[#eeeeef] rounded-2xl p-5">
          <SectionHeader
            iconBg="#1fae6e"
            icon={<UmbrellaIcon />}
            title="What is Insured?"
          />

          <p className="text-[13px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-3 mt-4">
            Cover for your vehicle
          </p>
          <ul className="space-y-4">
            <CheckItem text="Accident, Theft, attempted Theft or Fire" />
            <CheckItem text="Personal belongings lost or damaged in an accident or by theft or fire" />
            <CheckItem text="Loss or damage to permanently fitted audio & communications equipment" />
          </ul>

          <p className="text-[13px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-3 mt-6">
            Cover to other people
          </p>
          <ul className="space-y-4">
            <CheckItem text="Your legal liability in respect of death of or bodily injury to other people and damage to property owned by other people arising from an accident involving your vehicle and any trailer, caravan or vehicle you are towing" />
            <CheckItem text="Personal accident benefits for the policyholder and spouse or civil partner as result of dying, loss of sight or loss of limb in an accident in your vehicle" />
            <CheckItem text="Medical expenses for driver and passengers injured in an accident in your vehicle" />
          </ul>
        </section>

        {/* 4. What is Not Insured? */}
        <section className="bg-[#eeeeef] rounded-2xl p-5">
          <SectionHeader
            iconBg="#e0384c"
            icon={
              <AlertTriangle
                size={18}
                className="text-white"
                fill="white"
                strokeWidth={0}
              />
            }
            title="What is Not Insured?"
          />
          <ul className="space-y-4 mt-4">
            <CrossItem text="Theft if keys are left in the vehicle" />
            <CrossItem text="Your vehicle damage if you are under the influence of drink/or drugs at the time of an accident" />
            <CrossItem text="Loss or damage due to incorrect fuel being used" />
            <CrossItem text="Any claim arising from a vehicle being driven if a Statutory Off-Road Notification was made" />
            <CrossItem text="Vehicles without a MOT certificate if one is required" />
            <CrossItem text="Where racing, rallying or driving on a motor sport circuit" />
            <CrossItem text="Damage or loss if caused deliberately by you" />
            <CrossItem text="Repair or replacement of broken glass in the vehicle" />
            <CrossItem text="The vehicle being driven by a person not listed in the policy schedule or otherwise not permitted to drive" />
            <CrossItem text="The vehicle being driven for a purpose not permitted in the policy schedule" />
          </ul>
        </section>

        {/* 5. Are there any restrictions on cover? */}
        <section className="bg-[#eeeeef] rounded-2xl p-5">
          <SectionHeader
            iconBg="#f2994a"
            icon={
              <AlertTriangle
                size={18}
                className="text-white"
                fill="white"
                strokeWidth={0}
              />
            }
            title="Are there any restrictions on cover?"
          />
          <ul className="space-y-4 mt-4">
            <BangItem text="Third Party Property damage covered up to £2,000,000 including associated costs and expenses" />
            <BangItem text="Accident, theft, attempted theft, or fire is covered if the vehicle is damaged beyond economical repair. We will pay whichever is lower: the vehicle's market value or the amount on your receipt, up to a maximum of £60,000" />
            <BangItem text="A policy excess will apply to each claim. Excess amounts will be stated on the schedule" />
            <BangItem text="Personal belongings up to £100 (£150 for a child seat)" />
            <BangItem text="Medical expenses up to £150 per person" />
            <BangItem text="Non manufacturer fitted audio & communications equipment covered up to £500" />
            <BangItem text="Personal accident benefits are limited to £5,000 for death and £2,500 for loss of limb or sight" />
            <BangItem text="We will only repair the vehicle back to its original manufacturer specification." />
          </ul>
        </section>

        {/* 6. Where am I covered? */}
        <section>
          <SectionHeader
            iconBg="#5b52f0"
            icon={<GlobeIcon />}
            title="Where am I covered?"
          />
          <ul className="space-y-3 mt-4">
            <CheckItem
              dark
              text="Countries within the United Kingdom (UK) on a fully comprehensive basis, and while driving within the European Union (EU), Andorra, Iceland, Liechtenstein, Norway, Serbia and Switzerland for the minimum cover required by law."
            />
          </ul>
          <p className="text-[14px] text-[#1a1a1a] leading-relaxed mt-4">
            <span className="font-bold">Important:</span> If it is a legal
            requirement for a physical Green Card document to be in your
            possession to travel to countries permitted by this policy, then you
            must contact Cuvva to obtain prior to the start date of your travel.
            If you travel without a Green Card you may be breaking the law and
            may not be able to drive in the country you are visiting.
          </p>
        </section>

        {/* 7. What are my obligations? */}
        <section>
          <SectionHeader
            iconBg="#1fae6e"
            icon={<HandshakeIcon />}
            title="What are my obligations?"
          />
          <ul className="space-y-3 mt-4 list-disc pl-5">
            <li className="text-[15px] text-[#1a1a1a] leading-relaxed">
              To provide information which is correct and complete to the best
              of your knowledge
            </li>
            <li className="text-[15px] text-[#1a1a1a] leading-relaxed">
              To report any incident to us immediately
            </li>
            <li className="text-[15px] text-[#1a1a1a] leading-relaxed">
              To report any Theft, attempted Theft or malicious damage to the
              Police
            </li>
            <li className="text-[15px] text-[#1a1a1a] leading-relaxed">
              To inform Cuvva using the Cuvva app or by contacting Cuvva
              customer support if your details change.
            </li>
          </ul>
          <p className="text-[13px] text-[#6b7280] leading-relaxed mt-4">
            Note this is not an exhaustive list - please refer to your policy
            for full details of your obligations.
          </p>
        </section>

        {/* 8. When and how do I pay? */}
        <section>
          <SectionHeader
            iconBg="#f5b400"
            icon={<span className="text-[16px]">💰</span>}
            title="When and how do I pay?"
          />
          <p className="text-[15px] font-semibold text-[#1a1a1a] leading-relaxed mt-3">
            Payment is made in advance by debit or credit card. Cuvva will set
            up the payment automatically on your behalf when placing this
            insurance with us.
          </p>
        </section>

        {/* 9. When does the cover start and end? */}
        <section>
          <SectionHeader
            iconBg="#5b52f0"
            icon={<span className="text-[16px]">⏳</span>}
            title="When does the cover start and end?"
          />
          <p className="text-[15px] font-semibold text-[#1a1a1a] leading-relaxed mt-3">
            The dates of cover are specified in your policy schedule and
            Certificate of Motor Insurance.
          </p>
        </section>

        {/* 10. How do I cancel the contract? */}
        <section>
          <SectionHeader
            iconBg="#111111"
            icon={<span className="text-[16px]">🖐️</span>}
            title="How do I cancel the contract?"
          />
          <p className="text-[15px] font-semibold text-[#1a1a1a] leading-relaxed mt-3">
            You can cancel the policy by contacting Cuvva customer support. You
            must confirm the date and time you wish to cancel and acknowledge
            that the Certificate of Motor Insurance is no longer in effect from
            the date and time requested. No refund of premium is available if
            you cancel this policy.
          </p>
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function SectionHeader({ iconBg, icon, title }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <h3 className="text-[17px] font-bold text-[#9ca3af] leading-snug">
        {title}
      </h3>
    </div>
  );
}

function CheckItem({ text, dark = false }) {
  return (
    <li className="flex items-start gap-3">
      <Check
        size={16}
        className="text-[#1fae6e] shrink-0 mt-1"
        strokeWidth={3}
      />
      <span
        className={`text-[15px] leading-relaxed ${dark ? "text-[#1a1a1a] font-medium" : "text-[#1a1a1a]"}`}
      >
        {text}
      </span>
    </li>
  );
}

function CrossItem({ text }) {
  return (
    <li className="flex items-start gap-3">
      <XIcon
        size={16}
        className="text-[#e0384c] shrink-0 mt-1"
        strokeWidth={3}
      />
      <span className="text-[15px] text-[#1a1a1a] leading-relaxed">{text}</span>
    </li>
  );
}

function BangItem({ text }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-[#e0384c] font-black text-[16px] shrink-0 leading-relaxed">
        !
      </span>
      <span className="text-[15px] text-[#1a1a1a] leading-relaxed">{text}</span>
    </li>
  );
}

function UmbrellaIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
    >
      <path d="M12 2a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9z" />
      <line x1="12" y1="11" x2="12" y2="20" />
      <path d="M9 20a3 3 0 0 0 6 0" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
    >
      <path d="M11 17l-1.6-1.6a2 2 0 0 0-2.8 0l-.6.6" />
      <path d="M2 12l5-5 4 4 3-3 8 8" />
      <path d="M15 15l2 2" />
      <path d="M18 12l2 2" />
    </svg>
  );
}
