import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import type { Coordinates } from '@/lib/locations';
import { getBusinessCoords, getSupplierCoords, BUSINESS_ADDRESS, SUPPLIER_ADDRESS, BUSINESS_COORDS_FALLBACK, SUPPLIER_COORDS_FALLBACK } from '@/lib/locations';
import { listJobs, type SavedJob } from '@/lib/idb';

interface MapProps {
  onAddressUpdate: (coords: [number, number], address: string) => void;
  onAreaDrawn: (area: number) => void;
  onCrackLengthDrawn: (length: number) => void;
  customerAddress: string;
  refreshKey?: number;
}

const statusColor: Record<string, string> = {
  need_estimate: '#f59e0b', // amber-500
  estimated: '#3b82f6', // blue-500
  active: '#22c55e', // green-500
  completed: '#6b7280', // gray-500
  lost: '#ef4444', // red-500
};

const Map = ({ onAddressUpdate, onAreaDrawn, onCrackLengthDrawn, customerAddress, refreshKey }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const jobsLayerRef = useRef<L.LayerGroup | null>(null);
  const businessMarkerRef = useRef<L.Marker | null>(null);
  const supplierMarkerRef = useRef<L.Marker | null>(null);

  const businessCoordsFallback: Coordinates = BUSINESS_COORDS_FALLBACK;
  const supplierCoordsFallback: Coordinates = SUPPLIER_COORDS_FALLBACK;

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Initialize map - start with business coords, will update to user location
    const map = L.map(mapContainer.current).setView(businessCoordsFallback, 10);
    mapRef.current = map;

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [position.coords.latitude, position.coords.longitude];
          map.setView(userCoords, 18);
        },
        (error) => {
          console.log('Geolocation not available, using business location:', error.message);
        },
        { timeout: 5000 }
      );
    }

    // Satellite base layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    // Road and label overlay
    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}').addTo(map);

    // Add job markers layer
    const jobsLayer = new L.LayerGroup();
    jobsLayerRef.current = jobsLayer;
    map.addLayer(jobsLayer);

    // Add business and supplier markers (fallback first)
    businessMarkerRef.current = L.marker(businessCoordsFallback).addTo(map).bindPopup(`<b>Your Business</b><br>${BUSINESS_ADDRESS}`).openPopup();
    supplierMarkerRef.current = L.marker(supplierCoordsFallback).addTo(map).bindPopup(`<b>SealMaster Supplier</b><br>${SUPPLIER_ADDRESS}`);

    // Resolve actual geocoded coords asynchronously and update markers
    (async () => {
      try {
        const [biz, sup] = await Promise.all([getBusinessCoords(), getSupplierCoords()]);
        if (businessMarkerRef.current) {
          businessMarkerRef.current.setLatLng(biz);
        }
        if (supplierMarkerRef.current) {
          supplierMarkerRef.current.setLatLng(sup);
        }
        map.setView(biz, 12);
      } catch {}
    })();

    // Initialize drawing tools
    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      position: 'topleft',
      edit: { featureGroup: drawnItems },
      draw: {
        polygon: { 
          allowIntersection: false, 
          showArea: true, 
          metric: false 
        },
        polyline: { 
          showLength: true, 
          metric: false 
        },
        rectangle: { 
          showArea: true, 
          metric: false 
        },
        circle: false,
        marker: false,
        circlemarker: false
      }
    });
    map.addControl(drawControl);

    // Handle drawn shapes
    map.on(L.Draw.Event.CREATED, (e: any) => {
      const type = e.layerType;
      const layer = e.layer;
      drawnItems.addLayer(layer);

      if (type === 'polygon' || type === 'rectangle') {
        const latlngs = layer.getLatLngs()[0];
        // Calculate geodesic area using Leaflet's built-in method
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
    const geocoder = (L.Control as any).geocoder({
      defaultMarkGeocode: false,
      placeholder: 'Search for an address...',
      errorMessage: 'Nothing found.'
    }).on('markgeocode', (e: any) => {
      const { center, name } = e.geocode;
      const coords: [number, number] = [center.lat, center.lng];
      updateCustomerMarker(coords, name);
      map.setView(coords, 18);
    }).addTo(map);

    // Map click handler
    map.on('click', async (e: L.LeafletMouseEvent) => {
      if ((document.body as any).classList.contains('leaflet-draw-activated')) return;
      
      const { lat, lng } = e.latlng;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        if (data && data.display_name) {
          updateCustomerMarker([lat, lng], data.display_name);
          map.panTo([lat, lng]);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    });

    map.on('draw:drawstart', () => {
      document.body.classList.add('leaflet-draw-activated');
    });

    map.on('draw:drawstop', () => {
      document.body.classList.remove('leaflet-draw-activated');
    });

    addLegend(map);

    // Initial render of persistent job markers
    renderJobsMarkers();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const updateCustomerMarker = (coords: [number, number], displayName: string) => {
    if (!mapRef.current) return;
    
    if (customerMarkerRef.current) {
      mapRef.current.removeLayer(customerMarkerRef.current);
    }
    
    const marker = L.marker(coords).addTo(mapRef.current)
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
    } catch (e) {
      // ignore
    }
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
          .map(([label, color]) => `<div style="display:flex;align-items:center;gap:6px;margin:2px 0;">
            <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${color};border:1px solid #00000022"></span>
            <span style="font-size:12px;text-transform:capitalize;">${label.replace('_', ' ')}</span>
          </div>`)
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
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customerAddress)}`);
        const data = await response.json();
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          const latNum = parseFloat(lat);
          const lonNum = parseFloat(lon);
          updateCustomerMarker([latNum, lonNum], display_name);
          mapRef.current.setView([latNum, lonNum], 18);
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
      }
    };

    const timer = setTimeout(geocodeAddress, 500);
    return () => clearTimeout(timer);
  }, [customerAddress]);

  // Refresh persistent job markers when requested
  useEffect(() => {
    renderJobsMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <div ref={mapContainer} className="h-[450px] w-full rounded-lg shadow-lg border border-border" />
  );
};

export default Map;
