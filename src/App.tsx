import React, { useState, useEffect } from "react";
import { MapView } from "./components/MapView";
import { Sidebar } from "./components/Sidebar";
import { Vessel } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Ship, Search, Globe, Anchor, Navigation, Activity } from "lucide-react";

export default function App() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Load from local storage
    const saved = localStorage.getItem("tracked_vessels");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setVessels(parsed);
        if (parsed.length > 0) {
          setSelectedVessel(parsed[0]);
        }
      } catch (e) {
        console.error("Failed to load saved vessels", e);
      }
    }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem("tracked_vessels", JSON.stringify(vessels));
    }
  }, [vessels, isInitialLoad]);

  const handleAddVessel = (vessel: Vessel) => {
    setVessels((prev) => {
      const exists = prev.find((v) => v.id === vessel.id);
      if (exists) {
        // Update existing
        return prev.map((v) => (v.id === vessel.id ? vessel : v));
      }
      return [vessel, ...prev];
    });
    setSelectedVessel(vessel);
  };

  const handleRemoveVessel = (id: string) => {
    setVessels((prev) => prev.filter((v) => v.id !== id));
    if (selectedVessel?.id === id) {
      setSelectedVessel(null);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0a0a0a] text-white overflow-hidden font-sans selection:bg-blue-500/30">
      <Sidebar
        vessels={vessels}
        selectedVessel={selectedVessel}
        onSelectVessel={setSelectedVessel}
        onAddVessel={handleAddVessel}
        onRemoveVessel={handleRemoveVessel}
      />
      
      <main className="flex-1 relative overflow-hidden">
        <MapView 
          vessels={vessels} 
          selectedVessel={selectedVessel} 
          onSelectVessel={setSelectedVessel}
        />

        {/* Floating Overlay for Selected Vessel */}
        <AnimatePresence>
          {selectedVessel && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-[600px] max-w-[90%] bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold tracking-tight">{selectedVessel.name}</h2>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded uppercase tracking-wider">
                      {selectedVessel.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-mono">IMO: {selectedVessel.imo} • MMSI: {selectedVessel.mmsi || "N/A"}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-semibold text-gray-400">Status</div>
                  <div className="text-lg font-bold text-blue-400">{selectedVessel.status}</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6">
                <Stat icon={<Activity className="w-4 h-4" />} label="Speed" value={`${selectedVessel.speed} kn`} />
                <Stat icon={<Navigation className="w-4 h-4" />} label="Course" value={`${selectedVessel.course}°`} />
                <Stat icon={<Anchor className="w-4 h-4" />} label="Flag" value={selectedVessel.flag} />
                <Stat icon={<Globe className="w-4 h-4" />} label="Destination" value={selectedVessel.destination || "Unknown"} />
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Coordinates</div>
                  <div className="text-xs font-mono text-gray-300">
                    {selectedVessel.lat.toFixed(4)}°N, {selectedVessel.lng.toFixed(4)}°E
                  </div>
                </div>
                <div className="text-[10px] text-gray-600 italic">
                  Last updated: {new Date(selectedVessel.lastUpdate).toLocaleString()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Welcome Overlay */}
        {vessels.length === 0 && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#121212]/80 backdrop-blur-md p-12 rounded-3xl border border-white/10 text-center max-w-md shadow-2xl pointer-events-auto"
            >
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-600/20">
                <Ship className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 tracking-tight text-white">Global Vessel Tracking</h2>
              <p className="text-gray-400 leading-relaxed">
                Enter an IMO number or vessel name in the search bar to start tracking ships worldwide in real-time.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-500 uppercase tracking-widest font-semibold">
                <span className="flex items-center gap-1.5"><Search className="w-3 h-3" /> Search</span>
                <span className="w-1 h-1 bg-gray-700 rounded-full" />
                <span className="flex items-center gap-1.5"><Anchor className="w-3 h-3" /> Track</span>
                <span className="w-1 h-1 bg-gray-700 rounded-full" />
                <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Monitor</span>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
      {icon}
      <span className="text-gray-400">{label}</span>
    </div>
    <div className="text-sm font-semibold text-gray-100 truncate">{value}</div>
  </div>
);
