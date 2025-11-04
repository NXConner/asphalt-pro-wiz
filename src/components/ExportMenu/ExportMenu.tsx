import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileText, Table } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportMenuProps {
  data: any;
  filename?: string;
}

/**
 * Export menu for downloading data in various formats
 */
export function ExportMenu({ data, filename = 'export' }: ExportMenuProps) {
  const exportAsJSON = () => {
    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      downloadBlob(blob, `${filename}.json`);
      toast.success('Exported as JSON');
    } catch (error) {
      toast.error('Failed to export JSON');
    }
  };

  const exportAsCSV = () => {
    try {
      // Convert object/array to CSV
      let csvContent = '';

      if (Array.isArray(data)) {
        if (data.length === 0) {
          toast.error('No data to export');
          return;
        }

        // Get headers from first item
        const headers = Object.keys(data[0]);
        csvContent = headers.join(',') + '\n';

        // Add rows
        data.forEach((row) => {
          const values = headers.map((header) => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma
            const escaped = String(value).replace(/"/g, '""');
            return escaped.includes(',') ? `"${escaped}"` : escaped;
          });
          csvContent += values.join(',') + '\n';
        });
      } else {
        // Convert single object to CSV
        const headers = Object.keys(data);
        csvContent = headers.join(',') + '\n';
        csvContent += headers.map((h) => data[h]).join(',') + '\n';
      }

      const blob = new Blob([csvContent], { type: 'text/csv' });
      downloadBlob(blob, `${filename}.csv`);
      toast.success('Exported as CSV');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const exportAsPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      const createdAt = new Date().toLocaleString();

      doc.setFontSize(18);
      doc.text(`${filename}`, 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated ${createdAt}`, 14, 28);

      const normalizeRow = (row: Record<string, unknown>, headers: string[]) =>
        headers.map((header) => {
          const value = row[header];
          if (value == null) return '';
          if (typeof value === 'number') return value.toLocaleString();
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        });

      if (Array.isArray(data)) {
        if (data.length === 0) {
          doc.text('No rows available for export.', 14, 40);
        } else {
          const headers = Object.keys(data[0]);
          autoTable(doc, {
            startY: 36,
            head: [headers],
            body: data.map((row) => normalizeRow(row, headers)),
            styles: {
              fontSize: 9,
              cellPadding: 3,
            },
            headStyles: {
              fillColor: [33, 37, 41],
              textColor: 255,
            },
            alternateRowStyles: {
              fillColor: [245, 245, 245],
            },
          });
          doc.setFontSize(10);
          doc.text(
            `Total rows: ${data.length.toLocaleString()}`,
            14,
            (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 40,
          );
        }
      } else if (data && typeof data === 'object') {
        const entries = Object.entries(data);
        autoTable(doc, {
          startY: 36,
          head: [['Field', 'Value']],
          body: entries.map(([key, value]) => {
            const serialized =
              value == null
                ? ''
                : typeof value === 'object'
                  ? JSON.stringify(value, null, 2)
                  : String(value);
            return [key, serialized];
          }),
          styles: {
            fontSize: 10,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [33, 37, 41],
            textColor: 255,
          },
        });
      } else {
        doc.setFontSize(12);
        doc.text(String(data), 14, 40, { maxWidth: 250 });
      }

      doc.save(`${filename}.pdf`);
      toast.success('Exported as PDF');
    } catch (error) {
      console.error('Failed to export as PDF', error);
      toast.error('Failed to export PDF');
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportAsJSON}>
          <FileText className="mr-2 h-4 w-4" />
          JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsCSV}>
          <Table className="mr-2 h-4 w-4" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsPDF}>
          <FileText className="mr-2 h-4 w-4" />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
