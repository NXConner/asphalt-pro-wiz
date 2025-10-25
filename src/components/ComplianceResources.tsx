import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export type ComplianceTopic = "striping" | "sealcoating" | "crackfilling";

interface ComplianceResourcesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTopic: ComplianceTopic;
}

export function ComplianceResources({ open, onOpenChange, activeTopic }: ComplianceResourcesProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Compliance, Regulations, and Best Practices</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={activeTopic} className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="striping">Striping</TabsTrigger>
            <TabsTrigger value="sealcoating">Sealcoating</TabsTrigger>
            <TabsTrigger value="crackfilling">Crack Filling</TabsTrigger>
          </TabsList>
          <TabsContent value="striping">
            <Section>
              <Category title="Federal">
                <LinkItem href="https://www.ada.gov/regs2010/2010ADAStandards/2010ADAStandards_prt.pdf">
                  ADA 2010 Standards for Accessible Design (Parking)
                </LinkItem>
                <LinkItem href="https://mutcd.fhwa.dot.gov/htm/2009r1r2/html_toc.htm">
                  FHWA MUTCD (Signs, Markings, Arrows)
                </LinkItem>
                <LinkItem href="https://www.access-board.gov/aba/">
                  Architectural Barriers Act (ABA) Standards
                </LinkItem>
              </Category>
              <Category title="Virginia">
                <LinkItem href="https://www.virginiadot.org/business/const/spec-default.asp">
                  VDOT Road & Bridge Specifications
                </LinkItem>
                <LinkItem href="https://www.dpor.virginia.gov/boards/contractors">
                  Virginia Contractors Board Guidance
                </LinkItem>
                <LinkItem href="https://codes.iccsafe.org/codes/virginia">
                  Virginia USBC / Accessibility Code
                </LinkItem>
              </Category>
              <Category title="North Carolina">
                <LinkItem href="https://connect.ncdot.gov/resources/Specifications/Pages/default.aspx">
                  NCDOT Standard Specifications
                </LinkItem>
                <LinkItem href="https://connect.ncdot.gov/resources/Specifications/Pages/Roadway-Standard-Drawings.aspx">
                  NCDOT Standard Drawings
                </LinkItem>
                <LinkItem href="https://www.ncosfm.gov/building-codes/north-carolina-state-building-codes">
                  NC Building / Accessibility Codes
                </LinkItem>
              </Category>
              <Category title="Local & Best Practices">
                <LinkItem href="https://adatile.com/ada-parking-requirements/">
                  ADA Parking Space Counts & Dimensions
                </LinkItem>
                <LinkItem href="https://www.npca.org/resource/a-guide-to-parking-lot-striping/">
                  Parking Lot Striping Best Practices
                </LinkItem>
              </Category>
            </Section>
          </TabsContent>
          <TabsContent value="sealcoating">
            <Section>
              <Category title="Standards & Guidance">
                <LinkItem href="https://asphaltinstitute.org/engineering/sealcoating/">
                  Asphalt Institute: Sealcoating Guidance
                </LinkItem>
                <LinkItem href="https://www.pavementinteractive.org/reference-desk/pavement-management/maintenance-and-rehabilitation/seal-coats/">
                  Pavement Interactive: Seal Coats
                </LinkItem>
                <LinkItem href="https://www.astm.org/Standards/sealcoat">
                  ASTM References (sealcoat test methods)
                </LinkItem>
              </Category>
              <Category title="Virginia / North Carolina">
                <LinkItem href="https://www.virginiadot.org/">VDOT Resources</LinkItem>
                <LinkItem href="https://connect.ncdot.gov/">NCDOT Resources</LinkItem>
              </Category>
              <Category title="Mix Design & Safety">
                <LinkItem href="https://www.osha.gov/chemical-hazards-communication">
                  OSHA Hazard Communication (SDS)
                </LinkItem>
                <LinkItem href="https://www.epa.gov/p2">
                  EPA: Pollution Prevention (runoff)
                </LinkItem>
              </Category>
            </Section>
          </TabsContent>
          <TabsContent value="crackfilling">
            <Section>
              <Category title="Standards & Best Practices">
                <LinkItem href="https://www.fhwa.dot.gov/publications/research/infrastructure/pavements/ltpp/070meg/070meg.pdf">
                  FHWA Pavement Maintenance Guide
                </LinkItem>
                <LinkItem href="https://trid.trb.org/view/1128394">
                  TRB/NCHRP on Crack Sealing Materials
                </LinkItem>
              </Category>
              <Category title="Product Guidance">
                <LinkItem href="https://www.crafco.com/">Crafco Crack Sealing</LinkItem>
                <LinkItem href="https://deeryamerican.com/">Deery Crack Sealants</LinkItem>
              </Category>
              <Category title="Safety & Operations">
                <LinkItem href="https://www.osha.gov/">OSHA: Heating Equipment, PPE</LinkItem>
              </Category>
            </Section>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <ScrollArea className="h-[420px] pr-4">
      <div className="space-y-6">{children}</div>
    </ScrollArea>
  );
}

function Category({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <ul className="list-disc pl-5 space-y-1 text-sm">{children}</ul>
    </div>
  );
}

function LinkItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a href={href} target="_blank" rel="noreferrer" className="text-primary underline">
        {children}
      </a>
    </li>
  );
}
