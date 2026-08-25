import React from "react";
import { Flame, Users, Grid, HelpCircle, Shield, Sliders } from "lucide-react";
import { useLeague } from "../context/LeagueContext";
import { sounds } from "../utils/soundEffects";

export const MobileBottomNav = ({ activeTab, setActiveTab, onOpenTeams, onOpenRules }) => {
  const { leagueStats, isCommissioner, isCommissionerMode, setIsCommissionerMode } = useLeague();

  const handleTabChange = (tab) => {
    sounds.playClick();
    setActiveTab(tab);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      <div className="grid grid-cols-4 items-center max-w-md mx-auto">
        
        {/* Partidos / Picks */}
        <button
          onClick={() => handleTabChange("picks")}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-150 ${
            activeTab === "picks"
              ? "text-blue-400 font-bold scale-105 bg-blue-500/10"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Flame className="w-5 h-5" />
            {activeTab === "picks" && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium tracking-tight">Partidos</span>
        </button>

        {/* Supervivientes / Tabla */}
        <button
          onClick={() => handleTabChange("leaderboard")}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-150 ${
            activeTab === "leaderboard"
              ? "text-blue-400 font-bold scale-105 bg-blue-500/10"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 px-1 text-[9px] font-black rounded-full bg-emerald-500 text-slate-950 leading-tight">
              {leagueStats.alive}
            </span>
          </div>
          <span className="text-[10px] mt-1 font-medium tracking-tight">Tabla</span>
        </button>

        {/* 32 Equipos */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenTeams();
          }}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-slate-400 hover:text-slate-200 active:scale-95 transition-all"
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium tracking-tight">Equipos</span>
        </button>

        {/* Reglas */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenRules();
          }}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-amber-400/90 hover:text-amber-300 active:scale-95 transition-all"
        >
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] mt-1 font-medium tracking-tight text-amber-300">Reglas</span>
        </button>

      </div>
    </div>
  );
};
