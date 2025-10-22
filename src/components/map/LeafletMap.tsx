import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import 'leaflet-geometryutil';
import type { Coordinates } from '@/lib/locations';
import { getBusinessCoords, getSupplierCoords, BUSINESS_ADDRESS, SUPPLIER_ADDRESS, BUSINESS_COORDS_FALLBACK, SUPPLIER_COORDS_FALLBACK } from '@/lib/locations';
import { listJobs, type SavedJob } from '@/lib/idb';
import { loadMapSettings, type MapSettings } from '@/lib/mapSettings';
import { fetchRadarFrames, getTileUrlForFrame } from '@/lib/radar';

export interface LeafletMapProps {
  onAddressUpdate: (coords: [number, number], address: string) => void;
  onAreaDrawn: (area: number) => void;
  onCrackLengthDrawn: (length: number) => void;
  customerAddress: string;
  refreshKey?: number;
}

const statusColor: Record<string, string> = {
  need_estimate: '#f59e0b',
  estimated: '#3b82f6',
  active: '#22c55e',
  completed: '#6b7280',
  lost: '#ef4444',
};

function createBaseLayer(id: MapSettings['baseLayer']): L.TileLayer {
  switch (id) {
    case 'osm_standard':
      return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' });
    case 'carto_voyager':
      return L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', { attribution: '© CARTO' });
    case 'stamen_terrain':
      return L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', { attribution: 'Map tiles by Stamen' });
    case 'esri_satellite':
    default:
      return L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles © Esri' });
  }
}

export const LeafletMap = ({ onAddressUpdate, onAreaDrawn, onCrackLengthDrawn, customerAddress, refreshKey }: LeafletMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const jobsLayerRef = useRef<L.LayerGroup | null>(null);
  const businessMarkerRef = useRef<L.Marker | null>(null);
  const supplierMarkerRef = useRef<L.Marker | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const overlayLayersRef = useRef<Record<string, L.Layer>>({});
  const radarIntervalRef = useRef<number | null>(null);
  const radarLayersRef = useRef<L.TileLayer[]>([]);

  const businessCoordsFallback: Coordinates = BUSINESS_COORDS_FALLBACK;
  const supplierCoordsFallback: Coordinates = SUPPLIER_COORDS_FALLBACK;

  function initBaseAndOverlays(map: L.Map, settings: MapSettings) {
    // Base layer
    const base = createBaseLayer(settings.baseLayer);
    base.addTo(map);
    baseLayerRef.current = base;

    // Overlays (tiles and WMS) except radar handled here
    overlayLayersRef.current = {};
    settings.overlays.forEach((o) => {
      if (!o.visible) return;
      if (o.type === 'tile' && o.urlTemplate) {
        const tl = L.tileLayer(o.urlTemplate, {
          attribution: o.attribution,
          opacity: o.opacity ?? 1,
        }).addTo(map);
        overlayLayersRef.current[o.id] = tl;
      } else if (o.type === 'wms' && o.urlTemplate && o.wmsParams?.layers) {
        const w = (L as any).tileLayer.wms(o.urlTemplate, {
          layers: o.wmsParams.layers,
          format: o.wmsParams.format ?? 'image/png',
          transparent: o.wmsParams.transparent ?? true,
          version: o.wmsParams.version ?? '1.3.0',
          opacity: o.opacity ?? 1,
          attribution: o.attribution,
        });
        w.addTo(map);
        overlayLayersRef.current[o.id] = w;
      }
    });
  }

  async function setupRadar(map: L.Map, settings: MapSettings) {
    // Clear old
    radarLayersRef.current.forEach((l) => map.removeLayer(l));
    radarLayersRef.current = [];
    if (radarIntervalRef.current) {
      window.clearInterval(radarIntervalRef.current);
      radarIntervalRef.current = null;
    }

    const radarOverlayCfg = settings.overlays.find((o) => o.id === 'radar' && o.visible);
    if (!settings.radar.enabled || !radarOverlayCfg) return;

    const frames = await fetchRadarFrames();
    if (!frames.length) return;

    const layers = frames.map((f) =>
      L.tileLayer(getTileUrlForFrame(f), { opacity: radarOverlayCfg.opacity ?? settings.radar.opacity, zIndex: 300 })
    );
    radarLayersRef.current = layers;
    let idx = layers.length - 1; // latest
    layers[idx].addTo(map);

    if (settings.radar.animate) {
      radarIntervalRef.current = window.setInterval(() => {
        const current = layers[idx];
        map.removeLayer(current);
        idx = (idx + 1) % layers.length;
        layers[idx].addTo(map);
      }, Math.max(100, settings.radar.frameDelayMs));
    }
  }

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const settings = loadMapSettings();
    const initialCenter = settings.center ?? businessCoordsFallback;
    const map = L.map(mapContainer.current, { zoomControl: true }).setView(initialCenter, settings.zoom ?? 18);
    mapRef.current = map;

    // Try to get user's current location; zoom to max (~19 for most tiles)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [position.coords.latitude, position.coords.longitude];
          map.setView(userCoords, 19);
        },
        () => {},
        { timeout: 4000 }
      );
    }

    initBaseAndOverlays(map, settings);

    // Add job markers layer
    const jobsLayer = new L.LayerGroup();
    jobsLayerRef.current = jobsLayer;
    map.addLayer(jobsLayer);

    // Business and supplier markers
    businessMarkerRef.current = L.marker(businessCoordsFallback).addTo(map).bindPopup(`<b>Your Business</b><br>${BUSINESS_ADDRESS}`).openPopup();
    supplierMarkerRef.current = L.marker(supplierCoordsFallback).addTo(map).bindPopup(`<b>SealMaster Supplier</b><br>${SUPPLIER_ADDRESS}`);
    (async () => {
      try {
        const [biz, sup] = await Promise.all([getBusinessCoords(), getSupplierCoords()]);
        businessMarkerRef.current?.setLatLng(biz);
        supplierMarkerRef.current?.setLatLng(sup);
        map.setView(biz, Math.max(map.getZoom(), 12));
      } catch {}
    })();

    // Drawing tools
    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    map.addLayer(drawnItems);
    const drawControl = new (L as any).Control.Draw({
      position: 'topleft',
      edit: { featureGroup: drawnItems },
      draw: {
        polygon: { allowIntersection: false, showArea: true, metric: false },
        polyline: { showLength: true, metric: false },
        rectangle: { showArea: true, metric: false },
        circle: false,
        marker: false,
        circlemarker: false,
      },
    });
    map.addControl(drawControl);

    map.on((L as any).Draw.Event.CREATED, (e: any) => {
      const type = e.layerType;
      const layer = e.layer;
      drawnItems.addLayer(layer);

      if (type === 'polygon' || type === 'rectangle') {
        const latlngs = layer.getLatLngs()[0];
        const areaMeters = (L as any).GeometryUtil.geodesicArea(latlngs);
        const areaFeet = areaMeters * 10.7639;
        onAreaDrawn(areaFeet);
      }
      if (type === 'polyline') {
        let distanceMeters = 0;
        const latlngs = layer.getLatLngs();
        for (let i = 0; i < latlngs.length - 1; i++) {
          distanceMeters += latlngs[i].distanceTo(latlngs[i + 1]);
        }
        const distanceFeet = distanceMeters * 3.28084;
        onCrackLengthDrawn(distanceFeet);
      }
    });

    // Geocoder
    (L.Control as any)
      .geocoder({ defaultMarkGeocode: false, placeholder: 'Search for an address...', errorMessage: 'Nothing found.' })
      .on('markgeocode', (e: any) => {
        const { center, name } = e.geocode;
        const coords: [number, number] = [center.lat, center.lng];
        updateCustomerMarker(coords, name);
        map.setView(coords, 19);
      })
      .addTo(map);

    // Click handler (reverse geocode via OSM)
    map.on('click', async (e: L.LeafletMouseEvent) => {
      if ((document.body as any).classList.contains('leaflet-draw-activated')) return;
      const { lat, lng } = e.latlng;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        if (data?.display_name) {
          updateCustomerMarker([lat, lng], data.display_name);
          map.panTo([lat, lng]);
        }
      } catch {}
    });

    map.on('draw:drawstart', () => document.body.classList.add('leaflet-draw-activated'));
    map.on('draw:drawstop', () => document.body.classList.remove('leaflet-draw-activated'));

    addLegend(map);
    renderJobsMarkers();
    setupRadar(map, settings);

    // Persist center/zoom
    map.on('moveend zoomend', () => {
      const c = map.getCenter();
      const s = loadMapSettings();
      const next = { ...s, center: [c.lat, c.lng] as [number, number], zoom: map.getZoom() };
      localStorage.setItem('pps.mapSettings.v1', JSON.stringify(next));
    });

    return () => {
      if (radarIntervalRef.current) window.clearInterval(radarIntervalRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const updateCustomerMarker = (coords: [number, number], displayName: string) => {
    if (!mapRef.current) return;
    if (customerMarkerRef.current) {
      mapRef.current.removeLayer(customerMarkerRef.current);
    }
    const marker = L.marker(coords)
      .addTo(mapRef.current)
      .bindPopup(`<b>Job Site</b><br>${displayName}`)
      .openPopup();
    customerMarkerRef.current = marker;
    onAddressUpdate(coords, displayName);
  };

  const renderJobsMarkers = async () => {
    if (!mapRef.current || !jobsLayerRef.current) return;
    const layer = jobsLayerRef.current;
    layer.clearLayers();
    try {
      const jobs: SavedJob[] = await listJobs();
      for (const job of jobs) {
        if (!job.coords) continue;
        const color = statusColor[job.status] || '#10b981';
        const marker = L.circleMarker(job.coords as L.LatLngExpression, {
          radius: 7,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.7,
        });
        const comp = job.status === 'lost' && job.competitor ? `<br><i>Lost to:</i> ${escapeHtml(job.competitor)}` : '';
        marker.bindPopup(`
          <b>${escapeHtml(job.name || 'Job')}</b>
          <br>${escapeHtml(job.address)}
          <br><b>Status:</b> ${escapeHtml(job.status)}${comp}
        `);
        marker.addTo(layer);
      }
    } catch {}
  };

  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function addLegend(map: L.Map) {
    const legendControl = new L.Control({ position: 'bottomright' });
    legendControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
      div.style.padding = '8px';
      div.style.background = 'white';
      div.style.borderRadius = '6px';
      div.style.boxShadow = '0 1px 2px rgba(0,0,0,0.2)';
      const entries = [
        ['need_estimate', statusColor.need_estimate],
        ['estimated', statusColor.estimated],
        ['active', statusColor.active],
        ['completed', statusColor.completed],
        ['lost', statusColor.lost],
      ] as const;
      div.innerHTML = `
        <div style="font-weight:bold;margin-bottom:4px;">Jobs</div>
        ${entries
          .map(
            ([label, color]) => `<div style="display:flex;align-items:center;gap:6px;margin:2px 0;">
            <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${color};border:1px solid #00000022"></span>
            <span style="font-size:12px;text-transform:capitalize;">${label.replace('_', ' ')}</span>
          </div>`
          )
          .join('')}
      `;
      return div;
    };
    legendControl.addTo(map);
  }

  // Geocode address when it changes externally
  useEffect(() => {
    const geocodeAddress = async () => {
      if (!customerAddress || !mapRef.current) return;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customerAddress)}`
        );
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          const latNum = parseFloat(lat);
          const lonNum = parseFloat(lon);
          updateCustomerMarker([latNum, lonNum], display_name);
          mapRef.current.setView([latNum, lonNum], 19);
        }
      } catch {}
    };
    const timer = setTimeout(geocodeAddress, 500);
    return () => clearTimeout(timer);
  }, [customerAddress]);

  // Refresh persistent job markers when requested
  useEffect(() => {
    renderJobsMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return <div ref={mapContainer} className="h-[450px] w-full rounded-lg shadow-lg border border-border" />;
};

export default LeafletMap;
