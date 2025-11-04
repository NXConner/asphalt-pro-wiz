import { Trash2, UploadCloud, FileText, ImageIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  listFiles,
  listDocs,
  makeJobKey,
  saveDoc,
  saveFile,
  type SavedDoc,
  type SavedFile,
  deleteFile,
  deleteDoc,
} from '@/lib/idb';

interface UploadsPanelProps {
  jobName: string;
  customerAddress: string;
}

export function UploadsPanel({ jobName, customerAddress }: UploadsPanelProps) {
  const [files, setFiles] = useState<SavedFile[]>([]);
  const [docs, setDocs] = useState<SavedDoc[]>([]);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const jobKey = makeJobKey(jobName, customerAddress);

  const refresh = async () => {
    const [f, d] = await Promise.all([listFiles(jobKey), listDocs(jobKey)]);
    setFiles(f);
    setDocs(d);
  };

  useEffect(() => {
    refresh();
    // refresh is stable within component scope
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobKey]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    for (const f of Array.from(selected)) {
      await saveFile(jobKey, f);
    }
    await refresh();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateDoc = async () => {
    if (!docTitle.trim()) return;
    await saveDoc(jobKey, docTitle.trim(), { content: docContent });
    setDocTitle('');
    setDocContent('');
    await refresh();
  };

  const handleDeleteFile = async (id: string) => {
    await deleteFile(id);
    await refresh();
  };

  const handleDeleteDoc = async (id: string) => {
    await deleteDoc(id);
    await refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Files & Documents</CardTitle>
        <CardDescription>
          Upload images and files, and create/edit internal documents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Upload Files (images, pdf, docx, xlsx, etc.)</Label>
          <div className="flex items-center gap-2">
            <Input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
              onChange={handleUpload}
            />
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            {files.map((f) => (
              <div key={f.id} className="p-3 border rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {f.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]" title={f.name}>
                      {f.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(f.size / 1024).toFixed(1)} KB • {new Date(f.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    className="text-primary text-sm underline"
                    href={URL.createObjectURL(f.blob)}
                    download={f.name}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteFile(f.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Create Internal Document (for records)</Label>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <Input
              aria-label="Document Title"
              className="md:col-span-2"
              placeholder="Title (e.g., Contract, Progress Report)"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
            />
            <Input
              aria-label="Document Notes"
              className="md:col-span-3"
              placeholder="Notes / Content (quick text)"
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateDoc} className="mt-2">
            Save Document
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            {docs.map((d) => (
              <div key={d.id} className="p-3 border rounded-md flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{d.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(d.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    className="text-primary text-sm underline"
                    href={`data:application/json,${encodeURIComponent(JSON.stringify(d.data))}`}
                    download={`${d.title}.json`}
                  >
                    Export JSON
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteDoc(d.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
