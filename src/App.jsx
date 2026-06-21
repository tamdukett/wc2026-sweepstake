import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const WC_ID = 2000;

const WC_TEAMS = [
  { name: "Mexico", flag: "🇲🇽", group: "A" },
  { name: "South Africa", flag: "🇿🇦", group: "A" },
  { name: "South Korea", flag: "🇰🇷", group: "A" },
  { name: "Czechia", flag: "🇨🇿", group: "A" },
  { name: "Canada", flag: "🇨🇦", group: "B" },
  { name: "Bosnia-Herzegovina", flag: "🇧🇦", group: "B" },
  { name: "Qatar", flag: "🇶🇦", group: "B" },
  { name: "Switzerland", flag: "🇨🇭", group: "B" },
  { name: "Brazil", flag: "🇧🇷", group: "C" },
  { name: "Morocco", flag: "🇲🇦", group: "C" },
  { name: "Haiti", flag: "🇭🇹", group: "C" },
  { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C" },
  { name: "United States", flag: "🇺🇸", group: "D" },
  { name: "Paraguay", flag: "🇵🇾", group: "D" },
  { name: "Australia", flag: "🇦🇺", group: "D" },
  { name: "Turkey", flag: "🇹🇷", group: "D" },
  { name: "Germany", flag: "🇩🇪", group: "E" },
  { name: "Curaçao", flag: "🇨🇼", group: "E" },
  { name: "Ivory Coast", flag: "🇨🇮", group: "E" },
  { name: "Ecuador", flag: "🇪🇨", group: "E" },
  { name: "Netherlands", flag: "🇳🇱", group: "F" },
  { name: "Japan", flag: "🇯🇵", group: "F" },
  { name: "Sweden", flag: "🇸🇪", group: "F" },
  { name: "Tunisia", flag: "🇹🇳", group: "F" },
  { name: "Belgium", flag: "🇧🇪", group: "G" },
  { name: "Egypt", flag: "🇪🇬", group: "G" },
  { name: "Iran", flag: "🇮🇷", group: "G" },
  { name: "New Zealand", flag: "🇳🇿", group: "G" },
  { name: "Spain", flag: "🇪🇸", group: "H" },
  { name: "Cape Verde Islands", flag: "🇨🇻", group: "H" },
  { name: "Saudi Arabia", flag: "🇸🇦", group: "H" },
  { name: "Uruguay", flag: "🇺🇾", group: "H" },
  { name: "France", flag: "🇫🇷", group: "I" },
  { name: "Senegal", flag: "🇸🇳", group: "I" },
  { name: "Iraq", flag: "🇮🇶", group: "I" },
  { name: "Norway", flag: "🇳🇴", group: "I" },
  { name: "Argentina", flag: "🇦🇷", group: "J" },
  { name: "Algeria", flag: "🇩🇿", group: "J" },
  { name: "Austria", flag: "🇦🇹", group: "J" },
  { name: "Jordan", flag: "🇯🇴", group: "J" },
  { name: "Portugal", flag: "🇵🇹", group: "K" },
  { name: "Congo DR", flag: "🇨🇩", group: "K" },
  { name: "Uzbekistan", flag: "🇺🇿", group: "K" },
  { name: "Colombia", flag: "🇨🇴", group: "K" },
  { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L" },
  { name: "Croatia", flag: "🇭🇷", group: "L" },
  { name: "Ghana", flag: "🇬🇭", group: "L" },
  { name: "Panama", flag: "🇵🇦", group: "L" },
];

const AVATAR_COLORS = [
  "#e63946","#f4a261","#2a9d8f","#457b9d","#8338ec",
  "#fb5607","#06d6a0","#118ab2","#ff006e","#ffbe0b",
  "#3a86ff","#c77dff","#f72585","#4cc9f0","#80b918",
];

const ROASTS = [
  "Tough scoreline. Might want to sit this one out on Monday.",
  "That's going to be a quiet one at the watercooler.",
  "Bold strategy. Let's see how it pays off.",
  "The wheels have officially come off.",
  "Statistically speaking, things can only get better. Probably.",
  "On the bright side, at least it's not the worst score on the board. Yet.",
  "That's a result you bury quietly and never mention again.",
  "Some days you're the pigeon, some days you're the statue.",
  "Character building, that one.",
  "Plot twist nobody asked for.",
];

const DEFAULT_SETTINGS = {
  showHeadToHead: true,
  showPulse: true,
  showBracket: true,
  showGroups: true,
  showFixtures: true,
  showJoin: true,
  allowJoining: true,
  showRoasts: true,
  showBadges: true,
  homeMessage: "",
  customRoasts: "",
};

const getInitials = n => n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2);
const fc = r => r === "W" ? "#00d46a" : r === "D" ? "#f59e0b" : "#ef4444";

const Toggle = ({ value, onChange }) => (
  <div onClick={onChange} style={{ width:44, height:24, borderRadius:99, background:value?"#00d46a":"rgba(255,255,255,0.12)", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
    <div style={{ position:"absolute", top:3, left:value?22:3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }} />
  </div>
);

// Knockout bracket constants
const CARD_W = 160;
const CARD_H = 72;
const COL_GAP = 40;
const ROUND_KEYS = ["LAST_32","LAST_16","QUARTER_FINALS","SEMI_FINALS","THIRD_PLACE","FINAL"];
const ROUND_LABELS = { LAST_32:"Round of 32", LAST_16:"Round of 16", QUARTER_FINALS:"Quarter Finals", SEMI_FINALS:"Semi Finals", THIRD_PLACE:"3rd Place", FINAL:"Final" };
export default function App() {
  const [screen, setScreen] = useState("home");
  const [participants, setParticipants] = useState([]);
  const [standings, setStandings] = useState({});
  const [fixtures, setFixtures] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [knockoutMatches, setKnockoutMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newName, setNewName] = useState("");
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [groupFilter, setGroupFilter] = useState("ALL");
  const [teamSearch, setTeamSearch] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [previousRanks, setPreviousRanks] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [leaderId, setLeaderId] = useState(null);
  const [h2hA, setH2hA] = useState(null);
  const [h2hB, setH2hB] = useState(null);
  const [previousEnriched, setPreviousEnriched] = useState([]);
  const [adminSettings, setAdminSettings] = useState(DEFAULT_SETTINGS);
  const liveTimer = useRef(null);

  const loadParticipants = useCallback(async () => {
    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setParticipants(data.map(p => ({
        ...p,
        teams: typeof p.teams === "string" ? JSON.parse(p.teams) : p.teams
      })));
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("settings")
        .eq("id", "singleton")
        .maybeSingle();
      if (!error && data?.settings && Object.keys(data.settings).length > 0) {
        setAdminSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (e) {
      console.warn("Settings not loaded:", e);
    }
  }, []);

  const saveSettings = async (newSettings) => {
    await supabase
      .from("app_settings")
      .upsert({ id: "singleton", settings: newSettings, updated_at: new Date().toISOString() });
  };

  const updateSetting = (key, value) => {
    setAdminSettings(prev => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  };

  useEffect(() => {
    loadParticipants();
    loadSettings();
    const channel = supabase
      .channel("participants-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, () => loadParticipants())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [loadParticipants, loadSettings]);

  const fetchFromAPI = useCallback(async (path) => {
    const res = await fetch(`/api/football?path=${encodeURIComponent(path)}`);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [standingsData, matchesData] = await Promise.all([
        fetchFromAPI(`competitions/${WC_ID}/standings`),
        fetchFromAPI(`competitions/${WC_ID}/matches`),
      ]);
      const newStandings = {};
      if (standingsData.standings) {
        standingsData.standings.forEach(stage => {
          if (stage.type === "TOTAL") {
            stage.table.forEach(row => {
              newStandings[row.team.name] = {
                played: row.playedGames, won: row.won, drawn: row.draw,
                lost: row.lost, gf: row.goalsFor, ga: row.goalsAgainst,
                gd: row.goalDifference, pts: row.points,
                form: (row.form || "").split(",").filter(Boolean).slice(-5),
              };
            });
          }
        });
      }
      setStandings(newStandings);
      if (matchesData.matches) {
        const all = matchesData.matches;
        setLiveMatches(all.filter(m => ["IN_PLAY","PAUSED","HALFTIME"].includes(m.status)));
        setFixtures([
          ...all.filter(m => ["IN_PLAY","PAUSED","HALFTIME"].includes(m.status)),
          ...all.filter(m => m.status === "TIMED" || m.status === "SCHEDULED"),
          ...all.filter(m => m.status === "FINISHED").slice(-15),
        ]);
        setKnockoutMatches(all.filter(m => m.stage && !m.stage.includes("GROUP")));
      }
      setApiError(false);
      setLastUpdated(new Date().toLocaleTimeString("en-GB"));
    } catch (e) {
      console.error(e);
      setApiError(true);
    }
    setLoading(false);
  }, [fetchFromAPI]);

  useEffect(() => {
    fetchAll();
    liveTimer.current = setInterval(fetchAll, 60000);
    return () => clearInterval(liveTimer.current);
  }, [fetchAll]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const takenTeams = participants.flatMap(p => p.teams || []);
  const availableTeams = WC_TEAMS.filter(t => !takenTeams.includes(t.name));
  const toggleTeam = name => setSelectedTeams(p => p.includes(name) ? p.filter(t => t !== name) : [...p, name]);

  const handleRegister = async () => {
    if (!newName.trim()) { showToast("Enter your name", "error"); return; }
    if (!selectedTeams.length) { showToast("Pick at least one team!", "error"); return; }
    if (editingId) {
      const { error } = await supabase.from("participants").update({ teams: JSON.stringify(selectedTeams) }).eq("id", editingId);
      if (error) { showToast("Error saving — try again", "error"); return; }
      setEditingId(null); setNewName(""); setSelectedTeams([]);
      showToast("Teams updated! 🎉"); setScreen("leaderboard"); return;
    }
    if (participants.find(p => p.name.toLowerCase() === newName.trim().toLowerCase())) {
      showToast("Name already taken!", "error"); return;
    }
    const color = AVATAR_COLORS[participants.length % AVATAR_COLORS.length];
    const { error } = await supabase.from("participants").insert([{ name: newName.trim(), teams: JSON.stringify(selectedTeams), color }]);
    if (error) { showToast("Error saving — try again", "error"); return; }
    setNewName(""); setSelectedTeams([]);
    showToast(`Welcome ${newName.trim()}! 🎉`); setScreen("leaderboard");
  };

  const handleRemove = async (id) => {
    await supabase.from("participants").delete().eq("id", id);
    showToast("Removed");
  };

  const enriched = participants.map(p => {
    const teams = typeof p.teams === "string" ? JSON.parse(p.teams) : p.teams;
    const teamData = teams.map(t => standings[t] || { pts:0, played:0, won:0, drawn:0, lost:0, gf:0, ga:0, gd:0 });
    return {
      ...p, teams,
      totalPts: teamData.reduce((s,t) => s + t.pts, 0),
      totalWon: teamData.reduce((s,t) => s + t.won, 0),
      totalGd: teamData.reduce((s,t) => s + (t.gd||0), 0),
    };
  }).sort((a,b) => b.totalPts - a.totalPts || b.totalGd - a.totalGd);

  useEffect(() => {
    setPreviousRanks(prev => {
      const current = {};
      enriched.forEach((p, i) => { current[p.id] = i; });
      const merged = {};
      Object.keys(current).forEach(id => { merged[id] = prev[id] !== undefined ? prev[id] : current[id]; });
      return merged;
    });
  }, [standings]);

  useEffect(() => {
    if (enriched.length === 0) return;
    const currentLeader = enriched[0].id;
    if (leaderId !== null && currentLeader !== leaderId) setConfettiTrigger(c => c + 1);
    setLeaderId(currentLeader);
  }, [standings]);

  useEffect(() => {
    setPreviousEnriched(enriched);
  }, [standings]);

  const filtered = enriched.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.teams.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRank = i => {
    if (i===0) return { emoji:"🥇", color:"#ffd700" };
    if (i===1) return { emoji:"🥈", color:"#c0c0c0" };
    if (i===2) return { emoji:"🥉", color:"#cd7f32" };
    return { emoji:`#${i+1}`, color:"#6b7280" };
  };

  const getRoast = seed => {
    const custom = (adminSettings.customRoasts||"").split("\n").map(r=>r.trim()).filter(Boolean);
    const pool = custom.length > 0 ? custom : ROASTS;
    return pool[seed % pool.length];
  };

  const matchStatusLabel = m => {
    if (m.status === "IN_PLAY") return `🔴 ${m.minute ? `${m.minute}' ` : ""}LIVE`;
    if (m.status === "HALFTIME") return "⏸ Half Time";
    if (m.status === "PAUSED") return "⏸ Paused";
    if (m.status === "FINISHED") return "FT";
    if (m.status === "TIMED" || m.status === "SCHEDULED") {
      const d = new Date(m.utcDate);
      return d.toLocaleDateString("en-GB",{day:"numeric",month:"short"}) + " " + d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
    }
    return m.status;
  };

  const getFlag = name => {
  if (!name) return "🏳️";
  return WC_TEAMS.find(t =>
    t.name === name ||
    name.includes(t.name) ||
    t.name.includes(name) ||
    t.name.toLowerCase() === name.toLowerCase() ||
    // Common API short name mappings
    (name === "USA" && t.name === "United States") ||
    (name === "Korea Republic" && t.name === "South Korea") ||
    (name === "IR Iran" && t.name === "Iran") ||
    (name === "Côte d'Ivoire" && t.name === "Ivory Coast") ||
    (name === "Congo DR" && t.name === "Congo DR") ||
    (name === "Türkiye" && t.name === "Turkey") ||
    (name === "Cape Verde" && t.name === "Cape Verde Islands")
  )?.flag || "🏳️";
};

  const getOwnerBanner = (homeOwners, awayOwners) => {
    const names = [...new Set([...homeOwners, ...awayOwners].map(o => o.name))];
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]}'s team is playing!`;
    if (names.length === 2) return `${names[0]} & ${names[1]}'s teams are playing!`;
    return `${names.slice(0,-1).join(", ")} & ${names[names.length-1]}'s teams are playing!`;
  };

  const getProbBar = (m) => {
    const sH = standings[m.homeTeam?.name] || {};
    const sA = standings[m.awayTeam?.name] || {};
    if (!sH.played && !sA.played) return null;
    const scoreH = (sH.pts||0)*3+(sH.won||0)*2+(sH.gf||0)*0.5+(sH.gd||0)*0.3+3;
    const scoreA = (sA.pts||0)*3+(sA.won||0)*2+(sA.gf||0)*0.5+(sA.gd||0)*0.3+3;
    const total = scoreH + scoreA + (scoreH+scoreA)*0.25;
    const winH = Math.round((scoreH/total)*100);
    const winA = Math.round((scoreA/total)*100);
    const draw = 100-winH-winA;
    return {
      winH, winA, draw,
      hShort: m.homeTeam?.shortName||m.homeTeam?.name?.split(" ")[0]||"Home",
      aShort: m.awayTeam?.shortName||m.awayTeam?.name?.split(" ")[0]||"Away",
    };
  };

  const visibleTeams = WC_TEAMS.filter(t => {
    const ok = !takenTeams.includes(t.name) || selectedTeams.includes(t.name);
    const grp = groupFilter === "ALL" || t.group === groupFilter;
    const sch = t.name.toLowerCase().includes(teamSearch.toLowerCase());
    return ok && grp && sch;
  });

  const groups = ["ALL","A","B","C","D","E","F","G","H","I","J","K","L"];

  const S = {
    app: { minHeight:"100vh", background:"linear-gradient(160deg,#0a1628 0%,#0d2137 60%,#0a1f1a 100%)", fontFamily:"'Inter','Segoe UI',sans-serif", color:"#e8f4f8" },
    inner: { maxWidth:700, margin:"0 auto", padding:"0 16px 80px", position:"relative", zIndex:1 },
    card: { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16 },
    row: { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"14px 16px", marginBottom:10, cursor:"pointer" },
    btn: { background:"linear-gradient(135deg,#00d46a,#00b359)", color:"#0a1628", border:"none", borderRadius:12, padding:"14px 28px", fontSize:15, fontWeight:700, cursor:"pointer", width:"100%" },
    inp: { background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"#e8f4f8", borderRadius:10, padding:"11px 14px", fontSize:14, width:"100%", boxSizing:"border-box", outline:"none" },
    lbl: { display:"block", marginBottom:8, fontSize:13, fontWeight:600, color:"#6b9aad" },
    sec: { fontSize:12, fontWeight:700, color:"#6b9aad", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 },
  };

  const h2hPlayerA = enriched.find(p => p.id === h2hA);
  const h2hPlayerB = enriched.find(p => p.id === h2hB);

  const navTabs = [
    ["home","🏠 Home", true],
    ["leaderboard","📊 Leaderboard", true],
    ["headtohead","⚔️ H2H", adminSettings.showHeadToHead],
    ["pulse","💓 Pulse", adminSettings.showPulse],
    ["fixtures","📅 Fixtures", adminSettings.showFixtures],
    ["standings","🌍 Groups", adminSettings.showGroups],
    ["knockout","🏆 Knockout", adminSettings.showBracket],
    ["register","➕ Join", adminSettings.showJoin && adminSettings.allowJoining],
  ];

  const ProbBar = ({ m }) => {
    const prob = getProbBar(m);
    if (!prob) return null;
    return (
      <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#6b9aad", marginBottom:5, fontWeight:600 }}>
          <span>{prob.hShort} {prob.winH}%</span>
          <span style={{ color:"#4a6a7a" }}>Draw {prob.draw}%</span>
          <span>{prob.winA}% {prob.aShort}</span>
        </div>
        <div style={{ height:5, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden", display:"flex" }}>
          <div style={{ width:`${prob.winH}%`, background:"#00d46a", borderRadius:"99px 0 0 99px" }} />
          <div style={{ width:`${prob.draw}%`, background:"rgba(255,255,255,0.15)" }} />
          <div style={{ width:`${prob.winA}%`, background:"#3a86ff", borderRadius:"0 99px 99px 0" }} />
        </div>
        <div style={{ fontSize:9, color:"#3a5a6a", marginTop:4, textAlign:"center" }}>Based on current group stage stats · Not a guarantee</div>
      </div>
    );
  };

  // ── Bracket renderer ──────────────────────────────────────────
  const BracketView = () => {
    // Which rounds exist in the data
    const presentRounds = ROUND_KEYS.filter(k => knockoutMatches.some(m => m.stage === k));
    if (presentRounds.length === 0) return (
      <div style={{ ...S.card, padding:"40px 24px", textAlign:"center" }}>
        <div style={{ fontSize:44, marginBottom:12 }}>🏆</div>
        <div style={{ fontWeight:600, marginBottom:8 }}>Knockout stage not started yet</div>
        <div style={{ color:"#6b9aad", fontSize:14 }}>Check back once the group stage is complete</div>
      </div>
    );

    const numRounds = presentRounds.length;
    // Max matches in first round
    const firstRoundCount = knockoutMatches.filter(m => m.stage === presentRounds[0]).length;
    // Card vertical pitch: doubles each round
    const basePitch = CARD_H + 12; // card height + gap
    const totalHeight = firstRoundCount * basePitch;
    const totalWidth = numRounds * (CARD_W + COL_GAP);

    // Compute vertical centre of each match card per round
    const matchCentres = {};
    presentRounds.forEach((key, ri) => {
      const matches = knockoutMatches.filter(m => m.stage === key);
      const count = matches.length;
      const pitch = totalHeight / count;
      matchCentres[key] = matches.map((_, mi) => pitch * mi + pitch / 2);
    });

    const renderTeamRow = (team, score, won, isLive, isDone) => {
      const name = team?.name;
      const flag = name ? getFlag(name) : null;
      const nameMap = {
  "USA": "United States",
  "Korea Republic": "South Korea",
  "IR Iran": "Iran",
  "Côte d'Ivoire": "Ivory Coast",
  "Türkiye": "Turkey",
  "Cape Verde": "Cape Verde Islands",
};
const resolvedName = nameMap[name] || name;
const owners = name ? participants.filter(p => p.teams.some(t =>
  resolvedName.includes(t) || t.includes(resolvedName) || name.includes(t) || t.includes(name)
)) : [];
      return (
        <div style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 8px", flex:1 }}>
          <span style={{ fontSize:13, flexShrink:0, width:18 }}>{flag || "🏳️"}</span>
          <span style={{
            fontSize:11, fontWeight:won?700:400,
            color: won ? "#00d46a" : name ? "#e8f4f8" : "#4a6a7a",
            flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"
          }}>
            {name || "TBD"}
          </span>
          {owners.length > 0 && (
            <div style={{ display:"flex", gap:2 }}>
              {owners.slice(0,2).map(o=>(
                <span key={o.id} style={{ background:o.color, color:"#fff", fontSize:7, fontWeight:700, padding:"1px 3px", borderRadius:99, flexShrink:0 }}>
                  {getInitials(o.name)}
                </span>
              ))}
            </div>
          )}
          {(isLive||isDone) && score !== null && score !== undefined && (
            <span style={{ fontSize:13, fontWeight:800, color:won?"#00d46a":"#6b9aad", flexShrink:0, minWidth:14, textAlign:"right" }}>
              {score}
            </span>
          )}
        </div>
      );
    };

    return (
      <div style={{ overflowX:"auto", overflowY:"auto", WebkitOverflowScrolling:"touch", paddingBottom:8 }}>
        <div style={{ position:"relative", width:totalWidth, minHeight:totalHeight + 40 }}>

          {/* SVG connector lines */}
          <svg style={{ position:"absolute", top:0, left:0, width:totalWidth, height:totalHeight+40, pointerEvents:"none", overflow:"visible" }}>
            {presentRounds.map((key, ri) => {
              if (ri === presentRounds.length - 1) return null;
              const nextKey = presentRounds[ri + 1];
              const centres = matchCentres[key];
              const nextCentres = matchCentres[nextKey];
              const x1 = ri * (CARD_W + COL_GAP) + CARD_W + 20;
              const x2 = (ri + 1) * (CARD_W + COL_GAP) + 20;
              const lines = [];
              for (let i = 0; i < centres.length; i += 2) {
                const cA = centres[i] + 20;
                const cB = centres[i+1] !== undefined ? centres[i+1] + 20 : cA;
                const cNext = nextCentres[Math.floor(i/2)] + 20;
                const mid = (cA + cB) / 2;
                lines.push(
                  <g key={i}>
                    <line x1={x1} y1={cA} x2={x1+10} y2={cA} stroke="rgba(100,160,200,0.3)" strokeWidth="1"/>
                    <line x1={x1+10} y1={cA} x2={x1+10} y2={mid} stroke="rgba(100,160,200,0.3)" strokeWidth="1"/>
                    {centres[i+1] !== undefined && (
                      <>
                        <line x1={x1} y1={cB} x2={x1+10} y2={cB} stroke="rgba(100,160,200,0.3)" strokeWidth="1"/>
                        <line x1={x1+10} y1={cB} x2={x1+10} y2={mid} stroke="rgba(100,160,200,0.3)" strokeWidth="1"/>
                      </>
                    )}
                    <line x1={x1+10} y1={mid} x2={x2} y2={cNext} stroke="rgba(100,160,200,0.3)" strokeWidth="1"/>
                  </g>
                );
              }
              return lines;
            })}
          </svg>

          {/* Round columns */}
          {presentRounds.map((key, ri) => {
            const matches = knockoutMatches.filter(m => m.stage === key);
            const count = matches.length;
            const pitch = totalHeight / count;
            const colX = ri * (CARD_W + COL_GAP);

            return (
              <div key={key} style={{ position:"absolute", left:colX, top:0, width:CARD_W }}>
                {/* Round label */}
                <div style={{ textAlign:"center", fontSize:9, fontWeight:700, color:"#6b9aad", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6, height:20, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {ROUND_LABELS[key]}
                </div>
                {matches.map((m, mi) => {
                  const isLive = ["IN_PLAY","PAUSED","HALFTIME"].includes(m.status);
                  const isDone = m.status === "FINISHED";
                  const homeScore = m.score?.fullTime?.home;
                  const awayScore = m.score?.fullTime?.away;
                  const homeWon = isDone && homeScore > awayScore;
                  const awayWon = isDone && awayScore > homeScore;
                  const cardTop = pitch * mi + pitch/2 - CARD_H/2 + 20;
                  const kickoff = m.utcDate
                    ? new Date(m.utcDate).toLocaleDateString("en-GB",{day:"numeric",month:"short"}) + " " + new Date(m.utcDate).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})
                    : "";

                  return (
                    <div key={m.id} style={{
                      position:"absolute",
                      top:cardTop,
                      left:0,
                      width:CARD_W,
                      height:CARD_H,
                      background: isLive ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
                      border: isLive ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.12)",
                      borderRadius:8,
                      overflow:"hidden",
                      display:"flex",
                      flexDirection:"column",
                    }}>
                      {/* Time strip */}
                      <div style={{ padding:"3px 8px", background:"rgba(0,0,0,0.2)", display:"flex", alignItems:"center", gap:4 }}>
                        {isLive && <span className="live-pulse" style={{ width:5, height:5 }} />}
                        <span style={{ fontSize:9, color:isLive?"#ef4444":"#6b9aad", fontWeight:600, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                          {isLive ? `${m.minute?`${m.minute}'`:""}LIVE` : kickoff}
                        </span>
                      </div>
                      {/* Home */}
                      <div style={{ flex:1, borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", background:homeWon?"rgba(0,212,106,0.06)":"transparent" }}>
                        {renderTeamRow(m.homeTeam, homeScore, homeWon, isLive, isDone)}
                      </div>
                      {/* Away */}
                      <div style={{ flex:1, display:"flex", alignItems:"center", background:awayWon?"rgba(0,212,106,0.06)":"transparent" }}>
                        {renderTeamRow(m.awayTeam, awayScore, awayWon, isLive, isDone)}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={S.app}>
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fall { to { transform: translateY(110vh) rotate(360deg); opacity: 0.3; } }
        .nb { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); color:#e8f4f8; padding:10px 16px; border-radius:10px; cursor:pointer; font-size:13px; font-weight:500; white-space:nowrap; }
        .nb:hover { background:rgba(0,212,106,0.2); border-color:#00d46a; }
        .nb.on { background:#00d46a; border-color:#00d46a; color:#0a1628; font-weight:700; }
        .tt { border-radius:10px; padding:10px 12px; border:1.5px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); cursor:pointer; display:flex; align-items:center; gap:8px; }
        .tt:hover { border-color:rgba(0,212,106,0.4); background:rgba(0,212,106,0.06); }
        .tt.sel { border-color:#00d46a; background:rgba(0,212,106,0.12); }
        .tt.tkn { opacity:0.3; cursor:not-allowed; }
        .gp { padding:5px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.06); color:#a0b8c8; font-size:12px; font-weight:600; cursor:pointer; }
        .gp.on { background:rgba(0,212,106,0.2); border-color:#00d46a; color:#00d46a; }
        .ch { border-radius:8px; padding:3px 8px; font-size:12px; font-weight:600; display:inline-flex; align-items:center; gap:4px; background:rgba(255,255,255,0.07); color:#a0b8c8; white-space:nowrap; }
        .live-pulse { display:inline-block; width:8px; height:8px; border-radius:50%; background:#ef4444; animation:pulse 1s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .match-card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); border-radius:12px; padding:12px 16px; margin-bottom:8px; }
        .match-card.live { border-color:rgba(239,68,68,0.4); background:rgba(239,68,68,0.05); }
        input::placeholder { color:#4a6a7a; }
        .trow { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
      `}</style>

      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
        <svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style={{ opacity:0.06 }}>
          <rect x="20" y="20" width="360" height="560" fill="none" stroke="#00d46a" strokeWidth="2"/>
          <line x1="20" y1="300" x2="380" y2="300" stroke="#00d46a" strokeWidth="1.5"/>
          <circle cx="200" cy="300" r="50" fill="none" stroke="#00d46a" strokeWidth="1.5"/>
          <circle cx="200" cy="300" r="3" fill="#00d46a"/>
          <rect x="90" y="20" width="220" height="80" fill="none" stroke="#00d46a" strokeWidth="1.5"/>
          <rect x="140" y="20" width="120" height="30" fill="none" stroke="#00d46a" strokeWidth="1.5"/>
          <circle cx="200" cy="80" r="2.5" fill="#00d46a"/>
          <path d="M 155 100 A 50 50 0 0 1 245 100" fill="none" stroke="#00d46a" strokeWidth="1.5"/>
          <rect x="90" y="500" width="220" height="80" fill="none" stroke="#00d46a" strokeWidth="1.5"/>
          <rect x="140" y="550" width="120" height="30" fill="none" stroke="#00d46a" strokeWidth="1.5"/>
          <circle cx="200" cy="520" r="2.5" fill="#00d46a"/>
          <path d="M 155 500 A 50 50 0 0 0 245 500" fill="none" stroke="#00d46a" strokeWidth="1.5"/>
          <path d="M 20 40 A 20 20 0 0 1 40 20" fill="none" stroke="#00d46a" strokeWidth="1.5"/>
          <path d="M 360 20 A 20 20 0 0 1 380 40" fill="none" stroke="#00d46a" strokeWidth="1.5"/>
          <path d="M 20 560 A 20 20 0 0 0 40 580" fill="none" stroke="#00d46a" strokeWidth="1.5"/>
          <path d="M 380 560 A 20 20 0 0 1 360 580" fill="none" stroke="#00d46a" strokeWidth="1.5"/>
          <rect x="160" y="8" width="80" height="14" fill="none" stroke="#00d46a" strokeWidth="1.5"/>
          <rect x="160" y="578" width="80" height="14" fill="none" stroke="#00d46a" strokeWidth="1.5"/>
        </svg>
      </div>

      {confettiTrigger > 0 && (
        <div key={confettiTrigger} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:999, overflow:"hidden" }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} style={{
              position:"absolute", left:`${Math.random()*100}%`, top:"-10px", width:8, height:8,
              background:["#00d46a","#ffd700","#ef4444","#3a86ff","#ff006e"][i%5],
              borderRadius:i%2===0?"50%":"2px",
              animation:`fall ${2+Math.random()*2}s linear forwards`,
              animationDelay:`${Math.random()*0.5}s`,
            }} />
          ))}
        </div>
      )}

      {toast && (
        <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", background:toast.type==="error"?"#ef4444":"#00d46a", color:"#fff", padding:"12px 24px", borderRadius:12, fontWeight:600, zIndex:1000, whiteSpace:"nowrap" }}>
          {toast.msg}
        </div>
      )}

      {liveMatches.length > 0 && (
        <div style={{ background:"rgba(239,68,68,0.12)", borderBottom:"1px solid rgba(239,68,68,0.3)", padding:"8px 16px", overflowX:"auto", whiteSpace:"nowrap" }}>
          <span style={{ fontSize:11, fontWeight:700, color:"#ef4444", marginRight:12 }}><span className="live-pulse" style={{ marginRight:6 }} />LIVE</span>
          {liveMatches.map(m => (
            <span key={m.id} style={{ display:"inline-block", marginRight:20, fontSize:13, fontWeight:600 }}>
              {getFlag(m.homeTeam?.name)} {m.homeTeam?.shortName||m.homeTeam?.name}
              <span style={{ color:"#00d46a", margin:"0 6px", fontWeight:800 }}>{m.score?.fullTime?.home??0} – {m.score?.fullTime?.away??0}</span>
              {getFlag(m.awayTeam?.name)} {m.awayTeam?.shortName||m.awayTeam?.name}
              <span style={{ color:"#ef4444", marginLeft:8, fontSize:11 }}>{m.minute?`${m.minute}'`:""}</span>
            </span>
          ))}
        </div>
      )}

      <div style={S.inner}>
        <div style={{ textAlign:"center", padding:"36px 0 24px" }}>
          <img src="/logo.png" alt="Progressive Lets World Cup 2026" style={{ width:220, marginBottom:16 }} />
          <p style={{ color:"#6b9aad", fontSize:13 }}>
            Office Sweepstake · {participants.length} entrant{participants.length!==1?"s":""} · {availableTeams.length} teams left
            {loading && <span style={{ marginLeft:8, color:"#f59e0b" }}>⟳ updating...</span>}
            {apiError && <span style={{ marginLeft:8, color:"#ef4444" }}>⚠ API unavailable</span>}
          </p>
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
          {navTabs.filter(([,,v])=>v).map(([id,label])=>(
            <button key={id} className={`nb ${screen===id?"on":""}`} onClick={()=>setScreen(id)}>{label}</button>
          ))}
          <button className={`nb ${screen==="admin"?"on":""}`} style={{ marginLeft:"auto" }} onClick={()=>setScreen("admin")}>⚙️</button>
        </div>

        {screen === "home" && (
          <div>
            <div style={{ ...S.card, padding:"28px 24px", textAlign:"center", marginBottom:14 }}>
              <div style={{ fontSize:34, marginBottom:10 }}>⚽</div>
              <h2 style={{ fontSize:19, fontWeight:700, marginBottom:8 }}>Welcome to the Sweepstake!</h2>
              <p style={{ color:"#6b9aad", marginBottom:22, lineHeight:1.6, fontSize:14 }}>Claim your teams, follow them live, highest combined points wins!</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:22 }}>
                {[["🏳️","Teams Left",`${availableTeams.length}/48`],["👥","Entrants",participants.length],["🔴","Live Now",liveMatches.length],["📅","Tournament","Jun–Jul 2026"]].map(([icon,label,val])=>(
                  <div key={label} style={{ background:"rgba(0,212,106,0.07)", border:"1px solid rgba(0,212,106,0.18)", borderRadius:12, padding:"14px 10px" }}>
                    <div style={{ fontSize:18, marginBottom:3 }}>{icon}</div>
                    <div style={{ fontSize:20, fontWeight:800, color:"#00d46a" }}>{val}</div>
                    <div style={{ fontSize:11, color:"#6b9aad", marginTop:2 }}>{label}</div>
                  </div>
                ))}
              </div>
              {adminSettings.homeMessage && (
                <div style={{ background:"rgba(0,212,106,0.08)", border:"1px solid rgba(0,212,106,0.2)", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#00d46a", fontWeight:600 }}>
                  📢 {adminSettings.homeMessage}
                </div>
              )}
              <button style={S.btn} onClick={()=>setScreen("register")}>Join the Sweepstake →</button>
              {(() => {
                const total = 104;
                const played = fixtures.filter(m=>m.status==="FINISHED").length;
                const pct = Math.round((played/total)*100);
                return (
                  <div style={{ marginTop:18 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#6b9aad", marginBottom:6 }}>
                      <span style={{ fontWeight:600 }}>🏆 Tournament Progress</span>
                      <span>{played} of {total} matches played</span>
                    </div>
                    <div style={{ height:8, borderRadius:99, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#00d46a,#00b359)", borderRadius:99, transition:"width 0.6s ease" }} />
                    </div>
                    <div style={{ textAlign:"right", fontSize:11, color:"#00d46a", marginTop:4, fontWeight:600 }}>{pct}% complete</div>
                  </div>
                );
              })()}
            </div>

            {(() => {
              if (enriched.length < 2 || previousEnriched.length === 0) return null;
              const movers = enriched.map(p => {
                const prev = previousEnriched.find(x=>x.id===p.id);
                return { ...p, gained: prev ? p.totalPts-prev.totalPts : 0 };
              }).filter(p=>p.gained>0).sort((a,b)=>b.gained-a.gained);
              const biggest = movers[0];
              if (!biggest) return null;
              return (
                <div style={{ ...S.card, padding:"14px 18px", marginBottom:14, display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ fontSize:28 }}>🚀</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#6b9aad", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Biggest Mover</div>
                    <div style={{ fontWeight:700, fontSize:15 }}>{biggest.name}</div>
                    <div style={{ fontSize:12, color:"#6b9aad" }}>gained the most points this refresh</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:20, fontWeight:800, color:"#00d46a" }}>+{biggest.gained}</div>
                    <div style={{ fontSize:11, color:"#6b9aad" }}>pts</div>
                  </div>
                </div>
              );
            })()}

            {liveMatches.length > 0 && (
              <div style={{ ...S.card, padding:"16px 20px", marginBottom:14 }}>
                <p style={{ fontSize:12, fontWeight:700, color:"#ef4444", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                  <span className="live-pulse" />LIVE MATCHES
                </p>
                {liveMatches.map(m => {
                  const homeOwners = participants.filter(p=>p.teams.some(t=>m.homeTeam?.name?.includes(t)||t.includes(m.homeTeam?.name)));
                  const awayOwners = participants.filter(p=>p.teams.some(t=>m.awayTeam?.name?.includes(t)||t.includes(m.awayTeam?.name)));
                  const banner = getOwnerBanner(homeOwners, awayOwners);
                  const scorers = (m.goals||[]).filter(g=>g.type==="REGULAR"||!g.type);
                  const kickoff = new Date(m.utcDate).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
                  return (
                    <div key={m.id} className="match-card live" style={banner?{borderColor:"rgba(0,212,106,0.4)",background:"rgba(0,212,106,0.05)"}:{}}>
                      {banner && <div style={{ fontSize:11, fontWeight:700, color:"#00d46a", marginBottom:8 }}>⭐ {banner}</div>}
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
                          <span style={{ fontSize:18 }}>{getFlag(m.homeTeam?.name)}</span>
                          <span style={{ fontWeight:700, fontSize:14 }}>{m.homeTeam?.shortName||m.homeTeam?.name}</span>
                          {homeOwners.map(o=><span key={o.id} style={{ background:o.color, color:"#fff", fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:99 }}>{getInitials(o.name)}</span>)}
                        </div>
                        <div style={{ textAlign:"center", padding:"0 12px" }}>
                          <div style={{ fontSize:20, fontWeight:800, color:"#00d46a" }}>{m.score?.fullTime?.home??0} – {m.score?.fullTime?.away??0}</div>
                          <div style={{ fontSize:11, color:"#ef4444", fontWeight:700 }}>{m.minute?`${m.minute}' `:""}LIVE</div>
                          <div style={{ fontSize:10, color:"#6b9aad", marginTop:2 }}>KO {kickoff}</div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, justifyContent:"flex-end" }}>
                          {awayOwners.map(o=><span key={o.id} style={{ background:o.color, color:"#fff", fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:99 }}>{getInitials(o.name)}</span>)}
                          <span style={{ fontWeight:700, fontSize:14 }}>{m.awayTeam?.shortName||m.awayTeam?.name}</span>
                          <span style={{ fontSize:18 }}>{getFlag(m.awayTeam?.name)}</span>
                        </div>
                      </div>
                      {scorers.length > 0 && (
                        <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.08)", fontSize:11, color:"#a0b8c8" }}>
                          ⚽ {scorers.map((g,gi)=><span key={gi}>{g.scorer?.name||"Unknown"} {g.minute}'{gi<scorers.length-1?" · ":""}</span>)}
                        </div>
                      )}
                      <ProbBar m={m} />
                    </div>
                  );
                })}
              </div>
            )}

            {enriched.length > 0 && (
              <div style={{ ...S.card, padding:"18px 20px" }}>
                <p style={{ fontSize:12, fontWeight:700, color:"#6b9aad", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>Office Top 3</p>
                {enriched.slice(0,3).map((p,i)=>(
                  <div key={p.id} style={{ ...S.row, display:"flex", alignItems:"center", gap:12, padding:"12px 14px" }}>
                    <span style={{ fontSize:20, width:28 }}>{getRank(i).emoji}</span>
                    <div style={{ width:38, height:38, borderRadius:"50%", background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, color:"#fff", flexShrink:0 }}>{getInitials(p.name)}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:15 }}>{p.name}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:4 }}>
                        {p.teams.map(t=>{ const info=WC_TEAMS.find(x=>x.name===t); return <span key={t} className="ch">{info?.flag} {t}</span>; })}
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:800, color:"#00d46a", fontSize:18 }}>{p.totalPts}</div>
                      <div style={{ fontSize:11, color:"#6b9aad" }}>pts</div>
                    </div>
                  </div>
                ))}
                <button className="nb" style={{ width:"100%", marginTop:8 }} onClick={()=>setScreen("leaderboard")}>Full Leaderboard →</button>
              </div>
            )}
          </div>
        )}

        {screen === "fixtures" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <h2 style={{ fontSize:19, fontWeight:700 }}>Fixtures & Results</h2>
              <button className="nb" style={{ fontSize:12, padding:"7px 12px" }} onClick={fetchAll}>🔄 Refresh</button>
            </div>
            {apiError && <div style={{ ...S.card, padding:"24px", textAlign:"center", color:"#f59e0b", marginBottom:14 }}>⚠️ Could not load live data</div>}
            {fixtures.length === 0 && !apiError && <div style={{ textAlign:"center", color:"#6b9aad", padding:"40px 0" }}>Loading fixtures...</div>}
            {fixtures.map(m => {
              const isLive = ["IN_PLAY","PAUSED","HALFTIME"].includes(m.status);
              const isDone = m.status === "FINISHED";
              const owners = name => participants.filter(p=>p.teams.some(t=>name?.includes(t)||t.includes(name)));
              const homeOwners = owners(m.homeTeam?.name);
              const awayOwners = owners(m.awayTeam?.name);
              const banner = getOwnerBanner(homeOwners, awayOwners);
              const scorers = (m.goals||[]).filter(g=>g.type==="REGULAR"||!g.type);
              const kickoff = new Date(m.utcDate).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
              return (
                <div key={m.id} className={`match-card ${isLive?"live":""}`} style={banner&&!isLive?{borderColor:"rgba(0,212,106,0.4)",background:"rgba(0,212,106,0.05)"}:{}}>
                  {banner && <div style={{ fontSize:11, fontWeight:700, color:"#00d46a", marginBottom:8 }}>⭐ {banner}</div>}
                  <div style={{ fontSize:11, color:isLive?"#ef4444":"#6b9aad", fontWeight:700, marginBottom:8 }}>
                    {isLive && <span className="live-pulse" style={{ marginRight:6 }} />}
                    {matchStatusLabel(m)}
                    {isLive && <span style={{ marginLeft:8, color:"#6b9aad", fontWeight:400 }}>· KO {kickoff}</span>}
                    {m.group && <span style={{ marginLeft:8, color:"#6b9aad", fontWeight:400 }}>· Group {m.group?.replace("GROUP_","")}</span>}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:20 }}>{getFlag(m.homeTeam?.name)}</span>
                        <div>
                          <div style={{ fontWeight:700, fontSize:14 }}>{m.homeTeam?.name}</div>
                          <div style={{ display:"flex", gap:3, marginTop:2 }}>
                            {homeOwners.map(o=><span key={o.id} style={{ background:o.color, color:"#fff", fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:99 }}>{getInitials(o.name)}</span>)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign:"center", padding:"0 16px" }}>
                      {(isLive||isDone)
                        ? <div style={{ fontSize:22, fontWeight:800, color:"#00d46a" }}>{m.score?.fullTime?.home??0} – {m.score?.fullTime?.away??0}</div>
                        : <div style={{ fontSize:16, fontWeight:700, color:"#6b9aad" }}>vs</div>}
                    </div>
                    <div style={{ flex:1, textAlign:"right" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"flex-end" }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:14 }}>{m.awayTeam?.name}</div>
                          <div style={{ display:"flex", gap:3, marginTop:2, justifyContent:"flex-end" }}>
                            {awayOwners.map(o=><span key={o.id} style={{ background:o.color, color:"#fff", fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:99 }}>{getInitials(o.name)}</span>)}
                          </div>
                        </div>
                        <span style={{ fontSize:20 }}>{getFlag(m.awayTeam?.name)}</span>
                      </div>
                    </div>
                  </div>
                  {scorers.length > 0 && (
                    <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.08)", fontSize:11, color:"#a0b8c8" }}>
                      ⚽ {scorers.map((g,gi)=><span key={gi}>{g.scorer?.name||"Unknown"} {g.minute}'{gi<scorers.length-1?" · ":""}</span>)}
                    </div>
                  )}
                  <ProbBar m={m} />
                </div>
              );
            })}
          </div>
        )}

        {screen === "leaderboard" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <h2 style={{ fontSize:19, fontWeight:700 }}>Office Leaderboard</h2>
              <div style={{ fontSize:11, color:"#6b9aad" }}>Updated {lastUpdated||"—"}</div>
            </div>
            <div style={{ marginBottom:14 }}>
              <input style={S.inp} type="text" placeholder="🔍 Search..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
            </div>
            {filtered.length === 0 ? (
              <div style={{ ...S.card, padding:"44px 24px", textAlign:"center" }}>
                <div style={{ fontSize:44, marginBottom:10 }}>🏟️</div>
                <div style={{ fontWeight:600, marginBottom:6 }}>No entrants yet</div>
                <button style={{ ...S.btn, maxWidth:200, margin:"0 auto" }} onClick={()=>setScreen("register")}>Join Now</button>
              </div>
            ) : filtered.map((p,i) => {
              const isExp = expanded === p.id;
              return (
                <div key={p.id} style={{ ...S.row, border:i===0?"1px solid rgba(255,215,0,0.25)":"1px solid rgba(255,255,255,0.07)" }} onClick={()=>setExpanded(isExp?null:p.id)}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:32, textAlign:"center", fontSize:i<3?20:13, fontWeight:700, color:getRank(i).color, flexShrink:0 }}>{getRank(i).emoji}</div>
                    <div style={{ width:42, height:42, borderRadius:"50%", background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, color:"#fff", flexShrink:0, boxShadow:i===0?"0 0 0 2px #ffd700":"none" }}>{getInitials(p.name)}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:15, display:"flex", alignItems:"center", gap:6 }}>
                        {p.name}
                        {adminSettings.showBadges && i===0 && filtered.length>1 && <span style={{ fontSize:13 }}>🔥</span>}
                        {adminSettings.showBadges && i===filtered.length-1 && filtered.length>2 && <span style={{ fontSize:13 }}>💀</span>}
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:4 }}>
                        {p.teams.map(t=>{ const info=WC_TEAMS.find(x=>x.name===t); const ts=standings[t]; return <span key={t} className="ch">{info?.flag} {t}{ts?` · ${ts.pts}pt`:""}</span>; })}
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:20, fontWeight:800, color:"#00d46a" }}>{p.totalPts}</div>
                      <div style={{ fontSize:11, color:"#6b9aad" }}>pts</div>
                      {(()=>{
                        const prevRank = previousRanks[p.id];
                        if (prevRank===undefined) return null;
                        if (prevRank>i) return <div style={{ fontSize:13, color:"#00d46a", fontWeight:700 }}>▲ {prevRank-i}</div>;
                        if (prevRank<i) return <div style={{ fontSize:13, color:"#ef4444", fontWeight:700 }}>▼ {i-prevRank}</div>;
                        return <div style={{ fontSize:11, color:"#6b9aad" }}>—</div>;
                      })()}
                    </div>
                  </div>
                  {isExp && (
                    <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                      <p style={{ fontSize:11, fontWeight:700, color:"#6b9aad", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Team Breakdown</p>
                      {p.teams.map(tName=>{
                        const info=WC_TEAMS.find(x=>x.name===tName); const ts=standings[tName]||{};
                        return (
                          <div key={tName} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, padding:"8px 10px", background:"rgba(255,255,255,0.04)", borderRadius:8 }}>
                            <span style={{ fontSize:18 }}>{info?.flag}</span>
                            <div style={{ flex:1 }}>
                              <div style={{ fontWeight:600, fontSize:13 }}>{tName}</div>
                              <div style={{ fontSize:12, color:"#6b9aad" }}>{ts.played??0}P · {ts.won??0}W · {ts.drawn??0}D · {ts.lost??0}L · GD {ts.gd??0}</div>
                              {ts.form && ts.form.length>0 && (
                                <div style={{ display:"flex", gap:3, marginTop:4 }}>
                                  {ts.form.map((r,fi)=><span key={fi} style={{ width:16, height:16, borderRadius:3, background:fc(r), display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"#fff" }}>{r}</span>)}
                                </div>
                              )}
                            </div>
                            <div style={{ fontWeight:800, color:"#00d46a", fontSize:16 }}>{ts.pts??0}<span style={{ fontSize:11, fontWeight:400, color:"#6b9aad" }}> pt</span></div>
                          </div>
                        );
                      })}
                      <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 10px", background:"rgba(0,212,106,0.08)", borderRadius:8, marginTop:4 }}>
                        <span style={{ fontWeight:700, fontSize:13 }}>Combined total</span>
                        <span style={{ fontWeight:800, color:"#00d46a", fontSize:15 }}>{p.totalPts} pts</span>
                      </div>
                      {(()=>{
                        const seed = p.id+(p.totalPts||0);
                        const isLow = i===filtered.length-1 && filtered.length>2;
                        return isLow && adminSettings.showRoasts ? (
                          <div style={{ marginTop:10, padding:"8px 10px", background:"rgba(239,68,68,0.08)", borderRadius:8, fontSize:12, color:"#f3a5a5", fontStyle:"italic" }}>
                            💬 {getRoast(seed)}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {screen === "headtohead" && (
          <div>
            <h2 style={{ fontSize:19, fontWeight:700, marginBottom:18 }}>Head-to-Head</h2>
            {enriched.length < 2 ? (
              <div style={{ ...S.card, padding:"40px 24px", textAlign:"center" }}>
                <div style={{ fontSize:44, marginBottom:10 }}>⚔️</div>
                <div style={{ fontWeight:600 }}>Need at least 2 entrants</div>
              </div>
            ) : (
              <div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
                  <div>
                    <label style={S.lbl}>Player A</label>
                    <select style={{...S.inp, color:"#0a1628", background:"#e8f4f8"}} value={h2hA??""} onChange={e=>setH2hA(Number(e.target.value)||null)}>
                      <option value="">Select...</option>
                      {enriched.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.lbl}>Player B</label>
                    <select style={{...S.inp, color:"#0a1628", background:"#e8f4f8"}} value={h2hB??""} onChange={e=>setH2hB(Number(e.target.value)||null)}>
                      <option value="">Select...</option>
                      {enriched.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
                {h2hPlayerA && h2hPlayerB && h2hPlayerA.id!==h2hPlayerB.id ? (
                  <div>
                    <div style={{ ...S.card, padding:"20px", marginBottom:14, textAlign:"center" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:20 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ width:50, height:50, borderRadius:"50%", background:h2hPlayerA.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:16, color:"#fff", margin:"0 auto 8px" }}>{getInitials(h2hPlayerA.name)}</div>
                          <div style={{ fontWeight:700, fontSize:15 }}>{h2hPlayerA.name}</div>
                          <div style={{ fontSize:28, fontWeight:800, color:h2hPlayerA.totalPts>=h2hPlayerB.totalPts?"#00d46a":"#6b9aad" }}>{h2hPlayerA.totalPts}</div>
                        </div>
                        <div style={{ fontSize:18, fontWeight:700, color:"#6b9aad" }}>VS</div>
                        <div style={{ flex:1 }}>
                          <div style={{ width:50, height:50, borderRadius:"50%", background:h2hPlayerB.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:16, color:"#fff", margin:"0 auto 8px" }}>{getInitials(h2hPlayerB.name)}</div>
                          <div style={{ fontWeight:700, fontSize:15 }}>{h2hPlayerB.name}</div>
                          <div style={{ fontSize:28, fontWeight:800, color:h2hPlayerB.totalPts>=h2hPlayerA.totalPts?"#00d46a":"#6b9aad" }}>{h2hPlayerB.totalPts}</div>
                        </div>
                      </div>
                      <div style={{ marginTop:14, fontSize:13, color:"#6b9aad" }}>
                        {h2hPlayerA.totalPts===h2hPlayerB.totalPts?"Dead even — anyone's game":`${h2hPlayerA.totalPts>h2hPlayerB.totalPts?h2hPlayerA.name:h2hPlayerB.name} is ahead by ${Math.abs(h2hPlayerA.totalPts-h2hPlayerB.totalPts)} pts`}
                      </div>
                    </div>
                    {(()=>{
                      const pA=h2hPlayerA.totalPts, pB=h2hPlayerB.totalPts;
                      const wA=h2hPlayerA.totalWon, wB=h2hPlayerB.totalWon;
                      const gA=h2hPlayerA.totalGd, gB=h2hPlayerB.totalGd;
                      const tA=h2hPlayerA.teams.length, tB=h2hPlayerB.teams.length;
                      const acA=h2hPlayerA.teams.filter(t=>(standings[t]?.played??0)<3).length;
                      const acB=h2hPlayerB.teams.filter(t=>(standings[t]?.played??0)<3).length;
                      const remA=h2hPlayerA.teams.reduce((s,t)=>s+Math.max(0,3-(standings[t]?.played??0))*3,0);
                      const remB=h2hPlayerB.teams.reduce((s,t)=>s+Math.max(0,3-(standings[t]?.played??0))*3,0);
                      const maxA=pA+remA, maxB=pB+remB;
                      const sA=pA*3+wA*2+gA*0.5+remA*1.5+acA*2;
                      const sB=pB*3+wB*2+gB*0.5+remB*1.5+acB*2;
                      const tot=sA+sB||1;
                      const odA=Math.round((sA/tot)*100), odB=100-odA;
                      const verdict=odA>65?`${h2hPlayerA.name} looks very strong`:odB>65?`${h2hPlayerB.name} looks very strong`:odA>55?`${h2hPlayerA.name} has the edge`:odB>55?`${h2hPlayerB.name} has the edge`:"Too close to call";
                      return (
                        <div style={{ ...S.card, padding:"18px 20px", marginBottom:14 }}>
                          <p style={{ ...S.sec }}>📊 Stats & Odds</p>
                          <div style={{ marginBottom:16 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:700, marginBottom:6 }}>
                              <span style={{ color:h2hPlayerA.color }}>{h2hPlayerA.name} {odA}%</span>
                              <span style={{ color:"#6b9aad", fontSize:11 }}>Win Probability</span>
                              <span style={{ color:h2hPlayerB.color }}>{odB}% {h2hPlayerB.name}</span>
                            </div>
                            <div style={{ height:10, borderRadius:99, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
                              <div style={{ height:"100%", width:`${odA}%`, background:`linear-gradient(90deg,${h2hPlayerA.color},${h2hPlayerA.color}cc)`, borderRadius:99, transition:"width 0.6s ease" }} />
                            </div>
                          </div>
                          {[["Current Points",pA,pB],["Wins",wA,wB],["Goal Difference",gA,gB],["Teams",tA,tB],["Max Possible Pts",maxA,maxB],["Teams Still Active",acA,acB]].map(([label,vA,vB])=>{
                            const better=vA>vB?"A":vB>vA?"B":"even";
                            return (
                              <div key={label} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                                <div style={{ flex:1, textAlign:"right" }}><span style={{ fontWeight:700, fontSize:14, color:better==="A"?"#00d46a":better==="even"?"#e8f4f8":"#6b9aad" }}>{vA}</span></div>
                                <div style={{ width:140, textAlign:"center", fontSize:11, color:"#6b9aad", flexShrink:0 }}>{label}</div>
                                <div style={{ flex:1 }}><span style={{ fontWeight:700, fontSize:14, color:better==="B"?"#00d46a":better==="even"?"#e8f4f8":"#6b9aad" }}>{vB}</span></div>
                              </div>
                            );
                          })}
                          <div style={{ marginTop:14, padding:"10px 14px", background:"rgba(0,212,106,0.08)", border:"1px solid rgba(0,212,106,0.2)", borderRadius:10, fontSize:13, color:"#00d46a", textAlign:"center", fontWeight:600 }}>🔮 {verdict}</div>
                          <div style={{ marginTop:8, fontSize:11, color:"#4a6a7a", textAlign:"center" }}>Based on current points, goal difference, wins and remaining games. Not a guarantee!</div>
                        </div>
                      );
                    })()}
                    <div style={{ ...S.card, padding:"18px 20px" }}>
                      <p style={{ ...S.sec }}>Team Comparison</p>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                        <div>
                          {h2hPlayerA.teams.map(t=>{ const info=WC_TEAMS.find(x=>x.name===t); const ts=standings[t]||{};
                            return <div key={t} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, fontSize:12 }}><span>{info?.flag}</span><span style={{ flex:1 }}>{t}</span><span style={{ fontWeight:700, color:"#00d46a" }}>{ts.pts??0}</span></div>; })}
                        </div>
                        <div>
                          {h2hPlayerB.teams.map(t=>{ const info=WC_TEAMS.find(x=>x.name===t); const ts=standings[t]||{};
                            return <div key={t} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, fontSize:12, justifyContent:"flex-end" }}><span style={{ fontWeight:700, color:"#00d46a" }}>{ts.pts??0}</span><span style={{ flex:1, textAlign:"right" }}>{t}</span><span>{info?.flag}</span></div>; })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ ...S.card, padding:"30px 24px", textAlign:"center", color:"#6b9aad", fontSize:13 }}>Pick two different people above to compare</div>
                )}
              </div>
            )}
          </div>
        )}

        {screen === "pulse" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <h2 style={{ fontSize:19, fontWeight:700 }}>💓 Office Pulse</h2>
              <div style={{ fontSize:11, color:"#6b9aad" }}>Updated {lastUpdated||"—"}</div>
            </div>
            <p style={{ color:"#6b9aad", fontSize:13, marginBottom:18 }}>How is everyone doing right now based on their teams' live scores?</p>
            {enriched.length === 0 ? (
              <div style={{ ...S.card, padding:"40px 24px", textAlign:"center" }}>
                <div style={{ fontSize:44, marginBottom:10 }}>💓</div>
                <div style={{ fontWeight:600 }}>No entrants yet</div>
              </div>
            ) : (
              <div>
                {enriched.map(p => {
                  const teamStatuses = p.teams.map(t=>{
                    const live=liveMatches.find(m=>m.homeTeam?.name?.includes(t)||m.awayTeam?.name?.includes(t)||t.includes(m.homeTeam?.name)||t.includes(m.awayTeam?.name));
                    if (!live) return null;
                    const isHome=live.homeTeam?.name?.includes(t)||t.includes(live.homeTeam?.name);
                    const myScore=isHome?(live.score?.fullTime?.home??0):(live.score?.fullTime?.away??0);
                    const theirScore=isHome?(live.score?.fullTime?.away??0):(live.score?.fullTime?.home??0);
                    return myScore>theirScore?"winning":myScore<theirScore?"losing":"drawing";
                  }).filter(Boolean);
                  const hasLive=teamStatuses.length>0;
                  const isWinning=teamStatuses.some(s=>s==="winning")&&!teamStatuses.some(s=>s==="losing");
                  const isLosing=teamStatuses.every(s=>s==="losing");
                  const pulseColor=!hasLive?"rgba(255,255,255,0.06)":isWinning?"rgba(0,212,106,0.15)":isLosing?"rgba(239,68,68,0.15)":"rgba(245,158,11,0.15)";
                  const borderColor=!hasLive?"rgba(255,255,255,0.08)":isWinning?"rgba(0,212,106,0.4)":isLosing?"rgba(239,68,68,0.4)":"rgba(245,158,11,0.4)";
                  const statusEmoji=!hasLive?"😴":isWinning?"🎉":isLosing?"😬":"😰";
                  const statusText=!hasLive?"No live team":isWinning?"WINNING":isLosing?"LOSING":"DRAWING";
                  const statusColor=!hasLive?"#6b9aad":isWinning?"#00d46a":isLosing?"#ef4444":"#f59e0b";
                  const liveTeams=p.teams.filter(t=>liveMatches.find(m=>m.homeTeam?.name?.includes(t)||m.awayTeam?.name?.includes(t)||t.includes(m.homeTeam?.name)||t.includes(m.awayTeam?.name)));
                  return (
                    <div key={p.id} style={{ background:pulseColor, border:`1px solid ${borderColor}`, borderRadius:14, padding:"14px 16px", marginBottom:10 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:42, height:42, borderRadius:"50%", background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, color:"#fff", flexShrink:0 }}>{getInitials(p.name)}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:15 }}>{p.name}</div>
                          {liveTeams.length>0 ? (
                            <div style={{ fontSize:12, color:"#6b9aad", marginTop:2 }}>
                              {liveTeams.map(t=>{
                                const info=WC_TEAMS.find(x=>x.name===t);
                                const live=liveMatches.find(m=>m.homeTeam?.name?.includes(t)||m.awayTeam?.name?.includes(t)||t.includes(m.homeTeam?.name)||t.includes(m.awayTeam?.name));
                                const isHome=live?.homeTeam?.name?.includes(t)||t.includes(live?.homeTeam?.name);
                                const myScore=isHome?(live?.score?.fullTime?.home??0):(live?.score?.fullTime?.away??0);
                                const theirScore=isHome?(live?.score?.fullTime?.away??0):(live?.score?.fullTime?.home??0);
                                const opp=isHome?live?.awayTeam?.shortName||live?.awayTeam?.name:live?.homeTeam?.shortName||live?.homeTeam?.name;
                                return <span key={t} style={{ marginRight:8 }}>{info?.flag} {t} {myScore}–{theirScore} vs {opp}</span>;
                              })}
                            </div>
                          ) : <div style={{ fontSize:12, color:"#4a6a7a", marginTop:2 }}>No teams currently playing</div>}
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0 }}>
                          <div style={{ fontSize:20 }}>{statusEmoji}</div>
                          <div style={{ fontSize:10, fontWeight:700, color:statusColor, marginTop:2 }}>{statusText}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop:8, padding:"10px 14px", background:"rgba(255,255,255,0.03)", borderRadius:10, fontSize:11, color:"#4a6a7a", textAlign:"center" }}>
                  🎉 Winning · 😰 Drawing · 😬 Losing · 😴 No live team · Updates every 60 seconds
                </div>
              </div>
            )}
          </div>
        )}

        {screen === "standings" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <h2 style={{ fontSize:19, fontWeight:700 }}>Group Standings</h2>
              <button className="nb" style={{ fontSize:12, padding:"7px 12px" }} onClick={fetchAll}>🔄 Refresh</button>
            </div>
            {["A","B","C","D","E","F","G","H","I","J","K","L"].map(group=>{
              const groupTeams=WC_TEAMS.filter(t=>t.group===group).map(t=>({
                ...t,...(standings[t.name]||{played:0,won:0,drawn:0,lost:0,gf:0,ga:0,gd:0,pts:0})
              })).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
              return (
                <div key={group} style={{ ...S.card, padding:"14px 18px", marginBottom:12 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:"#00d46a", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Group {group}</p>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                    <thead>
                      <tr style={{ color:"#6b9aad" }}>
                        <th style={{ textAlign:"left", paddingBottom:7, fontWeight:600 }}>Team</th>
                        {["P","W","D","L","GF","GA","GD","Pts"].map(h=><th key={h} style={{ textAlign:"center", paddingBottom:7, fontWeight:600, width:24 }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {groupTeams.map((t,ti)=>{
                        const owners=participants.filter(p=>p.teams.includes(t.name));
                        return (
                          <tr key={t.name} style={{ borderTop:"1px solid rgba(255,255,255,0.05)", background:owners.length?"rgba(0,212,106,0.05)":"transparent" }}>
                            <td style={{ padding:"7px 0" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                                {ti<2&&<span style={{ width:3, height:16, background:"#00d46a", borderRadius:2, display:"inline-block", flexShrink:0 }} />}
                                <span>{t.flag}</span>
                                <span style={{ fontWeight:owners.length?700:400 }}>{t.name}</span>
                                {owners.map(o=><span key={o.id} style={{ background:o.color, color:"#fff", fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:99 }}>{getInitials(o.name)}</span>)}
                              </div>
                            </td>
                            {[t.played,t.won,t.drawn,t.lost,t.gf,t.ga,t.gd,t.pts].map((v,vi)=>(
                              <td key={vi} style={{ textAlign:"center", padding:"7px 2px", color:vi===7?"#00d46a":"#a0b8c8", fontWeight:vi===7?700:400 }}>{v??0}</td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}

        {screen === "knockout" && (
  <div style={{ margin:"0 -16px" }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18, padding:"0 16px" }}>
      <h2 style={{ fontSize:19, fontWeight:700 }}>🏆 Knockout</h2>
      <button className="nb" style={{ fontSize:12, padding:"7px 12px" }} onClick={fetchAll}>🔄 Refresh</button>
    </div>
    <div style={{ fontSize:11, color:"#6b9aad", marginBottom:14, padding:"0 16px" }}>← Scroll sideways to see all rounds →</div>
    <BracketView />
  </div>
)}

        {screen === "register" && (
          <div style={{ ...S.card, padding:"24px 20px" }}>
            <h2 style={{ fontSize:19, fontWeight:700, marginBottom:4 }}>Join the Sweepstake</h2>
            <p style={{ color:"#6b9aad", marginBottom:20, fontSize:13 }}>{availableTeams.length} teams unclaimed — grab as many as you like!</p>
            <div style={{ marginBottom:16 }}>
              <label style={S.lbl}>Your Name</label>
              <input style={S.inp} type="text" placeholder="e.g. Dave from Sales" value={newName} onChange={e=>setNewName(e.target.value)} />
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <label style={{ ...S.lbl, marginBottom:0 }}>
                  Pick Your Teams
                  {selectedTeams.length>0&&<span style={{ marginLeft:8, background:"#00d46a", color:"#0a1628", borderRadius:99, padding:"2px 8px", fontSize:12, fontWeight:700 }}>{selectedTeams.length} selected</span>}
                </label>
                {selectedTeams.length>0&&<button onClick={()=>setSelectedTeams([])} style={{ background:"none", border:"none", color:"#ef4444", cursor:"pointer", fontSize:12, fontWeight:600 }}>Clear all</button>}
              </div>
              <div style={{ marginBottom:10 }}>
                <input style={S.inp} type="text" placeholder="🔍 Search teams..." value={teamSearch} onChange={e=>setTeamSearch(e.target.value)} />
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
                {groups.map(g=><button key={g} className={`gp ${groupFilter===g?"on":""}`} onClick={()=>setGroupFilter(g)}>{g==="ALL"?"All":`Grp ${g}`}</button>)}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, maxHeight:320, overflowY:"auto" }}>
                {visibleTeams.length===0&&<div style={{ gridColumn:"1/-1", textAlign:"center", color:"#6b9aad", padding:"24px 0", fontSize:13 }}>No teams match</div>}
                {visibleTeams.map(t=>{
                  const isTaken=takenTeams.includes(t.name)&&!selectedTeams.includes(t.name);
                  const isSelected=selectedTeams.includes(t.name);
                  return (
                    <div key={t.name} className={`tt ${isSelected?"sel":""} ${isTaken?"tkn":""}`} onClick={()=>!isTaken&&toggleTeam(t.name)}>
                      <span style={{ fontSize:20 }}>{t.flag}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.name}</div>
                        <div style={{ fontSize:11, color:"#6b9aad" }}>Group {t.group}</div>
                      </div>
                      {isSelected&&<span style={{ color:"#00d46a", fontSize:16, flexShrink:0 }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            {selectedTeams.length>0&&(
              <div style={{ background:"rgba(0,212,106,0.08)", border:"1px solid rgba(0,212,106,0.25)", borderRadius:12, padding:"12px 14px", marginBottom:18 }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#00d46a", marginBottom:8 }}>YOUR TEAMS ({selectedTeams.length})</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {selectedTeams.map(tName=>{ const info=WC_TEAMS.find(x=>x.name===tName); return <span key={tName} className="ch" style={{ background:"rgba(0,212,106,0.15)", color:"#00d46a", border:"1px solid rgba(0,212,106,0.3)", cursor:"pointer" }} onClick={()=>toggleTeam(tName)}>{info?.flag} {tName} ×</span>; })}
                </div>
              </div>
            )}
            <button style={{ ...S.btn, opacity:(!newName.trim()||!selectedTeams.length)?0.4:1 }} onClick={handleRegister} disabled={!newName.trim()||!selectedTeams.length}>
              {editingId?`✏️ Update My Teams (${selectedTeams.length})`:`🎉 Claim My ${selectedTeams.length>1?`${selectedTeams.length} Teams`:selectedTeams.length===1?"Team":"Teams"}`}
            </button>
            {participants.length>0&&(
              <div style={{ marginTop:24, paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize:12, fontWeight:700, color:"#6b9aad", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Already Joined</p>
                {participants.map(p=>(
                  <div key={p.id} style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10, padding:"10px 12px", background:"rgba(255,255,255,0.04)", borderRadius:10 }}>
                    <div style={{ width:30, height:30, borderRadius:"50%", background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff", flexShrink:0, marginTop:1 }}>{getInitials(p.name)}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:14, marginBottom:5 }}>{p.name}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                        {p.teams.map(t=>{ const info=WC_TEAMS.find(x=>x.name===t); return <span key={t} className="ch">{info?.flag} {t}</span>; })}
                      </div>
                    </div>
                    <button onClick={()=>{ setNewName(p.name); setSelectedTeams([...p.teams]); setEditingId(p.id); }} style={{ background:"rgba(0,212,106,0.12)", border:"1px solid rgba(0,212,106,0.3)", color:"#00d46a", padding:"5px 10px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, flexShrink:0 }}>✏️ Edit</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {screen === "admin" && (
          <div style={{ ...S.card, padding:"24px 20px" }}>
            <h2 style={{ fontSize:19, fontWeight:700, marginBottom:4 }}>⚙️ Admin Panel</h2>
            <p style={{ color:"#6b9aad", marginBottom:20, fontSize:13 }}>Control the app and manage participants</p>
            {!adminUnlocked ? (
              <div>
                <label style={S.lbl}>Admin PIN</label>
                <input style={S.inp} type="password" placeholder="Enter PIN" value={adminPin} onChange={e=>setAdminPin(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"){if(adminPin==="4429")setAdminUnlocked(true);else showToast("Wrong PIN","error");}}} />
                <button style={{ ...S.btn, marginTop:14 }} onClick={()=>{ if(adminPin==="4429")setAdminUnlocked(true);else showToast("Wrong PIN","error"); }}>Unlock</button>
              </div>
            ) : (
              <div>
                <p style={{ ...S.sec }}>👁 Tab Visibility</p>
                {[
                  ["showHeadToHead","⚔️ Head-to-Head","Show or hide the H2H comparison tab"],
                  ["showPulse","💓 Office Pulse","Show or hide the live pulse dashboard"],
                  ["showFixtures","📅 Fixtures","Show or hide the fixtures tab"],
                  ["showGroups","🌍 Groups","Show or hide the group standings tab"],
                  ["showBracket","🏆 Knockout","Show or hide the knockout tab"],
                  ["showJoin","➕ Join Tab","Show or hide the join button in nav"],
                ].map(([key,label,desc])=>(
                  <div key={key} className="trow">
                    <div>
                      <div style={{ fontSize:14, fontWeight:600 }}>{label}</div>
                      <div style={{ fontSize:11, color:"#6b9aad", marginTop:2 }}>{desc}</div>
                    </div>
                    <Toggle value={adminSettings[key]} onChange={()=>updateSetting(key,!adminSettings[key])} />
                  </div>
                ))}

                <p style={{ ...S.sec, marginTop:24 }}>🎛 Sweepstake Controls</p>
                {[
                  ["allowJoining","Allow New Joiners","When off, the Join tab is hidden for everyone"],
                  ["showBadges","🔥💀 Leader & Last Badges","Fire emoji for 1st, skull for last place"],
                  ["showRoasts","💬 Last Place Roasts","Banter for whoever's bottom of the leaderboard"],
                ].map(([key,label,desc])=>(
                  <div key={key} className="trow">
                    <div>
                      <div style={{ fontSize:14, fontWeight:600 }}>{label}</div>
                      <div style={{ fontSize:11, color:"#6b9aad", marginTop:2 }}>{desc}</div>
                    </div>
                    <Toggle value={adminSettings[key]} onChange={()=>updateSetting(key,!adminSettings[key])} />
                  </div>
                ))}

                <p style={{ ...S.sec, marginTop:24 }}>📢 Home Screen Announcement</p>
                <input
                  style={S.inp}
                  type="text"
                  placeholder="e.g. Deadline for joining is Friday 5pm!"
                  value={adminSettings.homeMessage}
                  onChange={e=>setAdminSettings(s=>({...s,homeMessage:e.target.value}))}
                  onBlur={e=>updateSetting("homeMessage",e.target.value)}
                />
                <div style={{ fontSize:11, color:"#6b9aad", marginTop:6, marginBottom:24 }}>Shows as a green banner on the home screen. Leave blank to hide.</div>

                <p style={{ ...S.sec }}>💬 Custom Last Place Taunts</p>
                <textarea
                  style={{ ...S.inp, height:120, resize:"vertical", lineHeight:1.6 }}
                  placeholder={"One taunt per line, e.g.:\nMaybe football isn't your thing.\nHave you considered watching chess instead?"}
                  value={adminSettings.customRoasts}
                  onChange={e=>setAdminSettings(s=>({...s,customRoasts:e.target.value}))}
                  onBlur={e=>updateSetting("customRoasts",e.target.value)}
                />
                <div style={{ fontSize:11, color:"#6b9aad", marginTop:6, marginBottom:24 }}>One taunt per line. Leave blank to use the defaults.</div>

                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <p style={{ ...S.sec, marginBottom:0 }}>👥 Participants ({participants.length})</p>
                  <button style={{ background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.3)", color:"#ef4444", padding:"6px 12px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600 }}
                    onClick={async()=>{ if(window.confirm("Clear ALL participants?")){await supabase.from("participants").delete().neq("id",0);showToast("Cleared");}}}>🗑️ Clear All</button>
                </div>
                {participants.length===0
                  ? <div style={{ textAlign:"center", color:"#6b9aad", padding:"28px 0", fontSize:14 }}>No participants yet</div>
                  : participants.map(p=>(
                    <div key={p.id} style={{ ...S.row }}>
                      <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:"50%", background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>{getInitials(p.name)}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:14, marginBottom:5 }}>{p.name}</div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                            {p.teams.map(t=>{ const info=WC_TEAMS.find(x=>x.name===t); return <span key={t} className="ch">{info?.flag} {t}</span>; })}
                          </div>
                        </div>
                        <button onClick={e=>{ e.stopPropagation(); handleRemove(p.id); }} style={{ background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", color:"#ef4444", padding:"5px 10px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, flexShrink:0 }}>Remove</button>
                      </div>
                    </div>
                  ))
                }

                <div style={{ marginTop:22, paddingTop:18, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                  <button style={S.btn} onClick={()=>{ fetchAll(); showToast("Refreshed!"); }}>🔄 Force Refresh</button>
                  <p style={{ color:"#6b9aad", fontSize:12, marginTop:10, textAlign:"center" }}>Last updated: {lastUpdated??"Never"}</p>
                </div>
                <button className="nb" style={{ width:"100%", marginTop:14 }} onClick={()=>{ setAdminUnlocked(false); setAdminPin(""); }}>🔒 Lock Admin</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}