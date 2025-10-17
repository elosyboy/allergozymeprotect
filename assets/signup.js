import { supabase } from './supabase.js';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('signup-form');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      // Étape 1 — Création du compte utilisateur
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) {
        alert("Erreur lors de l'inscription : " + signupError.message);
        return;
      }

      // Étape 2 — Connexion immédiate après inscription
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        alert("Erreur de connexion après inscription : " + signInError.message);
        return;
      }

      // Étape 3 — Sauvegarde du profil en base de données (restaurants)
      const user = signInData.user;

      // Création du profil dans la table "restaurants"
      const { error: insertError } = await supabase
        .from('restaurants')
        .insert([
          {
            contact_email: user.email,
            has_paid: false,
            paid_until: null,
            created_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        console.error(insertError);
      }

      // Étape 4 — Redirection vers la page de paiement
      alert("Inscription réussie ✅\nVous allez être redirigé vers la page de paiement.");
      window.location.href = "payment.html";
    } catch (err) {
      console.error("Erreur :", err);
      alert("Erreur inattendue : " + err.message);
    }
  });
});
