import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, ChevronRight, HelpCircle, MessageCircle, X } from "lucide-react";

const resourceContent = {
  "tips-sharing": {
    title: "Tips for sharing your car",
    subtitle: "How to get set up for a smooth car sharing experience",
  },
  "whats-covered": {
    title: "What's covered?",
    subtitle: "From insurance, to damage, to fines and parking tickets",
  },
  "choosing-charge": {
    title: "Choosing what to charge",
    subtitle: "Earn money by charging people to borrow your car",
  },
};

export default function CarClubResourcePage() {
  const navigate = useNavigate();
  const { resourceId } = useParams();
  const resource = resourceContent[resourceId] || resourceContent["tips-sharing"];

  return (
    <div className="min-h-screen bg-white text-[#202124]">
      <header className="sticky top-0 z-[60] flex items-center justify-between bg-white/95 px-5 pb-4 pt-5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Close article"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_4px_18px_rgba(0,0,0,0.08)]"
        >
          <X size={30} strokeWidth={2} className="text-black" />
        </button>

        <button
          type="button"
          aria-label="Help"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_4px_18px_rgba(0,0,0,0.08)]"
        >
          <HelpCircle size={24} className="text-[#6337d9]" />
        </button>
      </header>

      <main className="mx-auto max-w-[620px] px-7 pb-36">
        <p className="pt-2 text-[14px] text-[#777b82]">
          All Collections&nbsp;&nbsp;›&nbsp;&nbsp; Cuvva car clubs&nbsp;&nbsp;›
        </p>

        <p className="mt-2 text-[14px] text-[#777b82]">
          Cuvva car clubs explained
        </p>

        <h1 className="mt-8 text-[34px] font-extrabold leading-[1.08] tracking-[-1px]">
          {resource.title}
        </h1>

        <p className="mt-4 text-[20px] leading-relaxed text-[#555960]">
          {resource.subtitle}
        </p>

        <p className="mt-6 text-[15px] text-[#777b82]">Updated this week</p>

        <button
          type="button"
          className="mt-8 flex w-full items-center justify-between rounded-xl border border-[#dedfe2] px-5 py-4 text-left text-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
        >
          <span>Table of contents</span>
          <ChevronDown size={20} />
        </button>

        <ArticleContent />

        <section className="mt-10 border-t border-[#dedfe2] pt-8">
          <h2 className="text-[27px] font-extrabold">Related Articles</h2>

          <div className="mt-5 overflow-hidden rounded-3xl border border-[#dedfe2]">
            {[
              "Does the car need an underlying policy?",
              "How to drive someone else's car with Cuvva",
              "Tips for sharing your car",
              "What's covered when someone borrows your car with Cuvva car clubs",
              "How to borrow or lend a car using Cuvva's public car clubs",
            ].map((article, index) => (
              <button
                key={article}
                type="button"
                onClick={() => {
                  if (index === 2) navigate("/customer/car-clubs/resources/tips-sharing");
                }}
                className={`flex w-full items-center justify-between px-7 py-5 text-left text-[18px] leading-snug ${
                  index !== 4 ? "border-b border-[#eeeeef]" : ""
                }`}
              >
                <span className="pr-4">{article}</span>
                <ChevronRight size={19} className="shrink-0" />
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-[#f3f3f3] px-5 py-8 text-center">
          <p className="text-[19px] text-[#5d6065]">
            Did this answer your question?
          </p>
          <div className="mt-5 flex justify-center gap-7 text-[32px]">
            <button type="button" aria-label="Not helpful">😞</button>
            <button type="button" aria-label=" partly helpful">😐</button>
            <button type="button" aria-label="Helpful">😀</button>
          </div>
        </section>
      </main>

      <button
        type="button"
        aria-label="Open chat"
        className="fixed bottom-6 right-6 z-[70] flex h-16 w-16 items-center justify-center rounded-full bg-[#5d2ee8] text-white shadow-[0_8px_30px_rgba(93,46,232,0.4)]"
      >
        <MessageCircle size={30} strokeWidth={2} />
      </button>
    </div>
  );
}

function ArticleContent() {
  return (
    <article className="mt-10 text-[19px] leading-[1.55]">
      <h2 className="text-[27px] font-extrabold leading-tight">
        What&rsquo;s a Cuvva car club?
      </h2>

      <p className="mt-5">
        A Cuvva car club is a way to share your car with people you know and
        trust. Maybe that&rsquo;s your family, friends, neighbours, co-workers or
        your community. Whoever you choose to invite, it&rsquo;s about helping
        people who need to borrow a car use Cuvva&rsquo;s short-term car insurance
        to drive yours when you don&rsquo;t need it.
      </p>

      <h2 className="mt-10 text-[27px] font-extrabold leading-tight">
        Can anyone set up a car club on Cuvva?
      </h2>

      <p className="mt-5">
        Absolutely! Anyone can create a car club on Cuvva. Whether you already
        manage a car club in your community or you just want to share your car
        with family, we give you the tools to get started. Your club, your
        rules.
      </p>

      <h2 className="mt-10 text-[27px] font-extrabold leading-tight">
        Why should I set up a car club on Cuvva?
      </h2>

      <p className="mt-5">
        However big or small your car club, sharing your car can have a big
        ripple effect on both people and the planet. And it can be good for
        your pocket too.
      </p>

      <p className="mt-7">Did you know most cars sit idle 96% of the time?*</p>

      <p className="mt-7">
        Sharing cars helps people out who may not have access to a car or might
        need to borrow one for a short while. It could be they need to run a
        few errands, or maybe they just need to borrow a car while theirs is
        out-of-action.
      </p>

      <p className="mt-7">Whatever the reason, when you share your car with someone:</p>

      <ul className="mt-5 list-disc space-y-3 pl-7">
        <li>it could save them money, rather than taking a taxi or hire car 💰</li>
        <li>it could avoid them needing to buy a car, reducing traffic and parking woes 🌍</li>
      </ul>

      <h2 className="mt-10 text-[27px] font-extrabold leading-tight">
        How do I get started?
      </h2>

      <p className="mt-5">
        Start by clicking the &lsquo;Car clubs&rsquo; tab in the Cuvva app. Then you
        can create your car club in 3 easy steps:
      </p>

      <ol className="mt-5 list-decimal space-y-2 pl-7">
        <li>Give your club a name</li>
        <li>Add your vehicle</li>
        <li>Share a link to your club and invite people to join</li>
      </ol>

      <p className="mt-7">
        From there, you can also add extra details about any cars in the club
        that belong to you. For example, you can say when it&rsquo;s usually
        available or add a description to let people know what to expect.
      </p>

      <p className="mt-7">
        You can add as many vehicles to a club as you want, and add as many
        members as you like too.
      </p>

      <h2 className="mt-10 text-[27px] font-extrabold leading-tight">
        How does the insurance part work?
      </h2>

      <p className="mt-5">
        When someone in your car club borrows your car, they need to use the
        Cuvva app to buy their own insurance policy for the duration of their
        trip. Their policy is completely separate from yours.
      </p>

      <p className="mt-7">
        So whatever happens, it won&rsquo;t impact your own insurance policy or your
        no claims bonus, if something goes wrong.
      </p>

      <p className="mt-7">
        All our policies are fully comprehensive, which is the best level of
        cover you can get. For extra peace of mind, drivers can also add
        breakdown cover to their policy.
      </p>

      <h2 className="mt-10 text-[27px] font-extrabold leading-tight">
        Will I be protected if something goes wrong?
      </h2>

      <p className="mt-5">
        When someone wants to borrow your car, they should use the Cuvva app
        to buy a short-term policy for the duration of their trip. This is
        separate to your own insurance.
      </p>

      <p className="mt-7">
        If someone has an accident when they borrow your car, we&rsquo;ll cover:
      </p>

      <ul className="mt-4 list-disc space-y-2 pl-7">
        <li>damage to your vehicle</li>
        <li>damage to any other vehicles involved</li>
        <li>personal injury claims</li>
      </ul>

      <p className="mt-7">
        Read more about what our fully comprehensive insurance includes.
      </p>

      <h2 className="mt-10 text-[27px] font-extrabold leading-tight">
        Any tips for getting started?
      </h2>

      <p className="mt-5">
        Before someone borrows your car, make sure it&rsquo;s clean and tidy and fit
        to drive. You may want to put a few ground rules in place to avoid any
        misunderstandings later on.
      </p>

      <h3 className="mt-9 text-[22px] font-extrabold">Insurance</h3>
      <p className="mt-3">
        Double-check that the borrower is aware that they need to buy a
        short-term Cuvva policy to borrow your car.
      </p>

      <h3 className="mt-9 text-[22px] font-extrabold">MOT and tax</h3>
      <p className="mt-3">
        Don&rsquo;t forget to check these are all up-to-date before someone borrows
        your car.
      </p>

      <h3 className="mt-9 text-[22px] font-extrabold">
        Tyres, oil and headlights
      </h3>
      <p className="mt-3">
        Remember to check the oil tank is topped up and your tyres are pumped
        up to a safe level. Check your headlights are working too.
      </p>

      <h3 className="mt-9 text-[22px] font-extrabold">Keys</h3>
      <p className="mt-3">
        Be clear where you want people to collect and return the keys and at
        what time. If they need to extend their policy, remind them to check
        with you first.
      </p>

      <h3 className="mt-9 text-[22px] font-extrabold">Fuel</h3>
      <p className="mt-3">
        Make sure there&rsquo;s fuel in the tank or you&rsquo;ve charged up your car before
        someone borrows it. Let people know if you expect them to top it back
        up before they return it.
      </p>

      <h3 className="mt-9 text-[22px] font-extrabold">Car interior</h3>
      <p className="mt-3">
        Don&rsquo;t forget to clear out any valuables and make sure your car is clean
        and tidy. It&rsquo;s a good idea to let people know your expectations around
        pets and smoking in the vehicle too.
      </p>

      <p className="mt-9">A couple of final tips:</p>
      <ul className="mt-4 list-disc space-y-3 pl-7">
        <li><strong>Swap phone numbers</strong> so you can stay in touch.</li>
        <li><strong>Take photos of the car</strong> before and after it is borrowed.</li>
      </ul>

      <p className="mt-9 border-t border-[#dedfe2] pt-6 italic">
        *From the RAC Foundation&rsquo;s report on car usage in the UK, 2021.
      </p>
    </article>
  );
}
