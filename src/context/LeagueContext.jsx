import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import { NFL_SCHEDULE } from "../data/nflSchedule";
import { NFL_TEAMS, getTeamById } from "../data/nflTeams";
import { INITIAL_PLAYERS } from "../data/mockInitialLeague";
import { useAuth } from "./AuthContext";
import { sounds } from "../utils/soundEffects";
import { db, doc, setDoc, getDoc, onSnapshot } from "../firebase";

// ────────────────────────────────────────────────────────
// Correos autorizados como Comisionados (admin de resultados)
// ────────────────────────────────────────────────────────
const COMMISSIONER_EMAILS = [
  "luiszenzo2@gmail.com",
  "enrirountree@gmail.com"
];

const LeagueContext = createContext(null);

export const LeagueProvider = ({ children }) => {
  const { user } = useAuth();

  // Current active viewing week (1 - 18)
  const [selectedWeek, setSelectedWeek] = useState(1);

  // League schedule with game scores & winners
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem("nfl_survivor_schedule");
    return saved ? JSON.parse(saved) : NFL_SCHEDULE;
  });

  // All real league players / participants
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem("nfl_survivor_players");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only keep real players (exclude mock and demo accounts)
        const realOnly = parsed.filter((p) => 
          p.id && !p.id.startsWith("user_") && !p.id.startsWith("demo_") && !p.email?.endsWith("@nflsurvivor.com")
        );
        localStorage.setItem("nfl_survivor_players", JSON.stringify(realOnly));
        return realOnly;
      } catch (e) {
        // ignore
      }
    }
    return [];
  });

  // Admin / Commissioner Mode toggle
  const [isCommissionerMode, setIsCommissionerMode] = useState(false);

  // Derived: is the current logged-in user an authorized commissioner?
  const isCommissioner = useMemo(() => {
    if (!user?.email) return false;
    return COMMISSIONER_EMAILS.includes(user.email.toLowerCase());
  }, [user]);

  // Sound Muted state
  const [isMuted, setIsMuted] = useState(() => sounds.isMuted());

  const toggleSound = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  // Ensure current user is in the players list
  useEffect(() => {
    if (!user) return;
    setPlayers((prev) => {
      const exists = prev.find((p) => p.id === user.uid || p.email === user.email);
      if (!exists) {
        const newPlayer = {
          id: user.uid,
          name: user.name,
          email: user.email,
          avatar: user.photoURL,
          status: "alive",
          eliminatedWeek: null,
          eliminatedReason: null,
          picks: {}
        };
        const updated = [newPlayer, ...prev];
        localStorage.setItem("nfl_survivor_players", JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, [user]);

  // Current logged in player data
  const currentPlayer = useMemo(() => {
    if (!user) return null;
    return players.find((p) => p.id === user.uid || p.email === user.email) || null;
  }, [user, players]);

  // Teams already picked by the current player (all weeks except the current viewing week for editing)
  const usedTeamIds = useMemo(() => {
    if (!currentPlayer || !currentPlayer.picks) return [];
    return Object.entries(currentPlayer.picks)
      .filter(([wk, teamId]) => teamId && Number(wk) !== Number(selectedWeek))
      .map(([_, teamId]) => teamId);
  }, [currentPlayer, selectedWeek]);

  // All teams ever picked by the current player (including current week)
  const allUsedTeamIds = useMemo(() => {
    if (!currentPlayer || !currentPlayer.picks) return [];
    return Object.values(currentPlayer.picks).filter(Boolean);
  }, [currentPlayer]);

  // Current pick for the selected week
  const currentWeekPick = useMemo(() => {
    if (!currentPlayer || !currentPlayer.picks) return null;
    return currentPlayer.picks[selectedWeek] || null;
  }, [currentPlayer, selectedWeek]);

  // Trigger confetti burst
  const triggerConfetti = (type = "standard") => {
    if (type === "champion") {
      const duration = 4 * 1000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#10b981", "#f59e0b", "#3b82f6", "#ffffff"]
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#10b981", "#f59e0b", "#3b82f6", "#ffffff"]
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#f59e0b", "#10b981"]
      });
    }
  };

  // Recalculate survival status of all players based on completed games
  const recalculateSurvivorStatuses = (currentSchedule, currentPlayers) => {
    let updatedPlayers = [...currentPlayers];
    
    // Map of week -> Map of teamId -> result ('win', 'loss', 'tie', 'pending')
    const weekResults = {};

    currentSchedule.forEach((weekObj) => {
      weekResults[weekObj.week] = {};
      weekObj.games.forEach((g) => {
        if (g.winner) {
          if (g.winner === "TIE") {
            weekResults[weekObj.week][g.homeTeam] = "tie";
            weekResults[weekObj.week][g.awayTeam] = "tie";
          } else {
            const winner = g.winner;
            const loser = g.winner === g.homeTeam ? g.awayTeam : g.homeTeam;
            weekResults[weekObj.week][winner] = "win";
            weekResults[weekObj.week][loser] = "loss";
          }
        }
      });
    });

    updatedPlayers = updatedPlayers.map((player) => {
      let isAlive = true;
      let eliminatedWeek = null;
      let eliminatedReason = null;

      // Check chronologically week 1 through 18
      for (let w = 1; w <= 18; w++) {
        const userPick = player.picks ? player.picks[w] : null;
        const weekGames = currentSchedule.find((sw) => sw.week === w)?.games || [];
        const hasFinishedGames = weekGames.some((g) => g.winner);

        // If games have finished this week
        if (hasFinishedGames && weekGames.every((g) => g.winner)) {
          if (!userPick) {
            isAlive = false;
            eliminatedWeek = w;
            eliminatedReason = `No registró selección en la Semana ${w}`;
            break;
          }

          const pickResult = weekResults[w] ? weekResults[w][userPick] : null;
          if (pickResult === "loss") {
            isAlive = false;
            eliminatedWeek = w;
            const team = getTeamById(userPick);
            eliminatedReason = `Perdió en Semana ${w} con ${team ? team.fullName : userPick}`;
            break;
          } else if (pickResult === "tie") {
            isAlive = false;
            eliminatedWeek = w;
            const team = getTeamById(userPick);
            eliminatedReason = `Empató en Semana ${w} con ${team ? team.fullName : userPick} (Empate = Eliminado)`;
            break;
          }
        } else if (userPick && weekResults[w] && weekResults[w][userPick] === "loss") {
          // If specific game of user pick is already finished and lost
          isAlive = false;
          eliminatedWeek = w;
          const team = getTeamById(userPick);
          eliminatedReason = `Perdió en Semana ${w} con ${team ? team.fullName : userPick}`;
          break;
        }
      }

      return {
        ...player,
        status: isAlive ? "alive" : "eliminated",
        eliminatedWeek,
        eliminatedReason
      };
    });

    // Check if only 1 player remains alive among multiple players
    const aliveCount = updatedPlayers.filter((p) => p.status === "alive").length;
    if (aliveCount === 1 && updatedPlayers.length > 1) {
      updatedPlayers = updatedPlayers.map((p) => 
        p.status === "alive" ? { ...p, status: "champion" } : p
      );
    }

    return updatedPlayers;
  };

  // Make or change pick for selected week
  const makePick = (week, teamId) => {
    if (!user) {
      throw new Error("Debes iniciar sesión con Google para hacer tu selección.");
    }

    if (currentPlayer && currentPlayer.status === "eliminated") {
      sounds.playEliminated();
      throw new Error(`Estás eliminado desde la Semana ${currentPlayer.eliminatedWeek}. ¡Gracias por participar!`);
    }

    // Rule: Check if team was used in ANOTHER week
    if (currentPlayer && currentPlayer.picks) {
      const alreadyPickedWeek = Object.entries(currentPlayer.picks).find(
        ([wk, tId]) => tId === teamId && Number(wk) !== Number(week)
      );

      if (alreadyPickedWeek) {
        const teamObj = getTeamById(teamId);
        sounds.playEliminated();
        throw new Error(`¡Regla Survivor! Ya utilizaste a ${teamObj ? teamObj.fullName : teamId} en la Semana ${alreadyPickedWeek[0]}. No puedes volver a elegirlo.`);
      }
    }

    // Update player pick
    setPlayers((prev) => {
      const updated = prev.map((p) => {
        if (p.id === user.uid || p.email === user.email) {
          const newPicks = { ...p.picks, [week]: teamId };
          return { ...p, picks: newPicks };
        }
        return p;
      });

      const rechecked = recalculateSurvivorStatuses(schedule, updated);
      localStorage.setItem("nfl_survivor_players", JSON.stringify(rechecked));
      return rechecked;
    });

    sounds.playPickLock();
    triggerConfetti();

    // Firestore async sync — silenciado si no hay permisos configurados aún
    const pickDocRef = doc(db, "picks", `${user.uid}_w${week}`);
    setDoc(pickDocRef, {
      userId: user.uid,
      userName: user.name,
      week: Number(week),
      teamId,
      timestamp: new Date().toISOString()
    }, { merge: true }).catch((e) => {
      console.warn("Firestore sync (offline/sin permisos — pick guardado localmente):", e.code);
    });
  };

  // Commissioner sets game result / winner
  const setGameResult = (week, gameId, winnerTeamId, homeScore = 24, awayScore = 17) => {
    if (!isCommissioner) {
      console.warn("Acción denegada: solo los comisionados autorizados pueden registrar resultados.");
      return;
    }
    sounds.playWhistle();

    setSchedule((prevSchedule) => {
      const newSchedule = prevSchedule.map((w) => {
        if (w.week !== Number(week)) return w;
        const newGames = w.games.map((g) => {
          if (g.id !== gameId) return g;
          return {
            ...g,
            winner: winnerTeamId,
            homeScore: winnerTeamId === g.homeTeam ? Math.max(homeScore, awayScore) : Math.min(homeScore, awayScore),
            awayScore: winnerTeamId === g.awayTeam ? Math.max(homeScore, awayScore) : Math.min(homeScore, awayScore),
            status: "finished"
          };
        });
        return { ...w, games: newGames };
      });

      localStorage.setItem("nfl_survivor_schedule", JSON.stringify(newSchedule));

      // Recalculate players
      setPlayers((currentPlayers) => {
        const reevaluated = recalculateSurvivorStatuses(newSchedule, currentPlayers);
        localStorage.setItem("nfl_survivor_players", JSON.stringify(reevaluated));

        // Check if current user is now champion or survived
        const updatedCurrentUser = reevaluated.find((p) => p.id === user?.uid);
        if (updatedCurrentUser?.status === "champion") {
          sounds.playSuccess();
          triggerConfetti("champion");
        } else if (updatedCurrentUser?.status === "eliminated" && currentPlayer?.status === "alive") {
          sounds.playEliminated();
        }

        return reevaluated;
      });

      return newSchedule;
    });
  };

  // Commissioner corrects/changes an already-set result (or resets it to pending)
  const correctGameResult = (week, gameId, newWinnerTeamId = null) => {
    if (!isCommissioner) {
      console.warn("Acción denegada: solo los comisionados autorizados pueden corregir resultados.");
      return;
    }
    sounds.playWhistle();

    setSchedule((prevSchedule) => {
      const newSchedule = prevSchedule.map((w) => {
        if (w.week !== Number(week)) return w;
        const newGames = w.games.map((g) => {
          if (g.id !== gameId) return g;
          if (newWinnerTeamId === null) {
            // Reset to pending
            const { winner, homeScore, awayScore, status, ...rest } = g;
            return { ...rest, status: "scheduled", winner: null, homeScore: null, awayScore: null };
          }
          // Change winner
          const homeScore = 24, awayScore = 17;
          return {
            ...g,
            winner: newWinnerTeamId,
            homeScore: newWinnerTeamId === g.homeTeam ? Math.max(homeScore, awayScore) : Math.min(homeScore, awayScore),
            awayScore: newWinnerTeamId === g.awayTeam ? Math.max(homeScore, awayScore) : Math.min(homeScore, awayScore),
            status: "finished"
          };
        });
        return { ...w, games: newGames };
      });

      localStorage.setItem("nfl_survivor_schedule", JSON.stringify(newSchedule));

      setPlayers((currentPlayers) => {
        const reevaluated = recalculateSurvivorStatuses(newSchedule, currentPlayers);
        localStorage.setItem("nfl_survivor_players", JSON.stringify(reevaluated));
        return reevaluated;
      });

      return newSchedule;
    });
  };

  // Commissioner quick-simulates all games in the selected week
  const simulateFullWeek = (week) => {
    if (!isCommissioner) {
      console.warn("Acción denegada: solo los comisionados autorizados pueden simular semanas.");
      return;
    }
    sounds.playWhistle();
    setSchedule((prevSchedule) => {
      const newSchedule = prevSchedule.map((w) => {
        if (w.week !== Number(week)) return w;
        const newGames = w.games.map((g) => {
          // Team with better spread or home advantage has higher chance
          const homeTeamObj = getTeamById(g.homeTeam);
          const awayTeamObj = getTeamById(g.awayTeam);
          const homeRating = (homeTeamObj?.rating || 80) + 2.5;
          const awayRating = awayTeamObj?.rating || 80;
          const homeWinProb = homeRating / (homeRating + awayRating);
          const homeWins = Math.random() < homeWinProb;
          const winner = homeWins ? g.homeTeam : g.awayTeam;
          const winningScore = Math.floor(Math.random() * 18) + 20;
          const losingScore = Math.max(7, winningScore - Math.floor(Math.random() * 14) - 3);

          return {
            ...g,
            winner,
            homeScore: homeWins ? winningScore : losingScore,
            awayScore: homeWins ? losingScore : winningScore,
            status: "finished"
          };
        });
        return { ...w, games: newGames };
      });

      localStorage.setItem("nfl_survivor_schedule", JSON.stringify(newSchedule));

      setPlayers((currentPlayers) => {
        const reevaluated = recalculateSurvivorStatuses(newSchedule, currentPlayers);
        localStorage.setItem("nfl_survivor_players", JSON.stringify(reevaluated));
        sounds.playSuccess();
        triggerConfetti();
        return reevaluated;
      });

      return newSchedule;
    });
  };

  // Reset entire league (for test iterations)
  const resetEntireLeague = () => {
    sounds.playWhistle();
    setSchedule(NFL_SCHEDULE);
    localStorage.removeItem("nfl_survivor_schedule");

    const cleanPlayers = INITIAL_PLAYERS.map((p) => ({
      ...p,
      status: "alive",
      eliminatedWeek: null,
      eliminatedReason: null,
      picks: {}
    }));

    if (user) {
      cleanPlayers.unshift({
        id: user.uid,
        name: user.name,
        email: user.email,
        avatar: user.photoURL,
        status: "alive",
        eliminatedWeek: null,
        eliminatedReason: null,
        picks: {}
      });
    }

    setPlayers(cleanPlayers);
    localStorage.setItem("nfl_survivor_players", JSON.stringify(cleanPlayers));
  };

  // League stats summary
  const leagueStats = useMemo(() => {
    const total = players.length;
    const alive = players.filter((p) => p.status === "alive" || p.status === "champion").length;
    const eliminated = players.filter((p) => p.status === "eliminated").length;
    const survivalRate = total > 0 ? Math.round((alive / total) * 100) : 100;

    // Most picked team for selected week
    const weekPicksCount = {};
    players.forEach((p) => {
      const pick = p.picks ? p.picks[selectedWeek] : null;
      if (pick) {
        weekPicksCount[pick] = (weekPicksCount[pick] || 0) + 1;
      }
    });

    let topTeamId = null;
    let maxCount = 0;
    Object.entries(weekPicksCount).forEach(([tId, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topTeamId = tId;
      }
    });

    return {
      total,
      alive,
      eliminated,
      survivalRate,
      topPickTeam: topTeamId ? getTeamById(topTeamId) : null,
      topPickCount: maxCount
    };
  }, [players, selectedWeek]);

  return (
    <LeagueContext.Provider
      value={{
        selectedWeek,
        setSelectedWeek,
        schedule,
        players,
        currentPlayer,
        usedTeamIds,
        allUsedTeamIds,
        currentWeekPick,
        isCommissioner,
        isCommissionerMode,
        setIsCommissionerMode,
        isMuted,
        toggleSound,
        makePick,
        setGameResult,
        correctGameResult,
        simulateFullWeek,
        resetEntireLeague,
        leagueStats,
        triggerConfetti
      }}
    >
      {children}
    </LeagueContext.Provider>
  );
};

export const useLeague = () => useContext(LeagueContext);
