import React, { useState } from "react";
import { Lock, Unlock, CheckCircle2, XCircle, Shield } from "lucide-react";
import { useLeague } from "../context/LeagueContext";
import { useAuth } from "../context/AuthContext";
import { NFL_TEAMS, getTeamById } from "../data/nflTeams";

export const SurvivorMatrix = () => {
  const { user } = useAuth();
  const { allUsedTeamIds, currentPlayer } = useLeague();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const usedCount = allUsedTeamIds.length;
  const availableCount = 32 - usedCount;

  const used = NFL_TEAMS.filter((t) => allUsedTeamIds.includes(t.id));
  const available = NFL_TEAMS.filter((t) => !allUsedTeamIds.includes(t.id));

  return (
    <div className="p-3.5 sm:p-5 rounded-2xl metal-card border border-slate-700/50 space-y-3 sm:space-y-4">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer sm:cursor-default select-none"
      >
        <h3 className="font-display font-black text-xs sm:text-base tracking-wide text-white flex items-center gap-1.5 sm:gap-2">
          <Shield className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Equipos Bloqueados</span>
        </h3>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold">
          <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 sm:px-2 py-0.5 rounded-full">
            {usedCount} usados
          </span>
          <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 sm:px-2 py-0.5 rounded-full">
            {availableCount} disp.
          </span>
          <span className="sm:hidden text-slate-500 text-xs font-bold ml-1">
            {isExpanded ? "▲" : "▼"}
          </span>
        </div>
      </div>

      <div className={`space-y-3 ${isExpanded ? "block" : "hidden sm:block"}`}>
        {!user || usedCount === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-2 sm:py-3">
            {user ? "Aún no has seleccionado ningún equipo. ¡Haz tu primer pick!" : "Inicia sesión para ver tus equipos."}
          </p>
        ) : (
        <>
          {/* Used Teams Row */}
          {used.length > 0 && (
            <div>
              <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Bloqueados para siempre
              </p>
              <div className="flex flex-wrap gap-2">
                {used.map((team) => (
                  <div key={team.id} className="relative group flex flex-col items-center gap-1">
                    <div className="relative">
                      <img
                        src={team.logo}
                        alt={team.fullName}
                        className="w-9 h-9 object-contain grayscale opacity-50"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-rose-900/40 rounded-full">
                        <Lock className="w-3 h-3 text-rose-400" />
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold">{team.id}</span>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-10 hidden group-hover:flex px-2 py-1 text-[10px] font-semibold bg-slate-800 border border-slate-700 text-rose-300 rounded-lg whitespace-nowrap shadow-xl">
                      {team.fullName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Teams Row */}
          {available.length > 0 && (
            <div>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Unlock className="w-3 h-3" /> Disponibles ({available.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {available.map((team) => (
                  <div key={team.id} className="relative group flex flex-col items-center gap-0.5">
                    <img
                      src={team.logo}
                      alt={team.fullName}
                      className="w-7 h-7 object-contain drop-shadow hover:scale-110 transition-transform cursor-default"
                    />
                    <span className="text-[9px] text-slate-500 font-bold">{team.id}</span>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-10 hidden group-hover:flex px-2 py-1 text-[10px] font-semibold bg-slate-800 border border-slate-700 text-emerald-300 rounded-lg whitespace-nowrap shadow-xl">
                      {team.fullName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};
