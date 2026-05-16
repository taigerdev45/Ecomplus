'use client';

import React from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';

interface PDFPreviewProps {
  url: string;
  title: string;
}

export function PDFPreview({ url, title }: PDFPreviewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="text-xs text-slate-500">Document PDF Officiel</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ouvrir ${title} dans un nouvel onglet`}
            title={`Ouvrir ${title} dans un nouvel onglet`}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 transition-all hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href={url}
            download
            aria-label={`Télécharger ${title}`}
            className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-white transition-all hover:bg-primary/90"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Télécharger
          </a>
        </div>
      </div>
      <div className="relative aspect-[1/1.414] w-full bg-slate-100 dark:bg-slate-950">
        <iframe 
          src={`${url}#toolbar=0`} 
          className="h-full w-full border-none"
          title="PDF Preview"
        />
      </div>
    </div>
  );
}
