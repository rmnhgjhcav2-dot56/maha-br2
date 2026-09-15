import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Home, Users, CalendarDays, Shirt, Factory, Ruler, Wallet, Package,
  Phone, MessageCircle, Search, Plus, ChevronRight, X, Check, Pencil,
  Trash2, AlertTriangle, BarChart3, Clock, Sparkles, ArrowRight, Loader2,
  CircleDot, CheckCircle2, Circle, Save, Settings, RefreshCw, Bot
} from "lucide-react";

/* ============================== design tokens ==============================
   Palette
   --ivory:   #FAF3EF  background, warm rose-ivory (not the generic cream default)
   --surface: #FFFFFF  cards
   --ink:     #2B2320  primary text, warm charcoal (not pure black)
   --wine:    var(--bb-wine)  primary brand / accents (deep bridal wine, not terracotta)
   --wine-dk: var(--bb-wine-dark)  pressed / dark states
   --gold:    var(--bb-gold)  hairlines, dividers, secondary accent
   --sage:    #6F8F6B  success / ready / completed
   --amber:   #C68A3E  in-progress / attention
   --red:     #B23B3B  late / alert
   --line:    #E8DDD6  borders
   Type
   display: 'Markazi Text' - elegant Arabic serif-adjacent, used for headings only
   body:    'Tajawal' - clean geometric Arabic sans, used everywhere else
================================================================================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Markazi+Text:wght@500;600;700&family=Tajawal:wght@300;400;500;700;900&display=swap');

* { box-sizing: border-box; }
.bb-root {
  font-family: 'Tajawal', sans-serif;
  background: #FAF3EF;
  color: #2B2320;
  min-height: 100vh;
  direction: rtl;
  --bb-wine: #6B1E3C;
  --bb-wine-dark: #4A1329;
  --bb-gold: #B8935A;
}
.bb-display { font-family: 'Markazi Text', serif; }

.bb-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
.bb-scrollbar::-webkit-scrollbar-thumb { background: #E8DDD6; border-radius: 4px; }

.bb-shell { display: flex; flex-direction: column; min-height: 100vh; max-width: 560px; margin: 0 auto; position: relative; }

/* ---------- bottom nav (mobile) ---------- */
.bb-bottomnav {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
  max-width: 560px; margin: 0 auto;
  background: var(--bb-wine-dark); display: flex; justify-content: space-between;
  padding: 6px 4px calc(6px + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -6px 18px rgba(43,19,30,0.18);
}
.bb-nav-item {
  flex: 1; padding: 7px 2px; border-radius: 12px; display: flex;
  flex-direction: column; align-items: center; gap: 3px; cursor: pointer;
  color: #E9D9CE; opacity: .62; transition: all .15s ease; border: none; background: transparent;
  font-family: 'Tajawal', sans-serif;
}
.bb-nav-item:active { opacity: 1; background: rgba(255,255,255,0.08); }
.bb-nav-item.active { opacity: 1; background: rgba(184,147,90,0.22); }
.bb-nav-item span { font-size: 9.5px; font-weight: 600; }

/* ---------- floating add button ---------- */
.bb-fab {
  position: fixed; bottom: 76px; left: 16px; z-index: 41;
  width: 54px; height: 54px; border-radius: 50%; border: none; cursor: pointer;
  background: var(--bb-wine); color: #FBEFE9; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 20px rgba(107,30,60,0.38);
}

/* ---------- main ---------- */
.bb-main { flex: 1; min-width: 0; padding: 16px 14px calc(92px + env(safe-area-inset-bottom, 0px)); }
.bb-topbar { margin-bottom: 16px; }
.bb-title { font-family: 'Markazi Text', serif; font-size: 28px; font-weight: 700; color: var(--bb-wine-dark); line-height: 1; }
.bb-subtitle { font-size: 12.5px; color: #8A7A6E; margin-top: 4px; }

.bb-search {
  display: flex; align-items: center; gap: 8px; background: #fff;
  border: 1px solid #E8DDD6; border-radius: 12px; padding: 11px 14px;
  width: 100%; margin-top: 12px;
}
.bb-search input { border: none; outline: none; background: transparent; font-family: 'Tajawal'; font-size: 15px; width: 100%; color: #2B2320; }

.bb-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 11px 16px;
  border-radius: 11px; border: none; cursor: pointer; font-family: 'Tajawal';
  font-weight: 700; font-size: 14px; transition: all .15s ease; white-space: nowrap;
  min-height: 42px;
}
.bb-btn-primary { background: var(--bb-wine); color: #FBEFE9; }
.bb-btn-primary:active { background: var(--bb-wine-dark); }
.bb-btn-ghost { background: #fff; color: var(--bb-wine); border: 1px solid #E8DDD6; }
.bb-btn-ghost:active { border-color: var(--bb-gold); }
.bb-btn-sm { padding: 7px 12px; font-size: 12.5px; border-radius: 9px; min-height: 34px; }
.bb-btn-danger { background: #FBEAEA; color: #B23B3B; border: 1px solid #F0D3D3; }
.bb-btn-block { width: 100%; }

/* ---------- timeline ribbon (signature element) ---------- */
.bb-ribbon {
  background: linear-gradient(120deg,var(--bb-wine) 0%, var(--bb-wine-dark) 100%);
  border-radius: 18px; padding: 16px 16px; margin-bottom: 16px;
  color: #FBEFE9; position: relative; overflow: hidden;
}
.bb-ribbon::after {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 90% -20%, rgba(184,147,90,.35), transparent 55%);
}
.bb-ribbon-head { display:flex; flex-direction:column; gap:2px; margin-bottom: 12px; position: relative; z-index:1;}
.bb-ribbon-title { font-family:'Markazi Text'; font-size: 20px; font-weight:700; }
.bb-ribbon-date { font-size: 11.5px; color: #E9C9B9; }
.bb-ribbon-track { display:flex; gap: 9px; overflow-x: auto; position: relative; z-index:1; padding-bottom:4px;}
.bb-ribbon-track::-webkit-scrollbar{height:5px;}
.bb-ribbon-track::-webkit-scrollbar-thumb{background:rgba(255,255,255,.25); border-radius:4px;}
.bb-ribbon-item {
  background: rgba(255,255,255,0.10); border:1px solid rgba(255,255,255,0.16);
  border-radius: 13px; padding: 10px 13px; min-width: 148px; flex-shrink:0;
}
.bb-ribbon-item .lbl { font-size:10.5px; color:#E9C9B9; margin-bottom:3px;}
.bb-ribbon-item .val { font-size:13.5px; font-weight:700; }
.bb-ribbon-empty { font-size: 13px; color: #E9C9B9; position:relative; z-index:1; }

/* ---------- stat grid ---------- */
.bb-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
.bb-stat-card {
  background: #fff; border: 1px solid #E8DDD6; border-radius: 15px; padding: 13px 14px;
  cursor: pointer; transition: all .15s ease;
}
.bb-stat-card:active { border-color: var(--bb-gold); }
.bb-stat-card .icon { font-size: 17px; margin-bottom: 6px; display:block; }
.bb-stat-card .num { font-family: 'Markazi Text'; font-size: 26px; font-weight: 700; color:var(--bb-wine-dark); line-height:1; }
.bb-stat-card .lbl { font-size: 11.5px; color: #8A7A6E; margin-top: 4px; font-weight: 500; }

/* ---------- cards / sections ---------- */
.bb-card { background: #fff; border: 1px solid #E8DDD6; border-radius: 16px; padding: 15px 15px; margin-bottom: 12px; }
.bb-card-head { display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; gap: 8px; flex-wrap: wrap; }
.bb-card-title { font-family:'Markazi Text'; font-size: 19px; font-weight:700; color:var(--bb-wine-dark); display:flex; align-items:center; gap:7px; }
.bb-hr { border:none; border-top: 1px solid #EFE4DD; margin: 12px 0; }

.bb-field { margin-bottom: 12px; }
.bb-field label { display:block; font-size: 12px; color:#8A7A6E; margin-bottom: 5px; font-weight:600; }
.bb-field input, .bb-field select, .bb-field textarea {
  width:100%; border:1px solid #E8DDD6; border-radius:10px; padding: 11px 12px;
  font-family:'Tajawal'; font-size: 15px; color:#2B2320; outline:none; background:#FDFAF8;
}
.bb-field input:focus, .bb-field select:focus, .bb-field textarea:focus { border-color:var(--bb-gold); background:#fff; }
.bb-field textarea { resize: vertical; min-height: 60px; }
.bb-grid2 { display:grid; grid-template-columns: 1fr; gap: 0; }
.bb-grid3 { display:grid; grid-template-columns: 1fr; gap: 0; }
.bb-grid2-tight { display:grid; grid-template-columns: 1fr 1fr; gap: 10px; }

/* ---------- mobile card-list (replaces tables) ---------- */
.bb-list { display:flex; flex-direction:column; gap:8px; }
.bb-list-row {
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  padding: 12px 13px; border: 1px solid #EFE4DD; border-radius: 13px; background:#FDFBFA; cursor:pointer;
}
.bb-list-row:active { border-color:var(--bb-gold); background:#fff; }
.bb-list-row .name { font-weight:700; color:var(--bb-wine-dark); font-size:14px; margin-bottom:2px; }
.bb-list-row .meta { font-size:11.5px; color:#8A7A6E; display:flex; flex-wrap:wrap; gap:8px; }
.bb-list-row .side { text-align:left; flex-shrink:0; }

/* ---------- badges ---------- */
.bb-badge { display:inline-flex; align-items:center; gap:5px; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight:700; white-space:nowrap; }
.bb-badge.b-ready { background:#E9F1E7; color:#4F6B4A; }
.bb-badge.b-late { background:#FBEAEA; color:#B23B3B; }
.bb-badge.b-progress { background:#FBF0DE; color:#93641F; }
.bb-badge.b-done { background:#E4EFEF; color:#2E5E5E; }
.bb-badge.b-alter { background:#FDE9DC; color:#B2611F; }

/* ---------- stepper (production stages) ---------- */
.bb-step-list { display:flex; flex-direction:column; }
.bb-step { display:flex; align-items:flex-start; gap: 12px; padding: 9px 2px; position: relative; }
.bb-step .line { position:absolute; right:11px; top:30px; bottom:-4px; width:2px; background:#EEE1D9; }
.bb-step:last-child .line { display:none; }
.bb-step-dot { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; z-index:1; cursor:pointer; }
.bb-step-name { font-size: 14px; font-weight: 600; }
.bb-step-meta { font-size: 11.5px; color:#A08E80; margin-top:2px; }

/* ---------- misc ---------- */
.bb-empty { text-align:center; padding: 34px 16px; color:#A08E80; font-size:13.5px; }
.bb-chip { padding:8px 14px; border-radius:999px; font-size:12.5px; font-weight:600; border:1px solid #E8DDD6; background:#fff; cursor:pointer; color:var(--bb-wine); white-space:nowrap; }
.bb-chip.active { background:var(--bb-wine); color:#fff; border-color:var(--bb-wine); }
.bb-chip-row { display:flex; gap:8px; overflow-x:auto; padding-bottom:2px; margin-bottom:14px; }
.bb-chip-row::-webkit-scrollbar { display:none; }
.bb-icon-btn { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; border:1px solid #E8DDD6; background:#fff; cursor:pointer; color:var(--bb-wine); flex-shrink:0; }
.bb-icon-btn:active { border-color:var(--bb-gold); }
.bb-days-left { font-family:'Markazi Text'; font-size: 24px; font-weight:700; }
.bb-back { display:flex; align-items:center; gap:6px; color:var(--bb-wine); font-weight:700; font-size:13.5px; cursor:pointer; margin-bottom:12px; padding: 4px 0; }
`;

/* ============================== helpers ============================== */

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const todayStr = () => new Date().toISOString().slice(0, 10);
const money = (n) => (Number(n) || 0).toLocaleString("ar-SA");
const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const t = new Date(todayStr() + "T00:00:00");
  return Math.round((d - t) / 86400000);
};

const STAGE_OPTIONS = [
  { key: "not_started", label: "لم يبدأ التنفيذ", icon: "⭕" },
  { key: "in_progress", label: "بدأ التنفيذ", icon: "🔵" },
  { key: "fitting_ready", label: "البروفة جاهزة", icon: "🟣" },
  { key: "done", label: "تم الانتهاء من الفستان", icon: "🟢" },
  { key: "alteration_requested", label: "طلب تعديل", icon: "🟠" },
];
const DRESS_CATEGORIES = ["تفصيل - تمليك", "تفصيل - إيجار", "إيجار (جاهز)"];
const DASHBOARD_CARD_META = [
  { id: "total_brides", label: "👰 إجمالي العرايس" },
  { id: "today_booking", label: "📅 مواعيد العرايس اليوم" },
  { id: "today_fitting", label: "📅 البروفات اليوم" },
  { id: "in_progress", label: "👗 فساتين تحت التنفيذ" },
  { id: "alteration", label: "🟠 طلبات تعديل" },
  { id: "late", label: "⚠️ فساتين متأخرة" },
  { id: "ready", label: "📦 فساتين جاهزة للتسليم" },
  { id: "today_delivery", label: "🚚 تسليمات اليوم" },
  { id: "collected", label: "💰 إجمالي المبالغ المحصلة" },
  { id: "remaining", label: "💵 المبالغ المتبقية" },
  { id: "late_payment", label: "🔴 دفعات متأخرة" },
  { id: "done", label: "🟢 فساتين مكتملة" },
];

const SOURCES = ["إنستغرام", "تيك توك", "سناب شات", "توصية", "زيارة المحل", "أخرى"];
const PAY_METHODS = ["نقدي", "شبكة", "تحويل بنكي", "رابط دفع", "أخرى"];

function blankBride() {
  return {
    id: uid(),
    createdAt: todayStr(),
    name: "", phone: "", altPhone: "", whatsapp: "", email: "",
    source: SOURCES[0], assignedTo: "", notes: "",
    wedding: { date: "" },
    booking: { date: todayStr() },
    deliveryAgreed: "", deliveryActual: "",
    dress: {
      code: "", category: DRESS_CATEGORIES[0], notes: "",
    },
    measurements: { status: "لم يتم أخذ المقاسات", date: "", time: "", employee: "", notes: "" },
    fittings: [],
    alterations: [],
    productionStage: "not_started",
    production: { assignedTo: "", notes: "" },
    finance: { totalPrice: "", discount: "", deposit: "", securityDeposit: "", securityDepositReturned: false, payments: [] },
    communication: [],
    extraFields: [],
    history: [],
  };
}

function finalPrice(b) {
  const total = Number(b.finance.totalPrice) || 0;
  const disc = Number(b.finance.discount) || 0;
  return Math.max(total - disc, 0);
}
function collected(b) {
  const depositPaid = Number(b.finance.deposit) || 0;
  const extraPayments = b.finance.payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  return depositPaid + extraPayments;
}
function remaining(b) {
  return Math.max(finalPrice(b) - collected(b), 0);
}
function isDelivered(b) {
  return !!b.deliveryActual;
}
function isReady(b) {
  return !isDelivered(b) && b.productionStage === "done";
}
function isLate(b) {
  if (isDelivered(b) || isReady(b)) return false;
  if (!b.deliveryAgreed) return false;
  return daysUntil(b.deliveryAgreed) < 0;
}
function mainStatus(b) {
  if (isDelivered(b)) return "done";
  if (b.productionStage === "alteration_requested") return "alteration";
  if (isLate(b)) return "late";
  if (isReady(b)) return "ready";
  return "progress";
}
function statusBadge(status) {
  const map = {
    done: { cls: "b-done", label: "🟢 مكتمل" },
    ready: { cls: "b-ready", label: "📦 جاهز للتسليم" },
    late: { cls: "b-late", label: "🔴 متأخر" },
    progress: { cls: "b-progress", label: "🟡 قيد التنفيذ" },
    alteration: { cls: "b-alter", label: "🟠 طلب تعديل" },
  };
  return map[status];
}
function isLatePayment(b) {
  if (remaining(b) <= 0) return false;
  const wd = b.wedding.date ? daysUntil(b.wedding.date) : null;
  const da = b.deliveryAgreed ? daysUntil(b.deliveryAgreed) : null;
  return (wd !== null && wd < 0) || (da !== null && da < 0);
}
function nextFittingDate(b) {
  const dated = (b.fittings || []).filter((f) => f.date).sort((a, c) => a.date.localeCompare(c.date));
  if (dated.length === 0) return null;
  const upcoming = dated.find((f) => f.date >= todayStr());
  return upcoming || dated[dated.length - 1];
}

/* ============================== storage ============================== */

async function loadBrides() {
  try {
    const res = await window.storage.get("brides-data", false);
    if (res && res.value) return JSON.parse(res.value);
    return [];
  } catch (e) {
    return [];
  }
}
async function persistBrides(list) {
  try {
    await window.storage.set("brides-data", JSON.stringify(list), false);
    return true;
  } catch (e) {
    return false;
  }
}

/* images are stored per-bride under their own key so the main list/dashboard
   stays light and fast; only the open profile loads its photos. */
async function loadBrideImages(id) {
  try {
    const res = await window.storage.get("bride-images:" + id, false);
    if (res && res.value) return JSON.parse(res.value);
    return {};
  } catch (e) {
    return {};
  }
}
async function persistBrideImages(id, obj) {
  try {
    await window.storage.set("bride-images:" + id, JSON.stringify(obj), false);
    return { ok: true };
  } catch (e) {
    return { ok: false };
  }
}
async function deleteBrideImages(id) {
  try { await window.storage.delete("bride-images:" + id, false); } catch (e) { /* best effort, key may not exist */ }
}

/* ---------- app-wide settings: theme colors, dashboard card visibility, dress-code counter ---------- */
const DEFAULT_THEME = { wine: "#6B1E3C", gold: "#B8935A" };
function darken(hex, factor = 0.68) {
  try {
    const n = hex.replace("#", "");
    const r = Math.round(parseInt(n.substring(0, 2), 16) * factor);
    const g = Math.round(parseInt(n.substring(2, 4), 16) * factor);
    const b = Math.round(parseInt(n.substring(4, 6), 16) * factor);
    return `#${[r, g, b].map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0")).join("")}`;
  } catch (e) { return "#4A1329"; }
}
async function loadSettings() {
  try {
    const res = await window.storage.get("app-settings", false);
    if (res && res.value) return JSON.parse(res.value);
    return {};
  } catch (e) { return {}; }
}
async function persistSettings(obj) {
  try { await window.storage.set("app-settings", JSON.stringify(obj), false); return true; }
  catch (e) { return false; }
}

/* ---------- AI smart review (delivery reminders + financial sanity checks) ---------- */
async function loadAIReview() {
  try {
    const res = await window.storage.get("ai-review-cache", false);
    if (res && res.value) return JSON.parse(res.value);
    return null;
  } catch (e) { return null; }
}
async function persistAIReview(obj) {
  try { await window.storage.set("ai-review-cache", JSON.stringify(obj), false); } catch (e) { /* best effort */ }
}

async function runSmartReview(brides) {
  const today = todayStr();
  const compact = brides.map((b) => ({
    id: b.id,
    name: b.name || "بدون اسم",
    wedding_date: b.wedding.date || null,
    delivery_agreed: b.deliveryAgreed || null,
    delivery_actual: b.deliveryActual || null,
    production_stage: b.productionStage,
    total_after_discount: finalPrice(b),
    deposit: Number(b.finance.deposit) || 0,
    extra_payments_total: b.finance.payments.reduce((s, p) => s + (Number(p.amount) || 0), 0),
    remaining: remaining(b),
  }));

  const prompt = `اليوم هو ${today}. هذه بيانات عرايس بوتيك فساتين زفاف بصيغة JSON:
${JSON.stringify(compact)}

راجعي البيانات وأرجعي فقط مصفوفة JSON صافية (بدون أي نص خارجها ولا Markdown) لتنبيهات مهمة لصاحبة البوتيك، كل عنصر بهذا الشكل بالضبط:
{"bride_id": "...", "bride_name": "...", "severity": "high", "message": "جملة عربية قصيرة وواضحة وودودة"}
severity يكون واحدة من: high, medium, info.

انتبهي تحديداً لـ:
1) فساتين موعد تسليمها المتفق عليه خلال 3 أيام أو أقل من اليوم ولم تُسلَّم بعد (تأخير أو اقتراب) — severity: high إذا يوم واحد أو أقل أو فات الموعد، وإلا medium.
2) أي تناقض أو خطأ حسابي محتمل: (deposit + extra_payments_total) أكبر من total_after_discount، أو remaining لا يطابق total_after_discount - deposit - extra_payments_total، أو أرقام سالبة أو صفرية غير منطقية مع وجود دفعات.
3) فستان وصل لمرحلة "done" (تم الانتهاء) لكن delivery_agreed فاضي.
4) موعد زواج خلال 7 أيام والمرحلة لسه "not_started".
5) موعد زواج مضى (قبل اليوم) والفستان لسه مو مُسلَّم.
إذا ما فيه أي ملاحظة مهمة، أرجعي مصفوفة فاضية []. لا تكتبي أي شيء غير المصفوفة نفسها.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  const text = (data.content || []).map((c) => c.text || "").join("\n");
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  if (!Array.isArray(parsed)) throw new Error("bad format");
  return parsed;
}

function resizeImage(file, maxDim = 820, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
        else if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ============================== small UI atoms ============================== */

function Field({ label, children }) {
  return (
    <div className="bb-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function StatCard({ icon, num, label, onClick }) {
  return (
    <div className="bb-stat-card" onClick={onClick}>
      <span className="icon">{icon}</span>
      <div className="num">{num}</div>
      <div className="lbl">{label}</div>
    </div>
  );
}

function Badge({ status }) {
  const b = statusBadge(status);
  return <span className={`bb-badge ${b.cls}`}>{b.label}</span>;
}

function ImageGallery({ title, images, onChange }) {
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const list = images || [];

  const handleFiles = async (files) => {
    setBusy(true); setError("");
    const arr = [...list];
    for (const file of Array.from(files)) {
      try {
        const url = await resizeImage(file);
        arr.push({ id: uid(), url });
      } catch (e) { /* skip file */ }
    }
    const ok = await onChange(arr);
    if (ok === false) setError("تعذّر الحفظ — المساحة المخصصة للصور شارفت على الحد. احذفي بعض الصور القديمة.");
    setBusy(false);
  };
  const remove = async (id) => { await onChange(list.filter((i) => i.id !== id)); };

  return (
    <div style={{ marginBottom: 10 }}>
      {title && <div style={{ fontSize: 12, color: "#8A7A6E", fontWeight: 600, marginBottom: 6 }}>{title}</div>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {list.map((img) => (
          <div key={img.id} style={{ position: "relative", width: 60, height: 60 }}>
            <img src={img.url} onClick={() => setPreview(img.url)} alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 9, border: "1px solid #E8DDD6", cursor: "pointer" }} />
            <button onClick={() => remove(img.id)}
              style={{ position: "absolute", top: -6, left: -6, width: 18, height: 18, borderRadius: "50%", background: "#B23B3B", color: "#fff", border: "2px solid #fff", fontSize: 11, cursor: "pointer", lineHeight: "14px", padding: 0 }}>×</button>
          </div>
        ))}
        <label style={{ width: 60, height: 60, borderRadius: 9, border: "1.5px dashed #D8C7BC", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--bb-gold)", flexShrink: 0 }}>
          {busy ? <Loader2 className="animate-spin" size={16} /> : <Plus size={18} />}
          <input type="file" accept="image/*" multiple style={{ display: "none" }}
            onChange={(e) => { if (e.target.files && e.target.files.length) handleFiles(e.target.files); e.target.value = ""; }} />
        </label>
      </div>
      {error && <div style={{ fontSize: 11.5, color: "#B23B3B", marginTop: 5 }}>{error}</div>}
      {preview && (
        <div onClick={() => setPreview(null)} style={{ position: "fixed", inset: 0, background: "rgba(43,35,32,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20, cursor: "zoom-out" }}>
          <img src={preview} alt="" style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: 12 }} />
        </div>
      )}
    </div>
  );
}

const NAV = [
  { key: "dashboard", label: "الرئيسية", icon: Home },
  { key: "brides", label: "العميلات", icon: Users },
  { key: "bookings", label: "الحجوزات", icon: CalendarDays },
  { key: "production", label: "المعمل", icon: Factory },
  { key: "finance", label: "المالية", icon: Wallet },
  { key: "reports", label: "التقارير", icon: BarChart3 },
];

function CustomFieldsSection({ bride, onUpdate }) {
  const add = () => onUpdate((b) => ({ ...b, extraFields: [...(b.extraFields || []), { id: uid(), label: "", value: "" }] }));
  const setField = (fid, k, v) => onUpdate((b) => ({ ...b, extraFields: b.extraFields.map((f) => (f.id === fid ? { ...f, [k]: v } : f)) }));
  const remove = (fid) => onUpdate((b) => ({ ...b, extraFields: b.extraFields.filter((f) => f.id !== fid) }));
  const fields = bride.extraFields || [];

  return (
    <div className="bb-card">
      <div className="bb-card-head">
        <div className="bb-card-title">➕ حقول إضافية خاصة بك</div>
        <button className="bb-btn bb-btn-ghost bb-btn-sm" onClick={add}><Plus size={14} /> إضافة حقل</button>
      </div>
      {fields.length === 0 && <div className="bb-empty">أضيفي أي معلومة تحتاجينها ما هي موجودة في النموذج الأساسي — بدون ما تحتاجين تعديل البرنامج نفسه.</div>}
      {fields.map((f) => (
        <div key={f.id} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <input placeholder="اسم الحقل (مثال: مقاس الحذاء)" value={f.label} onChange={(e) => setField(f.id, "label", e.target.value)}
            style={{ width: "38%", border: "1px solid #E8DDD6", borderRadius: 8, padding: 8, fontSize: 12.5, fontFamily: "Tajawal" }} />
          <input placeholder="القيمة" value={f.value} onChange={(e) => setField(f.id, "value", e.target.value)}
            style={{ flex: 1, border: "1px solid #E8DDD6", borderRadius: 8, padding: 8, fontSize: 12.5, fontFamily: "Tajawal" }} />
          <button className="bb-icon-btn" onClick={() => remove(f.id)}><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  );
}

/* ============================== app ============================== */

export default function BridalApp() {
  const [brides, setBrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({ theme: DEFAULT_THEME, dashboardPrefs: {}, dressCounter: 0 });

  useEffect(() => {
    loadBrides().then((data) => { setBrides(data); setLoading(false); });
    loadSettings().then((s) => {
      setSettings({
        theme: { ...DEFAULT_THEME, ...(s.theme || {}) },
        dashboardPrefs: s.dashboardPrefs || {},
        dressCounter: s.dressCounter || 0,
      });
    });
  }, []);

  const saveSettings = useCallback((next) => {
    setSettings(next);
    persistSettings(next);
  }, []);

  const commit = useCallback(async (next) => {
    setBrides(next);
    setSaving(true);
    await persistBrides(next);
    setSaving(false);
  }, []);

  const updateBride = useCallback((id, updater) => {
    setBrides((prev) => {
      const next = prev.map((b) => (b.id === id ? updater(b) : b));
      persistBrides(next);
      return next;
    });
  }, []);

  const addBride = useCallback((bride) => {
    commit([bride, ...brides]);
  }, [brides, commit]);

  const deleteBride = useCallback((id) => {
    commit(brides.filter((b) => b.id !== id));
    deleteBrideImages(id);
    setSelectedId(null);
  }, [brides, commit]);

  const selected = useMemo(() => brides.find((b) => b.id === selectedId) || null, [brides, selectedId]);

  const filtered = useMemo(() => {
    let list = brides;
    const q = search.trim();
    if (q) {
      list = list.filter((b) =>
        [b.name, b.phone, b.whatsapp, b.dress.code].join(" ").toLowerCase().includes(q.toLowerCase())
      );
    }
    if (filter !== "all") {
      list = list.filter((b) => {
        switch (filter) {
          case "today_booking": return b.booking.date === todayStr();
          case "today_fitting": return b.fittings.some((f) => f.date === todayStr());
          case "late": return isLate(b);
          case "ready": return isReady(b);
          case "unpaid": return remaining(b) > 0;
          case "late_payment": return isLatePayment(b);
          case "soon_wedding": { const d = daysUntil(b.wedding.date); return d !== null && d >= 0 && d <= 14; }
          default: return true;
        }
      });
    }
    return list;
  }, [brides, search, filter]);

  if (loading) {
    return (
      <div className="bb-root" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{CSS}</style>
        <div style={{ textAlign: "center", color: "var(--bb-wine)" }}>
          <Loader2 className="animate-spin" style={{ margin: "0 auto 10px" }} size={28} />
          جارِ تحميل البيانات...
        </div>
      </div>
    );
  }

  return (
    <div className="bb-root" style={{ "--bb-wine": settings.theme.wine, "--bb-wine-dark": darken(settings.theme.wine), "--bb-gold": settings.theme.gold }}>
      <style>{CSS}</style>
      <div className="bb-shell">
        <div className="bb-main">
          {selected ? (
            <BrideProfile
              bride={selected}
              onBack={() => setSelectedId(null)}
              onUpdate={(updater) => updateBride(selected.id, updater)}
              onDelete={() => deleteBride(selected.id)}
              saving={saving}
            />
          ) : (
            <>
              <TopBar
                tab={tab}
                search={search} setSearch={setSearch}
                saving={saving}
                onSettings={() => setShowSettings(true)}
              />
              {tab === "dashboard" && (
                <Dashboard
                  brides={brides}
                  onOpen={(id) => setSelectedId(id)}
                  onFilterGo={(f) => { setTab("brides"); setFilter(f); }}
                  dashboardPrefs={settings.dashboardPrefs}
                />
              )}
              {tab === "brides" && (
                <BrideList
                  brides={filtered}
                  filter={filter} setFilter={setFilter}
                  onOpen={(id) => setSelectedId(id)}
                  onQuickAction={(id, action) => updateBride(id, (b) => {
                    if (action === "ready") return { ...b, productionStage: "done" };
                    if (action === "edit") return { ...b, productionStage: "alteration_requested" };
                    if (action === "deliver") return { ...b, deliveryActual: todayStr() };
                    return b;
                  })}
                />
              )}
              {tab === "bookings" && (
                <BookingsView brides={brides} onOpen={(id) => setSelectedId(id)} />
              )}
              {tab === "production" && (
                <ProductionBoard brides={brides} onOpen={(id) => setSelectedId(id)} />
              )}
              {tab === "finance" && (
                <FinanceView brides={brides} onOpen={(id) => setSelectedId(id)} />
              )}
              {tab === "reports" && <ReportsView brides={brides} />}
            </>
          )}
        </div>
        <BottomNav tab={tab} setTab={(t) => { setTab(t); setSelectedId(null); }} />
        {!selected && <button className="bb-fab" onClick={() => setShowAdd(true)} aria-label="عروسة جديدة"><Plus size={24} /></button>}
      </div>
      {showAdd && (
        <AddBrideModal
          onClose={() => setShowAdd(false)}
          onCreate={(name, phone) => {
            const b = blankBride();
            b.name = name; b.phone = phone;
            const nextCounter = (settings.dressCounter || 0) + 1;
            b.dress.code = String(nextCounter).padStart(4, "0");
            saveSettings({ ...settings, dressCounter: nextCounter });
            addBride(b);
            setShowAdd(false);
            setSelectedId(b.id);
          }}
        />
      )}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={(next) => { saveSettings(next); setShowSettings(false); }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

/* ============================== bottom nav / topbar ============================== */

function BottomNav({ tab, setTab }) {
  return (
    <div className="bb-bottomnav">
      {NAV.map((n) => {
        const Icon = n.icon;
        return (
          <button key={n.key} className={`bb-nav-item ${tab === n.key ? "active" : ""}`} onClick={() => setTab(n.key)}>
            <Icon size={18} />
            <span>{n.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const TAB_TITLES = {
  dashboard: ["لوحة التحكم", "نظرة عامة على البوتيك اليوم"],
  brides: ["العميلات", "كل العرايس وملفاتهن"],
  bookings: ["الحجوزات", "المواعيد القادمة والبروفات"],
  production: ["المعمل", "مراحل تنفيذ الفساتين"],
  finance: ["المالية", "التحصيل والمستحقات"],
  reports: ["التقارير", "أداء البوتيك بالأرقام"],
};

function TopBar({ tab, search, setSearch, saving, onSettings }) {
  const [title, subtitle] = TAB_TITLES[tab];
  return (
    <div className="bb-topbar">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div className="bb-title">{title}</div>
          <div className="bb-subtitle">
            {subtitle}
            {saving && <span style={{ color: "var(--bb-gold)" }}> · جارِ الحفظ...</span>}
          </div>
        </div>
        <button className="bb-icon-btn" onClick={onSettings} aria-label="الإعدادات" style={{ marginTop: 2 }}><Settings size={17} /></button>
      </div>
      <div className="bb-search">
        <Search size={15} color="#A08E80" />
        <input placeholder="ابحثي بالاسم أو الجوال أو كود الفستان" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
    </div>
  );
}

function AddBrideModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(43,35,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div className="bb-card" style={{ width: "100%", maxWidth: 380, marginBottom: 0 }}>
        <div className="bb-card-head">
          <div className="bb-card-title">👰 عروسة جديدة</div>
          <button className="bb-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <Field label="اسم العروسة"><input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: سارة الحربي" /></Field>
        <Field label="رقم الجوال"><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" /></Field>
        <button className="bb-btn bb-btn-primary" style={{ width: "100%", justifyContent: "center" }}
          disabled={!name.trim()} onClick={() => onCreate(name.trim(), phone.trim())}>
          <Plus size={16} /> إنشاء الملف وفتحه
        </button>
      </div>
    </div>
  );
}

function SettingsModal({ settings, onSave, onClose }) {
  const [wine, setWine] = useState(settings.theme.wine);
  const [gold, setGold] = useState(settings.theme.gold);
  const [prefs, setPrefs] = useState({ ...settings.dashboardPrefs });

  const toggle = (id) => setPrefs((p) => ({ ...p, [id]: p[id] === false ? true : false }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(43,35,32,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}>
      <div className="bb-card" style={{ width: "100%", maxWidth: 560, marginBottom: 0, borderRadius: "20px 20px 0 0", maxHeight: "85vh", overflowY: "auto" }}>
        <div className="bb-card-head">
          <div className="bb-card-title">⚙️ الإعدادات</div>
          <button className="bb-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--bb-wine-dark)", marginBottom: 10 }}>🎨 ألوان الواجهة</div>
        <div className="bb-grid2" style={{ marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <input type="color" value={wine} onChange={(e) => setWine(e.target.value)} style={{ width: 44, height: 44, border: "none", borderRadius: 10, cursor: "pointer" }} />
            <span style={{ fontSize: 13 }}>اللون الأساسي</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <input type="color" value={gold} onChange={(e) => setGold(e.target.value)} style={{ width: 44, height: 44, border: "none", borderRadius: 10, cursor: "pointer" }} />
            <span style={{ fontSize: 13 }}>اللون الثانوي (الذهبي)</span>
          </div>
        </div>

        <hr className="bb-hr" />

        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--bb-wine-dark)", margin: "10px 0" }}>📊 بطاقات لوحة التحكم</div>
        <div style={{ fontSize: 12, color: "#8A7A6E", marginBottom: 10 }}>ألغي أي بطاقة ما تحتاجينها من الرئيسية</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          {DASHBOARD_CARD_META.map((c) => (
            <label key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 4px", borderBottom: "1px solid #F1E8E2", fontSize: 13.5 }}>
              <span>{c.label}</span>
              <input type="checkbox" checked={prefs[c.id] !== false} onChange={() => toggle(c.id)} />
            </label>
          ))}
        </div>

        <button className="bb-btn bb-btn-primary bb-btn-block" style={{ justifyContent: "center" }}
          onClick={() => onSave({ theme: { wine, gold }, dashboardPrefs: prefs, dressCounter: settings.dressCounter })}>
          <Save size={16} /> حفظ الإعدادات
        </button>
      </div>
    </div>
  );
}

/* ============================== dashboard ============================== */

function AIAssistant({ brides, onOpen }) {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState(null);
  const [error, setError] = useState(null);
  const [checkedAt, setCheckedAt] = useState(null);
  const ranOnce = React.useRef(false);

  const run = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const result = await runSmartReview(brides);
      const now = Date.now();
      setAlerts(result); setCheckedAt(now);
      persistAIReview({ alerts: result, checkedAt: now });
    } catch (e) {
      setError("تعذّر الاتصال بالمساعد الذكي حالياً — حاولي مرة ثانية.");
    }
    setLoading(false);
  }, [brides]);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;
    loadAIReview().then((cached) => {
      const fresh = cached && cached.checkedAt && (Date.now() - cached.checkedAt) < 6 * 60 * 60 * 1000;
      if (fresh) { setAlerts(cached.alerts); setCheckedAt(cached.checkedAt); }
      else if (brides.length > 0) { run(); }
    });
    // eslint-disable-next-line
  }, []);

  const sevStyle = { high: { bg: "#FBEAEA", color: "#B23B3B", icon: "🔴" }, medium: { bg: "#FBF0DE", color: "#93641F", icon: "🟠" }, info: { bg: "#E9F1E7", color: "#4F6B4A", icon: "🔵" } };

  return (
    <div className="bb-card">
      <div className="bb-card-head">
        <div className="bb-card-title"><Bot size={19} color="var(--bb-wine)" /> المساعد الذكي</div>
        <button className="bb-icon-btn" onClick={run} disabled={loading} title="تحديث المراجعة">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      {loading && !alerts && <div className="bb-empty" style={{ padding: 18 }}><Loader2 className="animate-spin" size={20} style={{ margin: "0 auto 8px" }} />جارِ مراجعة البيانات...</div>}
      {error && <div style={{ fontSize: 13, color: "#B23B3B", padding: "6px 2px" }}>{error}</div>}
      {!loading && !error && alerts && alerts.length === 0 && (
        <div className="bb-empty" style={{ padding: 18 }}>✅ كل شيء تمام، ما فيه تنبيهات الآن.</div>
      )}
      {alerts && alerts.length > 0 && (
        <div className="bb-list">
          {alerts.map((a, i) => {
            const s = sevStyle[a.severity] || sevStyle.info;
            const match = brides.find((b) => b.id === a.bride_id);
            return (
              <div key={i} className="bb-list-row" style={{ background: s.bg, borderColor: s.bg }}
                onClick={() => match && onOpen(match.id)}>
                <div>
                  <div className="name" style={{ color: s.color }}>{s.icon} {a.bride_name || match?.name || ""}</div>
                  <div className="meta" style={{ color: s.color }}>{a.message}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {checkedAt && !loading && (
        <div style={{ fontSize: 11, color: "#A08E80", marginTop: 8 }}>
          آخر مراجعة: {new Date(checkedAt).toLocaleString("ar-SA", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
        </div>
      )}
    </div>
  );
}

function Dashboard({ brides, onOpen, onFilterGo, dashboardPrefs }) {
  const today = todayStr();
  const todayBookings = brides.filter((b) => b.booking.date === today);
  const todayFittings = [];
  brides.forEach((b) => b.fittings.forEach((f) => { if (f.date === today) todayFittings.push({ bride: b, fitting: f }); }));
  const todayDeliveries = brides.filter((b) => b.deliveryAgreed === today || b.deliveryActual === today);

  const inProgress = brides.filter((b) => mainStatus(b) === "progress");
  const alteration = brides.filter((b) => mainStatus(b) === "alteration");
  const late = brides.filter((b) => isLate(b));
  const ready = brides.filter((b) => isReady(b));
  const done = brides.filter((b) => isDelivered(b));
  const latePayments = brides.filter((b) => isLatePayment(b));
  const totalCollected = brides.reduce((s, b) => s + collected(b), 0);
  const totalRemaining = brides.reduce((s, b) => s + remaining(b), 0);

  const events = [
    ...todayBookings.map((b) => ({ lbl: "👰 موعد عروسة اليوم", val: b.name, id: b.id })),
    ...todayFittings.map(({ bride, fitting }) => ({ lbl: `📅 بروفة ${fitting.number}`, val: bride.name, id: bride.id })),
    ...todayDeliveries.map((b) => ({ lbl: "🚚 تسليم اليوم", val: b.name, id: b.id })),
  ];

  const allCards = [
    { id: "total_brides", icon: "👰", num: brides.length, label: "إجمالي العرايس", go: "all" },
    { id: "today_booking", icon: "📅", num: todayBookings.length, label: "مواعيد العرايس اليوم", go: "today_booking" },
    { id: "today_fitting", icon: "📅", num: todayFittings.length, label: "البروفات اليوم", go: "today_fitting" },
    { id: "in_progress", icon: "👗", num: inProgress.length, label: "فساتين تحت التنفيذ", go: "all" },
    { id: "alteration", icon: "🟠", num: alteration.length, label: "طلبات تعديل", go: "all" },
    { id: "late", icon: "⚠️", num: late.length, label: "فساتين متأخرة", go: "late" },
    { id: "ready", icon: "📦", num: ready.length, label: "فساتين جاهزة للتسليم", go: "ready" },
    { id: "today_delivery", icon: "🚚", num: todayDeliveries.length, label: "تسليمات اليوم", go: "all" },
    { id: "collected", icon: "💰", num: money(totalCollected), label: "إجمالي المبالغ المحصلة", go: "all" },
    { id: "remaining", icon: "💵", num: money(totalRemaining), label: "المبالغ المتبقية", go: "unpaid" },
    { id: "late_payment", icon: "🔴", num: latePayments.length, label: "دفعات متأخرة", go: "late_payment" },
    { id: "done", icon: "🟢", num: done.length, label: "فساتين مكتملة", go: "all" },
  ];
  const cards = allCards.filter((c) => dashboardPrefs[c.id] !== false);

  return (
    <div>
      <div className="bb-ribbon">
        <div className="bb-ribbon-head">
          <div className="bb-ribbon-title">✨ يومك بالبوتيك</div>
          <div className="bb-ribbon-date">{new Date().toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
        </div>
        {events.length === 0 ? (
          <div className="bb-ribbon-empty">لا توجد مواعيد أو تسليمات مجدولة اليوم.</div>
        ) : (
          <div className="bb-ribbon-track bb-scrollbar">
            {events.map((e, i) => (
              <div key={i} className="bb-ribbon-item" onClick={() => onOpen(e.id)} style={{ cursor: "pointer" }}>
                <div className="lbl">{e.lbl}</div>
                <div className="val">{e.val}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AIAssistant brides={brides} onOpen={onOpen} />

      {cards.length === 0 ? (
        <div className="bb-empty">أخفيتِ كل البطاقات. افتحي ⚙️ الإعدادات لإظهار ما تحتاجينه.</div>
      ) : (
        <div className="bb-stat-grid">
          {cards.map((c) => (
            <StatCard key={c.id} icon={c.icon} num={c.num} label={c.label} onClick={() => onFilterGo(c.go)} />
          ))}
        </div>
      )}

      <div className="bb-card">
        <div className="bb-card-head"><div className="bb-card-title">👰 أحدث العميلات</div></div>
        <BrideTable brides={brides.slice(0, 8)} onOpen={onOpen} />
      </div>
    </div>
  );
}

function BrideTable({ brides, onOpen, onQuickAction }) {
  if (brides.length === 0) return <div className="bb-empty">لا توجد بيانات بعد. ابدئي بإضافة عروسة جديدة 👰</div>;
  return (
    <div className="bb-list">
      {brides.map((b) => {
        const fit = nextFittingDate(b);
        return (
          <div key={b.id} className="bb-list-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }} onClick={() => onOpen(b.id)}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div className="name">{b.name || "بدون اسم"} <span className="bb-badge b-progress" style={{ marginRight: 4 }}>{b.dress.category}</span></div>
                <div className="meta">
                  <span>📏 بروفة: {fit ? fit.date : "—"}</span>
                  <span>🚚 تسليم: {b.deliveryAgreed || "—"}</span>
                </div>
              </div>
              <div className="side">
                <div style={{ marginBottom: 5 }}><Badge status={mainStatus(b)} /></div>
                <div style={{ fontSize: 11.5, color: remaining(b) > 0 ? "#B23B3B" : "#4F6B4A", fontWeight: 700 }}>
                  متبقي {money(remaining(b))}
                </div>
              </div>
            </div>
            {onQuickAction && !isDelivered(b) && (
              <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                <button className="bb-btn bb-btn-ghost bb-btn-sm" style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => onQuickAction(b.id, "ready")}>📦 جاهز</button>
                <button className="bb-btn bb-btn-ghost bb-btn-sm" style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => onQuickAction(b.id, "edit")}>🟠 تعديل</button>
                <button className="bb-btn bb-btn-ghost bb-btn-sm" style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => onQuickAction(b.id, "deliver")}>✅ تسليم</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============================== bride list ============================== */

const FILTERS = [
  { key: "today_booking", label: "مواعيد اليوم" },
  { key: "today_fitting", label: "بروفات اليوم" },
  { key: "ready", label: "جاهزة للتسليم" },
  { key: "all", label: "الكل" },
];

function BrideList({ brides, filter, setFilter, onOpen, onQuickAction }) {
  const sorted = useMemo(() => {
    return [...brides].sort((a, b) => {
      const ra = isReady(a) ? 0 : 1;
      const rb = isReady(b) ? 0 : 1;
      return ra - rb;
    });
  }, [brides]);
  return (
    <div>
      <div className="bb-chip-row">
        {FILTERS.map((f) => (
          <button key={f.key} className={`bb-chip ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>{f.label}</button>
        ))}
      </div>
      <BrideTable brides={sorted} onOpen={onOpen} onQuickAction={onQuickAction} />
    </div>
  );
}

/* ============================== bookings view ============================== */

function BookingsView({ brides, onOpen }) {
  const [range, setRange] = useState("week");
  const today = todayStr();
  const rangeEnd = useMemo(() => {
    const d = new Date();
    if (range === "day") return today;
    if (range === "week") { d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); }
    if (range === "month") { d.setMonth(d.getMonth() + 1); return d.toISOString().slice(0, 10); }
    return "9999-12-31";
  }, [range, today]);

  const upcoming = useMemo(() => {
    const items = [];
    brides.forEach((b) => {
      if (b.booking.date >= today) items.push({ type: "موعد العروسة", date: b.booking.date, bride: b, sub: "حضور للبوتيك" });
      b.fittings.forEach((f) => { if (f.date && f.date >= today) items.push({ type: `بروفة ${f.number}`, date: f.date, bride: b, sub: f.time || "" }); });
      if (b.deliveryAgreed && b.deliveryAgreed >= today) items.push({ type: "تسليم", date: b.deliveryAgreed, bride: b, sub: "موعد التسليم المتفق عليه" });
    });
    return items.filter((it) => it.date <= rangeEnd).sort((a, b) => a.date.localeCompare(b.date));
  }, [brides, today, rangeEnd]);

  return (
    <div>
      <div className="bb-chip-row">
        {[["day", "اليوم"], ["week", "هذا الأسبوع"], ["month", "هذا الشهر"], ["all", "الكل"]].map(([k, l]) => (
          <button key={k} className={`bb-chip ${range === k ? "active" : ""}`} onClick={() => setRange(k)}>{l}</button>
        ))}
      </div>
      {upcoming.length === 0 ? (
        <div className="bb-empty">لا توجد مواعيد ضمن هذه الفترة.</div>
      ) : (
        <div className="bb-list">
          {upcoming.map((u, i) => (
            <div key={i} className="bb-list-row" onClick={() => onOpen(u.bride.id)}>
              <div>
                <div className="name">{u.bride.name}</div>
                <div className="meta">
                  <span>{u.type}</span>
                  {u.sub && <span>{u.sub}</span>}
                </div>
              </div>
              <div className="side" style={{ fontWeight: 700, fontSize: 13 }}>
                {u.date === today ? <span style={{ color: "#B23B3B" }}>اليوم</span> : u.date}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== production board ============================== */

function ProductionBoard({ brides, onOpen }) {
  const active = brides.filter((b) => !isDelivered(b));
  const summary = useMemo(() => {
    const s = {};
    STAGE_OPTIONS.forEach((s2) => { s[s2.key] = 0; });
    active.forEach((b) => { s[b.productionStage] = (s[b.productionStage] || 0) + 1; });
    return s;
  }, [active]);

  return (
    <div>
      <div className="bb-stat-grid">
        {STAGE_OPTIONS.map((s) => (
          <StatCard key={s.key} icon={s.icon} num={summary[s.key] || 0} label={s.label} />
        ))}
      </div>
      <div className="bb-card-head"><div className="bb-card-title">🧵 الفساتين في المعمل</div></div>
      {active.length === 0 ? <div className="bb-empty">لا توجد فساتين قيد التنفيذ حالياً.</div> : (
        <div className="bb-list">
          {active.map((b) => {
            const stage = STAGE_OPTIONS.find((s) => s.key === b.productionStage) || STAGE_OPTIONS[0];
            return (
              <div key={b.id} className="bb-list-row" onClick={() => onOpen(b.id)}>
                <div>
                  <div className="name">{b.name}</div>
                  <div className="meta">
                    <span>كود {b.dress.code || "—"}</span>
                    <span>{stage.icon} {stage.label}</span>
                  </div>
                </div>
                <div className="side"><Badge status={mainStatus(b)} /></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================== finance view ============================== */

function FinanceView({ brides, onOpen }) {
  const totalCollected = brides.reduce((s, b) => s + collected(b), 0);
  const totalRemaining = brides.reduce((s, b) => s + remaining(b), 0);
  const totalContracts = brides.reduce((s, b) => s + finalPrice(b), 0);
  const totalDeposits = brides.reduce((s, b) => s + (Number(b.finance.deposit) || 0), 0);
  const late = brides.filter((b) => isLatePayment(b));

  return (
    <div>
      <div className="bb-stat-grid">
        <StatCard icon="📄" num={money(totalContracts)} label="إجمالي قيمة العقود" />
        <StatCard icon="🤝" num={money(totalDeposits)} label="إجمالي العرابين" />
        <StatCard icon="💰" num={money(totalCollected)} label="إجمالي المحصّل" />
        <StatCard icon="💵" num={money(totalRemaining)} label="إجمالي المتبقي" />
        <StatCard icon="🔴" num={late.length} label="دفعات متأخرة" />
      </div>
      <div className="bb-card-head"><div className="bb-card-title">💰 كشف مالي بكل العميلات</div></div>
      <div className="bb-list">
        {brides.map((b) => {
          const fp = finalPrice(b); const col = collected(b);
          const deposit = Number(b.finance.deposit) || 0;
          const pct = fp > 0 ? Math.round((col / fp) * 100) : 0;
          return (
            <div key={b.id} className="bb-list-row" onClick={() => onOpen(b.id)}>
              <div>
                <div className="name">{b.name}</div>
                <div className="meta">
                  <span>عقد {money(fp)}</span>
                  <span>عربون {money(deposit)}</span>
                  <span>محصّل {money(col)}</span>
                  <span>{fp > 0 ? `${pct}%` : "—"}</span>
                </div>
              </div>
              <div className="side" style={{ color: remaining(b) > 0 ? "#B23B3B" : "#4F6B4A", fontWeight: 700, fontSize: 13 }}>
                {money(remaining(b))}
              </div>
            </div>
          );
        })}
        {brides.length === 0 && <div className="bb-empty">لا توجد بيانات مالية بعد.</div>}
      </div>
    </div>
  );
}

/* ============================== reports view ============================== */

function ReportsView({ brides }) {
  const today = new Date();
  const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const sumPaymentsSince = (date) => {
    let sum = 0;
    brides.forEach((b) => b.finance.payments.forEach((p) => { if (p.date && new Date(p.date) >= date) sum += Number(p.amount) || 0; }));
    return sum;
  };
  const newClientsSince = (date) => brides.filter((b) => b.createdAt && new Date(b.createdAt) >= date).length;

  const avgProductionDays = useMemo(() => {
    const finished = brides.filter((b) => b.booking.date && b.deliveryActual);
    if (finished.length === 0) return null;
    const total = finished.reduce((s, b) => s + Math.max(0, (new Date(b.deliveryActual) - new Date(b.booking.date)) / 86400000), 0);
    return Math.round(total / finished.length);
  }, [brides]);

  return (
    <div>
      <div className="bb-card">
        <div className="bb-card-title" style={{ marginBottom: 14 }}>📊 تقرير التحصيل</div>
        <div className="bb-stat-grid">
          <StatCard icon="💰" num={money(sumPaymentsSince(startOfWeek))} label="محصّل هذا الأسبوع" />
          <StatCard icon="💰" num={money(sumPaymentsSince(startOfMonth))} label="محصّل هذا الشهر" />
          <StatCard icon="💰" num={money(sumPaymentsSince(startOfYear))} label="محصّل هذه السنة" />
        </div>
      </div>
      <div className="bb-card">
        <div className="bb-card-title" style={{ marginBottom: 14 }}>👰 تقرير العملاء</div>
        <div className="bb-stat-grid">
          <StatCard icon="👰" num={brides.length} label="إجمالي العملاء" />
          <StatCard icon="🆕" num={newClientsSince(startOfMonth)} label="عملاء جدد هذا الشهر" />
          <StatCard icon="✅" num={brides.filter((b) => isDelivered(b)).length} label="عملاء مكتملون" />
        </div>
      </div>
      <div className="bb-card">
        <div className="bb-card-title" style={{ marginBottom: 14 }}>🧵 تقرير المعمل</div>
        <div className="bb-stat-grid">
          <StatCard icon="🔵" num={brides.filter((b) => mainStatus(b) === "progress").length} label="قيد التنفيذ" />
          <StatCard icon="📦" num={brides.filter((b) => isReady(b)).length} label="جاهزة" />
          <StatCard icon="🔴" num={brides.filter((b) => isLate(b)).length} label="متأخرة" />
          <StatCard icon="⏱️" num={avgProductionDays === null ? "—" : `${avgProductionDays} يوم`} label="متوسط مدة التنفيذ" />
        </div>
      </div>
    </div>
  );
}

/* ============================== bride profile ============================== */

function BrideProfile({ bride, onBack, onUpdate, onDelete, saving }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [images, setImages] = useState(null);
  const days = daysUntil(bride.wedding.date);
  const nextFitting = nextFittingDate(bride);

  useEffect(() => {
    let alive = true;
    setImages(null);
    loadBrideImages(bride.id).then((data) => { if (alive) setImages(data); });
    return () => { alive = false; };
  }, [bride.id]);

  const patchImages = useCallback(async (updater) => {
    const base = images || {};
    const next = updater(base);
    setImages(next);
    const res = await persistBrideImages(bride.id, next);
    if (!res.ok) setImages(base); // roll back on failure (e.g. size limit)
    return res.ok;
  }, [bride.id, images]);

  return (
    <div>
      <div className="bb-back" onClick={onBack}><ArrowRight size={16} /> رجوع لكل العميلات</div>

      <div className="bb-topbar">
        <div>
          <div className="bb-title">{bride.name || "عروسة بدون اسم"}</div>
          <div className="bb-subtitle">
            <Badge status={mainStatus(bride)} />
            {saving && <span style={{ color: "var(--bb-gold)" }}> · جارِ الحفظ...</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 10 }}>
          {bride.phone && <a className="bb-btn bb-btn-ghost bb-btn-sm" href={`tel:${bride.phone}`}><Phone size={14} /> اتصال</a>}
          {bride.phone && <a className="bb-btn bb-btn-ghost bb-btn-sm" href={`https://wa.me/${bride.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle size={14} /> واتساب</a>}
          {!confirmDelete ? (
            <button className="bb-btn bb-btn-danger bb-btn-sm" onClick={() => setConfirmDelete(true)}><Trash2 size={14} /> حذف الملف</button>
          ) : (
            <>
              <span style={{ fontSize: 12.5, color: "#B23B3B" }}>تأكيد الحذف؟</span>
              <button className="bb-btn bb-btn-danger bb-btn-sm" onClick={onDelete}>نعم، احذف</button>
              <button className="bb-btn bb-btn-ghost bb-btn-sm" onClick={() => setConfirmDelete(false)}>تراجع</button>
            </>
          )}
        </div>
      </div>

      {days !== null && !isDelivered(bride) && (
        <div className="bb-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12.5, color: "#8A7A6E" }}>{days >= 0 ? "باقٍ على موعد الزواج" : "مضى على موعد الزواج"}</div>
            <div className="bb-days-left" style={{ color: days < 7 && days >= 0 ? "#B23B3B" : "var(--bb-wine-dark)" }}>{Math.abs(days)} يوم</div>
          </div>
          {days >= 0 && days <= 14 && <span className="bb-badge b-progress">🟠 موعد قريب</span>}
        </div>
      )}

      <div className="bb-card">
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: "#8A7A6E", marginBottom: 3 }}>👰 موعد العروسة</div>
            <div style={{ fontWeight: 700, color: "var(--bb-wine-dark)", fontSize: 14.5 }}>{bride.booking.date || "لم يُحدد"}</div>
          </div>
          <div style={{ width: 1, background: "#EFE4DD" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: "#8A7A6E", marginBottom: 3 }}>📏 موعد البروفة</div>
            <div style={{ fontWeight: 700, color: "var(--bb-wine-dark)", fontSize: 14.5 }}>{nextFitting ? nextFitting.date : "لم تُحدد"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: "#8A7A6E", marginBottom: 3 }}>🚚 موعد التسليم</div>
            <div style={{ fontWeight: 700, color: "var(--bb-wine-dark)", fontSize: 14.5 }}>{bride.deliveryAgreed || "لم يُحدد"}</div>
          </div>
          <div style={{ width: 1, background: "#EFE4DD" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: "#8A7A6E", marginBottom: 3 }}>💍 موعد الزواج</div>
            <div style={{ fontWeight: 700, color: "var(--bb-wine-dark)", fontSize: 14.5 }}>{bride.wedding.date || "لم يُحدد"}</div>
          </div>
        </div>
      </div>

      <div className="bb-grid2">
        <div>
          <BasicInfoSection bride={bride} onUpdate={onUpdate} />
          <WeddingSection bride={bride} onUpdate={onUpdate} images={images} patchImages={patchImages} />
          <DressSection bride={bride} onUpdate={onUpdate} images={images} patchImages={patchImages} />
          <FittingsSection bride={bride} onUpdate={onUpdate} images={images} patchImages={patchImages} />
          <AlterationsSection bride={bride} onUpdate={onUpdate} />
          <CustomFieldsSection bride={bride} onUpdate={onUpdate} />
        </div>
        <div>
          <ProductionSection bride={bride} onUpdate={onUpdate} images={images} patchImages={patchImages} />
          <FinanceSection bride={bride} onUpdate={onUpdate} />
        </div>
      </div>
    </div>
  );
}

function SectionHead({ title }) {
  return <div className="bb-card-head"><div className="bb-card-title">{title}</div></div>;
}

function BasicInfoSection({ bride, onUpdate }) {
  const set = (k, v) => onUpdate((b) => ({ ...b, [k]: v }));
  return (
    <div className="bb-card">
      <SectionHead title="👰 البيانات الأساسية" />
      <Field label="اسم العروسة"><input value={bride.name} onChange={(e) => set("name", e.target.value)} /></Field>
      <Field label="رقم الجوال"><input value={bride.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
    </div>
  );
}

function WeddingSection({ bride, onUpdate, images, patchImages }) {
  const setW = (k, v) => onUpdate((b) => ({ ...b, wedding: { ...b.wedding, [k]: v } }));
  const setB = (k, v) => onUpdate((b) => ({ ...b, booking: { ...b.booking, [k]: v } }));
  const setDelivery = (k, v) => {
    onUpdate((b) => {
      const prevVal = b[k];
      const hist = (prevVal && prevVal !== v)
        ? [...b.history, { id: uid(), date: todayStr(), field: k === "deliveryAgreed" ? "موعد التسليم" : "تم التسليم فعلاً", from: prevVal, to: v }]
        : b.history;
      return { ...b, [k]: v, history: hist };
    });
  };
  const setFittingDate = (v) => onUpdate((b) => {
    if (b.fittings.length === 0) {
      return { ...b, fittings: [{ id: uid(), number: 1, date: v, time: "", attended: false, done: false, notes: "", adjustments: "", noAdjustmentNeeded: false, employee: "" }] };
    }
    return { ...b, fittings: b.fittings.map((f, i) => (i === 0 ? { ...f, date: v } : f)) };
  });
  const fittingDate = bride.fittings[0] ? bride.fittings[0].date : "";

  return (
    <div className="bb-card">
      <SectionHead title="📅 المواعيد المهمة" />
      <Field label="تاريخ الحضور"><input type="date" value={bride.booking.date} onChange={(e) => setB("date", e.target.value)} /></Field>
      <Field label="البروفة"><input type="date" value={fittingDate} onChange={(e) => setFittingDate(e.target.value)} /></Field>
      <Field label="التسليم"><input type="date" value={bride.deliveryAgreed} onChange={(e) => setDelivery("deliveryAgreed", e.target.value)} /></Field>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 12 }}>
        <input type="checkbox" checked={!!bride.deliveryActual}
          onChange={(e) => setDelivery("deliveryActual", e.target.checked ? todayStr() : "")} />
        ✅ تم التسليم فعلاً {bride.deliveryActual ? `(${bride.deliveryActual})` : ""}
      </label>
      <Field label="الزواج"><input type="date" value={bride.wedding.date} onChange={(e) => setW("date", e.target.value)} /></Field>
      {images && (
        <ImageGallery title="📦 صور عند التسليم" images={images.delivery}
          onChange={(arr) => patchImages((img) => ({ ...img, delivery: arr }))} />
      )}
      {bride.history.length > 0 && (
        <>
          <hr className="bb-hr" />
          <div style={{ fontSize: 12, color: "#8A7A6E", fontWeight: 700, marginBottom: 6 }}>سجل تعديل المواعيد</div>
          {bride.history.map((h) => (
            <div key={h.id} style={{ fontSize: 12.5, color: "#8A7A6E", marginBottom: 4 }}>
              {h.date}: تغيّر «{h.field}» من {h.from || "—"} إلى {h.to || "—"}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function DressSection({ bride, onUpdate, images, patchImages }) {
  const set = (k, v) => onUpdate((b) => ({ ...b, dress: { ...b.dress, [k]: v } }));
  return (
    <div className="bb-card">
      <div className="bb-card-head">
        <div className="bb-card-title">👗 بيانات الفستان</div>
        <span className="bb-badge b-progress">كود {bride.dress.code || "—"}</span>
      </div>
      {images && (
        <div className="bb-grid2" style={{ marginBottom: 4 }}>
          <ImageGallery title="🎨 صور التصميم المرجعي" images={images.dressDesign}
            onChange={(arr) => patchImages((img) => ({ ...img, dressDesign: arr }))} />
          <ImageGallery title="👗 صور الفستان" images={images.dressGeneral}
            onChange={(arr) => patchImages((img) => ({ ...img, dressGeneral: arr }))} />
        </div>
      )}
      <Field label="فئة الفستان">
        <select value={bride.dress.category} onChange={(e) => set("category", e.target.value)}>
          {DRESS_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="ملاحظات"><textarea value={bride.dress.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
    </div>
  );
}

function FittingsSection({ bride, onUpdate, images, patchImages }) {
  const [adding, setAdding] = useState(false);
  const addFitting = () => {
    onUpdate((b) => ({
      ...b,
      fittings: [...b.fittings, { id: uid(), number: b.fittings.length + 1, date: "", time: "", attended: false, done: false, notes: "", adjustments: "", noAdjustmentNeeded: false, employee: "" }],
    }));
    setAdding(false);
  };
  const setField = (fid, k, v) => onUpdate((b) => ({ ...b, fittings: b.fittings.map((f) => (f.id === fid ? { ...f, [k]: v } : f)) }));
  const removeFitting = (fid) => onUpdate((b) => ({ ...b, fittings: b.fittings.filter((f) => f.id !== fid) }));

  return (
    <div className="bb-card">
      <div className="bb-card-head">
        <div className="bb-card-title">📏 البروفات</div>
        <button className="bb-btn bb-btn-ghost bb-btn-sm" onClick={addFitting}><Plus size={14} /> إضافة بروفة</button>
      </div>
      {bride.fittings.length === 0 && <div className="bb-empty">لا توجد بروفات مسجلة بعد.</div>}
      {bride.fittings.map((f) => (
        <div key={f.id} style={{ border: "1px solid #EFE4DD", borderRadius: 12, padding: 12, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ color: "var(--bb-wine-dark)" }}>بروفة رقم {f.number}</strong>
            <button className="bb-icon-btn" onClick={() => removeFitting(f.id)}><Trash2 size={14} /></button>
          </div>
          <div className="bb-grid3">
            <Field label="التاريخ"><input type="date" value={f.date} onChange={(e) => setField(f.id, "date", e.target.value)} /></Field>
            <Field label="الوقت"><input type="time" value={f.time} onChange={(e) => setField(f.id, "time", e.target.value)} /></Field>
            <Field label="الموظفة المسؤولة"><input value={f.employee} onChange={(e) => setField(f.id, "employee", e.target.value)} /></Field>
          </div>
          <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <input type="checkbox" checked={f.attended} onChange={(e) => setField(f.id, "attended", e.target.checked)} /> حضرت
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <input type="checkbox" checked={f.done} onChange={(e) => setField(f.id, "done", e.target.checked)} /> تمت البروفة
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <input type="checkbox" checked={f.noAdjustmentNeeded}
                onChange={(e) => { setField(f.id, "noAdjustmentNeeded", e.target.checked); if (e.target.checked) setField(f.id, "adjustments", ""); }} />
              ✅ لا يحتاج تعديل
            </label>
          </div>
          {!f.noAdjustmentNeeded && (
            <Field label="التعديلات المطلوبة"><input value={f.adjustments} onChange={(e) => setField(f.id, "adjustments", e.target.value)} placeholder="مثال: تضييق الخصر، تقصير الذيل" /></Field>
          )}
          <Field label="ملاحظات"><textarea value={f.notes} onChange={(e) => setField(f.id, "notes", e.target.value)} /></Field>
          {images && (
            <ImageGallery title="📷 صور البروفة" images={images.fittings && images.fittings[f.id]}
              onChange={(arr) => patchImages((img) => ({ ...img, fittings: { ...(img.fittings || {}), [f.id]: arr } }))} />
          )}
        </div>
      ))}
    </div>
  );
}

const ALTER_STATUS = [
  { key: "not_started", label: "⭕ لم يبدأ" },
  { key: "in_progress", label: "🔵 جاري التنفيذ" },
  { key: "done", label: "🟢 تم" },
  { key: "needs_review", label: "🔴 يحتاج مراجعة" },
];

function AlterationsSection({ bride, onUpdate }) {
  const add = () => onUpdate((b) => ({
    ...b,
    alterations: [...b.alterations, { id: uid(), description: "", assignedTo: "", requestDate: todayStr(), status: "not_started" }],
  }));
  const setField = (aid, k, v) => onUpdate((b) => ({ ...b, alterations: b.alterations.map((a) => (a.id === aid ? { ...a, [k]: v } : a)) }));
  const remove = (aid) => onUpdate((b) => ({ ...b, alterations: b.alterations.filter((a) => a.id !== aid) }));

  return (
    <div className="bb-card">
      <div className="bb-card-head">
        <div className="bb-card-title">✏️ سجل التعديلات</div>
        <button className="bb-btn bb-btn-ghost bb-btn-sm" onClick={add}><Plus size={14} /> إضافة تعديل</button>
      </div>
      {bride.alterations.length === 0 && <div className="bb-empty">لا توجد تعديلات مسجلة.</div>}
      {bride.alterations.map((a) => (
        <div key={a.id} style={{ border: "1px solid #EFE4DD", borderRadius: 12, padding: 12, marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input style={{ flex: 1, border: "1px solid #E8DDD6", borderRadius: 10, padding: "8px 10px", fontFamily: "Tajawal" }}
              placeholder="وصف التعديل (مثال: تعديل الأكمام)" value={a.description} onChange={(e) => setField(a.id, "description", e.target.value)} />
            <button className="bb-icon-btn" onClick={() => remove(a.id)}><Trash2 size={14} /></button>
          </div>
          <div className="bb-grid3">
            <Field label="المسؤول"><input value={a.assignedTo} onChange={(e) => setField(a.id, "assignedTo", e.target.value)} /></Field>
            <Field label="تاريخ الطلب"><input type="date" value={a.requestDate} onChange={(e) => setField(a.id, "requestDate", e.target.value)} /></Field>
            <Field label="الحالة">
              <select value={a.status} onChange={(e) => setField(a.id, "status", e.target.value)}>
                {ALTER_STATUS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductionSection({ bride, onUpdate, images, patchImages }) {
  const setStage = (key) => onUpdate((b) => ({ ...b, productionStage: key }));
  const setField = (k, v) => onUpdate((b) => ({ ...b, production: { ...b.production, [k]: v } }));
  const stage = STAGE_OPTIONS.find((s) => s.key === bride.productionStage) || STAGE_OPTIONS[0];
  const stageImages = (images && images.production && images.production[bride.productionStage]) || [];

  return (
    <div className="bb-card">
      <SectionHead title="🧵 المعمل" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {STAGE_OPTIONS.map((s) => (
          <button key={s.key} onClick={() => setStage(s.key)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 12,
              border: bride.productionStage === s.key ? "1.5px solid var(--bb-wine)" : "1px solid #E8DDD6",
              background: bride.productionStage === s.key ? "#FBF0EA" : "#fff", cursor: "pointer", textAlign: "right",
              fontFamily: "Tajawal", fontSize: 14, fontWeight: bride.productionStage === s.key ? 700 : 500,
              color: bride.productionStage === s.key ? "var(--bb-wine-dark)" : "#2B2320",
            }}>
            <span style={{ fontSize: 17 }}>{s.icon}</span>{s.label}
          </button>
        ))}
      </div>
      <Field label="الموظفة / الخياطة المسؤولة"><input value={bride.production.assignedTo} onChange={(e) => setField("assignedTo", e.target.value)} /></Field>
      <Field label="ملاحظات المعمل"><textarea value={bride.production.notes} onChange={(e) => setField("notes", e.target.value)} /></Field>
      {images && (
        <ImageGallery title={`📷 صور — ${stage.label}`} images={stageImages}
          onChange={(arr) => patchImages((img) => ({ ...img, production: { ...(img.production || {}), [bride.productionStage]: arr } }))} />
      )}
    </div>
  );
}

function FinanceSection({ bride, onUpdate }) {
  const setF = (k, v) => onUpdate((b) => ({ ...b, finance: { ...b.finance, [k]: v } }));
  const isRental = (bride.dress.category || "").includes("إيجار");

  const fp = finalPrice(bride); const col = collected(bride); const rem = remaining(bride);
  const pct = fp > 0 ? Math.min(100, Math.round((col / fp) * 100)) : 0;

  return (
    <div className="bb-card">
      <SectionHead title="💰 المالية" />
      <Field label="الإجمالي"><input type="number" value={bride.finance.totalPrice} onChange={(e) => setF("totalPrice", e.target.value)} /></Field>
      <Field label="العربون"><input type="number" value={bride.finance.deposit} onChange={(e) => setF("deposit", e.target.value)} /></Field>
      {isRental && (
        <div style={{ background: "#FBF0DE", padding: 12, borderRadius: 12, marginBottom: 14 }}>
          <Field label="التأمين"><input type="number" value={bride.finance.securityDeposit} onChange={(e) => setF("securityDeposit", e.target.value)} /></Field>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <input type="checkbox" checked={bride.finance.securityDepositReturned} onChange={(e) => setF("securityDepositReturned", e.target.checked)} />
            تم إرجاع التأمين
          </label>
        </div>
      )}
      <div style={{ background: "#FDF7F4", borderRadius: 12, padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
          <span>المتبقي</span><strong style={{ color: rem > 0 ? "#B23B3B" : "#4F6B4A", fontSize: 18 }}>{money(rem)}</strong>
        </div>
        <div style={{ height: 8, background: "#EFE4DD", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "var(--bb-wine)" }} />
        </div>
        <div style={{ fontSize: 11.5, color: "#8A7A6E", marginTop: 4 }}>نسبة السداد {pct}%</div>
      </div>
    </div>
  );
}
