import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import type { Dict, Locale } from "./i18n";
import { fmt } from "./i18n";

export type ExportRow = {
  name: string;
  kind: string;
  extension: string;
  tokens: number;
  words: number;
  characters: number;
  chunks: number;
  chunkTotal: number;
};

export type ExportData = {
  rows: ExportRow[];
  totalTokens: number;
  totalChunks: number;
  avgChunk: number;
  modelName: string;
};

function buildTable(data: ExportData, t: Dict) {
  const header = t.csvHeaders as unknown as string[];
  const lines = data.rows.map((row) => [
    row.name,
    row.kind,
    row.tokens,
    row.words,
    row.characters,
    row.chunks,
    row.chunks ? Math.round(row.chunkTotal / row.chunks) : 0,
  ]);
  const summary = [t.csvTotalLabel, data.modelName, data.totalTokens, "", "", data.totalChunks, Math.round(data.avgChunk)];
  return { header, lines, summary };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.position = "fixed";
  anchor.style.opacity = "0";
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 2000);
}

const safeCsv = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

export function buildCsvBlob(data: ExportData, t: Dict): Blob {
  const { header, lines, summary } = buildTable(data, t);
  const csv = [header, ...lines, summary].map((row) => row.map(safeCsv).join(",")).join("\n");
  return new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
}

export function buildXlsxBlob(data: ExportData, t: Dict): Blob {
  const { header, lines, summary } = buildTable(data, t);
  const worksheet = XLSX.utils.aoa_to_sheet([header, ...lines, summary]);
  worksheet["!cols"] = header.map((_, index) => ({ wch: index === 0 ? 32 : 16 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "TokenLab");
  const buffer: ArrayBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

export function buildPdfBlob(data: ExportData, t: Dict, locale: Locale): Blob {
  const { header, lines, summary } = buildTable(data, t);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(9, 13, 10);
  doc.rect(0, 0, pageWidth, 64, "F");
  doc.setFillColor(168, 233, 53);
  doc.rect(0, 60, pageWidth, 4, "F");
  doc.setTextColor(238, 242, 232);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("TokenLab", marginX, 40);

  doc.setTextColor(23, 32, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(t.pdfReportTitle, marginX, 92);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 96, 88);
  const generatedAt = new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  doc.text(fmt(t.pdfGeneratedAt, { date: generatedAt }), marginX, 108);
  doc.text(fmt(t.pdfModelLine, { model: data.modelName }), marginX, 121);

  const numFmt = new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(23, 32, 25);
  doc.text(fmt(t.pdfSummaryTokens, { value: numFmt.format(data.totalTokens) }), marginX, 142);
  doc.text(fmt(t.pdfSummaryChunks, { value: numFmt.format(data.totalChunks) }), marginX, 156);
  doc.text(fmt(t.pdfSummaryAvg, { value: numFmt.format(Math.round(data.avgChunk)) }), marginX, 170);

  autoTable(doc, {
    startY: 190,
    margin: { left: marginX, right: marginX },
    head: [header],
    body: [...lines, summary],
    styles: { font: "helvetica", fontSize: 8.5, textColor: [23, 32, 25], cellPadding: 6 },
    headStyles: { fillColor: [9, 13, 10], textColor: [238, 242, 232], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [242, 241, 233] },
    theme: "grid",
    didParseCell: (hookData) => {
      if (hookData.row.index === lines.length && hookData.section === "body") {
        hookData.cell.styles.fontStyle = "bold";
        hookData.cell.styles.fillColor = [235, 236, 227];
      }
    },
  });

  return doc.output("blob");
}

export async function buildZipBlob(pdfBlob: Blob, xlsxBlob: Blob, t: Dict): Promise<Blob> {
  const zip = new JSZip();
  zip.file(t.pdfFilename, pdfBlob);
  zip.file(t.xlsxFilename, xlsxBlob);
  return zip.generateAsync({ type: "blob", mimeType: "application/zip" });
}

export type ExportFormat = "csv" | "pdf" | "xlsx" | "zip";

export async function runExport(format: ExportFormat, data: ExportData, t: Dict, locale: Locale) {
  if (format === "csv") {
    downloadBlob(buildCsvBlob(data, t), t.csvFilename);
    return;
  }
  if (format === "xlsx") {
    downloadBlob(buildXlsxBlob(data, t), t.xlsxFilename);
    return;
  }
  if (format === "pdf") {
    downloadBlob(buildPdfBlob(data, t, locale), t.pdfFilename);
    return;
  }
  const pdfBlob = buildPdfBlob(data, t, locale);
  const xlsxBlob = buildXlsxBlob(data, t);
  downloadBlob(await buildZipBlob(pdfBlob, xlsxBlob, t), t.zipFilename);
}
