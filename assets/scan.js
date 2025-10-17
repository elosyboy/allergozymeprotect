// --- scan.js ---
// Fonctionne en réel avec Supabase et la base "clients_signatures".
// Table attendue :
// id | restaurant_id | first_name | last_name | birthdate | phone | accepted | created_at | device | ip_address

import { supabase } from './supabase.js';

// Sélecteurs
const el = id => document.getElementById(id);
const restaurantNameEl = el('restaurantName');
const restaurantAddrEl = el('restaurantAddr');
const todayEl = el('today');
const openCharte = el('openCharte');
const charteBox = el('charteBox');
const confirmRead = el('confirmRead');
const submitBtn = el('submitBtn');
const form = el('signatureForm');
const confirmation = el('confirmation');

// Affiche la date actuelle
todayEl.textContent = new Date().toLocaleString('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

// Récupère l'ID du restaurant depuis l’URL
const params = new URLSearchParams(window.location.search);
const restaurantId = params.get('id') || params.get('restaurant') || params.get('r');

// Vérifie la présence d’un ID
if (!restaurantId) {
  restaurantNameEl.textContent = 'Établissement non identifié';
  restaurantAddrEl.textContent = 'Aucun identifiant dans l’URL';
} else {
  loadRestaurant(restaurantId);
}

// --- Chargement du restaurant ---
async function loadRestaurant(id) {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, address, contact_email')
      .eq('id', id)
      .single();

    if (error || !data) {
      restaurantNameEl.textContent = 'Établissement introuvable';
      restaurantAddrEl.textContent = '';
      console.warn('Erreur de chargement Supabase :', error);
    } else {
      restaurantNameEl.textContent = data.name;
      restaurantAddrEl.textContent = data.address || data.contact_email || 'Adresse non spécifiée';
    }
  } catch (e) {
    console.error('Erreur de connexion à Supabase :', e);
    restaurantNameEl.textContent = 'Erreur de connexion';
  }
}

// --- Charte déroulante ---
let charteOpened = false;
openCharte.addEventListener('click', () => {
  charteOpened = !charteOpened;
  charteBox.classList.toggle('open', charteOpened);
  if (charteOpened) {
    // Vérifie si le texte est visible intégralement
    checkScrollToEnable();
  } else {
    confirmRead.checked = false;
    confirmRead.disabled = true;
    submitBtn.disabled = true;
  }
});

// Détecte si l’utilisateur a tout lu
function checkScrollToEnable() {
  const box = charteBox;
  const onScroll = () => {
    if (box.scrollTop + box.clientHeight >= box.scrollHeight - 5) {
      confirmRead.disabled = false;
      box.removeEventListener('scroll', onScroll);
    }
  };
  if (box.scrollHeight <= box.clientHeight + 10) {
    confirmRead.disabled = false;
  } else {
    box.addEventListener('scroll', onScroll);
  }
}

// Active le bouton "Valider" quand la charte est cochée
confirmRead.addEventListener('change', () => {
  submitBtn.disabled = !confirmRead.checked;
});

// --- Soumission du formulaire ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!restaurantId) {
    alert('ID du restaurant manquant. Contactez le personnel.');
    return;
  }

  const first_name = el('firstName').value.trim();
  const last_name = el('lastName').value.trim();
  const birthdate = el('birthDate').value;
  const phone = el('phoneOpt').value.trim();
  const accepted = confirmRead.checked;

  if (!first_name || !last_name || !birthdate || !accepted) {
    alert('Veuillez remplir tous les champs et lire la charte.');
    return;
  }

  const created_at = new Date().toISOString();
  const device = navigator.userAgent || null;

  try {
    const { error } = await supabase.from('clients_signatures').insert([
      {
        restaurant_id: restaurantId,
        first_name,
        last_name,
        birthdate,
        phone,
        accepted: true,
        device,
        ip_address: null,
        created_at
      }
    ]);

    if (error) {
      console.error('Erreur Supabase :', error);
      alert('Erreur lors de l’enregistrement. Veuillez réessayer.');
      return;
    }

    // Succès
    form.style.display = 'none';
    confirmation.style.display = 'block';

  } catch (err) {
    console.error(err);
    alert('Erreur de connexion. Réessayez plus tard.');
  }
});
