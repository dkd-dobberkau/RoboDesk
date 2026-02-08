import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "robodesk-contacts";
const TAGS_KEY = "robodesk-tags";
const THEME_KEY = "robodesk-theme";
const LANG_KEY = "robodesk-lang";
const LOCALE_MAP = { de: "de-DE", en: "en-GB", da: "da-DK", fr: "fr-FR" };
const SUPPORTED_LANGS = ["de", "en", "da", "fr"];

const DEFAULT_TAGS = [
  "TYPO3", "dkd", "Client", "Partner", "Community", "Speaker", "Friend", "Family", "Prospect", "Vendor"
];

const RELATIONSHIP_TYPES = ["Professional", "Personal", "Community", "Client", "Partner"];

// ── TRANSLATIONS ──
const translations = {
  de: {
    "nav.dashboard": "Dashboard", "nav.contacts": "Kontakte",
    "header.contacts_count": "{n} Kontakte", "header.overdue": "{n} überfällig", "header.due": "{n} fällig",
    "header.data": "Daten", "header.csv_export": "CSV exportieren", "header.csv_import": "CSV importieren",
    "header.vcf_export": "VCF exportieren", "header.vcf_import": "VCF importieren",
    "header.toggle_theme": "Theme wechseln", "header.new_contact": "+ Neuer Kontakt",
    "import.result": "{imported} Kontakte importiert", "import.skipped": ", {skipped} Duplikate übersprungen",
    "toolbar.search": "Suchen nach Name, Firma, Tag...", "toolbar.all_tags": "Alle Tags",
    "toolbar.all_types": "Alle Typen", "toolbar.sort_name": "Name A–Z",
    "toolbar.sort_last_contact": "Letzter Kontakt", "toolbar.sort_followup": "Follow-Up",
    "toolbar.sort_recent": "Neueste zuerst", "toolbar.sort_strength": "Beziehungsstärke",
    "toolbar.due": "Fällig", "toolbar.select": "Auswählen",
    "bulk.selected": "{n} ausgewählt", "bulk.deselect": "Auswahl aufheben",
    "bulk.select_all": "Alle auswählen", "bulk.set_tags": "Tags setzen",
    "bulk.delete": "Löschen", "bulk.cancel": "Abbrechen",
    "bulk.confirm_delete": "{n} Kontakte löschen?", "bulk.confirm_yes": "Ja, löschen",
    "empty.no_contacts": "Noch keine Kontakte. Starte mit dem ersten!",
    "empty.not_found": "Keine Kontakte gefunden.",
    "empty.welcome": "Willkommen bei RoboDesk! Starte mit dem ersten Kontakt.",
    "dash.recommendations": "Handlungsempfehlungen", "dash.show_less": "Weniger anzeigen",
    "dash.show_all": "Alle {n} anzeigen", "dash.overview": "Übersicht",
    "dash.total_contacts": "Kontakte gesamt", "dash.interactions_month": "Interaktionen diesen Monat",
    "dash.overdue_followups": "Überfällige Follow-ups", "dash.new_month": "Neu diesen Monat",
    "dash.most_active": "Aktivster Bereich ({n})", "dash.avg_strength": "Ø Beziehungsstärke",
    "dash.activity_weeks": "Aktivität (8 Wochen)", "dash.contacts_by_type": "Kontakte nach Typ",
    "dash.recent_activity": "Letzte Aktivitäten",
    "time.today": "Heute", "time.yesterday": "Gestern",
    "time.days_ago": "vor {n} Tagen", "time.days_short": "vor {n}d",
    "type.note": "Notiz", "type.call": "Anruf", "type.meeting": "Meeting",
    "type.email": "E-Mail", "type.event": "Event", "type.idea": "Idee", "type.with": "mit",
    "nudge.overdue": "Follow-up ist {n} Tage überfällig",
    "nudge.due_singular": "Follow-up ist seit {n} Tag fällig",
    "nudge.due_plural": "Follow-up ist seit {n} Tagen fällig",
    "nudge.neglected": "Seit {n} Tagen kein Kontakt",
    "nudge.untouched": "Neuer Kontakt ohne Interaktion",
    "nudge.no_followup": "Kein Follow-up gesetzt",
    "nudge.momentum": "{n} Interaktionen in 30 Tagen — gute Dynamik!",
    "strength.new": "Neu", "strength.strong": "Stark", "strength.good": "Gut",
    "strength.fading": "Nachlassend", "strength.cold": "Kalt",
    "detail.back": "← Zurück", "detail.edit": "Bearbeiten",
    "detail.contact_info": "Kontaktdaten", "detail.status": "Status",
    "detail.created": "Erstellt", "detail.last_contact": "Letzter Kontakt",
    "detail.next_followup": "Nächstes Follow-Up", "detail.set_followup": "Follow-Up setzen:",
    "detail.notes": "Notizen", "detail.tags": "Tags",
    "detail.add_interaction": "Interaktion hinzufügen",
    "detail.what_happened": "Was ist passiert?", "detail.add": "Hinzufügen",
    "detail.timeline": "Timeline ({n})",
    "detail.confirm_delete": "Kontakt {name} wirklich löschen?",
    "detail.confirm_yes": "Ja, löschen", "detail.cancel": "Abbrechen",
    "form.edit_title": "Kontakt bearbeiten", "form.new_title": "Neuer Kontakt",
    "form.name": "Name *", "form.email": "E-Mail", "form.phone": "Telefon",
    "form.company": "Firma", "form.role": "Rolle / Position",
    "form.location": "Standort", "form.linkedin": "LinkedIn", "form.website": "Website",
    "form.relationship_type": "Beziehungstyp", "form.next_followup": "Nächstes Follow-Up",
    "form.notes": "Notizen", "form.tags": "Tags",
    "form.name_placeholder": "Vor- und Nachname", "form.company_placeholder": "Firmenname",
    "form.role_placeholder": "z.B. CTO, Freelancer", "form.location_placeholder": "Stadt, Land",
    "form.type_select": "— wählen —",
    "form.notes_placeholder": "Kontext, Gesprächsthemen, Interessen...",
    "form.new_tag": "Neuer Tag...", "form.cancel": "Abbrechen",
    "form.save": "Speichern", "form.create": "Kontakt anlegen",
    "chart.interactions": "{n} Interaktionen", "chart.unknown": "Unbekannt",
  },
  en: {
    "nav.dashboard": "Dashboard", "nav.contacts": "Contacts",
    "header.contacts_count": "{n} Contacts", "header.overdue": "{n} overdue", "header.due": "{n} due",
    "header.data": "Data", "header.csv_export": "Export CSV", "header.csv_import": "Import CSV",
    "header.vcf_export": "Export VCF", "header.vcf_import": "Import VCF",
    "header.toggle_theme": "Change theme", "header.new_contact": "+ New Contact",
    "import.result": "{imported} contacts imported", "import.skipped": ", {skipped} duplicates skipped",
    "toolbar.search": "Search by name, company, tag...", "toolbar.all_tags": "All Tags",
    "toolbar.all_types": "All Types", "toolbar.sort_name": "Name A–Z",
    "toolbar.sort_last_contact": "Last Contact", "toolbar.sort_followup": "Follow-Up",
    "toolbar.sort_recent": "Newest First", "toolbar.sort_strength": "Relationship Strength",
    "toolbar.due": "Due", "toolbar.select": "Select",
    "bulk.selected": "{n} selected", "bulk.deselect": "Deselect All",
    "bulk.select_all": "Select All", "bulk.set_tags": "Set Tags",
    "bulk.delete": "Delete", "bulk.cancel": "Cancel",
    "bulk.confirm_delete": "Delete {n} contacts?", "bulk.confirm_yes": "Yes, delete",
    "empty.no_contacts": "No contacts yet. Start with your first one!",
    "empty.not_found": "No contacts found.",
    "empty.welcome": "Welcome to RoboDesk! Start with your first contact.",
    "dash.recommendations": "Recommendations", "dash.show_less": "Show less",
    "dash.show_all": "Show all {n}", "dash.overview": "Overview",
    "dash.total_contacts": "Total Contacts", "dash.interactions_month": "Interactions This Month",
    "dash.overdue_followups": "Overdue Follow-ups", "dash.new_month": "New This Month",
    "dash.most_active": "Most Active Area ({n})", "dash.avg_strength": "Avg. Relationship Strength",
    "dash.activity_weeks": "Activity (8 Weeks)", "dash.contacts_by_type": "Contacts by Type",
    "dash.recent_activity": "Recent Activity",
    "time.today": "Today", "time.yesterday": "Yesterday",
    "time.days_ago": "{n} days ago", "time.days_short": "{n}d ago",
    "type.note": "Note", "type.call": "Call", "type.meeting": "Meeting",
    "type.email": "Email", "type.event": "Event", "type.idea": "Idea", "type.with": "with",
    "nudge.overdue": "Follow-up is {n} days overdue",
    "nudge.due_singular": "Follow-up has been due for {n} day",
    "nudge.due_plural": "Follow-up has been due for {n} days",
    "nudge.neglected": "No contact for {n} days",
    "nudge.untouched": "New contact without interaction",
    "nudge.no_followup": "No follow-up set",
    "nudge.momentum": "{n} interactions in 30 days — good momentum!",
    "strength.new": "New", "strength.strong": "Strong", "strength.good": "Good",
    "strength.fading": "Declining", "strength.cold": "Cold",
    "detail.back": "← Back", "detail.edit": "Edit",
    "detail.contact_info": "Contact Details", "detail.status": "Status",
    "detail.created": "Created", "detail.last_contact": "Last Contact",
    "detail.next_followup": "Next Follow-Up", "detail.set_followup": "Set Follow-Up:",
    "detail.notes": "Notes", "detail.tags": "Tags",
    "detail.add_interaction": "Add Interaction",
    "detail.what_happened": "What happened?", "detail.add": "Add",
    "detail.timeline": "Timeline ({n})",
    "detail.confirm_delete": "Really delete contact {name}?",
    "detail.confirm_yes": "Yes, delete", "detail.cancel": "Cancel",
    "form.edit_title": "Edit Contact", "form.new_title": "New Contact",
    "form.name": "Name *", "form.email": "Email", "form.phone": "Phone",
    "form.company": "Company", "form.role": "Role / Position",
    "form.location": "Location", "form.linkedin": "LinkedIn", "form.website": "Website",
    "form.relationship_type": "Relationship Type", "form.next_followup": "Next Follow-Up",
    "form.notes": "Notes", "form.tags": "Tags",
    "form.name_placeholder": "First and last name", "form.company_placeholder": "Company name",
    "form.role_placeholder": "e.g. CTO, Freelancer", "form.location_placeholder": "City, Country",
    "form.type_select": "— select —",
    "form.notes_placeholder": "Context, topics, interests...",
    "form.new_tag": "New tag...", "form.cancel": "Cancel",
    "form.save": "Save", "form.create": "Create Contact",
    "chart.interactions": "{n} Interactions", "chart.unknown": "Unknown",
  },
  da: {
    "nav.dashboard": "Dashboard", "nav.contacts": "Kontakter",
    "header.contacts_count": "{n} Kontakter", "header.overdue": "{n} forsinket", "header.due": "{n} forfalden",
    "header.data": "Data", "header.csv_export": "Eksporter CSV", "header.csv_import": "Importer CSV",
    "header.vcf_export": "Eksporter VCF", "header.vcf_import": "Importer VCF",
    "header.toggle_theme": "Skift tema", "header.new_contact": "+ Ny kontakt",
    "import.result": "{imported} kontakter importeret", "import.skipped": ", {skipped} duplikater sprunget over",
    "toolbar.search": "Søg efter navn, firma, tag...", "toolbar.all_tags": "Alle tags",
    "toolbar.all_types": "Alle typer", "toolbar.sort_name": "Navn A–Z",
    "toolbar.sort_last_contact": "Sidste kontakt", "toolbar.sort_followup": "Opfølgning",
    "toolbar.sort_recent": "Nyeste først", "toolbar.sort_strength": "Relationsstyrke",
    "toolbar.due": "Forfalden", "toolbar.select": "Vælg",
    "bulk.selected": "{n} valgt", "bulk.deselect": "Fjern markering",
    "bulk.select_all": "Vælg alle", "bulk.set_tags": "Sæt tags",
    "bulk.delete": "Slet", "bulk.cancel": "Afbryd",
    "bulk.confirm_delete": "Slet {n} kontakter?", "bulk.confirm_yes": "Ja, slet",
    "empty.no_contacts": "Ingen kontakter endnu. Start med den første!",
    "empty.not_found": "Ingen kontakter fundet.",
    "empty.welcome": "Velkommen til RoboDesk! Start med den første kontakt.",
    "dash.recommendations": "Handlingsanbefalinger", "dash.show_less": "Vis mindre",
    "dash.show_all": "Vis alle {n}", "dash.overview": "Oversigt",
    "dash.total_contacts": "Kontakter i alt", "dash.interactions_month": "Interaktioner denne måned",
    "dash.overdue_followups": "Forfaldne opfølgninger", "dash.new_month": "Nye denne måned",
    "dash.most_active": "Mest aktive område ({n})", "dash.avg_strength": "Ø Relationsstyrke",
    "dash.activity_weeks": "Aktivitet (8 uger)", "dash.contacts_by_type": "Kontakter efter type",
    "dash.recent_activity": "Seneste aktiviteter",
    "time.today": "I dag", "time.yesterday": "I går",
    "time.days_ago": "for {n} dage siden", "time.days_short": "{n}d siden",
    "type.note": "Notat", "type.call": "Opkald", "type.meeting": "Møde",
    "type.email": "E-mail", "type.event": "Begivenhed", "type.idea": "Idé", "type.with": "med",
    "nudge.overdue": "Opfølgning er {n} dage forsinket",
    "nudge.due_singular": "Opfølgning har været forfalden i {n} dag",
    "nudge.due_plural": "Opfølgning har været forfalden i {n} dage",
    "nudge.neglected": "Ingen kontakt i {n} dage",
    "nudge.untouched": "Ny kontakt uden interaktion",
    "nudge.no_followup": "Ingen opfølgning angivet",
    "nudge.momentum": "{n} interaktioner på 30 dage — god dynamik!",
    "strength.new": "Ny", "strength.strong": "Stærk", "strength.good": "God",
    "strength.fading": "Aftagende", "strength.cold": "Kold",
    "detail.back": "← Tilbage", "detail.edit": "Rediger",
    "detail.contact_info": "Kontaktoplysninger", "detail.status": "Status",
    "detail.created": "Oprettet", "detail.last_contact": "Sidste kontakt",
    "detail.next_followup": "Næste opfølgning", "detail.set_followup": "Sæt opfølgning:",
    "detail.notes": "Noter", "detail.tags": "Tags",
    "detail.add_interaction": "Tilføj interaktion",
    "detail.what_happened": "Hvad er der sket?", "detail.add": "Tilføj",
    "detail.timeline": "Tidslinje ({n})",
    "detail.confirm_delete": "Vil du virkelig slette {name}?",
    "detail.confirm_yes": "Ja, slet", "detail.cancel": "Afbryd",
    "form.edit_title": "Rediger kontakt", "form.new_title": "Ny kontakt",
    "form.name": "Navn *", "form.email": "E-mail", "form.phone": "Telefon",
    "form.company": "Firma", "form.role": "Rolle / Position",
    "form.location": "Lokation", "form.linkedin": "LinkedIn", "form.website": "Websted",
    "form.relationship_type": "Relationstype", "form.next_followup": "Næste opfølgning",
    "form.notes": "Noter", "form.tags": "Tags",
    "form.name_placeholder": "For- og efternavn", "form.company_placeholder": "Firmanavn",
    "form.role_placeholder": "f.eks. CTO, freelancer", "form.location_placeholder": "By, land",
    "form.type_select": "— vælg —",
    "form.notes_placeholder": "Kontekst, samtaleemner, interesser...",
    "form.new_tag": "Nyt tag...", "form.cancel": "Afbryd",
    "form.save": "Gem", "form.create": "Opret kontakt",
    "chart.interactions": "{n} Interaktioner", "chart.unknown": "Ukendt",
  },
  fr: {
    "nav.dashboard": "Tableau de bord", "nav.contacts": "Contacts",
    "header.contacts_count": "{n} Contacts", "header.overdue": "{n} en retard", "header.due": "{n} à échéance",
    "header.data": "Données", "header.csv_export": "Exporter CSV", "header.csv_import": "Importer CSV",
    "header.vcf_export": "Exporter VCF", "header.vcf_import": "Importer VCF",
    "header.toggle_theme": "Changer de thème", "header.new_contact": "+ Nouveau contact",
    "import.result": "{imported} contacts importés", "import.skipped": ", {skipped} doublons ignorés",
    "toolbar.search": "Rechercher par nom, entreprise, tag...", "toolbar.all_tags": "Tous les tags",
    "toolbar.all_types": "Tous les types", "toolbar.sort_name": "Nom A–Z",
    "toolbar.sort_last_contact": "Dernier contact", "toolbar.sort_followup": "Suivi",
    "toolbar.sort_recent": "Plus récents", "toolbar.sort_strength": "Force relationnelle",
    "toolbar.due": "À échéance", "toolbar.select": "Sélectionner",
    "bulk.selected": "{n} sélectionné(s)", "bulk.deselect": "Désélectionner",
    "bulk.select_all": "Tout sélectionner", "bulk.set_tags": "Définir les tags",
    "bulk.delete": "Supprimer", "bulk.cancel": "Annuler",
    "bulk.confirm_delete": "Supprimer {n} contacts ?", "bulk.confirm_yes": "Oui, supprimer",
    "empty.no_contacts": "Pas encore de contacts. Commencez par le premier !",
    "empty.not_found": "Aucun contact trouvé.",
    "empty.welcome": "Bienvenue sur RoboDesk ! Commencez par votre premier contact.",
    "dash.recommendations": "Recommandations", "dash.show_less": "Afficher moins",
    "dash.show_all": "Afficher les {n}", "dash.overview": "Aperçu",
    "dash.total_contacts": "Total des contacts", "dash.interactions_month": "Interactions ce mois-ci",
    "dash.overdue_followups": "Suivis en retard", "dash.new_month": "Nouveaux ce mois-ci",
    "dash.most_active": "Domaine le plus actif ({n})", "dash.avg_strength": "Ø Force relationnelle",
    "dash.activity_weeks": "Activité (8 semaines)", "dash.contacts_by_type": "Contacts par type",
    "dash.recent_activity": "Activité récente",
    "time.today": "Aujourd'hui", "time.yesterday": "Hier",
    "time.days_ago": "il y a {n} jours", "time.days_short": "il y a {n}j",
    "type.note": "Note", "type.call": "Appel", "type.meeting": "Réunion",
    "type.email": "E-mail", "type.event": "Événement", "type.idea": "Idée", "type.with": "avec",
    "nudge.overdue": "Le suivi est en retard de {n} jours",
    "nudge.due_singular": "Le suivi est à échéance depuis {n} jour",
    "nudge.due_plural": "Le suivi est à échéance depuis {n} jours",
    "nudge.neglected": "Aucun contact depuis {n} jours",
    "nudge.untouched": "Nouveau contact sans interaction",
    "nudge.no_followup": "Aucun suivi défini",
    "nudge.momentum": "{n} interactions en 30 jours — bonne dynamique !",
    "strength.new": "Nouveau", "strength.strong": "Fort", "strength.good": "Bien",
    "strength.fading": "En baisse", "strength.cold": "Froid",
    "detail.back": "← Retour", "detail.edit": "Modifier",
    "detail.contact_info": "Coordonnées", "detail.status": "Statut",
    "detail.created": "Créé", "detail.last_contact": "Dernier contact",
    "detail.next_followup": "Prochain suivi", "detail.set_followup": "Définir un suivi :",
    "detail.notes": "Notes", "detail.tags": "Tags",
    "detail.add_interaction": "Ajouter une interaction",
    "detail.what_happened": "Que s'est-il passé ?", "detail.add": "Ajouter",
    "detail.timeline": "Chronologie ({n})",
    "detail.confirm_delete": "Voulez-vous vraiment supprimer {name} ?",
    "detail.confirm_yes": "Oui, supprimer", "detail.cancel": "Annuler",
    "form.edit_title": "Modifier le contact", "form.new_title": "Nouveau contact",
    "form.name": "Nom *", "form.email": "E-mail", "form.phone": "Téléphone",
    "form.company": "Entreprise", "form.role": "Rôle / Position",
    "form.location": "Localisation", "form.linkedin": "LinkedIn", "form.website": "Site web",
    "form.relationship_type": "Type de relation", "form.next_followup": "Prochain suivi",
    "form.notes": "Notes", "form.tags": "Tags",
    "form.name_placeholder": "Prénom et nom", "form.company_placeholder": "Nom de l'entreprise",
    "form.role_placeholder": "p. ex. CTO, freelance", "form.location_placeholder": "Ville, pays",
    "form.type_select": "— choisir —",
    "form.notes_placeholder": "Contexte, sujets de conversation, centres d'intérêt...",
    "form.new_tag": "Nouveau tag...", "form.cancel": "Annuler",
    "form.save": "Enregistrer", "form.create": "Créer un contact",
    "chart.interactions": "{n} Interactions", "chart.unknown": "Inconnu",
  },
};

function i18n(lang, key, params = {}) {
  let str = translations[lang]?.[key] || translations.de[key] || key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function daysAgo(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr, lang = "de") {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(LOCALE_MAP[lang] || "de-DE", { day: "2-digit", month: "short", year: "numeric" });
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
        msgKey: "nudge.overdue", msgParams: { n: daysPast } });
    } else if (urgency === "due") {
      nudges.push({ type: "due", priority: 2, contactId: c.id, contactName: c.name,
        msgKey: daysPast === 1 ? "nudge.due_singular" : "nudge.due_plural", msgParams: { n: daysPast } });
    }

    if (lastDays !== null && lastDays > 60 && interactionCount > 0) {
      nudges.push({ type: "neglected", priority: 3, contactId: c.id, contactName: c.name,
        msgKey: "nudge.neglected", msgParams: { n: lastDays } });
    }

    const createdDays = daysAgo(c.createdAt);
    if (createdDays > 7 && interactionCount === 0) {
      nudges.push({ type: "untouched", priority: 4, contactId: c.id, contactName: c.name,
        msgKey: "nudge.untouched", msgParams: {} });
    }

    if (interactionCount > 0 && !c.nextFollowUp) {
      nudges.push({ type: "no-followup", priority: 5, contactId: c.id, contactName: c.name,
        msgKey: "nudge.no_followup", msgParams: {} });
    }

    if (recentInteractions >= 3) {
      nudges.push({ type: "momentum", priority: 6, contactId: c.id, contactName: c.name,
        msgKey: "nudge.momentum", msgParams: { n: recentInteractions } });
    }
  }

  return nudges.sort((a, b) => a.priority - b.priority);
}

// ── RELATIONSHIP STRENGTH ──
function getRelationshipStrength(contact) {
  const interactions = contact.interactions || [];
  if (interactions.length === 0 && !contact.lastContact) return { score: 0, labelKey: "strength.new", color: "#9ca3af" };

  const now = new Date();

  // Recency (40%): exponential decay from last contact
  const lastDays = contact.lastContact ? daysAgo(contact.lastContact) : 999;
  const recency = Math.max(0, 40 * Math.exp(-lastDays / 45));

  // Frequency (30%): interactions per month over last 6 months
  const sixMonthsAgo = new Date(now - 180 * 24 * 60 * 60 * 1000);
  const recentCount = interactions.filter(i => new Date(i.date) >= sixMonthsAgo).length;
  const perMonth = recentCount / 6;
  const frequency = Math.min(30, perMonth * 10);

  // Variety (15%): distinct interaction types
  const types = new Set(interactions.map(x => x.type));
  const variety = types.size >= 5 ? 15 : types.size >= 3 ? 10 : types.size >= 1 ? 5 : 0;

  // Consistency (15%): low standard deviation of gaps
  let consistency = 0;
  if (interactions.length >= 3) {
    const sorted = [...interactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const gaps = [];
    for (let i = 1; i < sorted.length; i++) {
      gaps.push((new Date(sorted[i].date) - new Date(sorted[i - 1].date)) / (1000 * 60 * 60 * 24));
    }
    const avg = gaps.reduce((s, g) => s + g, 0) / gaps.length;
    const stddev = Math.sqrt(gaps.reduce((s, g) => s + (g - avg) ** 2, 0) / gaps.length);
    consistency = Math.max(0, 15 * (1 - stddev / (avg + 1)));
  }

  const score = Math.round(recency + frequency + variety + consistency);
  if (score >= 80) return { score, labelKey: "strength.strong", color: "#16a34a" };
  if (score >= 50) return { score, labelKey: "strength.good", color: null }; // null = use accent color
  if (score >= 20) return { score, labelKey: "strength.fading", color: "#d97706" };
  return { score, labelKey: "strength.cold", color: "#9ca3af" };
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
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkTag, setShowBulkTag] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [lang, setLang] = useState("de");

  const t = themes[theme];
  const i = (key, params) => i18n(lang, key, params);

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
      try {
        const res = await window.storage.get(LANG_KEY);
        if (res?.value && SUPPORTED_LANGS.includes(res.value)) setLang(res.value);
      } catch (e) {}
      setLoading(false);
    }
    load();
  }, []);

  // Close data menu on outside click
  useEffect(() => {
    if (!showDataMenu) return;
    const handleClick = (e) => {
      if (!e.target.closest("[data-menu]")) setShowDataMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDataMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      const tag = e.target.tagName;
      const inInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (e.key === "Escape") {
        if (showDataMenu) { setShowDataMenu(false); return; }
        if (view === "detail" || view === "edit") { setView("list"); setSelectedId(null); return; }
        if (view === "add") { setView("dashboard"); return; }
      }
      if (inInput) return;
      if (e.key === "n") { setView("add"); setSelectedId(null); }
      else if (e.key === "d") setView("dashboard");
      else if (e.key === "k") setView("list");
      else if (e.key === "/") {
        e.preventDefault();
        setView("list");
        setTimeout(() => document.querySelector("[data-search]")?.focus(), 50);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [view, showDataMenu]);

  const toggleTheme = async () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try { await window.storage.set(THEME_KEY, next); } catch (e) {}
  };

  const changeLang = async (newLang) => {
    setLang(newLang);
    try { await window.storage.set(LANG_KEY, newLang); } catch (e) {}
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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

  const toggleBulkSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const bulkSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(c => c.id)));
  };

  const bulkAddTag = (tag) => {
    const updated = contacts.map(c => {
      if (!selectedIds.has(c.id)) return c;
      const tags = (c.tags || []).includes(tag) ? c.tags : [...(c.tags || []), tag];
      return { ...c, tags };
    });
    saveContacts(updated);
    setShowBulkTag(false);
  };

  const bulkRemoveTag = (tag) => {
    const updated = contacts.map(c => {
      if (!selectedIds.has(c.id)) return c;
      return { ...c, tags: (c.tags || []).filter(t => t !== tag) };
    });
    saveContacts(updated);
    setShowBulkTag(false);
  };

  const bulkDelete = () => {
    saveContacts(contacts.filter(c => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
    setBulkMode(false);
    setShowBulkDelete(false);
  };

  const bulkExport = (format) => {
    const selected = contacts.filter(c => selectedIds.has(c.id));
    if (format === "csv") exportCsv(selected);
    else exportVcf(selected);
  };

  const exitBulkMode = () => {
    setBulkMode(false);
    setSelectedIds(new Set());
    setShowBulkTag(false);
    setShowBulkDelete(false);
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
    if (sortBy === "strength") return getRelationshipStrength(b).score - getRelationshipStrength(a).score;
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
        [data-menu-item]:hover { background: ${t.accentLight} !important; }
        @media (max-width: 640px) {
          header { flex-wrap: wrap !important; gap: 8px !important; padding: 12px 16px !important; }
          [data-header-left] { width: 100% !important; }
          [data-header-right] { width: 100% !important; justify-content: flex-end !important; }
          [data-toolbar] { padding: 10px 16px !important; }
          [data-contact-grid] { grid-template-columns: 1fr !important; padding: 12px 16px !important; }
          [data-detail-grid] { grid-template-columns: 1fr !important; }
          [data-form-grid] { grid-template-columns: 1fr !important; }
          [data-stats-grid] { grid-template-columns: 1fr 1fr !important; }
          [data-dashboard] { padding: 12px 16px !important; }
        }
      `}</style>

      <header style={s.header}>
        <div style={s.headerLeft} data-header-left>
          <h1 style={s.logo}>
            <span style={s.logoIcon}>⚡</span> RoboDesk
          </h1>
          <div style={s.navTabs}>
            <button style={{...s.navTab, ...(view === "dashboard" ? s.navTabActive : {})}} onClick={() => setView("dashboard")}>{i("nav.dashboard")}</button>
            <button style={{...s.navTab, ...(view === "list" || view === "detail" || view === "edit" ? s.navTabActive : {})}} onClick={() => setView("list")}>{i("nav.contacts")}</button>
          </div>
        </div>
        <div style={s.headerRight} data-header-right>
          <div style={s.statsRow}>
            <span style={s.stat}>{i("header.contacts_count", { n: contacts.length })}</span>
            {dueCount > 0 && (
              <span style={{...s.stat, ...s.statAlert}} onClick={() => { setShowFollowUpOnly(!showFollowUpOnly); setView("list"); }}>
                {overdueCount > 0 ? i("header.overdue", { n: overdueCount }) : i("header.due", { n: dueCount })}
              </span>
            )}
          </div>
          <div style={{ position: "relative" }} data-menu>
            <button style={s.themeToggle} onClick={() => setShowDataMenu(!showDataMenu)} title={i("header.data")}>📁</button>
            {showDataMenu && (
              <div style={s.dataMenu}>
                <button style={s.dataMenuItem} data-menu-item onClick={() => { exportCsv(contacts); setShowDataMenu(false); }}>{i("header.csv_export")}</button>
                <button style={s.dataMenuItem} data-menu-item onClick={() => handleImportFile(".csv", importCsv)}>{i("header.csv_import")}</button>
                <div style={s.dataMenuDivider} />
                <button style={s.dataMenuItem} data-menu-item onClick={() => { exportVcf(contacts); setShowDataMenu(false); }}>{i("header.vcf_export")}</button>
                <button style={s.dataMenuItem} data-menu-item onClick={() => handleImportFile(".vcf", importVcf)}>{i("header.vcf_import")}</button>
              </div>
            )}
          </div>
          <select style={s.langSelect} value={lang} onChange={e => changeLang(e.target.value)}>
            {SUPPORTED_LANGS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
          <button style={s.themeToggle} onClick={toggleTheme} title={i("header.toggle_theme")}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button style={s.addBtn} onClick={() => { setView("add"); setSelectedId(null); }}>{i("header.new_contact")}</button>
        </div>
      </header>

      {importResult && (
        <div style={s.importToast}>
          {i("import.result", { imported: importResult.imported.length })}{importResult.skipped > 0 ? i("import.skipped", { skipped: importResult.skipped }) : ""}
        </div>
      )}

      {view === "dashboard" && (
        <Dashboard
          contacts={contacts}
          onOpenContact={(id) => { setSelectedId(id); setView("detail"); }}
          s={s} t={t} i={i} lang={lang}
        />
      )}

      {view === "add" && (
        <ContactForm onSave={addContact} onCancel={() => setView("dashboard")} tags={tags} onAddTag={(tag) => saveTags([...tags, tag])} s={s} t={t} i={i} />
      )}

      {view === "edit" && selectedContact && (
        <ContactForm contact={selectedContact} onSave={(c) => { updateContact(c); setView("detail"); }} onCancel={() => setView("detail")} tags={tags} onAddTag={(tag) => saveTags([...tags, tag])} s={s} t={t} i={i} />
      )}

      {view === "detail" && selectedContact && (
        <ContactDetail
          contact={selectedContact}
          onEdit={() => setView("edit")}
          onDelete={deleteContact}
          onBack={() => { setView("list"); setSelectedId(null); }}
          onAddInteraction={(inter) => addInteraction(selectedContact.id, inter)}
          onUpdate={updateContact}
          s={s} t={t} i={i} lang={lang}
        />
      )}

      {view === "list" && (
        <>
          {bulkMode ? (
            <div style={s.bulkToolbar} data-toolbar>
              <span style={s.bulkCount}>{i("bulk.selected", { n: selectedIds.size })}</span>
              <button style={s.bulkBtn} onClick={bulkSelectAll}>
                {selectedIds.size === filtered.length ? i("bulk.deselect") : i("bulk.select_all")}
              </button>
              <div style={{ position: "relative" }}>
                <button style={s.bulkBtn} onClick={() => setShowBulkTag(!showBulkTag)}>{i("bulk.set_tags")}</button>
                {showBulkTag && (
                  <div style={s.dataMenu}>
                    {tags.map(tag => (
                      <button key={tag} style={s.dataMenuItem} data-menu-item onClick={() => bulkAddTag(tag)}>+ {tag}</button>
                    ))}
                    <div style={s.dataMenuDivider} />
                    {tags.map(tag => (
                      <button key={"rm-" + tag} style={{...s.dataMenuItem, color: "#dc2626"}} data-menu-item onClick={() => bulkRemoveTag(tag)}>− {tag}</button>
                    ))}
                  </div>
                )}
              </div>
              <button style={s.bulkBtn} onClick={() => bulkExport("csv")} disabled={selectedIds.size === 0}>CSV</button>
              <button style={s.bulkBtn} onClick={() => bulkExport("vcf")} disabled={selectedIds.size === 0}>VCF</button>
              <button style={{...s.bulkBtn, color: "#dc2626"}} onClick={() => setShowBulkDelete(true)} disabled={selectedIds.size === 0}>{i("bulk.delete")}</button>
              <button style={s.bulkBtn} onClick={exitBulkMode}>{i("bulk.cancel")}</button>
            </div>
          ) : (
            <div style={s.toolbar} data-toolbar>
              <input
                style={s.searchInput}
                placeholder={i("toolbar.search")}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                data-search
              />
              <select style={s.filterSelect} value={filterTag} onChange={e => setFilterTag(e.target.value)}>
                <option value="all">{i("toolbar.all_tags")}</option>
                {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
              <select style={s.filterSelect} value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="all">{i("toolbar.all_types")}</option>
                {RELATIONSHIP_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
              </select>
              <select style={s.filterSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="name">{i("toolbar.sort_name")}</option>
                <option value="lastContact">{i("toolbar.sort_last_contact")}</option>
                <option value="followUp">{i("toolbar.sort_followup")}</option>
                <option value="recent">{i("toolbar.sort_recent")}</option>
                <option value="strength">{i("toolbar.sort_strength")}</option>
              </select>
              <button
                style={{...s.filterToggle, ...(showFollowUpOnly ? s.filterToggleActive : {})}}
                onClick={() => setShowFollowUpOnly(!showFollowUpOnly)}
              >⏰ {i("toolbar.due")}</button>
              <button style={s.filterToggle} onClick={() => setBulkMode(true)}>☑ {i("toolbar.select")}</button>
            </div>
          )}

          {showBulkDelete && (
            <div style={s.importToast}>
              <span>{i("bulk.confirm_delete", { n: selectedIds.size })} </span>
              <button style={{...s.bulkBtn, color: "#fff", background: "#dc2626", marginLeft: 8}} onClick={bulkDelete}>{i("bulk.confirm_yes")}</button>
              <button style={{...s.bulkBtn, marginLeft: 4}} onClick={() => setShowBulkDelete(false)}>{i("bulk.cancel")}</button>
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>📇</div>
              <p style={s.emptyText}>{contacts.length === 0 ? i("empty.no_contacts") : i("empty.not_found")}</p>
            </div>
          ) : (
            <div style={s.contactGrid} data-contact-grid>
              {filtered.map(c => (
                <ContactCard
                  key={c.id} contact={c} s={s} t={t} i={i} lang={lang}
                  bulkMode={bulkMode}
                  selected={selectedIds.has(c.id)}
                  onClick={() => {
                    if (bulkMode) toggleBulkSelect(c.id);
                    else { setSelectedId(c.id); setView("detail"); }
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── CHARTS ──
function ActivityChart({ contacts, t, i }) {
  const now = new Date();
  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now - (i * 7 + now.getDay()) * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    let count = 0;
    contacts.forEach(c => (c.interactions || []).forEach(int => {
      const d = new Date(int.date);
      if (d >= weekStart && d < weekEnd) count++;
    }));
    const label = `${weekStart.getDate()}.${weekStart.getMonth() + 1}`;
    weeks.push({ count, label });
  }
  const max = Math.max(1, ...weeks.map(w => w.count));
  const barW = 32, gap = 8, h = 120, padBottom = 20;
  const totalW = weeks.length * (barW + gap) - gap;

  return (
    <svg width={totalW} height={h + padBottom} style={{ display: "block" }}>
      {weeks.map((w, idx) => {
        const barH = (w.count / max) * h;
        const x = idx * (barW + gap);
        return (
          <g key={idx}>
            <rect x={x} y={h - barH} width={barW} height={barH} rx={4} fill={t.accentPrimary} opacity={0.7}>
              <title>{i("chart.interactions", { n: w.count })}</title>
            </rect>
            {w.count > 0 && (
              <text x={x + barW / 2} y={h - barH - 4} textAnchor="middle" fontSize={10} fill={t.textMuted}>{w.count}</text>
            )}
            <text x={x + barW / 2} y={h + 14} textAnchor="middle" fontSize={9} fill={t.textMuted}>{w.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function TypeDonut({ contacts, t, i }) {
  const counts = {};
  contacts.forEach(c => {
    const rt = c.relationshipType || i("chart.unknown");
    counts[rt] = (counts[rt] || 0) + 1;
  });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;
  const total = contacts.length;
  const colors = ["#2a6b5a", "#b05e3a", "#3a6b9d", "#6d5a8f", "#8b6534", "#4a7a4a"];
  const r = 50, cx = 60, cy = 60, inner = 30;
  let angle = -Math.PI / 2;

  const arcs = entries.map(([name, count], idx) => {
    const sweep = (count / total) * 2 * Math.PI;
    const startAngle = angle;
    angle += sweep;
    const endAngle = angle;
    const largeArc = sweep > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + inner * Math.cos(endAngle), iy1 = cy + inner * Math.sin(endAngle);
    const ix2 = cx + inner * Math.cos(startAngle), iy2 = cy + inner * Math.sin(startAngle);
    const d = `M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} L${ix1},${iy1} A${inner},${inner} 0 ${largeArc} 0 ${ix2},${iy2} Z`;
    return { name, count, color: colors[idx % colors.length], d };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={120} height={120}>
        {arcs.map((a, idx) => (
          <path key={i} d={a.d} fill={a.color} opacity={0.8}>
            <title>{a.name}: {a.count}</title>
          </path>
        ))}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {arcs.map((a, idx) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: t.textSecondary }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: a.color, flexShrink: 0 }} />
            <span>{a.name} ({a.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InteractionTimeline({ interactions, t, lang }) {
  if (!interactions || interactions.length === 0) return null;
  const sorted = [...interactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const typeIcons = { note: "📝", call: "📞", meeting: "🤝", email: "✉️", event: "🎪", idea: "💡" };
  const first = new Date(sorted[0].date);
  const last = new Date(sorted[sorted.length - 1].date);
  const span = Math.max(1, (last - first) / (1000 * 60 * 60 * 24));
  const h = Math.max(200, sorted.length * 40);

  return (
    <div style={{ position: "relative", marginLeft: 20, paddingLeft: 30, borderLeft: `2px solid ${t.accentPrimary}33` }}>
      {sorted.map((int, idx) => {
        const days = (new Date(int.date) - first) / (1000 * 60 * 60 * 24);
        const top = span > 0 ? (days / span) * (h - 40) : i * 40;
        return (
          <div key={int.id || i} style={{ position: "relative", marginBottom: 12 }}>
            <div style={{
              position: "absolute", left: -39, top: 2, width: 18, height: 18,
              borderRadius: "50%", background: t.accentPrimary, display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 10,
            }}>
              <span>{typeIcons[int.type] || "📝"}</span>
            </div>
            <div style={{ paddingLeft: 4 }}>
              <span style={{ fontSize: 11, color: t.textMuted }}>{formatDate(int.date, lang)}</span>
              <p style={{ fontSize: 13, color: t.textSecondary, margin: "2px 0 0", lineHeight: 1.4 }}>{int.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── DASHBOARD ──
function Dashboard({ contacts, onOpenContact, s, t, i, lang }) {
  const nudges = generateNudges(contacts);
  const [showAllNudges, setShowAllNudges] = useState(false);
  const displayNudges = showAllNudges ? nudges : nudges.slice(0, 5);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const allInteractions = contacts.flatMap(c => (c.interactions || []).map(x => ({ ...x, contactName: c.name, contactId: c.id })));
  const monthlyInteractions = allInteractions.filter(i => new Date(i.date) >= monthStart);
  const newThisMonth = contacts.filter(c => new Date(c.createdAt) >= monthStart);
  const overdueContacts = contacts.filter(c => getFollowUpUrgency(c) === "overdue");

  const typeCounts = {};
  monthlyInteractions.forEach(inter => {
    const c = contacts.find(x => x.id === inter.contactId);
    const rt = c?.relationshipType || i("chart.unknown");
    typeCounts[rt] = (typeCounts[rt] || 0) + 1;
  });
  const mostActiveType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
  const avgStrength = contacts.length > 0 ? Math.round(contacts.reduce((s, c) => s + getRelationshipStrength(c).score, 0) / contacts.length) : 0;
  const avgStrengthData = getRelationshipStrength({ interactions: [], lastContact: null }); // just for color lookup
  const avgColor = avgStrength >= 80 ? "#16a34a" : avgStrength >= 50 ? t.accentPrimary : avgStrength >= 20 ? "#d97706" : "#9ca3af";

  const recentActivity = [...allInteractions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  const typeIcons = { note: "📝", call: "📞", meeting: "🤝", email: "✉️", event: "🎪", idea: "💡" };
  const nudgeIcons = { overdue: "🔴", due: "🟠", neglected: "😶", untouched: "🆕", "no-followup": "📋", momentum: "🚀" };
  const nudgeColors = { overdue: "#dc2626", due: "#ea580c", neglected: t.accentPrimary, untouched: t.accentPrimary, "no-followup": t.accentPrimary, momentum: "#16a34a" };

  return (
    <div style={s.dashboardWrap} data-dashboard>
      {nudges.length > 0 && (
        <div style={s.dashSection}>
          <h3 style={s.dashTitle}>{i("dash.recommendations")}</h3>
          <div style={s.nudgeGrid}>
            {displayNudges.map((n, idx) => (
              <div key={idx} style={{...s.nudgeCard, borderLeftColor: nudgeColors[n.type]}} onClick={() => onOpenContact(n.contactId)}>
                <span style={s.nudgeIcon}>{nudgeIcons[n.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={s.nudgeName}>{n.contactName}</strong>
                  <p style={s.nudgeMsg}>{i(n.msgKey, n.msgParams)}</p>
                </div>
                <span style={s.nudgeArrow}>→</span>
              </div>
            ))}
          </div>
          {nudges.length > 5 && (
            <button style={s.showAllBtn} onClick={() => setShowAllNudges(!showAllNudges)}>
              {showAllNudges ? i("dash.show_less") : i("dash.show_all", { n: nudges.length })}
            </button>
          )}
        </div>
      )}

      <div style={s.dashSection}>
        <h3 style={s.dashTitle}>{i("dash.overview")}</h3>
        <div style={s.statsGrid} data-stats-grid>
          <div style={s.statCard}>
            <span style={s.statNumber}>{contacts.length}</span>
            <span style={s.statLabel}>{i("dash.total_contacts")}</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statNumber}>{monthlyInteractions.length}</span>
            <span style={s.statLabel}>{i("dash.interactions_month")}</span>
          </div>
          <div style={{...s.statCard, ...(overdueContacts.length > 0 ? { borderColor: "#dc262633" } : {})}}>
            <span style={{...s.statNumber, ...(overdueContacts.length > 0 ? { color: "#dc2626" } : {})}}>{overdueContacts.length}</span>
            <span style={s.statLabel}>{i("dash.overdue_followups")}</span>
          </div>
          <div style={s.statCard}>
            <span style={s.statNumber}>{newThisMonth.length}</span>
            <span style={s.statLabel}>{i("dash.new_month")}</span>
          </div>
          {mostActiveType && (
            <div style={s.statCard}>
              <span style={s.statNumber}>{mostActiveType[0]}</span>
              <span style={s.statLabel}>{i("dash.most_active", { n: mostActiveType[1] })}</span>
            </div>
          )}
          {contacts.length > 0 && (
            <div style={s.statCard}>
              <span style={{...s.statNumber, color: avgColor}}>{avgStrength}</span>
              <span style={s.statLabel}>{i("dash.avg_strength")}</span>
            </div>
          )}
        </div>
      </div>

      {allInteractions.length > 0 && (
        <div style={{...s.dashSection, display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start"}}>
          <div>
            <h3 style={s.dashTitle}>{i("dash.activity_weeks")}</h3>
            <div style={{...s.statCard, padding: "16px 20px", display: "inline-block"}}>
              <ActivityChart contacts={contacts} t={t} i={i} />
            </div>
          </div>
          {contacts.length > 0 && (
            <div>
              <h3 style={s.dashTitle}>{i("dash.contacts_by_type")}</h3>
              <div style={{...s.statCard, padding: "16px 20px", display: "inline-block"}}>
                <TypeDonut contacts={contacts} t={t} i={i} />
              </div>
            </div>
          )}
        </div>
      )}

      {recentActivity.length > 0 && (
        <div style={s.dashSection}>
          <h3 style={s.dashTitle}>{i("dash.recent_activity")}</h3>
          <div style={s.activityList}>
            {recentActivity.map((a, idx) => {
              const d = daysAgo(a.date);
              const relTime = d === 0 ? i("time.today") : d === 1 ? i("time.yesterday") : i("time.days_ago", { n: d });
              return (
                <div key={idx} style={s.activityItem} onClick={() => onOpenContact(a.contactId)}>
                  <span style={s.activityIcon}>{typeIcons[a.type] || "📝"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={s.activityText}>{i(`type.${a.type}`) || i("type.note")} {i("type.with")} <strong>{a.contactName}</strong></span>
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
          <p style={s.emptyText}>{i("empty.welcome")}</p>
        </div>
      )}
    </div>
  );
}

// ── CONTACT CARD ──
function ContactCard({ contact, onClick, s, t, i, lang, bulkMode, selected }) {
  const urgency = getFollowUpUrgency(contact);
  const lastDays = daysAgo(contact.lastContact);
  const initials = (contact.name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const urgencyColors = { overdue: "#dc2626", due: "#ea580c", soon: "#d97706", upcoming: "#16a34a", none: "transparent" };
  const strength = getRelationshipStrength(contact);
  const strengthColor = strength.color || t.accentPrimary;

  return (
    <div style={{...s.card, ...(selected ? { borderColor: t.accentPrimary, boxShadow: `0 0 0 2px ${t.accentPrimary}33` } : {})}} onClick={onClick}>
      {urgency !== "none" && <div style={{...s.cardUrgencyBar, backgroundColor: urgencyColors[urgency]}} />}
      {bulkMode && (
        <div style={s.bulkCheckbox}>
          <div style={{...s.checkbox, ...(selected ? s.checkboxActive : {})}}>
            {selected && "✓"}
          </div>
        </div>
      )}
      <div style={s.cardTop}>
        <div style={{...s.avatar, backgroundColor: stringToColor(contact.name || "")}}>{initials}</div>
        <div style={s.cardInfo}>
          <h3 style={s.cardName}>{contact.name}</h3>
          {contact.company && <p style={s.cardCompany}>{contact.role ? `${contact.role} · ` : ""}{contact.company}</p>}
        </div>
      </div>
      <div style={s.cardMeta}>
        {lastDays !== null && (
          <span style={s.cardMetaItem}>{lastDays === 0 ? i("time.today") : lastDays === 1 ? i("time.yesterday") : i("time.days_short", { n: lastDays })}</span>
        )}
        {contact.nextFollowUp && (
          <span style={{...s.cardMetaItem, color: urgencyColors[urgency] || t.textMuted}}>
            ⏰ {formatDate(contact.nextFollowUp, lang)}
          </span>
        )}
      </div>
      {(contact.tags || []).length > 0 && (
        <div style={s.cardTags}>
          {contact.tags.slice(0, 4).map(tag => <span key={tag} style={s.tag}>{tag}</span>)}
          {contact.tags.length > 4 && <span style={{fontSize: 10, color: t.textMuted}}>+{contact.tags.length - 4}</span>}
        </div>
      )}
      <div style={{...s.strengthBar, backgroundColor: strengthColor + "33"}}>
        <div style={{...s.strengthFill, width: `${strength.score}%`, backgroundColor: strengthColor}} />
      </div>
    </div>
  );
}

// ── CONTACT DETAIL ──
function ContactDetail({ contact, onEdit, onDelete, onBack, onAddInteraction, onUpdate, s, t, i, lang }) {
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
  const strength = getRelationshipStrength(contact);
  const strengthColor = strength.color || t.accentPrimary;

  return (
    <div style={s.detailView}>
      <button style={s.backBtn} onClick={onBack}>{i("detail.back")}</button>

      <div style={s.detailHeader}>
        <div style={{...s.avatarLarge, backgroundColor: stringToColor(contact.name || "")}}>{initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={s.detailName}>{contact.name}</h2>
            <span style={{ fontSize: 12, fontWeight: 600, color: strengthColor, background: strengthColor + "1a", padding: "2px 8px", borderRadius: 10 }}>
              {strength.score} · {i(strength.labelKey)}
            </span>
          </div>
          {contact.company && <p style={s.detailRole}>{contact.role ? `${contact.role} · ` : ""}{contact.company}</p>}
          {contact.relationshipType && <span style={s.relType}>{contact.relationshipType}</span>}
        </div>
        <div style={s.detailActions}>
          <button style={s.editBtn} onClick={onEdit}>✏️ {i("detail.edit")}</button>
          <button style={s.deleteBtn} onClick={() => setShowDeleteConfirm(true)}>🗑</button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div style={s.confirmBox}>
          <p style={{ margin: "0 0 10px", color: t.textPrimary }}>{i("detail.confirm_delete", { name: contact.name })}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={s.confirmYes} onClick={() => onDelete(contact.id)}>{i("detail.confirm_yes")}</button>
            <button style={s.confirmNo} onClick={() => setShowDeleteConfirm(false)}>{i("detail.cancel")}</button>
          </div>
        </div>
      )}

      <div style={s.detailGrid} data-detail-grid>
        <div style={s.detailSection}>
          <h4 style={s.sectionTitle}>{i("detail.contact_info")}</h4>
          <div style={s.fieldGroup}>
            {contact.email && <p style={s.fieldLine}>✉️ <a href={`mailto:${contact.email}`} style={s.link}>{contact.email}</a></p>}
            {contact.phone && <p style={s.fieldLine}>📞 {contact.phone}</p>}
            {contact.location && <p style={s.fieldLine}>📍 {contact.location}</p>}
            {contact.linkedin && <p style={s.fieldLine}>🔗 <a href={contact.linkedin} target="_blank" rel="noreferrer" style={s.link}>LinkedIn</a></p>}
            {contact.website && <p style={s.fieldLine}>🌐 <a href={contact.website} target="_blank" rel="noreferrer" style={s.link}>{contact.website}</a></p>}
          </div>
        </div>

        <div style={s.detailSection}>
          <h4 style={s.sectionTitle}>{i("detail.status")}</h4>
          <div style={s.fieldGroup}>
            <p style={s.fieldLine}>📅 {i("detail.created")}: {formatDate(contact.createdAt, lang)}</p>
            <p style={s.fieldLine}>🤝 {i("detail.last_contact")}: {formatDate(contact.lastContact, lang)}</p>
            <p style={s.fieldLine}>⏰ {i("detail.next_followup")}: {formatDate(contact.nextFollowUp, lang)}</p>
            <div style={{ marginTop: 8 }}>
              <label style={s.smallLabel}>{i("detail.set_followup")}</label>
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
          <h4 style={s.sectionTitle}>{i("detail.notes")}</h4>
          <p style={s.notesBlock}>{contact.notes}</p>
        </div>
      )}

      {(contact.tags || []).length > 0 && (
        <div style={s.detailSection}>
          <h4 style={s.sectionTitle}>{i("detail.tags")}</h4>
          <div style={s.tagRow}>{contact.tags.map(tag => <span key={tag} style={s.tag}>{tag}</span>)}</div>
        </div>
      )}

      <div style={s.detailSection}>
        <h4 style={s.sectionTitle}>{i("detail.add_interaction")}</h4>
        <div style={s.interactionBox}>
          <div style={s.typeSelector}>
            {Object.entries(typeIcons).map(([k, icon]) => (
              <button key={k} style={{...s.typeBtn, ...(noteType === k ? s.typeBtnActive : {})}} onClick={() => setNoteType(k)} title={k}>{icon}</button>
            ))}
          </div>
          <textarea
            style={s.textArea}
            placeholder={i("detail.what_happened")}
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            rows={2}
          />
          <button style={s.addInteractionBtn} onClick={handleAddInteraction} disabled={!newNote.trim()}>{i("detail.add")}</button>
        </div>
      </div>

      {(contact.interactions || []).length > 0 && (
        <div style={s.detailSection}>
          <h4 style={s.sectionTitle}>{i("detail.timeline", { n: contact.interactions.length })}</h4>
          <InteractionTimeline interactions={contact.interactions} t={t} lang={lang} />
        </div>
      )}
    </div>
  );
}

// ── CONTACT FORM ──
function ContactForm({ contact, onSave, onCancel, tags, onAddTag, s, t, i }) {
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
        <h2 style={s.formTitle}>{contact ? i("form.edit_title") : i("form.new_title")}</h2>

        <div style={s.formGrid} data-form-grid>
          <div style={s.formGroup}>
            <label style={s.label}>{i("form.name")}</label>
            <input style={s.input} value={form.name} onChange={e => set("name", e.target.value)} placeholder={i("form.name_placeholder")} />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>{i("form.email")}</label>
            <input style={s.input} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@example.com" />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>{i("form.phone")}</label>
            <input style={s.input} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+49..." />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>{i("form.company")}</label>
            <input style={s.input} value={form.company} onChange={e => set("company", e.target.value)} placeholder={i("form.company_placeholder")} />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>{i("form.role")}</label>
            <input style={s.input} value={form.role} onChange={e => set("role", e.target.value)} placeholder={i("form.role_placeholder")} />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>{i("form.location")}</label>
            <input style={s.input} value={form.location} onChange={e => set("location", e.target.value)} placeholder={i("form.location_placeholder")} />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>{i("form.linkedin")}</label>
            <input style={s.input} value={form.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>{i("form.website")}</label>
            <input style={s.input} value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://..." />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>{i("form.relationship_type")}</label>
            <select style={s.input} value={form.relationshipType} onChange={e => set("relationshipType", e.target.value)}>
              <option value="">{i("form.type_select")}</option>
              {RELATIONSHIP_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
            </select>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>{i("form.next_followup")}</label>
            <input style={s.input} type="date" value={form.nextFollowUp || ""} onChange={e => set("nextFollowUp", e.target.value || null)} />
          </div>
        </div>

        <div style={s.formGroup}>
          <label style={s.label}>{i("form.notes")}</label>
          <textarea style={{...s.input, minHeight: 80}} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder={i("form.notes_placeholder")} />
        </div>

        <div style={s.formGroup}>
          <label style={s.label}>{i("form.tags")}</label>
          <div style={s.tagSelector}>
            {tags.map(tag => (
              <button key={tag} style={{...s.tagBtn, ...((form.tags || []).includes(tag) ? s.tagBtnActive : {})}} onClick={() => toggleTag(tag)}>{tag}</button>
            ))}
          </div>
          <div style={s.addTagRow}>
            <input style={s.tagInput} placeholder={i("form.new_tag")} value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddNewTag()} />
            <button style={s.tagAddBtn} onClick={handleAddNewTag}>+</button>
          </div>
        </div>

        <div style={s.formActions}>
          <button style={s.cancelBtn} onClick={onCancel}>{i("form.cancel")}</button>
          <button style={s.saveBtn} onClick={() => form.name.trim() && onSave(form)} disabled={!form.name.trim()}>
            {contact ? i("form.save") : i("form.create")}
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
    langSelect: {
      padding: "6px 8px", borderRadius: 6, border: `1px solid ${t.inputBorder}`,
      background: t.inputBg, color: t.textSecondary, fontSize: 11, fontWeight: 600,
      cursor: "pointer", fontFamily: "inherit", outline: "none", letterSpacing: "0.5px",
    },
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

    // Bulk mode
    bulkToolbar: {
      display: "flex", gap: 8, padding: "10px 28px", alignItems: "center",
      flexWrap: "wrap", borderBottom: `1px solid ${t.headerBorder}`,
      background: t.accentLight,
    },
    bulkCount: { fontSize: 13, fontWeight: 600, color: t.accentPrimary, marginRight: 8 },
    bulkBtn: {
      padding: "6px 12px", borderRadius: 6, border: `1px solid ${t.inputBorder}`,
      background: t.inputBg, color: t.textSecondary, fontSize: 12, cursor: "pointer",
      fontFamily: "inherit",
    },
    bulkCheckbox: { position: "absolute", top: 8, right: 8, zIndex: 2 },
    checkbox: {
      width: 20, height: 20, borderRadius: 4, border: `2px solid ${t.inputBorder}`,
      background: t.inputBg, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 700, color: "#fff",
    },
    checkboxActive: {
      background: t.accentPrimary, borderColor: t.accentPrimary,
    },

    // Strength bar
    strengthBar: {
      height: 3, borderRadius: 2, marginTop: 10, overflow: "hidden",
    },
    strengthFill: {
      height: "100%", borderRadius: 2, transition: "width 0.3s",
    },
  };
}
