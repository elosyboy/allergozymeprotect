// assets/dashboard.js
import { supabase } from './supabase.js';

// --- CONFIG ---
const BASE_DOMAIN = 'https://allergozymeprotect.fr'; // Adapter si besoin
const PAYPAL_LINK = 'https://www.paypal.com/webapps/hermes?token=5YS528552S022562S&useraction=commit#/checkout/login';

// --- REFS ---
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const copyDashboardLink = document.getElementById('copyDashboardLink');

const subPill = document.getElementById('subPill');
const subText = document.getElementById('subText');
const paywall = document.getElementById('paywall');
const payNow = document.getElementById('payNow');

const generalQR = document.getElementById('generalQR');
const showGeneralBtn = document.getElementById('showGeneralBtn');
const copyGeneralBtn = document.getElementById('copyGeneralBtn');

const tableInput = document.getElementById('tableInput');
const addTableBtn = document.getElementById('addTableBtn');
const tableGrid = document.getElementById('tableGrid');
const mapFrame = document.getElementById('mapFrame');
const toasts = document.getElementById('toasts');

// --- STATE ---
let user = null, restaurant = null, tables = [];

// --- UTILS ---
const sleep = ms => new Promise(r => setTimeout(r, ms));

function toast(msg, ok = true) {
  const el = document.createElement('div');
  el.className = 'toast ' + (ok ? 'ok' : 'bad');
  el.textContent = msg;
  toasts.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"'`=\/]/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
    "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
  }[ch]));
}

function todayBounds() {
  const d = new Date();
  const Y = d.getFullYear(), M = String(d.getMonth() + 1).padStart(2, '0'), D = String(d.getDate()).padStart(2, '0');
  return [`${Y}-${M}-${D}T00:00:00Z`, `${Y}-${M}-${D}T23:59:59Z`];
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Lien copié ✅');
  } catch {
    toast('Impossible de copier', false);
  }
}

// --- INIT PRINCIPALE ---
async function init() {
  try {
    const auth = await supabase.auth.getUser();
    if (!auth.data.user) {
      window.location.href = 'login.html';
      return;
    }
    user = auth.data.user;

    // Récupération du restaurant
    const { data: resto, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('contact_email', user.email)
      .single();

    if (error || !resto) {
      toast('Restaurant introuvable', false);
      return;
    }

    restaurant = resto;
    setPayStatus(restaurant.subscription_status);

    // Carte
    if (restaurant.latitude && restaurant.longitude) {
      mapFrame.src = `https://www.allergozymelabel.com/map?lat=${restaurant.latitude}&lng=${restaurant.longitude}&zoom=15`;
    } else {
      mapFrame.src = `https://www.allergozymelabel.com/map`;
    }

    // QR général
    renderGeneralQR();

    // Tables
    await loadTables(true);

  } catch (e) {
    console.error(e);
    toast('Erreur de chargement du tableau', false);
  }
}

// --- STATUT ---
function setPayStatus(status) {
  subPill.classList.remove('ok', 'bad', 'wait');
  if (status === 'active') {
    subPill.classList.add('ok');
    subText.textContent = 'Abonnement actif';
    paywall.style.display = 'none';
  } else if (status === 'pending_payment') {
    subPill.classList.add('wait');
    subText.textContent = 'Paiement en attente';
    paywall.style.display = 'flex';
  } else {
    subPill.classList.add('bad');
    subText.textContent = 'Abonnement inactif';
    paywall.style.display = 'flex';
  }
}

// --- QR GÉNÉRAL ---
function renderGeneralQR() {
  const url = `${BASE_DOMAIN}/scan/${restaurant.id}`;
  const img = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`;
  generalQR.innerHTML = `
    <div class="qr-item" aria-label="QR général">
      <div style="font-weight:800;color:var(--gold-strong)">QR Général</div>
      <img src="${img}" width="220" height="220" alt="QR Général" />
      <div class="qr-actions">
        <a class="nav-btn" href="${img}" download="${escapeHtml(restaurant.name)}_QR_general.png">Télécharger</a>
        <button class="nav-btn" onclick="window.open('${img}','_blank')">Imprimer</button>
      </div>
      <div class="tiny muted" style="margin-top:6px">${url}</div>
    </div>`;
  copyGeneralBtn.onclick = () => copy(url);
}

// --- TABLES ---
async function loadTables(withSkeleton = false) {
  try {
    if (withSkeleton) {
      tableGrid.innerHTML = `
        <div class="skeleton s-qr" aria-hidden="true"></div>
        <div class="skeleton s-qr" aria-hidden="true"></div>
        <div class="skeleton s-qr" aria-hidden="true"></div>`;
    }

    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('table_number', { ascending: true });

    if (error) throw error;
    tables = data || [];
    await renderTables();
  } catch (e) {
    console.error(e);
    toast('Erreur de chargement des tables', false);
  }
}

async function renderTables() {
  tableGrid.innerHTML = '';
  if (!tables.length) {
    tableGrid.innerHTML = `<div class="muted tiny">Aucune table — ajoutez-en une ci-dessus.</div>`;
    return;
  }

  const [from, to] = todayBounds();
  for (const t of tables) {
    const { count } = await supabase
      .from('clients_signatures')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id)
      .eq('table_id', t.id)
      .gte('created_at', from)
      .lte('created_at', to);

    const hasVal = (count || 0) > 0;
    const url = `${BASE_DOMAIN}/scan/${restaurant.id}?table=${t.id}`;
    const img = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;

    const el = document.createElement('div');
    el.className = 'qr-item';
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <div style="font-weight:700;">Table ${escapeHtml(t.table_number)}</div>
        <div class="state ${hasVal ? 'yes' : 'no'} tiny">
          <span class="dot"></span><span>${hasVal ? 'Validations aujourd’hui' : 'Aucune validation'}</span>
        </div>
      </div>
      <img src="${img}" width="200" height="200" alt="QR Table ${escapeHtml(t.table_number)}" />
      <div class="qr-actions">
        <a class="nav-btn" href="${img}" download="Table_${escapeHtml(t.table_number)}_QR.png">Télécharger</a>
        <button class="nav-btn" onclick="window.open('${img}','_blank')">Imprimer</button>
        <button class="nav-btn" data-copy="${url}">Copier l’URL</button>
      </div>
      <div class="row" style="justify-content:center;margin-top:6px">
        <button class="btn tiny" data-rename="${t.id}">Renommer</button>
        <button class="btn danger tiny" data-del="${t.id}">Supprimer</button>
      </div>`;

    tableGrid.appendChild(el);
  }

  // Attache les événements dynamiques
  tableGrid.querySelectorAll('button[data-copy]').forEach(b =>
    b.addEventListener('click', () => copy(b.getAttribute('data-copy')))
  );
  tableGrid.querySelectorAll('button[data-rename]').forEach(b =>
    b.addEventListener('click', () => renameTable(b.getAttribute('data-rename')))
  );
  tableGrid.querySelectorAll('button[data-del]').forEach(b =>
    b.addEventListener('click', () => deleteTable(b.getAttribute('data-del')))
  );
}

// --- GESTION TABLES ---
async function renameTable(tableId) {
  const t = tables.find(x => x.id === tableId);
  if (!t) return;
  const val = prompt('Nouveau nom / numéro de table :', t.table_number);
  if (!val || !val.trim()) return;

  const { error } = await supabase
    .from('tables')
    .update({ table_number: val.trim() })
    .eq('id', tableId);

  if (error) {
    toast('Erreur lors du renommage', false);
    return;
  }

  toast('Table renommée ✅');
  await loadTables();
}

async function deleteTable(tableId) {
  if (!confirm('Supprimer définitivement cette table ?')) return;
  const { error } = await supabase.from('tables').delete().eq('id', tableId);
  if (error) {
    toast('Suppression impossible', false);
    return;
  }
  toast('Table supprimée ✅');
  await loadTables();
}

// --- EVENTS GLOBAUX ---
addTableBtn.addEventListener('click', async () => {
  const val = tableInput.value.trim();
  if (!val) {
    tableInput.focus();
    return;
  }
  try {
    const { error } = await supabase
      .from('tables')
      .insert([{ restaurant_id: restaurant.id, table_number: val }]);
    if (error) throw error;
    tableInput.value = '';
    toast('Table ajoutée ✅');
    await loadTables();
  } catch (e) {
    console.error(e);
    toast('Erreur ajout table', false);
  }
});

refreshBtn.addEventListener('click', async () => {
  await loadTables(true);
  toast('Rafraîchi ✅');
});

copyDashboardLink.addEventListener('click', () => copy(window.location.href));
payNow.addEventListener('click', () => (window.location.href = 'payment.html'));

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});

// --- RACCOURCIS CLAVIER ---
document.addEventListener('keydown', e => {
  if (e.key === 'r' || e.key === 'R') {
    e.preventDefault();
    refreshBtn.click();
  }
  if (e.key === 'n' || e.key === 'N') {
    e.preventDefault();
    addTableBtn.click();
  }
  if (e.key === 'l' || e.key === 'L') {
    e.preventDefault();
    logoutBtn.click();
  }
});

// --- LANCEMENT ---
init();
