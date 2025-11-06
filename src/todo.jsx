// DisciplineDashboardResponsive.jsx
// Single-file corrected and improved version

import React, { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import {
  FaProjectDiagram, FaTasks, FaChartBar, FaStickyNote, FaBullseye,
  FaRegStar, FaStar, FaPencilAlt, FaTrashAlt, FaUndo, FaRedo,
  FaSun, FaMoon, FaSave, FaSignOutAlt, FaPlus, FaSearch, FaCog,
  FaTimes, FaClock, FaFileImport, FaCheck
} from "react-icons/fa";

/* =========================
   Global style + tokens
   ========================= */
const GlobalStyle = createGlobalStyle`
  :root {
    --nav-height-desktop: 78px;
    --nav-height-mobile: 60px;
    --max-width: 1400px;
    --radius-lg: 16px;
    --radius-md: 10px;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Poppins", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    background: ${(p) => p.theme.bg};
    color: ${(p) => p.theme.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
  }
  h1,h2,h3,h4 { margin: 0; padding: 0; line-height: 1.2; font-weight: 600; }
  h1 { font-size: clamp(1.5rem, 3.6vw, 2rem); }
  h2 { font-size: clamp(1.3rem, 3vw, 1.6rem); }
  h3 { font-size: clamp(1.1rem, 2.4vw, 1.25rem); display:flex; align-items:center; gap:8px; }

  @media (max-width: 768px) {
    body { padding-bottom: var(--nav-height-mobile); }
  }
`;

/* =========================
   Themes
   ========================= */
const lightTheme = {
  name: "light",
  bg: "linear-gradient(135deg,#f7fbff,#e8f3ff)",
  cardBg: "rgba(255,255,255,0.92)",
  text: "#0f1724",
  subtleText: "#4b5563",
  accent1: "#0072ff",
  accent2: "#00c6ff",
  glassBorder: "rgba(0,0,0,0.06)",
  inputBg: "rgba(0,0,0,0.06)",
  itemBg: "rgba(0,0,0,0.03)",
  itemBgHover: "rgba(0,0,0,0.06)",
  danger: "#e11d48",
  dangerSubtle: "rgba(225,29,72,0.08)",
  modalBackdrop: "rgba(0,0,0,0.35)",
  accentGradient: "linear-gradient(135deg,#00c6ff,#0072ff)",
  noteBg: "rgba(0,0,0,0.04)",
  goalGreen: "#16a34a",
  projectColors: ["#0072ff","#00c6ff","#10b981","#f59e0b","#ef4444","#8b5cf6","#7c3aed"],
};

const darkTheme = {
  name: "dark",
  bg: "linear-gradient(135deg,#071126,#061021)",
  cardBg: "rgba(20,24,30,0.76)",
  text: "#ffffff",
  subtleText: "#94a3b8",
  accent1: "#0072ff",
  accent2: "#00c6ff",
  glassBorder: "rgba(255,255,255,0.06)",
  inputBg: "rgba(255,255,255,0.06)",
  itemBg: "rgba(255,255,255,0.04)",
  itemBgHover: "rgba(255,255,255,0.08)",
  danger: "#ff8b8b",
  dangerSubtle: "rgba(255,139,139,0.08)",
  modalBackdrop: "rgba(0,0,0,0.6)",
  accentGradient: "linear-gradient(135deg,#0072ff,#00c6ff)",
  noteBg: "rgba(255,255,255,0.04)",
  goalGreen: "#22c55e",
  projectColors: ["#0072ff","#00c6ff","#10b981","#f59e0b","#ef4444","#8b5cf6","#7c3aed"],
};

/* =========================
   Styled components
   ========================= */

const AppContainer = styled.div`
  display:flex;
  flex-direction:column;
  align-items:center;
  padding:18px;
  gap:12px;
  width:100%;
  @media (max-width:768px) { padding:12px; }
`;

const MainLayout = styled.div`
  display:flex;
  gap:12px;
  width:100%;
  max-width: var(--max-width);
  align-items:flex-start;
  justify-content:center;
`;

const LeftColumn = styled.div`
  flex: 0 0 260px;
  position: sticky;
  top: var(--nav-height-desktop);
  @media (max-width: 1024px) { display: none; }
`;

const CenterColumn = styled.div`
  flex: 1 1 640px;
  min-width: 0;
  display:flex;
  flex-direction:column;
  gap:12px;
`;

const RightColumn = styled.div`
  flex: 0 0 360px;
  position: sticky;
  top: var(--nav-height-desktop);
  display:flex;
  flex-direction:column;
  gap:12px;
  @media (max-width: 768px) { display: none; }
`;

const GlassCard = styled(motion.div)`
  background: ${(p) => p.theme.cardBg};
  backdrop-filter: blur(12px);
  border-radius: var(--radius-lg);
  padding: 18px;
  width: 100%;
  box-shadow: 0 6px 24px rgba(0,0,0,0.08);
  border: 1px solid ${(p) => p.theme.glassBorder};
  @media (max-width:768px) { padding: 14px; }
`;

const Title = styled(motion.h1)`
  font-size: 1.6rem;
  margin: 0;
`;

const Subtitle = styled(motion.h3)`
  color: ${(p) => p.theme.subtleText};
  font-weight: 400;
  font-size: 0.95rem;
  margin-top: 4px;
`;

const Button = styled(motion.button)`
  background: ${(p) => p.theme.accentGradient};
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 14px;
  color: white;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.18s ease;
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,114,255,0.16); }
  &:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
`;

const SubtleButton = styled(Button)`
  background: ${(p) => p.theme.inputBg};
  color: ${(p) => p.theme.text};
  font-weight: 500;
  &:hover { background: ${(p) => p.theme.itemBgHover}; transform: translateY(-2px); box-shadow: none; }
`;

const IconButton = styled.button`
  background: ${(p) => p.theme.inputBg};
  border-radius: 999px;
  padding: 8px;
  border: none;
  display: inline-flex;
  align-items:center;
  justify-content:center;
  cursor: pointer;
  color: ${(p) => p.theme.text};
  transition: all .15s ease;
  &:hover { transform: translateY(-3px); background: ${(p) => p.theme.itemBgHover}; }
  &.danger { color: ${(p) => p.theme.danger}; background: ${(p) => p.theme.dangerSubtle}; }
`;

const Row = styled.div`
  display:flex;
  gap:10px;
  align-items:center;
  width:100%;
`;

const Column = styled.div`
  display:flex;
  flex-direction:column;
  gap:12px;
`;

const TaskInput = styled.input`
  width:100%;
  padding:10px 12px;
  border-radius: var(--radius-md);
  border: none;
  background: ${(p) => p.theme.inputBg};
  color: ${(p) => p.theme.text};
  outline: none;
  font-size: 1rem;
  transition: all .12s ease;
  &:focus { box-shadow: 0 4px 18px rgba(0,0,0,0.06); }
`;

/* StatsBox used by StatsPanel */
const StatsBox = styled(GlassCard)`
  max-width: 420px;
`;

/* Modal backdrop/content */
const ModalBackdrop = styled(motion.div)`
  position: fixed; inset: 0;
  background: ${(p) => p.theme.modalBackdrop};
  display:flex; align-items:center; justify-content:center; z-index:2000;
  padding: 12px;
`;
const ModalContent = styled(GlassCard)`
  width:100%;
  max-width:700px;
  margin:0;
`;

/* Project sidebar styles */
const ProjectSidebarStyled = styled(GlassCard)`
  padding: 14px;
`;
const ProjectItem = styled.div`
  padding: 10px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  background: ${(p) => (p.$active ? p.theme.itemBgHover : "transparent")};
  color: ${(p) => (p.$active ? p.theme.text : p.theme.subtleText)};
  transition: all 0.12s ease;

  &:hover {
    background: ${(p) => p.theme.itemBgHover};
    color: ${(p) => p.theme.text};
  }
`;

const ProjectColorDot = styled.div`
  width:12px; height:12px; border-radius:50%; background: ${(p) => p.color || "#0072ff"};
`;

/* Notes, Goal, Offline badge */
const NotesCard = styled(GlassCard)`
  textarea { width:100%; min-height:120px; padding:10px; border-radius: var(--radius-md); border:none; background: ${(p) => p.theme.noteBg}; color: ${(p) => p.theme.text}; font-family: inherit; }
`;
const GoalCard = styled(GlassCard)`
  .bar { height: 10px; border-radius:6px; background: ${(p) => p.theme.itemBg}; overflow:hidden; margin-top:8px; }
  .fill { height:100%; background: ${(p) => p.theme.goalGreen}; transition: width .35s ease; }
`;
const OfflineBadge = styled.div`
  position: fixed; top: 14px; left: 50%; transform: translateX(-50%);
  background: ${(p) => p.theme.dangerSubtle}; color: ${(p) => p.theme.danger};
  padding: 6px 12px; border-radius: 12px; font-size: 0.85rem; z-index: 1500; backdrop-filter: blur(10px);
`;

/* Mobile nav */
const MobileNav = styled(motion.nav)`
  position: fixed; bottom: 0; left: 0; right: 0; height: var(--nav-height-mobile);
  background: ${(p) => p.theme.cardBg}; border-top: 1px solid ${(p) => p.theme.glassBorder};
  display:flex; justify-content:space-around; align-items:center; z-index:1200;
  @media (min-width: 769px) { display: none; }
`;
const MobileNavButton = styled.button`
  background: none;
  border: none;
  color: ${(p) => (p.$active ? p.theme.accent1 : p.theme.subtleText)};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 8px;

  > svg {
    font-size: 1.2rem;
  }
`;

/* Task item */
const TaskItemStyled = styled(motion.li)`
  display:flex;
  flex-direction:column;
  padding: ${(p) => p.$compact ? '8px 10px' : '12px'};
  border-radius: var(--radius-md);
  background: ${(p) => p.theme.itemBg};
  margin-top:8px;
  border: 1px solid transparent;
  border-left: 4px solid ${(p) => p.projectColor || p.theme.accent1};
  transition: all .12s ease;
  &[data-overdue="true"] {
    border-color: ${(p) => p.theme.danger};
    border-left-color: ${(p) => p.theme.danger};
  }
`;

const TaskItemRow = styled.div` display:flex; justify-content:space-between; align-items:center; gap:8px; `;
const TaskContent = styled.div` display:flex; gap:10px; align-items:center; min-width:0; flex:1; `;
const TaskText = styled.div`
  font-weight:500;
  text-decoration: ${(p) => (p.$done ? 'line-through' : 'none')};
  opacity: ${(p) => (p.$done ? 0.55 : 1)};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;
  @media (max-width:768px) { font-size: 0.95rem; }
`;

const TaskMeta = styled.div` font-size:0.82rem; color: ${(p) => p.theme.subtleText}; margin-top:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; `;
const TaskActions = styled.div` display:flex; gap:6px; align-items:center; flex-shrink:0; `;
const Checkbox = styled.input` transform: scale(1.12); cursor:pointer; `;

/* =========================
   Utilities & small hooks
   ========================= */

const getTodayDate = () => {
  const t = new Date();
  return t.toISOString().split("T")[0];
};

function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const s = window.localStorage.getItem(key);
      return s ? JSON.parse(s) : initialValue;
    } catch (e) {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(stored));
    } catch (e) { /* ignore */ }
  }, [key, stored]);
  return [stored, setStored];
}

async function tryRequestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const perm = await Notification.requestPermission();
    return perm === "granted";
  }
  return false;
}

function showNotification(title, options = {}) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, options);
    }
  } catch (e) { /* ignore */ }
}

function exportData(filename = "focusspace_export.json") {
  try {
    const payload = {
      tasks: JSON.parse(localStorage.getItem("tasks") || "[]"),
      projects: JSON.parse(localStorage.getItem("projects") || "[]"),
      streak: JSON.parse(localStorage.getItem("streak") || "0"),
      lastCompletionDate: localStorage.getItem("lastCompletionDate"),
      pomodoro: { cycles: JSON.parse(localStorage.getItem("pomodoro_cycles") || "0") },
      notes: localStorage.getItem("quickNotes") || "",
      goal: JSON.parse(localStorage.getItem("dailyGoal") || "5"),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) { console.error("Export failed", e); }
}

async function importData(file) {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (parsed.tasks) window.localStorage.setItem("tasks", JSON.stringify(parsed.tasks));
    if (parsed.projects) window.localStorage.setItem("projects", JSON.stringify(parsed.projects));
    if (typeof parsed.streak !== "undefined") window.localStorage.setItem("streak", JSON.stringify(parsed.streak));
    if (parsed.lastCompletionDate) window.localStorage.setItem("lastCompletionDate", parsed.lastCompletionDate);
    if (parsed.pomodoro && typeof parsed.pomodoro.cycles !== "undefined") window.localStorage.setItem("pomodoro_cycles", JSON.stringify(parsed.pomodoro.cycles));
    if (parsed.notes) window.localStorage.setItem("quickNotes", parsed.notes);
    if (parsed.goal) window.localStorage.setItem("dailyGoal", JSON.stringify(parsed.goal));
    return true;
  } catch (e) { console.error("Import error", e); return false; }
}

function useUndoRedo(initial) {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initial);
  const [future, setFuture] = useState([]);
  const set = useCallback((newPresent) => {
    setPast((p) => [...p, present].slice(-100));
    setPresent(newPresent);
    setFuture([]);
  }, [present]);
  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const last = p[p.length - 1];
      const newPast = p.slice(0, -1);
      setFuture((f) => [present, ...f]);
      setPresent(last);
      return newPast;
    });
  }, [present]);
  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      const newFuture = f.slice(1);
      setPast((p) => [...p, present]);
      setPresent(next);
      return newFuture;
    });
  }, [present]);
  return { present, set, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 };
}

/* =========================
   Subcomponents
   ========================= */

const ThemeProviderContext = createContext(null);

/* SettingsPanel */
function SettingsPanel({ themeMode, setThemeMode, notifyEnabled, setNotifyEnabled, compact, setCompact }) {
  const [prefNotify, setPrefNotify] = useState(notifyEnabled);
  useEffect(() => setPrefNotify(notifyEnabled), [notifyEnabled]);
  const save = async () => {
    setNotifyEnabled(prefNotify);
    if (prefNotify) await tryRequestNotificationPermission();
    alert("Settings saved.");
  };
  return (
    <GlassCard initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h3><FaCog /> Settings</h3>
      <Column>
        <Row style={{ justifyContent: 'space-between' }}>
          <div style={{ minWidth: 110 }}>Theme</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <SubtleButton onClick={() => setThemeMode("dark")}><FaMoon /></SubtleButton>
            <SubtleButton onClick={() => setThemeMode("light")}><FaSun /></SubtleButton>
            <SubtleButton onClick={() => setThemeMode("auto")}>Auto</SubtleButton>
          </div>
        </Row>

        <label style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" checked={prefNotify} onChange={(e) => setPrefNotify(e.target.checked)} />
          <span style={{ color: 'inherit' }}>Enable desktop notifications</span>
        </label>

        <label style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} />
          <span>Compact task view</span>
        </label>

        <Row style={{ marginTop: 12, justifyContent: 'flex-end' }}>
          <Button onClick={save}><FaSave /> Save settings</Button>
        </Row>
      </Column>
    </GlassCard>
  );
}

/* Pomodoro Timer */
function PomodoroTimer({ onComplete }) {
  const POMODORO = 25 * 60;
  const SHORT_BREAK = 5 * 60;
  const LONG_BREAK = 15 * 60;

  const [mode, setMode] = useLocalStorage("pomodoro_mode", "pomodoro");
  const [running, setRunning] = useLocalStorage("pomodoro_running", false);
  const [remaining, setRemaining] = useLocalStorage("pomodoro_remaining", POMODORO);
  const [cycles, setCycles] = useLocalStorage("pomodoro_cycles", 0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!remaining || typeof remaining !== "number") {
      const val = mode === "pomodoro" ? POMODORO : mode === "short-break" ? SHORT_BREAK : LONG_BREAK;
      setRemaining(val);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setRunning(false);
            if (mode === "pomodoro") {
              setCycles((c) => c + 1);
              onComplete && onComplete("pomodoro");
              showNotification("Pomodoro complete!", { body: "Take a break!" });
            } else {
              showNotification("Break finished!", { body: "Ready for next pomodoro?" });
            }
            if (mode === "pomodoro") {
              const next = (cycles + 1) % 4 === 0 ? "long-break" : "short-break";
              setMode(next);
              setRemaining(next === "long-break" ? LONG_BREAK : SHORT_BREAK);
            } else {
              setMode("pomodoro");
              setRemaining(POMODORO);
            }
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode, cycles, onComplete, setRemaining, setMode, setCycles]);

  const start = () => setRunning(true);
  const pause = () => setRunning(false);
  const reset = () => { setRemaining(mode === "pomodoro" ? POMODORO : mode === "short-break" ? SHORT_BREAK : LONG_BREAK); setRunning(false); };
  const setModeHandler = (m) => { setMode(m); setRemaining(m === "pomodoro" ? POMODORO : m === "short-break" ? SHORT_BREAK : LONG_BREAK); setRunning(false); };

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <GlassCard initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <h3><FaClock /> Pomodoro</h3>
      <div style={{ display: "flex", gap: 8, width: "100%" }}>
        <SubtleButton onClick={() => setModeHandler("pomodoro")} style={{ flex: 1, opacity: mode === "pomodoro" ? 1 : 0.6 }}>Work</SubtleButton>
        <SubtleButton onClick={() => setModeHandler("short-break")} style={{ flex: 1, opacity: mode === "short-break" ? 1 : 0.6 }}>Short</SubtleButton>
        <SubtleButton onClick={() => setModeHandler("long-break")} style={{ flex: 1, opacity: mode === "long-break" ? 1 : 0.6 }}>Long</SubtleButton>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 8 }}>
        <div style={{ fontSize: "2.2rem", fontWeight: 700 }}>{mm}:{ss}</div>
        <div style={{ color: "gray", fontSize: 13, marginTop: 4 }}>Cycles: {cycles}</div>
      </div>
      <Row style={{ marginTop: 12 }}>
        {!running ? <Button onClick={start} style={{ flex: 1 }}>Start</Button> : <Button onClick={pause} style={{ flex: 1 }}>Pause</Button>}
        <SubtleButton onClick={reset}>Reset</SubtleButton>
      </Row>
    </GlassCard>
  );
}

/* StatsPanel */
function computeStats(allTasks) {
  const total = allTasks.length;
  const completed = (allTasks || []).filter(t => t.done).length;
  return { total, completed };
}
function StatsPanel({ tasks, streak }) {
  const stats = useMemo(() => computeStats(tasks), [tasks]);
  return (
    <StatsBox initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h3><FaChartBar /> Quick Stats</h3>
      <Row style={{ justifyContent: 'space-around', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.total}</div>
          <div style={{ color: (p) => p.theme.subtleText, fontSize: 13 }}>Total</div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.completed}</div>
          <div style={{ color: (p) => p.theme.subtleText, fontSize: 13 }}>Done</div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{streak} 🔥</div>
          <div style={{ color: (p) => p.theme.subtleText, fontSize: 13 }}>Streak</div>
        </div>
      </Row>
    </StatsBox>
  );
}

/* Task Detail Modal */
function TaskDetailModal({ task = {}, projects = [], onSave, onClose }) {
  const [text, setText] = useState(task.text || "");
  const [notes, setNotes] = useState(task.notes || "");
  const [projectId, setProjectId] = useState(task.projectId || "inbox");
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [reminderTime, setReminderTime] = useState(task.reminderTime || "");

  useEffect(() => {
    setText(task.text || "");
    setNotes(task.notes || "");
    setProjectId(task.projectId || "inbox");
    setDueDate(task.dueDate || "");
    setReminderTime(task.reminderTime || "");
  }, [task]);

  const handleSave = () => {
    const updated = { ...task, text, notes, projectId, dueDate, reminderTime };
    onSave(updated);
    onClose();
  };

  return (
    <ModalBackdrop initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <ModalContent initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
        <h2>Edit Task</h2>
        <div>
          <label style={{ fontWeight: 600, color: "gray", display: "block", marginBottom: 6 }}>Task</label>
          <TaskInput value={text} onChange={(e) => setText(e.target.value)} placeholder="What needs to be done?" />
        </div>
        <div>
          <label style={{ fontWeight: 600, color: "gray", display: "block", marginBottom: 6 }}>Project</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, background: "transparent", border: "1px solid rgba(0,0,0,0.06)" }}>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 600, color: "gray", display: "block", marginBottom: 6 }}>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: "100%", minHeight: 100, padding: 10, borderRadius: 8 }} />
        </div>
        <Row>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontWeight: 600, color: "gray", marginBottom: 6 }}>Due date</label>
            <input type="date" value={dueDate || ""} onChange={(e) => setDueDate(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontWeight: 600, color: "gray", marginBottom: 6 }}>Reminder</label>
            <input type="datetime-local" value={reminderTime || ""} onChange={(e) => setReminderTime(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8 }} />
          </div>
        </Row>
        <Row style={{ justifyContent: "flex-end", marginTop: 12 }}>
          <SubtleButton onClick={onClose}>Cancel</SubtleButton>
          <Button onClick={handleSave}><FaSave /> Save</Button>
        </Row>
      </ModalContent>
    </ModalBackdrop>
  );
}

/* ProjectSidebar component (uses theme via context) */
function ProjectSidebar({ projects = [], selectedId, onSelect, onAddProject, onDeleteProject }) {
  const theme = useContext(ThemeProviderContext) || lightTheme;
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState(theme.projectColors?.[0] || "#0072ff");

  const handleAdd = () => {
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim(), newProjectColor);
      setNewProjectName("");
    }
  };

  return (
    <ProjectSidebarStyled>
      <h3><FaProjectDiagram /> Projects</h3>
      <Column style={{ gap: 6 }}>
      <ProjectItem
  $active={selectedId === "all"}
  onClick={() => onSelect("all")}
>
  <Row style={{ gap: 10 }}>
    <FaTasks />
    <div>All Tasks</div>
  </Row>
  <div style={{ color: "gray" }}>
    {/* optionally show count */}
  </div>
</ProjectItem>


        <hr style={{ border: "none", height: 1, background: "rgba(0,0,0,0.06)", margin: "8px 0" }} />

        {projects.map((p) => (
        <ProjectItem key={p.id} $active={selectedId === p.id} onClick={() => onSelect(p.id)}>
            <Row style={{ gap: 10, minWidth: 0 }}>
              <ProjectColorDot color={p.color || "#0072ff"} />
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
            </Row>
            {p.id !== 'inbox' && (
              <IconButton className="danger" onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete "${p.name}"?`)) onDeleteProject(p.id); }}>
                <FaTrashAlt />
              </IconButton>
            )}
          </ProjectItem>
        ))}
      </Column>

      <Row style={{ marginTop: 12 }}>
        <TaskInput placeholder="New project..." value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
        <Button onClick={handleAdd}><FaPlus /></Button>
      </Row>

      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(theme.projectColors || []).map((c) => (
          <div key={c} onClick={() => setNewProjectColor(c)} style={{ width: 24, height: 24, borderRadius: 999, background: c, cursor: "pointer", border: newProjectColor === c ? `3px solid ${theme.text}` : `2px solid ${theme.glassBorder}` }} />
        ))}
      </div>
    </ProjectSidebarStyled>
  );
}

/* NotesPad */
function NotesPad() {
  const [notes, setNotes] = useLocalStorage("quickNotes", "");
  return (
    <NotesCard initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h3><FaStickyNote /> Quick Notes</h3>
      <textarea placeholder="Write thoughts, ideas, or reminders..." value={notes} onChange={(e) => setNotes(e.target.value)} />
    </NotesCard>
  );
}

/* DailyGoal */
function DailyGoal({ tasks = [] }) {
  const [goal, setGoal] = useLocalStorage("dailyGoal", 5);
  const completed = tasks.filter(t => t.done).length;
  const pct = Math.round(Math.min((completed / Math.max(goal, 1)) * 100, 100));
  return (
    <GoalCard initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h3><FaBullseye /> Daily Focus Goal</h3>
      <Row style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>Target:</span>
          <input type="number" min="1" value={goal} onChange={(e) => setGoal(Number(e.target.value || 1))} style={{ width: 60, borderRadius: 8, border: "none", padding: "6px 8px", background: "transparent" }} />
        </div>
        <div style={{ fontSize: 13, color: "gray" }}>{completed} / {goal} ({pct}%)</div>
      </Row>
      <div className="bar"><div className="fill" style={{ width: `${pct}%` }} /></div>
    </GoalCard>
  );
}

/* Mobile modal container */
function MobileModal({ title, onClose, children }) {
  return (
    <ModalBackdrop initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }}>
      <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", padding: 12 }}>
        <Row style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <IconButton onClick={onClose}><FaTimes /></IconButton>
        </Row>
        <Column>{children}</Column>
      </div>
    </ModalBackdrop>
  );
}

/* TaskItem component (memoized) */
const TaskItem = React.memo(({
  task, projectColor, onToggle, onDelete, onEdit, onToggleStar, onToggleSelect, isSelected, isOverdue, compact
}) => {
  return (
    <TaskItemStyled projectColor={projectColor} data-overdue={isOverdue} $compact={compact} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -60 }} layout>
      <TaskItemRow>
        <TaskContent>
          <Checkbox type="checkbox" checked={isSelected} onChange={() => onToggleSelect(task.id)} aria-label={`Select ${task.text}`} />
          <Checkbox type="checkbox" checked={task.done} onChange={() => onToggle(task)} aria-label={`Toggle ${task.text}`} />
          <div style={{ minWidth: 0 }} onClick={() => onEdit(task)}>
            <TaskText done={task.$done}>{task.text}</TaskText>
            <TaskMeta>
              {task.dueDate && <span>Due: {task.dueDate} • </span>}
              {task.notes && <span>Notes • </span>}
              {task.tags && task.tags.length > 0 && <span>#{task.tags.join(", #")}</span>}
            </TaskMeta>
          </div>
        </TaskContent>
        <TaskActions>
          <IconButton onClick={() => onToggleStar(task.id)} title="Star">
            {task.starred ? <FaStar color="#f59e0b" /> : <FaRegStar />}
          </IconButton>
          <IconButton onClick={() => onEdit(task)} title="Edit"><FaPencilAlt /></IconButton>
          <IconButton className="danger" onClick={() => onDelete(task)} title="Delete"><FaTrashAlt /></IconButton>
        </TaskActions>
      </TaskItemRow>
    </TaskItemStyled>
  );
});

/* =========================
   Main export: DisciplineDashboardResponsive
   ========================= */

export default function DisciplineDashboardResponsive() {
  // theme
  const [themeMode, setThemeMode] = useLocalStorage("themeMode", "dark");
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = themeMode === "dark" || (themeMode === "auto" && systemPrefersDark) ? darkTheme : lightTheme;

  // central state (localStorage backed)
  const [tasksStorage, setTasksStorage] = useLocalStorage("tasks", []);
  const [projects, setProjects] = useLocalStorage("projects", [{ id: 'inbox', name: 'Inbox', color: '#6b7280' }]);
  const [streak, setStreak] = useLocalStorage("streak", 0);
  const [lastCompletionDate, setLastCompletionDate] = useLocalStorage("lastCompletionDate", null);
  const [history, setHistory] = useLocalStorage("history", []);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [notifyEnabled, setNotifyEnabled] = useLocalStorage("notifyEnabled", false);
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [filterToday, setFilterToday] = useState(false);
  const [sortByDue, setSortByDue] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [compact, setCompact] = useLocalStorage("compactMode", false);

  // mobile
  const [mobileView, setMobileView] = useState('tasks'); // 'tasks','projects','add','utils','settings'
  const [tabletProjectView, setTabletProjectView] = useState(false);

  // undo/redo wrapper
  const tasksUndoRedo = useUndoRedo(tasksStorage);
  useEffect(() => {
    if (JSON.stringify(tasksStorage) !== JSON.stringify(tasksUndoRedo.present)) tasksUndoRedo.set(tasksStorage);
    // eslint-disable-next-line
  }, [tasksStorage]);
  useEffect(() => {
    if (JSON.stringify(tasksStorage) !== JSON.stringify(tasksUndoRedo.present)) setTasksStorage(tasksUndoRedo.present);
    // eslint-disable-next-line
  }, [tasksUndoRedo.present]);
  const { undo, redo, canUndo, canRedo } = tasksUndoRedo;

  // keyboard shortcuts (map)
  const keyMap = useMemo(() => ({
    "Control+k": () => document.querySelector('input[aria-label="Search tasks"]')?.focus(),
    "Control+e": () => exportData(),
    "Alt+n": () => document.getElementById("quick-add-input")?.focus(),
    "Control+z": () => undo(),
    "Control+y": () => redo(),
    "Alt+t": () => setFilterToday(s => !s),
  }), [undo, redo]);

  useEffect(() => {
    const handler = (e) => {
      // ignore keys inside inputs
      const inInput = ["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName);
      const combo = `${e.ctrlKey ? "Control+" : ""}${e.altKey ? "Alt+" : ""}${e.metaKey ? "Meta+" : ""}${e.shiftKey ? "Shift+" : ""}${e.key}`.replace(/\+$/,"");
      if (inInput) {
        if (e.key === "Escape") e.target.blur();
        return;
      }
      if (keyMap[combo]) { e.preventDefault(); keyMap[combo](); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keyMap]);

  // data migration
  useEffect(() => {
    if (!Array.isArray(projects)) setProjects([{ id: 'inbox', name: 'Inbox', color: '#6b7280' }]);
    if (tasksStorage.length > 0 && typeof tasksStorage[0].projectId === "undefined") {
      setTasksStorage(tasksStorage.map(t => ({ ...t, projectId: 'inbox', notes: t.notes || "", dueDate: t.dueDate || null, createdAt: t.createdAt || new Date().toISOString() })));
    }
    // eslint-disable-next-line
  }, []);

  // map project id to color
  const projectColorMap = useMemo(() => projects.reduce((acc, p) => { acc[p.id] = p.color; return acc; }, { 'inbox': '#6b7280' }), [projects]);

  // filtered & sorted tasks
  const filteredTasks = useMemo(() => {
    let arr = tasksStorage.filter(t => {
      const inProject = selectedProjectId === 'all' || t.projectId === selectedProjectId;
      if (!inProject) return false;
      if (filterToday) {
        if (t.dueDate !== getTodayDate()) return false;
      }
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return (t.text || "").toLowerCase().includes(s) || (t.tags || []).some(tag => tag.toLowerCase().includes(s)) || (t.notes || "").toLowerCase().includes(s);
    });

    arr.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.starred !== b.starred) return b.starred ? -1 : 1;
      if (sortByDue) {
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        if (a.dueDate && b.dueDate) {
          const da = new Date(a.dueDate), db = new Date(b.dueDate);
          if (da - db !== 0) return da - db;
        }
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    return arr;
  }, [tasksStorage, selectedProjectId, searchTerm, filterToday, sortByDue]);

  // history persistence and streak
  useEffect(() => {
    const allDone = tasksStorage.length > 0 && tasksStorage.every(t => t.done);
    const todayStr = getTodayDate();
    if (allDone && lastCompletionDate !== todayStr) {
      setHistory(h => [...h, { date: todayStr, completed: tasksStorage.length }]);
      setStreak(s => s + 1);
      setLastCompletionDate(todayStr);
      if (notifyEnabled) showNotification("Streak increased!", { body: `You're on a ${streak + 1}-day streak!` });
    }
  }, [tasksStorage, lastCompletionDate, notifyEnabled, setHistory, setStreak, setLastCompletionDate, streak]);

  useEffect(() => {
    if (!lastCompletionDate) return;
    const today = new Date(getTodayDate());
    const last = new Date(lastCompletionDate);
    const diffDays = (today.getTime() - last.getTime()) / (1000*60*60*24);
    if (diffDays > 1) setStreak(0);
  }, [lastCompletionDate]);

  // core functions
  const toggleTask = useCallback((taskToToggle) => {
    tasksUndoRedo.set(tasksStorage.map((t) => (t.id === taskToToggle.id) ? { ...t, done: !t.done } : t));
  }, [tasksStorage, tasksUndoRedo]);

  const addTask = (text, opts = {}) => {
    const t = {
      text: text || "New task",
      done: false,
      createdAt: new Date().toISOString(),
      dueDate: opts.dueDate || null,
      notes: opts.notes || "",
      tags: opts.tags || [],
      priority: opts.priority || "normal",
      projectId: selectedProjectId === 'all' ? 'inbox' : selectedProjectId,
      starred: false,
      id: 'task-' + Date.now(),
      reminderTime: opts.reminderTime || null,
    };
    tasksUndoRedo.set((prev) => [...prev, t]);
  };

  // saveTask uses id
  const saveTask = (updatedTask) => {
    tasksUndoRedo.set(prev => prev.map((t) => (t.id === updatedTask.id) ? updatedTask : t));
  };

  const deleteTask = (taskToDelete) => {
    tasksUndoRedo.set(prev => prev.filter((t) => t.id !== taskToDelete.id));
    setSelectedTaskIds((ids) => ids.filter(id => id !== taskToDelete.id));
  };

  const addProject = (name, color) => {
    const newProject = { id: 'proj-' + Date.now(), name, color: color || "#0072ff" };
    setProjects(prev => [...prev, newProject]);
    setSelectedProjectId(newProject.id);
    setMobileView('tasks');
    setTabletProjectView(false);
  };

  const deleteProject = (idToDelete) => {
    if (idToDelete === 'inbox') return;
    setProjects(prev => prev.filter(p => p.id !== idToDelete));
    tasksUndoRedo.set(prev => prev.map(t => (t.projectId === idToDelete) ? { ...t, projectId: 'inbox' } : t));
    if (selectedProjectId === idToDelete) setSelectedProjectId('all');
  };

  const toggleStar = (taskId) => tasksUndoRedo.set(prev => prev.map(t => t.id === taskId ? { ...t, starred: !t.starred } : t));

  // bulk actions
  const toggleSelectTask = (taskId) => setSelectedTaskIds(ids => ids.includes(taskId) ? ids.filter(i => i !== taskId) : [...ids, taskId]);
  const bulkComplete = () => { tasksUndoRedo.set(prev => prev.map(t => selectedTaskIds.includes(t.id) ? { ...t, done: true } : t)); setSelectedTaskIds([]); };
  const bulkDelete = () => { if (!window.confirm(`Delete ${selectedTaskIds.length} selected task(s)?`)) return; tasksUndoRedo.set(prev => prev.filter(t => !selectedTaskIds.includes(t.id))); setSelectedTaskIds([]); };

  const handlePomodoroComplete = (type) => {
    if (type === "pomodoro") {
      const nextTask = filteredTasks.find(t => !t.done);
      if (nextTask) toggleTask(nextTask);
    }
  };

  // Quick add
  const [quickText, setQuickText] = useState("");
  const quickAdd = () => { if (!quickText.trim()) return; addTask(quickText.trim()); setQuickText(""); };

  // notifications (reminders)
  useEffect(() => {
    if (!notifyEnabled) return;
    const check = () => {
      const now = new Date();
      tasksStorage.forEach((t) => {
        if (t.reminderTime && !t.done) {
          const rt = new Date(t.reminderTime);
          if (rt.getFullYear() === now.getFullYear() && rt.getMonth() === now.getMonth() && rt.getDate() === now.getDate() && rt.getHours() === now.getHours() && rt.getMinutes() === now.getMinutes()) {
            showNotification("⏰ Task Reminder", { body: t.text });
          }
        }
      });
    };
    const id = setInterval(check, 60000);
    check();
    return () => clearInterval(id);
  }, [tasksStorage, notifyEnabled]);

  // auto weekly backup
  useEffect(() => {
    try {
      const lastBackup = localStorage.getItem("lastBackupDate");
      const today = getTodayDate();
      if (!lastBackup || (new Date(today) - new Date(lastBackup) > 7 * 24 * 3600 * 1000)) {
        exportData(`focusspace_backup_${today}.json`);
        localStorage.setItem("lastBackupDate", today);
      }
    } catch (e) { /* ignore */ }
  }, []);

  // offline indicator
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);

  // mobile nav handler
  const handleMobileNav = (view) => {
    if (view === 'add') {
      document.getElementById("quick-add-input")?.focus();
    } else {
      setMobileView(view);
    }
  };

  // Render mobile modal content
  const RenderMobileModal = () => {
    const handleClose = () => setMobileView('tasks');
    let title = "";
    let content = null;
    if (mobileView === 'projects') {
      title = "Projects";
      content = <ProjectSidebar projects={projects} selectedId={selectedProjectId} onSelect={(id) => { setSelectedProjectId(id); handleClose(); }} onAddProject={addProject} onDeleteProject={deleteProject} />;
    } else if (mobileView === 'utils') {
      title = "Utilities";
      content = <>
        <PomodoroTimer onComplete={handlePomodoroComplete} />
        <NotesPad />
        <DailyGoal tasks={tasksStorage} />
      </>;
    } else if (mobileView === 'settings') {
      title = "Settings";
      content = <SettingsPanel themeMode={themeMode} setThemeMode={setThemeMode} notifyEnabled={notifyEnabled} setNotifyEnabled={setNotifyEnabled} compact={compact} setCompact={setCompact} />;
    } else return null;
    return <MobileModal title={title} onClose={handleClose}>{content}</MobileModal>;
  };

  // isOverdue helper
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date(getTodayDate());
  };

  // file input ref for resetting value
  const importFileRef = useRef(null);
  const handleImportChange = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      const ok = await importData(f);
      if (ok) { alert("Import success — Reloading to sync."); window.location.reload(); } else alert("Import failed.");
    }
    // reset input value so same file can be imported again
    e.target.value = "";
  };

  return (
    <ThemeProviderContext.Provider value={theme}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        {isOffline && <OfflineBadge>Offline mode</OfflineBadge>}
        <AppContainer>
{/* Header */}
<GlassCard
  style={{
    position: "sticky",
    top: 0,
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 12,
    width: "100%",
    maxWidth: "var(--max-width)",
    padding: "16px 20px",
  }}
>
  {/* Logo + Title Row */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "linear-gradient(90deg,#00c6ff,#0072ff)",
          flexShrink: 0,
        }}
      />
      <div>
        <Title>✨ FocusSpace</Title>
        <Subtitle>Your all-in-one productivity hub</Subtitle>
      </div>
    </div>

    {/* Theme toggle always visible on small screens */}
    <div className="theme-toggle-mobile" style={{ display: "flex", gap: 8 }}>
      <IconButton
        onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
        title="Toggle theme"
      >
        {themeMode === "dark" ? <FaSun /> : <FaMoon />}
      </IconButton>
    </div>
  </div>

  {/* Quick Add & Controls */}
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    }}
  >
    <input
      id="quick-add-input"
      placeholder={`Add to "${
        projects.find(
          (p) => p.id === (selectedProjectId === "all" ? "inbox" : selectedProjectId)
        )?.name || "Inbox"
      }" (Alt+N)`}
      value={quickText}
      onChange={(e) => setQuickText(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") quickAdd();
      }}
      style={{
        flex: "1 1 240px",
        minWidth: "150px",
        padding: 10,
        borderRadius: 8,
        border: "none",
        background: theme.inputBg,
        color: theme.text,
        fontSize: "0.95rem",
      }}
    />
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        alignItems: "center",
        justifyContent: "flex-end",
        flex: "1 1 auto",
      }}
    >
      <Button onClick={quickAdd}>
        <FaPlus /> Add
      </Button>
      <SubtleButton
        onClick={() => setFilterToday((s) => !s)}
        style={{ opacity: filterToday ? 1 : 0.65 }}
      >
        Today
      </SubtleButton>
      <SubtleButton
        onClick={() => setSortByDue((s) => !s)}
        style={{ opacity: sortByDue ? 1 : 0.65 }}
      >
        Sort: Due
      </SubtleButton>
      <IconButton onClick={() => setShowSettings((s) => !s)} title="Settings">
        <FaCog />
      </IconButton>
    </div>
  </div>

  {/* Responsive tweaks */}
  <style>{`
    @media (max-width: 768px) {
      .theme-toggle-mobile {
        display: none;
      }
      input#quick-add-input {
        width: 100% !important;
        flex: 1 1 100%;
      }
    }
  `}</style>
</GlassCard>


          {/* Main Layout */}
          <MainLayout>

            <LeftColumn>
              <ProjectSidebar projects={projects} selectedId={selectedProjectId} onSelect={setSelectedProjectId} onAddProject={addProject} onDeleteProject={deleteProject} />
            </LeftColumn>

            <CenterColumn>
              <GlassCard>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaTasks /> Tasks</h3>

                <Row style={{ marginTop: 8, gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 13, color: theme.subtleText }}>{selectedTaskIds.length} selected</div>
                  <SubtleButton onClick={bulkComplete} disabled={selectedTaskIds.length === 0}><FaCheck /> Complete</SubtleButton>
                  <SubtleButton onClick={bulkDelete} disabled={selectedTaskIds.length === 0}><FaTrashAlt /> Delete</SubtleButton>
                  <SubtleButton onClick={() => setSelectedTaskIds([])} disabled={selectedTaskIds.length === 0}>Clear</SubtleButton>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <SubtleButton onClick={undo} disabled={!canUndo}><FaUndo /> Undo</SubtleButton>
                    <SubtleButton onClick={redo} disabled={!canRedo}><FaRedo /> Redo</SubtleButton>
                    <SubtleButton onClick={() => exportData()}><FaSignOutAlt /> Export</SubtleButton>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <SubtleButton as="span"><FaFileImport /> Import</SubtleButton>
                      <input ref={importFileRef} type="file" accept="application/json" onChange={handleImportChange} style={{ display: 'none' }} />
                    </label>
                  </div>
                </Row>

                <div style={{ marginTop: 12 }}>
                  <AnimatePresence>
                    {filteredTasks.length === 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: theme.subtleText, padding: '12px 4px' }}>
                        {tasksStorage.length === 0 ? "Add a task to get started!" : "No tasks match your filter."}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
                    <AnimatePresence>
                      {filteredTasks.map((t) => (
                        <TaskItem
                          key={t.id}
                          task={t}
                          projectColor={projectColorMap[t.projectId]}
                          onToggle={toggleTask}
                          onDelete={(task) => { if (window.confirm("Delete task?")) deleteTask(task); }}
                          onEdit={(task) => setEditingTask(task)}
                          onToggleStar={toggleStar}
                          onToggleSelect={toggleSelectTask}
                          isSelected={selectedTaskIds.includes(t.id)}
                          isOverdue={isOverdue(t.dueDate) && !t.done}
                          compact={compact}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              </GlassCard>

            </CenterColumn>

            <RightColumn>
              <PomodoroTimer onComplete={handlePomodoroComplete} />
              <NotesPad />
              <DailyGoal tasks={tasksStorage} />
              <Row>
                <SubtleButton onClick={() => setShowStats(s => !s)} style={{ flex: 1, opacity: showStats ? 1 : 0.6 }}>{showStats ? "Hide Stats" : "Show Stats"}</SubtleButton>
                <SubtleButton onClick={() => setShowSettings(s => !s)} style={{ flex: 1, opacity: showSettings ? 1 : 0.6 }}>{showSettings ? "Hide Settings" : "Show Settings"}</SubtleButton>
              </Row>

              <AnimatePresence>{ showStats && <StatsPanel tasks={tasksStorage} streak={streak} /> }</AnimatePresence>
              <AnimatePresence>{ showSettings && <SettingsPanel themeMode={themeMode} setThemeMode={setThemeMode} notifyEnabled={notifyEnabled} setNotifyEnabled={setNotifyEnabled} compact={compact} setCompact={setCompact} /> }</AnimatePresence>
            </RightColumn>

          </MainLayout>

          {/* Footer credit */}
          <div style={{ fontSize: 14, color: theme.subtleText, padding: '16px 0' }}>Made with ❤️ by JayShinde.</div>

          {/* Modals */}
          <AnimatePresence>
            {editingTask && (
              <TaskDetailModal task={editingTask} projects={projects} onClose={() => setEditingTask(null)} onSave={(updatedTask) => { saveTask(updatedTask); setEditingTask(null); }} />
            )}
          </AnimatePresence>

          {/* Tablet Project Modal */}
          <AnimatePresence>
            {tabletProjectView && (
              <ModalBackdrop onClick={() => setTabletProjectView(false)} style={{ justifyContent: 'flex-start', alignItems: 'flex-start', background: 'rgba(0,0,0,0.28)' }}>
                <div style={{ padding: 18, paddingTop: 'calc(var(--nav-height-desktop) + 12px)', width: 320 }} onClick={(e) => e.stopPropagation()}>
                  <ProjectSidebar projects={projects} selectedId={selectedProjectId} onSelect={(id) => { setSelectedProjectId(id); setTabletProjectView(false); }} onAddProject={addProject} onDeleteProject={deleteProject} />
                </div>
              </ModalBackdrop>
            )}
          </AnimatePresence>

          {/* Mobile nav */}
          <MobileNav initial={{ y: 60 }} animate={{ y: 0 }}>
            <MobileNavButton $active={mobileView === 'tasks'} onClick={() => setMobileView('tasks')}><FaTasks /> Tasks</MobileNavButton>
            <MobileNavButton $active={mobileView === 'projects'} onClick={() => handleMobileNav('projects')}><FaProjectDiagram /> Projects</MobileNavButton>
            <MobileNavButton onClick={() => handleMobileNav('add')} style={{ background: theme.accentGradient, color: '#fff', padding: 10, borderRadius: 999, transform: 'translateY(-8px)', boxShadow: '0 8px 20px rgba(0,0,0,0.18)' }}><FaPlus /> Add</MobileNavButton>
            <MobileNavButton $active={mobileView === 'utils'} onClick={() => handleMobileNav('utils')}><FaClock /> Utils</MobileNavButton>
            <MobileNavButton $active={mobileView === 'settings'} onClick={() => handleMobileNav('settings')}><FaCog /> Settings</MobileNavButton>
          </MobileNav>

          {/* Mobile modal render */}
          <AnimatePresence>
            {mobileView !== 'tasks' && <RenderMobileModal />}
          </AnimatePresence>

        </AppContainer>
      </ThemeProvider>
    </ThemeProviderContext.Provider>
  );
}
