import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, UploadCloud, Trash2, ScanText, Download, Filter, RefreshCw } from "lucide-react";
import {
  listReceipts,
  saveReceipt,
  deleteReceipt,
  updateReceiptMeta,
  makeJobKey,
  type SavedReceipt,
  type ReceiptCategory,
} from "@/lib/idb";
import { analyzeImage } from "@/lib/gemini";
import { logEvent, logError } from "@/lib/logging";

export type ReceiptsPanelProps = {
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

function tryParseJson(text: string): any | null {
  try {
    const match = text.match(/\{[\s\S]*\}$/m);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function toBase64(blob: Blob): Promise<string> {
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

function formatCurrency(n?: number | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

export function ReceiptsPanel({ jobName = "", customerAddress = "" }: ReceiptsPanelProps) {
  const [receipts, setReceipts] = useState<SavedReceipt[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<ReceiptCategory | "All">("All");
  const [vendorQuery, setVendorQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [autoExtract, setAutoExtract] = useState(true);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const jobKey = useMemo(() => makeJobKey(jobName, customerAddress), [jobName, customerAddress]);

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
    void refresh();
  }, [categoryFilter, vendorQuery, startDate, endDate]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || !selected.length) return;
    const files = Array.from(selected);
    let uploaded = 0;
    for (const f of files) {
      try {
        const isSealMaster = f.name.toLowerCase().includes("sealmaster");
        const saved = await saveReceipt(f, {
          vendor: isSealMaster ? "SealMaster" : "",
          category: (isSealMaster ? "SealMaster" : "Other") as ReceiptCategory,
          jobKey,
          date: new Date().toISOString().slice(0, 10),
        });
        uploaded += 1;
        if (autoExtract) {
          await extractWithAI(saved);
        }
      } catch (error) {
        logError(error, { name: f.name });
      }
    }
    toast.success(`Uploaded ${uploaded} receipt${uploaded !== 1 ? "s" : ""}`);
    if (fileInputRef.current) fileInputRef.current.value = "";
    await refresh();
  };

  const extractWithAI = async (r: SavedReceipt) => {
    if (!r.type.startsWith("image/")) {
      toast.info("AI extraction supports images only");
      return;
    }
    try {
      setBusyIds((s) => ({ ...s, [r.id]: true }));
      const base64 = await toBase64(r.blob);
      const prompt =
        "Extract receipt details and return ONLY compact JSON with keys vendor,date (YYYY-MM-DD), subtotal, tax, total, paymentMethod, notes, suggestedCategory. If unknown, use null.";
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
      toast.error("AI extraction failed");
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
      "jobKey",
      "notes",
    ];
    const lines = [headers.join(",")];
    for (const r of receipts) {
      const row = [
        r.id,
        r.date,
        (r.vendor || "").replaceAll(",", " "),
        r.category,
        (r.subtotal ?? "").toString(),
        (r.tax ?? "").toString(),
        (r.total ?? "").toString(),
        (r.paymentMethod ?? "").toString(),
        (r.jobKey ?? "").toString(),
        (r.notes ?? "").replaceAll("\n", " ").replaceAll(",", " "),
      ];
      lines.push(row.map((x) => `"${x}"`).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipts_${new Date().toISOString().slice(0, 10)}.csv`;
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
        <CardDescription>Upload images/PDFs (SealMaster, fuel, payroll, materials, etc.). Auto-extract totals with AI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
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
                  {RECEIPT_CATEGORIES.map((c) => (
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
            <Button type="button" variant="outline" onClick={() => { setVendorQuery(""); setCategoryFilter("All"); setStartDate(""); setEndDate(""); }}>
              <Filter className="w-4 h-4 mr-2" /> Clear
            </Button>
            <Button type="button" variant="outline" onClick={refresh}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button type="button" variant="secondary" onClick={exportCsv}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
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
        </div>

        <div className="bg-muted p-3 rounded-md flex items-center justify-between text-sm">
          <div>Filtered total: <strong>{formatCurrency(totals.sum)}</strong></div>
          {jobName && <div>Job: <strong>{jobName}</strong></div>}
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
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium truncate max-w-[220px]" title={r.name}>{r.vendor || "(Vendor)"} • {r.category}</div>
                      <div className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
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
                      <a
                        className="text-primary text-sm underline"
                        href={URL.createObjectURL(r.blob)}
                        download={r.name}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View/Download
                      </a>
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(r.id)} className="text-destructive ml-auto">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Amount: <strong>{formatCurrency(typeof r.total === "number" ? r.total : (typeof r.subtotal === "number" ? r.subtotal + (r.tax || 0) : null))}</strong>
                    </div>
                  </div>
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
