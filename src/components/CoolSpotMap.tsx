import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon paths broken by Vite/webpack bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom pin styled to match site's navy/amber theme
const coolSpotIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      display:flex; flex-direction:column; align-items:center;
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
    ">
      <div style="
        background:#001a52; color:#fbbf24; font-size:10px; font-weight:800;
        font-family:system-ui,sans-serif; padding:4px 9px; border-radius:999px;
        white-space:nowrap; letter-spacing:0.05em; margin-bottom:3px;
        border:1.5px solid #fbbf24; box-shadow:0 2px 8px rgba(0,26,82,0.35);
      ">CoolSpot Cottage</div>
      <svg width="26" height="34" viewBox="0 0 26 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 21 13 21S26 22.75 26 13C26 5.82 20.18 0 13 0z" fill="#001a52"/>
        <circle cx="13" cy="13" r="6" fill="#fbbf24"/>
        <circle cx="13" cy="13" r="3" fill="#001a52"/>
      </svg>
    </div>
  `,
  iconSize: [120, 58],
  iconAnchor: [60, 58],
  popupAnchor: [0, -60],
});

// Keep map zoom level from resetting on re-render
function SetView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, []);
  return null;
}

const COOLSPOT_LAT = 11.4039116;
const COOLSPOT_LNG = 76.7118485;

interface CoolSpotMapProps {
  height?: string;
  zoom?: number;
  className?: string;
}

export default function CoolSpotMap({ height = "h-80", zoom = 18, className = "" }: CoolSpotMapProps) {
  return (
    <div className={`${height} ${className} rounded-2xl overflow-hidden`}>
      <MapContainer
        center={[COOLSPOT_LAT, COOLSPOT_LNG]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <SetView center={[COOLSPOT_LAT, COOLSPOT_LNG]} zoom={zoom} />
        <Marker position={[COOLSPOT_LAT, COOLSPOT_LNG]} icon={coolSpotIcon}>
          <Popup>
            <div style={{ fontFamily: "system-ui,sans-serif", minWidth: 160 }}>
              <strong style={{ color: "#001a52", fontSize: 13 }}>CoolSpot Cottage</strong>
              <p style={{ fontSize: 11, margin: "4px 0 0", color: "#555" }}>
                Elk Hill Rd, Ooty, Tamil Nadu
              </p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${COOLSPOT_LAT},${COOLSPOT_LNG}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, color: "#001a52", fontWeight: 700 }}
              >
                Get Directions →
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
