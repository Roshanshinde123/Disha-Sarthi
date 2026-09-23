import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MiniMapProps {
  lat: number;
  lng: number;
  radiusKm?: number;
  centerName?: string;
  centerLat?: number;
  centerLng?: number;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  lat,
  lng,
  radiusKm = 10,
  centerName,
  centerLat,
  centerLng
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: true
      }).setView([lat, lng], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
      }).addTo(map);

      // Beneficiary Marker
      const userMarkerIcon = L.divIcon({
        className: 'user-map-pin',
        html: `<div style="background:#1F6F4A;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:12px;">📍</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([lat, lng], { icon: userMarkerIcon })
        .addTo(map)
        .bindPopup('आपका स्थान (Your Location)');

      // Travel Radius Circle
      L.circle([lat, lng], {
        radius: radiusKm * 1000,
        color: '#1F6F4A',
        fillColor: '#1F6F4A',
        fillOpacity: 0.12,
        weight: 2
      }).addTo(map);

      // Optional Training Center Marker
      if (centerLat && centerLng) {
        const centerIcon = L.divIcon({
          className: 'tc-map-pin',
          html: `<div style="background:#E0A32E;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:12px;">🏢</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([centerLat, centerLng], { icon: centerIcon })
          .addTo(map)
          .bindPopup(centerName || 'प्रशिक्षण केंद्र (Training Center)');
      }

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([lat, lng], 11);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, radiusKm, centerLat, centerLng, centerName]);

  return <div ref={mapContainerRef} className="mini-map" />;
};
