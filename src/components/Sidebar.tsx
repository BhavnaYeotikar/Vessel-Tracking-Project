import React, { useState } from "react";
import { Search, Ship, Loader2, X, Anchor, Globe, Info, Navigation, Activity } from "lucide-react";
import { Vessel } from "../types";
import { searchVessel } from "../services/vesselService";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface SidebarProps {
  vessels: Vessel[];
  selectedVessel: Vessel | null;
  onSelectVessel: (vessel: Vessel) => void;
  onAddVessel: (vessel: Vessel) => void;
  onRemoveVessel: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  vessels,
  selectedVessel,
  onSelectVessel,
  onAddVessel,
  onRemoveVessel,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    try {
      const result = await searchVessel(searchQuery);
      if (result) {
        onAddVessel(result);
        setSearchQuery("");
      } else {
        setError("Vessel not found. Try IMO number or full name.");
      }
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-80 h-full bg-[#121212] border-r border-white/10 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Ship className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">VesselTracker <span className="text-blue-500">Pro</span></h1>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search IMO or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </form>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Tracked Vessels</h2>
        <AnimatePresence mode="popLayout">
          {vessels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Globe className="w-12 h-12 text-gray-800 mb-4" />
              <p className="text-sm text-gray-500 italic">No vessels tracked yet. Search to begin tracking.</p>
            </div>
          ) : (
            vessels.map((vessel) => (
              <motion.div
                key={vessel.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => onSelectVessel(vessel)}
                className={cn(
                  "p-4 rounded-xl cursor-pointer transition-all border border-transparent group relative",
                  selectedVessel?.id === vessel.id 
                    ? "bg-blue-600/10 border-blue-500/50" 
                    : "bg-[#1a1a1a] hover:bg-[#222]"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-sm truncate w-48">{vessel.name}</h3>
                    <p className="text-xs text-gray-500">IMO: {vessel.imo}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveVessel(vessel.id);
                    }}
                    className="p-1 hover:bg-red-500/20 rounded-md text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" /> {vessel.speed} kn
                  </span>
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> {vessel.course}°
                  </span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-[9px] font-medium uppercase",
                    vessel.status.toLowerCase().includes("under way") ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                  )}>
                    {vessel.status}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {selectedVessel && (
        <div className="p-6 bg-[#1a1a1a] border-t border-white/10">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Vessel Details</h3>
          <div className="space-y-3">
            <DetailItem icon={<Anchor className="w-3 h-3" />} label="Flag" value={selectedVessel.flag} />
            <DetailItem icon={<Globe className="w-3 h-3" />} label="Destination" value={selectedVessel.destination || "Unknown"} />
            <DetailItem icon={<Info className="w-3 h-3" />} label="Type" value={selectedVessel.type} />
            <div className="pt-2 text-[10px] text-gray-600 flex justify-between">
              <span>Last Update</span>
              <span>{new Date(selectedVessel.lastUpdate).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center justify-between text-xs">
    <div className="flex items-center gap-2 text-gray-400">
      {icon}
      <span>{label}</span>
    </div>
    <span className="font-medium text-gray-200">{value}</span>
  </div>
);
