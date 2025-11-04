import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { analyzeImage, generateChat } from '@/lib/gemini';
import { retrieveRelevantContext } from '@/lib/rag';

export function AIGemini() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [imageResult, setImageResult] = useState('');

  const ask = async () => {
    setBusy(true);
    try {
      const ragContext = await retrieveRelevantContext(question);
      const system = 'You are an asphalt maintenance expert. Be concise.';
      const context = ragContext ? `${system}\n\nContext:\n${ragContext}` : system;
      const res = await generateChat(question, context);
      setAnswer(res);
    } catch (e: any) {
      setAnswer(e?.message || 'Error');
    } finally {
      setBusy(false);
    }
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const base64 = await toBase64(file);
      const res = await analyzeImage(
        base64,
        file.type,
        'Analyze asphalt condition, cracks (length/width), patching needs, and estimated affected area in sq ft. Return a concise list with numeric estimates.',
      );
      setImageResult(res);
    } catch (e: any) {
      setImageResult(e?.message || 'Error');
    } finally {
      setBusy(false);
      e.currentTarget.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Assistant (Gemini)</CardTitle>
        <CardDescription>Ask domain questions or upload site images for analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-start">
          <Textarea
            className="md:col-span-4"
            rows={3}
            placeholder="Ask about materials, coverage, crack repair, scheduling, etc."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button className="md:col-span-1" onClick={ask} disabled={busy || !question.trim()}>
            Ask
          </Button>
        </div>
        {answer && (
          <div className="p-3 border rounded-md whitespace-pre-wrap text-sm bg-muted">{answer}</div>
        )}

        <div className="space-y-2">
          <label htmlFor="ai-image" className="text-sm font-medium">
            Image Analysis
          </label>
          <Input id="ai-image" type="file" accept="image/*" onChange={handleImage} />
          {imageResult && (
            <div className="p-3 border rounded-md whitespace-pre-wrap text-sm bg-muted">
              {imageResult}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] || '');
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
