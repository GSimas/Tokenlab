import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  AlertCircle, ArrowRight, BarChart3, BookOpen, Check, ChevronDown, Coffee, Cpu, Download,
  FileSpreadsheet, FileText, Files, Info, Layers, Loader2, LockKeyhole, Moon,
  Network, RotateCcw, Settings2, Sparkles, Split, Sun, Trash2, UploadCloud, X,
} from "lucide-react";
import { countTokens as countCl100k } from "gpt-tokenizer/encoding/cl100k_base";
import * as XLSX from "xlsx";
import { detectLocale, fmt, getDict, getSystemDarkServerSnapshot, getSystemDarkSnapshot, modelDetail, subscribeSystemDark, type Locale } from "./i18n";
import { runExport, type ExportData, type ExportFormat } from "./export";

const SCIENTATA_URL = "https://scientata.com";
const GITHUB_URL = "https://github.com/GSimas/Tokenlab";
const COFFEE_URL = "https://link.mercadopago.com.br/strangerhits";

function GithubMark({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55 0-.27-.01-1.15-.02-2.09-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.2.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

type SourceDoc = {
  id: string;
  name: string;
  kind: "texto" | "arquivo";
  extension: string;
  text: string;
  size: number;
};

type ModelPreset = {
  id: string;
  provider: string;
  name: string;
  limit: number;
  tokenizer: "cl100k" | "estimate";
};

const MODELS: ModelPreset[] = [
  { id: "text-embedding-3-small", provider: "OpenAI", name: "text-embedding-3-small", limit: 8191, tokenizer: "cl100k" },
  { id: "text-embedding-3-large", provider: "OpenAI", name: "text-embedding-3-large", limit: 8191, tokenizer: "cl100k" },
  { id: "gemini-embedding-001", provider: "Google", name: "gemini-embedding-001", limit: 2048, tokenizer: "estimate" },
  { id: "cohere-embed-v4", provider: "Cohere", name: "embed-v4.0", limit: 128000, tokenizer: "estimate" },
  { id: "generic", provider: "", name: "", limit: 8192, tokenizer: "estimate" },
];

const SAMPLE_PT = `# Política de atendimento ao cliente

Nosso objetivo é resolver solicitações com clareza, rapidez e empatia. Cada atendimento deve registrar o contexto, a decisão tomada e os próximos passos.

## Prazos de resposta

- Dúvidas gerais: até 1 dia útil.
- Incidentes críticos: primeira resposta em até 30 minutos.
- Solicitações financeiras: até 2 dias úteis.

Sempre preserve dados pessoais e encaminhe casos sensíveis para a equipe responsável. Antes de concluir, confirme se a solução foi compreendida pelo cliente.`;

const SAMPLE_EN = `# Customer support policy

Our goal is to resolve requests with clarity, speed and empathy. Every interaction must record the context, the decision made and the next steps.

## Response times

- General questions: within 1 business day.
- Critical incidents: first response within 30 minutes.
- Financial requests: within 2 business days.

Always protect personal data and route sensitive cases to the responsible team. Before closing, confirm that the customer understood the resolution.`;

const ACCEPTED = ".txt,.md,.csv,.json,.html,.xml,.yaml,.yml,.log,.rtf,.pdf,.docx,.xlsx,.xls";
const formatNumber = (value: number, locale: Locale) => new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US").format(Math.round(value || 0));
const formatBytes = (bytes: number, pastedLabel: string) => {
  if (!bytes) return pastedLabel;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
function countForModel(text: string, model: ModelPreset) {
  if (!text.trim()) return 0;
  if (model.tokenizer === "cl100k") return countCl100k(text);
  return Math.max(1, Math.ceil(text.length / 4));
}

function normalizeText(text: string) {
  // eslint-disable-next-line no-control-regex -- strip stray NUL bytes from extracted file text
  return text.replace(/\u0000/g, "").replace(/\r\n/g, "\n").replace(/\n{4,}/g, "\n\n\n").trim();
}

async function extractFile(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (extension === "pdf") {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const line = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
      pages.push(`[${pageNumber}]\n${line}`);
    }
    return normalizeText(pages.join("\n\n"));
  }
  if (extension === "docx") {
    const mammoth = await import("mammoth/mammoth.browser");
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return normalizeText(result.value);
  }
  if (extension === "xlsx" || extension === "xls") {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    return normalizeText(workbook.SheetNames.map((sheetName) => {
      const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName], { blankrows: false });
      return `# ${sheetName}\n${csv}`;
    }).join("\n\n"));
  }
  const raw = new TextDecoder("utf-8").decode(await file.arrayBuffer());
  if (extension === "html" || extension === "xml") {
    const doc = new DOMParser().parseFromString(raw, "text/html");
    return normalizeText(doc.body.textContent ?? raw);
  }
  if (extension === "rtf") {
    return normalizeText(raw.replace(/\\'[0-9a-fA-F]{2}/g, " ").replace(/\\[a-z]+-?\d* ?/g, " ").replace(/[{}]/g, " "));
  }
  return normalizeText(raw);
}

function splitLongUnit(unit: string, target: number, model: ModelPreset) {
  const words = unit.split(/\s+/).filter(Boolean);
  const pieces: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && countForModel(candidate, model) > target) {
      pieces.push(current);
      current = word;
    } else current = candidate;
  }
  if (current) pieces.push(current);
  return pieces;
}

function makeChunks(text: string, target: number, overlap: number, strategy: string, model: ModelPreset) {
  if (!text.trim()) return [];
  let units = strategy === "markdown"
    ? text.split(/(?=^#{1,6}\s)/gm)
    : strategy === "paragraph"
      ? text.split(/\n\s*\n/)
      : text.split(/(?<=[.!?])\s+|\n+/);
  units = units.filter((item) => item.trim()).flatMap((unit) => countForModel(unit, model) > target ? splitLongUnit(unit, target, model) : [unit]);
  const chunks: string[] = [];
  let current = "";
  for (const unit of units) {
    const candidate = current ? `${current}\n\n${unit}` : unit;
    if (current && countForModel(candidate, model) > target) {
      chunks.push(current.trim());
      const tailWords = current.split(/\s+/).filter(Boolean);
      let tail = "";
      while (tailWords.length && countForModel(tail, model) < overlap) {
        const word = tailWords.pop();
        tail = word ? `${word} ${tail}` : tail;
      }
      current = `${tail.trim()}${tail ? "\n\n" : ""}${unit}`;
    } else current = candidate;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export default function App() {
  const [locale, setLocaleState] = useState<Locale>("pt");
  const [themeOverride, setThemeOverride] = useState<"dark" | "light" | null>(null);
  const systemDark = useSyncExternalStore(subscribeSystemDark, getSystemDarkSnapshot, getSystemDarkServerSnapshot);
  const [inputMode, setInputMode] = useState<"text" | "files">("text");
  const [text, setText] = useState(SAMPLE_PT);
  const [files, setFiles] = useState<SourceDoc[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<string[]>([]);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [modelId, setModelId] = useState("text-embedding-3-small");
  const [strategy, setStrategy] = useState("recursive");
  const [chunkSize, setChunkSize] = useState(512);
  const [overlap, setOverlap] = useState(64);
  const [batchSize, setBatchSize] = useState(100);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [contextLimit, setContextLimit] = useState(8191);
  const [activeMetric, setActiveMetric] = useState<"tokens" | "chunks">("tokens");
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportBusy, setExportBusy] = useState<ExportFormat | null>(null);
  const [exportError, setExportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const model = MODELS.find((item) => item.id === modelId) ?? MODELS[0];
  const t = getDict(locale);
  const theme = themeOverride ?? (systemDark ? "dark" : "light");

  useEffect(() => {
    // One-time hydration of browser-only preferences (saved locale/theme, navigator.language).
    /* eslint-disable react-hooks/set-state-in-effect */
    const detected = detectLocale();
    setLocaleState(detected);
    setText((current) => (current === SAMPLE_PT && detected === "en" ? SAMPLE_EN : current));
    let stored: string | null = null;
    try { stored = localStorage.getItem("tokenlab-theme"); } catch { /* ignore */ }
    if (stored === "dark" || stored === "light") setThemeOverride(stored);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
  }, [locale]);

  useEffect(() => {
    if (themeOverride) document.documentElement.setAttribute("data-theme", themeOverride);
    else document.documentElement.removeAttribute("data-theme");
  }, [themeOverride]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setThemeOverride(next);
    try { localStorage.setItem("tokenlab-theme", next); } catch { /* ignore */ }
  };

  const toggleLocale = () => {
    const next: Locale = locale === "pt" ? "en" : "pt";
    setLocaleState(next);
    try { localStorage.setItem("tokenlab-locale", next); } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!exportMenuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) setExportMenuOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExportMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [exportMenuOpen]);

  const changeModel = (value: string) => {
    const next = MODELS.find((item) => item.id === value) ?? MODELS[0];
    setModelId(value);
    setContextLimit(next.limit);
    if (chunkSize > next.limit) setChunkSize(Math.max(128, Math.min(512, next.limit)));
  };

  const processFiles = useCallback(async (incoming: FileList | File[]) => {
    setFileError("");
    const selected = Array.from(incoming);
    const allowed = ACCEPTED.split(",").map((item) => item.slice(1));
    const valid = selected.filter((file) => allowed.includes(file.name.split(".").pop()?.toLowerCase() ?? ""));
    if (valid.length !== selected.length) setFileError(t.fileErrorPartial);
    setLoadingFiles(valid.map((file) => file.name));
    const next: SourceDoc[] = [];
    for (const file of valid) {
      try {
        const extracted = await extractFile(file);
        next.push({ id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`, name: file.name, kind: "arquivo", extension: file.name.split(".").pop()?.toUpperCase() ?? "FILE", text: extracted, size: file.size });
      } catch {
        setFileError(fmt(t.fileErrorExtract, { name: file.name }));
      }
      setLoadingFiles((items) => items.filter((name) => name !== file.name));
    }
    setFiles((current) => [...current, ...next]);
  }, [t]);

  const sources = useMemo<SourceDoc[]>(() => {
    const textSource = text.trim() ? [{ id: "typed-text", name: t.typedTextName, kind: "texto" as const, extension: "TXT", text: normalizeText(text), size: new Blob([text]).size }] : [];
    return [...textSource, ...files];
  }, [text, files, t.typedTextName]);

  const analysis = useMemo(() => {
    const rows = sources.map((source) => {
      const tokens = countForModel(source.text, model);
      const chunks = makeChunks(source.text, chunkSize, Math.min(overlap, chunkSize - 1), strategy, model);
      const chunkTokens = chunks.map((chunk) => countForModel(chunk, model));
      return { ...source, tokens, words: source.text.trim() ? source.text.trim().split(/\s+/).length : 0, characters: source.text.length, chunks: chunks.length, chunkTokens, chunkTotal: chunkTokens.reduce((sum, value) => sum + value, 0) };
    });
    const totalTokens = rows.reduce((sum, row) => sum + row.tokens, 0);
    const totalChunks = rows.reduce((sum, row) => sum + row.chunks, 0);
    const embeddedTokens = rows.reduce((sum, row) => sum + row.chunkTotal, 0);
    const allChunkTokens = rows.flatMap((row) => row.chunkTokens);
    const avgChunk = allChunkTokens.length ? allChunkTokens.reduce((sum, value) => sum + value, 0) / allChunkTokens.length : 0;
    return {
      rows, totalTokens, totalChunks, embeddedTokens,
      avgInput: rows.length ? totalTokens / rows.length : 0,
      avgChunk,
      overhead: Math.max(0, embeddedTokens - totalTokens),
      requests: totalChunks ? Math.ceil(totalChunks / Math.max(1, batchSize)) : 0,
      overLimit: allChunkTokens.filter((value) => value > contextLimit).length,
      maxChunk: allChunkTokens.length ? Math.max(...allChunkTokens) : 0,
    };
  }, [sources, model, chunkSize, overlap, strategy, contextLimit, batchSize]);

  const handleExport = async (format: ExportFormat) => {
    setExportError("");
    setExportBusy(format);
    setExportMenuOpen(false);
    try {
      const data: ExportData = {
        rows: analysis.rows,
        totalTokens: analysis.totalTokens,
        totalChunks: analysis.totalChunks,
        avgChunk: analysis.avgChunk,
        modelName: model.name,
      };
      await runExport(format, data, t, locale);
    } catch (error) {
      console.error(error);
      setExportError(t.exportError);
    } finally {
      setExportBusy(null);
    }
  };

  const maxBar = Math.max(1, ...analysis.rows.map((row) => activeMetric === "tokens" ? row.tokens : row.chunks));
  const heroLines = t.heroTitle.split("\n");
  const num = (value: number) => formatNumber(value, locale);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#workspace" aria-label="TokenLab">
          <span className="brand-mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M7 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H7" stroke="var(--brand-green)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M17 6H19C20.1046 6 21 6.89543 21 8V16C21 17.1046 20.1046 18 19 18H17" stroke="var(--brand-green)" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3.2" fill="var(--brand-green)" />
              <path d="M12 4.5V7M12 17V19.5M4.5 12H7M17 12H19.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <div className="brand-text">
            <span className="brand-title">Token<span>Lab</span></span>
            <span className="brand-subtitle">{t.scientataSubtitle}</span>
          </div>
        </a>
        <div className="header-note"><LockKeyhole size={14} /><span>{t.localProcessing}</span></div>
        <div className="header-actions">
          <a
            className="spark-button"
            href={SCIENTATA_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.scientataTooltip}
            title={t.scientataTooltip}
          >
            <span className="spark-button-icon"><Sparkles size={16} /></span>
            <span className="spark-button-text">Scientata</span>
          </a>
          <a className="icon-button" href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label={t.githubLabel} title={t.githubLabel}><GithubMark size={17} /></a>
          <button className="locale-button" onClick={toggleLocale} aria-label={t.localeToggle} title={t.localeToggle}>{locale === "pt" ? "EN" : "PT"}</button>
          <button className="icon-button" onClick={toggleTheme} aria-label={t.themeToggle} title={t.themeToggle}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
          <div className="export-menu" ref={exportMenuRef}>
            <button
              className="ghost-button"
              onClick={() => setExportMenuOpen((value) => !value)}
              disabled={!analysis.rows.length}
              aria-haspopup="menu"
              aria-expanded={exportMenuOpen}
              aria-label={t.exportMenuLabel}
            >
              {exportBusy ? <Loader2 size={16} className="spin" /> : <Download size={16} />} <span>{t.exportAnalysis}</span> <ChevronDown size={14} className={exportMenuOpen ? "rotated" : ""} />
            </button>
            {exportMenuOpen && (
              <div className="export-dropdown" role="menu" aria-label={t.exportMenuLabel}>
                <button role="menuitem" onClick={() => handleExport("csv")} disabled={!!exportBusy}>{t.exportCsv}</button>
                <button role="menuitem" onClick={() => handleExport("pdf")} disabled={!!exportBusy}>{t.exportPdf}</button>
                <button role="menuitem" onClick={() => handleExport("xlsx")} disabled={!!exportBusy}>{t.exportExcel}</button>
                <button role="menuitem" onClick={() => handleExport("zip")} disabled={!!exportBusy}>{t.exportZip}</button>
              </div>
            )}
            {exportError && <p className="export-error" role="alert"><AlertCircle size={13} /> {exportError}</p>}
          </div>
        </div>
      </header>

      <section className="intro">
        <div>
          <span className="eyebrow">{t.eyebrow}</span>
          <h1>{heroLines.map((line, index) => <span key={line}>{line}{index < heroLines.length - 1 && <br />}</span>)}</h1>
        </div>
        <p>{t.heroSubtitle}</p>
      </section>

      <section className="workspace" id="workspace">
        <div className="input-column">
          <div className="section-heading"><span className="step-number">01</span><div><h2>{t.step1Title}</h2><p>{t.step1Subtitle}</p></div></div>
          <div className="input-panel">
            <div className="mode-tabs" role="tablist" aria-label={t.step1Title}>
              <button className={inputMode === "text" ? "active" : ""} onClick={() => setInputMode("text")}><FileText size={17} /> {t.tabText}</button>
              <button className={inputMode === "files" ? "active" : ""} onClick={() => setInputMode("files")}><Files size={17} /> {t.tabFiles} <span>{files.length}</span></button>
            </div>
            {inputMode === "text" ? (
              <div className="text-entry">
                <textarea aria-label={t.textareaLabel} value={text} onChange={(event) => setText(event.target.value)} placeholder={t.textareaPlaceholder} spellCheck="true" />
                <div className="textarea-footer"><span>{fmt(t.charsWords, { chars: num(text.length), words: num(text.trim() ? text.trim().split(/\s+/).length : 0) })}</span><button onClick={() => setText("")} disabled={!text}><X size={14} /> {t.clear}</button></div>
              </div>
            ) : (
              <div className="file-entry">
                <input ref={fileInputRef} className="visually-hidden" type="file" accept={ACCEPTED} multiple onChange={(event) => event.target.files && processFiles(event.target.files)} />
                <button className={`dropzone ${dragging ? "dragging" : ""}`} onClick={() => fileInputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); processFiles(event.dataTransfer.files); }}>
                  <span className="upload-icon"><UploadCloud size={26} /></span><strong>{t.dropzoneTitle}</strong><small>{t.dropzoneFormats}</small>
                </button>
                {fileError && <p className="file-error"><AlertCircle size={15} /> {fileError}</p>}
                <div className="file-list">
                  {loadingFiles.map((name) => <div className="file-row loading" key={`loading-${name}`}><span className="file-type"><RotateCcw size={16} /></span><div><strong>{name}</strong><small>{t.extracting}</small></div></div>)}
                  {files.map((file) => <div className="file-row" key={file.id}><span className="file-type">{file.extension.includes("XLS") || file.extension === "CSV" ? <FileSpreadsheet size={17} /> : <FileText size={17} />}</span><div><strong>{file.name}</strong><small>{file.extension} · {formatBytes(file.size, t.pastedText)} · {num(countForModel(file.text, model))} {t.tokensSuffix}</small></div><button onClick={() => setFiles((current) => current.filter((item) => item.id !== file.id))} aria-label={fmt(t.removeFile, { name: file.name })}><Trash2 size={16} /></button></div>)}
                  {!files.length && !loadingFiles.length && <p className="empty-files">{t.noFiles}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="config-column">
          <div className="section-heading"><span className="step-number">02</span><div><h2>{t.step2Title}</h2><p>{t.step2Subtitle}</p></div></div>
          <div className="config-panel">
            <label className="field-label" htmlFor="model">{t.modelLabel}</label>
            <div className="select-wrap"><select id="model" value={modelId} onChange={(event) => changeModel(event.target.value)}>{MODELS.map((item) => <option value={item.id} key={item.id}>{item.provider ? `${item.provider} · ` : ""}{item.name || modelDetail(item.id, locale)}</option>)}</select><ChevronDown size={17} /></div>
            <div className="model-meta"><span><Sparkles size={14} /> {modelDetail(model.id, locale)}</span><span>{model.tokenizer === "cl100k" ? t.tokenizerExact : t.tokenizerEstimate}</span></div>
            <div className="field-grid">
              <div><label className="field-label" htmlFor="strategy">{t.splitLabel}</label><div className="select-wrap compact"><select id="strategy" value={strategy} onChange={(event) => setStrategy(event.target.value)}><option value="recursive">{t.splitRecursive}</option><option value="paragraph">{t.splitParagraph}</option><option value="markdown">{t.splitMarkdown}</option></select><ChevronDown size={16} /></div></div>
              <div><label className="field-label" htmlFor="batch">{t.batchLabel}</label><input id="batch" className="number-input" type="number" min="1" max="2048" value={batchSize} onChange={(event) => setBatchSize(Number(event.target.value) || 1)} /></div>
            </div>
            <div className="slider-field"><div className="slider-label"><label htmlFor="chunk">{t.chunkSizeLabel}</label><strong>{chunkSize} <small>{t.tokensSuffix}</small></strong></div><input id="chunk" type="range" min="128" max="2048" step="64" value={chunkSize} onChange={(event) => { const next = Number(event.target.value); setChunkSize(next); if (overlap >= next) setOverlap(Math.max(0, next - 64)); }} /><div className="range-notes"><span>{t.chunkPrecisionHint}</span><span>{t.chunkContextHint}</span></div></div>
            <div className="slider-field"><div className="slider-label"><label htmlFor="overlap">{t.overlapLabel}</label><strong>{overlap} <small>{t.tokensSuffix}</small></strong></div><input id="overlap" type="range" min="0" max={Math.max(0, chunkSize - 64)} step="16" value={Math.min(overlap, chunkSize - 64)} onChange={(event) => setOverlap(Number(event.target.value))} /><div className="range-notes"><span>0</span><span>{fmt(t.overlapPercent, { percent: Math.round((overlap / chunkSize) * 100) })}</span></div></div>
            <button className="advanced-toggle" onClick={() => setShowAdvanced((value) => !value)} aria-expanded={showAdvanced}><Settings2 size={16} /> {t.advancedToggle} <ChevronDown size={15} className={showAdvanced ? "rotated" : ""} /></button>
            {showAdvanced && <div className="advanced-content"><label className="field-label" htmlFor="context-limit">{t.contextLimitLabel}</label><div className="limit-input"><input id="context-limit" type="number" min="128" value={contextLimit} onChange={(event) => setContextLimit(Number(event.target.value) || 128)} /><span>{t.tokensSuffix}</span></div><p>{t.contextLimitNote}</p></div>}
          </div>
        </aside>
      </section>

      <section className="results-section">
        <div className="results-heading">
          <div className="section-heading"><span className="step-number inverted">03</span><div><h2>{t.step3Title}</h2><p>{fmt(t.step3Subtitle, { model: model.name })}</p></div></div>
          <div className={`status-chip ${analysis.overLimit ? "warning" : ""}`}>{analysis.overLimit ? <AlertCircle size={15} /> : <Check size={15} />}{analysis.overLimit ? fmt(t.statusOverLimit, { count: analysis.overLimit }) : t.statusOk}</div>
        </div>
        <div className="metric-grid">
          <article className="metric primary-metric"><span>{t.metricInputTokens}</span><strong>{num(analysis.totalTokens)}</strong><small>{t.metricInputTokensSub}</small></article>
          <article className="metric accent-metric"><span>{t.metricAvgInput} <span className="hint" title={t.metricAvgInputHint}><Info size={13} /></span></span><strong>{num(analysis.avgInput)}</strong><small>{analysis.rows.length} {analysis.rows.length === 1 ? t.metricAvgInputSubOne : t.metricAvgInputSubMany}</small></article>
          <article className="metric"><span>{t.metricChunks}</span><strong>{num(analysis.totalChunks)}</strong><small>{fmt(t.metricChunksSub, { avg: num(analysis.avgChunk) })}</small></article>
          <article className="metric"><span>{t.metricRequests}</span><strong>{num(analysis.requests)}</strong><small>{fmt(t.metricRequestsSub, { batch: num(batchSize) })}</small></article>
        </div>
        <div className="result-detail-grid">
          <article className="distribution-panel">
            <div className="panel-title-row"><div><h3>{t.distributionTitle}</h3><p>{t.distributionSubtitle}</p></div><div className="mini-tabs"><button className={activeMetric === "tokens" ? "active" : ""} onClick={() => setActiveMetric("tokens")}>{t.distTabTokens}</button><button className={activeMetric === "chunks" ? "active" : ""} onClick={() => setActiveMetric("chunks")}>{t.distTabChunks}</button></div></div>
            <div className="bars">{analysis.rows.length ? analysis.rows.map((row, index) => { const value = activeMetric === "tokens" ? row.tokens : row.chunks; return <div className="bar-row" key={row.id}><span className="bar-label" title={row.name}>{row.name}</span><div className="bar-track"><span style={{ width: `${Math.max(3, (value / maxBar) * 100)}%`, animationDelay: `${index * 70}ms` }} /></div><strong>{num(value)}</strong></div>; }) : <div className="empty-chart"><BarChart3 size={28} /><span>{t.emptyChart}</span></div>}</div>
          </article>
          <article className="insight-panel"><span className="insight-icon"><Sparkles size={19} /></span><h3>{t.insightTitle}</h3>{analysis.rows.length ? <p>{fmt(t.insightBody, { chunkSize, overlap: num(overlap), embedded: num(analysis.embeddedTokens) })}</p> : <p>{t.insightEmpty}</p>}<div className="insight-stat"><span>{t.insightOverheadLabel}</span><strong>+{num(analysis.overhead)}</strong></div><div className="insight-stat"><span>{t.insightMaxChunkLabel}</span><strong>{num(analysis.maxChunk)}</strong></div><small className="method-note">{t.methodNote}</small></article>
        </div>
        {analysis.rows.length > 0 && <div className="source-table-wrap"><table><thead><tr><th>{t.tableSource}</th><th>{t.tableFormat}</th><th>{t.tableTokens}</th><th>{t.tableWords}</th><th>{t.tableChunks}</th><th>{t.tableAvgChunk}</th></tr></thead><tbody>{analysis.rows.map((row) => <tr key={`table-${row.id}`}><td><span className="source-name">{row.name}</span><small>{formatBytes(row.size, t.pastedText)}</small></td><td><span className="format-tag">{row.extension}</span></td><td>{num(row.tokens)}</td><td>{num(row.words)}</td><td>{num(row.chunks)}</td><td>{num(row.chunks ? row.chunkTotal / row.chunks : 0)}</td></tr>)}</tbody></table></div>}
      </section>

      {/* Educational Guide Section */}
      <section className="learn-section" id="learn-more">
        <div className="learn-header">
          <span className="eyebrow">{t.learnEyebrow}</span>
          <h2>{t.learnTitle}</h2>
          <p>{t.learnSubtitle}</p>
        </div>

        {/* Ingestion Pipeline */}
        <div className="pipeline-card">
          <div className="pipeline-title">
            <Cpu size={19} />
            <h3>{t.learnPipelineTitle}</h3>
          </div>
          <div className="pipeline-steps">
            <div className="pipeline-step">
              <div className="step-badge">01</div>
              <strong>{t.learnStep1}</strong>
              <p>{t.learnStep1Desc}</p>
            </div>
            <div className="pipeline-divider" aria-hidden="true"><ArrowRight size={18} /></div>
            <div className="pipeline-step">
              <div className="step-badge">02</div>
              <strong>{t.learnStep2}</strong>
              <p>{t.learnStep2Desc}</p>
            </div>
            <div className="pipeline-divider" aria-hidden="true"><ArrowRight size={18} /></div>
            <div className="pipeline-step">
              <div className="step-badge">03</div>
              <strong>{t.learnStep3}</strong>
              <p>{t.learnStep3Desc}</p>
            </div>
            <div className="pipeline-divider" aria-hidden="true"><ArrowRight size={18} /></div>
            <div className="pipeline-step">
              <div className="step-badge">04</div>
              <strong>{t.learnStep4}</strong>
              <p>{t.learnStep4Desc}</p>
            </div>
          </div>
        </div>

        {/* 4 Core Concept Cards */}
        <div className="learn-grid">
          <article className="learn-card">
            <div className="learn-card-header">
              <span className="learn-icon"><Layers size={20} /></span>
              <span className="learn-tag">{t.learnConcept1Tag}</span>
            </div>
            <h3>{t.learnConcept1Title}</h3>
            <p>{t.learnConcept1Body}</p>
            <div className="visual-code-preview">
              <code>"Base de conhecimento" → [0.038, -0.192, 0.441, ..., 0.082]</code>
            </div>
          </article>

          <article className="learn-card">
            <div className="learn-card-header">
              <span className="learn-icon"><Split size={20} /></span>
              <span className="learn-tag">{t.learnConcept2Tag}</span>
            </div>
            <h3>{t.learnConcept2Title}</h3>
            <p>{t.learnConcept2Body}</p>
            <div className="visual-split-preview">
              <div className="chunk-preview-row">
                <span className="chunk-box chunk-a">Chunk #1 ({chunkSize} tokens)</span>
                <span className="chunk-overlap-indicator">Overlap ({overlap} tokens)</span>
                <span className="chunk-box chunk-b">Chunk #2 ({chunkSize} tokens)</span>
              </div>
            </div>
          </article>

          <article className="learn-card">
            <div className="learn-card-header">
              <span className="learn-icon"><BookOpen size={20} /></span>
              <span className="learn-tag">{t.learnConcept3Tag}</span>
            </div>
            <h3>{t.learnConcept3Title}</h3>
            <p>{t.learnConcept3Body}</p>
            <ul className="learn-list">
              <li><strong>{t.learnStratRecursive.split(":")[0]}:</strong>{t.learnStratRecursive.slice(t.learnStratRecursive.indexOf(":") + 1)}</li>
              <li><strong>{t.learnStratParagraph.split(":")[0]}:</strong>{t.learnStratParagraph.slice(t.learnStratParagraph.indexOf(":") + 1)}</li>
              <li><strong>{t.learnStratMarkdown.split(":")[0]}:</strong>{t.learnStratMarkdown.slice(t.learnStratMarkdown.indexOf(":") + 1)}</li>
            </ul>
          </article>

          <article className="learn-card">
            <div className="learn-card-header">
              <span className="learn-icon"><Network size={20} /></span>
              <span className="learn-tag">{t.learnConcept4Tag}</span>
            </div>
            <h3>{t.learnConcept4Title}</h3>
            <p>{t.learnConcept4Body}</p>
            <div className="overlap-diagram">
              <div className="overlap-bar bar-1"><span>Chunk N [ …texto final ]</span></div>
              <div className="overlap-highlight"><span>{overlap} tokens compartilhados</span></div>
              <div className="overlap-bar bar-2"><span>[ texto repetido… ] Chunk N+1</span></div>
            </div>
          </article>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M7 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H7" stroke="var(--brand-green)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M17 6H19C20.1046 6 21 6.89543 21 8V16C21 17.1046 20.1046 18 19 18H17" stroke="var(--brand-green)" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3.2" fill="var(--brand-green)" />
            </svg>
          </span>
          <div className="brand-text">
            <span className="brand-title">Token<span>Lab</span></span>
            <span className="brand-subtitle">{t.scientataSubtitle}</span>
          </div>
        </div>
        <div className="footer-center">
          <p>{t.footerNote}</p>
          <a className="footer-credit" href={SCIENTATA_URL} target="_blank" rel="noopener noreferrer">{t.footerCredit}</a>
        </div>
        <span>{t.footerFilesNote}</span>
      </footer>

      <a className="coffee-fab" href={COFFEE_URL} target="_blank" rel="noopener noreferrer" aria-label={t.coffeeLabel} title={t.coffeeLabel}>
        <span className="coffee-fab-icon"><Coffee size={22} /></span>
        <span className="coffee-fab-text">{t.coffeeLabel}</span>
      </a>
    </main>
  );
}
