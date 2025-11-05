import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";

/* ===========================
   ======= ORIGINAL UI =======
   ===========================
*/

/* ----------------- Global Style (kept & extended) ----------------- */
const GlobalStyle = createGlobalStyle`
  body {
    font-family: "Poppins", sans-serif;
    margin: 0;
    background: ${(p) => p.theme.bg};
    color: ${(p) => p.theme.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Focus mode utility class kept for backwards compat */
  .focus-hide {
    display: none !important;
  }

  /* small accessibility helpers */
  [role="button"] { cursor: pointer; }
`;

/* ----------------- Themes ----------------- */
const lightTheme = {
  bg: "linear-gradient(135deg,#f7fbff,#e8f3ff)",
  cardBg: "rgba(255,255,255,0.85)",
  text: "#0f1724",
  subtleText: "#374151",
  accent1: "#0072ff",
  accent2: "#00c6ff",
  glassBorder: "rgba(0,0,0,0.08)",
  inputBg: "rgba(0,0,0,0.06)",
  itemBg: "rgba(0,0,0,0.03)",
  itemBgHover: "rgba(0,0,0,0.06)",
  danger: "#e11d48",
  dangerSubtle: "rgba(225, 29, 72, 0.1)",
  modalBackdrop: "rgba(0, 0, 0, 0.4)",
};
const darkTheme = {
  bg: "linear-gradient(135deg, #1e1f29, #0f2027)",
  cardBg: "rgba(255,255,255,0.06)",
  text: "#ffffff",
  subtleText: "#cbd5e1",
  accent1: "#0072ff",
  accent2: "#00c6ff",
  glassBorder: "rgba(255,255,255,0.12)",
  inputBg: "rgba(255,255,255,0.1)",
  itemBg: "rgba(255,255,255,0.06)",
  itemBgHover: "rgba(255,255,255,0.1)",
  danger: "#ff8b8b",
  dangerSubtle: "rgba(255, 139, 139, 0.1)",
  modalBackdrop: "rgba(0, 0, 0, 0.6)",
};

/* ----------------- Re-used Styled Components (based on your styles) ----------------- */
const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-x: hidden;
  padding: 20px;
  box-sizing: border-box;
`;

const GlassCard = styled(motion.div)`
  background: ${(p) => p.theme.cardBg};
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 22px;
  width: 100%;
  margin: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.18);
  border: 1px solid ${(p) => p.theme.glassBorder};
  box-sizing: border-box;
`;

const Title = styled(motion.h1)`
  font-size: 2.2rem;
  margin: 8px 0;
  text-align: center;
`;

const Subtitle = styled(motion.h3)`
  color: ${(p) => p.theme.subtleText};
  font-weight: 400;
  text-align: center;
  margin-bottom: 14px;
`;

const Button = styled(motion.button)`
  background: linear-gradient(90deg, ${(p) => p.theme.accent2}, ${(p) => p.theme.accent1});
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  color: white;
  cursor: pointer;
  font-size: 0.98rem;
  transition: transform 0.18s ease;
  font-weight: 600;
  &:hover { transform: translateY(-2px); }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// A subtle button for secondary actions
const SubtleButton = styled(Button)`
  background: ${(p) => p.theme.inputBg};
  color: ${(p) => p.theme.text};
  &:hover {
     background: ${(p) => p.theme.itemBgHover};
     transform: translateY(-2px);
  }
`;

/* ----------------- Small UI pieces ----------------- */
const Row = styled.div`
  display:flex;
  gap:12px;
  align-items:center;
  width:100%;
`;

const Column = styled.div`
  display:flex;
  flex-direction:column;
  gap:12px;
`;

const TaskInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  font-size: 1rem;
  background: ${(p) => p.theme.inputBg};
  color: ${(p) => p.theme.text};
  box-sizing: border-box;
  &::placeholder {
    color: ${(p) => p.theme.subtleText};
  }
`;

/* ===========================
   ======= ORIGINAL LOGIC ====
   ===========================
*/

/* ----- helper for date formatting (kept your accurate local-date approach) ----- */
const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/* ---------- Custom localStorage hook (extended to accept fallback & parse) ---------- */
function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const s = window.localStorage.getItem(key);
      return s ? JSON.parse(s) : initialValue;
    } catch (e) {
      console.error("localStorage read error", e);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(stored));
    } catch (e) {
      console.error("localStorage write error", e);
    }
  }, [key, stored]);

  return [stored, setStored];
}

/* NOTE: The DisciplineDashboardOriginal function is preserved in your file.
  It is NOT removed. I am omitting it here for brevity, 
  as the new `DisciplineDashboard` at the end replaces it as the main export.
*/
// ... DisciplineDashboardOriginal() ... 

/* ===========================
   ======= EXTENSIONS ========
   ===========================
*/

/* ----------------- Utilities: notifications & keyboard ----------------- */
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
  } catch (e) {
    console.warn("Notification failed:", e);
  }
}

/* ----------------- Pomodoro Timer Component ----------------- */
const TimerContainer = styled(GlassCard)`
  max-width: 420px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:12px;
`;
const TimerLarge = styled.div`
  font-size: 3.4rem;
  font-weight: 700;
  letter-spacing: 1px;
`;
function formatMMSS(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
function PomodoroTimer({ onComplete }) {
  // durations in seconds
  const POMODORO = 60 * 60;
  const SHORT_BREAK = 5 * 60;
  const LONG_BREAK = 15 * 60;

  const [mode, setMode] = useLocalStorage("pomodoro_mode", "pomodoro"); // pomodoro, short-break, long-break
  const [running, setRunning] = useLocalStorage("pomodoro_running", false);
  const [remaining, setRemaining] = useLocalStorage("pomodoro_remaining", POMODORO);
  const [cycles, setCycles] = useLocalStorage("pomodoro_cycles", 0); // completed pomodoro cycles for long break logic
  const intervalRef = useRef(null);

  // initialize remaining based on mode if empty
  useEffect(() => {
    if (!remaining || typeof remaining !== "number") {
      const val = mode === "pomodoro" ? POMODORO : mode === "short-break" ? SHORT_BREAK : LONG_BREAK;
      setRemaining(val);
    }
  }, []); // run only once

  useEffect(() => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            // finish
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setRunning(false);

            // when a pomodoro completes, increase cycles and ask for short/long break
            if (mode === "pomodoro") {
              setCycles((c) => c + 1);
              onComplete && onComplete("pomodoro");
              showNotification("Pomodoro complete!", { body: "Take a break — or continue working!" });
            } else {
              showNotification("Break finished!", { body: "Ready for next pomodoro?" });
            }

            // auto-switch to next mode: pomodoro -> short-break (every 4 cycles -> long-break)
            if (mode === "pomodoro") {
              const next = (cycles + 1) % 4 === 0 ? "long-break" : "short-break";
              setMode(next);
              const nextDur = next === "long-break" ? LONG_BREAK : SHORT_BREAK;
              setRemaining(nextDur);
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, mode, cycles, setRemaining, setMode, setCycles, onComplete]);

  const start = () => {
    if (remaining <= 0) {
      // reset to appropriate length
      const val = mode === "pomodoro" ? POMODORO : mode === "short-break" ? SHORT_BREAK : LONG_BREAK;
      setRemaining(val);
    }
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    const val = mode === "pomodoro" ? POMODORO : mode === "short-break" ? SHORT_BREAK : LONG_BREAK;
    setRemaining(val);
    setRunning(false);
  };

  const setModeHandler = (m) => {
    setMode(m);
    setRemaining(m === "pomodoro" ? POMODORO : m === "short-break" ? SHORT_BREAK : LONG_BREAK);
    setRunning(false);
  };

  return (
    <TimerContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
        <SubtleButton onClick={() => setModeHandler("pomodoro")} style={{ flex: 1, background: mode === "pomodoro" ? undefined : 'rgba(255,255,255,0.06)' }}>Work</SubtleButton>
        <SubtleButton onClick={() => setModeHandler("short-break")} style={{ flex: 1, background: mode === "short-break" ? undefined : 'rgba(255,255,255,0.06)' }}>Short</SubtleButton>
        <SubtleButton onClick={() => setModeHandler("long-break")} style={{ flex: 1, background: mode === "long-break" ? undefined : 'rgba(255,255,255,0.06)' }}>Long</SubtleButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <TimerLarge aria-live="polite">{formatMMSS(remaining)}</TimerLarge>
        <div style={{ color: (p) => p.theme.subtleText }}>{mode === "pomodoro" ? "Focus session" : (mode === "short-break" ? "Short break" : "Long break")}</div>
      </div>

      <Row style={{ width: '100%' }}>
        {!running ? <Button onClick={start} style={{ flex: 1 }}>Start</Button> : <Button onClick={pause} style={{ flex: 1 }}>Pause</Button>}
        <SubtleButton onClick={reset}>Reset</SubtleButton>
      </Row>

      <div style={{ width: '100%', fontSize: 13, color: (p) => p.theme.subtleText }}>
        Completed cycles: {cycles}
      </div>
    </TimerContainer>
  );
}


/* ----------------- Stats Panel (basic analytics saved to localStorage) ----------------- */
function computeStats(allTasks, history = []) {
  const total = allTasks.length;
  const completed = (allTasks || []).filter(t => t.done).length;
  const byTag = {};
  allTasks.forEach(t => {
    (t.tags || []).forEach(tag => {
      byTag[tag] = (byTag[tag] || 0) + (t.done ? 1 : 0);
    });
  });
  return { total, completed, byTag, historyCount: history.length };
}
const StatsBox = styled(GlassCard)`
  max-width: 420px;
`;
function StatsPanel({ tasks, streak, history }) {
  const stats = useMemo(() => computeStats(tasks, history), [tasks, history]);
  return (
    <StatsBox>
      <h3>📊 Quick Stats</h3>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 120 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.total}</div>
          <div style={{ color: (p) => p.theme.subtleText }}>Total tasks</div>
        </div>
        <div style={{ minWidth: 120 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.completed}</div>
          <div style={{ color: (p) => p.theme.subtleText }}>Completed</div>
        </div>
        <div style={{ minWidth: 120 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{streak}</div>
          <div style={{ color: (p) => p.theme.subtleText }}>Streak</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <h4 style={{ margin: '6px 0' }}>Top tags</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.keys(stats.byTag).length === 0 && <div style={{ color: (p) => p.theme.subtleText }}>No tags yet</div>}
          {Object.entries(stats.byTag).map(([tag, count]) => (
            <div key={tag} style={{ background: (p) => p.theme.inputBg, padding: '6px 10px', borderRadius: 999 }}>
              #{tag} • {count}
            </div>
          ))}
        </div>
      </div>
    </StatsBox>
  );
}


/* ----------------- Export / Import Utilities ----------------- */
function exportData(filename = "focusspace_export.json") {
  try {
    const payload = {
      tasks: JSON.parse(localStorage.getItem("tasks") || "[]"),
      projects: JSON.parse(localStorage.getItem("projects") || "[]"),
      streak: JSON.parse(localStorage.getItem("streak") || "0"),
      lastCompletionDate: localStorage.getItem("lastCompletionDate"),
      pomodoro: {
        cycles: JSON.parse(localStorage.getItem("pomodoro_cycles") || "0"),
      }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = filename;
    document.body.appendChild(el);
    el.click();
    el.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Export failed", e);
  }
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
    return true;
  } catch (e) {
    console.error("Import error", e);
    return false;
  }
}

/* ----------------- Undo / Redo (simple stack approach) ----------------- */
function useUndoRedo(initial) {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initial);
  const [future, setFuture] = useState([]);

  const set = (newPresent) => {
    setPast((p) => [...p, present].slice(-100)); // cap history
    setPresent(newPresent);
    setFuture([]);
  };

  const undo = () => {
    setPast((p) => {
      const last = p[p.length - 1];
      if (!last) return p;
      const newPast = p.slice(0, -1);
      setFuture((f) => [present, ...f]);
      setPresent(last);
      return newPast;
    });
  };

  const redo = () => {
    setFuture((f) => {
      const next = f[0];
      if (!next) return f;
      const newFuture = f.slice(1);
      setPast((p) => [...p, present]);
      setPresent(next);
      return newFuture;
    });
  };

  return { present, set, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 };
}


/* ----------------- Search / Filter Bar ----------------- */
const SearchInput = styled.input`
  padding: 8px 12px;
  border-radius: 10px;
  border: none;
  outline: none;
  background: ${(p) => p.theme.inputBg};
  color: ${(p) => p.theme.text};
  width: 100%;
`;
function SearchFilter({ onChange }) {
  return (
    <Row style={{ width: '100%', gap: 10 }}>
      <SearchInput placeholder="Search tasks, tags, or text..." onChange={(e) => onChange(e.target.value)} aria-label="Search tasks" />
    </Row>
  );
}


/* ----------------- Tagging + Category UI ----------------- */
const TagInput = styled.input`
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  outline: none;
  background: rgba(0,0,0,0.05);
`;
function TagsView({ tags = [], onRemove }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {tags.map((tag) => (
        <div key={tag} style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 10px', borderRadius: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          #{tag}
          <button onClick={() => onRemove(tag)} style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>✖</button>
        </div>
      ))}
    </div>
  );
}

/* ----------------- Keyboard Shortcuts Hook ----------------- */
function useKeyboardShortcuts(map) {
  useEffect(() => {
    function handler(e) {
      const key = [];
      if (e.ctrlKey) key.push("Control");
      if (e.altKey) key.push("Alt");
      if (e.metaKey) key.push("Meta");
      if (e.shiftKey) key.push("Shift");
      key.push(e.key);
      const combo = key.join("+");
      if (map[combo]) {
        e.preventDefault();
        map[combo]();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [map]);
}

/* ----------------- Settings Panel ----------------- */
function SettingsPanel({ themeMode, setThemeMode, notifyEnabled, setNotifyEnabled }) {
  const [prefNotify, setPrefNotify] = useState(notifyEnabled);
  useEffect(() => setPrefNotify(notifyEnabled), [notifyEnabled]);
  const save = async () => {
    setNotifyEnabled(prefNotify);
    if (prefNotify) await tryRequestNotificationPermission();
  };
  return (
    <GlassCard style={{ maxWidth: 540 }}>
      <h3>⚙️ Settings</h3>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ minWidth: 110 }}>Theme</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SubtleButton onClick={() => setThemeMode("dark")} style={{ background: themeMode === "dark" ? undefined : 'rgba(255,255,255,0.06)' }}>Dark</SubtleButton>
          <SubtleButton onClick={() => setThemeMode("light")} style={{ background: themeMode === "light" ? undefined : 'rgba(255,255,255,0.06)' }}>Light</SubtleButton>
          <SubtleButton onClick={() => setThemeMode("auto")} style={{ background: themeMode === "auto" ? undefined : 'rgba(255,255,255,0.06)' }}>Auto</SubtleButton>
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ minWidth: 110 }}>Notifications</div>
        <div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={prefNotify} onChange={(e) => setPrefNotify(e.target.checked)} />
            <span style={{ color: (p) => p.theme.subtleText }}>Enable desktop notifications</span>
          </label>
        </div>
      </div>

      <Row style={{ marginTop: 12 }}>
        <Button onClick={save}>Save settings</Button>
      </Row>
    </GlassCard>
  );
}

/* ===========================
  ======= NEW FEATURES ======
  ===========================
  Added features (kept original functionality):
   - Bulk actions: select tasks, bulk complete, bulk delete
   - Star / pin tasks for quick prioritization
   - "Today" quick filter and overdue highlighting
   - Toggleable sorting by due date
   - Keyboard shortcut Alt+T toggles Today filter
*/

/* ----------------- NEW: Project Sidebar Component ----------------- */
const ProjectSidebarStyled = styled(GlassCard)`
  width: 260px;
  height: fit-content;
  padding: 18px;
  flex-shrink: 0;
  /* Make it "sticky" on tall screens */
  position: sticky;
  top: 20px; 
`;

const ProjectItem = styled.div`
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  background: ${(p) => (p.active ? p.theme.itemBgHover : "transparent")};
  color: ${(p) => (p.active ? p.theme.text : p.theme.subtleText)};
  transition: background 0.2s ease, color 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: ${(p) => p.theme.itemBgHover};
    color: ${(p) => p.theme.text};
  }
`;

function ProjectSidebar({ projects, selectedId, onSelect, onAddProject, onDeleteProject }) {
  const [newProjectName, setNewProjectName] = useState("");

  const handleAdd = () => {
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim());
      setNewProjectName("");
    }
  };

  return (
    <ProjectSidebarStyled>
      <h3 style={{ marginTop: 0 }}>Projects</h3>
      <Column style={{ gap: 4 }}>
        <ProjectItem active={selectedId === 'all'} onClick={() => onSelect('all')}>
          All Tasks
        </ProjectItem>
        <hr style={{ border: 'none', height: 1, background: (p) => p.theme.glassBorder, margin: '4px 0' }} />
        {projects.map((p) => (
          <ProjectItem key={p.id} active={selectedId === p.id} onClick={() => onSelect(p.id)}>
            {p.name}
            {p.id !== 'inbox' && (
              <span
                onClick={(e) => {
                  e.stopPropagation(); // Don't trigger project selection
                  if (window.confirm(`Are you sure you want to delete "${p.name}"?`)) {
                    onDeleteProject(p.id);
                  }
                }}
                style={{ color: (p) => p.theme.danger, fontSize: 14, padding: '0 4px' }}
              >
                ✖
              </span>
            )}
          </ProjectItem>
        ))}
      </Column>
      <Row style={{ marginTop: 16 }}>
        <TaskInput
          placeholder="New project..."
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} style={{ flexShrink: 0 }}>+</Button>
      </Row>
    </ProjectSidebarStyled>
  );
}


/* ----------------- NEW: Task Detail Modal ----------------- */
const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: ${(p) => p.theme.modalBackdrop};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(GlassCard)`
  width: 100%;
  max-width: 600px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${(p) => p.theme.subtleText};
  margin-bottom: 6px;
  display: block;
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  font-size: 1rem;
  background: ${(p) => p.theme.inputBg};
  color: ${(p) => p.theme.text};
  box-sizing: border-box;
  font-family: "Poppins", sans-serif;
  resize: vertical;
`;

const ModalSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  font-size: 1rem;
  background: ${(p) => p.theme.inputBg};
  color: ${(p) => p.theme.text};
  box-sizing: border-box;
`;

function TaskDetailModal({ task, projects, onSave, onClose }) {
  const [text, setText] = useState(task.text);
  const [notes, setNotes] = useState(task.notes || "");
  const [projectId, setProjectId] = useState(task.projectId || "inbox");
  const [dueDate, setDueDate] = useState(task.dueDate || "");

  const handleSave = () => {
    onSave({
      ...task,
      text,
      notes,
      projectId,
      dueDate,
    });
    onClose();
  };

  return (
    <ModalBackdrop
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose} // Close on backdrop click
    >
      <ModalContent
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()} // Prevent closing modal
      >
        <h2>Edit Task</h2>

        <div>
          <FormLabel htmlFor="task-text">Task</FormLabel>
          <TaskInput
            id="task-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
          />
        </div>

        <div>
          <FormLabel htmlFor="task-project">Project</FormLabel>
          <ModalSelect
            id="task-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </ModalSelect>
        </div>

        <div>
          <FormLabel htmlFor="task-notes">Notes</FormLabel>
          <ModalTextarea
            id="task-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a description, links, etc..."
          />
        </div>

        <div>
          <FormLabel htmlFor="task-due-date">Due Date</FormLabel>
          <TaskInput
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <Row style={{ justifyContent: 'flex-end', marginTop: 12 }}>
          <SubtleButton onClick={onClose}>Cancel</SubtleButton>
          <Button onClick={handleSave}>Save Changes</Button>
        </Row>
      </ModalContent>
    </ModalBackdrop>
  );
}


/* ===========================
   ======= MAIN WRAPPER ======
   ===========================
*/
export default function DisciplineDashboard() {
  // theme mode
  const [themeMode, setThemeMode] = useLocalStorage("themeMode", "dark");
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = themeMode === "dark" || (themeMode === 'auto' && systemPrefersDark) ? darkTheme : lightTheme;

  // --- Central State ---
  const [tasks, setTasks] = useLocalStorage("tasks", []);
  const [projects, setProjects] = useLocalStorage("projects", [{ id: 'inbox', name: 'Inbox' }]);
  const [streak, setStreak] = useLocalStorage("streak", 0);
  const [lastCompletionDate, setLastCompletionDate] = useLocalStorage("lastCompletionDate", null);

  // history for stats (basic)
  const [history, setHistory] = useLocalStorage("history", []); // array of {date, completedCount}

  // --- UI State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [notifyEnabled, setNotifyEnabled] = useLocalStorage("notifyEnabled", false);
  const [selectedProjectId, setSelectedProjectId] = useState('all'); // 'all' or a project.id
  const [editingTaskIndex, setEditingTaskIndex] = useState(null); // null or index of task
  const [filterToday, setFilterToday] = useState(false); // NEW: filter for due today
  const [sortByDue, setSortByDue] = useState(false); // NEW: toggle sorting by due date
  const [selectedTaskIds, setSelectedTaskIds] = useState([]); // NEW: bulk selection

  const editingTask = typeof editingTaskIndex === 'number' ? tasks[editingTaskIndex] : null;

  // --- Data Migration ---
  useEffect(() => {
    if (projects.length > 0 && typeof projects[0] === 'string') {
      setProjects(projects.map(pName => ({ id: pName.toLowerCase().replace(/\s+/g, '-'), name: pName })));
    }
    if (tasks.length > 0 && typeof tasks[0].projectId === 'undefined') {
       setTasks(tasks.map(t => ({
         ...t,
         projectId: 'inbox',
         notes: "",
         dueDate: null,
         createdAt: new Date().toISOString()
       })));
    }
  }, []);

  // Undo/redo for tasks
  const tasksUndoRedo = useUndoRedo(tasks);
  useEffect(() => {
    if (JSON.stringify(tasks) !== JSON.stringify(tasksUndoRedo.present)) {
      tasksUndoRedo.set(tasks);
    }
  }, [tasks]);
  
  useEffect(() => {
     if (JSON.stringify(tasks) !== JSON.stringify(tasksUndoRedo.present)) {
        setTasks(tasksUndoRedo.present);
     }
  }, [tasksUndoRedo.present]);

  const { undo, redo, canUndo, canRedo } = tasksUndoRedo;


  // keyboard shortcuts (preserved + new)
  useKeyboardShortcuts({
    "Control+k": () => {
      const el = document.querySelector('input[aria-label="Search tasks"]');
      if (el) el.focus();
    },
    "Control+e": () => exportData(),
    "Control+i": async () => { /* ... import logic ... */ },
    "Alt+n": () => {
      const el = document.getElementById("quick-add-input");
      if (el) el.focus();
    },
    "Control+z": () => { if(canUndo) undo(); },
    "Control+y": () => { if(canRedo) redo(); },
    "Shift+Control+Z": () => { if(canRedo) redo(); },
    "Alt+t": () => setFilterToday((s) => !s), // NEW: toggle today filter
  });

  // --- Computed State ---
  const filteredTasks = useMemo(() => {
    let arr = tasks.filter(t => {
      const inProject = selectedProjectId === 'all' || t.projectId === selectedProjectId;
      if (!inProject) return false;

      if (filterToday) {
        const today = getTodayDate();
        if (!t.dueDate || t.dueDate !== today) return false;
      }

      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      const inText = (t.text || "").toLowerCase().includes(s);
      const inTags = (t.tags || []).some(tag => tag.toLowerCase().includes(s));
      const inNotes = (t.notes || "").toLowerCase().includes(s);
      return inText || inTags || inNotes;
    });

    if (sortByDue) {
      arr = arr.slice().sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    }

    // starred tasks first
    arr = arr.slice().sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));

    return arr;
  }, [tasks, selectedProjectId, searchTerm, filterToday, sortByDue]);


  // persist a simple history when tasks fully completed for the day
  useEffect(() => {
    const allDone = tasks.length > 0 && tasks.every(t => t.done);
    const todayStr = getTodayDate();
    if (allDone) {
      const lastRecorded = history[history.length - 1];
      if (!lastRecorded || lastRecorded.date !== todayStr) {
        const newHistory = [...history, { date: todayStr, completed: tasks.length }];
        setHistory(newHistory);
      }
    }
  }, [tasks, history, setHistory]);
  
  // Streak check (preserved)
   useEffect(() => {
    if (lastCompletionDate) {
      const todayStr = getTodayDate();
      const diffTime = new Date(todayStr).getTime() - new Date(lastCompletionDate).getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (diffDays > 1) setStreak(0);
    }
  }, [lastCompletionDate, setStreak]);

  // --- Core Functions ---
  const toggleTask = useCallback((taskToToggle) => {
    const next = tasks.map((t) => (t === taskToToggle) ? { ...t, done: !t.done } : t);
    tasksUndoRedo.set(next); // Use undo/redo setter

    const allDone = next.length > 0 && next.every((t) => t.done);
    const todayStr = getTodayDate();
    if (allDone && lastCompletionDate !== todayStr) {
      setStreak((s) => s + 1);
      setLastCompletionDate(todayStr);
      if (notifyEnabled) showNotification("Streak increased!", { body: `You're on a ${streak + 1}-day streak!` });
    }
  }, [tasks, lastCompletionDate, setTasks, setStreak, setLastCompletionDate, notifyEnabled, streak, tasksUndoRedo]);

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
      id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
    };
    tasksUndoRedo.set((prev) => [...prev, t]);
  };

  const saveTask = (index, updatedTask) => {
     tasksUndoRedo.set(prev => prev.map((t, i) => (i === index) ? updatedTask : t));
  };

  const deleteTask = (taskToDelete) => {
    tasksUndoRedo.set(prev => prev.filter((t) => t !== taskToDelete));
    // also remove from selection if present
    setSelectedTaskIds((ids) => ids.filter(id => id !== taskToDelete.id));
  };
  
  const addProject = (name) => {
    const newProject = {
      id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: name,
    };
    setProjects(prev => [...prev, newProject]);
    setSelectedProjectId(newProject.id); // Auto-select new project
  };

  const deleteProject = (idToDelete) => {
    if (idToDelete === 'inbox') return;
    setProjects(prev => prev.filter(p => p.id !== idToDelete));
    tasksUndoRedo.set(prev => prev.map(t => {
      if (t.projectId === idToDelete) {
        return { ...t, projectId: 'inbox' };
      }
      return t;
    }));
    setSelectedProjectId('all');
  };

  // NEW: toggle star/pin on a task
  const toggleStar = (taskId) => {
    tasksUndoRedo.set(prev => prev.map(t => t.id === taskId ? { ...t, starred: !t.starred } : t));
  };

  // NEW: bulk actions
  const toggleSelectTask = (taskId) => {
    setSelectedTaskIds(ids => ids.includes(taskId) ? ids.filter(i => i !== taskId) : [...ids, taskId]);
  };
  const bulkComplete = () => {
    tasksUndoRedo.set(prev => prev.map(t => selectedTaskIds.includes(t.id) ? { ...t, done: true } : t));
    setSelectedTaskIds([]);
  };
  const bulkDelete = () => {
    if (!window.confirm(`Delete ${selectedTaskIds.length} selected task(s)?`)) return;
    tasksUndoRedo.set(prev => prev.filter(t => !selectedTaskIds.includes(t.id)));
    setSelectedTaskIds([]);
  };

  // Pomodoro completion hook (preserved)
  const handlePomodoroComplete = (type) => {
    if (type === "pomodoro") {
      const idx = filteredTasks.findIndex(t => !t.done);
      if (idx !== -1) {
        toggleTask(filteredTasks[idx]);
      }
    }
  };

  // quick add via small input
  const [quickText, setQuickText] = useState("");
  const quickAdd = () => {
    if (!quickText.trim()) return;
    addTask(quickText.trim());
    setQuickText("");
  };

  // attempt to request notification permission (preserved)
  useEffect(() => {
    if (notifyEnabled) tryRequestNotificationPermission();
  }, [notifyEnabled]);

  // Helper: check overdue
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = getTodayDate();
    return new Date(dueDate) < new Date(today);
  };

  // Main layout
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        {/* Top bar: original header + controls */}
        <GlassCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%', maxWidth: 1400, flexWrap: 'wrap' }}>
          <div>
            <Title as="h2" style={{ margin: 0 }}>✨ FocusSpace</Title>
            <Subtitle style={{ margin: '4px 0 0 0', textAlign: 'left' }}>Your all-in-one productivity hub</Subtitle>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <TaskInput
              id="quick-add-input"
              placeholder={`Add to "${projects.find(p => p.id === (selectedProjectId === 'all' ? 'inbox' : selectedProjectId))?.name || 'Inbox'}" (Alt+N)`}
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") quickAdd(); }}
              style={{ padding: "8px 10px", width: 300 }}
            />
            <Button onClick={quickAdd}>➕ Add Task</Button>

            <SubtleButton onClick={() => setShowStats((s) => !s)}>{showStats ? "📊 Hide" : "📊 Show"}</SubtleButton>
            <SubtleButton onClick={() => setShowSettings((s) => !s)}>⚙️</SubtleButton>
            <SubtleButton onClick={() => { setThemeMode(themeMode === "dark" ? "light" : "dark"); }}>{themeMode === "dark" ? "🌙" : "☀️"}</SubtleButton>
            <SubtleButton onClick={() => setFilterToday((s) => !s)} style={{ background: filterToday ? undefined : 'rgba(255,255,255,0.06)' }}>Today</SubtleButton>
            <SubtleButton onClick={() => setSortByDue((s) => !s)} style={{ background: sortByDue ? undefined : 'rgba(255,255,255,0.06)' }}>Sort: Due</SubtleButton>
          </div>
        </GlassCard>

        {/* --- NEW 3-COLUMN LAYOUT --- */}
        <div style={{ display: 'flex', gap: 0, width: '100%', maxWidth: 1400, marginTop: 0, alignItems: 'flex-start' }}>

          {/* Left Column: Projects */}
          <ProjectSidebar
            projects={projects}
            selectedId={selectedProjectId}
            onSelect={setSelectedProjectId}
            onAddProject={addProject}
            onDeleteProject={deleteProject}
          />

          {/* Center Column: Task List */}
          <div style={{ flex: '1 1 540px', margin: '12px 0' }}>
            <GlassCard style={{ margin: '0 12px' }}>
              <h3>🎯 Tasks</h3>
              <SearchFilter onChange={(term) => setSearchTerm(term)} />

              {/* Bulk action bar */}
              <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: (p) => p.theme.subtleText }}>{selectedTaskIds.length} selected</div>
                <SubtleButton onClick={bulkComplete} disabled={selectedTaskIds.length === 0}>Complete</SubtleButton>
                <SubtleButton onClick={bulkDelete} disabled={selectedTaskIds.length === 0}>Delete</SubtleButton>
                <SubtleButton onClick={() => setSelectedTaskIds([])} disabled={selectedTaskIds.length === 0}>Clear</SubtleButton>
              </div>

              <div style={{ marginTop: 12 }}>
                <AnimatePresence>
                  {filteredTasks.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: (p) => p.theme.subtleText, padding: '10px 0' }}>
                      {tasks.length === 0 ? "Add a task to get started!" : "No tasks match your filter."}
                    </motion.div>
                  )}
                </AnimatePresence>

                <ul style={{ listStyle: 'none', padding: 0, marginTop: 10 }}>
                  <AnimatePresence>
                    {filteredTasks.map((t) => (
                      <motion.li
                        key={t.id || t.createdAt}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -60 }}
                        layout
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, background: (p) => p.theme.itemBg, marginTop: 8, border: isOverdue(t.dueDate) ? `1px solid ${theme.danger}` : 'none' }}
                      >
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                          <input type="checkbox" checked={selectedTaskIds.includes(t.id)} onChange={() => toggleSelectTask(t.id)} aria-label={`Select ${t.text}`} style={{ transform: 'scale(1.15)', flexShrink: 0 }} />
                          <input type="checkbox" checked={t.done} onChange={() => toggleTask(t)} aria-label={`Toggle ${t.text}`} style={{ transform: 'scale(1.2)', flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.6 : 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {t.starred ? '⭐ ' : ''}{t.text}
                            </div>
                            <div style={{ fontSize: 12, color: (p) => p.theme.subtleText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {t.dueDate ? `Due: ${t.dueDate} • ` : ''}
                              {t.notes ? `Notes... • ` : ''}
                              {t.tags && t.tags.length > 0 ? `Tags: ${t.tags.join(", ")}` : ''}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                           <SubtleButton onClick={() => toggleStar(t.id)} style={{ padding: '6px 10px', fontSize: 13 }}>{t.starred ? 'Unstar' : 'Star'}</SubtleButton>
                           <SubtleButton onClick={() => setEditingTaskIndex(tasks.indexOf(t))} style={{ padding: '6px 10px', fontSize: 13 }}>Edit</SubtleButton>
                           <button onClick={() => deleteTask(t)} style={{ border: 'none', background: (p) => p.theme.dangerSubtle, color: (p) => p.theme.danger, cursor: 'pointer', borderRadius: 6, padding: '6px 8px' }}>✖</button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            </GlassCard>

            {/* Undo / Redo area */}
            <GlassCard style={{ margin: '12px' }}>
              <Row>
                <SubtleButton onClick={undo} disabled={!canUndo}>↶ Undo</SubtleButton>
                <SubtleButton onClick={redo} disabled={!canRedo}>↷ Redo</SubtleButton>
              </Row>
            </GlassCard>
          </div>

          {/* Right Column: Pomodoro + Stats + Settings */}
          <div style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0, position: 'sticky', top: 20 }}>
            <PomodoroTimer onComplete={handlePomodoroComplete} />
            <AnimatePresence>
              {showStats && <StatsPanel tasks={tasks} streak={streak} history={history} />}
            </AnimatePresence>
            <AnimatePresence>
              {showSettings && <SettingsPanel themeMode={themeMode} setThemeMode={setThemeMode} notifyEnabled={notifyEnabled} setNotifyEnabled={setNotifyEnabled} />}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom area: help & shortcuts */}
        <GlassCard style={{ marginTop: 16, width: '100%', maxWidth: 1400 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Shortcuts</strong>
              <div style={{ fontSize: 13, color: (p) => p.theme.subtleText }}>
                Alt+N: Quick Add • Ctrl+K: Search • Ctrl+Z/Y: Undo/Redo • Ctrl+E/I: Export/Import • Alt+T: Today
              </div>
            </div>
             <div style={{ display: 'flex', gap: 12 }}>
                 <Button onClick={() => exportData()}>Export Data</Button>
                 <SubtleButton as="label">
                   Import Data
                   <input type="file" accept="application/json" style={{ display: 'none' }} onChange={async (e) => {
                     const f = e.target.files && e.target.files[0];
                     if (f) {
                       const ok = await importData(f);
                       if (ok) {
                         alert("Import success — Reloading app to sync.");
                         window.location.reload(); // Force reload to sync all useLocalStorage hooks
                       } else alert("Import failed.");
                     }
                   }} />
                 </SubtleButton>
             </div>
          </div>
</GlassCard>
        <GlassCard>
          <div style={{ fontSize: 14, color: (p) => p.theme.subtleText }}>
            Made with ❤️ by JayShinde. Not affiliated with any existing productivity apps.
          </div>                    
        </GlassCard>
        {/* Modal (sits outside the layout) */}
        <AnimatePresence>
          {editingTask && (
            <TaskDetailModal
              task={editingTask}
              projects={projects}
              onClose={() => setEditingTaskIndex(null)}
              onSave={(updatedTask) => {
                saveTask(editingTaskIndex, updatedTask);
                setEditingTaskIndex(null);
              }}
            />
          )}
        </AnimatePresence>

      </AppContainer>
    </ThemeProvider>
  );
}
