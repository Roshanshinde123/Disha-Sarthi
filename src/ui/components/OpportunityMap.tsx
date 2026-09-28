// Disha Sarathi - Grounded & Responsive Opportunity Map Component (PS 26097)
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LanguageCode } from '../../core/types';

export interface OpportunityMapItem {
  id: string;
  title: string;
  employerName?: string;
  company_or_agency?: string;
  location?: string;
  address?: string;
  district?: string;
  state?: string;
  lat?: number | null;
  lng?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
  salaryRange?: string;
  wage_or_support_inr?: string;
  isLive?: boolean;
  isDemo?: boolean;
  is_demo_seed?: boolean;
  type?: string;
  contactPerson?: string;
  contactPhone?: string;
}

export interface TrainingCenterMapItem {
  id: string;
  name: string;
  district?: string;
  state?: string;
  lat?: number | null;
  lng?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
  address?: string;
  contactPhone?: string;
  isDemo?: boolean;
}

export interface OpportunityMapProps {
  userLocation?: { lat: number; lng: number; label?: string } | null;
  radiusKm?: number;
  opportunities?: OpportunityMapItem[];
  trainingCenters?: TrainingCenterMapItem[];
  selectedId?: string | null;
  onSelectOpportunity?: (opp: OpportunityMapItem) => void;
  onSelectCenter?: (center: TrainingCenterMapItem) => void;
  height?: number | string;
  lang?: LanguageCode;
}

function isValidCoordinate(lat?: number | null, lng?: number | null): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export const OpportunityMap: React.FC<OpportunityMapProps> = ({
  userLocation,
  radiusKm = 25,
  opportunities = [],
  trainingCenters = [],
  selectedId,
  onSelectOpportunity,
  onSelectCenter,
  height,
  lang = 'mr'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Validate coordinates synchronously
  const validUser = userLocation && isValidCoordinate(userLocation.lat, userLocation.lng)
    ? { lat: userLocation.lat, lng: userLocation.lng, label: userLocation.label }
    : null;

  const validOpps = opportunities
    .map((o) => {
      const lat = o.latitude ?? o.lat;
      const lng = o.longitude ?? o.lng;
      return isValidCoordinate(lat, lng) ? { ...o, cleanLat: lat!, cleanLng: lng! } : null;
    })
    .filter(Boolean) as (OpportunityMapItem & { cleanLat: number; cleanLng: number })[];

  const validCenters = trainingCenters
    .map((c) => {
      const lat = c.latitude ?? c.lat;
      const lng = c.longitude ?? c.lng;
      return isValidCoordinate(lat, lng) ? { ...c, cleanLat: lat!, cleanLng: lng! } : null;
    })
    .filter(Boolean) as (TrainingCenterMapItem & { cleanLat: number; cleanLng: number })[];

  const hasAnyCoordinates = Boolean(validUser || validOpps.length > 0 || validCenters.length > 0);

  // Initialize and maintain map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter: [number, number] = validUser
        ? [validUser.lat, validUser.lng]
        : validOpps[0]
        ? [validOpps[0].cleanLat, validOpps[0].cleanLng]
        : validCenters[0]
        ? [validCenters[0].cleanLat, validCenters[0].cleanLng]
        : [18.5204, 73.8567]; // Pune centroid fallback

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false
      }).setView(defaultCenter, 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
      }).addTo(map);

      const group = L.layerGroup().addTo(map);
      layerGroupRef.current = group;
      mapInstanceRef.current = map;

      // Invalidate sizes at intervals for robust container mounting
      setTimeout(() => map.invalidateSize(), 50);
      setTimeout(() => map.invalidateSize(), 250);
      setTimeout(() => map.invalidateSize(), 600);
    }

    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    const boundsPoints: [number, number][] = [];

    // 1. Beneficiary Marker (Green Circle)
    if (validUser) {
      boundsPoints.push([validUser.lat, validUser.lng]);

      const userIcon = L.divIcon({
        className: 'user-map-pin-div',
        html: `
          <div style="background:#15803D;color:#FFFFFF;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #FFFFFF;box-shadow:0 3px 8px rgba(0,0,0,0.35);font-size:14px;cursor:pointer;">
            ●
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const userMarker = L.marker([validUser.lat, validUser.lng], { icon: userIcon });
      const userPopup = `
        <div style="font-family:sans-serif;padding:6px 8px;min-width:140px;">
          <div style="font-weight:700;font-size:13px;color:#15803D;">
            ${lang === 'mr' ? 'आपले स्थान' : lang === 'hi' ? 'आपका स्थान' : 'Your Location'}
          </div>
          <div style="font-size:11px;color:#64748B;margin-top:2px;">
            ${validUser.label || (lang === 'mr' ? 'नोंदवलेले स्थान' : 'Registered Location')}
          </div>
        </div>
      `;
      userMarker.bindPopup(userPopup);
      group.addLayer(userMarker);

      // Travel Radius Circle
      if (radiusKm && radiusKm > 0) {
        const radiusCircle = L.circle([validUser.lat, validUser.lng], {
          radius: radiusKm * 1000,
          color: '#15803D',
          fillColor: '#15803D',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '4, 4'
        });
        group.addLayer(radiusCircle);
      }
    }

    // 2. Opportunity Markers (Blue Badge)
    validOpps.forEach((opp, idx) => {
      boundsPoints.push([opp.cleanLat, opp.cleanLng]);
      const isSelected = selectedId === opp.id;
      const oppTitle = opp.title || 'Opportunity';
      const employer = opp.employerName || opp.company_or_agency || 'Employer';
      const locText = opp.location || opp.address || opp.district || 'Location';
      const salary = opp.salaryRange || opp.wage_or_support_inr;
      const dist = opp.distanceKm !== null && opp.distanceKm !== undefined ? `${opp.distanceKm} km` : null;

      const oppIcon = L.divIcon({
        className: 'opp-map-pin-div',
        html: `
          <div style="background:${isSelected ? '#1D4ED8' : '#2563EB'};color:#FFFFFF;padding:4px 8px;border-radius:14px;display:flex;align-items:center;gap:4px;border:2px solid #FFFFFF;box-shadow:0 3px 8px rgba(0,0,0,0.25);font-size:11px;font-weight:700;white-space:nowrap;cursor:pointer;">
            <span>📍</span>
            <span>${idx + 1}. ${employer.length > 15 ? employer.slice(0, 15) + '…' : employer}</span>
          </div>
        `,
        iconSize: [120, 28],
        iconAnchor: [60, 14]
      });

      const marker = L.marker([opp.cleanLat, opp.cleanLng], { icon: oppIcon });
      const popupHtml = `
        <div style="font-family:sans-serif;padding:6px;max-width:240px;line-height:1.4;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#2563EB;margin-bottom:2px;">
            ${lang === 'mr' ? '💼 रोजगार / उपजीविका संधी' : lang === 'hi' ? '💼 रोजगार / आजीविका अवसर' : '💼 Opportunity'}
          </div>
          <div style="font-weight:700;font-size:13px;color:#0F172A;">${employer}</div>
          <div style="font-size:12px;color:#334155;margin-top:2px;">${oppTitle}</div>
          <div style="font-size:11px;color:#64748B;margin-top:4px;">📍 ${locText}</div>
          ${dist ? `<div style="font-size:11px;color:#15803D;font-weight:600;margin-top:2px;">🚗 ${dist}</div>` : ''}
          ${salary ? `<div style="font-size:11px;color:#854D0E;margin-top:2px;">💵 ${salary}</div>` : ''}
          <div style="font-size:10px;color:#94A3B8;margin-top:4px;">
            ${opp.isDemo || opp.is_demo_seed ? '(Indicative Demo Data)' : 'Verified Registry'}
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        if (onSelectOpportunity) onSelectOpportunity(opp);
      });
      group.addLayer(marker);
    });

    // 3. Training Center Markers (Orange Badge)
    validCenters.forEach((center) => {
      boundsPoints.push([center.cleanLat, center.cleanLng]);
      const centerName = center.name || 'Training Center';
      const centerAddr = center.address || center.district || 'Location';
      const centerDist = center.distanceKm !== null && center.distanceKm !== undefined ? `${center.distanceKm} km` : null;

      const centerIcon = L.divIcon({
        className: 'tc-map-pin-div',
        html: `
          <div style="background:#D97706;color:#FFFFFF;padding:4px 8px;border-radius:14px;display:flex;align-items:center;gap:4px;border:2px solid #FFFFFF;box-shadow:0 3px 8px rgba(0,0,0,0.25);font-size:11px;font-weight:700;white-space:nowrap;cursor:pointer;">
            <span>🏢</span>
            <span>${centerName.length > 15 ? centerName.slice(0, 15) + '…' : centerName}</span>
          </div>
        `,
        iconSize: [120, 28],
        iconAnchor: [60, 14]
      });

      const marker = L.marker([center.cleanLat, center.cleanLng], { icon: centerIcon });
      const popupHtml = `
        <div style="font-family:sans-serif;padding:6px;max-width:240px;line-height:1.4;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#D97706;margin-bottom:2px;">
            ${lang === 'mr' ? '🏢 अधिकृत प्रशिक्षण केंद्र' : lang === 'hi' ? '🏢 प्रमाणित प्रशिक्षण केंद्र' : '🏢 Training Center'}
          </div>
          <div style="font-weight:700;font-size:13px;color:#0F172A;">${centerName}</div>
          <div style="font-size:11px;color:#64748B;margin-top:4px;">📍 ${centerAddr}</div>
          ${centerDist ? `<div style="font-size:11px;color:#15803D;font-weight:600;margin-top:2px;">🚗 ${centerDist}</div>` : ''}
          ${center.contactPhone ? `<div style="font-size:11px;color:#334155;margin-top:2px;">📞 ${center.contactPhone}</div>` : ''}
        </div>
      `;
      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        if (onSelectCenter) onSelectCenter(center);
      });
      group.addLayer(marker);
    });

    // Auto-fit bounds
    if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 12);
    } else if (boundsPoints.length > 1) {
      map.fitBounds(boundsPoints, { padding: [30, 30], maxZoom: 14 });
    }

    map.invalidateSize();
  }, [validUser?.lat, validUser?.lng, validOpps.length, validCenters.length, selectedId, radiusKm, lang]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Map Legend Bar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#475569',
          marginBottom: '8px',
          alignItems: 'center'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#15803D' }} />
          {lang === 'mr' ? 'आपण (You)' : lang === 'hi' ? 'आप (You)' : 'You'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#2563EB' }} />
          {lang === 'mr' ? 'रोजगार संधी (Opportunity)' : lang === 'hi' ? 'रोजगार अवसर (Opportunity)' : 'Opportunity'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#D97706' }} />
          {lang === 'mr' ? 'प्रशिक्षण केंद्र (Center)' : lang === 'hi' ? 'प्रशिक्षण केंद्र (Center)' : 'Training Center'}
        </span>
      </div>

      {/* Leaflet Map Div — Always mounted so map container dimensions and tiles initialize reliably */}
      <div
        ref={mapContainerRef}
        className="opportunity-map-container"
        style={{
          width: '100%',
          height: height || '300px',
          minHeight: '260px',
          borderRadius: '12px',
          border: '1px solid #CBD5E1',
          overflow: 'hidden',
          background: '#E2E8F0',
          position: 'relative'
        }}
      />

      {!hasAnyCoordinates && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(4px)',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            padding: '8px 12px',
            fontSize: '0.8rem',
            color: '#475569',
            textAlign: 'center',
            zIndex: 400
          }}
        >
          📍 {lang === 'mr' ? 'विशिष्ट निर्देशांक उपलब्ध नाहीत — जिल्हा नकाशा दृश्य दर्शवित आहे.' : 'Showing regional overview map.'}
        </div>
      )}
    </div>
  );
};
