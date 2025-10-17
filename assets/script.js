/*!
 * script.js — AllergoZymeProtect (© 2025)
 * Gestion globale : navigation, session, effets et interface utilisateur
 */

import { supabase } from "./supabase.js";

/* === 1. UTILITAIRES GLOBAUX === */

// Raccourci DOM
const $ = (id) => document.getElementById(id);

// Redirection si non connecté
export async function requireAuth() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    alert("Veuillez vous connecter pour accéder à cette page.");
    window.location.href = "login.html";
  }
  return data.session.user;
}

// Déconnexion
export async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem("supabaseSession");
  window.location.href = "login.html";
}

// Affiche le logo animé sur toutes les pages
export function floatLogo() {
  const logo = document.querySelector(".logo");
  if (!logo) return;
  logo.style.transition = "transform 1s ease-in-out";
  setInterval(() => {
    logo.style.transform = "translateY(-6px)";
    setTimeout(() => (logo.style.transform = "translateY(0)"), 500);
  }, 3000);
}

/* === 2. SESSION UTILISATEUR === */

// Sauvegarde automatique de session Supabase dans localStorage
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session) {
    localStorage.setItem("supabaseSession", JSON.stringify(session));
  } else {
    localStorage.removeItem("supabaseSession");
  }
});

/* === 3. ANIMATIONS D’APPARITION === */
export function fadeInElements() {
  const els = document.querySelectorAll(".fade-in");
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.1 }
  );
  els.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(15px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    obs.observe(el);
  });
}

/* === 4. DATE AUTOMATIQUE DANS LES PAGES === */
export function autoDate() {
  const el = document.querySelector(".today-date");
  if (el) el.textContent = new Date().toLocaleDateString("fr-FR");
}

/* === 5. NAVIGATION GLOBALE === */
export function setupNav() {
  const logoutBtn = document.querySelector("#logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
}

/* === 6. MESSAGE DE BIENVENUE DYNAMIQUE === */
export async function displayWelcome() {
  try {
    const session = JSON.parse(localStorage.getItem("supabaseSession"));
    if (!session) return;
    const user = session.user;
    const nameEl = document.querySelector("#userName");
    if (nameEl) {
      nameEl.textContent = user.email.split("@")[0];
    }
  } catch (e) {
    console.warn("Erreur chargement utilisateur :", e);
  }
}

/* === 7. UTILITÉS QR CODE === */
export function generateQr(elId, text, size = 220) {
  if (!window.QRCode) {
    console.error("QRCode library missing");
    return;
  }
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = "";
  new QRCode(el, {
    text,
    width: size,
    height: size,
    colorDark: "#000000",
    colorLight: "#ffffff",
  });
}

/* === 8. NOTIFICATION TOAST === */
export function toast(message, duration = 3000) {
  const t = document.createElement("div");
  t.textContent = message;
  Object.assign(t.style, {
    position: "fixed",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "linear-gradient(90deg,#c9a227,#b68f1e)",
    color: "#fff",
    padding: "12px 22px",
    borderRadius: "8px",
    fontWeight: "600",
    boxShadow: "0 6px 20px rgba(182,143,30,0.3)",
    zIndex: "9999",
    opacity: "0",
    transition: "opacity .4s",
  });
  document.body.appendChild(t);
  setTimeout(() => (t.style.opacity = "1"), 10);
  setTimeout(() => {
    t.style.opacity = "0";
    setTimeout(() => t.remove(), 400);
  }, duration);
}

/* === 9. INITIALISATION AUTO === */
document.addEventListener("DOMContentLoaded", () => {
  floatLogo();
  fadeInElements();
  autoDate();
  setupNav();
});
