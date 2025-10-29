import { useState, useMemo, useEffect, useRef, Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Calculator, FileText, Plus, Settings, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
const Map = lazy(() => import("@/components/Map"));
import AreaSection from "@/components/AreaSection";
import ImageAreaAnalyzer from "@/components/ImageAreaAnalyzer";
import { isEnabled, setFlag } from "@/lib/flags";
import { logEvent } from "@/lib/logging";
import { BusinessSettings } from "@/components/BusinessSettings";
import { PremiumServices } from "@/components/PremiumServices";
import { ServiceCategories } from "@/components/ServiceCategories";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CustomerInvoice } from "@/components/CustomerInvoice";
import {
  calculateProject,
  calculateDistance,
  defaultBusinessData,
  ProjectInputs,
  BusinessData,
  Costs,
  CostBreakdown,
} from "@/lib/calculations";
import { makeJobKey, upsertJob, setJobStatus, type JobStatus } from "@/lib/idb";
import {
  BUSINESS_ADDRESS,
  SUPPLIER_ADDRESS,
  BUSINESS_COORDS_FALLBACK,
  SUPPLIER_COORDS_FALLBACK,
} from "@/lib/locations";
import { CustomServices, type CustomService } from "@/components/CustomServices";
import { getServiceById } from "@/lib/serviceCatalog";
import { UploadsPanel } from "@/components/UploadsPanel";
import { ReceiptsPanel } from "@/components/ReceiptsPanel";
import { DocumentGenerator } from "@/components/DocumentGenerator";
import { AIGemini } from "@/components/AIGemini";
import { ComplianceResources, type ComplianceTopic } from "@/components/ComplianceResources";
import { OwnerSettings } from "@/components/OwnerSettings";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { CustomizableCard, CardStyle } from "@/components/CustomizableCard";
import { CardLayoutManager, CardLayout } from "@/components/CardLayoutManager";
import WeatherCard from "@/components/WeatherCard";
import { BlackoutEditor } from "@/components/Scheduler/BlackoutEditor";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface AreaItem {
  id: number;
  shape: "rectangle" | "triangle" | "circle" | "drawn" | "manual" | "image";
  area: number;
}

const Index = () => {
  const [businessData, setBusinessData] = useState<BusinessData>(defaultBusinessData);
  const [jobName, setJobName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCoords, setCustomerCoords] = useState<[number, number] | null>(null);
  const [jobStatus, setJobStatusLocal] = useState<JobStatus>("need_estimate");
  const [jobCompetitor, setJobCompetitor] = useState("");
  const [mapRefreshKey, setMapRefreshKey] = useState(0);
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [nextAreaId, setNextAreaId] = useState(1);
  const [shapeType, setShapeType] = useState<
    "rectangle" | "triangle" | "circle" | "manual" | "image"
  >("rectangle");
  const [ownerMode, setOwnerMode] = useState<boolean>(isEnabled("ownerMode"));
  const [manualAreaInput, setManualAreaInput] = useState<string>("");

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
  const [stripingColors, setStripingColors] = useState<
    Array<"White" | "Blue" | "Yellow" | "Red" | "Green">
  >([]);

  const [oilSpots, setOilSpots] = useState(0);
  const [propaneTanks, setPropaneTanks] = useState(1);
  const [prepHours, setPrepHours] = useState(1);

  const [premiumEdgePushing, setPremiumEdgePushing] = useState(false);
  const [premiumWeedKiller, setPremiumWeedKiller] = useState(false);
  const [premiumCrackCleaning, setPremiumCrackCleaning] = useState(false);
  const [premiumPowerWashing, setPremiumPowerWashing] = useState(false);
  const [premiumDebrisRemoval, setPremiumDebrisRemoval] = useState(false);

  const [customServices, setCustomServices] = useState<CustomService[]>([]);

  const [includeCleaningRepair, setIncludeCleaningRepair] = useState(true);
  const [includeSealcoating, setIncludeSealcoating] = useState(true);
  const [includeStriping, setIncludeStriping] = useState(true);
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [complianceTopic, setComplianceTopic] = useState<ComplianceTopic>("striping");
  const [waterPercent, setWaterPercent] = useState(0);
  const [sealerType, setSealerType] = useState<
    "Acrylic" | "Asphalt Emulsion" | "Coal Tar" | "PMM" | "Other"
  >("PMM");
  const [sandType, setSandType] = useState<"Black Beauty" | "Black Diamond" | "Other">(
    "Black Beauty",
  );
  const crackFillerProduct = "CrackMaster Parking Lot LP hot pour (30 lb box)";

  const [showResults, setShowResults] = useState(false);
  const [costs, setCosts] = useState<Costs | null>(null);
  const [breakdown, setBreakdown] = useState<CostBreakdown[]>([]);
  const [jobDistance, setJobDistance] = useState(0);

  // Card layout and customization state (align with Optimized preset for no flicker)
  const [cardLayouts, setCardLayouts] = useState<CardLayout[]>([
    { i: "map", x: 0, y: 0, w: 8, h: 10, minW: 6, minH: 6 },
    { i: "details", x: 8, y: 0, w: 4, h: 18, minW: 4, minH: 8 },
    { i: "premium", x: 0, y: 10, w: 8, h: 10, minW: 3, minH: 4 },
    { i: "weather", x: 8, y: 18, w: 4, h: 6, minW: 3, minH: 4 },
  ]);
  const [cardStyles, setCardStyles] = useState<Record<string, CardStyle>>({});
  const [pinnedCards, setPinnedCards] = useState<Record<string, boolean>>({});
  const [globalLock, setGlobalLock] = useState<boolean>(false);
  const [visibleCardIds, setVisibleCardIds] = useState<string[]>([
    "map",
    "details",
    "premium",
    "weather",
  ]);
  const [customizationLocks, setCustomizationLocks] = useState<Record<string, boolean>>({});

  const businessCoords: [number, number] = BUSINESS_COORDS_FALLBACK;
  const supplierCoords: [number, number] = SUPPLIER_COORDS_FALLBACK;

  const handleCardPin = (cardId: string, pinned: boolean) => {
    setPinnedCards((prev) => ({ ...prev, [cardId]: pinned }));
  };

  const handleCardStyleChange = (cardId: string, style: CardStyle) => {
    setCardStyles((prev) => ({ ...prev, [cardId]: style }));
  };

  const handleLayoutChange = (newLayout: any[]) => {
    // Merge changes from visible layout into full layout state
    setCardLayouts((prev) => {
      const nextById = new Map<string, any>();
      for (const item of newLayout) {
        nextById.set(item.i, item);
      }
      return prev.map((orig) => {
        const changed = nextById.get(orig.i);
        if (!changed) return orig; // keep hidden items intact
        return {
          i: orig.i,
          x: changed.x,
          y: changed.y,
          w: changed.w,
          h: changed.h,
          minW: orig.minW,
          minH: orig.minH,
          isResizable: orig.isResizable,
          isDraggable: orig.isDraggable,
          static: orig.static,
        };
      });
    });
    try {
      const meta = newLayout.reduce(
        (acc: Record<string, { w: number; h: number }>, l: any) => {
          acc[l.i] = { w: l.w, h: l.h };
          return acc;
        },
        {} as Record<string, { w: number; h: number }>,
      );
      logEvent("ui.cards.layout_changed", { count: newLayout.length, meta });
    } catch {}
  };

  const setItemSize = (i: string, w: number, h: number) => {
    setCardLayouts((prev) => prev.map((l) => (l.i === i ? { ...l, w, h } : l)));
  };

  const setItemFlags = (
    i: string,
    flags: { isDraggable?: boolean; isResizable?: boolean; static?: boolean },
  ) => {
    setCardLayouts((prev) => prev.map((l) => (l.i === i ? { ...l, ...flags } : l)));
  };

  const setItemMovementLocked = (i: string, locked: boolean) => {
    setCardLayouts((prev) =>
      prev.map((l) =>
        l.i === i
          ? {
              ...l,
              static: locked,
              isDraggable: locked ? false : l.isDraggable,
              isResizable: locked ? false : l.isResizable,
            }
          : l,
      ),
    );
  };

  const setCardCustomizationLocked = (i: string, locked: boolean) => {
    setCustomizationLocks((prev) => ({ ...prev, [i]: locked }));
  };

  const handleAddressUpdate = (coords: [number, number], address: string) => {
    setCustomerCoords(coords);
    setCustomerAddress(address);
    const dist = calculateDistance(businessCoords, coords) * 2;
    setJobDistance(dist);
    logEvent("job.address_updated", { address, distanceRtMiles: dist });
    // Persist/update job immediately with default status
    const key = makeJobKey(jobName, address);
    void upsertJob({
      id: key,
      name: jobName || "Job",
      address,
      coords,
      status: jobStatus,
      competitor: jobCompetitor || undefined,
    }).then(() => setMapRefreshKey((k) => k + 1));
  };

  const handleAreaDrawn = (area: number) => {
    const newArea: AreaItem = {
      id: nextAreaId,
      shape: "drawn",
      area,
    };
    setAreas((prev) => [...prev, newArea]);
    setNextAreaId((prev) => prev + 1);
    toast.success(`Added ${area.toFixed(1)} sq ft from map drawing`);
  };

  const handleImageAreaDetected = (area: number) => {
    const newArea: AreaItem = {
      id: nextAreaId,
      shape: "image",
      area,
    };
    setAreas((prev) => [...prev, newArea]);
    setNextAreaId((prev) => prev + 1);
  };

  const handleCrackLengthDrawn = (length: number) => {
    setCrackLength((prev) => prev + length);
    toast.success(`Added ${length.toFixed(1)} ft to crack length`);
  };

  const addArea = () => {
    const newArea: AreaItem = {
      id: nextAreaId,
      shape: shapeType,
      area: 0,
    };
    setAreas((prev) => [...prev, newArea]);
    setNextAreaId((prev) => prev + 1);
  };

  const addManualAreaQuick = () => {
    const parsed = parseFloat(manualAreaInput);
    if (!parsed || parsed <= 0) {
      toast.error("Enter a valid area in sq ft");
      return;
    }
    const newArea: AreaItem = {
      id: nextAreaId,
      shape: "manual",
      area: parsed,
    };
    setAreas((prev) => [...prev, newArea]);
    setNextAreaId((prev) => prev + 1);
    setManualAreaInput("");
    try {
      logEvent("area.add_manual", { areaSqFt: parsed });
    } catch {}
    toast.success(`Added ${parsed.toFixed(1)} sq ft`);
  };

  const removeArea = (id: number) => {
    setAreas((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAreaValue = (id: number, area: number) => {
    setAreas((prev) => prev.map((a) => (a.id === id ? { ...a, area } : a)));
  };

  const handlePremiumServiceChange = (service: string, value: boolean) => {
    switch (service) {
      case "premiumEdgePushing":
        setPremiumEdgePushing(value);
        break;
      case "premiumWeedKiller":
        setPremiumWeedKiller(value);
        break;
      case "premiumCrackCleaning":
        setPremiumCrackCleaning(value);
        break;
      case "premiumPowerWashing":
        setPremiumPowerWashing(value);
        break;
      case "premiumDebrisRemoval":
        setPremiumDebrisRemoval(value);
        break;
    }
  };

  const handleServiceCategoryChange = (category: string, value: boolean) => {
    switch (category) {
      case "includeCleaningRepair":
        setIncludeCleaningRepair(value);
        break;
      case "includeSealcoating":
        setIncludeSealcoating(value);
        break;
      case "includeStriping":
        setIncludeStriping(value);
        break;
    }
  };

  const toggleStripingColor = (
    color: "White" | "Blue" | "Yellow" | "Red" | "Green",
    checked: boolean,
  ) => {
    setStripingColors((prev) =>
      checked ? Array.from(new Set([...prev, color])) : prev.filter((c) => c !== color),
    );
  };

  const totalArea = areas.reduce((sum, a) => sum + a.area, 0);

  const addedServiceNames = customServices.map((s) => s.name);

  const handleAddPremiumCustomService = (serviceId: string) => {
    const svc = getServiceById(serviceId);
    if (!svc) return;
    // prevent duplicate by name
    if (customServices.some((s) => s.name === svc.name)) return;
    const newService: CustomService = {
      id: crypto.randomUUID(),
      name: svc.name,
      type: svc.unitType,
      unitPrice: svc.defaultUnitPrice,
      quantity: svc.unitType === "perUnit" ? 1 : undefined,
    };
    setCustomServices((prev) => [...prev, newService]);
  };

  const handleCalculate = () => {
    if (totalArea <= 0) {
      toast.error("Please add an area measurement");
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
      stripingColors,
      prepHours,
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
      sealerType,
      sandType,
      waterPercent,
      crackFillerProduct,
      customServices: customServices.map((s) => ({
        name: s.name,
        type: s.type,
        unitPrice: s.unitPrice,
        quantity: s.quantity,
      })),
    };

    const result = calculateProject(inputs, businessData);
    setCosts(result.costs);
    setBreakdown(result.breakdown);
    setShowResults(true);
    try {
      logEvent("estimate.calculated", {
        jobName: jobName || "Job",
        totalArea,
        crackLength,
        includeSealcoating,
        includeStriping,
        includeCleaningRepair,
        numCustomServices: customServices.length,
        total: result.costs.total,
      });
    } catch {}

    // Auto-mark as estimated and persist
    const key = makeJobKey(jobName, customerAddress);
    void setJobStatus(key, "estimated").then(() => setMapRefreshKey((k) => k + 1));

    setTimeout(() => {
      document.getElementById("results-container")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handlePrint = () => {
    window.print();
  };

  const supplierDist = calculateDistance(businessCoords, supplierCoords) * 2;

  // Responsive width for react-grid-layout
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [gridWidth, setGridWidth] = useState<number>(1200);

  useEffect(() => {
    const el = gridContainerRef.current;
    if (!el) return;
    const update = () => setGridWidth(el.clientWidth);
    update();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => update());
      ro.observe(el);
    } else {
      window.addEventListener("resize", update);
    }
    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">CONNER Asphalt Estimator</h1>
            <p className="text-lg text-muted-foreground">
              Professional Estimate & Invoice Generator
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CardLayoutManager
              currentLayouts={cardLayouts}
              currentStyles={cardStyles}
              onLayoutChange={setCardLayouts}
              onStylesChange={setCardStyles}
              availableCards={[
                { id: "map", label: "Location & Map" },
                { id: "details", label: "Project Details" },
                { id: "premium", label: "Premium Services" },
                { id: "weather", label: "Weather" },
              ]}
              visibleCardIds={visibleCardIds}
              onVisibleCardsChange={(ids) => {
                // Ensure layouts exist for any newly added cards
                setCardLayouts((prev) => {
                  const exists = new Set(prev.map((p) => p.i));
                  const missing = ids.filter((id) => !exists.has(id));
                  if (missing.length === 0) return prev;
                  const defaults: Record<string, CardLayout> = {
                    map: { i: "map", x: 0, y: 0, w: 8, h: 10, minW: 6, minH: 6 },
                    details: { i: "details", x: 8, y: 0, w: 4, h: 18, minW: 4, minH: 8 },
                    premium: { i: "premium", x: 0, y: 10, w: 8, h: 10, minW: 3, minH: 4 },
                    weather: { i: "weather", x: 8, y: 18, w: 4, h: 6, minW: 3, minH: 4 },
                  };
                  const toAdd = missing.map((id) => defaults[id]).filter(Boolean) as CardLayout[];
                  return [...prev, ...toAdd];
                });
                setVisibleCardIds(ids);
              }}
              globalLock={globalLock}
              onGlobalLockChange={setGlobalLock}
            />
            <ThemeToggle />
          </div>
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

          <TabsContent value="estimate" className="space-y-4">
            <div ref={gridContainerRef}>
              <GridLayout
                className="layout"
                layout={cardLayouts.filter((l) => visibleCardIds.includes(l.i))}
                cols={12}
                rowHeight={30}
                width={gridWidth}
                onLayoutChange={handleLayoutChange}
                isDraggable={!globalLock}
                isResizable={!globalLock}
                compactType="vertical"
                preventCollision={false}
                draggableCancel=".non-draggable"
              >
                {visibleCardIds.includes("map") && (
                  <div key="map">
                    <CustomizableCard
                      cardId="map"
                      title="Location & Map"
                      isPinned={pinnedCards["map"]}
                      onPin={(pinned) => handleCardPin("map", pinned)}
                      style={cardStyles["map"]}
                      onStyleChange={(style) => handleCardStyleChange("map", style)}
                      className="h-full"
                      onResizePreset={(w, h) => setItemSize("map", w, h)}
                      onLayoutFlagsChange={(flags) => setItemFlags("map", flags)}
                      isCustomizationLocked={!!customizationLocks["map"]}
                      onCustomizationLockToggle={(locked) =>
                        setCardCustomizationLocked("map", locked)
                      }
                      isMovementLocked={
                        !!cardLayouts.find((l) => l.i === "map")?.static ||
                        (!cardLayouts.find((l) => l.i === "map")?.isDraggable &&
                          !cardLayouts.find((l) => l.i === "map")?.isResizable)
                      }
                      onMovementLockToggle={(locked) => setItemMovementLocked("map", locked)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Location & Map
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Suspense fallback={<Skeleton className="h-[450px] w-full" />}>
                          <Map
                            customerAddress={customerAddress}
                            onAddressUpdate={handleAddressUpdate}
                            onAreaDrawn={handleAreaDrawn}
                            onCrackLengthDrawn={handleCrackLengthDrawn}
                            refreshKey={mapRefreshKey}
                          />
                        </Suspense>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <Label>Business</Label>
                            <p className="text-muted-foreground">{BUSINESS_ADDRESS}</p>
                          </div>
                          <div>
                            <Label>Supplier</Label>
                            <p className="text-muted-foreground">{SUPPLIER_ADDRESS}</p>
                          </div>
                          <div>
                            <Label>To Supplier (RT)</Label>
                            <p className="font-semibold">{supplierDist.toFixed(1)} mi</p>
                          </div>
                          {jobDistance > 0 && (
                            <div>
                              <Label>To Job (RT)</Label>
                              <p className="font-semibold">{jobDistance.toFixed(1)} mi</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CustomizableCard>
                  </div>
                )}

                {visibleCardIds.includes("details") && (
                  <div key="details">
                    <CustomizableCard
                      cardId="details"
                      title="Project Details"
                      isPinned={pinnedCards["details"]}
                      onPin={(pinned) => handleCardPin("details", pinned)}
                      style={cardStyles["details"]}
                      onStyleChange={(style) => handleCardStyleChange("details", style)}
                      className="h-full overflow-y-auto"
                      onResizePreset={(w, h) => setItemSize("details", w, h)}
                      onLayoutFlagsChange={(flags) => setItemFlags("details", flags)}
                      isCustomizationLocked={!!customizationLocks["details"]}
                      onCustomizationLockToggle={(locked) =>
                        setCardCustomizationLocked("details", locked)
                      }
                      isMovementLocked={
                        !!cardLayouts.find((l) => l.i === "details")?.static ||
                        (!cardLayouts.find((l) => l.i === "details")?.isDraggable &&
                          !cardLayouts.find((l) => l.i === "details")?.isResizable)
                      }
                      onMovementLockToggle={(locked) => setItemMovementLocked("details", locked)}
                    >
                      <CardHeader>
                        <CardTitle>Project Details & Measurements</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="jobName" className="text-xs">
                              Job Name
                            </Label>
                            <Input
                              id="jobName"
                              value={jobName}
                              onChange={(e) => setJobName(e.target.value)}
                              placeholder="Smith Driveway"
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label htmlFor="customerAddress" className="text-xs">
                              Address
                            </Label>
                            <Input
                              id="customerAddress"
                              value={customerAddress}
                              onChange={(e) => setCustomerAddress(e.target.value)}
                              placeholder="Search on map"
                              className="h-8"
                            />
                          </div>
                        </div>

                        <ServiceCategories
                          cleaningRepair={includeCleaningRepair}
                          sealcoating={includeSealcoating}
                          striping={includeStriping}
                          onChange={handleServiceCategoryChange}
                        />

                        <div className="border-t pt-3">
                          <h4 className="font-semibold text-sm mb-2">Area Measurement</h4>
                          <div className="grid grid-cols-3 gap-2 mb-2">
                            <Input
                              type="number"
                              placeholder="Known sq ft"
                              value={manualAreaInput}
                              onChange={(e) => setManualAreaInput(e.target.value)}
                              className="h-8 text-sm col-span-2"
                            />
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={addManualAreaQuick}
                              className="h-8"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>
                          <div className="space-y-1">
                            {areas.map((area) => (
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
                            <div className="bg-primary/10 p-2 rounded text-sm font-semibold mt-2">
                              Total: {totalArea.toFixed(1)} sq ft
                            </div>
                          )}
                        </div>

                        {isEnabled("imageAreaAnalyzer") && (
                          <div className="border-t pt-3">
                            <h4 className="font-semibold text-sm mb-2">Image Area Analyzer</h4>
                            <ImageAreaAnalyzer onAreaDetected={handleImageAreaDetected} />
                          </div>
                        )}

                        {includeCleaningRepair && (
                          <div className="border-t pt-3">
                            <h4 className="font-semibold text-sm mb-2">Crack Filling</h4>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-xs">Length (ft)</Label>
                                <Input
                                  type="number"
                                  value={crackLength}
                                  onChange={(e) => setCrackLength(parseFloat(e.target.value) || 0)}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Width (in)</Label>
                                <Input
                                  type="number"
                                  step="0.25"
                                  value={crackWidth}
                                  onChange={(e) => setCrackWidth(parseFloat(e.target.value) || 0)}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Depth (in)</Label>
                                <Input
                                  type="number"
                                  step="0.25"
                                  value={crackDepth}
                                  onChange={(e) => setCrackDepth(parseFloat(e.target.value) || 0)}
                                  className="h-8"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {includeSealcoating && (
                          <div className="border-t pt-3">
                            <h4 className="font-semibold text-sm mb-2">Sealcoating</h4>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-xs">Coats</Label>
                                <Select
                                  value={numCoats.toString()}
                                  onValueChange={(v) => setNumCoats(parseInt(v))}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">Sand</Label>
                                <Select
                                  value={sandAdded ? "yes" : "no"}
                                  onValueChange={(v) => setSandAdded(v === "yes")}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">Fast-Dry</Label>
                                <Select
                                  value={polymerAdded ? "yes" : "no"}
                                  onValueChange={(v) => setPolymerAdded(v === "yes")}
                                >
                                  <SelectTrigger className="h-8">
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
                        )}

                        {includeStriping && (
                          <div className="border-t pt-3">
                            <h4 className="font-semibold text-sm mb-2">Striping</h4>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <Input
                                type="number"
                                placeholder="Lines"
                                value={stripingLines}
                                onChange={(e) => setStripingLines(parseInt(e.target.value) || 0)}
                                className="h-8"
                              />
                              <Input
                                type="number"
                                placeholder="Handicap"
                                value={stripingHandicap}
                                onChange={(e) => setStripingHandicap(parseInt(e.target.value) || 0)}
                                className="h-8"
                              />
                              <Input
                                type="number"
                                placeholder="Arrows"
                                value={stripingArrowsLarge}
                                onChange={(e) =>
                                  setStripingArrowsLarge(parseInt(e.target.value) || 0)
                                }
                                className="h-8"
                              />
                            </div>
                          </div>
                        )}

                        <CustomServices
                          totalArea={totalArea}
                          crackLength={crackLength}
                          value={customServices}
                          onChange={setCustomServices}
                        />

                        <Button onClick={handleCalculate} size="lg" className="w-full">
                          <Calculator className="h-4 w-4 mr-2" />
                          Generate Estimate
                        </Button>
                      </CardContent>
                    </CustomizableCard>
                  </div>
                )}

                {visibleCardIds.includes("weather") && (
                  <div key="weather">
                    <CustomizableCard
                      cardId="weather"
                      title="Weather"
                      isPinned={pinnedCards["weather"]}
                      onPin={(pinned) => handleCardPin("weather", pinned)}
                      style={cardStyles["weather"]}
                      onStyleChange={(style) => handleCardStyleChange("weather", style)}
                      className="h-full"
                      onResizePreset={(w, h) => setItemSize("weather", w, h)}
                      onLayoutFlagsChange={(flags) => setItemFlags("weather", flags)}
                      isCustomizationLocked={!!customizationLocks["weather"]}
                      onCustomizationLockToggle={(locked) =>
                        setCardCustomizationLocked("weather", locked)
                      }
                      isMovementLocked={
                        !!cardLayouts.find((l) => l.i === "weather")?.static ||
                        (!cardLayouts.find((l) => l.i === "weather")?.isDraggable &&
                          !cardLayouts.find((l) => l.i === "weather")?.isResizable)
                      }
                      onMovementLockToggle={(locked) => setItemMovementLocked("weather", locked)}
                    >
                      <WeatherCard coords={customerCoords} />
                    </CustomizableCard>
                  </div>
                )}

                {visibleCardIds.includes("premium") && (
                  <div key="premium">
                    <CustomizableCard
                      cardId="premium"
                      title="Premium Services"
                      isPinned={pinnedCards["premium"]}
                      onPin={(pinned) => handleCardPin("premium", pinned)}
                      style={cardStyles["premium"]}
                      onStyleChange={(style) => handleCardStyleChange("premium", style)}
                      className="h-full overflow-y-auto"
                      onResizePreset={(w, h) => setItemSize("premium", w, h)}
                      onLayoutFlagsChange={(flags) => setItemFlags("premium", flags)}
                      isCustomizationLocked={!!customizationLocks["premium"]}
                      onCustomizationLockToggle={(locked) =>
                        setCardCustomizationLocked("premium", locked)
                      }
                      isMovementLocked={
                        !!cardLayouts.find((l) => l.i === "premium")?.static ||
                        (!cardLayouts.find((l) => l.i === "premium")?.isDraggable &&
                          !cardLayouts.find((l) => l.i === "premium")?.isResizable)
                      }
                      onMovementLockToggle={(locked) => setItemMovementLocked("premium", locked)}
                    >
                      <PremiumServices
                        edgePushing={premiumEdgePushing}
                        weedKiller={premiumWeedKiller}
                        crackCleaning={premiumCrackCleaning}
                        powerWashing={premiumPowerWashing}
                        debrisRemoval={premiumDebrisRemoval}
                        onChange={handlePremiumServiceChange}
                        onAddCustomService={handleAddPremiumCustomService}
                        addedServiceNames={addedServiceNames}
                      />
                    </CustomizableCard>
                  </div>
                )}
              </GridLayout>
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
                          <p className="text-3xl font-bold text-primary">
                            ${costs.total.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Includes overhead & profit
                          </p>
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
            {isEnabled("receipts") && (
              <div className="mt-6">
                <ReceiptsPanel jobName={jobName} customerAddress={customerAddress} />
              </div>
            )}
            <div className="mt-6">
              <UploadsPanel jobName={jobName} customerAddress={customerAddress} />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <BusinessSettings data={businessData} onChange={setBusinessData} />
            <ThemeCustomizer />
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="flag-owner" className="text-sm">
                    Owner Mode
                  </Label>
                  <Switch
                    id="flag-owner"
                    checked={ownerMode}
                    onCheckedChange={(checked) => {
                      setOwnerMode(checked);
                      setFlag("ownerMode", checked);
                      try {
                        logEvent("flags.ownerMode_toggled", { enabled: checked });
                      } catch {}
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="flag-ai" className="text-sm">
                    AI Assistant
                  </Label>
                  <Switch
                    id="flag-ai"
                    checked={isEnabled("aiAssistant")}
                    onCheckedChange={(checked) => {
                      setFlag("aiAssistant", checked);
                      try {
                        logEvent("flags.aiAssistant_toggled", { enabled: checked });
                      } catch {}
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="flag-iaa" className="text-sm">
                    Image Area Analyzer
                  </Label>
                  <Switch
                    id="flag-iaa"
                    checked={isEnabled("imageAreaAnalyzer")}
                    onCheckedChange={(checked) => {
                      setFlag("imageAreaAnalyzer", checked);
                      try {
                        logEvent("flags.imageAreaAnalyzer_toggled", { enabled: checked });
                      } catch {}
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="flag-receipts" className="text-sm">
                    Receipts
                  </Label>
                  <Switch
                    id="flag-receipts"
                    checked={isEnabled("receipts")}
                    onCheckedChange={(checked) => {
                      setFlag("receipts", checked);
                      try {
                        logEvent("flags.receipts_toggled", { enabled: checked });
                      } catch {}
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="flag-scheduler" className="text-sm">
                    Scheduler
                  </Label>
                  <Switch
                    id="flag-scheduler"
                    checked={isEnabled("scheduler")}
                    onCheckedChange={(checked) => {
                      setFlag("scheduler", checked);
                      try {
                        logEvent("flags.scheduler_toggled", { enabled: checked });
                      } catch {}
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="flag-optimizer" className="text-sm">
                    Layout Optimizer
                  </Label>
                  <Switch
                    id="flag-optimizer"
                    checked={isEnabled("optimizer")}
                    onCheckedChange={(checked) => {
                      setFlag("optimizer", checked);
                      try {
                        logEvent("flags.optimizer_toggled", { enabled: checked });
                      } catch {}
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="flag-portal" className="text-sm">
                    Customer Portal
                  </Label>
                  <Switch
                    id="flag-portal"
                    checked={isEnabled("customerPortal")}
                    onCheckedChange={(checked) => {
                      setFlag("customerPortal", checked);
                      try {
                        logEvent("flags.customerPortal_toggled", { enabled: checked });
                      } catch {}
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="flag-observability" className="text-sm">
                    Observability
                  </Label>
                  <Switch
                    id="flag-observability"
                    checked={isEnabled("observability")}
                    onCheckedChange={(checked) => {
                      setFlag("observability", checked);
                      try {
                        logEvent("flags.observability_toggled", { enabled: checked });
                      } catch {}
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {ownerMode && (
              <OwnerSettings
                waterPercent={waterPercent}
                onWaterPercentChange={setWaterPercent}
                sealerType={sealerType}
                onSealerTypeChange={setSealerType}
                sandType={sandType}
                onSandTypeChange={setSandType}
              />
            )}

            {isEnabled("aiAssistant") && <AIGemini />}

            {isEnabled("scheduler") && <BlackoutEditor />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
