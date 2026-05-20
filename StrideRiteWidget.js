// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STRIDE RITE — iOS Home Screen Widget
// Built for Scriptable app (free on App Store)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── TRAINING PLAN (MAY 6 – MAY 31) ────────
const plan = [
  { date: "2026-05-06", title: "AEROBIC BASE", desc: "10km steady. Zone 2.", dist: "10.0", tss: 68, type: "run", icon: "🏃" },
  { date: "2026-05-07", title: "TEMPO PUSH", desc: "2km WU. 6km @ 4:05/km. 2km CD.", dist: "10.0", tss: 92, type: "speed", icon: "🔥" },
  { date: "2026-05-08", title: "ACTIVE RECOVERY", desc: "6km light jog. Mobility focus.", dist: "6.0", tss: 35, type: "run", icon: "🧊" },
  { date: "2026-05-09", title: "LONG RUN + PROG", desc: "14km. Last 3km progress to 4:15.", dist: "14.0", tss: 110, type: "run", icon: "🛤️" },
  { date: "2026-05-10", title: "TOTAL REST", desc: "Foam rolling & stretching.", dist: "0", tss: 0, type: "rest", icon: "😴" },
  { date: "2026-05-11", title: "RECOVERY FLUSH", desc: "8km very easy. Zone 1.", dist: "8.0", tss: 42, type: "run", icon: "🧊" },
  { date: "2026-05-12", title: "SPEED: 12x400m", desc: "12x400m @ 85-88s. 90s jog rest.", dist: "10.5", tss: 105, type: "speed", icon: "⚡" },
  { date: "2026-05-13", title: "AEROBIC BASE", desc: "10km steady maintenance.", dist: "10.0", tss: 68, type: "run", icon: "🏃" },
  { date: "2026-05-14", title: "TEMPO: 7KM", desc: "7km at Threshold effort.", dist: "11.0", tss: 98, type: "speed", icon: "🔥" },
  { date: "2026-05-15", title: "ACTIVE RECOVERY", desc: "6km light jog.", dist: "6.0", tss: 35, type: "run", icon: "🧊" },
  { date: "2026-05-16", title: "LONG RUN: 16KM", desc: "16km aerobic effort.", dist: "16.0", tss: 125, type: "run", icon: "🛤️" },
  { date: "2026-05-17", title: "TOTAL REST", desc: "Full recovery.", dist: "0", tss: 0, type: "rest", icon: "😴" },
  { date: "2026-05-18", title: "RECOVERY FLUSH", desc: "8km easy.", dist: "8.0", tss: 42, type: "run", icon: "🧊" },
  { date: "2026-05-19", title: "SPEED: 14x400m", desc: "Building volume at speed.", dist: "12.6", tss: 120, type: "speed", icon: "⚡" },
  { date: "2026-05-20", title: "AEROBIC BASE", desc: "10km steady.", dist: "10.0", tss: 68, type: "run", icon: "🏃" },
  { date: "2026-05-21", title: "TEMPO: 8KM", desc: "8km at Threshold.", dist: "12.0", tss: 110, type: "speed", icon: "🔥" },
  { date: "2026-05-22", title: "ACTIVE RECOVERY", desc: "Recovery ride or jog.", dist: "6.0", tss: 35, type: "run", icon: "🧊" },
  { date: "2026-05-23", title: "LONG RUN: 18KM", desc: "Endurance capacity build.", dist: "18.0", tss: 145, type: "run", icon: "🛤️" },
  { date: "2026-05-24", title: "TOTAL REST", desc: "Pre-taper rest.", dist: "0", tss: 0, type: "rest", icon: "😴" },
  { date: "2026-05-25", title: "RECOVERY FLUSH", desc: "8km easy. Taper starts.", dist: "8.0", tss: 42, type: "run", icon: "🧊" },
  { date: "2026-05-26", title: "SPEED: 16x400m", desc: "Final peak speed session.", dist: "14.8", tss: 140, type: "speed", icon: "⚡" },
  { date: "2026-05-27", title: "AEROBIC BASE", desc: "10km maintenance.", dist: "10.0", tss: 60, type: "run", icon: "🏃" },
  { date: "2026-05-28", title: "TEMPO: 9KM", desc: "Final threshold push.", dist: "13.0", tss: 115, type: "speed", icon: "🔥" },
  { date: "2026-05-29", title: "ACTIVE RECOVERY", desc: "Stay loose. Visualize.", dist: "5.0", tss: 30, type: "run", icon: "🧊" },
  { date: "2026-05-30", title: "SHAKEOUT", desc: "3km easy + 3x100m strides.", dist: "3.0", tss: 20, type: "run", icon: "🎯" },
  { date: "2026-05-31", title: "THE 5K TT", desc: "SUB-19:00 ATTEMPT. ALL OUT.", dist: "5.0", tss: 180, type: "speed", icon: "🏁" }
];

// ── COLORS ─────────────────────────────────
const COLORS = {
  bg:        new Color("#0a0e12"),
  card:      new Color("#151b23"),
  accent:    new Color("#ff6b35"),
  secondary: new Color("#0076c0"),
  success:   new Color("#40b549"),
  text:      new Color("#e6edf3"),
  textDim:   new Color("#8b949e"),
  border:    new Color("#30363d"),
  rest:      new Color("#484f58"),
  speed:     new Color("#ff6b35"),
  run:       new Color("#0076c0"),
  race:      new Color("#ff4444")
};

// ── FIND TODAY ─────────────────────────────
function getToday() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTomorrow() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDaysToRace() {
  const raceDate = new Date("2026-05-31");
  const now = new Date();
  now.setHours(0,0,0,0);
  raceDate.setHours(0,0,0,0);
  return Math.ceil((raceDate - now) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`;
}

function getTypeColor(type) {
  if (type === "speed") return COLORS.speed;
  if (type === "rest") return COLORS.rest;
  return COLORS.run;
}

// ── BUILD WIDGET ───────────────────────────
async function createWidget() {
  const todayStr = getToday();
  const tomorrowStr = getTomorrow();
  const today = plan.find(p => p.date === todayStr);
  const tomorrow = plan.find(p => p.date === tomorrowStr);
  const daysToRace = getDaysToRace();
  const size = config.widgetFamily || "medium";

  const w = new ListWidget();
  w.backgroundColor = COLORS.bg;
  w.setPadding(14, 16, 14, 16);

  // When widget is tapped, run this script to open the app
  const todayIdx = plan.findIndex(p => p.date === todayStr);
  const appUrl = todayIdx >= 0 
    ? `https://5kplan.vercel.app/?day=${todayIdx}` 
    : "https://5kplan.vercel.app/";
  
  // Tap widget → run script → show workout + open Safari
  w.url = `scriptable:///run/${encodeURIComponent(Script.name())}`;

  if (!today) {
    // Outside training block
    const noTraining = w.addText("NO TRAINING TODAY");
    noTraining.font = Font.boldSystemFont(14);
    noTraining.textColor = COLORS.textDim;

    if (daysToRace > 0) {
      w.addSpacer(6);
      const race = w.addText(`🏁 ${daysToRace} DAYS TO RACE`);
      race.font = Font.boldMonospacedSystemFont(11);
      race.textColor = COLORS.accent;
    }
    return w;
  }

  // ── HEADER ROW ───────────────────────
  const headerStack = w.addStack();
  headerStack.layoutHorizontally();
  headerStack.centerAlignContent();

  // Brand
  const brand = headerStack.addText("STRIDE RITE");
  brand.font = Font.boldSystemFont(10);
  brand.textColor = COLORS.textDim;
  brand.textOpacity = 0.6;

  headerStack.addSpacer();

  // Race Countdown
  if (daysToRace > 0) {
    const countdown = headerStack.addText(`${daysToRace}D TO RACE`);
    countdown.font = Font.boldMonospacedSystemFont(9);
    countdown.textColor = COLORS.accent;
  } else if (daysToRace === 0) {
    const raceDay = headerStack.addText("🏁 RACE DAY");
    raceDay.font = Font.boldMonospacedSystemFont(9);
    raceDay.textColor = COLORS.race;
  }

  w.addSpacer(8);

  // ── TODAY BADGE + DATE ───────────────
  const dateStack = w.addStack();
  dateStack.layoutHorizontally();
  dateStack.centerAlignContent();
  dateStack.spacing = 8;

  // TODAY badge
  const badgeBg = dateStack.addStack();
  badgeBg.backgroundColor = COLORS.accent;
  badgeBg.cornerRadius = 4;
  badgeBg.setPadding(2, 6, 2, 6);
  const badgeText = badgeBg.addText("TODAY");
  badgeText.font = Font.heavySystemFont(9);
  badgeText.textColor = Color.white();

  // Date
  const dateLabel = dateStack.addText(formatDate(todayStr));
  dateLabel.font = Font.mediumMonospacedSystemFont(10);
  dateLabel.textColor = COLORS.textDim;

  w.addSpacer(6);

  // ── WORKOUT TITLE ────────────────────
  const iconTitle = w.addStack();
  iconTitle.layoutHorizontally();
  iconTitle.centerAlignContent();
  iconTitle.spacing = 8;

  const icon = iconTitle.addText(today.icon);
  icon.font = Font.systemFont(20);

  const title = iconTitle.addText(today.title);
  title.font = Font.boldSystemFont(size === "small" ? 16 : 20);
  title.textColor = COLORS.text;
  title.lineLimit = 1;
  title.minimumScaleFactor = 0.7;

  w.addSpacer(4);

  // ── DESCRIPTION ──────────────────────
  if (size !== "small") {
    const desc = w.addText(today.desc);
    desc.font = Font.regularSystemFont(11);
    desc.textColor = COLORS.textDim;
    desc.lineLimit = 2;
    w.addSpacer(8);
  } else {
    w.addSpacer(6);
  }

  // ── METRICS ROW ──────────────────────
  const metricsStack = w.addStack();
  metricsStack.layoutHorizontally();
  metricsStack.centerAlignContent();
  metricsStack.spacing = size === "small" ? 8 : 16;

  // Distance
  if (today.dist !== "0") {
    const distStack = metricsStack.addStack();
    distStack.layoutVertically();
    distStack.centerAlignContent();

    const distLabel = distStack.addText("DIST");
    distLabel.font = Font.boldSystemFont(8);
    distLabel.textColor = COLORS.textDim;

    const distVal = distStack.addText(today.dist + "km");
    distVal.font = Font.boldMonospacedSystemFont(size === "small" ? 13 : 15);
    distVal.textColor = COLORS.accent;
  } else {
    const restStack = metricsStack.addStack();
    restStack.layoutVertically();
    restStack.centerAlignContent();

    const restLabel = restStack.addText("STATUS");
    restLabel.font = Font.boldSystemFont(8);
    restLabel.textColor = COLORS.textDim;

    const restVal = restStack.addText("REST DAY");
    restVal.font = Font.boldMonospacedSystemFont(size === "small" ? 13 : 15);
    restVal.textColor = COLORS.rest;
  }

  // TSS
  const tssStack = metricsStack.addStack();
  tssStack.layoutVertically();
  tssStack.centerAlignContent();

  const tssLabel = tssStack.addText("TSS");
  tssLabel.font = Font.boldSystemFont(8);
  tssLabel.textColor = COLORS.textDim;

  const tssVal = tssStack.addText(String(today.tss));
  tssVal.font = Font.boldMonospacedSystemFont(size === "small" ? 13 : 15);
  tssVal.textColor = COLORS.secondary;

  // Type badge
  metricsStack.addSpacer();
  const typeBadge = metricsStack.addStack();
  typeBadge.backgroundColor = new Color(getTypeColor(today.type).hex, 0.15);
  typeBadge.cornerRadius = 4;
  typeBadge.setPadding(3, 8, 3, 8);
  const typeText = typeBadge.addText(today.type.toUpperCase());
  typeText.font = Font.heavySystemFont(9);
  typeText.textColor = getTypeColor(today.type);

  // ── TOMORROW PREVIEW (medium/large only) ─
  if (size !== "small" && tomorrow) {
    w.addSpacer(10);

    // Divider
    const divider = w.addStack();
    divider.backgroundColor = COLORS.border;
    divider.size = new Size(0, 1);
    divider.addSpacer();

    w.addSpacer(8);

    const nextStack = w.addStack();
    nextStack.layoutHorizontally();
    nextStack.centerAlignContent();
    nextStack.spacing = 6;

    const nextLabel = nextStack.addText("TOMORROW");
    nextLabel.font = Font.boldSystemFont(8);
    nextLabel.textColor = new Color(COLORS.textDim.hex, 0.5);

    const nextIcon = nextStack.addText(tomorrow.icon);
    nextIcon.font = Font.systemFont(11);

    const nextTitle = nextStack.addText(tomorrow.title);
    nextTitle.font = Font.mediumSystemFont(11);
    nextTitle.textColor = COLORS.textDim;
    nextTitle.lineLimit = 1;

    nextStack.addSpacer();

    if (tomorrow.dist !== "0") {
      const nextDist = nextStack.addText(tomorrow.dist + "km");
      nextDist.font = Font.boldMonospacedSystemFont(10);
      nextDist.textColor = new Color(COLORS.accent.hex, 0.5);
    } else {
      const nextRest = nextStack.addText("OFF");
      nextRest.font = Font.boldMonospacedSystemFont(10);
      nextRest.textColor = COLORS.rest;
    }
  }

  return w;
}

// ── RUN ────────────────────────────────────
const widget = await createWidget();

if (config.runsInWidget) {
  // Running as a home screen widget — just display
  Script.setWidget(widget);
} else {
  // User tapped the widget — open the dashboard
  const todayStr = getToday();
  const todayIdx = plan.findIndex(p => p.date === todayStr);
  const today = todayIdx >= 0 ? plan[todayIdx] : null;
  const daysToRace = getDaysToRace();

  if (today) {
    // Build the deep-link URL
    const url = `https://5kplan.vercel.app/?day=${todayIdx}`;
    
    // Show a quick notification
    const notif = new Notification();
    notif.title = `${today.icon} ${today.title}`;
    notif.subtitle = today.dist !== "0" ? `${today.dist}km • TSS ${today.tss}` : "REST DAY";
    notif.body = today.desc;
    notif.sound = "default";
    notif.schedule();

    // Open the dashboard in Safari
    Safari.open(url);
  } else {
    Safari.open("https://5kplan.vercel.app/");
  }
}

Script.complete();
