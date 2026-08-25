import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import confetti from "canvas-confetti";
import { NFL_SCHEDULE } from "../data/nflSchedule";
import { NFL_TEAMS, getTeamById } from "../data/nflTeams";
import { useAuth } from "./AuthContext";
import { sounds } from "../utils/soundEffects";
import { 
  db, 
  doc, 
  setDoc, 
  collection, 
  onSnapshot, 
  serverTimestamp 
} from "../firebase";

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
        return parsed.filter((p) => p.id && !p.id.startsWith("user_") && !p.id.startsWith("demo_") && !p.email?.endsWith("@nflsurvivor.com"));
      } catch (e) {
        // ignore
      }
    }
    return [];
  });

  // Raw users and picks map from Firestore
  const [firestoreUsers, setFirestoreUsers] = useState([]);
  const [firestorePicks, setFirestorePicks] = useState({});

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

  // ────────────────────────────────────────────────────────
  // 1. Real-time Firestore Sync: Global Schedule & Results
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const scheduleRef = doc(db, "league", "schedule");
      const unsub = onSnapshot(scheduleRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data?.schedule)) {
            setSchedule(data.schedule);
            localStorage.setItem("nfl_survivor_schedule", JSON.stringify(data.schedule));
          }
        }
      }, (err) => {
        console.warn("Firestore schedule snapshot (offline o sin permisos):", err.code);
      });
      return () => unsub();
    } catch (err) {
      console.warn("Error setting schedule listener:", err);
    }
  }, []);

  // ────────────────────────────────────────────────────────
  // 2. Real-time Firestore Sync: All Registered Users
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const usersCol = collection(db, "users");
      const unsub = onSnapshot(usersCol, (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && docSnap.id) {
            list.push({
              id: docSnap.id,
              name: data.name || "Jugador NFL",
              email: data.email || "",
              avatar: data.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || "NFL")}&backgroundColor=1e293b&textColor=38bdf8`,
              joinedAt: data.createdAt || ""
            });
          }
        });
        setFirestoreUsers(list);
      }, (err) => {
        console.warn("Firestore users snapshot (offline o sin permisos):", err.code);
      });
      return () => unsub();
    } catch (err) {
      console.warn("Error setting users listener:", err);
    }
  }, []);

  // ────────────────────────────────────────────────────────
  // 3. Real-time Firestore Sync: All Weekly Picks
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const picksCol = collection(db, "picks");
      const unsub = onSnapshot(picksCol, (snapshot) => {
        const picksMap = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data?.userId && data?.week && data?.teamId) {
            if (!picksMap[data.userId]) {
              picksMap[data.userId] = {};
            }
            picksMap[data.userId][Number(data.week)] = data.teamId;
          }
        });
        setFirestorePicks(picksMap);
      }, (err) => {
        console.warn("Firestore picks snapshot (offline o sin permisos):", err.code);
      });
      return () => unsub();
    } catch (err) {
      console.warn("Error setting picks listener:", err);
    }
  }, []);

  // ────────────────────────────────────────────────────────
  // 4. Merge Users + Picks + Current User -> Players List
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    // Collect all unique users (from Firestore + current logged in user)
    const userMap = new Map();

    // Add Firestore users
    firestoreUsers.forEach((u) => {
      userMap.set(u.id, {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        status: "alive",
        eliminatedWeek: null,
        eliminatedReason: null,
        picks: firestorePicks[u.id] || {}
      });
    });

    // Ensure current user is in the list
    if (user) {
      const existing = userMap.get(user.uid);
      const userPicks = firestorePicks[user.uid] || existing?.picks || {};
      
      // Also merge with locally stored picks if any
      const localPlayers = localStorage.getItem("nfl_survivor_players");
      if (localPlayers) {
        try {
          const parsed = JSON.parse(localPlayers);
          const me = parsed.find((p) => p.id === user.uid || p.email === user.email);
          if (me?.picks) {
            Object.assign(userPicks, me.picks);
          }
        } catch (e) {
          // ignore
        }
      }

      userMap.set(user.uid, {
        id: user.uid,
        name: user.name,
        email: user.email,
        avatar: user.photoURL,
        status: "alive",
        eliminatedWeek: null,
        eliminatedReason: null,
        picks: userPicks
      });
    }

    const unifiedList = Array.from(userMap.values());
    if (unifiedList.length > 0) {
      const calculated = recalculateSurvivorStatuses(schedule, unifiedList);
      setPlayers(calculated);
      localStorage.setItem("nfl_survivor_players", JSON.stringify(calculated));
    }
  }, [firestoreUsers, firestorePicks, schedule, user]);

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

    // Update player pick locally
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

    // Sync Pick to Firestore for all users to see in real time
    const pickDocRef = doc(db, "picks", `${user.uid}_w${week}`);
    setDoc(pickDocRef, {
      userId: user.uid,
      userName: user.name,
      userAvatar: user.photoURL,
      week: Number(week),
      teamId,
      updatedAt: serverTimestamp()
    }, { merge: true }).catch((e) => {
      console.warn("Firestore sync pick (guardado localmente):", e.code || e);
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

      // Sync updated schedule to Firestore for all users
      setDoc(doc(db, "league", "schedule"), {
        schedule: newSchedule,
        updatedAt: serverTimestamp()
      }, { merge: true }).catch((err) => {
        console.warn("Firestore sync schedule error:", err.code || err);
      });

      // Recalculate players
      setPlayers((currentPlayers) => {
        const reevaluated = recalculateSurvivorStatuses(newSchedule, currentPlayers);
        localStorage.setItem("nfl_survivor_players", JSON.stringify(reevaluated));

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
            const { winner, homeScore, awayScore, status, ...rest } = g;
            return { ...rest, status: "scheduled", winner: null, homeScore: null, awayScore: null };
          }
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

      // Sync to Firestore
      setDoc(doc(db, "league", "schedule"), {
        schedule: newSchedule,
        updatedAt: serverTimestamp()
      }, { merge: true }).catch((err) => {
        console.warn("Firestore sync schedule error:", err.code || err);
      });

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

      setDoc(doc(db, "league", "schedule"), {
        schedule: newSchedule,
        updatedAt: serverTimestamp()
      }, { merge: true }).catch((err) => {
        console.warn("Firestore sync schedule error:", err.code || err);
      });

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

  // Reset entire league
  const resetEntireLeague = () => {
    sounds.playWhistle();
    setSchedule(NFL_SCHEDULE);
    localStorage.removeItem("nfl_survivor_schedule");

    setDoc(doc(db, "league", "schedule"), {
      schedule: NFL_SCHEDULE,
      updatedAt: serverTimestamp()
    }, { merge: true }).catch((err) => console.warn(err));

    setPlayers((prev) => {
      const clean = prev.map((p) => ({
        ...p,
        status: "alive",
        eliminatedWeek: null,
        eliminatedReason: null,
        picks: {}
      }));
      localStorage.setItem("nfl_survivor_players", JSON.stringify(clean));
      return clean;
    });
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
