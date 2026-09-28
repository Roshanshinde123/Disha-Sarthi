import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MiniMapProps {
  lat?: number | null;
  lng?: number | null;
  radiusKm?: number;
  centerName?: string;
  centerLat?: number | null;
  centerLng?: number | null;
}

function isValidCoordinate(lat?: number | null, lng?: number | null): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
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

  const hasValidUser = isValidCoordinate(lat, lng);
  const hasValidCenter = isValidCoordinate(centerLat, centerLng);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const userCoord: [number, number] = hasValidUser
      ? [lat!, lng!]
      : hasValidCenter
      ? [centerLat!, centerLng!]
      : [18.5204, 73.8567]; // Pune fallback

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false
      }).setView(userCoord, 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
      }).addTo(map);

      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 80);
      setTimeout(() => map.invalidateSize(), 300);
    }

    const map = mapInstanceRef.current;
    if (map) {
      map.setView(userCoord, 11);

      if (hasValidUser) {
        const userMarkerIcon = L.divIcon({
          className: 'user-map-pin',
          html: `<div style="background:#15803D;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:12px;">●</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([lat!, lng!], { icon: userMarkerIcon })
          .addTo(map)
          .bindPopup('आपले स्थान (Your Location)');

        if (radiusKm && radiusKm > 0) {
          L.circle([lat!, lng!], {
            radius: radiusKm * 1000,
            color: '#15803D',
            fillColor: '#15803D',
            fillOpacity: 0.1,
            weight: 1.5,
            dashArray: '3, 3'
          }).addTo(map);
        }
      }

      if (hasValidCenter) {
        const centerIcon = L.divIcon({
          className: 'tc-map-pin',
          html: `<div style="background:#D97706;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:12px;">🏢</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([centerLat!, centerLng!], { icon: centerIcon })
          .addTo(map)
          .bindPopup(centerName || 'प्रशिक्षण केंद्र (Training Center)');
      }

      map.invalidateSize();
    }
  }, [lat, lng, radiusKm, centerLat, centerLng, centerName, hasValidUser, hasValidCenter]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '220px' }}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '10px',
          border: '1px solid #CBD5E1',
          overflow: 'hidden',
          background: '#E2E8F0'
        }}
      />
    </div>
  );
};
