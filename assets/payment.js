import { supabase } from './supabase.js';

// Ton lien PayPal réel
const PAYPAL_URL = "https://www.paypal.com/webapps/hermes?token=14F09929DU2452001&useraction=commit";

// Sélection du bouton
const paypalBtn = document.getElementById("paypalBtn");

paypalBtn.addEventListener("click", async () => {
  try {
    // Vérifie si l'utilisateur est connecté
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error(error);
      alert("Erreur lors de la vérification de session.");
      return;
    }

    if (!session) {
      alert("Veuillez vous connecter avant d’accéder au paiement.");
      window.location.href = "login.html";
      return;
    }

    // Récupère l'utilisateur actuel
    const user = session.user;

    // Met à jour le profil dans la table "restaurants"
    const { error: updateError } = await supabase
      .from("restaurants")
      .update({
        has_paid: true,
        paid_until: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
      })
      .eq("contact_email", user.email);

    if (updateError) {
      console.error(updateError);
      alert("Erreur lors de l'activation du compte dans la base de données.");
      return;
    }

    // Redirection réelle vers PayPal
    window.location.href = PAYPAL_URL;
  } catch (err) {
    console.error(err);
    alert("Erreur inattendue : " + err.message);
  }
});
