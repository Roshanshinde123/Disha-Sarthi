import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Session } from '../../core/types';
import districtsData from '../../data/districts.json';

interface PlanningMapProps {
  sessions: Session[];
  selectedDistrict: string | null;
  onSelectDistrict: (district: string) => void;
}

export const PlanningMap: React.FC<PlanningMapProps> = ({
  sessions,
  selectedDistrict: _selectedDistrict,
  onSelectDistrict
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize India map
      const map = L.map(mapContainerRef.current, {
        attributionControl: true
      }).setView([19.7515, 75.7139], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Aggregate sessions by district
      const districtCounts: Record<string, { count: number; transportBarriers: number; lat: number; lng: number; state: string }> = {};

      for (const s of sessions) {
        const dName = s.profile.district || 'Varanasi';
        if (!districtCounts[dName]) {
          const matchedD = (districtsData as any[]).find((d) => d.name.toLowerCase() === dName.toLowerCase()) || {
            lat: s.profile.lat || 25.3176,
            lng: s.profile.lng || 82.9739,
            state: s.profile.state || 'Uttar Pradesh'
          };
          districtCounts[dName] = {
            count: 0,
            transportBarriers: 0,
            lat: matchedD.lat,
            lng: matchedD.lng,
            state: matchedD.state
          };
        }
        districtCounts[dName].count++;
        if (s.recommendations?.[0]?.no_center_in_range) {
          districtCounts[dName].transportBarriers++;
        }
      }

      // Add circle markers for each district
      for (const [distName, data] of Object.entries(districtCounts)) {
        const hasGap = data.transportBarriers > 0;
        // Map ramp: field (#1F6F4A) -> turmeric (#E0A32E) -> madder (#A8322D)
        const markerColor = hasGap ? '#A8322D' : data.count > 5 ? '#1F6F4A' : '#E0A32E';
        const markerRadius = Math.min(24, Math.max(10, data.count * 2.5));

        const circleMarker = L.circleMarker([data.lat, data.lng], {
          radius: markerRadius,
          color: markerColor,
          fillColor: markerColor,
          fillOpacity: 0.7,
          weight: 2
        }).addTo(map);

        const popupContent = `
          <div style="font-family:sans-serif;padding:4px;">
            <strong style="font-size:14px;color:#14201A;">${distName} (${data.state})</strong><br/>
            <span style="font-size:12px;color:#5D6B63;">Beneficiaries Counseled: <strong>${data.count}</strong></span><br/>
            ${
              hasGap
                ? `<span style="font-size:11px;color:#A8322D;font-weight:bold;">⚠️ Capacity Gap / Transport Barrier: ${data.transportBarriers}</span>`
                : `<span style="font-size:11px;color:#1F6F4A;font-weight:bold;">✅ Centers in Range</span>`
            }
          </div>
        `;

        circleMarker.bindPopup(popupContent);
        circleMarker.on('click', () => {
          onSelectDistrict(distName);
        });
      }

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [sessions, onSelectDistrict]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)' }}>
          🗺️ जिलावार कौशल मांग व क्षमता अंतर मानचित्र (Planning Map)
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', alignItems: 'center' }}>
          <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#1F6F4A', marginRight: '4px' }}></span>केंद्र उपलब्ध</span>
          <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#E0A32E', marginRight: '4px' }}></span>मध्यम मांग</span>
          <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#A8322D', marginRight: '4px' }}></span>क्षमता अंतर / दूरी अवरोध</span>
        </div>
      </div>
      <div ref={mapContainerRef} className="map-container" id="planning-map-leaflet" />
    </div>
  );
};
