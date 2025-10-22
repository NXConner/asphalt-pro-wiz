import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Calculator, FileText, Plus, Settings, MapPin } from 'lucide-react';
import Map from '@/components/Map';
import AreaSection from '@/components/AreaSection';
import ImageAreaAnalyzer from '@/components/ImageAreaAnalyzer';
import { isEnabled } from '@/lib/flags';
import { BusinessSettings } from '@/components/BusinessSettings';
import { PremiumServices } from '@/components/PremiumServices';
import { ServiceCategories } from '@/components/ServiceCategories';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CustomerInvoice } from '@/components/CustomerInvoice';
import { calculateProject, calculateDistance, defaultBusinessData, ProjectInputs, BusinessData, Costs, CostBreakdown } from '@/lib/calculations';
import { makeJobKey, upsertJob, setJobStatus, type JobStatus } from '@/lib/idb';
import { BUSINESS_ADDRESS, SUPPLIER_ADDRESS } from '@/lib/locations';
import { CustomServices, type CustomService } from '@/components/CustomServices';
import { UploadsPanel } from '@/components/UploadsPanel';
import { ReceiptsPanel } from '@/components/ReceiptsPanel';
import ReceiptsPanel from '@/components/ReceiptsPanel';
import { DocumentGenerator } from '@/components/DocumentGenerator';
import { AIGemini } from '@/components/AIGemini';

interface AreaItem {
  id: number;
  shape: 'rectangle' | 'triangle' | 'circle' | 'drawn' | 'manual' | 'image';
  area: number;
}

const Index = () => {
  const [businessData, setBusinessData] = useState<BusinessData>(defaultBusinessData);
  const [jobName, setJobName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCoords, setCustomerCoords] = useState<[number, number] | null>(null);
  const [jobStatus, setJobStatusLocal] = useState<JobStatus>('need_estimate');
  const [jobCompetitor, setJobCompetitor] = useState('');
  const [mapRefreshKey, setMapRefreshKey] = useState(0);
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [nextAreaId, setNextAreaId] = useState(1);
  const [shapeType, setShapeType] = useState<'rectangle' | 'triangle' | 'circle' | 'manual' | 'image'>('rectangle');
  
  const [numCoats, setNumCoats] = useState(2);
  const [sandAdded, setSandAdded] = useState(false);
  const [polymerAdded, setPolymerAdded] = useState(false);
  
  const [crackLength, setCrackLength] = useState(0);
  const [crackWidth, setCrackWidth] = useState(0.5);
  const [crackDepth, setCrackDepth] = useState(0.5);
  
  const [stripingLines, setStripingLines] = useState(0);
  const [stripingHandicap, setStripingHandicap] = useState(0);
  const [stripingArrowsLarge, setStripingArrowsLarge] = useState(0);
  const [stripingArrowsSmall, setStripingArrowsSmall] = useState(0);
  const [stripingLettering, setStripingLettering] = useState(0);
  const [stripingCurb, setStripingCurb] = useState(0);
  
  const [oilSpots, setOilSpots] = useState(0);
  const [propaneTanks, setPropaneTanks] = useState(1);

  const [premiumEdgePushing, setPremiumEdgePushing] = useState(false);
  const [premiumWeedKiller, setPremiumWeedKiller] = useState(false);
  const [premiumCrackCleaning, setPremiumCrackCleaning] = useState(false);
  const [premiumPowerWashing, setPremiumPowerWashing] = useState(false);
  const [premiumDebrisRemoval, setPremiumDebrisRemoval] = useState(false);

  const [customServices, setCustomServices] = useState<CustomService[]>([]);

  const [includeCleaningRepair, setIncludeCleaningRepair] = useState(true);
  const [includeSealcoating, setIncludeSealcoating] = useState(true);
  const [includeStriping, setIncludeStriping] = useState(true);
  
  const [showResults, setShowResults] = useState(false);
  const [costs, setCosts] = useState<Costs | null>(null);
  const [breakdown, setBreakdown] = useState<CostBreakdown[]>([]);
  const [jobDistance, setJobDistance] = useState(0);

  const businessCoords: [number, number] = [36.7388, -80.2692];
  const supplierCoords: [number, number] = [36.3871, -79.9578];

  const handleAddressUpdate = (coords: [number, number], address: string) => {
    setCustomerCoords(coords);
    setCustomerAddress(address);
    const dist = calculateDistance(businessCoords, coords) * 2;
    setJobDistance(dist);
    // Persist/update job immediately with default status
    const key = makeJobKey(jobName, address);
    void upsertJob({
      id: key,
      jobKey: key,
      name: jobName || 'Job',
      address,
      coords,
      status: jobStatus,
      competitor: jobCompetitor || undefined,
    }).then(() => setMapRefreshKey(k => k + 1));
  };

  const handleAreaDrawn = (area: number) => {
    const newArea: AreaItem = {
      id: nextAreaId,
      shape: 'drawn',
      area
    };
    setAreas(prev => [...prev, newArea]);
    setNextAreaId(prev => prev + 1);
    toast.success(`Added ${area.toFixed(1)} sq ft from map drawing`);
  };

  const handleImageAreaDetected = (area: number) => {
    const newArea: AreaItem = {
      id: nextAreaId,
      shape: 'image',
      area
    };
    setAreas(prev => [...prev, newArea]);
    setNextAreaId(prev => prev + 1);
  };

  const handleCrackLengthDrawn = (length: number) => {
    setCrackLength(prev => prev + length);
    toast.success(`Added ${length.toFixed(1)} ft to crack length`);
  };

  const addArea = () => {
    const newArea: AreaItem = {
      id: nextAreaId,
      shape: shapeType,
      area: 0
    };
    setAreas(prev => [...prev, newArea]);
    setNextAreaId(prev => prev + 1);
  };

  const removeArea = (id: number) => {
    setAreas(prev => prev.filter(a => a.id !== id));
  };

  const updateAreaValue = (id: number, area: number) => {
    setAreas(prev => prev.map(a => a.id === id ? { ...a, area } : a));
  };

  const handlePremiumServiceChange = (service: string, value: boolean) => {
    switch(service) {
      case 'premiumEdgePushing': setPremiumEdgePushing(value); break;
      case 'premiumWeedKiller': setPremiumWeedKiller(value); break;
      case 'premiumCrackCleaning': setPremiumCrackCleaning(value); break;
      case 'premiumPowerWashing': setPremiumPowerWashing(value); break;
      case 'premiumDebrisRemoval': setPremiumDebrisRemoval(value); break;
    }
  };

  const handleServiceCategoryChange = (category: string, value: boolean) => {
    switch(category) {
      case 'includeCleaningRepair': setIncludeCleaningRepair(value); break;
      case 'includeSealcoating': setIncludeSealcoating(value); break;
      case 'includeStriping': setIncludeStriping(value); break;
    }
  };

  const totalArea = areas.reduce((sum, a) => sum + a.area, 0);

  const handleCalculate = () => {
    if (totalArea <= 0) {
      toast.error('Please add an area measurement');
      return;
    }

    const inputs: ProjectInputs = {
      jobName,
      customerAddress,
      totalArea,
      numCoats,
      sandAdded,
      polymerAdded,
      crackLength,
      crackWidth,
      crackDepth,
      stripingLines,
      stripingHandicap,
      stripingArrowsLarge,
      stripingArrowsSmall,
      stripingLettering,
      stripingCurb,
      oilSpots,
      propaneTanks,
      jobDistanceMiles: jobDistance,
      premiumEdgePushing,
      premiumWeedKiller,
      premiumCrackCleaning,
      premiumPowerWashing,
      premiumDebrisRemoval,
      includeCleaningRepair,
      includeSealcoating,
      includeStriping,
      customServices: customServices.map(s => ({ name: s.name, type: s.type, unitPrice: s.unitPrice, quantity: s.quantity }))
    };

    const result = calculateProject(inputs, businessData);
    setCosts(result.costs);
    setBreakdown(result.breakdown);
    setShowResults(true);

    // Auto-mark as estimated and persist
    const key = makeJobKey(jobName, customerAddress);
    void setJobStatus(key, 'estimated').then(() => setMapRefreshKey(k => k + 1));

    setTimeout(() => {
      document.getElementById('results-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handlePrint = () => {
    window.print();
  };

  const supplierDist = calculateDistance(businessCoords, supplierCoords) * 2;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">CONNER Asphalt Estimator</h1>
            <p className="text-lg text-muted-foreground">Professional Estimate & Invoice Generator</p>
          </div>
          <ThemeToggle />
        </header>

        <Tabs defaultValue="estimate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="estimate">
              <Calculator className="h-4 w-4 mr-2" />
              Estimate
            </TabsTrigger>
            <TabsTrigger value="invoice" disabled={!showResults}>
              <FileText className="h-4 w-4 mr-2" />
              Invoice
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="estimate" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="jobName">Job Name / Customer</Label>
                        <Input
                          id="jobName"
                          value={jobName}
                          onChange={(e) => setJobName(e.target.value)}
                          placeholder="e.g., Smith Driveway"
                        />
                      </div>
                      <div>
                        <Label htmlFor="customerAddress">Customer Address</Label>
                        <Input
                          id="customerAddress"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="Search address on map"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="jobStatus">Job Status</Label>
                        <Select value={jobStatus} onValueChange={(v: any) => setJobStatusLocal(v)}>
                          <SelectTrigger id="jobStatus">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="need_estimate">Need Estimate</SelectItem>
                            <SelectItem value="estimated">Estimated</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="competitor">Competitor (if lost)</Label>
                        <Input id="competitor" value={jobCompetitor} onChange={(e) => setJobCompetitor(e.target.value)} placeholder="Who won the job?" />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const key = makeJobKey(jobName, customerAddress);
                            if (!key || !customerAddress || !customerCoords) {
                              toast.error('Set job name/address by selecting on map first');
                              return;
                            }
                            void upsertJob({
                              id: key,
                              jobKey: key,
                              name: jobName || 'Job',
                              address: customerAddress,
                              coords: customerCoords,
                              status: jobStatus,
                              competitor: jobCompetitor || undefined,
                            }).then(() => {
                              toast.success('Saved job');
                              setMapRefreshKey(k => k + 1);
                            });
                          }}
                        >
                          Save Job
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <ServiceCategories
                  cleaningRepair={includeCleaningRepair}
                  sealcoating={includeSealcoating}
                  striping={includeStriping}
                  onChange={handleServiceCategoryChange}
                />

                <Card>
                  <CardHeader>
                    <CardTitle>Area Measurement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Use the drawing tools on the map or add manual shapes below
                    </p>
                    <div className="flex gap-2">
                      <Select value={shapeType} onValueChange={(v: any) => setShapeType(v)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rectangle">Rectangle</SelectItem>
                          <SelectItem value="triangle">Triangle</SelectItem>
                          <SelectItem value="circle">Circle</SelectItem>
                          <SelectItem value="manual">Manual Area</SelectItem>
                          <SelectItem value="image">From Image</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={addArea} variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {areas.map(area => (
                        <AreaSection
                          key={area.id}
                          shape={area.shape}
                          initialArea={area.area}
                          onChange={(val) => updateAreaValue(area.id, val)}
                          onRemove={() => removeArea(area.id)}
                        />
                      ))}
                    </div>
                    {totalArea > 0 && (
                      <div className="bg-primary/10 p-3 rounded-md">
                        <p className="font-semibold">Total Area: {totalArea.toFixed(1)} sq ft</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {includeCleaningRepair && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Crack Filling</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Use the drawing tools on the map to measure crack length
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="crackLength">Total Length (ft)</Label>
                          <Input
                            id="crackLength"
                            type="number"
                            min="0"
                            value={crackLength}
                            onChange={(e) => setCrackLength(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="crackWidth">Avg. Width (in)</Label>
                          <Input
                            id="crackWidth"
                            type="number"
                            min="0"
                            step="0.25"
                            value={crackWidth}
                            onChange={(e) => setCrackWidth(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="crackDepth">Avg. Depth (in)</Label>
                          <Input
                            id="crackDepth"
                            type="number"
                            min="0"
                            step="0.25"
                            value={crackDepth}
                            onChange={(e) => setCrackDepth(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="propaneTanks">Propane Tanks</Label>
                        <Input
                          id="propaneTanks"
                          type="number"
                          min="0"
                          value={propaneTanks}
                          onChange={(e) => setPropaneTanks(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {includeSealcoating && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Sealcoating Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="numCoats">Number of Coats</Label>
                          <Select value={numCoats.toString()} onValueChange={(v) => setNumCoats(parseInt(v))}>
                            <SelectTrigger id="numCoats">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Coat</SelectItem>
                              <SelectItem value="2">2 Coats</SelectItem>
                              <SelectItem value="3">3 Coats</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="sandAdded">Sand Added?</Label>
                          <Select value={sandAdded ? 'yes' : 'no'} onValueChange={(v) => setSandAdded(v === 'yes')}>
                            <SelectTrigger id="sandAdded">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="polymerAdded">Fast-Dry Additive?</Label>
                          <Select value={polymerAdded ? 'yes' : 'no'} onValueChange={(v) => setPolymerAdded(v === 'yes')}>
                            <SelectTrigger id="polymerAdded">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="oilSpots">Oil Spot Priming (count)</Label>
                        <Input
                          id="oilSpots"
                          type="number"
                          min="0"
                          value={oilSpots}
                          onChange={(e) => setOilSpots(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {includeStriping && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Parking Lot Striping</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="stripingLines">Parking Lines</Label>
                          <Input
                            id="stripingLines"
                            type="number"
                            min="0"
                            value={stripingLines}
                            onChange={(e) => setStripingLines(parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="stripingHandicap">Handicap Stencils</Label>
                          <Input
                            id="stripingHandicap"
                            type="number"
                            min="0"
                            value={stripingHandicap}
                            onChange={(e) => setStripingHandicap(parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="stripingArrowsLarge">Large Arrows</Label>
                          <Input
                            id="stripingArrowsLarge"
                            type="number"
                            min="0"
                            value={stripingArrowsLarge}
                            onChange={(e) => setStripingArrowsLarge(parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="stripingArrowsSmall">Small Arrows</Label>
                          <Input
                            id="stripingArrowsSmall"
                            type="number"
                            min="0"
                            value={stripingArrowsSmall}
                            onChange={(e) => setStripingArrowsSmall(parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="stripingLettering">Lettering (Total)</Label>
                          <Input
                            id="stripingLettering"
                            type="number"
                            min="0"
                            value={stripingLettering}
                            onChange={(e) => setStripingLettering(parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="stripingCurb">Curb Painting (ft)</Label>
                          <Input
                            id="stripingCurb"
                            type="number"
                            min="0"
                            value={stripingCurb}
                            onChange={(e) => setStripingCurb(parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <PremiumServices
                  edgePushing={premiumEdgePushing}
                  weedKiller={premiumWeedKiller}
                  crackCleaning={premiumCrackCleaning}
                  powerWashing={premiumPowerWashing}
                  debrisRemoval={premiumDebrisRemoval}
                  onChange={handlePremiumServiceChange}
                />

                <CustomServices
                  totalArea={totalArea}
                  crackLength={crackLength}
                  value={customServices}
                  onChange={setCustomServices}
                />

                {/* Manual prep removed: auto-calculated per service in labor */}

                <div className="text-center">
                  <Button onClick={handleCalculate} size="lg" className="w-full md:w-auto">
                    <Calculator className="h-5 w-5 mr-2" />
                    Generate Estimate
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location & Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Map
                      customerAddress={customerAddress}
                      onAddressUpdate={handleAddressUpdate}
                      onAreaDrawn={handleAreaDrawn}
                      onCrackLengthDrawn={handleCrackLengthDrawn}
                      refreshKey={mapRefreshKey}
                    />
                    <div className="space-y-2 text-sm">
                      <p><strong>Business:</strong> {BUSINESS_ADDRESS}</p>
                      <p><strong>Supplier:</strong> {SUPPLIER_ADDRESS}</p>
                      <div className="bg-muted p-3 rounded-md">
                        <p><strong>To Supplier (RT):</strong> {supplierDist.toFixed(1)} mi</p>
                        {jobDistance > 0 && (
                          <p><strong>To Job Site (RT):</strong> {jobDistance.toFixed(1)} mi</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <UploadsPanel jobName={jobName} customerAddress={customerAddress} />
                {isEnabled('receipts') && (
                  <ReceiptsPanel jobName={jobName} customerAddress={customerAddress} />
                )}
                {isEnabled('receipts') && (
                  <ReceiptsPanel jobName={jobName} customerAddress={customerAddress} />
                )}
                {isEnabled('imageAreaAnalyzer') && (
                  <ImageAreaAnalyzer onAreaDetected={handleImageAreaDetected} />
                )}
                {isEnabled('aiAssistant') && <AIGemini />}
              </div>
            </div>

            {showResults && costs && (
              <div id="results-container" className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Cost Breakdown (Internal View)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-1 space-y-2">
                        {breakdown.map((item, idx) => (
                          <div key={idx} className="flex justify-between py-2 border-b text-sm">
                            <span className="text-muted-foreground">{item.item}</span>
                            <span className="font-medium">{item.value}</span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-3 font-bold text-lg">
                          <span>Total</span>
                          <span className="text-primary">${costs.total.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-4">
                        <div className="p-4 border rounded-lg bg-card">
                          <h4 className="font-bold text-lg mb-2">Base Quote</h4>
                          <p className="text-3xl font-bold text-primary">${costs.total.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">Includes overhead & profit</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="invoice">
            {showResults && costs && (
              <CustomerInvoice
                jobName={jobName}
                customerAddress={customerAddress}
                costs={costs}
                breakdown={breakdown}
                onPrint={handlePrint}
              />
            )}
            <div className="mt-6">
              <DocumentGenerator jobName={jobName} customerAddress={customerAddress} />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <BusinessSettings data={businessData} onChange={setBusinessData} />
            <ThemeCustomizer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
