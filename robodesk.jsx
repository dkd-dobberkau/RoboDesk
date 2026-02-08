import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "robodesk-contacts";
const TAGS_KEY = "robodesk-tags";
const THEME_KEY = "robodesk-theme";

const DEFAULT_TAGS = [
  "TYPO3", "dkd", "Client", "Partner", "Community", "Speaker", "Friend", "Family", "Prospect", "Vendor"
];

const RELATIONSHIP_TYPES = ["Professional", "Personal", "Community", "Client", "Partner"];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function daysAgo(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
}

function getFollowUpUrgency(contact) {
  if (!contact.nextFollowUp) return "none";
  const days = daysAgo(contact.nextFollowUp);
  if (days === null) return "none";
  if (days > 7) return "overdue";
  if (days > 0) return "due";
  if (days >= -3) return "soon";
  return "upcoming";
}

function stringToColor(str) {
  const colors = [
    "#2a6b5a", "#b05e3a", "#3a6b9d", "#6d5a8f", "#8b6534",
    "#4a7a4a", "#7a3a5a", "#3a5a6d", "#8a5a2a", "#5a7a6d",
    "#6b4a5a", "#4a6b7a", "#7a6b3a", "#5a4a7a", "#6b7a4a"
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ── CSV HELPERS ──
const CSV_HEADERS = ["Name","Email","Phone","Company","Role","Location","LinkedIn","Website","Notes","Tags","Relationship Type","Next Follow-Up","Last Contact","Created At"];
const CSV_FIELDS = ["name","email","phone","company","role","location","linkedin","website","notes","tags","relationshipType","nextFollowUp","lastContact","createdAt"];

function escapeCsvField(val) {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function contactToCsvRow(c) {
  return CSV_FIELDS.map(f => {
    if (f === "tags") return escapeCsvField((c.tags || []).join(";"));
    return escapeCsvField(c[f] || "");
  }).join(",");
}

function exportCsv(contacts) {
  const rows = [CSV_HEADERS.join(","), ...contacts.map(contactToCsvRow)];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `robodesk-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { fields.push(current); current = ""; }
      else current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function importCsv(text, existingContacts) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { imported: [], skipped: 0, newTags: [] };
  const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
  const headerMap = {};
  CSV_HEADERS.forEach((h, i) => { headerMap[h.toLowerCase()] = CSV_FIELDS[i]; });
  const fieldIndices = headers.map(h => headerMap[h] || null);

  const existingEmails = new Set(existingContacts.map(c => (c.email || "").toLowerCase()).filter(Boolean));
  const existingNames = new Set(existingContacts.map(c => (c.name || "").toLowerCase()).filter(Boolean));
  const imported = [];
  let skipped = 0;
  const newTags = new Set();

  for (let i = 1; i < lines.length; i++) {
    const vals = parseCsvLine(lines[i]);
    const contact = { id: generateId(), createdAt: new Date().toISOString(), interactions: [], tags: [] };
    fieldIndices.forEach((field, idx) => {
      if (!field || idx >= vals.length) return;
      const val = vals[idx].trim();
      if (field === "tags") {
        contact.tags = val ? val.split(";").map(t => t.trim()).filter(Boolean) : [];
        contact.tags.forEach(tag => newTags.add(tag));
      } else {
        contact[field] = val || "";
      }
    });
    if (!contact.name) continue;
    const emailLower = (contact.email || "").toLowerCase();
    const nameLower = contact.name.toLowerCase();
    if ((emailLower && existingEmails.has(emailLower)) || existingNames.has(nameLower)) {
      skipped++;
      continue;
    }
    if (emailLower) existingEmails.add(emailLower);
    existingNames.add(nameLower);
    imported.push(contact);
  }
  return { imported, skipped, newTags: [...newTags] };
}

// ── VCF HELPERS ──
function escapeVcf(val) {
  if (!val) return "";
  return val.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function contactToVcard(c) {
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];
  if (c.name) lines.push("FN:" + escapeVcf(c.name));
  if (c.email) lines.push("EMAIL:" + c.email);
  if (c.phone) lines.push("TEL:" + c.phone);
  if (c.company) lines.push("ORG:" + escapeVcf(c.company));
  if (c.role) lines.push("TITLE:" + escapeVcf(c.role));
  if (c.location) lines.push("ADR:;;;;;;" + escapeVcf(c.location));
  if (c.linkedin) lines.push("URL:" + c.linkedin);
  else if (c.website) lines.push("URL:" + c.website);
  if (c.linkedin && c.website) lines.push("URL:" + c.website);
  if (c.notes) lines.push("NOTE:" + escapeVcf(c.notes));
  if ((c.tags || []).length > 0) lines.push("CATEGORIES:" + c.tags.join(","));
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function exportVcf(contacts) {
  const vcf = contacts.map(contactToVcard).join("\r\n");
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `robodesk-contacts-${new Date().toISOString().slice(0, 10)}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}

function unescapeVcf(val) {
  return val.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}

function parseVcards(text) {
  const unfoldedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n[ \t]/g, "");
  const blocks = unfoldedText.split(/(?=BEGIN:VCARD)/i).filter(b => /BEGIN:VCARD/i.test(b));
  return blocks.map(block => {
    const contact = { tags: [] };
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      const sep = line.indexOf(":");
      if (sep < 0) continue;
      let key = line.slice(0, sep).split(";")[0].toUpperCase();
      const val = line.slice(sep + 1);
      if (key === "FN") contact.name = unescapeVcf(val);
      else if (key === "EMAIL") contact.email = val.trim();
      else if (key === "TEL") contact.phone = val.trim();
      else if (key === "ORG") contact.company = unescapeVcf(val).replace(/;+$/, "");
      else if (key === "TITLE") contact.role = unescapeVcf(val);
      else if (key === "ADR") {
        const parts = val.split(";");
        const locality = parts[3] || parts[6] || parts.filter(Boolean).pop() || "";
        if (locality) contact.location = unescapeVcf(locality);
      }
      else if (key === "URL") {
        if (val.toLowerCase().includes("linkedin")) contact.linkedin = val.trim();
        else if (!contact.website) contact.website = val.trim();
      }
      else if (key === "NOTE") contact.notes = unescapeVcf(val);
      else if (key === "CATEGORIES") contact.tags = val.split(",").map(t => t.trim()).filter(Boolean);
    }
    return contact;
  }).filter(c => c.name);
}

function importVcf(text, existingContacts) {
  const parsed = parseVcards(text);
  const existingEmails = new Set(existingContacts.map(c => (c.email || "").toLowerCase()).filter(Boolean));
  const existingNames = new Set(existingContacts.map(c => (c.name || "").toLowerCase()).filter(Boolean));
  const imported = [];
  let skipped = 0;
  const newTags = new Set();

  for (const p of parsed) {
    const emailLower = (p.email || "").toLowerCase();
    const nameLower = p.name.toLowerCase();
    if ((emailLower && existingEmails.has(emailLower)) || existingNames.has(nameLower)) {
      skipped++;
      continue;
    }
    if (emailLower) existingEmails.add(emailLower);
    existingNames.add(nameLower);
    (p.tags || []).forEach(tag => newTags.add(tag));
    imported.push({ ...p, id: generateId(), createdAt: new Date().toISOString(), interactions: [] });
  }
  return { imported, skipped, newTags: [...newTags] };
}

// ── SMART NUDGES ──
function generateNudges(contacts) {
  const nudges = [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  for (const c of contacts) {
    const urgency = getFollowUpUrgency(c);
    const daysPast = daysAgo(c.nextFollowUp);
    const lastDays = daysAgo(c.lastContact);
    const interactionCount = (c.interactions || []).length;
    const recentInteractions = (c.interactions || []).filter(i => new Date(i.date) >= thirtyDaysAgo).length;

    if (urgency === "overdue") {
      nudges.push({ type: "overdue", priority: 1, contactId: c.id, contactName: c.name,
        message: `Follow-up ist ${daysPast} Tage überfällig` });
    } else if (urgency === "due") {
      nudges.push({ type: "due", priority: 2, contactId: c.id, contactName: c.name,
        message: `Follow-up ist seit ${daysPast} Tag${daysPast === 1 ? "" : "en"} fällig` });
    }

    if (lastDays !== null && lastDays > 60 && interactionCount > 0) {
      nudges.push({ type: "neglected", priority: 3, contactId: c.id, contactName: c.name,
        message: `Seit ${lastDays} Tagen kein Kontakt` });
    }

    const createdDays = daysAgo(c.createdAt);
    if (createdDays > 7 && interactionCount === 0) {
      nudges.push({ type: "untouched", priority: 4, contactId: c.id, contactName: c.name,
        message: "Neuer Kontakt ohne Interaktion" });
    }

    if (interactionCount > 0 && !c.nextFollowUp) {
      nudges.push({ type: "no-followup", priority: 5, contactId: c.id, contactName: c.name,
        message: "Kein Follow-up gesetzt" });
    }

    if (recentInteractions >= 3) {
      nudges.push({ type: "momentum", priority: 6, contactId: c.id, contactName: c.name,
        message: `${recentInteractions} Interaktionen in 30 Tagen — gute Dynamik!` });
    }
  }

  return nudges.sort((a, b) => a.priority - b.priority);
}

// ── THEME DEFINITIONS ──
const themes = {
  light: {
    appBg: "#f5f3ef",
    headerBg: "linear-gradient(180deg, #faf8f5 0%, #f5f3ef 100%)",
    headerBorder: "#e5e0d8",
    logoColor: "#2a6b5a",
    subtitleColor: "#9a9080",
    textPrimary: "#2c2c2c",
    textSecondary: "#6b6560",
    textMuted: "#9a9080",
    cardBg: "#ffffff",
    cardBorder: "#ece8e1",
    cardHoverBorder: "#d5cfc6",
    inputBg: "#faf8f5",
    inputBorder: "#e5e0d8",
    inputText: "#2c2c2c",
    accentPrimary: "#2a6b5a",
    accentLight: "#e8f2ee",
    accentBorder: "#c8ddd6",
    tagBg: "#f0ece6",
    tagColor: "#5a7a6d",
    tagBorder: "#e0dbd3",
    tagActiveBg: "#e0f0ea",
    tagActiveColor: "#2a6b5a",
    tagActiveBorder: "#2a6b5a",
    sectionBg: "#ffffff",
    sectionBorder: "#ece8e1",
    btnPrimaryBg: "#2a6b5a",
    btnPrimaryColor: "#ffffff",
    btnSecondaryBg: "#faf8f5",
    btnSecondaryBorder: "#e5e0d8",
    btnSecondaryColor: "#6b6560",
    dangerBg: "#fef2f2",
    dangerBorder: "#fecaca",
    dangerColor: "#dc2626",
    linkColor: "#2a6b5a",
    overlayBg: "rgba(245, 243, 239, 0.95)",
    confirmBg: "#fef2f2",
    confirmBorder: "#fecaca",
    timelineLine: "#e5e0d8",
    filterActiveBg: "#fef2f2",
    filterActiveBorder: "rgba(220, 38, 38, 0.2)",
    filterActiveColor: "#dc2626",
    typeActiveBg: "#e8f2ee",
    typeActiveBorder: "#2a6b5a",
    scrollThumb: "#d5cfc6",
  },
  dark: {
    appBg: "#0c0f14",
    headerBg: "linear-gradient(180deg, #101520 0%, #0c0f14 100%)",
    headerBorder: "#1a1f2a",
    logoColor: "#8fbfa0",
    subtitleColor: "#555d6e",
    textPrimary: "#e0e0e0",
    textSecondary: "#6b7280",
    textMuted: "#555d6e",
    cardBg: "#12161e",
    cardBorder: "#1a1f2a",
    cardHoverBorder: "#253342",
    inputBg: "#0c0f14",
    inputBorder: "#1e2533",
    inputText: "#d0d0d0",
    accentPrimary: "#8fbfa0",
    accentLight: "#1a2332",
    accentBorder: "#253342",
    tagBg: "#1a2332",
    tagColor: "#7ba896",
    tagBorder: "#253342",
    tagActiveBg: "#1a2332",
    tagActiveColor: "#8fbfa0",
    tagActiveBorder: "#8fbfa0",
    sectionBg: "#12161e",
    sectionBorder: "#1a1f2a",
    btnPrimaryBg: "#8fbfa0",
    btnPrimaryColor: "#0c0f14",
    btnSecondaryBg: "transparent",
    btnSecondaryBorder: "#253342",
    btnSecondaryColor: "#6b7280",
    dangerBg: "#1a1a1a",
    dangerBorder: "#331a1a",
    dangerColor: "#e74c3c",
    linkColor: "#8fbfa0",
    overlayBg: "rgba(12, 15, 20, 0.95)",
    confirmBg: "#1e1212",
    confirmBorder: "#442222",
    timelineLine: "#1a2332",
    filterActiveBg: "#2d1a1a",
    filterActiveBorder: "rgba(231, 76, 60, 0.27)",
    filterActiveColor: "#e74c3c",
    typeActiveBg: "#1a2332",
    typeActiveBorder: "#8fbfa0",
    scrollThumb: "#253342",
  }
};

// ── MAIN APP ──
export default function RoboDesk() {
  const [contacts, setContacts] = useState([]);
  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [theme, setTheme] = useState("light");
  const [view, setView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showFollowUpOnly, setShowFollowUpOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDataMenu, setShowDataMenu] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const t = themes[theme];

  useEffect(() => {
    async function load() {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res?.value) setContacts(JSON.parse(res.value));
      } catch (e) {}
      try {
        const res = await window.storage.get(TAGS_KEY);
        if (res?.value) setTags(JSON.parse(res.value));
      } catch (e) {}
      try {
        const res = await window.storage.get(THEME_KEY);
        if (res?.value) setTheme(res.value);
      } catch (e) {}
      setLoading(false);
    }
    load();
  }, []);

  const toggleTheme = async () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try { await window.storage.set(THEME_KEY, next); } catch (e) {}
  };

  const saveContacts = useCallback(async (newContacts) => {
    setContacts(newContacts);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(newContacts)); } catch (e) {}
  }, []);

  const saveTags = useCallback(async (newTags) => {
    setTags(newTags);
    try { await window.storage.set(TAGS_KEY, JSON.stringify(newTags)); } catch (e) {}
  }, []);

  const addContact = (contact) => {
    const nc = { ...contact, id: generateId(), createdAt: new Date().toISOString(), interactions: [] };
    saveContacts([...contacts, nc]);
    setView("list");
  };

  const updateContact = (updated) => {
    saveContacts(contacts.map(c => c.id === updated.id ? updated : c));
  };

  const deleteContact = (id) => {
    saveContacts(contacts.filter(c => c.id !== id));
    setView("list");
    setSelectedId(null);
  };

  const addInteraction = (contactId, interaction) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    const updated = {
      ...contact,
      interactions: [...(contact.interactions || []), { ...interaction, id: generateId(), date: new Date().toISOString() }],
      lastContact: new Date().toISOString()
    };
    updateContact(updated);
  };

  const handleImportFile = (accept, parser) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = parser(ev.target.result, contacts);
        if (result.imported.length > 0) {
          const allNewTags = [...new Set([...tags, ...result.newTags])];
          saveContacts([...contacts, ...result.imported]);
          saveTags(allNewTags);
        }
        setImportResult(result);
        setTimeout(() => setImportResult(null), 4000);
      };
      reader.readAsText(file);
    };
    input.click();
    setShowDataMenu(false);
  };

  const filtered = contacts.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = [c.name, c.company, c.role, c.email, c.notes, ...(c.tags || [])].some(f => f && f.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filterTag !== "all" && !(c.tags || []).includes(filterTag)) return false;
    if (filterType !== "all" && c.relationshipType !== filterType) return false;
    if (showFollowUpOnly) {
      const u = getFollowUpUrgency(c);
      if (u !== "overdue" && u !== "due" && u !== "soon") return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
    if (sortBy === "lastContact") return new Date(b.lastContact || 0) - new Date(a.lastContact || 0);
    if (sortBy === "followUp") {
      if (!a.nextFollowUp && !b.nextFollowUp) return 0;
      if (!a.nextFollowUp) return 1;
      if (!b.nextFollowUp) return -1;
      return new Date(a.nextFollowUp) - new Date(b.nextFollowUp);
    }
    if (sortBy === "recent") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    return 0;
  });

  const selectedContact = contacts.find(c => c.id === selectedId);
  const overdueCount = contacts.filter(c => getFollowUpUrgency(c) === "overdue").length;
  const dueCount = contacts.filter(c => ["overdue", "due", "soon"].includes(getFollowUpUrgency(c))).length;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: t.appBg, color: t.accentPrimary, fontSize: 28, fontFamily: "monospace" }}>
      <span style={{ letterSpacing: 8 }}>●●●</span>
    </div>
  );

  const s = makeStyles(t);

  return (
    <div style={s.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: ${t.accentPrimary}33; }
        input:focus, select:focus, textarea:focus { border-color: ${t.accentPrimary} !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 3px; }
      `}</style>

      <header style={s.header}>
        <div style={s.headerLeft}>
          <h1 style={s.logo}>
            <span style={s.logoIcon}>⚡</span> RoboDesk
          </h1>
          <div style={s.navTabs}>
            <button style={{...s.navTab, ...(view === "dashboard" ? s.navTabActive : {})}} onClick={() => setView("dashboard")}>Dashboard</button>
            <button style={{...s.navTab, ...(view === "list" || view === "detail" || view === "edit" ? s.navTabActive : {})}} onClick={() => setView("list")}>Kontakte</button>
          </div>
        </div>
        <div style={s.headerRight}>
          <div style={s.statsRow}>
            <span style={s.stat}>{contacts.length} Kontakte</span>
            {dueCount > 0 && (
              <span style={{...s.stat, ...s.statAlert}} onClick={() => { setShowFollowUpOnly(!showFollowUpOnly); setView("list"); }}>
                {overdueCount > 0 ? `${overdueCount} überfällig` : `${dueCount} fällig`}
              </span>
            )}
          </div>
          <div style={{ position: "relative" }}>
            <button style={s.themeToggle} onClick={() => setShowDataMenu(!showDataMenu)} title="Daten">📁</button>
            {showDataMenu && (
              <div style={s.dataMenu}>
                <button style={s.dataMenuItem} onClick={() => { exportCsv(contacts); setShowDataMenu(false); }}>CSV exportieren</button>
                <button style={s.dataMenuItem} onClick={() => handleImportFile(".csv", importCsv)}>CSV importieren</button>
                <div style={s.dataMenuDivider} />
                <button style={s.dataMenuItem} onClick={() => { exportVcf(contacts); setShowDataMenu(false); }}>VCF exportieren</button>
                <button style={s.dataMenuItem} onClick={() => handleImportFile(".vcf", importVcf)}>VCF importieren</button>
              </div>
            )}
          </div>
          <button style={s.themeToggle} onClick={toggleTheme} title="Theme wechseln">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button style={s.addBtn} onClick={() => { setView("add"); setSelectedId(null); }}>+ Neuer Kontakt</button>
        </div>
      </header>

      {importResult && (
        <div style={s.importToast}>
          {importResult.imported.length} Kontakte importiert{importResult.skipped > 0 ? `, ${importResult.skipped} Duplikate übersprungen` : ""}
        </div>
      )}

      {view === "dashboard" && (
        <Dashboard
          contacts={contacts}
          onOpenContact={(id) => { setSelectedId(id); setView("detail"); }}
          s={s} t={t}
        />
      )}

      {view === "add" && (
        <ContactForm onSave={addContact} onCancel={() => setView("dashboard")} tags={tags} onAddTag={(tag) => saveTags([...tags, tag])} s={s} t={t} />
      )}

      {view === "edit" && selectedContact && (
        <ContactForm contact={selectedContact} onSave={(c) => { updateContact(c); setView("detail"); }} onCancel={() => setView("detail")} tags={tags} onAddTag={(tag) => saveTags([...tags, tag])} s={s} t={t} />
      )}

      {view === "detail" && selectedContact && (
        <ContactDetail
          contact={selectedContact}
          onEdit={() => setView("edit")}
          onDelete={deleteContact}
          onBack={() => { setView("list"); setSelectedId(null); }}
          onAddInteraction={(i) => addInteraction(selectedContact.id, i)}
          onUpdate={updateContact}
          s={s} t={t}
        />
      )}

      {view === "list" && (
        <>
          <div style={s.toolbar}>
            <input
              style={s.searchInput}
              placeholder="Suchen nach Name, Firma, Tag..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <select style={s.filterSelect} value={filterTag} onChange={e => setFilterTag(e.target.value)}>
              <option value="all">Alle Tags</option>
              {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
            <select style={s.filterSelect} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">Alle Typen</option>
              {RELATIONSHIP_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
            </select>
            <select style={s.filterSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="name">Name A–Z</option>
              <option value="lastContact">Letzter Kontakt</option>
              <option value="followUp">Follow-Up</option>
              <option value="recent">Neueste zuerst</option>
            </select>
            <button
              style={{...s.filterToggle, ...(showFollowUpOnly ? s.filterToggleActive : {})}}
              onClick={() => setShowFollowUpOnly(!showFollowUpOnly)}
            >⏰ Fällig</button>
          </div>

          {filtered.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>📇</div>
              <p style={s.emptyText}>{contacts.length === 0 ? "Noch keine Kontakte. Starte mit dem ersten!" : "Keine Kontakte gefunden."}</p>
            </div>
          ) : (
            <div style={s.contactGrid}>
              {filtered.map(c => (
                <ContactCard key={c.id} contact={c} onClick={() => { setSelectedId(c.id); setView("detail"); }} s={s} t={t} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── DASHBOARD ──
function Dashboard({ contacts, onOpenContact, s, t }) {
  const nudges = generateNudges(contacts);
  const [showAllNudges, setShowAllNudges] = useState(false);
  const displayNudges = showAllNudges ? nudges : nudges.slice(0, 5);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const allInteractions = contacts.flatMap(c => (c.interactions || []).map(i => ({ ...i, contactName: c.name, contactId: c.id })));
  const monthlyInteractions = allInteractions.filter(i => new Date(i.date) >= monthStart);
  const newThisMonth = contacts.filter(c => new Date(c.createdAt) >= monthStart);
  const overdueContacts = contacts.filter(c => getFollowUpUrgency(c) === "overdue");

  const typeCounts = {};
  monthlyInteractions.forEach(i => {
    const c = contacts.find(x => x.id === i.contactId);
    const rt = c?.relationshipType || "Unbekannt";
    typeCounts[rt] = (typeCounts[rt] || 0) + 1;
  });
  const mostActiveType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

  const recentActivity = [...allInteractions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  const typeIcons = { note: "📝", call: "📞", meeting: "🤝", email: "✉️", event: "🎪", idea: "💡" };
  const nudgeIcons = { overdue: "🔴", due: "🟠", neglected: "😶", untouched: "🆕", "no-followup": "📋", momentum: "🚀" };
  const nudgeColors = { overdue: "#dc2626", due: "#ea580c", neglected: t.accentPrimary, untouched: t.accentPrimary, "no-followup": t.accentPrimary, momentum: "#16a34a" };

  return (
    <div style={s.dashboardWrap}>
      {nudges.length > 0 && (
        <div style={s.dashSection}>
          <h3 style={s.dashTitle}>Handlungsempfehlungen</h3>
          <div style={s.nudgeGrid}>
            {displayNudges.map((n, i) => (
              <div key={i} style={{...s.nudgeCard, borderLeftColor: nudgeColors[n.type]}} onClick={() => onOpenContact(n.contactId)}>
                <span style={s.nudgeIcon}>{nudgeIcons[n.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={s.nudgeName}>{n.contactName}</strong>
                  <p style={s.nudgeMsg}>{n.message}</p>
                </div>
                <span style={s.nudgeArrow}>→</span>
              </div>
            ))}
          </div>
          {nudges.length > 5 && (
            <button style={s.showAllBtn} onClick={() => setShowAllNudges(!showAllNudges)}>
              {showAllNudges ? "Weniger anzeigen" : `Alle ${nudges.length} anzeigen`}
            </button>
          )}
        </div>
      )}

      <div style={s.dashSection}>
        <h3 style={s.dashTitle}>Übersicht</h3>
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <span style={s.statNumber}>{contacts.length}</span>
            <span style={s.statLabel}>Kontakte gesamt</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statNumber}>{monthlyInteractions.length}</span>
            <span style={s.statLabel}>Interaktionen diesen Monat</span>
          </div>
          <div style={{...s.statCard, ...(overdueContacts.length > 0 ? { borderColor: "#dc262633" } : {})}}>
            <span style={{...s.statNumber, ...(overdueContacts.length > 0 ? { color: "#dc2626" } : {})}}>{overdueContacts.length}</span>
            <span style={s.statLabel}>Überfällige Follow-ups</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statNumber}>{newThisMonth.length}</span>
            <span style={s.statLabel}>Neu diesen Monat</span>
          </div>
          {mostActiveType && (
            <div style={s.statCard}>
              <span style={s.statNumber}>{mostActiveType[0]}</span>
              <span style={s.statLabel}>Aktivster Bereich ({mostActiveType[1]})</span>
            </div>
          )}
        </div>
      </div>

      {recentActivity.length > 0 && (
        <div style={s.dashSection}>
          <h3 style={s.dashTitle}>Letzte Aktivitäten</h3>
          <div style={s.activityList}>
            {recentActivity.map((a, i) => {
              const d = daysAgo(a.date);
              const relTime = d === 0 ? "Heute" : d === 1 ? "Gestern" : `vor ${d} Tagen`;
              return (
                <div key={i} style={s.activityItem} onClick={() => onOpenContact(a.contactId)}>
                  <span style={s.activityIcon}>{typeIcons[a.type] || "📝"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={s.activityText}>{a.type === "call" ? "Anruf" : a.type === "meeting" ? "Meeting" : a.type === "email" ? "E-Mail" : a.type === "event" ? "Event" : a.type === "idea" ? "Idee" : "Notiz"} mit <strong>{a.contactName}</strong></span>
                    {a.content && <p style={s.activityContent}>{a.content.length > 80 ? a.content.slice(0, 80) + "…" : a.content}</p>}
                  </div>
                  <span style={s.activityTime}>{relTime}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {contacts.length === 0 && nudges.length === 0 && (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>📇</div>
          <p style={s.emptyText}>Willkommen bei RoboDesk! Starte mit dem ersten Kontakt.</p>
        </div>
      )}
    </div>
  );
}

// ── CONTACT CARD ──
function ContactCard({ contact, onClick, s, t }) {
  const urgency = getFollowUpUrgency(contact);
  const lastDays = daysAgo(contact.lastContact);
  const initials = (contact.name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const urgencyColors = { overdue: "#dc2626", due: "#ea580c", soon: "#d97706", upcoming: "#16a34a", none: "transparent" };

  return (
    <div style={s.card} onClick={onClick}>
      {urgency !== "none" && <div style={{...s.cardUrgencyBar, backgroundColor: urgencyColors[urgency]}} />}
      <div style={s.cardTop}>
        <div style={{...s.avatar, backgroundColor: stringToColor(contact.name || "")}}>{initials}</div>
        <div style={s.cardInfo}>
          <h3 style={s.cardName}>{contact.name}</h3>
          {contact.company && <p style={s.cardCompany}>{contact.role ? `${contact.role} · ` : ""}{contact.company}</p>}
        </div>
      </div>
      <div style={s.cardMeta}>
        {lastDays !== null && (
          <span style={s.cardMetaItem}>{lastDays === 0 ? "Heute" : lastDays === 1 ? "Gestern" : `vor ${lastDays}d`}</span>
        )}
        {contact.nextFollowUp && (
          <span style={{...s.cardMetaItem, color: urgencyColors[urgency] || t.textMuted}}>
            ⏰ {formatDate(contact.nextFollowUp)}
          </span>
        )}
      </div>
      {(contact.tags || []).length > 0 && (
        <div style={s.cardTags}>
          {contact.tags.slice(0, 4).map(tag => <span key={tag} style={s.tag}>{tag}</span>)}
          {contact.tags.length > 4 && <span style={{fontSize: 10, color: t.textMuted}}>+{contact.tags.length - 4}</span>}
        </div>
      )}
    </div>
  );
}

// ── CONTACT DETAIL ──
function ContactDetail({ contact, onEdit, onDelete, onBack, onAddInteraction, onUpdate, s, t }) {
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState("note");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAddInteraction = () => {
    if (!newNote.trim()) return;
    onAddInteraction({ type: noteType, content: newNote.trim() });
    setNewNote("");
  };

  const typeIcons = { note: "📝", call: "📞", meeting: "🤝", email: "✉️", event: "🎪", idea: "💡" };
  const initials = (contact.name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={s.detailView}>
      <button style={s.backBtn} onClick={onBack}>← Zurück</button>

      <div style={s.detailHeader}>
        <div style={{...s.avatarLarge, backgroundColor: stringToColor(contact.name || "")}}>{initials}</div>
        <div style={{ flex: 1 }}>
          <h2 style={s.detailName}>{contact.name}</h2>
          {contact.company && <p style={s.detailRole}>{contact.role ? `${contact.role} · ` : ""}{contact.company}</p>}
          {contact.relationshipType && <span style={s.relType}>{contact.relationshipType}</span>}
        </div>
        <div style={s.detailActions}>
          <button style={s.editBtn} onClick={onEdit}>✏️ Bearbeiten</button>
          <button style={s.deleteBtn} onClick={() => setShowDeleteConfirm(true)}>🗑</button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div style={s.confirmBox}>
          <p style={{ margin: "0 0 10px", color: t.textPrimary }}>Kontakt <strong>{contact.name}</strong> wirklich löschen?</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={s.confirmYes} onClick={() => onDelete(contact.id)}>Ja, löschen</button>
            <button style={s.confirmNo} onClick={() => setShowDeleteConfirm(false)}>Abbrechen</button>
          </div>
        </div>
      )}

      <div style={s.detailGrid}>
        <div style={s.detailSection}>
          <h4 style={s.sectionTitle}>Kontaktdaten</h4>
          <div style={s.fieldGroup}>
            {contact.email && <p style={s.fieldLine}>✉️ <a href={`mailto:${contact.email}`} style={s.link}>{contact.email}</a></p>}
            {contact.phone && <p style={s.fieldLine}>📞 {contact.phone}</p>}
            {contact.location && <p style={s.fieldLine}>📍 {contact.location}</p>}
            {contact.linkedin && <p style={s.fieldLine}>🔗 <a href={contact.linkedin} target="_blank" rel="noreferrer" style={s.link}>LinkedIn</a></p>}
            {contact.website && <p style={s.fieldLine}>🌐 <a href={contact.website} target="_blank" rel="noreferrer" style={s.link}>{contact.website}</a></p>}
          </div>
        </div>

        <div style={s.detailSection}>
          <h4 style={s.sectionTitle}>Status</h4>
          <div style={s.fieldGroup}>
            <p style={s.fieldLine}>📅 Erstellt: {formatDate(contact.createdAt)}</p>
            <p style={s.fieldLine}>🤝 Letzter Kontakt: {formatDate(contact.lastContact)}</p>
            <p style={s.fieldLine}>⏰ Nächstes Follow-Up: {formatDate(contact.nextFollowUp)}</p>
            <div style={{ marginTop: 8 }}>
              <label style={s.smallLabel}>Follow-Up setzen:</label>
              <input
                type="date"
                style={s.dateInput}
                value={contact.nextFollowUp ? contact.nextFollowUp.slice(0, 10) : ""}
                onChange={e => onUpdate({ ...contact, nextFollowUp: e.target.value || null })}
              />
            </div>
          </div>
        </div>
      </div>

      {contact.notes && (
        <div style={s.detailSection}>
          <h4 style={s.sectionTitle}>Notizen</h4>
          <p style={s.notesBlock}>{contact.notes}</p>
        </div>
      )}

      {(contact.tags || []).length > 0 && (
        <div style={s.detailSection}>
          <h4 style={s.sectionTitle}>Tags</h4>
          <div style={s.tagRow}>{contact.tags.map(tag => <span key={tag} style={s.tag}>{tag}</span>)}</div>
        </div>
      )}

      <div style={s.detailSection}>
        <h4 style={s.sectionTitle}>Interaktion hinzufügen</h4>
        <div style={s.interactionBox}>
          <div style={s.typeSelector}>
            {Object.entries(typeIcons).map(([k, icon]) => (
              <button key={k} style={{...s.typeBtn, ...(noteType === k ? s.typeBtnActive : {})}} onClick={() => setNoteType(k)} title={k}>{icon}</button>
            ))}
          </div>
          <textarea
            style={s.textArea}
            placeholder="Was ist passiert?"
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            rows={2}
          />
          <button style={s.addInteractionBtn} onClick={handleAddInteraction} disabled={!newNote.trim()}>Hinzufügen</button>
        </div>
      </div>

      {(contact.interactions || []).length > 0 && (
        <div style={s.detailSection}>
          <h4 style={s.sectionTitle}>Verlauf ({contact.interactions.length})</h4>
          <div style={s.timeline}>
            {[...contact.interactions].reverse().map(i => (
              <div key={i.id} style={s.timelineItem}>
                <span style={s.timelineIcon}>{typeIcons[i.type] || "📝"}</span>
                <div style={s.timelineContent}>
                  <span style={s.timelineDate}>{formatDate(i.date)}</span>
                  <p style={s.timelineText}>{i.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── CONTACT FORM ──
function ContactForm({ contact, onSave, onCancel, tags, onAddTag, s, t }) {
  const [form, setForm] = useState(contact || {
    name: "", email: "", phone: "", company: "", role: "",
    location: "", linkedin: "", website: "",
    notes: "", tags: [], relationshipType: "",
    nextFollowUp: null, lastContact: null
  });
  const [newTag, setNewTag] = useState("");

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const toggleTag = (tag) => {
    const has = (form.tags || []).includes(tag);
    set("tags", has ? form.tags.filter(x => x !== tag) : [...(form.tags || []), tag]);
  };

  const handleAddNewTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onAddTag(newTag.trim());
      set("tags", [...(form.tags || []), newTag.trim()]);
      setNewTag("");
    }
  };

  return (
    <div style={s.formOverlay}>
      <div style={s.formCard}>
        <h2 style={s.formTitle}>{contact ? "Kontakt bearbeiten" : "Neuer Kontakt"}</h2>

        <div style={s.formGrid}>
          <div style={s.formGroup}>
            <label style={s.label}>Name *</label>
            <input style={s.input} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Vor- und Nachname" />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>E-Mail</label>
            <input style={s.input} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@example.com" />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Telefon</label>
            <input style={s.input} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+49..." />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Firma</label>
            <input style={s.input} value={form.company} onChange={e => set("company", e.target.value)} placeholder="Firmenname" />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Rolle / Position</label>
            <input style={s.input} value={form.role} onChange={e => set("role", e.target.value)} placeholder="z.B. CTO, Freelancer" />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Standort</label>
            <input style={s.input} value={form.location} onChange={e => set("location", e.target.value)} placeholder="Stadt, Land" />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>LinkedIn</label>
            <input style={s.input} value={form.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Website</label>
            <input style={s.input} value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://..." />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Beziehungstyp</label>
            <select style={s.input} value={form.relationshipType} onChange={e => set("relationshipType", e.target.value)}>
              <option value="">— wählen —</option>
              {RELATIONSHIP_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
            </select>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Nächstes Follow-Up</label>
            <input style={s.input} type="date" value={form.nextFollowUp || ""} onChange={e => set("nextFollowUp", e.target.value || null)} />
          </div>
        </div>

        <div style={s.formGroup}>
          <label style={s.label}>Notizen</label>
          <textarea style={{...s.input, minHeight: 80}} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Kontext, Gesprächsthemen, Interessen..." />
        </div>

        <div style={s.formGroup}>
          <label style={s.label}>Tags</label>
          <div style={s.tagSelector}>
            {tags.map(tag => (
              <button key={tag} style={{...s.tagBtn, ...((form.tags || []).includes(tag) ? s.tagBtnActive : {})}} onClick={() => toggleTag(tag)}>{tag}</button>
            ))}
          </div>
          <div style={s.addTagRow}>
            <input style={s.tagInput} placeholder="Neuer Tag..." value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddNewTag()} />
            <button style={s.tagAddBtn} onClick={handleAddNewTag}>+</button>
          </div>
        </div>

        <div style={s.formActions}>
          <button style={s.cancelBtn} onClick={onCancel}>Abbrechen</button>
          <button style={s.saveBtn} onClick={() => form.name.trim() && onSave(form)} disabled={!form.name.trim()}>
            {contact ? "Speichern" : "Kontakt anlegen"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── STYLE FACTORY ──
function makeStyles(t) {
  return {
    app: {
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      minHeight: "100vh",
      background: t.appBg,
      color: t.textPrimary,
    },
    header: {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "16px 28px", borderBottom: `1px solid ${t.headerBorder}`,
      background: t.headerBg, position: "sticky", top: 0, zIndex: 100,
    },
    headerLeft: { display: "flex", alignItems: "baseline", gap: 12 },
    logo: {
      fontSize: 21, fontWeight: 700, color: t.logoColor, margin: 0,
      letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: 6,
    },
    logoIcon: { fontSize: 18 },
    subtitle: { fontSize: 11, color: t.subtitleColor, textTransform: "uppercase", letterSpacing: "2.5px", fontWeight: 500 },
    headerRight: { display: "flex", alignItems: "center", gap: 12 },
    statsRow: { display: "flex", gap: 12, alignItems: "center" },
    stat: { fontSize: 13, color: t.textSecondary, fontVariantNumeric: "tabular-nums" },
    statAlert: { color: "#dc2626", cursor: "pointer", fontWeight: 600 },
    themeToggle: {
      background: "none", border: `1px solid ${t.inputBorder}`, borderRadius: 8,
      padding: "6px 10px", fontSize: 16, cursor: "pointer", lineHeight: 1,
    },
    addBtn: {
      background: t.btnPrimaryBg, color: t.btnPrimaryColor, border: "none",
      padding: "8px 16px", borderRadius: 7, fontSize: 13, fontWeight: 600,
      cursor: "pointer", letterSpacing: "0.2px",
    },

    // Toolbar
    toolbar: {
      display: "flex", gap: 8, padding: "14px 28px",
      flexWrap: "wrap", borderBottom: `1px solid ${t.headerBorder}`,
    },
    searchInput: {
      flex: "1 1 220px", padding: "9px 14px", borderRadius: 7,
      border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.inputText,
      fontSize: 13, outline: "none", minWidth: 180, fontFamily: "inherit",
    },
    filterSelect: {
      padding: "9px 12px", borderRadius: 7, border: `1px solid ${t.inputBorder}`,
      background: t.inputBg, color: t.textSecondary, fontSize: 12, outline: "none",
      cursor: "pointer", fontFamily: "inherit",
    },
    filterToggle: {
      padding: "9px 14px", borderRadius: 7, border: `1px solid ${t.inputBorder}`,
      background: t.inputBg, color: t.textSecondary, fontSize: 12, cursor: "pointer",
      fontFamily: "inherit",
    },
    filterToggleActive: {
      background: t.filterActiveBg, borderColor: t.filterActiveBorder, color: t.filterActiveColor,
    },

    // Grid
    contactGrid: {
      display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: 12, padding: "20px 28px",
    },

    // Card
    card: {
      background: t.cardBg, borderRadius: 10, padding: "16px 18px",
      cursor: "pointer", border: `1px solid ${t.cardBorder}`,
      transition: "border-color 0.2s, box-shadow 0.2s", position: "relative", overflow: "hidden",
    },
    cardUrgencyBar: { position: "absolute", top: 0, left: 0, right: 0, height: 3 },
    cardTop: { display: "flex", gap: 12, alignItems: "center", marginBottom: 10 },
    avatar: {
      width: 38, height: 38, borderRadius: "50%", display: "flex",
      alignItems: "center", justifyContent: "center", fontSize: 14,
      fontWeight: 700, color: "#fff", flexShrink: 0,
    },
    cardInfo: { flex: 1, minWidth: 0 },
    cardName: { fontSize: 15, fontWeight: 600, margin: 0, color: t.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    cardCompany: { fontSize: 12, color: t.textSecondary, margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    cardMeta: { display: "flex", gap: 12, marginBottom: 8 },
    cardMetaItem: { fontSize: 11, color: t.textMuted },
    cardTags: { display: "flex", gap: 4, flexWrap: "wrap" },
    tag: {
      fontSize: 10, padding: "2px 8px", borderRadius: 10,
      background: t.tagBg, color: t.tagColor, border: `1px solid ${t.tagBorder}`,
      letterSpacing: "0.3px",
    },

    // Empty
    emptyState: {
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "80px 20px", color: t.textMuted,
    },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyText: { fontSize: 14, textAlign: "center" },

    // Detail
    detailView: { padding: "20px 28px", maxWidth: 800, margin: "0 auto" },
    backBtn: {
      background: "none", border: "none", color: t.accentPrimary, fontSize: 14,
      cursor: "pointer", padding: "4px 0", marginBottom: 16, fontFamily: "inherit",
    },
    detailHeader: {
      display: "flex", gap: 16, alignItems: "center", marginBottom: 24, flexWrap: "wrap",
    },
    avatarLarge: {
      width: 56, height: 56, borderRadius: "50%", display: "flex",
      alignItems: "center", justifyContent: "center", fontSize: 20,
      fontWeight: 700, color: "#fff", flexShrink: 0,
    },
    detailName: { fontSize: 22, fontWeight: 700, margin: 0, color: t.textPrimary },
    detailRole: { fontSize: 14, color: t.textSecondary, margin: "4px 0 0" },
    relType: {
      fontSize: 11, padding: "2px 10px", borderRadius: 10,
      background: t.accentLight, color: t.accentPrimary, marginTop: 4, display: "inline-block",
    },
    detailActions: { marginLeft: "auto", display: "flex", gap: 8 },
    editBtn: {
      background: t.accentLight, border: `1px solid ${t.accentBorder}`, color: t.accentPrimary,
      padding: "7px 14px", borderRadius: 7, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
    },
    deleteBtn: {
      background: t.dangerBg, border: `1px solid ${t.dangerBorder}`, color: t.dangerColor,
      padding: "7px 10px", borderRadius: 7, fontSize: 13, cursor: "pointer",
    },
    confirmBox: {
      background: t.confirmBg, border: `1px solid ${t.confirmBorder}`, borderRadius: 8,
      padding: 16, marginBottom: 16,
    },
    confirmYes: {
      background: "#dc2626", color: "#fff", border: "none", padding: "6px 14px",
      borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: "inherit",
    },
    confirmNo: {
      background: t.btnSecondaryBg, color: t.btnSecondaryColor, border: `1px solid ${t.btnSecondaryBorder}`,
      padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: "inherit",
    },
    detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 },
    detailSection: { marginBottom: 20 },
    sectionTitle: {
      fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px",
      color: t.textMuted, margin: "0 0 10px", fontWeight: 600,
    },
    fieldGroup: { background: t.sectionBg, borderRadius: 8, padding: 14, border: `1px solid ${t.sectionBorder}` },
    fieldLine: { fontSize: 13, margin: "6px 0", color: t.textSecondary },
    link: { color: t.linkColor, textDecoration: "none" },
    notesBlock: {
      background: t.sectionBg, borderRadius: 8, padding: 14, border: `1px solid ${t.sectionBorder}`,
      fontSize: 13, lineHeight: 1.6, color: t.textSecondary, whiteSpace: "pre-wrap",
    },
    tagRow: { display: "flex", gap: 6, flexWrap: "wrap" },
    smallLabel: { fontSize: 11, color: t.textMuted },
    dateInput: {
      padding: "6px 10px", borderRadius: 6, border: `1px solid ${t.inputBorder}`,
      background: t.inputBg, color: t.inputText, fontSize: 12, marginTop: 4,
      outline: "none", fontFamily: "inherit",
    },

    // Interaction
    interactionBox: { background: t.sectionBg, borderRadius: 8, padding: 14, border: `1px solid ${t.sectionBorder}` },
    typeSelector: { display: "flex", gap: 4, marginBottom: 10 },
    typeBtn: {
      background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 7,
      padding: "6px 10px", fontSize: 16, cursor: "pointer", transition: "all 0.15s",
    },
    typeBtnActive: { background: t.typeActiveBg, borderColor: t.typeActiveBorder },
    textArea: {
      width: "100%", padding: "10px 12px", borderRadius: 7,
      border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.inputText,
      fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box",
      fontFamily: "inherit",
    },
    addInteractionBtn: {
      background: t.btnPrimaryBg, color: t.btnPrimaryColor, border: "none",
      padding: "8px 16px", borderRadius: 7, fontSize: 13, fontWeight: 600,
      cursor: "pointer", marginTop: 8, fontFamily: "inherit",
    },

    // Timeline
    timeline: { borderLeft: `2px solid ${t.timelineLine}`, marginLeft: 10, paddingLeft: 20 },
    timelineItem: { display: "flex", gap: 10, marginBottom: 14, position: "relative" },
    timelineIcon: {
      position: "absolute", left: -30, top: 0, background: t.appBg,
      fontSize: 14, width: 22, textAlign: "center",
    },
    timelineContent: { flex: 1 },
    timelineDate: { fontSize: 11, color: t.textMuted },
    timelineText: { fontSize: 13, color: t.textSecondary, margin: "4px 0 0", lineHeight: 1.5 },

    // Form
    formOverlay: { padding: "20px 28px" },
    formCard: {
      maxWidth: 700, margin: "0 auto", background: t.cardBg,
      borderRadius: 12, padding: 28, border: `1px solid ${t.cardBorder}`,
    },
    formTitle: { fontSize: 20, fontWeight: 700, marginBottom: 20, color: t.textPrimary },
    formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" },
    formGroup: { marginBottom: 12 },
    label: {
      display: "block", fontSize: 11, textTransform: "uppercase",
      letterSpacing: "1px", color: t.textMuted, marginBottom: 5, fontWeight: 600,
    },
    input: {
      width: "100%", padding: "9px 12px", borderRadius: 7,
      border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.inputText,
      fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
    },
    tagSelector: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 },
    tagBtn: {
      fontSize: 12, padding: "4px 12px", borderRadius: 14,
      border: `1px solid ${t.tagBorder}`, background: t.inputBg, color: t.textSecondary,
      cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
    },
    tagBtnActive: { background: t.tagActiveBg, borderColor: t.tagActiveBorder, color: t.tagActiveColor },
    addTagRow: { display: "flex", gap: 6 },
    tagInput: {
      flex: 1, padding: "6px 10px", borderRadius: 6, border: `1px solid ${t.inputBorder}`,
      background: t.inputBg, color: t.inputText, fontSize: 12, outline: "none", fontFamily: "inherit",
    },
    tagAddBtn: {
      background: t.accentLight, border: `1px solid ${t.accentBorder}`, color: t.accentPrimary,
      padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 14,
    },
    formActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 },
    cancelBtn: {
      background: "none", border: `1px solid ${t.btnSecondaryBorder}`, color: t.btnSecondaryColor,
      padding: "9px 18px", borderRadius: 7, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
    },
    saveBtn: {
      background: t.btnPrimaryBg, color: t.btnPrimaryColor, border: "none",
      padding: "9px 20px", borderRadius: 7, fontSize: 13, fontWeight: 600,
      cursor: "pointer", fontFamily: "inherit",
    },

    // Nav tabs
    navTabs: { display: "flex", gap: 2, marginLeft: 16 },
    navTab: {
      background: "none", border: "none", padding: "6px 14px", borderRadius: 6,
      fontSize: 13, color: t.textSecondary, cursor: "pointer", fontFamily: "inherit",
      fontWeight: 500, transition: "all 0.15s",
    },
    navTabActive: { background: t.accentLight, color: t.accentPrimary, fontWeight: 600 },

    // Data menu
    dataMenu: {
      position: "absolute", top: "100%", right: 0, marginTop: 6,
      background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 8,
      padding: 4, minWidth: 170, zIndex: 200,
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
    },
    dataMenuItem: {
      display: "block", width: "100%", padding: "8px 14px", border: "none",
      background: "none", color: t.textPrimary, fontSize: 13, cursor: "pointer",
      textAlign: "left", borderRadius: 5, fontFamily: "inherit",
    },
    dataMenuDivider: { height: 1, background: t.cardBorder, margin: "4px 8px" },

    // Import toast
    importToast: {
      padding: "10px 28px", background: t.accentLight, color: t.accentPrimary,
      fontSize: 13, fontWeight: 600, textAlign: "center", borderBottom: `1px solid ${t.accentBorder}`,
    },

    // Dashboard
    dashboardWrap: { padding: "20px 28px", maxWidth: 900, margin: "0 auto" },
    dashSection: { marginBottom: 28 },
    dashTitle: {
      fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px",
      color: t.textMuted, margin: "0 0 14px", fontWeight: 600,
    },
    nudgeGrid: { display: "flex", flexDirection: "column", gap: 8 },
    nudgeCard: {
      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
      background: t.cardBg, borderRadius: 8, border: `1px solid ${t.cardBorder}`,
      borderLeft: "3px solid", cursor: "pointer", transition: "border-color 0.2s",
    },
    nudgeIcon: { fontSize: 18, flexShrink: 0 },
    nudgeName: { fontSize: 14, color: t.textPrimary, display: "block" },
    nudgeMsg: { fontSize: 12, color: t.textSecondary, margin: "2px 0 0" },
    nudgeArrow: { color: t.textMuted, fontSize: 16, flexShrink: 0 },
    showAllBtn: {
      background: "none", border: "none", color: t.accentPrimary, fontSize: 12,
      cursor: "pointer", marginTop: 8, padding: "4px 0", fontFamily: "inherit",
    },

    statsGrid: {
      display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
      gap: 12,
    },
    statCard: {
      background: t.cardBg, borderRadius: 8, padding: "16px 18px",
      border: `1px solid ${t.cardBorder}`, textAlign: "center",
    },
    statNumber: {
      fontSize: 28, fontWeight: 700, color: t.accentPrimary, display: "block",
      fontFamily: "'JetBrains Mono', monospace",
    },
    statLabel: { fontSize: 11, color: t.textMuted, marginTop: 4, display: "block" },

    activityList: { display: "flex", flexDirection: "column", gap: 6 },
    activityItem: {
      display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px",
      background: t.cardBg, borderRadius: 8, border: `1px solid ${t.cardBorder}`,
      cursor: "pointer",
    },
    activityIcon: { fontSize: 16, marginTop: 2, flexShrink: 0 },
    activityText: { fontSize: 13, color: t.textPrimary },
    activityContent: { fontSize: 12, color: t.textMuted, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    activityTime: { fontSize: 11, color: t.textMuted, flexShrink: 0, marginTop: 2 },
  };
}
