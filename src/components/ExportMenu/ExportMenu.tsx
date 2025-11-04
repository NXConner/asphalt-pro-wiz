import { Download, FileText, Table, Image } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
    toast.info('PDF export coming soon');
    // TODO: Implement PDF export using jsPDF or similar
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
