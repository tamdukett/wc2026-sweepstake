import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;
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

const getInitials = n => n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2);
const fc = r => r === "W" ? "#00d46a" : r === "D" ? "#f59e0b" : "#ef4444";

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

  useEffect(() => {
    loadParticipants();
    const channel = supabase
      .channel("participants-changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "participants"
      }, () => {
        loadParticipants();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [loadParticipants]);

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
                played: row.playedGames,
                won: row.won,
                drawn: row.draw,
                lost: row.lost,
                gf: row.goalsFor,
                ga: row.goalsAgainst,
                gd: row.goalDifference,
                pts: row.points,
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
      const { error } = await supabase
        .from("participants")
        .update({ teams: JSON.stringify(selectedTeams) })
        .eq("id", editingId);
      if (error) { console.error(error); showToast("Error saving — try again", "error"); return; }
      setEditingId(null);
      setNewName("");
      setSelectedTeams([]);
      showToast(`Teams updated! 🎉`);
      setScreen("leaderboard");
      return;
    }

    if (participants.find(p => p.name.toLowerCase() === newName.trim().toLowerCase())) {
      showToast("Name already taken!", "error"); return;
    }
    const color = AVATAR_COLORS[participants.length % AVATAR_COLORS.length];
    const { error } = await supabase.from("participants").insert([{
      name: newName.trim(),
      teams: JSON.stringify(selectedTeams),
      color,
    }]);
    if (error) { console.error(error); showToast("Error saving — try again", "error"); return; }
    setNewName("");
    setSelectedTeams([]);
    showToast(`Welcome ${newName.trim()}! 🎉`);
    setScreen("leaderboard");
  };

  const handleRemove = async (id) => {
    await supabase.from("participants").delete().eq("id", id);
    showToast("Removed");
  };

  const enriched = participants.map(p => {
    const teams = typeof p.teams === "string" ? JSON.parse(p.teams) : p.teams;
    const teamData = teams.map(t => standings[t] || { pts:0, played:0, won:0, drawn:0, lost:0, gf:0, ga:0, gd:0 });
    return {
      ...p,
      teams,
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
      Object.keys(current).forEach(id => {
        merged[id] = prev[id] !== undefined ? prev[id] : current[id];
      });
      return merged;
    });
  }, [standings]);

  useEffect(() => {
    if (enriched.length === 0) return;
    const currentLeader = enriched[0].id;
    if (leaderId !== null && currentLeader !== leaderId) {
      setConfettiTrigger(c => c + 1);
    }
    setLeaderId(currentLeader);
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

  const getRoast = seed => ROASTS[seed % ROASTS.length];

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

  const getFlag = name => WC_TEAMS.find(t => t.name === name || name?.includes(t.name))?.flag || "🏳️";

  const getOwnerBanner = (homeOwners, awayOwners) => {
    const names = [...new Set([...homeOwners, ...awayOwners].map(o => o.name))];
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]}'s team is playing!`;
    if (names.length === 2) return `${names[0]} & ${names[1]}'s teams are playing!`;
    return `${names.slice(0,-1).join(", ")} & ${names[names.length-1]}'s teams are playing!`;
  };

  const visibleTeams = WC_TEAMS.filter(t => {
    const ok = !takenTeams.includes(t.name) || selectedTeams.includes(t.name);
    const grp = groupFilter === "ALL" || t.group === groupFilter;
    const sch = t.name.toLowerCase().includes(teamSearch.toLowerCase());
    return ok && grp && sch;
  });

  const groups = ["ALL","A","B","C","D","E","F","G","H","I","J","K","L"];

  const knockoutRounds = [
    { key:"ROUND_OF_32", label:"Round of 32" },
    { key:"ROUND_OF_16", label:"Round of 16" },
    { key:"QUARTER_FINALS", label:"Quarter Finals" },
    { key:"SEMI_FINALS", label:"Semi Finals" },
    { key:"THIRD_PLACE", label:"3rd Place" },
    { key:"FINAL", label:"Final" },
  ];

  const S = {
    app: { minHeight:"100vh", background:"linear-gradient(160deg,#0a1628 0%,#0d2137 60%,#0a1f1a 100%)", fontFamily:"'Inter','Segoe UI',sans-serif", color:"#e8f4f8" },
    inner: { maxWidth:700, margin:"0 auto", padding:"0 16px 80px", position:"relative", zIndex:1 },
    card: { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16 },
    row: { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"14px 16px", marginBottom:10, cursor:"pointer" },
    btn: { background:"linear-gradient(135deg,#00d46a,#00b359)", color:"#0a1628", border:"none", borderRadius:12, padding:"14px 28px", fontSize:15, fontWeight:700, cursor:"pointer", width:"100%" },
    inp: { background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"#e8f4f8", borderRadius:10, padding:"11px 14px", fontSize:14, width:"100%", boxSizing:"border-box", outline:"none" },
    lbl: { display:"block", marginBottom:8, fontSize:13, fontWeight:600, color:"#6b9aad" },
  };

  const h2hPlayerA = enriched.find(p => p.id === h2hA);
  const h2hPlayerB = enriched.find(p => p.id === h2hB);

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
        .ko-match { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 12px; min-width:180px; }
        input::placeholder { color:#4a6a7a; }
      `}</style>

      <div style={{ position:"fixed", inset:0, opacity:0.035, pointerEvents:"none", backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 40px,#00d46a 40px,#00d46a 41px)", zIndex:0 }} />

      {confettiTrigger > 0 && (
        <div key={confettiTrigger} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:999, overflow:"hidden" }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} style={{
              position:"absolute",
              left:`${Math.random()*100}%`,
              top:"-10px",
              width:8, height:8,
              background:["#00d46a","#ffd700","#ef4444","#3a86ff","#ff006e"][i % 5],
              borderRadius: i % 2 === 0 ? "50%" : "2px",
              animation:`fall ${2 + Math.random()*2}s linear forwards`,
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
              {getFlag(m.homeTeam?.name)} {m.homeTeam?.shortName || m.homeTeam?.name}
              <span style={{ color:"#00d46a", margin:"0 6px", fontWeight:800 }}>{m.score?.fullTime?.home ?? 0} – {m.score?.fullTime?.away ?? 0}</span>
              {getFlag(m.awayTeam?.name)} {m.awayTeam?.shortName || m.awayTeam?.name}
              <span style={{ color:"#ef4444", marginLeft:8, fontSize:11 }}>{m.minute ? `${m.minute}'` : ""}</span>
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
          {[["home","🏠 Home"],["leaderboard","📊 Leaderboard"],["headtohead","⚔️ Head-to-Head"],["fixtures","📅 Fixtures"],["standings","🌍 Groups"],["knockout","🏆 Bracket"],["register","➕ Join"]].map(([id,label]) => (
            <button key={id} className={`nb ${screen===id?"on":""}`} onClick={() => setScreen(id)}>{label}</button>
          ))}
          <button className={`nb ${screen==="admin"?"on":""}`} style={{ marginLeft:"auto" }} onClick={() => setScreen("admin")}>⚙️</button>
        </div>

        {screen === "home" && (
          <div>
            <div style={{ ...S.card, padding:"28px 24px", textAlign:"center", marginBottom:14 }}>
              <div style={{ fontSize:34, marginBottom:10 }}>⚽</div>
              <h2 style={{ fontSize:19, fontWeight:700, marginBottom:8 }}>Welcome to the Sweepstake!</h2>
              <p style={{ color:"#6b9aad", marginBottom:22, lineHeight:1.6, fontSize:14 }}>Claim your teams, follow them live, highest combined points wins!</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:22 }}>
                {[["🏳️","Teams Left",`${availableTeams.length}/48`],["👥","Entrants",participants.length],["🔴","Live Now",liveMatches.length],["📅","Tournament","Jun–Jul 2026"]].map(([icon,label,val]) => (
                  <div key={label} style={{ background:"rgba(0,212,106,0.07)", border:"1px solid rgba(0,212,106,0.18)", borderRadius:12, padding:"14px 10px" }}>
                    <div style={{ fontSize:18, marginBottom:3 }}>{icon}</div>
                    <div style={{ fontSize:20, fontWeight:800, color:"#00d46a" }}>{val}</div>
                    <div style={{ fontSize:11, color:"#6b9aad", marginTop:2 }}>{label}</div>
                  </div>
                ))}
              </div>
              <button style={S.btn} onClick={() => setScreen("register")}>Join the Sweepstake →</button>
            </div>

            {liveMatches.length > 0 && (
              <div style={{ ...S.card, padding:"16px 20px", marginBottom:14 }}>
                <p style={{ fontSize:12, fontWeight:700, color:"#ef4444", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                  <span className="live-pulse" />LIVE MATCHES
                </p>
                {liveMatches.map(m => {
                  const homeOwners = participants.filter(p => p.teams.some(t => m.homeTeam?.name?.includes(t) || t.includes(m.homeTeam?.name)));
                  const awayOwners = participants.filter(p => p.teams.some(t => m.awayTeam?.name?.includes(t) || t.includes(m.awayTeam?.name)));
                  const banner = getOwnerBanner(homeOwners, awayOwners);
                  const scorers = (m.goals || []).filter(g => g.type === "REGULAR" || !g.type);
                  const kickoff = new Date(m.utcDate).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
                  return (
                    <div key={m.id} className="match-card live" style={banner ? { borderColor:"rgba(0,212,106,0.4)", background:"rgba(0,212,106,0.05)" } : {}}>
                      {banner && (
                        <div style={{ fontSize:11, fontWeight:700, color:"#00d46a", marginBottom:8 }}>
                          ⭐ {banner}
                        </div>
                      )}
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
                          <span style={{ fontSize:18 }}>{getFlag(m.homeTeam?.name)}</span>
                          <span style={{ fontWeight:700, fontSize:14 }}>{m.homeTeam?.shortName || m.homeTeam?.name}</span>
                          {homeOwners.map(o => <span key={o.id} style={{ background:o.color, color:"#fff", fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:99 }}>{getInitials(o.name)}</span>)}
                        </div>
                        <div style={{ textAlign:"center", padding:"0 12px" }}>
                          <div style={{ fontSize:20, fontWeight:800, color:"#00d46a" }}>{m.score?.fullTime?.home ?? 0} – {m.score?.fullTime?.away ?? 0}</div>
                          <div style={{ fontSize:11, color:"#ef4444", fontWeight:700 }}>{m.minute ? `${m.minute}' ` : ""}LIVE</div>
                          <div style={{ fontSize:10, color:"#6b9aad", marginTop:2 }}>KO {kickoff}</div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, justifyContent:"flex-end" }}>
                          {awayOwners.map(o => <span key={o.id} style={{ background:o.color, color:"#fff", fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:99 }}>{getInitials(o.name)}</span>)}
                          <span style={{ fontWeight:700, fontSize:14 }}>{m.awayTeam?.shortName || m.awayTeam?.name}</span>
                          <span style={{ fontSize:18 }}>{getFlag(m.awayTeam?.name)}</span>
                        </div>
                      </div>
                      {scorers.length > 0 && (
                        <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.08)", fontSize:11, color:"#a0b8c8" }}>
                          ⚽ {scorers.map((g,gi) => (
                            <span key={gi}>
                              {g.scorer?.name || "Unknown"} {g.minute}'{gi < scorers.length - 1 ? " · " : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {enriched.length > 0 && (
              <div style={{ ...S.card, padding:"18px 20px" }}>
                <p style={{ fontSize:12, fontWeight:700, color:"#6b9aad", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>Office Top 3</p>
                {enriched.slice(0,3).map((p,i) => (
                  <div key={p.id} style={{ ...S.row, display:"flex", alignItems:"center", gap:12, padding:"12px 14px" }}>
                    <span style={{ fontSize:20, width:28 }}>{getRank(i).emoji}</span>
                    <div style={{ width:38, height:38, borderRadius:"50%", background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, color:"#fff", flexShrink:0 }}>{getInitials(p.name)}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:15 }}>{p.name}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:4 }}>
                        {p.teams.map(t => { const info=WC_TEAMS.find(x=>x.name===t); return <span key={t} className="ch">{info?.flag} {t}</span>; })}
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:800, color:"#00d46a", fontSize:18 }}>{p.totalPts}</div>
                      <div style={{ fontSize:11, color:"#6b9aad" }}>pts</div>
                    </div>
                  </div>
                ))}
                <button className="nb" style={{ width:"100%", marginTop:8 }} onClick={() => setScreen("leaderboard")}>Full Leaderboard →</button>
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
              const owners = name => participants.filter(p => p.teams.some(t => name?.includes(t) || t.includes(name)));
              const homeOwners = owners(m.homeTeam?.name);
              const awayOwners = owners(m.awayTeam?.name);
              const banner = getOwnerBanner(homeOwners, awayOwners);
              const scorers = (m.goals || []).filter(g => g.type === "REGULAR" || !g.type);
              const kickoff = new Date(m.utcDate).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
              return (
                <div key={m.id} className={`match-card ${isLive?"live":""}`} style={banner && !isLive ? { borderColor:"rgba(0,212,106,0.4)", background:"rgba(0,212,106,0.05)" } : {}}>
                  {banner && (
                    <div style={{ fontSize:11, fontWeight:700, color:"#00d46a", marginBottom:8 }}>
                      ⭐ {banner}
                    </div>
                  )}
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
                            {homeOwners.map(o => <span key={o.id} style={{ background:o.color, color:"#fff", fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:99 }}>{getInitials(o.name)}</span>)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign:"center", padding:"0 16px" }}>
                      {(isLive||isDone)
                        ? <div style={{ fontSize:22, fontWeight:800, color:"#00d46a" }}>{m.score?.fullTime?.home ?? 0} – {m.score?.fullTime?.away ?? 0}</div>
                        : <div style={{ fontSize:16, fontWeight:700, color:"#6b9aad" }}>vs</div>}
                    </div>
                    <div style={{ flex:1, textAlign:"right" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"flex-end" }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:14 }}>{m.awayTeam?.name}</div>
                          <div style={{ display:"flex", gap:3, marginTop:2, justifyContent:"flex-end" }}>
                            {awayOwners.map(o => <span key={o.id} style={{ background:o.color, color:"#fff", fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:99 }}>{getInitials(o.name)}</span>)}
                          </div>
                        </div>
                        <span style={{ fontSize:20 }}>{getFlag(m.awayTeam?.name)}</span>
                      </div>
                    </div>
                  </div>
                  {scorers.length > 0 && (
                    <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.08)", fontSize:11, color:"#a0b8c8" }}>
                      ⚽ {scorers.map((g,gi) => (
                        <span key={gi}>
                          {g.scorer?.name || "Unknown"} {g.minute}'{gi < scorers.length - 1 ? " · " : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {screen === "leaderboard" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <h2 style={{ fontSize:19, fontWeight:700 }}>Office Leaderboard</h2>
              <div style={{ fontSize:11, color:"#6b9aad" }}>Updated {lastUpdated || "—"}</div>
            </div>
            <div style={{ marginBottom:14 }}>
              <input style={S.inp} type="text" placeholder="🔍 Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            {filtered.length === 0 ? (
              <div style={{ ...S.card, padding:"44px 24px", textAlign:"center" }}>
                <div style={{ fontSize:44, marginBottom:10 }}>🏟️</div>
                <div style={{ fontWeight:600, marginBottom:6 }}>No entrants yet</div>
                <button style={{ ...S.btn, maxWidth:200, margin:"0 auto" }} onClick={() => setScreen("register")}>Join Now</button>
              </div>
            ) : filtered.map((p,i) => {
              const isExp = expanded === p.id;
              return (
                <div key={p.id} style={{ ...S.row, border:i===0?"1px solid rgba(255,215,0,0.25)":"1px solid rgba(255,255,255,0.07)" }} onClick={() => setExpanded(isExp?null:p.id)}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:32, textAlign:"center", fontSize:i<3?20:13, fontWeight:700, color:getRank(i).color, flexShrink:0 }}>{getRank(i).emoji}</div>
                    <div style={{ width:42, height:42, borderRadius:"50%", background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, color:"#fff", flexShrink:0, boxShadow:i===0?"0 0 0 2px #ffd700":"none" }}>{getInitials(p.name)}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:15, display:"flex", alignItems:"center", gap:6 }}>
                        {p.name}
                        {i === 0 && filtered.length > 1 && <span style={{ fontSize:13 }}>🔥</span>}
                        {i === filtered.length - 1 && filtered.length > 2 && <span style={{ fontSize:13 }}>💀</span>}
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:4 }}>
                        {p.teams.map(t => { const info=WC_TEAMS.find(x=>x.name===t); const ts=standings[t]; return <span key={t} className="ch">{info?.flag} {t}{ts?` · ${ts.pts}pt`:""}</span>; })}
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:20, fontWeight:800, color:"#00d46a" }}>{p.totalPts}</div>
                      <div style={{ fontSize:11, color:"#6b9aad" }}>pts</div>
                      {(() => {
                        const prevRank = previousRanks[p.id];
                        if (prevRank === undefined) return null;
                        if (prevRank > i) return <div style={{ fontSize:13, color:"#00d46a", fontWeight:700 }}>▲ {prevRank - i}</div>;
                        if (prevRank < i) return <div style={{ fontSize:13, color:"#ef4444", fontWeight:700 }}>▼ {i - prevRank}</div>;
                        return <div style={{ fontSize:11, color:"#6b9aad" }}>—</div>;
                      })()}
                    </div>
                  </div>
                  {isExp && (
                    <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                      <p style={{ fontSize:11, fontWeight:700, color:"#6b9aad", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Team Breakdown</p>
                      {p.teams.map(tName => {
                        const info = WC_TEAMS.find(x => x.name===tName);
                        const ts = standings[tName] || {};
                        return (
                          <div key={tName} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, padding:"8px 10px", background:"rgba(255,255,255,0.04)", borderRadius:8 }}>
                            <span style={{ fontSize:18 }}>{info?.flag}</span>
                            <div style={{ flex:1 }}>
                              <div style={{ fontWeight:600, fontSize:13 }}>{tName}</div>
                              <div style={{ fontSize:12, color:"#6b9aad" }}>{ts.played??0}P · {ts.won??0}W · {ts.drawn??0}D · {ts.lost??0}L · GD {ts.gd??0}</div>
                              {ts.form && ts.form.length > 0 && (
                                <div style={{ display:"flex", gap:3, marginTop:4 }}>
                                  {ts.form.map((r,fi) => <span key={fi} style={{ width:16, height:16, borderRadius:3, background:fc(r), display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"#fff" }}>{r}</span>)}
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
                      {(() => {
                        const seed = p.id + (p.totalPts || 0);
                        const isLow = i === filtered.length - 1 && filtered.length > 2;
                        return isLow ? (
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
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <h2 style={{ fontSize:19, fontWeight:700 }}>Head-to-Head</h2>
            </div>
            {enriched.length < 2 ? (
              <div style={{ ...S.card, padding:"40px 24px", textAlign:"center" }}>
                <div style={{ fontSize:44, marginBottom:10 }}>⚔️</div>
                <div style={{ fontWeight:600, marginBottom:6 }}>Need at least 2 entrants</div>
                <div style={{ color:"#6b9aad", fontSize:13 }}>Get more office mates to join first!</div>
              </div>
            ) : (
              <div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
                  <div>
                    <label style={S.lbl}>Player A</label>
                    <select style={{...S.inp, color:"#0a1628", background:"#e8f4f8"}} value={h2hA ?? ""} onChange={e => setH2hA(Number(e.target.value) || null)}>
                      <option value="">Select...</option>
                      {enriched.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.lbl}>Player B</label>
                    <select style={{...S.inp, color:"#0a1628", background:"#e8f4f8"}} value={h2hB ?? ""} onChange={e => setH2hB(Number(e.target.value) || null)}>
                      <option value="">Select...</option>
                      {enriched.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                {h2hPlayerA && h2hPlayerB && h2hPlayerA.id !== h2hPlayerB.id ? (
  <div>
    <div style={{ ...S.card, padding:"20px", marginBottom:14, textAlign:"center" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:20 }}>
        <div style={{ flex:1 }}>
          <div style={{ width:50, height:50, borderRadius:"50%", background:h2hPlayerA.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:16, color:"#fff", margin:"0 auto 8px" }}>{getInitials(h2hPlayerA.name)}</div>
          <div style={{ fontWeight:700, fontSize:15 }}>{h2hPlayerA.name}</div>
          <div style={{ fontSize:28, fontWeight:800, color: h2hPlayerA.totalPts >= h2hPlayerB.totalPts ? "#00d46a" : "#6b9aad" }}>{h2hPlayerA.totalPts}</div>
        </div>
        <div style={{ fontSize:18, fontWeight:700, color:"#6b9aad" }}>VS</div>
        <div style={{ flex:1 }}>
          <div style={{ width:50, height:50, borderRadius:"50%", background:h2hPlayerB.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:16, color:"#fff", margin:"0 auto 8px" }}>{getInitials(h2hPlayerB.name)}</div>
          <div style={{ fontWeight:700, fontSize:15 }}>{h2hPlayerB.name}</div>
          <div style={{ fontSize:28, fontWeight:800, color: h2hPlayerB.totalPts >= h2hPlayerA.totalPts ? "#00d46a" : "#6b9aad" }}>{h2hPlayerB.totalPts}</div>
        </div>
      </div>
      <div style={{ marginTop:14, fontSize:13, color:"#6b9aad" }}>
        {h2hPlayerA.totalPts === h2hPlayerB.totalPts
          ? "Dead even — anyone's game"
          : `${h2hPlayerA.totalPts > h2hPlayerB.totalPts ? h2hPlayerA.name : h2hPlayerB.name} is ahead by ${Math.abs(h2hPlayerA.totalPts - h2hPlayerB.totalPts)} pts`}
      </div>
    </div>

    {/* ODDS & STATS CARD */}
    {(() => {
      const ptsA = h2hPlayerA.totalPts;
      const ptsB = h2hPlayerB.totalPts;
      const winsA = h2hPlayerA.totalWon;
      const winsB = h2hPlayerB.totalWon;
      const gdA = h2hPlayerA.totalGd;
      const gdB = h2hPlayerB.totalGd;
      const teamsA = h2hPlayerA.teams.length;
      const teamsB = h2hPlayerB.teams.length;

      // Teams still in contention (not yet eliminated — played < 3 games in group stage)
      const activeA = h2hPlayerA.teams.filter(t => (standings[t]?.played ?? 0) < 3).length;
      const activeB = h2hPlayerB.teams.filter(t => (standings[t]?.played ?? 0) < 3).length;

      // Max possible remaining points (assume 3 pts per remaining game, rough estimate)
      const remainingA = h2hPlayerA.teams.reduce((s,t) => {
        const played = standings[t]?.played ?? 0;
        const remaining = Math.max(0, 3 - played);
        return s + remaining * 3;
      }, 0);
      const remainingB = h2hPlayerB.teams.reduce((s,t) => {
        const played = standings[t]?.played ?? 0;
        const remaining = Math.max(0, 3 - played);
        return s + remaining * 3;
      }, 0);

      const maxA = ptsA + remainingA;
      const maxB = ptsB + remainingB;

      // Win probability — weighted score based on current pts, potential, wins, gd
      const scoreA = (ptsA * 3) + (winsA * 2) + (gdA * 0.5) + (remainingA * 1.5) + (activeA * 2);
      const scoreB = (ptsB * 3) + (winsB * 2) + (gdB * 0.5) + (remainingB * 1.5) + (activeB * 2);
      const total = scoreA + scoreB || 1;
      const oddsA = Math.round((scoreA / total) * 100);
      const oddsB = 100 - oddsA;

      const leader = ptsA > ptsB ? h2hPlayerA.name : ptsB > ptsA ? h2hPlayerB.name : null;
      const verdict = oddsA > 65 ? `${h2hPlayerA.name} looks very strong` :
                      oddsB > 65 ? `${h2hPlayerB.name} looks very strong` :
                      oddsA > 55 ? `${h2hPlayerA.name} has the edge` :
                      oddsB > 55 ? `${h2hPlayerB.name} has the edge` :
                      "Too close to call — could go either way";

      return (
        <div style={{ ...S.card, padding:"18px 20px", marginBottom:14 }}>
          <p style={{ fontSize:12, fontWeight:700, color:"#6b9aad", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:16 }}>📊 Stats & Odds</p>

          {/* Win probability bar */}
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:700, marginBottom:6 }}>
              <span style={{ color:h2hPlayerA.color }}>{h2hPlayerA.name} {oddsA}%</span>
              <span style={{ color:"#6b9aad", fontSize:11 }}>Win Probability</span>
              <span style={{ color:h2hPlayerB.color }}>{oddsB}% {h2hPlayerB.name}</span>
            </div>
            <div style={{ height:10, borderRadius:99, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${oddsA}%`, background:`linear-gradient(90deg, ${h2hPlayerA.color}, ${h2hPlayerA.color}cc)`, borderRadius:99, transition:"width 0.6s ease" }} />
            </div>
          </div>

          {/* Stats grid */}
          {[
            ["Current Points", ptsA, ptsB],
            ["Wins", winsA, winsB],
            ["Goal Difference", gdA, gdB],
            ["Teams", teamsA, teamsB],
            ["Max Possible Pts", maxA, maxB],
            ["Teams Still Active", activeA, activeB],
          ].map(([label, valA, valB]) => {
            const better = valA > valB ? "A" : valB > valA ? "B" : "even";
            return (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <div style={{ flex:1, textAlign:"right" }}>
                  <span style={{ fontWeight:700, fontSize:14, color: better==="A" ? "#00d46a" : better==="even" ? "#e8f4f8" : "#6b9aad" }}>{valA}</span>
                </div>
                <div style={{ width:140, textAlign:"center", fontSize:11, color:"#6b9aad", flexShrink:0 }}>{label}</div>
                <div style={{ flex:1 }}>
                  <span style={{ fontWeight:700, fontSize:14, color: better==="B" ? "#00d46a" : better==="even" ? "#e8f4f8" : "#6b9aad" }}>{valB}</span>
                </div>
              </div>
            );
          })}

          {/* Verdict */}
          <div style={{ marginTop:14, padding:"10px 14px", background:"rgba(0,212,106,0.08)", border:"1px solid rgba(0,212,106,0.2)", borderRadius:10, fontSize:13, color:"#00d46a", textAlign:"center", fontWeight:600 }}>
            🔮 {verdict}
          </div>
          <div style={{ marginTop:8, fontSize:11, color:"#4a6a7a", textAlign:"center" }}>
            Based on current points, goal difference, wins and remaining games. Not a guarantee!
          </div>
        </div>
      );
    })()}

    {/* TEAM COMPARISON */}
    <div style={{ ...S.card, padding:"18px 20px" }}>
      <p style={{ fontSize:12, fontWeight:700, color:"#6b9aad", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>Team Comparison</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div>
          {h2hPlayerA.teams.map(t => {
            const info = WC_TEAMS.find(x => x.name===t);
            const ts = standings[t] || {};
            return (
              <div key={t} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, fontSize:12 }}>
                <span>{info?.flag}</span>
                <span style={{ flex:1 }}>{t}</span>
                <span style={{ fontWeight:700, color:"#00d46a" }}>{ts.pts ?? 0}</span>
              </div>
            );
          })}
        </div>
        <div>
          {h2hPlayerB.teams.map(t => {
            const info = WC_TEAMS.find(x => x.name===t);
            const ts = standings[t] || {};
            return (
              <div key={t} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, fontSize:12, justifyContent:"flex-end" }}>
                <span style={{ fontWeight:700, color:"#00d46a" }}>{ts.pts ?? 0}</span>
                <span style={{ flex:1, textAlign:"right" }}>{t}</span>
                <span>{info?.flag}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
) : (
  <div style={{ ...S.card, padding:"30px 24px", textAlign:"center", color:"#6b9aad", fontSize:13 }}>
    Pick two different people above to compare
  </div>
)}
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
            {["A","B","C","D","E","F","G","H","I","J","K","L"].map(group => {
              const groupTeams = WC_TEAMS.filter(t => t.group === group).map(t => ({
                ...t, ...(standings[t.name] || { played:0, won:0, drawn:0, lost:0, gf:0, ga:0, gd:0, pts:0 })
              })).sort((a,b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
              return (
                <div key={group} style={{ ...S.card, padding:"14px 18px", marginBottom:12 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:"#00d46a", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Group {group}</p>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                    <thead>
                      <tr style={{ color:"#6b9aad" }}>
                        <th style={{ textAlign:"left", paddingBottom:7, fontWeight:600 }}>Team</th>
                        {["P","W","D","L","GF","GA","GD","Pts"].map(h => <th key={h} style={{ textAlign:"center", paddingBottom:7, fontWeight:600, width:24 }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {groupTeams.map((t,ti) => {
                        const owners = participants.filter(p => p.teams.includes(t.name));
                        return (
                          <tr key={t.name} style={{ borderTop:"1px solid rgba(255,255,255,0.05)", background:owners.length?"rgba(0,212,106,0.05)":"transparent" }}>
                            <td style={{ padding:"7px 0" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                                {ti < 2 && <span style={{ width:3, height:16, background:"#00d46a", borderRadius:2, display:"inline-block", flexShrink:0 }} />}
                                <span>{t.flag}</span>
                                <span style={{ fontWeight:owners.length?700:400 }}>{t.name}</span>
                                {owners.map(o => <span key={o.id} style={{ background:o.color, color:"#fff", fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:99 }}>{getInitials(o.name)}</span>)}
                              </div>
                            </td>
                            {[t.played,t.won,t.drawn,t.lost,t.gf,t.ga,t.gd,t.pts].map((v,vi) => (
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
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <h2 style={{ fontSize:19, fontWeight:700 }}>Knockout Bracket</h2>
              <button className="nb" style={{ fontSize:12, padding:"7px 12px" }} onClick={fetchAll}>🔄 Refresh</button>
            </div>
            {knockoutMatches.length === 0 ? (
              <div style={{ ...S.card, padding:"40px 24px", textAlign:"center" }}>
                <div style={{ fontSize:44, marginBottom:12 }}>🏆</div>
                <div style={{ fontWeight:600, marginBottom:8, fontSize:16 }}>Knockout stage not started yet</div>
                <div style={{ color:"#6b9aad", fontSize:14 }}>The bracket will appear once the group stage is complete</div>
              </div>
            ) : knockoutRounds.map(({ key, label }) => {
              const roundMatches = knockoutMatches.filter(m => m.stage === key);
              if (!roundMatches.length) return null;
              return (
                <div key={key} style={{ marginBottom:24 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:"#00d46a", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>{label}</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                    {roundMatches.map(m => {
                      const isLive = ["IN_PLAY","PAUSED","HALFTIME"].includes(m.status);
                      const isDone = m.status === "FINISHED";
                      const homeOwners = participants.filter(p => p.teams.some(t => m.homeTeam?.name?.includes(t)));
                      const awayOwners = participants.filter(p => p.teams.some(t => m.awayTeam?.name?.includes(t)));
                      return (
                        <div key={m.id} className="ko-match" style={{ border:isLive?"1px solid rgba(239,68,68,0.4)":"1px solid rgba(255,255,255,0.08)" }}>
                          <div style={{ fontSize:10, color:isLive?"#ef4444":"#6b9aad", fontWeight:700, marginBottom:8 }}>
                            {isLive && <span className="live-pulse" style={{ marginRight:4 }} />}
                            {matchStatusLabel(m)}
                          </div>
                          {[{team:m.homeTeam,score:m.score?.fullTime?.home,owners:homeOwners},{team:m.awayTeam,score:m.score?.fullTime?.away,owners:awayOwners}].map((side,si) => (
                            <div key={si} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0", borderBottom:si===0?"1px solid rgba(255,255,255,0.06)":"none" }}>
                              <span style={{ fontSize:16 }}>{getFlag(side.team?.name)}</span>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{side.team?.name || "TBD"}</div>
                                <div style={{ display:"flex", gap:3, marginTop:2 }}>
                                  {side.owners.map(o => <span key={o.id} style={{ background:o.color, color:"#fff", fontSize:8, fontWeight:700, padding:"1px 4px", borderRadius:99 }}>{getInitials(o.name)}</span>)}
                                </div>
                              </div>
                              {(isLive||isDone) && <span style={{ fontWeight:800, color:"#00d46a", fontSize:16, flexShrink:0 }}>{side.score??0}</span>}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {screen === "register" && (
          <div style={{ ...S.card, padding:"24px 20px" }}>
            <h2 style={{ fontSize:19, fontWeight:700, marginBottom:4 }}>Join the Sweepstake</h2>
            <p style={{ color:"#6b9aad", marginBottom:20, fontSize:13 }}>{availableTeams.length} teams unclaimed — grab as many as you like!</p>
            <div style={{ marginBottom:16 }}>
              <label style={S.lbl}>Your Name</label>
              <input style={S.inp} type="text" placeholder="e.g. Dave from Sales" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <label style={{ ...S.lbl, marginBottom:0 }}>
                  Pick Your Teams
                  {selectedTeams.length > 0 && <span style={{ marginLeft:8, background:"#00d46a", color:"#0a1628", borderRadius:99, padding:"2px 8px", fontSize:12, fontWeight:700 }}>{selectedTeams.length} selected</span>}
                </label>
                {selectedTeams.length > 0 && <button onClick={() => setSelectedTeams([])} style={{ background:"none", border:"none", color:"#ef4444", cursor:"pointer", fontSize:12, fontWeight:600 }}>Clear all</button>}
              </div>
              <div style={{ marginBottom:10 }}>
                <input style={S.inp} type="text" placeholder="🔍 Search teams..." value={teamSearch} onChange={e => setTeamSearch(e.target.value)} />
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
                {groups.map(g => <button key={g} className={`gp ${groupFilter===g?"on":""}`} onClick={() => setGroupFilter(g)}>{g==="ALL"?"All":`Grp ${g}`}</button>)}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, maxHeight:320, overflowY:"auto" }}>
                {visibleTeams.length === 0 && <div style={{ gridColumn:"1/-1", textAlign:"center", color:"#6b9aad", padding:"24px 0", fontSize:13 }}>No teams match</div>}
                {visibleTeams.map(t => {
                  const isTaken = takenTeams.includes(t.name) && !selectedTeams.includes(t.name);
                  const isSelected = selectedTeams.includes(t.name);
                  return (
                    <div key={t.name} className={`tt ${isSelected?"sel":""} ${isTaken?"tkn":""}`} onClick={() => !isTaken && toggleTeam(t.name)}>
                      <span style={{ fontSize:20 }}>{t.flag}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.name}</div>
                        <div style={{ fontSize:11, color:"#6b9aad" }}>Group {t.group}</div>
                      </div>
                      {isSelected && <span style={{ color:"#00d46a", fontSize:16, flexShrink:0 }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            {selectedTeams.length > 0 && (
              <div style={{ background:"rgba(0,212,106,0.08)", border:"1px solid rgba(0,212,106,0.25)", borderRadius:12, padding:"12px 14px", marginBottom:18 }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#00d46a", marginBottom:8 }}>YOUR TEAMS ({selectedTeams.length})</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {selectedTeams.map(tName => { const info=WC_TEAMS.find(x=>x.name===tName); return <span key={tName} className="ch" style={{ background:"rgba(0,212,106,0.15)", color:"#00d46a", border:"1px solid rgba(0,212,106,0.3)", cursor:"pointer" }} onClick={() => toggleTeam(tName)}>{info?.flag} {tName} ×</span>; })}
                </div>
              </div>
            )}
            <button style={{ ...S.btn, opacity:(!newName.trim()||!selectedTeams.length)?0.4:1 }} onClick={handleRegister} disabled={!newName.trim()||!selectedTeams.length}>
              {editingId ? `✏️ Update My Teams (${selectedTeams.length})` : `🎉 Claim My ${selectedTeams.length>1?`${selectedTeams.length} Teams`:selectedTeams.length===1?"Team":"Teams"}`}
            </button>
            {participants.length > 0 && (
              <div style={{ marginTop:24, paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize:12, fontWeight:700, color:"#6b9aad", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Already Joined</p>
                {participants.map(p => (
                  <div key={p.id} style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10, padding:"10px 12px", background:"rgba(255,255,255,0.04)", borderRadius:10 }}>
                    <div style={{ width:30, height:30, borderRadius:"50%", background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff", flexShrink:0, marginTop:1 }}>{getInitials(p.name)}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:14, marginBottom:5 }}>{p.name}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                        {p.teams.map(t => { const info=WC_TEAMS.find(x=>x.name===t); return <span key={t} className="ch">{info?.flag} {t}</span>; })}
                      </div>
                    </div>
                    <button onClick={() => {
                      setNewName(p.name);
                      setSelectedTeams([...p.teams]);
                      setEditingId(p.id);
                    }} style={{ background:"rgba(0,212,106,0.12)", border:"1px solid rgba(0,212,106,0.3)", color:"#00d46a", padding:"5px 10px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, flexShrink:0 }}>
                      ✏️ Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {screen === "admin" && (
          <div style={{ ...S.card, padding:"24px 20px" }}>
            <h2 style={{ fontSize:19, fontWeight:700, marginBottom:4 }}>⚙️ Admin Panel</h2>
            <p style={{ color:"#6b9aad", marginBottom:20, fontSize:13 }}>Manage participants</p>
            {!adminUnlocked ? (
              <div>
                <label style={S.lbl}>Admin PIN</label>
                <input style={S.inp} type="password" placeholder="Enter PIN" value={adminPin} onChange={e => setAdminPin(e.target.value)} onKeyDown={e => { if(e.key==="Enter"){if(adminPin==="4429")setAdminUnlocked(true);else showToast("Wrong PIN","error");}}} />
                <button style={{ ...S.btn, marginTop:14 }} onClick={() => { if(adminPin==="4429")setAdminUnlocked(true);else showToast("Wrong PIN","error"); }}>Unlock</button>
              </div>
            ) : (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <p style={{ fontSize:14, fontWeight:700 }}>Participants ({participants.length})</p>
                  <button style={{ background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.3)", color:"#ef4444", padding:"6px 12px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600 }}
                    onClick={async () => { if(window.confirm("Clear ALL?")){await supabase.from("participants").delete().neq("id",0);showToast("Cleared");}}}>🗑️ Clear All</button>
                </div>
                {participants.length === 0
                  ? <div style={{ textAlign:"center", color:"#6b9aad", padding:"28px 0", fontSize:14 }}>No participants yet</div>
                  : participants.map(p => (
                    <div key={p.id} style={{ ...S.row }}>
                      <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:"50%", background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>{getInitials(p.name)}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:14, marginBottom:5 }}>{p.name}</div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                            {p.teams.map(t => { const info=WC_TEAMS.find(x=>x.name===t); return <span key={t} className="ch">{info?.flag} {t}</span>; })}
                          </div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); handleRemove(p.id); }} style={{ background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", color:"#ef4444", padding:"5px 10px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, flexShrink:0 }}>Remove</button>
                      </div>
                    </div>
                  ))
                }
                <div style={{ marginTop:22, paddingTop:18, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                  <button style={S.btn} onClick={() => { fetchAll(); showToast("Refreshed!"); }}>🔄 Force Refresh</button>
                  <p style={{ color:"#6b9aad", fontSize:12, marginTop:10, textAlign:"center" }}>Last updated: {lastUpdated ?? "Never"}</p>
                </div>
                <button className="nb" style={{ width:"100%", marginTop:14 }} onClick={() => { setAdminUnlocked(false); setAdminPin(""); }}>🔒 Lock Admin</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}