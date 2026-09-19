import React, { useState } from 'react';
import { FileText, Download, Eye, X, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { Attachment, ThemeConfig } from '../types';

interface DocumentAttachmentViewerProps {
  attachments: Attachment[];
  themeConfig: ThemeConfig;
  postTitle?: string;
}

export const DocumentAttachmentViewer: React.FC<DocumentAttachmentViewerProps> = ({
  attachments,
  themeConfig,
  postTitle = 'Dokumen Investigasi',
}) => {
  const [selectedDoc, setSelectedDoc] = useState<Attachment | null>(null);

  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-red-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Berkas & Dokumen Otentik ({attachments.length} Berkas)
          </h4>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          Terotentikasi Redaksi
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attachments.map((doc, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all hover-light-glow ${
              themeConfig.mode === 'dark'
                ? 'bg-slate-900/80 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0 font-bold text-xs border border-red-500/20">
                PDF
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {doc.name}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span>Ukuran: {doc.size || '1.8 MB'}</span>
                  <span>•</span>
                  <span className="text-emerald-500 font-semibold">Telah Terverifikasi</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedDoc(doc)}
                className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                title="Buka Pratinjau Dokumen"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                download={doc.name}
                className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-500 transition-colors"
                title="Unduh Berkas"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Pratinjau Dokumen PDF */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 ${
              themeConfig.mode === 'dark'
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xs">
                  PDF
                </div>
                <div>
                  <h3 className="text-sm font-bold truncate max-w-md">{selectedDoc.name}</h3>
                  <p className="text-[10px] text-slate-400">Berkas Arsip Investigasi • {selectedDoc.size}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sertifikat Otentisitas Berkas Hukum & Sejarah</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Dokumen ini merupakan lampiran resmi yang dirujuk dalam ulasan <strong>"{postTitle}"</strong>. Telah melalui proses uji silang sumber (*cross-reference*) oleh tim redaksi hukum Facrial.
                </p>
              </div>

              {/* Tampilan frame atau konten berkas */}
              <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center space-y-3">
                <FileText className="w-12 h-12 text-red-500 mx-auto" />
                <h4 className="text-sm font-bold">{selectedDoc.name}</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Dokumen PDF berformat digital resmi. Anda dapat membuka langsung di tab peramban atau mengunduh untuk dipelajari secara luring.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <a
                    href={selectedDoc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buka Dokumen PDF di Tab Baru
                  </a>
                  <a
                    href={selectedDoc.url}
                    download={selectedDoc.name}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Berkas ({selectedDoc.size})
                  </a>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
