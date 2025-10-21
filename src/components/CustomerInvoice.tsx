import { Costs, CostBreakdown } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

interface CustomerInvoiceProps {
  jobName: string;
  customerAddress: string;
  costs: Costs;
  breakdown: CostBreakdown[];
  onPrint: () => void;
}

export function CustomerInvoice({ 
  jobName, 
  customerAddress, 
  costs, 
  breakdown,
  onPrint 
}: CustomerInvoiceProps) {
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Filter out internal cost details for customer view
  const customerBreakdown = breakdown.filter(item => 
    !item.item.includes('→') && 
    !item.item.includes('Overhead') && 
    !item.item.includes('Profit')
  );

  return (
    <Card className="print:shadow-none">
      <CardHeader className="space-y-4 pb-8">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-3xl font-bold">CONNER</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Asphalt Maintenance & Repair</p>
            <p className="text-sm text-muted-foreground">337 Ayers Orchard Rd, Stuart, VA 24171</p>
            <p className="text-sm text-muted-foreground">Phone: (276) 692-8534</p>
          </div>
          <div className="text-right print:hidden">
            <Button variant="outline" size="sm" onClick={onPrint} className="mr-2">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Download className="h-4 w-4 mr-2" />
              Save PDF
            </Button>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">ESTIMATE FOR:</h3>
            <p className="font-medium text-lg">{jobName || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">{customerAddress || 'N/A'}</p>
          </div>
          <div className="text-right">
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">ESTIMATE DATE:</h3>
            <p className="font-medium">{today}</p>
            <p className="text-sm text-muted-foreground mt-2">Valid for 30 days</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-4">Services Included</h3>
          <div className="space-y-2">
            {customerBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between py-2 border-b">
                <span className="text-sm">{item.item}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        <div className="bg-muted/50 p-6 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">Total Estimate</span>
            <span className="text-3xl font-bold text-primary">${costs.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-2 pt-4">
          <p><strong>Payment Terms:</strong> 50% deposit required to begin work. Remaining balance due upon completion.</p>
          <p><strong>Warranty:</strong> All work is guaranteed for one year from date of completion.</p>
          <p><strong>Note:</strong> Work is subject to suitable weather conditions. We will communicate any weather-related schedule changes promptly.</p>
        </div>

        <div className="border-t pt-6 mt-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-muted-foreground mb-4">Customer Acceptance</p>
              <div className="border-b border-foreground/20 pb-1 mb-2"></div>
              <p className="text-xs text-muted-foreground">Signature</p>
              <div className="border-b border-foreground/20 pb-1 mb-2 mt-8"></div>
              <p className="text-xs text-muted-foreground">Date</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-4">Contractor</p>
              <div className="border-b border-foreground/20 pb-1 mb-2">Nathan Conner</div>
              <p className="text-xs text-muted-foreground">Signature</p>
              <div className="border-b border-foreground/20 pb-1 mb-2 mt-8">{today}</div>
              <p className="text-xs text-muted-foreground">Date</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
