import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UploadsPanel } from '@/components/UploadsPanel';

// IndexedDB isn't available in jsdom by default; provide a minimal stub.
// These tests focus on UI wiring and calling into idb helpers rather than browser storage itself.
vi.mock('@/lib/idb', async () => {
  const actual = await vi.importActual<any>('@/lib/idb');
  return {
    ...actual,
    listFiles: vi.fn().mockResolvedValue([]),
    listDocs: vi.fn().mockResolvedValue([]),
    saveFile: vi.fn().mockResolvedValue({ id: 'k:1:file.png', jobKey: 'k', name: 'file.png', type: 'image/png', size: 123, createdAt: Date.now(), blob: new Blob() }),
    saveDoc: vi.fn().mockResolvedValue({ id: 'k:doc:1', jobKey: 'k', title: 'T', createdAt: Date.now(), data: {} }),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    deleteDoc: vi.fn().mockResolvedValue(undefined),
    makeJobKey: vi.fn().mockReturnValue('k'),
  };
});

import * as idb from '@/lib/idb';

describe('UploadsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and uploads a file', async () => {
    render(<UploadsPanel jobName="J" customerAddress="A" />);

    const input = screen.getByLabelText('Upload Files (images, pdf, docx, xlsx, etc.)');
    const file = new File([new Uint8Array([1,2,3])], 'photo.png', { type: 'image/png' });
    // fireEvent.change supports setting files via target property
    await waitFor(() => fireEvent.change(input, { target: { files: [file] } }));

    // After upload, listFiles is called to refresh
    await waitFor(() => expect(idb.listFiles).toHaveBeenCalled());
  });

  it('creates a document record', async () => {
    render(<UploadsPanel jobName="J" customerAddress="A" />);

    fireEvent.change(screen.getAllByPlaceholderText('Title (e.g., Contract, Progress Report)')[0], { target: { value: 'My Doc' } });
    fireEvent.change(screen.getAllByPlaceholderText('Notes / Content (quick text)')[0], { target: { value: 'Hi' } });
    fireEvent.click(screen.getAllByText('Save Document')[0]);

    await waitFor(() => expect(idb.saveDoc).toHaveBeenCalled());
  });
});
