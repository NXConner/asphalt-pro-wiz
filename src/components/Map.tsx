import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';

interface MapProps {
  onAddressUpdate: (coords: [number, number], address: string) => void;
  onAreaDrawn: (area: number) => void;
  onCrackLengthDrawn: (length: number) => void;
  customerAddress: string;
}

const Map = ({ onAddressUpdate, onAreaDrawn, onCrackLengthDrawn, customerAddress }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);

  const businessCoords: [number, number] = [36.7388, -80.2692];
  const supplierCoords: [number, number] = [36.3871, -79.9578];

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainer.current).setView(businessCoords, 10);
    mapRef.current = map;

    // Satellite base layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    // Road and label overlay
    L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}').addTo(map);

    // Add business and supplier markers
    L.marker(businessCoords).addTo(map).bindPopup('<b>Your Business</b>').openPopup();
    L.marker(supplierCoords).addTo(map).bindPopup('<b>SealMaster Supplier</b>');

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

  // Geocode address when it changes externally
  useEffect(() => {
    const geocodeAddress = async () => {
      if (!customerAddress || !mapRef.current) return;
      
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customerAddress)}`);
        const data = await response.json();
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          updateCustomerMarker([parseFloat(lat), parseFloat(lon)], display_name);
          mapRef.current.setView([lat, lon], 18);
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
      }
    };

    const timer = setTimeout(geocodeAddress, 500);
    return () => clearTimeout(timer);
  }, [customerAddress]);

  return (
    <div ref={mapContainer} className="h-[450px] w-full rounded-lg shadow-lg border border-border" />
  );
};

export default Map;
