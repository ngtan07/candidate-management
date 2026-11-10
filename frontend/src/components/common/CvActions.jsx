import React, { useEffect, useRef, useState } from "react";
import { Download, Eye, FileText } from "lucide-react";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";
import applicationService from "../../services/applicationService";

export default function CvActions({ applicationId, fileName }) {
  const [open, setOpen] = useState(false); const [loading, setLoading] = useState(false); const [url, setUrl] = useState(""); const [error, setError] = useState("");
  const requestId = useRef(0);
  const pdf = (fileName || "").toLowerCase().endsWith(".pdf");
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  useEffect(() => () => { requestId.current += 1; }, []);
  const preview = async () => { const currentRequest = ++requestId.current; setOpen(true); setLoading(true); setError(""); try { const newUrl = await applicationService.previewCv(applicationId); if (requestId.current === currentRequest) setUrl(newUrl); else URL.revokeObjectURL(newUrl); } catch (e) { if (requestId.current === currentRequest) setError(e.message || "CV could not be loaded. Please sign in again and retry."); } finally { if (requestId.current === currentRequest) setLoading(false); } };
  const close = () => { requestId.current += 1; setOpen(false); setUrl(""); setError(""); };
  const download = async () => { try { await applicationService.downloadCv(applicationId, fileName); } catch (e) { setError(e.message || "CV download failed. Please sign in again and retry."); setOpen(true); } };
  return <>
    <div className="inline-flex items-center gap-2"><button type="button" onClick={preview} className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-semibold text-xs"><Eye className="w-3.5 h-3.5" />View CV</button><button type="button" onClick={download} className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs"><Download className="w-3.5 h-3.5" />Download</button></div>
    <Modal isOpen={open} onClose={close} title={fileName || "Candidate CV"} maxWidth="max-w-4xl"><div className="space-y-3">{loading ? <div className="py-16"><LoadingSpinner text="Loading CV securely..." /></div> : error ? <p role="alert" className="p-5 rounded-lg bg-red-50 text-red-700">{error}</p> : pdf && url ? <iframe src={url} title={fileName || "CV preview"} className="w-full h-[70vh] border rounded-lg" /> : <div className="p-8 text-center bg-slate-50 rounded-xl"><FileText className="w-10 h-10 mx-auto text-slate-400" /><p className="mt-3 text-sm text-slate-700">Inline preview is not supported for Word files. Download the original document to view it.</p></div>}{!loading && !error && <div className="flex justify-end"><button type="button" onClick={download} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">Download {fileName || "CV"}</button></div>}</div></Modal>
  </>;
}
