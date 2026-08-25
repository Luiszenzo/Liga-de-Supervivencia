import React, { useState } from "react";
import { X, Search, Shield, MapPin, Trophy } from "lucide-react";
import { NFL_TEAMS } from "../data/nflTeams";
import { useLeague } from "../context/LeagueContext";

const CONFERENCES = ["AFC", "NFC"];
const DIVISIONS = ["Norte", "Sur", "Este", "Oeste"];

export const TeamsModal = ({ isOpen, onClose }) => {
  const { allUsedTeamIds, selectedWeek } = useLeague();
  const [search, setSearch] = useState("");
  const [filterConference, setFilterConference] = useState("ALL");
  const [filterDivision, setFilterDivision] = useState("ALL");

  if (!isOpen) return null;

  const filtered = NFL_TEAMS.filter((t) => {
    const matchSearch =
      !search ||
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.city.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchConf = filterConference === "ALL" || t.conference === filterConference;
    const matchDiv = filterDivision === "ALL" || t.division === filterDivision;
    return matchSearch && matchConf && matchDiv;
  });

  const grouped = {};
  CONFERENCES.forEach((conf) => {
    grouped[conf] = {};
    DIVISIONS.forEach((div) => {
      const teams = filtered.filter((t) => t.conference === conf && t.division === div);
      if (teams.length > 0) grouped[conf][div] = teams;
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-2 sm:pt-4 pb-4 px-2 sm:px-4 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl metal-border">
        
        {/* Header */}
        <div className="sticky top-0 z-10 rounded-t-3xl bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-wide uppercase flex items-center gap-2">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                32 Equipos NFL
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Temporada 2024-2025 · AFC y NFC · 4 Divisiones
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar equipo, ciudad..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Conference & Division Filter Row */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {/* Conference Filter */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
                {["ALL", ...CONFERENCES].map((conf) => (
                  <button
                    key={conf}
                    onClick={() => setFilterConference(conf)}
                    className={`px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
                      filterConference === conf
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {conf === "ALL" ? "Todas" : conf}
                  </button>
                ))}
              </div>

              {/* Division Filter */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
                {["ALL", ...DIVISIONS].map((div) => (
                  <button
                    key={div}
                    onClick={() => setFilterDivision(div)}
                    className={`px-2 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
                      filterDivision === div
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {div === "ALL" ? "Todas" : div}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Teams Content */}
        <div className="p-5 sm:p-6 space-y-8">
          {CONFERENCES.map((conf) => {
            const confDivisions = grouped[conf];
            if (Object.keys(confDivisions).length === 0) return null;
            return (
              <div key={conf}>
                {/* Conference Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`px-4 py-1.5 rounded-full text-sm font-black tracking-wider border ${
                    conf === "AFC"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  }`}>
                    {conf} — Conferencia {conf === "AFC" ? "Americana" : "Nacional"}
                  </div>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                <div className="space-y-5">
                  {DIVISIONS.map((div) => {
                    const divTeams = confDivisions[div];
                    if (!divTeams || divTeams.length === 0) return null;
                    return (
                      <div key={div}>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">
                          División {div}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {divTeams.map((team) => {
                            const isUsed = allUsedTeamIds.includes(team.id);
                            return (
                              <div
                                key={team.id}
                                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                                  isUsed
                                    ? "bg-rose-500/5 border-rose-500/20 opacity-70"
                                    : "metal-card border-slate-700/50 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10"
                                }`}
                              >
                                {isUsed && (
                                  <div className="absolute top-2 right-2 text-[10px] font-black text-rose-400 bg-rose-500/20 border border-rose-500/30 px-1.5 py-0.5 rounded-full">
                                    USADO
                                  </div>
                                )}

                                <img
                                  src={team.logo}
                                  alt={team.fullName}
                                  className={`w-16 h-16 object-contain drop-shadow-xl ${isUsed ? "grayscale opacity-60" : ""}`}
                                />
                                <div className="text-center">
                                  <p className="font-display font-black text-sm text-white">{team.name}</p>
                                  <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                                    <MapPin className="w-2.5 h-2.5" /> {team.city}
                                  </p>
                                </div>
                                <div 
                                  className="w-full py-1 rounded-lg text-center text-[10px] font-bold"
                                  style={{ 
                                    backgroundColor: `${team.primaryColor}25`,
                                    color: team.primaryColor === "#000000" ? "#94a3b8" : team.primaryColor,
                                    borderColor: `${team.primaryColor}40`,
                                    border: "1px solid"
                                  }}
                                >
                                  {team.stadium}
                                </div>
                                <div className="flex items-center gap-2 w-full justify-center">
                                  <span className="text-[10px] text-slate-500">{team.conference} {team.division}</span>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                    team.rating >= 92 ? "text-emerald-300 bg-emerald-500/10" :
                                    team.rating >= 87 ? "text-blue-300 bg-blue-500/10" :
                                    team.rating >= 82 ? "text-amber-300 bg-amber-500/10" :
                                    "text-slate-400 bg-slate-700/50"
                                  }`}>
                                    ⭐{team.rating}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No se encontraron equipos con ese filtro.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
