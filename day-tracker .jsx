import { useState, useEffect, useCallback } from "react";

const PIXEL_FONT = "'Press Start 2P', monospace";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0a; font-family: 'Press Start 2P', monospace; }

  .scanline {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px);
    pointer-events: none; z-index: 999;
  }

  .app { min-height: 100vh; background: #0a0a0a; color: #e0e0e0; padding: 36px 20px; max-width: 660px; margin: 0 auto; }

  .sync-bar {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 8px; margin-bottom: 20px; font-size: 7px;
  }
  .sync-dot { width: 8px; height: 8px; border-radius: 0; flex-shrink: 0; }
  .sync-dot.synced { background: #00ff88; box-shadow: 0 0 6px #00ff88; }
  .sync-dot.syncing { background: #ff8800; box-shadow: 0 0 6px #ff8800; animation: blink 0.6s steps(1) infinite; }
  .sync-dot.error { background: #ff4444; }
  .sync-label { color: #333; letter-spacing: 2px; }

  .header { text-align: center; margin-bottom: 36px; }
  .title { font-size: 13px; color: #00ff88; letter-spacing: 2px; text-shadow: 0 0 12px #00ff8866; margin-bottom: 20px; }
  .day-counter { font-size: 64px; color: #fff; text-shadow: 0 0 24px #00ff8844; line-height: 1; margin-bottom: 10px; }
  .day-label { font-size: 9px; color: #444; letter-spacing: 4px; }
  .date-display { font-size: 9px; color: #555; margin-top: 14px; letter-spacing: 1px; }

  .streak-bar { display: flex; justify-content: center; gap: 20px; margin-top: 20px; flex-wrap: wrap; }
  .streak-block { background: #111; border: 2px solid #1a1a1a; padding: 12px 16px; text-align: center; min-width: 110px; }
  .streak-block.hot { border-color: #ff8800; box-shadow: 0 0 10px #ff880033; }
  .streak-num { font-size: 26px; color: #fff; margin-bottom: 6px; }
  .streak-block.hot .streak-num { color: #ff8800; text-shadow: 0 0 10px #ff880066; }
  .streak-lbl { font-size: 7px; color: #444; letter-spacing: 2px; }
  .streak-icon { font-size: 16px; margin-bottom: 4px; display: block; }

  .divider { border: none; border-top: 2px solid #1a1a1a; margin: 28px 0; }
  .section-label { font-size: 9px; color: #00ff88; letter-spacing: 3px; margin-bottom: 16px; opacity: 0.85; }

  .add-form { margin-bottom: 28px; }
  .add-row { display: flex; gap: 8px; margin-bottom: 8px; }
  .pixel-input {
    flex: 1; background: #111; border: 2px solid #222;
    color: #e0e0e0; font-family: 'Press Start 2P', monospace;
    font-size: 10px; padding: 14px 12px; outline: none; transition: border-color 0.1s;
  }
  .pixel-input:focus { border-color: #00ff88; box-shadow: 0 0 8px #00ff8822; }
  .pixel-input::placeholder { color: #2e2e2e; }
  .note-input {
    width: 100%; background: #0d0d0d; border: 2px solid #1a1a1a;
    color: #888; font-family: 'Press Start 2P', monospace;
    font-size: 9px; padding: 10px 12px; outline: none;
    resize: none; height: 56px; transition: border-color 0.1s; line-height: 1.8;
  }
  .note-input:focus { border-color: #00ff8844; }
  .note-input::placeholder { color: #252525; }

  .pixel-btn {
    background: #00ff88; color: #000; border: none;
    font-family: 'Press Start 2P', monospace; font-size: 9px;
    padding: 14px 16px; cursor: pointer; transition: background 0.1s, transform 0.05s; white-space: nowrap;
  }
  .pixel-btn:hover { background: #00ffaa; }
  .pixel-btn:active { transform: scale(0.96); }
  .pixel-btn.ghost { background: transparent; color: #555; border: 2px solid #1e1e1e; font-size: 8px; padding: 8px 10px; }
  .pixel-btn.ghost:hover { color: #ff4444; border-color: #ff444433; background: #ff444411; }
  .pixel-btn.icon-btn { background: transparent; color: #333; border: none; font-size: 11px; padding: 6px 8px; line-height: 1; }
  .pixel-btn.icon-btn:hover { color: #00ff88; }

  .activity-list { display: flex; flex-direction: column; gap: 6px; }
  .activity-item { background: #111; border: 2px solid #1a1a1a; transition: border-color 0.15s; cursor: pointer; user-select: none; }
  .activity-item:hover { border-color: #2a2a2a; }
  .activity-item.done { border-color: #00ff8833; background: #0c1a12; }
  .activity-item.expanded { border-color: #00ff8855; }
  .item-main { display: flex; align-items: center; gap: 12px; padding: 16px 14px; }
  .pixel-checkbox { width: 22px; height: 22px; min-width: 22px; border: 2px solid #333; background: transparent; display: flex; align-items: center; justify-content: center; transition: all 0.1s; flex-shrink: 0; }
  .activity-item.done .pixel-checkbox { border-color: #00ff88; background: #00ff88; }
  .checkmark { font-size: 12px; color: #000; font-weight: bold; display: none; }
  .activity-item.done .checkmark { display: block; }
  .item-body { flex: 1; min-width: 0; }
  .activity-name { font-size: 10px; color: #bbb; letter-spacing: 1px; transition: color 0.15s; display: block; margin-bottom: 4px; word-break: break-word; }
  .activity-item.done .activity-name { color: #00ff8877; text-decoration: line-through; text-decoration-color: #00ff8844; }
  .item-note-preview { font-size: 8px; color: #383838; letter-spacing: 0.5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .activity-item.done .item-note-preview { color: #2a2a2a; }
  .item-actions { display: flex; gap: 4px; align-items: center; flex-shrink: 0; }
  .note-panel { border-top: 2px solid #1a1a1a; padding: 10px 14px 14px; background: #0d0d0d; }
  .note-panel-label { font-size: 7px; color: #333; letter-spacing: 2px; margin-bottom: 8px; }
  .note-display { font-size: 9px; color: #555; line-height: 2; letter-spacing: 0.5px; white-space: pre-wrap; word-break: break-word; }
  .note-edit-area { display: flex; flex-direction: column; gap: 6px; }

  .progress-section { margin-top: 32px; }
  .progress-bar-bg { background: #1a1a1a; height: 10px; border: 2px solid #222; margin: 14px 0 10px; overflow: hidden; }
  .progress-bar-fill { height: 100%; background: #00ff88; box-shadow: 0 0 10px #00ff8866; transition: width 0.35s; }
  .progress-row { display: flex; justify-content: space-between; align-items: center; }
  .progress-text { font-size: 9px; color: #444; letter-spacing: 2px; }
  .progress-count { font-size: 9px; color: #333; }

  .empty-state { text-align: center; padding: 36px 16px; color: #252525; font-size: 9px; letter-spacing: 2px; line-height: 3; border: 2px dashed #191919; }

  .history-section { margin-top: 32px; }
  .history-grid { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
  .history-dot { width: 18px; height: 18px; border: 2px solid #1a1a1a; background: #111; cursor: default; transition: transform 0.1s; }
  .history-dot.completed { background: #00ff88; border-color: #00ff88; box-shadow: 0 0 6px #00ff8844; }
  .history-dot.partial { background: #ff8800; border-color: #ff8800; box-shadow: 0 0 6px #ff880033; }
  .history-dot:hover { transform: scale(1.3); z-index: 2; }

  .pixel-tag { display: inline-block; font-size: 7px; padding: 3px 7px; background: #111; border: 1px solid #00ff8833; color: #00ff8855; letter-spacing: 1px; margin-left: 10px; }

  .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 24px; }
  .loading-title { font-size: 10px; color: #00ff88; letter-spacing: 3px; }
  .loading-bar-bg { width: 200px; height: 8px; border: 2px solid #222; background: #111; overflow: hidden; }
  .loading-bar-fill { height: 100%; background: #00ff88; animation: loadpulse 1.2s ease-in-out infinite; }
  .loading-sub { font-size: 7px; color: #333; letter-spacing: 2px; }

  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes loadpulse { 0%{width:0%} 60%{width:80%} 100%{width:95%} }

  .cursor { display: inline-block; width: 10px; height: 16px; background: #00ff88; margin-left: 5px; animation: blink 1s steps(1) infinite; vertical-align: middle; }
`;

const todayKey = () => new Date().toISOString().slice(0, 10);

const STORAGE_KEY = "daytracker-data";

async function cloudLoad() {
  try {
    const result = await window.storage.get(STORAGE_KEY);
    if (result && result.value) return JSON.parse(result.value);
  } catch {}
  return null;
}

async function cloudSave(data) {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch { return false; }
}

export default function DayTracker() {
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("synced"); // synced | syncing | error
  const [activities, setActivities] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [history, setHistory] = useState({});
  const [input, setInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState("");

  // Load from cloud on mount
  useEffect(() => {
    (async () => {
      const data = await cloudLoad();
      if (data) {
        setActivities(data.activities || []);
        setHistory(data.history || {});
        setStartDate(data.startDate ? new Date(data.startDate) : new Date());
      } else {
        const now = new Date();
        setStartDate(now);
        await cloudSave({ activities: [], history: {}, startDate: now.toISOString() });
      }
      setLoading(false);
    })();
  }, []);

  // Save to cloud whenever data changes
  const save = useCallback(async (acts, hist, sd) => {
    setSyncStatus("syncing");
    const ok = await cloudSave({
      activities: acts,
      history: hist,
      startDate: sd ? sd.toISOString() : new Date().toISOString()
    });
    setSyncStatus(ok ? "synced" : "error");
  }, []);

  // Track history whenever activities change
  useEffect(() => {
    if (loading || !startDate || activities.length === 0) return;
    const key = todayKey();
    const done = activities.filter(a => a.done).length;
    const pct = Math.round((done / activities.length) * 100);
    const newHistory = { ...history, [key]: pct };
    setHistory(newHistory);
    save(activities, newHistory, startDate);
  }, [activities]);

  const dayCount = startDate
    ? Math.max(1, Math.floor((Date.now() - startDate.getTime()) / 86400000) + 1)
    : 1;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "short", day: "numeric"
  }).toUpperCase();

  const streak = (() => {
    let count = 0;
    const d = new Date();
    while (true) {
      const k = d.toISOString().slice(0, 10);
      const v = history[k];
      if (v === undefined || v === 0) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  const bestStreak = (() => {
    const keys = Object.keys(history).sort();
    let best = 0, cur = 0, prev = null;
    for (const k of keys) {
      if (history[k] > 0) {
        if (prev) {
          const diff = (new Date(k) - new Date(prev)) / 86400000;
          cur = diff === 1 ? cur + 1 : 1;
        } else { cur = 1; }
        best = Math.max(best, cur);
        prev = k;
      } else { cur = 0; prev = null; }
    }
    return best;
  })();

  const addActivity = () => {
    const text = input.trim();
    if (!text) return;
    const newActs = [...activities, { id: Date.now(), text, done: false, note: noteInput.trim() }];
    setActivities(newActs);
    setInput(""); setNoteInput("");
  };

  const toggle = (id, e) => {
    e.stopPropagation();
    setActivities(prev => prev.map(a => a.id === id ? { ...a, done: !a.done } : a));
  };

  const remove = (id, e) => {
    e.stopPropagation();
    setActivities(prev => prev.filter(a => a.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
    setEditingNoteId(null);
  };

  const startEditNote = (a, e) => {
    e.stopPropagation();
    setEditingNoteId(a.id);
    setEditNoteText(a.note || "");
  };

  const saveNote = (id, e) => {
    e.stopPropagation();
    setActivities(prev => prev.map(a => a.id === id ? { ...a, note: editNoteText.trim() } : a));
    setEditingNoteId(null);
  };

  const doneCount = activities.filter(a => a.done).length;
  const total = activities.length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    const k = d.toISOString().slice(0, 10);
    return { key: k, val: history[k] ?? -1 };
  });

  const syncLabel = syncStatus === "synced" ? "SYNCED" : syncStatus === "syncing" ? "SYNCING..." : "SYNC ERR";

  if (loading) {
    return (
      <>
        <style>{style}</style>
        <div className="app">
          <div className="loading-screen">
            <div className="loading-title">// DAY TRACKER</div>
            <div className="loading-bar-bg"><div className="loading-bar-fill" /></div>
            <div className="loading-sub">LOADING YOUR DATA...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{style}</style>
      <div className="scanline" />
      <div className="app">

        <div className="sync-bar">
          <div className={`sync-dot ${syncStatus}`} />
          <span className="sync-label">{syncLabel}</span>
        </div>

        <div className="header">
          <div className="title">// DAY TRACKER <span className="cursor" /></div>
          <div className="day-counter">{String(dayCount).padStart(3, "0")}</div>
          <div className="day-label">DAYS TRACKED</div>
          <div className="date-display">{today}</div>
          <div className="streak-bar">
            <div className={`streak-block ${streak > 2 ? "hot" : ""}`}>
              <span className="streak-icon">{streak > 2 ? "🔥" : "⚡"}</span>
              <div className="streak-num">{streak}</div>
              <div className="streak-lbl">CUR STREAK</div>
            </div>
            <div className="streak-block">
              <span className="streak-icon">🏆</span>
              <div className="streak-num">{bestStreak}</div>
              <div className="streak-lbl">BEST STREAK</div>
            </div>
          </div>
        </div>

        <hr className="divider" />

        <div className="section-label">&gt; ADD ACTIVITY</div>
        <div className="add-form">
          <div className="add-row">
            <input
              className="pixel-input"
              placeholder="TYPE TASK NAME..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addActivity()}
              maxLength={60}
            />
            <button className="pixel-btn" onClick={addActivity}>+ ADD</button>
          </div>
          <textarea
            className="note-input"
            placeholder="OPTIONAL NOTE / DETAILS..."
            value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            maxLength={200}
          />
        </div>

        <div className="section-label">
          &gt; TASKS
          {total > 0 && <span className="pixel-tag">{doneCount}/{total}</span>}
        </div>

        <div className="activity-list">
          {activities.length === 0 ? (
            <div className="empty-state">NO TASKS YET<br />ADD YOUR FIRST ACTIVITY<br />ABOVE</div>
          ) : (
            activities.map(a => {
              const isExpanded = expandedId === a.id;
              const isEditingNote = editingNoteId === a.id;
              return (
                <div key={a.id} className={`activity-item ${a.done ? "done" : ""} ${isExpanded ? "expanded" : ""}`}>
                  <div className="item-main" onClick={() => toggleExpand(a.id)}>
                    <div className="pixel-checkbox" onClick={e => toggle(a.id, e)}>
                      <span className="checkmark">✓</span>
                    </div>
                    <div className="item-body">
                      <span className="activity-name">{a.text.toUpperCase()}</span>
                      {a.note && !isExpanded && <div className="item-note-preview">{a.note}</div>}
                    </div>
                    <div className="item-actions">
                      <button className="pixel-btn icon-btn" onClick={e => { e.stopPropagation(); toggleExpand(a.id); }}>
                        {isExpanded ? "▲" : "▼"}
                      </button>
                      <button className="pixel-btn ghost" onClick={e => remove(a.id, e)}>✕</button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="note-panel" onClick={e => e.stopPropagation()}>
                      <div className="note-panel-label">&gt; NOTE</div>
                      {isEditingNote ? (
                        <div className="note-edit-area">
                          <textarea className="note-input" value={editNoteText} onChange={e => setEditNoteText(e.target.value)} maxLength={200} autoFocus />
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button className="pixel-btn" style={{ fontSize: "8px", padding: "10px 14px" }} onClick={e => saveNote(a.id, e)}>SAVE</button>
                            <button className="pixel-btn ghost" onClick={e => { e.stopPropagation(); setEditingNoteId(null); }}>CANCEL</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <div className="note-display" style={{ flex: 1 }}>
                            {a.note || <span style={{ color: "#252525" }}>NO NOTE YET...</span>}
                          </div>
                          <button className="pixel-btn ghost" style={{ fontSize: "7px", padding: "7px 10px", whiteSpace: "nowrap" }} onClick={e => startEditNote(a, e)}>EDIT</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {total > 0 && (
          <div className="progress-section">
            <div className="section-label">&gt; TODAY'S PROGRESS</div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="progress-row">
              <div className="progress-count">{doneCount} DONE</div>
              <div className="progress-text">{pct}%</div>
            </div>
          </div>
        )}

        <div className="history-section">
          <div className="section-label">&gt; LAST 30 DAYS</div>
          <div className="history-grid">
            {last30.map(({ key, val }) => (
              <div
                key={key}
                className={`history-dot ${val >= 100 ? "completed" : val > 0 ? "partial" : ""}`}
                title={val >= 0 ? `${key}: ${val}%` : key}
              />
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
