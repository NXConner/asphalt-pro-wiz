export type UnitType = "flat" | "perUnit" | "perSqFt" | "perLinearFt";

export interface ServiceDefinition {
  id: string;
  name: string;
  category: "standard" | "premium";
  description: string;
  justification?: string;
  unitType: UnitType;
  defaultUnitPrice: number;
  defaultQuantityStrategy: "one" | "area" | "crackLength" | "units";
  tags?: string[];
  includedByDefault?: boolean;
}

export const STANDARD_SERVICES: ServiceDefinition[] = [
  {
    id: "std-site-inspection",
    name: "Pre-Job Site Inspection & Consultation",
    category: "standard",
    description:
      "Walk the lot, identify problem areas, verify access, utilities, and constraints. Discuss goals, timeline, and occupancy needs.",
    unitType: "flat",
    defaultUnitPrice: 0,
    defaultQuantityStrategy: "one",
    includedByDefault: true,
    tags: ["inspection", "planning"],
  },
  {
    id: "std-ada-review",
    name: "Basic ADA Review (Advisory)",
    category: "standard",
    description:
      "High-level check of accessible routes, counts, signage, and stall layout against current ADA guidance; advisory only.",
    unitType: "flat",
    defaultUnitPrice: 0,
    defaultQuantityStrategy: "one",
    includedByDefault: true,
    tags: ["ADA", "layout"],
  },
  {
    id: "std-surface-blow",
    name: "Surface Blowing & Light Cleaning",
    category: "standard",
    description:
      "Remove loose debris and dust prior to crack sealing and sealing. Heavy, impacted contamination is premium.",
    unitType: "flat",
    defaultUnitPrice: 0,
    defaultQuantityStrategy: "one",
    includedByDefault: true,
    tags: ["prep", "cleaning"],
  },
  {
    id: "std-traffic-control",
    name: "Basic Traffic Control & Barricades",
    category: "standard",
    description:
      "Cones, caution tape, and simple barricades to safely manage on-site traffic during work hours.",
    unitType: "flat",
    defaultUnitPrice: 0,
    defaultQuantityStrategy: "one",
    includedByDefault: true,
    tags: ["safety"],
  },
  {
    id: "std-post-job-clean",
    name: "Post-Job Light Cleanup",
    category: "standard",
    description:
      "General site tidying after completion. Heavy debris hauling or dumping fees are premium.",
    unitType: "flat",
    defaultUnitPrice: 0,
    defaultQuantityStrategy: "one",
    includedByDefault: true,
    tags: ["cleanup"],
  },
  {
    id: "std-warranty",
    name: "Basic Warranty & Aftercare Guidance",
    category: "standard",
    description:
      "Written aftercare instructions and a standard workmanship warranty to protect your investment.",
    unitType: "flat",
    defaultUnitPrice: 0,
    defaultQuantityStrategy: "one",
    includedByDefault: true,
    tags: ["warranty"],
  },
  {
    id: "std-mobilization",
    name: "Mobilization & Demobilization",
    category: "standard",
    description:
      "Standard mobilization of crew and equipment from our yard and supplier as needed.",
    unitType: "flat",
    defaultUnitPrice: 0,
    defaultQuantityStrategy: "one",
    includedByDefault: true,
    tags: ["logistics"],
  },
];

export const PREMIUM_SERVICES: ServiceDefinition[] = [
  {
    id: "edge-pushing",
    name: "Edge Pushing (Reclaim Encroached Edges)",
    category: "premium",
    description:
      "Mechanically push back encroached turf/soil to restore clean asphalt edges for better sealing and appearance.",
    justification:
      "Requires manual/mechanical edge equipment, extra labor time, and disposal handling to achieve crisp lines and longer-lasting seals.",
    unitType: "flat",
    defaultUnitPrice: 150,
    defaultQuantityStrategy: "one",
    tags: ["prep", "aesthetics"],
  },
  {
    id: "weed-killer",
    name: "Vegetation Control (Weed Killer)",
    category: "premium",
    description:
      "Apply herbicide to active growth in cracks and perimeters to prevent reemergence through sealed areas.",
    justification:
      "Licensed handling and proper application timing increase longevity and reduce failures from vegetation.",
    unitType: "flat",
    defaultUnitPrice: 75,
    defaultQuantityStrategy: "one",
    tags: ["prep", "durability"],
  },
  {
    id: "crack-cleaning",
    name: "Professional Crack Cleaning (Heat Lance)",
    category: "premium",
    description:
      "Deep clean and dry cracks using a heat lance to maximize sealant bond and performance.",
    justification:
      "Specialized heat lancing equipment and slow, methodical cleaning significantly improve adhesion and longevity.",
    unitType: "flat",
    defaultUnitPrice: 100,
    defaultQuantityStrategy: "one",
    tags: ["prep", "crack-sealing"],
  },
  {
    id: "power-washing",
    name: "Power Washing (Heavy Cleaning)",
    category: "premium",
    description:
      "High-pressure wash to remove caked dirt, algae, and contaminants prior to sealing or striping.",
    justification:
      "Requires pressure systems, water management, and slower prep to ensure coatings bond to a clean surface.",
    unitType: "flat",
    defaultUnitPrice: 200,
    defaultQuantityStrategy: "one",
    tags: ["cleaning"],
  },
  {
    id: "debris-removal",
    name: "Debris Removal & Hauling (Heavy)",
    category: "premium",
    description:
      "Collect, load, and haul heavy debris, spoils, and vegetation offsite with proper disposal fees.",
    justification:
      "Adds hauling logistics, dump fees, and additional labor/equipment time compared to standard cleanup.",
    unitType: "flat",
    defaultUnitPrice: 125,
    defaultQuantityStrategy: "one",
    tags: ["cleanup", "logistics"],
  },
  {
    id: "infrared-repair",
    name: "Infrared Asphalt Repair",
    category: "premium",
    description:
      "Heat, rework, and blend existing asphalt to repair localized failures without cold seams.",
    justification:
      "Specialized infrared equipment and skilled technicians create seamless, longer-lasting spot repairs.",
    unitType: "perUnit",
    defaultUnitPrice: 600,
    defaultQuantityStrategy: "units",
    tags: ["repair"],
  },
  {
    id: "full-depth-patch",
    name: "Full-Depth Sawcut & Patch",
    category: "premium",
    description:
      "Sawcut failed area, remove base, compact, and install hot-mix asphalt patch to spec.",
    justification:
      "Involves heavy equipment, trucking, compaction, and materials; restores structural integrity.",
    unitType: "perSqFt",
    defaultUnitPrice: 10,
    defaultQuantityStrategy: "area",
    tags: ["repair", "structural"],
  },
  {
    id: "leveling-course",
    name: "Skin Patch / Leveling Course",
    category: "premium",
    description:
      "Feather-in asphalt leveling to correct low spots and promote drainage before sealing.",
    justification:
      "Requires additional hot-mix, compaction, and careful feathering for smooth transitions.",
    unitType: "perSqFt",
    defaultUnitPrice: 3.5,
    defaultQuantityStrategy: "area",
    tags: ["repair", "drainage"],
  },
  {
    id: "overlay",
    name: 'Asphalt Overlay (1"–2")',
    category: "premium",
    description: "Install new asphalt overlay to refresh surface and extend pavement life.",
    justification:
      "Significant material, trucking, and paving equipment requirements; increases service life considerably.",
    unitType: "perSqFt",
    defaultUnitPrice: 4.25,
    defaultQuantityStrategy: "area",
    tags: ["paving"],
  },
  {
    id: "milling",
    name: "Surface Milling / Profiling",
    category: "premium",
    description: "Mill high spots or full lanes to improve cross-slope and tie-in elevations.",
    justification:
      "Requires milling machine mobilization, trucking, and precise elevation control.",
    unitType: "perSqFt",
    defaultUnitPrice: 1.5,
    defaultQuantityStrategy: "area",
    tags: ["paving", "drainage"],
  },
  {
    id: "base-stabilization",
    name: "Base Stabilization / Undercut & Stone",
    category: "premium",
    description: "Excavate soft subgrade, install stone, and compact to restore load capacity.",
    justification:
      "Excavation, stone materials, and compaction equipment add time and cost; prevents reflective failures.",
    unitType: "perSqFt",
    defaultUnitPrice: 6.5,
    defaultQuantityStrategy: "area",
    tags: ["structural"],
  },
  {
    id: "gator-mastic",
    name: "Gator Crack Mastic Repair",
    category: "premium",
    description:
      "Apply polymerized mastic to alligator-cracked areas to bridge and seal distressed surfaces.",
    justification:
      "High-performance materials and precise application restore integrity where simple sealants fail.",
    unitType: "perSqFt",
    defaultUnitPrice: 4,
    defaultQuantityStrategy: "area",
    tags: ["repair"],
  },
  {
    id: "crack-routing",
    name: "Crack Routing + Hot Rubber Sealing",
    category: "premium",
    description:
      "Mechanically route cracks for uniform geometry, then install hot rubber sealant for maximum bond.",
    justification:
      "Routing and hot kettles require experienced crew; provides best-in-class longevity.",
    unitType: "perLinearFt",
    defaultUnitPrice: 1.6,
    defaultQuantityStrategy: "crackLength",
    tags: ["crack-sealing"],
  },
  {
    id: "geotextile-reinforcement",
    name: "Geotextile Fabric Reinforcement",
    category: "premium",
    description:
      "Install reinforcing fabric over working cracks or failed joints beneath seal or overlay.",
    justification:
      "Fabric systems, primers, and careful installation reduce reflective cracking and extend life.",
    unitType: "perSqFt",
    defaultUnitPrice: 2.5,
    defaultQuantityStrategy: "area",
    tags: ["reinforcement"],
  },
  {
    id: "oil-primer-advanced",
    name: "Advanced Oil Spot Treatment (Epoxy/Polymer)",
    category: "premium",
    description: "Prime severe oil spots with specialty primers for superior sealer adhesion.",
    justification:
      "Premium chemistries and multi-step prep mitigate delamination risks in contaminated areas.",
    unitType: "perUnit",
    defaultUnitPrice: 35,
    defaultQuantityStrategy: "units",
    tags: ["prep"],
  },
  {
    id: "thermo-symbols",
    name: "Preformed Thermoplastic Symbols",
    category: "premium",
    description: "Install durable thermoplastic arrows, ADA symbols, and specialty markings.",
    justification:
      "Factory-applied materials require heat application and care; far longer life than paint.",
    unitType: "perUnit",
    defaultUnitPrice: 180,
    defaultQuantityStrategy: "units",
    tags: ["striping"],
  },
  {
    id: "glass-beads",
    name: "Reflective Glass Beads in Paint",
    category: "premium",
    description: "Broadcast glass beads into wet paint for night-time retroreflectivity.",
    justification:
      "Adds material cost and controlled application for enhanced safety and visibility.",
    unitType: "perUnit",
    defaultUnitPrice: 100,
    defaultQuantityStrategy: "units",
    tags: ["striping", "safety"],
  },
  {
    id: "raised-markers",
    name: "Raised Pavement Markers",
    category: "premium",
    description: "Install reflective RPMs where desired for channelization and safety.",
    justification:
      "Adhesives, layout precision, and durable products increase cost but improve guidance and safety.",
    unitType: "perUnit",
    defaultUnitPrice: 12,
    defaultQuantityStrategy: "units",
    tags: ["striping", "safety"],
  },
  {
    id: "wheel-stops",
    name: "Wheel Stop Installation (Epoxy Anchored)",
    category: "premium",
    description:
      "Install concrete or recycled rubber wheel stops with epoxy anchors and precise layout.",
    justification:
      "Heavy units, layout, drilling, and epoxy systems require time and safety handling.",
    unitType: "perUnit",
    defaultUnitPrice: 45,
    defaultQuantityStrategy: "units",
    tags: ["accessories"],
  },
  {
    id: "bollards",
    name: "Bollard Installation / Sleeves",
    category: "premium",
    description: "Install new bollards or sleeves for protection at entries and equipment.",
    justification:
      "Core drilling, concrete, and sleeves involve materials and specialized processes.",
    unitType: "perUnit",
    defaultUnitPrice: 250,
    defaultQuantityStrategy: "units",
    tags: ["accessories", "safety"],
  },
  {
    id: "signage",
    name: "Signage: Manufacture & Install",
    category: "premium",
    description: "Provide posts, bases, and MUTCD-compliant signs installed to spec.",
    justification:
      "Hardware, fabrication, and installation labor exceed standard paint-only marking.",
    unitType: "perUnit",
    defaultUnitPrice: 150,
    defaultQuantityStrategy: "units",
    tags: ["signage"],
  },
  {
    id: "speed-bump",
    name: "Speed Bump / Hump Installation",
    category: "premium",
    description: "Install prefabricated or asphalt-formed traffic calming features with markings.",
    justification: "Materials, layout, and safety coordination add cost; improves campus safety.",
    unitType: "perUnit",
    defaultUnitPrice: 550,
    defaultQuantityStrategy: "units",
    tags: ["safety"],
  },
  {
    id: "asphalt-curb",
    name: "Asphalt Curbing / Edge Build-up",
    category: "premium",
    description: "Construct asphalt berms or curbing to control runoff and protect landscaping.",
    justification:
      "Requires additional hot-mix placement and shaping; functional drainage enhancement.",
    unitType: "perLinearFt",
    defaultUnitPrice: 12,
    defaultQuantityStrategy: "crackLength",
    tags: ["drainage", "landscape"],
  },
  {
    id: "drone-report",
    name: "Drone Imaging & Photogrammetry Report",
    category: "premium",
    description: "Capture aerial imagery for condition assessment and polished client reporting.",
    justification:
      "Piloting, equipment, and report preparation provide superior documentation and transparency.",
    unitType: "flat",
    defaultUnitPrice: 250,
    defaultQuantityStrategy: "one",
    tags: ["documentation"],
  },
  {
    id: "night-schedule",
    name: "Night/Weekend Low-Disruption Scheduling",
    category: "premium",
    description:
      "Perform work outside normal hours to minimize impact to congregants and operations.",
    justification: "Premium labor rates and logistics coordination for off-hours service delivery.",
    unitType: "flat",
    defaultUnitPrice: 300,
    defaultQuantityStrategy: "one",
    tags: ["scheduling"],
  },
  {
    id: "rush-service",
    name: "Rush / Expedited Start",
    category: "premium",
    description: "Accelerated scheduling and procurement to start sooner than standard lead times.",
    justification: "Overtime, priority logistics, and supplier coordination carry premium costs.",
    unitType: "flat",
    defaultUnitPrice: 250,
    defaultQuantityStrategy: "one",
    tags: ["scheduling"],
  },
  {
    id: "permit-traffic-plan",
    name: "Permit Handling & Traffic Control Plan",
    category: "premium",
    description:
      "Prepare documents and submit permits; provide a site-specific traffic control plan if required.",
    justification:
      "Administrative time, drawings, and jurisdiction coordination ensure compliant execution.",
    unitType: "flat",
    defaultUnitPrice: 400,
    defaultQuantityStrategy: "one",
    tags: ["compliance"],
  },
  {
    id: "extended-warranty",
    name: "Extended Warranty + Annual Maintenance Plan",
    category: "premium",
    description: "Extended workmanship coverage with one scheduled annual maintenance visit.",
    justification:
      "We commit future labor/resources to proactive care, reducing total lifecycle cost.",
    unitType: "perUnit",
    defaultUnitPrice: 85,
    defaultQuantityStrategy: "units",
    tags: ["warranty", "maintenance"],
  },
  {
    id: "moisture-remediation",
    name: "Moisture Remediation (Dehumidifier/Blower Setup)",
    category: "premium",
    description:
      "Deploy drying equipment to accelerate cure and mitigate moisture-related failures.",
    justification: "Specialized equipment and additional mobilization protect coating performance.",
    unitType: "flat",
    defaultUnitPrice: 150,
    defaultQuantityStrategy: "one",
    tags: ["prep", "weather"],
  },
  {
    id: "drainage-relief",
    name: "Drainage Relief (Sawcut Slots/Relief Cuts)",
    category: "premium",
    description: "Install relief cuts to redirect standing water and improve drying.",
    justification:
      "Sawcutting, debris removal, and layout correction reduce long-term water damage.",
    unitType: "perLinearFt",
    defaultUnitPrice: 25,
    defaultQuantityStrategy: "crackLength",
    tags: ["drainage"],
  },
  {
    id: "catch-basin-repair",
    name: "Catch Basin/Drainage Structure Repair",
    category: "premium",
    description: "Repair or reconstruct basin frames, lids, and surrounding asphalt as needed.",
    justification:
      "Masonry, concrete, and asphalt work require multiple trades and careful sequencing.",
    unitType: "perUnit",
    defaultUnitPrice: 600,
    defaultQuantityStrategy: "units",
    tags: ["drainage"],
  },
  {
    id: "crack-banding",
    name: "Crack Banding (Mastic over Wide Cracks)",
    category: "premium",
    description:
      "Install banded mastic over larger cracks to bridge movement and prevent infiltration.",
    justification:
      "High-performance mastics and skilled installation significantly outperform basic sealant.",
    unitType: "perLinearFt",
    defaultUnitPrice: 6,
    defaultQuantityStrategy: "crackLength",
    tags: ["crack-sealing"],
  },
  {
    id: "line-removal",
    name: "Line Removal (Grinding/Scarifying)",
    category: "premium",
    description: "Remove unwanted paint lines prior to reconfiguration and restriping.",
    justification:
      "Specialty grinding and dust control equipment ensure clean re-layouts without ghosting.",
    unitType: "perLinearFt",
    defaultUnitPrice: 3,
    defaultQuantityStrategy: "crackLength",
    tags: ["striping"],
  },
  {
    id: "color-seal",
    name: "Decorative Color Seal",
    category: "premium",
    description: "Apply colorized sealer for walkways, play areas, or aesthetic zones.",
    justification: "Special pigments and multi-coat systems add material and labor complexity.",
    unitType: "perSqFt",
    defaultUnitPrice: 0.15,
    defaultQuantityStrategy: "area",
    tags: ["aesthetics"],
  },
  {
    id: "anti-skid-upgrade",
    name: "Anti-Skid Additive Upgrade",
    category: "premium",
    description: "Upgrade aggregate package for improved traction and durability.",
    justification:
      "Higher-cost aggregates and controlled broadcasting yield safer, longer-wearing surfaces.",
    unitType: "perSqFt",
    defaultUnitPrice: 0.03,
    defaultQuantityStrategy: "area",
    tags: ["safety"],
  },
  {
    id: "pre-emergent",
    name: "Pre-Emergent Herbicide Application",
    category: "premium",
    description: "Apply pre-emergent to inhibit new growth under and around pavement edges.",
    justification: "Timing and licensed application extend the life of crack sealing and edges.",
    unitType: "perSqFt",
    defaultUnitPrice: 0.01,
    defaultQuantityStrategy: "area",
    tags: ["prep"],
  },
  {
    id: "edge-regrade",
    name: "Edge Regrading (Topsoil & Seed)",
    category: "premium",
    description:
      "Regrade shoulders, add topsoil, and seed to prevent edge raveling and improve drainage.",
    justification: "Material and labor improve performance and aesthetics at pavement interfaces.",
    unitType: "perLinearFt",
    defaultUnitPrice: 8,
    defaultQuantityStrategy: "crackLength",
    tags: ["drainage", "landscape"],
  },
  {
    id: "ada-relayout",
    name: "ADA Compliance Re-Layout & Documentation",
    category: "premium",
    description:
      "Produce ADA-compliant layout, signage schedule, and deliverables for inspection or records.",
    justification:
      "Professional documentation and field layout reduce compliance risk and enhance accessibility.",
    unitType: "flat",
    defaultUnitPrice: 350,
    defaultQuantityStrategy: "one",
    tags: ["ADA", "documentation"],
  },
  {
    id: "parking-optimization",
    name: "Parking Layout Optimization (Church-Focused)",
    category: "premium",
    description:
      "Reconfigure layout to maximize stalls, improve traffic flow, and support ministry events.",
    justification:
      "Expert planning yields more capacity and safer flow—high value for congregations.",
    unitType: "flat",
    defaultUnitPrice: 300,
    defaultQuantityStrategy: "one",
    tags: ["layout", "church"],
  },
  {
    id: "ministry-coordination",
    name: "Ministry/Event Coordination (Church Scheduling Plan)",
    category: "premium",
    description: "Coordinate phases around services, weddings, and events to minimize disruption.",
    justification:
      "Proactive scheduling and communications reduce downtime and increase satisfaction.",
    unitType: "flat",
    defaultUnitPrice: 150,
    defaultQuantityStrategy: "one",
    tags: ["scheduling", "church"],
  },
  {
    id: "cad-asbuilt",
    name: "As-Built Sketch/CAD Deliverable",
    category: "premium",
    description: "Provide an as-built sketch/CAD for records and future facility planning.",
    justification:
      "Professional documentation improves asset management and future project accuracy.",
    unitType: "flat",
    defaultUnitPrice: 250,
    defaultQuantityStrategy: "one",
    tags: ["documentation"],
  },
  {
    id: "material-submittals",
    name: "Material Submittals & Spec Package",
    category: "premium",
    description:
      "Provide manufacturer data sheets, SDS, and system specs packaged for client/inspector.",
    justification: "Preparation time and documentation support formal procurement and compliance.",
    unitType: "flat",
    defaultUnitPrice: 120,
    defaultQuantityStrategy: "one",
    tags: ["documentation"],
  },
  {
    id: "pothole-emergency",
    name: "Emergency Pothole Repair (Cold Mix)",
    category: "premium",
    description: "Urgent cold-mix patching to eliminate hazards ahead of permanent repair.",
    justification: "Rapid response and on-hand materials mitigate risk and liability.",
    unitType: "perUnit",
    defaultUnitPrice: 65,
    defaultQuantityStrategy: "units",
    tags: ["safety", "repair"],
  },
  {
    id: "snow-markers",
    name: "Snowplow Marker Installation",
    category: "premium",
    description:
      "Install flexible markers to protect curbs, islands, and features during winter plowing.",
    justification: "Protective hardware reduces seasonal damage and repaint costs.",
    unitType: "perUnit",
    defaultUnitPrice: 12,
    defaultQuantityStrategy: "units",
    tags: ["winter"],
  },
];

export function getServiceById(id: string): ServiceDefinition | undefined {
  return [...STANDARD_SERVICES, ...PREMIUM_SERVICES].find((s) => s.id === id);
}

export function getServiceByName(name: string): ServiceDefinition | undefined {
  return [...STANDARD_SERVICES, ...PREMIUM_SERVICES].find((s) => s.name === name);
}
