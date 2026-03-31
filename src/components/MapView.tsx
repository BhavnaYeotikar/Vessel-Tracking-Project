import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Vessel } from "../types";
import { Ship, Navigation } from "lucide-react";

// Fix for default marker icons in Leaflet with React
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  vessels: Vessel[];
  selectedVessel: Vessel | null;
  onSelectVessel: (vessel: Vessel) => void;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const VesselIcon = (course: number) => {
  return L.divIcon({
    className: "custom-vessel-icon",
    html: `
      <div style="transform: rotate(${course}deg); color: #3b82f6;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export const MapView: React.FC<MapProps> = ({ vessels, selectedVessel, onSelectVessel }) => {
  const center: [number, number] = selectedVessel 
    ? [selectedVessel.lat, selectedVessel.lng] 
    : [20, 0];

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={3}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {selectedVessel && <ChangeView center={[selectedVessel.lat, selectedVessel.lng]} />}

        {vessels.map((vessel) => (
          <Marker
            key={vessel.id}
            position={[vessel.lat, vessel.lng]}
            icon={VesselIcon(vessel.course)}
            eventHandlers={{
              click: () => onSelectVessel(vessel),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg">{vessel.name}</h3>
                <p className="text-sm text-gray-600">IMO: {vessel.imo}</p>
                <p className="text-sm">Status: {vessel.status}</p>
                <p className="text-sm">Speed: {vessel.speed} kn</p>
                <div className="mt-2 text-xs text-gray-400">
                  Last updated: {new Date(vessel.lastUpdate).toLocaleString()}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
