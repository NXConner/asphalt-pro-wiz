import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calculator, MapPin, Plus } from 'lucide-react';
import Map from '@/components/Map';
import AreaSection from '@/components/AreaSection';
import { calculateProject, calculateDistance, defaultBusinessData, ProjectInputs, Costs, CostBreakdown } from '@/lib/calculations';

interface AreaItem {
  id: number;
  shape: 'rectangle' | 'triangle' | 'circle' | 'drawn';
  area: number;
}

const Index = () => {
  const [jobName, setJobName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCoords, setCustomerCoords] = useState<[number, number] | null>(null);
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [nextAreaId, setNextAreaId] = useState(1);
  const [shapeType, setShapeType] = useState<'rectangle' | 'triangle' | 'circle'>('rectangle');
  
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
  
  const [prepHours, setPrepHours] = useState(1);
  const [oilSpots, setOilSpots] = useState(0);
  const [propaneTanks, setPropaneTanks] = useState(1);
  
  const [showResults, setShowResults] = useState(false);
  const [costs, setCosts] = useState<Costs | null>(null);
  const [breakdown, setBreakdown] = useState<CostBreakdown[]>([]);
  const [jobDistance, setJobDistance] = useState(0);
  const [supplierDistance, setSupplierDistance] = useState(0);

  const businessCoords: [number, number] = [36.7388, -80.2692];
  const supplierCoords: [number, number] = [36.3871, -79.9578];

  const handleAddressUpdate = (coords: [number, number], address: string) => {
    setCustomerCoords(coords);
    setCustomerAddress(address);
    const dist = calculateDistance(businessCoords, coords) * 2;
    setJobDistance(dist);
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
      prepHours,
      oilSpots,
      propaneTanks,
      jobDistanceMiles: jobDistance
    };

    const result = calculateProject(inputs, defaultBusinessData);
    setCosts(result.costs);
    setBreakdown(result.breakdown);
    setShowResults(true);

    // Scroll to results
    setTimeout(() => {
      document.getElementById('results-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const baseQuote = costs?.total || 0;
  const markupQuote = baseQuote * 1.25;
  const roundedUpBase = Math.ceil(baseQuote / 10) * 10;
  const finalRoundedQuote = roundedUpBase * 1.25;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Advanced Asphalt Estimator</h1>
          <p className="text-lg text-muted-foreground">Residential & Commercial Project Calculator</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Project Details & Measurements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Job Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobName">Job Name / Customer</Label>
                    <Input
                      id="jobName"
                      placeholder="e.g., Smith Driveway"
                      value={jobName}
                      onChange={(e) => setJobName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerAddress">Customer Address</Label>
                    <Input
                      id="customerAddress"
                      placeholder="Enter address, search, or click map"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                    />
                  </div>
                </div>

                {/* Area Calculation */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Area Calculation</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use the <strong className="text-primary">drawing tools on the map</strong> to measure area (polygon) or add manual shapes below.
                  </p>
                  <div className="flex gap-2 mb-3">
                    <Select value={shapeType} onValueChange={(v: any) => setShapeType(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rectangle">Rectangle</SelectItem>
                        <SelectItem value="triangle">Triangle</SelectItem>
                        <SelectItem value="circle">Circle</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addArea} className="whitespace-nowrap">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Shape
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {areas.map(area => (
                      <AreaSection
                        key={area.id}
                        shape={area.shape}
                        initialArea={area.area}
                        onRemove={() => removeArea(area.id)}
                        onChange={(val) => updateAreaValue(area.id, val)}
                      />
                    ))}
                  </div>
                  {areas.length > 0 && (
                    <div className="mt-3 p-3 bg-primary/10 rounded-md">
                      <p className="font-semibold text-primary">Total Area: {totalArea.toFixed(1)} sq ft</p>
                    </div>
                  )}
                </div>

                {/* Sealcoating */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Sealcoating</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Number of Coats</Label>
                      <Select value={numCoats.toString()} onValueChange={(v) => setNumCoats(parseInt(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Coat</SelectItem>
                          <SelectItem value="2">2 Coats</SelectItem>
                          <SelectItem value="3">3 Coats</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sand Added?</Label>
                      <Select value={sandAdded ? 'yes' : 'no'} onValueChange={(v) => setSandAdded(v === 'yes')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fast-Dry Additive?</Label>
                      <Select value={polymerAdded ? 'yes' : 'no'} onValueChange={(v) => setPolymerAdded(v === 'yes')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Crack Filling */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Crack Filling</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use the <strong className="text-primary">drawing tools on the map</strong> to measure crack length (line) or enter total length manually.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="crackLength">Total Crack Length (ft)</Label>
                      <Input
                        id="crackLength"
                        type="number"
                        value={crackLength}
                        onChange={(e) => setCrackLength(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="crackWidth">Avg. Width (in)</Label>
                      <Input
                        id="crackWidth"
                        type="number"
                        step="0.25"
                        value={crackWidth}
                        onChange={(e) => setCrackWidth(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="crackDepth">Avg. Depth (in)</Label>
                      <Input
                        id="crackDepth"
                        type="number"
                        step="0.25"
                        value={crackDepth}
                        onChange={(e) => setCrackDepth(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* Parking Lot Striping */}
                <fieldset className="border border-border rounded-lg p-4 space-y-3">
                  <legend className="text-lg font-semibold px-2">Parking Lot Striping (Optional)</legend>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stripingLines">Parking Lines</Label>
                      <Input
                        id="stripingLines"
                        type="number"
                        value={stripingLines}
                        onChange={(e) => setStripingLines(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripingHandicap">Handicap Stencils</Label>
                      <Input
                        id="stripingHandicap"
                        type="number"
                        value={stripingHandicap}
                        onChange={(e) => setStripingHandicap(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripingArrowsLarge">Large Arrows</Label>
                      <Input
                        id="stripingArrowsLarge"
                        type="number"
                        value={stripingArrowsLarge}
                        onChange={(e) => setStripingArrowsLarge(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripingArrowsSmall">Small Arrows</Label>
                      <Input
                        id="stripingArrowsSmall"
                        type="number"
                        value={stripingArrowsSmall}
                        onChange={(e) => setStripingArrowsSmall(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripingLettering">Lettering (Total)</Label>
                      <Input
                        id="stripingLettering"
                        type="number"
                        value={stripingLettering}
                        onChange={(e) => setStripingLettering(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripingCurb">Curb Painting (ft)</Label>
                      <Input
                        id="stripingCurb"
                        type="number"
                        value={stripingCurb}
                        onChange={(e) => setStripingCurb(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Additional Work */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Additional Work & Prep</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prepHours">Cleaning/Prep Time (Hours)</Label>
                      <Input
                        id="prepHours"
                        type="number"
                        value={prepHours}
                        onChange={(e) => setPrepHours(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oilSpots">Oil Spot Priming Spots</Label>
                      <Input
                        id="oilSpots"
                        type="number"
                        value={oilSpots}
                        onChange={(e) => setOilSpots(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="propaneTanks">Propane Tanks for Crack Machine</Label>
                      <Input
                        id="propaneTanks"
                        type="number"
                        value={propaneTanks}
                        onChange={(e) => setPropaneTanks(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <Button
                    onClick={handleCalculate}
                    className="w-full md:w-1/2 bg-accent hover:bg-accent/90 text-accent-foreground"
                    size="lg"
                  >
                    <Calculator className="mr-2 h-5 w-5" />
                    Generate Estimate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map & Travel Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Travel & Logistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-md">
                  <p className="font-bold text-sm mb-1">Use the Map Tools</p>
                  <p className="text-xs text-muted-foreground">
                    Use the drawing toolbar in the top-left of the map to measure areas and crack lengths.
                  </p>
                </div>
                
                <Map
                  onAddressUpdate={handleAddressUpdate}
                  onAreaDrawn={handleAreaDrawn}
                  onCrackLengthDrawn={handleCrackLengthDrawn}
                  customerAddress={customerAddress}
                />

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">Business:</p>
                    <p className="text-muted-foreground">337 Ayers Orchard Road, Stuart, VA</p>
                  </div>
                  <div>
                    <p className="font-medium">Supplier:</p>
                    <p className="text-muted-foreground">703 West Decatur Street, Madison, NC</p>
                  </div>
                  <div className="bg-primary/5 p-3 rounded-md space-y-1">
                    <p><strong>To Job Site (RT):</strong> <span className="font-semibold">{jobDistance > 0 ? `${jobDistance.toFixed(1)} miles` : 'N/A'}</span></p>
                    <p><strong>To Supplier (RT):</strong> <span className="font-semibold">{calculateDistance(businessCoords, supplierCoords) * 2} miles</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results */}
        {showResults && costs && (
          <Card id="results-container" className="mt-8">
            <CardHeader>
              <CardTitle className="text-center text-3xl">Generated Proposal</CardTitle>
              <div className="text-center text-sm space-y-1 pt-4">
                <p><strong>For:</strong> {jobName || 'N/A'}</p>
                <p><strong>Address:</strong> {customerAddress || 'N/A'}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-xl font-semibold mb-4">Cost Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    {breakdown.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">{item.item}:</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-3 mt-3 font-bold text-lg border-t-2">
                      <span>Total Direct Cost:</span>
                      <span className="text-primary">${costs.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-xl font-semibold mb-4">Estimate Options</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-bold text-lg">Standard Quote</h4>
                      <p className="text-3xl font-bold text-accent">${baseQuote.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Based on direct costs.</p>
                    </div>
                    <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
                      <h4 className="font-bold text-lg text-primary">Premium Quote (25% Markup)</h4>
                      <p className="text-3xl font-bold text-primary">${markupQuote.toFixed(2)}</p>
                      <p className="text-xs text-primary/80">Includes a 25% profit margin.</p>
                    </div>
                    <div className="p-4 border-2 border-purple-500 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                      <h4 className="font-bold text-lg text-purple-700 dark:text-purple-300">Value+ Quote (Rounded + 25%)</h4>
                      <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">${finalRoundedQuote.toFixed(2)}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        Based on cost rounded up to ${roundedUpBase.toFixed(2)}, then a 25% profit margin applied.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <Button onClick={() => window.print()} variant="secondary" size="lg">
                  Print Proposal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
