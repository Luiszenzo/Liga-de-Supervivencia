import React, { useState } from "react";
import { 
  Shield, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Award, 
  Skull, 
  CheckCircle2, 
  LogOut, 
  LogIn, 
  Sliders, 
  Flame, 
  Users,
  Grid,
  Trophy
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLeague } from "../context/LeagueContext";

export const Navbar = ({ onOpenRules, onOpenAuth, onOpenTeams, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { 
    currentPlayer, 
    isCommissioner,
    isCommissionerMode, 
    setIsCommissionerMode, 
    isMuted, 
    toggleSound,
    leagueStats 
  } = useLeague();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-lg sm:text-xl tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-amber-400">
                  LIGA DE SUPERVIVENCIA
                </span>
                <span className="hidden xs:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  2024-2025
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                1 Solo Pick Semanal &bull; Sin Repetición &bull; El Último en Pie Gana
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800">
            <button
              onClick={() => setActiveTab("picks")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === "picks"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Flame className="w-4 h-4" />
              Partidos & Picks
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === "leaderboard"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Users className="w-4 h-4" />
              Supervivientes
              <span className="px-1.5 py-0.2 text-[11px] rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                {leagueStats.alive}/{leagueStats.total}
              </span>
            </button>
            <button
              onClick={onOpenTeams}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all"
            >
              <Grid className="w-4 h-4" />
              32 Equipos
            </button>
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={isMuted ? "Activar sonido" : "Silenciar sonido"}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Rules Button */}
            <button
              onClick={onOpenRules}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900/80 border border-slate-800 text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/30 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Reglas</span>
            </button>

            {/* Commissioner / Admin toggle (only visible for authorized emails) */}
            {isCommissioner && (
              <button
                onClick={() => setIsCommissionerMode(!isCommissionerMode)}
                title="Panel del Comisionado / Simulador de resultados"
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  isCommissionerMode
                    ? "bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-lg shadow-purple-500/20"
                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-purple-300 hover:border-purple-500/30"
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span className="hidden sm:inline">Comisionado</span>
              </button>
            )}

            {/* User Account or Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[110px]">
                      {user.name}
                    </p>
                    <div className="flex items-center gap-1 text-[10px]">
                      {currentPlayer?.status === "alive" && (
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> VIVO
                        </span>
                      )}
                      {currentPlayer?.status === "champion" && (
                        <span className="text-amber-400 font-bold flex items-center gap-0.5">
                          <Trophy className="w-2.5 h-2.5" /> CAMPEÓN
                        </span>
                      )}
                      {currentPlayer?.status === "eliminated" && (
                        <span className="text-rose-400 font-bold flex items-center gap-0.5">
                          <Skull className="w-2.5 h-2.5" /> ELIMINADO
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900/95 border border-slate-800 p-3 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3 pb-3 mb-3 border-b border-slate-800">
                      <img
                        src={user.photoURL}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/30"
                        referrerPolicy="no-referrer"
                      />
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            ID Google Verificado
                          </span>
                          {isCommissioner && (
                            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
                              ⭐ Comisionado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-800/50">
                        <span className="text-slate-400">Estado Survivor:</span>
                        <span className={`font-bold ${
                          currentPlayer?.status === "alive" ? "text-emerald-400" :
                          currentPlayer?.status === "champion" ? "text-amber-400" : "text-rose-400"
                        }`}>
                          {currentPlayer?.status === "alive" ? "🟢 ACTIVO" :
                           currentPlayer?.status === "champion" ? "🏆 CAMPEÓN" : `💀 ELIMINADO (Sem. ${currentPlayer?.eliminatedWeek})`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">Entrar</span>
                <span className="xs:hidden">Login</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
