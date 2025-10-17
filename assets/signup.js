// assets/signup.js
import { supabase } from './supabase.js';

// Récupération du formulaire
const form = document.getElementById('signupForm');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const owner = document.getElementById('owner').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!name || !owner || !email || !password || !phone) {
      alert("Veuillez remplir tous les champs requis.");
      return;
    }

    try {
      // Étape 1 : création de l’utilisateur
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });
      if (signUpError) throw signUpError;

      // Étape 2 : enregistrement du restaurant
      const { error: insertError } = await supabase.from('restaurants').insert([
        {
          name,
          owner,
          contact_email: email,
          phone,
          subscription_status: 'pending_payment',
          created_at: new Date().toISOString()
        }
      ]);
      if (insertError) throw insertError;

      // Étape 3 : redirection PayPal
      alert("✅ Inscription réussie ! Redirection vers le paiement...");
      window.location.href = "https://www.paypal.com/webapps/hermes?token=5YS528552S022562S&useraction=commit#/checkout/login";
    } catch (err) {
      console.error("Erreur lors de l'inscription :", err);
      alert("❌ Erreur : " + err.message);
    }
  });
} else {
  console.error("⚠️ Formulaire d'inscription introuvable sur la page.");
}
