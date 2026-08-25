import React, { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { LeagueProvider } from "./context/LeagueContext";
import { Navbar } from "./components/Navbar";
import { HeroStatusBanner } from "./components/HeroStatusBanner";
import { WeekPicksView } from "./components/WeekPicksView";
import { LeaderboardView } from "./components/LeaderboardView";
import { SurvivorMatrix } from "./components/SurvivorMatrix";
import { RulesModal } from "./components/RulesModal";
import { AuthModal } from "./components/AuthModal";
import { TeamsModal } from "./components/TeamsModal";
import { MobileBottomNav } from "./components/MobileBottomNav";

function AppContent() {
  const [activeTab, setActiveTab] = useState("picks");
  const [showRules, setShowRules] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showTeams, setShowTeams] = useState(false);

  return (
    <div className="min-h-screen font-['Outfit',sans-serif] flex flex-col justify-between">
      <div>
        <Navbar
          onOpenRules={() => setShowRules(true)}
          onOpenAuth={() => setShowAuth(true)}
          onOpenTeams={() => setShowTeams(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 md:pb-8">
          
          {/* Hero / Status Banner */}
          <HeroStatusBanner onOpenAuth={() => setShowAuth(true)} />

          {/* Picks Tab */}
          {activeTab === "picks" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-4 sm:gap-6">
              <WeekPicksView onOpenAuth={() => setShowAuth(true)} />
              <div className="space-y-4">
                <SurvivorMatrix />
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <LeaderboardView />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTeams={() => setShowTeams(true)}
        onOpenRules={() => setShowRules(true)}
      />

      {/* Modals */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <TeamsModal isOpen={showTeams} onClose={() => setShowTeams(false)} />

      {/* Footer (desktop & tablet) */}
      <footer className="hidden md:block mt-12 border-t border-slate-800/50 py-6 text-center text-xs text-slate-600">
        <p className="font-display font-bold tracking-wider text-slate-700 uppercase mb-1">Liga de Supervivencia · Temporada 2024-2025</p>
        <p>Juego de estrategia y predicción deportiva</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LeagueProvider>
        <AppContent />
      </LeagueProvider>
    </AuthProvider>
  );
}
