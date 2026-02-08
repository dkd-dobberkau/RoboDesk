#!/usr/bin/env node
// Generates test data for RoboDesk: contacts.csv + seed.json
import { writeFileSync } from "fs";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function randomDate(minDaysAgo, maxDaysAgo) {
  return daysAgo(randomInt(minDaysAgo, maxDaysAgo));
}
function randomBirthday() {
  const month = String(randomInt(1, 12)).padStart(2, "0");
  const day = String(randomInt(1, 28)).padStart(2, "0");
  if (Math.random() > 0.5) {
    const year = randomInt(1965, 2000);
    return `${year}-${month}-${day}`;
  }
  return `--${month}-${day}`;
}

const FIRST_NAMES = [
  "Anna", "Benni", "Celine", "Daniel", "Elena", "Felix", "Greta", "Henrik",
  "Isabelle", "Jan", "Katrin", "Lars", "Marie", "Nico", "Olivia", "Patrick",
  "Quincy", "Rosa", "Stefan", "Tina", "Uwe", "Vera", "Wolfgang", "Xenia",
  "Yasmin", "Zoran", "Achim", "Birgit", "Claus", "Dagmar", "Erik", "Franziska",
  "Georg", "Hanna", "Ingrid", "Jens", "Klaus", "Lena", "Markus", "Nadine",
  "Oliver", "Petra", "Robert", "Susanne", "Thomas", "Ulrike", "Viktor", "Waltraud",
  "Mathias", "Sabine", "Christian", "Andrea", "Michael", "Martina", "Andreas",
  "Claudia", "Martin", "Monika", "Peter", "Gabriele", "Alexander", "Kerstin",
  "Tobias", "Silke", "Florian", "Heike", "Sebastian", "Anja", "Marco", "Nicole",
  "Sven", "Simone", "Torsten", "Melanie", "Ralf", "Stefanie", "Karsten", "Manuela",
  "Nils", "Sonja", "Bjorn", "Camille", "Dimitri", "Estelle", "Fabien", "Helene",
  "Igor", "Juliette", "Konstantin", "Lucienne", "Morten", "Nathalie", "Oscar",
  "Pauline", "Rasmus", "Sophie", "Tristan", "Ursula", "Valentin", "Wilma",
  "Mads", "Freya", "Magnus", "Astrid", "Soren", "Linnea", "Aksel", "Ida",
  "Mikkel", "Freja", "Emil", "Maja", "Lukas", "Emilie", "Jonas", "Lea"
];

const LAST_NAMES = [
  "Muller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner",
  "Becker", "Schulz", "Hoffmann", "Koch", "Richter", "Klein", "Wolf", "Neumann",
  "Schwarz", "Braun", "Zimmermann", "Krause", "Hartmann", "Lange", "Werner",
  "Lehmann", "Kruger", "Keller", "Franke", "Albrecht", "Brandt", "Schreiber",
  "Dietrich", "Herrmann", "Konig", "Scholz", "Graf", "Vogel", "Schubert",
  "Winkler", "Berger", "Lorenz", "Baumann", "Roth", "Fuchs", "Seidel",
  "Pohl", "Haas", "Bergmann", "Vogt", "Grosse", "Schuster", "Friedrich",
  "Jensen", "Nielsen", "Andersen", "Pedersen", "Larsen", "Sorensen", "Rasmussen",
  "Christensen", "Thomsen", "Madsen", "Dupont", "Moreau", "Laurent", "Lefevre",
  "Fournier", "Girard", "Bonnet", "Mercier", "Blanc", "Garnier",
  "Lindqvist", "Johansson", "Eriksson", "Karlsson", "Nilsson", "Svensson",
  "Petrov", "Novak", "Kowalski", "Horvat", "Rossi", "Bianchi", "Fernandez"
];

const COMPANIES = [
  { name: "dkd Internet Service GmbH", city: "Frankfurt", tags: ["dkd", "TYPO3"] },
  { name: "b13 GmbH", city: "Linz", tags: ["TYPO3", "Community"] },
  { name: "in2code GmbH", city: "Rosenheim", tags: ["TYPO3"] },
  { name: "TYPO3 GmbH", city: "Dusseldorf", tags: ["TYPO3", "Community"] },
  { name: "TYPO3 Association", city: "Olten", tags: ["TYPO3", "Community"] },
  { name: "Netresearch GmbH", city: "Leipzig", tags: ["TYPO3"] },
  { name: "AOE GmbH", city: "Wiesbaden", tags: ["TYPO3", "Partner"] },
  { name: "plan2net GmbH", city: "Wien", tags: ["TYPO3"] },
  { name: "Elementare Teilchen GmbH", city: "Freiburg", tags: ["TYPO3"] },
  { name: "Pixelant AB", city: "Stockholm", tags: ["TYPO3"] },
  { name: "Sitegeist media solutions", city: "Hamburg", tags: ["TYPO3"] },
  { name: "DDEV Foundation", city: "Remote", tags: ["Community"] },
  { name: "Apache Solr Foundation", city: "Remote", tags: ["Community"] },
  { name: "Acme Corp", city: "Berlin", tags: ["Client"] },
  { name: "TechVentures GmbH", city: "Munich", tags: ["Client"] },
  { name: "Nordic Digital AS", city: "Oslo", tags: ["Partner"] },
  { name: "DataFlow AG", city: "Zurich", tags: ["Client"] },
  { name: "CloudBridge Solutions", city: "Amsterdam", tags: ["Partner"] },
  { name: "Webfactory GmbH", city: "Bonn", tags: ["TYPO3"] },
  { name: "Materna SE", city: "Dortmund", tags: ["Client"] },
  { name: "Comundus GmbH", city: "Karlsruhe", tags: ["TYPO3"] },
  { name: "Freelance", city: null, tags: [] },
  { name: "punkt.de GmbH", city: "Karlsruhe", tags: ["TYPO3"] },
  { name: "DFAU GmbH", city: "Nuremberg", tags: ["TYPO3"] },
  { name: "CPS-IT GmbH", city: "Hamburg", tags: ["TYPO3"] },
  { name: "Citrus Andriessen", city: "Nijmegen", tags: ["TYPO3"] },
  { name: "MaxServ BV", city: "Rotterdam", tags: ["TYPO3"] },
  { name: "Sup7even Digital", city: "Graz", tags: ["TYPO3"] },
  { name: "Pagemachine AG", city: "Frankfurt", tags: ["TYPO3"] },
  { name: "WEBprofil GmbH", city: "Aachen", tags: ["TYPO3", "Partner"] },
  { name: "Universitat Frankfurt", city: "Frankfurt", tags: ["Client"] },
  { name: "Stadt Frankfurt", city: "Frankfurt", tags: ["Client"] },
  { name: "Deutsche Bahn AG", city: "Frankfurt", tags: ["Prospect"] },
  { name: "Lufthansa Group", city: "Frankfurt", tags: ["Prospect"] },
  { name: "ING-DiBa AG", city: "Frankfurt", tags: ["Client"] },
  { name: "Open Source Business Alliance", city: "Stuttgart", tags: ["Community"] },
  { name: "KonzeptundMarketing GmbH", city: "Frankfurt", tags: ["Client"] },
  { name: "Hasso Plattner Institut", city: "Potsdam", tags: ["Community"] },
  { name: "Torq IT GmbH", city: "Cologne", tags: ["Partner"] },
];

const ROLES = [
  "CTO", "CEO", "Lead Developer", "TYPO3 Developer", "Frontend Developer",
  "Backend Developer", "DevOps Engineer", "Project Manager", "Product Owner",
  "UX Designer", "Technical Consultant", "Solutions Architect", "Head of IT",
  "Freelance Developer", "Community Manager", "Marketing Director",
  "Managing Director", "Teamlead Development", "Senior Developer",
  "Full-Stack Developer", "System Administrator", "IT Director",
  "Open Source Evangelist", "Release Manager", "Scrum Master",
  "Head of Digital", "VP Engineering", "Technical Lead",
  "Professor", "Research Associate",
];

const LOCATIONS = [
  "Frankfurt, Germany", "Berlin, Germany", "Munich, Germany", "Hamburg, Germany",
  "Cologne, Germany", "Dusseldorf, Germany", "Stuttgart, Germany", "Leipzig, Germany",
  "Nuremberg, Germany", "Karlsruhe, Germany", "Dortmund, Germany", "Bonn, Germany",
  "Freiburg, Germany", "Wiesbaden, Germany", "Wien, Austria", "Graz, Austria",
  "Linz, Austria", "Zurich, Switzerland", "Olten, Switzerland", "Bern, Switzerland",
  "Amsterdam, Netherlands", "Rotterdam, Netherlands", "Copenhagen, Denmark",
  "Aarhus, Denmark", "Stockholm, Sweden", "Oslo, Norway", "Paris, France",
  "Lyon, France", "Brussels, Belgium", "Prague, Czech Republic", "Remote",
];

const RELATIONSHIP_TYPES = ["Professional", "Personal", "Community", "Client", "Partner"];

const ALL_TAGS = [
  "TYPO3", "dkd", "Client", "Partner", "Community", "Speaker", "Friend",
  "Family", "Prospect", "Vendor", "Solr", "DevOps", "Frontend", "Backend",
  "Conference", "Barcamp", "Open Source", "Mentor", "Board Member",
];

const INTERACTION_TYPES = ["note", "call", "meeting", "email", "event", "idea"];

const NOTE_TEMPLATES = [
  "Discussed project roadmap for Q{q} {y}",
  "Shared feedback on the new design mockups",
  "Talked about TYPO3 v{v} migration strategy",
  "Exchanged ideas about CI/CD pipeline improvements",
  "Reviewed open source contribution guidelines together",
  "Caught up about recent team changes",
  "Went through the quarterly review presentation",
  "Brainstormed content strategy for the relaunch",
  "Discussed potential Solr integration approach",
  "Mentioned interest in speaking at the next barcamp",
  "Followed up on the proposal we sent last week",
  "Quick sync about timeline for the MVP",
  "Talked through the performance optimization results",
  "Shared the new component library documentation",
  "Discussed hiring plans for the development team",
  "Went over the accessibility audit findings",
  "Exchanged contacts for a potential collaboration",
  "Reviewed the security assessment report together",
  "Talked about the upcoming TYPO3 Developer Days",
  "Discussed Docker/DDEV setup for local development",
  "Shared notes from the architecture review",
  "Talked about migrating from Extbase to Content Blocks",
  "Discussed the new TYPO3 dashboard widgets",
  "Reviewed the project budget for next quarter",
  "Explored options for headless TYPO3 with Next.js",
  "Talked about the new Fluid Styled Content changes",
  "Quick chat about the community sprint plans",
  "Discussed contributions to the TYPO3 core",
  "Went over the new GDPR requirements for the site",
  "Shared benchmark results for the CDN migration",
];

const CALL_TEMPLATES = [
  "Quick call to align on the project kickoff date",
  "Discussed blockers in the current sprint",
  "Checked in about the open support tickets",
  "Talked through the deployment schedule",
  "Called to follow up on the conference proposal",
  "Discussed the new feature requirements",
  "Quick sync about the staging environment issues",
  "Talked about extending the maintenance contract",
  "Called to clarify the API specification",
  "Discussed timeline adjustments for the release",
  "Called about the partnership proposal",
  "Quick check-in before the board meeting",
  "Discussed the testing strategy for the migration",
  "Called to coordinate the workshop logistics",
  "Talked about the mentoring program structure",
];

const MEETING_TEMPLATES = [
  "Sprint planning session — defined stories for the next two weeks",
  "Workshop on TYPO3 Site Sets at the user group",
  "Quarterly business review with the client team",
  "Architecture review for the multi-site setup",
  "User group meetup in {city} — great turnout",
  "One-on-one catch-up over coffee in {city}",
  "Product demo for the new dashboard module",
  "Retrospective — team identified 3 improvement areas",
  "Joint planning session for the conference booth",
  "Technical deep-dive on Solr configuration",
  "Kick-off meeting for the redesign project",
  "Lunch meeting to discuss partnership opportunities",
  "Code review session for the extension refactoring",
  "Workshop on accessibility best practices",
  "Strategic planning meeting for next year",
];

const EMAIL_TEMPLATES = [
  "Sent project status update with latest milestones",
  "Shared the revised proposal document",
  "Forwarded the conference speaker invitation",
  "Sent the technical documentation for the API",
  "Shared the meeting notes from last week",
  "Sent a follow-up on the budget approval",
  "Forwarded the new design system guidelines",
  "Shared links to relevant TYPO3 documentation",
  "Sent the onboarding materials for the new project",
  "Replied to their question about Composer dependencies",
  "Shared the benchmark report for the load testing",
  "Sent the invoice for the consulting hours",
  "Forwarded the event registration details",
  "Shared the slides from the presentation",
  "Sent a thank-you note after the workshop",
];

const EVENT_TEMPLATES = [
  "TYPO3 Developer Days {y} in Karlsruhe",
  "TYPO3camp Munich {y}",
  "TYPO3 Community Sprint in {city}",
  "Barcamp RheinMain in Frankfurt",
  "WebCamp Venlo {y}",
  "FOSDEM {y} in Brussels",
  "T3CON{yy} in Dusseldorf",
  "Neos Conference {y} in Dresden",
  "WordCamp Europe {y}",
  "DevOps Conference {y} in Berlin",
  "User group meetup in {city}",
  "Open Source summit in {city}",
  "Hacking Day at dkd office",
  "TYPO3 Awards Ceremony {y}",
  "Certification workshop in {city}",
];

const IDEA_TEMPLATES = [
  "Could build a shared TYPO3 extension for cookie consent",
  "Idea: create a CLI tool for TYPO3 site provisioning",
  "What if we offered a joint workshop at T3CON?",
  "Potential to collaborate on a headless TYPO3 starter kit",
  "Idea for a community dashboard showing contribution stats",
  "Should pitch a talk together about DevOps for agencies",
  "Could develop a TYPO3-Solr monitoring dashboard",
  "Idea: organize a code sprint for accessibility improvements",
  "What about a shared Docker setup for TYPO3 projects?",
  "Could create a TYPO3 extension template generator",
  "Idea for a meetup series on modern PHP patterns",
  "Should write a blog post about the migration project",
  "Potential for a podcast about the TYPO3 ecosystem",
  "Idea: shared component library for Fluid templates",
  "Could build a VS Code extension for TYPO3 development",
];

function fillTemplate(tpl) {
  const now = new Date();
  const y = now.getFullYear();
  return tpl
    .replace("{y}", y)
    .replace("{yy}", String(y).slice(2))
    .replace("{q}", randomInt(1, 4))
    .replace("{v}", "1" + randomInt(2, 3))
    .replace("{city}", randomItem(["Frankfurt", "Berlin", "Hamburg", "Munich", "Wien", "Zurich", "Copenhagen", "Amsterdam", "Prague", "Karlsruhe"]));
}

function generateInteraction(type, daysOffset) {
  const templates = {
    note: NOTE_TEMPLATES, call: CALL_TEMPLATES, meeting: MEETING_TEMPLATES,
    email: EMAIL_TEMPLATES, event: EVENT_TEMPLATES, idea: IDEA_TEMPLATES,
  };
  return {
    id: generateId(),
    type,
    content: fillTemplate(randomItem(templates[type])),
    date: daysAgo(daysOffset),
  };
}

// --- Generate contacts ---
const usedNames = new Set();
const contacts = [];

for (let i = 0; i < 120; i++) {
  let firstName, lastName, fullName;
  do {
    firstName = randomItem(FIRST_NAMES);
    lastName = randomItem(LAST_NAMES);
    fullName = `${firstName} ${lastName}`;
  } while (usedNames.has(fullName));
  usedNames.add(fullName);

  const company = randomItem(COMPANIES);
  const role = randomItem(ROLES);
  const location = company.city
    ? LOCATIONS.find(l => l.startsWith(company.city)) || randomItem(LOCATIONS)
    : randomItem(LOCATIONS);
  const relType = randomItem(RELATIONSHIP_TYPES);

  // Build tags: company tags + some random extras
  const tagSet = new Set(company.tags);
  for (let t = 0; t < randomInt(0, 3); t++) tagSet.add(randomItem(ALL_TAGS));
  const tags = [...tagSet];

  const createdDaysAgo = randomInt(10, 400);
  const lastContactDays = randomInt(0, Math.min(createdDaysAgo, 90));
  const hasFollowUp = Math.random() > 0.3;
  const followUpDays = hasFollowUp ? randomInt(-14, 21) : null; // negative = past (overdue)
  const hasBirthday = Math.random() > 0.5;
  const hasLinkedin = Math.random() > 0.3;
  const hasWebsite = Math.random() > 0.6;
  const hasPhone = Math.random() > 0.4;

  const emailDomain = company.name === "Freelance"
    ? randomItem(["gmail.com", "posteo.de", "protonmail.com", "hey.com"])
    : company.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) + ".de";

  const contact = {
    id: generateId(),
    name: fullName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`,
    phone: hasPhone ? `+49 ${randomInt(151, 179)} ${randomInt(1000000, 9999999)}` : "",
    company: company.name === "Freelance" ? "" : company.name,
    role,
    location,
    linkedin: hasLinkedin ? `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}` : "",
    website: hasWebsite ? `https://${firstName.toLowerCase()}${lastName.toLowerCase()}.dev` : "",
    notes: "",
    tags,
    relationshipType: relType,
    nextFollowUp: followUpDays !== null ? daysAgo(-followUpDays).slice(0, 10) : "",
    lastContact: daysAgo(lastContactDays).slice(0, 10),
    createdAt: daysAgo(createdDaysAgo),
    birthday: hasBirthday ? randomBirthday() : "",
    interactions: [],
  };

  // Generate interactions for this contact
  const interactionCount = randomInt(1, 12);
  for (let j = 0; j < interactionCount; j++) {
    const type = randomItem(INTERACTION_TYPES);
    const offset = randomInt(0, Math.min(createdDaysAgo, 180));
    contact.interactions.push(generateInteraction(type, offset));
  }
  // Sort interactions by date descending
  contact.interactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  contacts.push(contact);
}

// Ensure we hit the interaction target — add more to random contacts
let totalInteractions = contacts.reduce((s, c) => s + c.interactions.length, 0);
while (totalInteractions < 520) {
  const contact = randomItem(contacts);
  const createdDaysAgo = Math.floor((Date.now() - new Date(contact.createdAt)) / 86400000);
  const type = randomItem(INTERACTION_TYPES);
  const offset = randomInt(0, Math.min(createdDaysAgo, 180));
  contact.interactions.push(generateInteraction(type, offset));
  contact.interactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  totalInteractions++;
}

// Stats
console.log(`Generated ${contacts.length} contacts`);
console.log(`Total interactions: ${totalInteractions}`);
const typeCounts = {};
contacts.forEach(c => c.interactions.forEach(i => { typeCounts[i.type] = (typeCounts[i.type] || 0) + 1; }));
console.log("By type:", typeCounts);

// --- Write CSV (contacts only, no interactions) ---
const CSV_HEADERS = ["Name","Email","Phone","Company","Role","Location","LinkedIn","Website","Notes","Tags","Relationship Type","Next Follow-Up","Last Contact","Created At","Birthday"];

function escapeCsv(val) {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

const csvRows = [CSV_HEADERS.join(",")];
contacts.forEach(c => {
  csvRows.push([
    c.name, c.email, c.phone, c.company, c.role, c.location, c.linkedin,
    c.website, c.notes, (c.tags || []).join(";"), c.relationshipType,
    c.nextFollowUp, c.lastContact, c.createdAt, c.birthday,
  ].map(escapeCsv).join(","));
});

writeFileSync(new URL("./contacts.csv", import.meta.url), csvRows.join("\n"), "utf-8");
console.log("Written: contacts.csv");

// --- Write JSON (full data with interactions) ---
writeFileSync(new URL("./seed.json", import.meta.url), JSON.stringify(contacts, null, 2), "utf-8");
console.log("Written: seed.json");
