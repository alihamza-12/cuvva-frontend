import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, ExternalLink, X } from "lucide-react";
import { getPolicyDocument } from "../../app/api/policyApi";

export default function PolicyCertificatePage() {
  const navigate = useNavigate();
  const { policyId } = useParams();
  const [documentUrl, setDocumentUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let objectUrl = "";

    const loadDocument = async () => {
      try {
        const response = await getPolicyDocument(policyId);
        objectUrl = URL.createObjectURL(
          new Blob([response.data], { type: "application/pdf" }),
        );
        if (active) setDocumentUrl(objectUrl);
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
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [policyId]);

  const downloadDocument = () => {
    if (!documentUrl) return;
    const link = document.createElement("a");
    link.href = documentUrl;
    link.download = "Policy details and certificate.pdf";
    link.click();
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Close document"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-[#17181c]"
        >
          <X size={18} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-[15px] font-bold">
          Policy details and certificate
        </h1>
        <button
          type="button"
          onClick={downloadDocument}
          disabled={!documentUrl}
          aria-label="Download document"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-[#17181c] disabled:opacity-40"
        >
          <Download size={18} />
        </button>
      </div>

      {error ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="text-[14px] text-[#9497a1]">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-full bg-[#7c6bff] px-6 py-3 text-[13px] font-bold"
          >
            Try again
          </button>
        </div>
      ) : !documentUrl ? (
        <div className="flex flex-1 items-center justify-center text-[14px] text-[#9497a1]">
          Loading document…
        </div>
      ) : (
        <>
          <iframe
            src={documentUrl}
            title="Policy details and certificate"
            className="min-h-0 w-full flex-1 border-0 bg-white"
          />
          <button
            type="button"
            onClick={() => window.open(documentUrl, "_blank", "noopener,noreferrer")}
            className="m-3 flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#17181c] px-5 text-[13px] font-bold"
          >
            <ExternalLink size={16} />
            Open in PDF viewer
          </button>
        </>
      )}
    </div>
  );
}
