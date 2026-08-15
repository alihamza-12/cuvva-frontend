import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { getPolicyDocumentData } from "../../app/api/policyApi";

const declarations = [
  "I am not currently banned from driving, nor have I received a driving ban outside of the UK during the last 5 years",
  "The vehicle has no modifications other than those on the approved list",
  "The vehicle has a valid MOT and Tax where required by law",
  "I have declared any relevant medical conditions to the DVLA or Licensing Authority and have been cleared to drive",
  "The driving licence I used to purchase this policy is valid and in date",
  "I understand I can only use the vehicle for social or domestic activities, leisure or commuting, or in connection with my business but only if driven by me",
  "I have never had a policy cancelled, refused or voided by an insurer",
  "I have no unspent criminal convictions or prosecutions pending (excluding motoring offences)",
  "The vehicle will be in the UK when the policy starts and ends and I will not permanently export the vehicle",
  "The vehicle is not currently impounded",
  "I will not use the vehicle for any motor trade related activities",
  "I am aware how much my vehicle is worth and understand this impacts my settlement in the event of a claim",
];

const territorialParagraphs = [
  "The certificate of motor insurance, and motor insurance policy to which it relates applies in respect of incidents occurring in member countries of the European Union. Cover also applies in other countries which have satisfied the requirements of the Commission of European Union as follows: Andorra, Iceland, Liechtenstein, Norway, Serbia and Switzerland.",
  "The certificate of motor insurance and the motor insurance policy to which it relates applies to any trailer whilst being towed by the motor vehicle shown on the certificate of motor insurance.",
  "Le Certificat et la police d’assurance qui s’y rattache s’appliquent au regard d’incidents ayant lieu dans les pays membres de l’Union Européenne. La couverture s’acquiert également dans d’autres pays qui ont rempli les conditions de la Commission de l’Union Européenne, c’est-à-dire: Andorre, Islande, Norvège, Serbie, Liechtenstein et Suisse.",
  "Le Certificat et la police d’assurance qui s’y rattache s’appliquent à toute remorque étant tractée par le véhicule dont il est fait mention dans le Certificat.",
  "Das Zertifikat und die diesbezügliche Versicherungspolice gewähren Versicherungsschutz für Versicherungsfälle in den Mitgliedsländern der EG. Der Geltungsbereich erstreckt sich ferner auf solche anderen Länder, die Erfordernisse der EG-Kommission erfüllt haben, nämlich: Andorra, Island, Norwegen, Serbien, Liechtenstein und die Schweiz.",
  "Das Zertifikat und die diesbezügliche Versicherungspolice gewähren Deckung für Anhänger des auf dem Zertifikat angegebenen Fahrzeugs.",
  "Il certificato e la polizza di assicurazione a cui fa riferimento si applicano per gli incidenti che occorrono nei paesi della Unione Europea. L’assicurazione si applica anche per gli altri paesi che hanno soddisfatto le esigenze della Commissione della Unione Europea, cioè: Andorra, Islanda, Norvegia, Liechtenstein, Serbia e Svizzera.",
  "Il certificato e la polizza di assicurazione a cui si riferisce si applicano a qualsiasi rimorchio che venga trainato dal veicolo indicato sul certificato.",
  "El Certificado y la Póliza de Seguro correspondiente cubren los accidentes que ocurran en cualquiera de los países miembros de la Unión Europea. Asimismo cubren los accidentes que ocurran en los siguientes países que reúnen las condiciones exigidas por la Comisión de la Unión Europea: Andorra, Islandia, Noruega, Liechtenstein, Serbia y Suiza.",
  "El Certificado y la Póliza de seguro correspondiente cubren a cualquier remolque mientras vaya arrastrado por el vehículo indicado en el Certificado.",
];

function SectionTitle({ children }) {
  return (
    <h2 className="mb-5 text-[28px] font-normal leading-tight text-[#9998ab] sm:text-[34px]">
      {children}
    </h2>
  );
}

function Detail({ label, value, code = false }) {
  return (
    <div className="grid grid-cols-[minmax(105px,0.8fr)_minmax(0,1.2fr)] gap-3 text-[13px] leading-6 sm:text-[14px]">
      <dt className="font-bold text-[#36363b]">{label}</dt>
      <dd className="min-w-0 break-words text-[#45454b]">
        {code ? (
          <span className="inline rounded border border-[#dddde2] bg-[#f4f4f6] px-1.5 py-0.5 font-mono text-[12px]">
            {value || "N/A"}
          </span>
        ) : (
          value || "N/A"
        )}
      </dd>
    </div>
  );
}

function CertificateField({ number, title, children }) {
  return (
    <div>
      <h3 className="text-[12px] font-bold leading-5 text-[#36363b]">
        {number ? `${number}. ` : ""}{title}
      </h3>
      <div className="mt-1 text-[12px] leading-5 text-[#45454b]">{children}</div>
    </div>
  );
}

export default function PolicyCertificatePage() {
  const navigate = useNavigate();
  const { policyId } = useParams();
  const [documentData, setDocumentData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDocument = async () => {
      try {
        const response = await getPolicyDocumentData(policyId);
        if (active) setDocumentData(response.data?.document || null);
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "We couldn't load this policy document.",
          );
        }
      }
    };

    loadDocument();
    return () => {
      active = false;
    };
  }, [policyId]);

  return (
    <div className="min-h-screen bg-white text-[#36363b]">
      <header
        className="sticky top-0 z-50 grid min-h-[68px] grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 border-b border-white/10 bg-black px-3 pb-3 text-white sm:px-5"
        style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Close policy document"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/5 bg-[#17181c]"
        >
          <X size={21} />
        </button>
        <h1 className="min-w-0 px-1 text-center text-[15px] font-bold leading-5 sm:text-[17px]">
          Policy details and certificate
        </h1>
        <div aria-hidden="true" className="h-11 w-11" />
      </header>

      {error ? (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-8 text-center">
          <p className="text-[14px] text-[#747680]">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-full bg-[#7c6bff] px-6 py-3 text-[13px] font-bold text-white"
          >
            Try again
          </button>
        </div>
      ) : !documentData ? (
        <div className="flex min-h-[70vh] items-center justify-center text-[14px] text-[#747680]">
          Loading document…
        </div>
      ) : (
        <main className="mx-auto w-full max-w-[920px] overflow-hidden bg-white px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
          <div className="border-t border-[#d4d4d6] pt-7">
            <div className="mb-10 flex justify-center">
              <img
                src="/cuvva-logo-grey.png"
                alt="Cuvva"
                className="h-auto w-[135px] object-contain"
              />
            </div>

            <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <SectionTitle>Policy details</SectionTitle>
                <p className="border-l-4 border-[#e1e1e3] pl-4 text-[14px] leading-6">
                  This is your policy schedule and statement of fact. Your
                  certificate can be found further down.
                </p>
              </div>
              <dl className="space-y-3 bg-[#e7e7e8] p-5">
                <Detail label="Ref code" value={documentData.policyNumber} code />
                <Detail label="Valid from" value={documentData.validFrom} />
                <Detail label="Valid until" value={documentData.validUntil} />
              </dl>
            </section>

            <section className="mt-12 grid gap-12 md:grid-cols-2">
              <div>
                <SectionTitle>Policyholder</SectionTitle>
                <dl className="space-y-2.5">
                  <Detail label="Name" value={documentData.customerName} />
                  <Detail label="Birth date" value={documentData.birthDate} />
                  <Detail
                    label="Driving licence number"
                    value={documentData.drivingLicenceNumber}
                    code
                  />
                  <Detail label="Residential address" value={documentData.address} />
                  <Detail label="Mobile" value={documentData.phone} />
                </dl>
              </div>
              <div>
                <SectionTitle>Vehicle</SectionTitle>
                <dl className="space-y-2.5">
                  <Detail label="Registration mark" value={documentData.registration} code />
                  <Detail label="VIN" value={documentData.vin} code />
                  <Detail label="Make" value={documentData.vehicleMake} />
                  <Detail label="Model" value={documentData.vehicleModel} />
                  <Detail label="Colour" value={documentData.vehicleColour} />
                  <Detail label="Year manufactured" value={documentData.vehicleYear} />
                </dl>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="text-[22px] font-normal">Incident history</h2>
              <p className="mt-4 text-[13px]">Incidents in the last three years are included.</p>
              <div className="mt-4 overflow-hidden border-y border-[#777] text-[12px]">
                <div className="grid grid-cols-3 border-b border-[#777] px-2 py-2 font-bold">
                  <span>Date</span><span>Category</span><span>Value</span>
                </div>
                <div className="px-2 py-2 italic">No incidents declared.</div>
              </div>
            </section>

            <section className="mt-12 grid gap-12 md:grid-cols-2">
              <div>
                <SectionTitle>Policy</SectionTitle>
                <Detail label="Cover level" value={documentData.coverageType} />
              </div>
              <div>
                <SectionTitle>Excess</SectionTitle>
                <p className="text-[13px]">Your excesses are as follows:</p>
                <p className="mt-7 text-[13px] leading-6">
                  <strong>Accidental damage, fire and theft</strong>{" "}
                  Total - £{documentData.excess}
                </p>
              </div>
            </section>
          </div>

          <section className="mt-16 border-t border-[#d4d4d6] pt-8">
            <SectionTitle>Declarations</SectionTitle>
            <p className="mb-6 text-[13px]">You have confirmed the following information:</p>
            <ul className="space-y-3">
              {declarations.map((declaration) => (
                <li key={declaration} className="flex gap-3 text-[12px] leading-5 sm:text-[13px]">
                  <span className="font-bold text-[#9998ab]">✓</span>
                  <span>{declaration}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t border-[#dadadc] pt-8">
              <h2 className="text-[22px] font-normal text-[#9998ab]">Payment</h2>
              <p className="mt-5 text-[14px] leading-7">
                You paid <strong>£{documentData.totalPrice}</strong>. This includes{" "}
                <strong>£{documentData.insurancePremium}</strong> insurance premium, a{" "}
                <strong>£{documentData.adminFee}</strong> admin fee, and{" "}
                <strong>£{documentData.insurancePremiumTax}</strong> insurance premium tax.
              </p>
            </div>

            <div className="mt-10 border-t border-[#dadadc] pt-8">
              <h2 className="text-[22px] font-normal text-[#9998ab]">Contact</h2>
              <div className="mt-5 space-y-5 text-[14px] leading-7">
                <p>
                  In the event of an incident, please contact us as soon as reasonably possible by{" "}
                  <strong>messaging us in the app.</strong> Or, call our claims helpline on{" "}
                  <span className="text-[#9998ab]">020 3828 7381.</span>
                </p>
                <p>
                  For anything else, get in touch with Cuvva in-app, or email{" "}
                  <span className="text-[#9998ab]">support@cuvva.com</span> and we'll get back to you as soon as we can.
                </p>
                <div className="rounded-xl bg-[#f4f4f6] p-4 text-[12px] leading-5">
                  Your policy reference is <strong>{documentData.policyNumber}</strong>. Keep it available if you need to prove you are insured.
                </div>
              </div>
            </div>
          </section>

          <section className="mt-16 border-t border-[#d4d4d6] pt-8">
            <SectionTitle>Certificate of motor insurance</SectionTitle>
            <p className="mb-7 border-l-4 border-[#e1e1e3] pl-4 text-[13px] leading-6">
              This part is your legal proof of insurance. You may be required to present it to a police officer or court of law.
            </p>

            <div className="border border-[#444448] p-5 sm:p-7">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <CertificateField number="" title="Policy number">
                    <span className="rounded border border-[#dddde2] bg-[#f4f4f6] px-1.5 py-0.5 font-mono">
                      {documentData.policyNumber}
                    </span>
                  </CertificateField>
                  <CertificateField number="1" title="Description of vehicle">
                    {documentData.vehicleMake} {documentData.vehicleModel} ({documentData.vehicleColour}, {documentData.vehicleYear}) with registration mark {documentData.registration} and VIN {documentData.vin}
                  </CertificateField>
                  <CertificateField number="2" title="Name of policyholder">
                    {documentData.customerName}
                  </CertificateField>
                  <CertificateField number="3" title="Effective date of the commencement of insurance for the purposes of the relevant law">
                    {documentData.validFrom}
                  </CertificateField>
                  <CertificateField number="4" title="Date of expiry of insurance">
                    {documentData.validUntil}
                  </CertificateField>
                </div>
                <div className="space-y-6">
                  <CertificateField number="5" title="Persons or classes of persons entitled to drive">
                    <p>Policyholder only</p>
                    <p className="mt-3">Provided that the person driving holds a licence and is not disqualified from holding or obtaining such a licence.</p>
                  </CertificateField>
                  <CertificateField number="6" title="Limitations as to use">
                    <p>This insurance covers all of the following:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li>social, domestic, and pleasure purposes</li>
                      <li>travel between the policyholder's home and permanent place of work</li>
                      <li>class 1 business use</li>
                    </ul>
                    <p className="mt-4">This insurance does not cover any of the following:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li>racing, pacemaking, speed testing, rallies, trials or competitions on or off the public highway</li>
                      <li>the carriage of passengers or goods for hire and reward, letting on hire, or use in connection with the motor trade</li>
                      <li>securing the release of a motor vehicle other than the vehicle described in this schedule</li>
                    </ul>
                  </CertificateField>
                </div>
              </div>

              <div className="mt-9 space-y-4 border-t border-[#d4d4d6] pt-6 text-[11px] leading-5">
                <p>
                  I hereby certify that the Insurance to which this Certificate relates satisfies the requirements of the relevant law applicable in Great Britain, Northern Ireland, the Isle of Man, the Island of Guernsey, the Island of Jersey and the Island of Alderney.
                </p>
                <p>For and on behalf of Authorised Insurers - Wakam.</p>
                <img
                  src="/wakam-signature.jpg"
                  alt="Authorised insurer signature"
                  className="h-auto w-[125px] object-contain"
                />
                <p className="text-[10px]">
                  Wakam UK Limited is a company registered in England and Wales with company number 14778827, having its registered office at 18th & 19th Floors 100 Bishopsgate, London, United Kingdom, EC2N 4AG. Authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority under Firm Reference Number 995565.
                </p>
                <p className="text-[10px]"><strong>Advice to third parties:</strong> nothing contained in this certificate affects your right as a third party to make a claim. For full details of the insurance cover, reference should be made to the policy booklet and schedule.</p>
              </div>
            </div>
          </section>

          <section className="mt-16 border-t border-[#d4d4d6] pt-8">
            <div className="space-y-5">
              {territorialParagraphs.map((paragraph) => (
                <p key={paragraph} className="border-l-4 border-[#ededee] pl-4 text-[11px] leading-5 sm:text-[12px]">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
