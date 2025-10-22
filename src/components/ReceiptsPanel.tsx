import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, ImageIcon, Trash2, UploadCloud, Download, Wand2, Filter } from "lucide-react";
import {
  listReceipts,
  saveReceipt,
  deleteReceipt,
  updateReceiptMeta,
  type SavedReceipt,
  type ReceiptCategory,
  type ReceiptFilters,
  makeJobKey,
} from "@/lib/idb";
import { analyzeImage } from "@/lib/gemini";
import { logEvent, logError } from "@/lib/logging";

interface ReceiptsPanelProps {
  jobName?: string;
  customerAddress?: string;
}

type EditableReceipt = SavedReceipt & { isEditing?: boolean };

const CATEGORIES: ReceiptCategory[] = [
  "SealMaster",
  "Fuel",
  "Payroll",
  "Parts",
  "Equipment",
  "Tools",
  "Materials",
  "Supplies",
  "Entertainment",
  "Meals",
  "Lodging",
  "Travel",
  "Permits",
  "Insurance",
  "Utilities",
  "Marketing",
  "Office",
  "Other",
];

export function ReceiptsPanel({ jobName = "", customerAddress = "" }: ReceiptsPanelProps) {
  const [receipts, setReceipts] = useState<EditableReceipt[]>([]);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [filters, setFilters] = useState<ReceiptFilters>({ category: "All" });
  const [vendorQuery, setVendorQuery] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<ReceiptCategory | "All">("All");

  const jobKey = useMemo(() => makeJobKey(jobName, customerAddress), [jobName, customerAddress]);

  const refresh = async () => {
    const list = await listReceipts({
      category: categoryFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      vendorQuery: vendorQuery || undefined,
    });
    setReceipts(list);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, startDate, endDate, vendorQuery]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    const filesArray = Array.from(selectedFiles);
    let uploadedCount = 0;
    for (const selectedFile of filesArray) {
      try {
        await saveReceipt(selectedFile, {
          category: inferCategoryFromFileName(selectedFile.name),
          vendor: "",
          date: new Date().toISOString().slice(0, 10),
          jobKey,
        });
        uploadedCount += 1;
      } catch (error) {
        logError(error, { name: selectedFile.name });
      }
    }
    toast.success(`Uploaded ${uploadedCount} receipt${uploadedCount !== 1 ? "s" : ""}`);
    if (fileInputRef.current) fileInputRef.current.value = "";
    await refresh();
  };

  const inferCategoryFromFileName = (name: string): ReceiptCategory => {
    const lower = name.toLowerCase();
    if (lower.includes("sealmaster")) return "SealMaster";
    if (lower.includes("fuel") || lower.includes("gas")) return "Fuel";
    if (lower.includes("hotel") || lower.includes("lodge") || lower.includes("motel")) return "Lodging";
    if (lower.includes("meal") || lower.includes("restaurant")) return "Meals";
    if (lower.includes("permit")) return "Permits";
    if (lower.includes("insurance")) return "Insurance";
    return "Other";
  };

  const setBusy = (id: string, value: boolean) => setBusyIds((prev) => ({ ...prev, [id]: value }));

  const analyzeWithAI = async (receipt: SavedReceipt) => {
    if (!receipt.type.startsWith("image/")) {
      toast.info("AI extraction supports images only");
      return;
    }
    setBusy(receipt.id, true);
    try {
      const base64 = await blobToBase64(receipt.blob);
      const prompt = `You are extracting receipt fields. Return a strict JSON object with keys: vendor, date (YYYY-MM-DD), subtotal, tax, total, paymentMethod, category, notes. Keep numbers as plain numbers. If unknown use null. Example: {"vendor":"SealMaster","date":"2025-05-10","subtotal":120.45,"tax":6.02,"total":126.47,"paymentMethod":"Visa","category":"Materials","notes":"2 drums sealer"}`;
      const text = await analyzeImage(base64, receipt.type, prompt);
      const json = safeParseFirstJsonObject(text);
      if (!json) {
        toast.error("AI did not return valid JSON");
        return;
      }
      const updates = {
        vendor: (json.vendor || "").toString(),
        date: (json.date || receipt.date).toString(),
        subtotal: json.subtotal ?? null,
        tax: json.tax ?? null,
        total: json.total ?? null,
        paymentMethod: json.paymentMethod ?? null,
        category: (json.category as ReceiptCategory) || receipt.category,
        notes: json.notes ?? null,
        ocrText: text,
      } as const;
      await updateReceiptMeta(receipt.id, updates);
      toast.success("Receipt details extracted");
      logEvent("receipts.ai_extracted", { id: receipt.id, vendor: updates.vendor });
      await refresh();
    } catch (error) {
      logError(error, { id: receipt.id });
      toast.error("AI extraction failed");
    } finally {
      setBusy(receipt.id, false);
    }
  };

  const onDelete = async (id: string) => {
    await deleteReceipt(id);
    await refresh();
  };

  const startEdit = (id: string) => setReceipts((prev) => prev.map((r) => (r.id === id ? { ...r, isEditing: true } : r)));
  const cancelEdit = (id: string) => setReceipts((prev) => prev.map((r) => (r.id === id ? { ...r, isEditing: false } : r)));

  const saveEdit = async (r: EditableReceipt) => {
    await updateReceiptMeta(r.id, {
      vendor: r.vendor,
      date: r.date,
      subtotal: normalizeNumber(r.subtotal),
      tax: normalizeNumber(r.tax),
      total: normalizeNumber(r.total),
      paymentMethod: r.paymentMethod || null,
      category: r.category,
      notes: r.notes || null,
      jobKey: r.jobKey || null,
    });
    toast.success("Saved");
    await refresh();
  };

  const filteredTotal = useMemo(() => receipts.reduce((sum, r) => sum + (Number(r.total) || 0), 0), [receipts]);

  const exportCsv = () => {
    const headers = [
      "id",
      "date",
      "vendor",
      "category",
      "subtotal",
      "tax",
      "total",
      "paymentMethod",
      "jobKey",
      "notes",
    ];
    const rows = receipts.map((r) => [
      r.id,
      r.date,
      r.vendor,
      r.category,
      safeMoney(r.subtotal),
      safeMoney(r.tax),
      safeMoney(r.total),
      r.paymentMethod || "",
      r.jobKey || "",
      (r.notes || "").replace(/\n/g, " "),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receipts & Expenses</CardTitle>
        <CardDescription>Upload, categorize, and OCR receipts from SealMaster and other vendors.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Upload Receipts (images, PDF)</Label>
          <div className="flex items-center gap-2">
            <Input ref={fileInputRef} type="file" multiple accept="image/*,application/pdf" onChange={onUpload} />
            <UploadCloud className="w-5 h-5" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
          <div className="md:col-span-2">
            <Label className="flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Vendor contains..." value={vendorQuery} onChange={(e) => setVendorQuery(e.target.value)} />
              <Select value={categoryFilter} onValueChange={(v: any) => setCategoryFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Start Date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>End Date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => { setVendorQuery(""); setCategoryFilter("All"); setStartDate(""); setEndDate(""); }}>Clear</Button>
            <Button type="button" variant="secondary" onClick={exportCsv}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
          </div>
        </div>

        <div className="bg-muted p-3 rounded-md flex items-center justify-between">
          <div className="text-sm">Filtered total: <strong>${filteredTotal.toFixed(2)}</strong></div>
          {jobName && <div className="text-sm">Job: <strong>{jobName}</strong></div>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {receipts.map((r) => (
            <div key={r.id} className="p-3 border rounded-md">
              <div className="flex items-start gap-3">
                {r.type.startsWith("image/") ? (
                  <img src={URL.createObjectURL(r.blob)} alt={r.name} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-muted rounded"><FileText className="w-6 h-6" /></div>
                )}
                <div className="flex-1 min-w-0">
                  {r.isEditing ? (
                    <EditableFields receipt={r} onChange={(next) => setReceipts((prev) => prev.map((it) => (it.id === r.id ? next : it)))} />
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate" title={r.name}>{r.vendor || "(Vendor)"} • {r.category}</p>
                        <p className="text-xs text-muted-foreground">{r.date}</p>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold mr-2">${safeMoney(r.total)}</span>
                        <span className="text-muted-foreground">{r.paymentMethod || ""}</span>
                      </div>
                      {r.notes && <p className="text-xs text-muted-foreground line-clamp-2">{r.notes}</p>}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 justify-end">
                {!r.isEditing && r.type.startsWith("image/") && (
                  <Button type="button" variant="secondary" size="sm" onClick={() => analyzeWithAI(r)} disabled={!!busyIds[r.id]}>
                    <Wand2 className="w-4 h-4 mr-1" /> {busyIds[r.id] ? "Analyzing..." : "Extract"}
                  </Button>
                )}
                {r.isEditing ? (
                  <>
                    <Button type="button" size="sm" onClick={() => saveEdit(r)}>Save</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => cancelEdit(r.id)}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <a
                      className="text-sm underline px-2 py-1"
                      href={URL.createObjectURL(r.blob)}
                      download={r.name}
                      target="_blank"
                      rel="noreferrer"
                    >Download</a>
                    <Button type="button" variant="outline" size="sm" onClick={() => startEdit(r.id)}>Edit</Button>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(r.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EditableFields({ receipt, onChange }: { receipt: EditableReceipt; onChange: (r: EditableReceipt) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
      <div className="md:col-span-2">
        <Label>Vendor</Label>
        <Input value={receipt.vendor} onChange={(e) => onChange({ ...receipt, vendor: e.target.value })} />
      </div>
      <div>
        <Label>Date</Label>
        <Input type="date" value={receipt.date} onChange={(e) => onChange({ ...receipt, date: e.target.value })} />
      </div>
      <div>
        <Label>Category</Label>
        <Select value={receipt.category} onValueChange={(v: any) => onChange({ ...receipt, category: v })}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Subtotal</Label>
        <Input type="number" step="0.01" value={receipt.subtotal ?? ""} onChange={(e) => onChange({ ...receipt, subtotal: toNumberOrNull(e.target.value) })} />
      </div>
      <div>
        <Label>Tax</Label>
        <Input type="number" step="0.01" value={receipt.tax ?? ""} onChange={(e) => onChange({ ...receipt, tax: toNumberOrNull(e.target.value) })} />
      </div>
      <div>
        <Label>Total</Label>
        <Input type="number" step="0.01" value={receipt.total ?? ""} onChange={(e) => onChange({ ...receipt, total: toNumberOrNull(e.target.value) })} />
      </div>
      <div>
        <Label>Payment</Label>
        <Input value={receipt.paymentMethod ?? ""} onChange={(e) => onChange({ ...receipt, paymentMethod: e.target.value })} />
      </div>
      <div className="md:col-span-3">
        <Label>Notes</Label>
        <Input value={receipt.notes ?? ""} onChange={(e) => onChange({ ...receipt, notes: e.target.value })} placeholder="e.g., 2 drums, squeegee tips, hoses" />
      </div>
    </div>
  );
}

function safeParseFirstJsonObject(text: string): any | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = (reader.result as string) || "";
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function csvEscape(field: string | number | null | undefined): string {
  const s = field == null ? "" : String(field);
  const needsQuotes = /[",\n]/.test(s);
  const out = s.replace(/"/g, '""');
  return needsQuotes ? `"${out}"` : out;
}

function safeMoney(value: number | null | undefined): string {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : "";
}

function toNumberOrNull(v: string): number | null {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeNumber(v: number | null | undefined): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default ReceiptsPanel;

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { makeJobKey, type SavedReceipt, type ReceiptCategory, saveReceipt, listReceipts, deleteReceipt, updateReceiptMeta } from "@/lib/idb";
import { analyzeImage } from "@/lib/gemini";
import { logEvent, logError } from "@/lib/logging";
import { Trash2, UploadCloud, FileText, ScanText, Download, Filter, RefreshCw } from "lucide-react";

type Props = {
  jobName?: string;
  customerAddress?: string;
};

const RECEIPT_CATEGORIES: ReceiptCategory[] = [
  "SealMaster",
  "Fuel",
  "Payroll",
  "Parts",
  "Equipment",
  "Tools",
  "Materials",
  "Supplies",
  "Entertainment",
  "Meals",
  "Lodging",
  "Travel",
  "Permits",
  "Insurance",
  "Utilities",
  "Marketing",
  "Office",
  "Other",
];

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = (reader.result as string) || "";
      const b64 = res.includes(",") ? res.split(",")[1] : res;
      resolve(b64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function tryParseJson(text: string): any | null {
  try {
    const match = text.match(/\{[\s\S]*\}$/m);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function formatCurrency(n?: number | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

export function ReceiptsPanel({ jobName = "", customerAddress = "" }: Props) {
  const [receipts, setReceipts] = useState<SavedReceipt[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<ReceiptCategory | "All">("All");
  const [vendorQuery, setVendorQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [autoExtract, setAutoExtract] = useState(true);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});

  const jobKey = useMemo(() => makeJobKey(jobName, customerAddress), [jobName, customerAddress]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refresh = async () => {
    const items = await listReceipts({
      category: categoryFilter,
      vendorQuery,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    setReceipts(items);
  };

  useEffect(() => {
    refresh();
  }, [categoryFilter, vendorQuery, startDate, endDate]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || !selected.length) return;
    const files = Array.from(selected);
    for (const f of files) {
      const metaVendor = f.name.toLowerCase().includes("sealmaster") ? "SealMaster" : "";
      const metaCategory: ReceiptCategory = f.name.toLowerCase().includes("sealmaster") ? "SealMaster" : "Other";
      const saved = await saveReceipt(f, {
        vendor: metaVendor,
        category: metaCategory,
        jobKey,
      });
      if (autoExtract) {
        await extractWithAI(saved);
      }
    }
    await refresh();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const extractWithAI = async (r: SavedReceipt) => {
    try {
      setBusyIds((s) => ({ ...s, [r.id]: true }));
      const base64 = await toBase64(r.blob);
      const prompt =
        "Extract receipt details and return ONLY compact JSON with keys vendor,date (YYYY-MM-DD), subtotal, tax, total, paymentMethod, notes, suggestedCategory. If unknown, use null. Example: {\\\"vendor\\\":\\\"SealMaster\\\",\\\"date\\\":\\\"2025-05-10\\\",\\\"subtotal\\\":120.50,\\\"tax\\\":6.02,\\\"total\\\":126.52,\\\"paymentMethod\\\":\\\"Visa\\\",\\\"notes\\\":\\\"emulsion\\\",\\\"suggestedCategory\\\":\\\"Materials\\\"}";
      const text = await analyzeImage(base64, r.type || "image/png", prompt);
      const data = tryParseJson(text) || {};
      const normalizedDate = typeof data.date === "string" && data.date.length >= 10 ? data.date.slice(0, 10) : r.date;
      let nextCategory: ReceiptCategory | undefined;
      const suggested = (data.suggestedCategory || data.category || "").toString().toLowerCase();
      for (const c of RECEIPT_CATEGORIES) {
        if (c.toLowerCase() === suggested) nextCategory = c;
      }
      if (!nextCategory) {
        const v = (data.vendor || r.vendor).toString().toLowerCase();
        if (v.includes("sealmaster")) nextCategory = "SealMaster";
        else if (v.includes("bp") || v.includes("shell") || v.includes("exxon") || v.includes("fuel")) nextCategory = "Fuel";
      }
      await updateReceiptMeta(r.id, {
        vendor: (data.vendor || r.vendor || "").toString(),
        date: normalizedDate,
        subtotal: typeof data.subtotal === "number" ? data.subtotal : r.subtotal ?? null,
        tax: typeof data.tax === "number" ? data.tax : r.tax ?? null,
        total: typeof data.total === "number" ? data.total : r.total ?? null,
        paymentMethod: data.paymentMethod ? String(data.paymentMethod) : r.paymentMethod ?? null,
        notes: data.notes ? String(data.notes) : r.notes ?? null,
        ocrText: text,
        category: nextCategory || r.category,
      });
      logEvent("receipts.ocr_extracted", { id: r.id });
      await refresh();
    } catch (e) {
      logError(e, { id: r.id });
    } finally {
      setBusyIds((s) => ({ ...s, [r.id]: false }));
    }
  };

  const remove = async (id: string) => {
    await deleteReceipt(id);
    await refresh();
  };

  const updateMeta = async (id: string, updates: Partial<SavedReceipt>) => {
    await updateReceiptMeta(id, updates);
    await refresh();
  };

  const exportCsv = () => {
    const headers = [
      "id",
      "date",
      "vendor",
      "category",
      "subtotal",
      "tax",
      "total",
      "paymentMethod",
      "notes",
    ];
    const lines = [headers.join(",")];
    for (const r of receipts) {
      const row = [
        r.id,
        r.date,
        r.vendor.replaceAll(",", " "),
        r.category,
        (r.subtotal ?? "").toString(),
        (r.tax ?? "").toString(),
        (r.total ?? "").toString(),
        (r.paymentMethod ?? "").toString(),
        (r.notes ?? "").replaceAll("\n", " ").replaceAll(",", " "),
      ];
      lines.push(row.map((x) => `"${x}"`).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipts_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totals = useMemo(() => {
    let sum = 0;
    const byCategory = new Map<string, number>();
    for (const r of receipts) {
      const v = typeof r.total === "number" ? r.total : (typeof r.subtotal === "number" ? (r.subtotal + (r.tax || 0)) : 0);
      sum += v;
      byCategory.set(r.category, (byCategory.get(r.category) || 0) + v);
    }
    return { sum, byCategory };
  }, [receipts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receipts & Expenses</CardTitle>
        <CardDescription>Upload images/PDFs of receipts (SealMaster, fuel, payroll, parts, tools, materials, entertainment, etc.). Auto-extract totals with AI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <Label>Upload Receipts</Label>
            <div className="flex items-center gap-2">
              <Input ref={fileInputRef} type="file" multiple accept="image/*,application/pdf" onChange={handleUpload} />
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
              <input id="autoExtract" type="checkbox" className="mr-1" checked={autoExtract} onChange={(e) => setAutoExtract(e.target.checked)} />
              <Label htmlFor="autoExtract">Auto-extract on upload</Label>
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={categoryFilter} onValueChange={(v: any) => setCategoryFilter(v)}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {RECEIPT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Vendor</Label>
            <Input placeholder="e.g., SealMaster" value={vendorQuery} onChange={(e) => setVendorQuery(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>End</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => { setCategoryFilter("All"); setVendorQuery(""); setStartDate(""); setEndDate(""); }}>
            <Filter className="w-4 h-4 mr-2" /> Clear Filters
          </Button>
          <Button type="button" variant="outline" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button type="button" onClick={exportCsv} className="ml-auto">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>

        <div className="bg-muted p-3 rounded-md text-sm">
          <div className="font-medium">Totals</div>
          <div className="flex flex-wrap gap-4 items-center">
            <div><span className="text-muted-foreground">All:</span> <strong>{formatCurrency(totals.sum)}</strong></div>
            {[...totals.byCategory.entries()].slice(0, 6).map(([cat, v]) => (
              <div key={cat}><span className="text-muted-foreground">{cat}:</span> <strong>{formatCurrency(v)}</strong></div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {receipts.map((r) => {
            const isImage = r.type.startsWith("image/");
            return (
              <div key={r.id} className="p-3 border rounded-md">
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 bg-muted rounded overflow-hidden flex items-center justify-center">
                    {isImage ? (
                      // eslint-disable-next-line jsx-a11y/alt-text
                      <img src={URL.createObjectURL(r.blob)} className="object-cover w-full h-full" />
                    ) : (
                      <FileText className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium truncate max-w-[220px]" title={r.name}>{r.name}</div>
                      <div className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Vendor</Label>
                        <Input value={r.vendor} onChange={(e) => updateMeta(r.id, { vendor: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">Date</Label>
                        <Input type="date" value={r.date} onChange={(e) => updateMeta(r.id, { date: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">Category</Label>
                        <Select value={r.category} onValueChange={(v: any) => updateMeta(r.id, { category: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RECEIPT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Payment</Label>
                        <Input value={r.paymentMethod || ""} onChange={(e) => updateMeta(r.id, { paymentMethod: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">Subtotal</Label>
                        <Input type="number" step="0.01" value={r.subtotal ?? ""} onChange={(e) => updateMeta(r.id, { subtotal: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <Label className="text-xs">Tax</Label>
                        <Input type="number" step="0.01" value={r.tax ?? ""} onChange={(e) => updateMeta(r.id, { tax: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <Label className="text-xs">Total</Label>
                        <Input type="number" step="0.01" value={r.total ?? ""} onChange={(e) => updateMeta(r.id, { total: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Notes</Label>
                        <Input value={r.notes || ""} onChange={(e) => updateMeta(r.id, { notes: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => extractWithAI(r)} disabled={!!busyIds[r.id]}>
                        <ScanText className="w-4 h-4 mr-2" /> {busyIds[r.id] ? "Extracting..." : "Extract with AI"}
                      </Button>
                      {isImage ? (
                        <a
                          className="text-primary text-sm underline"
                          href={URL.createObjectURL(r.blob)}
                          download={r.name}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View/Download
                        </a>
                      ) : (
                        <a
                          className="text-primary text-sm underline"
                          href={URL.createObjectURL(r.blob)}
                          download={r.name}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </a>
                      )}
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(r.id)} className="text-destructive ml-auto">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Amount: <strong>{formatCurrency(typeof r.total === "number" ? r.total : (typeof r.subtotal === "number" ? r.subtotal + (r.tax || 0) : null))}</strong>
                </div>
              </div>
            );
          })}
        </div>

        {receipts.length === 0 && (
          <div className="text-sm text-muted-foreground">No receipts yet. Upload images or PDFs to begin tracking expenses.</div>
        )}
      </CardContent>
    </Card>
  );
}

export default ReceiptsPanel;
