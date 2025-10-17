// assets/login.js
import { supabase } from './supabase.js';

const form = document.getElementById('loginForm');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      alert("Veuillez entrer votre email et votre mot de passe.");
      return;
    }

    try {
      // Étape 1 — Connexion utilisateur
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (authError) throw authError;

      // Étape 2 — Vérifie si le compte est actif
      const { data: restaurant, error: fetchError } = await supabase
        .from('restaurants')
        .select('subscription_status')
        .eq('contact_email', email)
        .single();

      if (fetchError) throw fetchError;

      if (!restaurant || restaurant.subscription_status !== 'active') {
        alert("⚠️ Votre abonnement n’est pas encore actif. Veuillez effectuer le paiement pour activer votre compte.");
        window.location.href = 'payment.html';
        return;
      }

      // Étape 3 — Connexion validée
      alert("✅ Connexion réussie ! Redirection vers votre tableau de bord...");
      window.location.href = 'dashboard.html';
    } catch (err) {
      console.error("Erreur lors de la connexion :", err);
      alert("❌ Erreur : " + err.message);
    }
  });
} else {
  console.error("⚠️ Formulaire de connexion introuvable.");
}
