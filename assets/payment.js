// assets/payment.js
import { supabase } from './supabase.js';

// Vérifie la session Supabase
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    alert('Veuillez vous connecter avant d’accéder au paiement.');
    window.location.href = 'login.html';
    return;
  }

  const user = session.user;
  const email = user?.email;

  const paypalBtn = document.getElementById('paypalBtn');

  paypalBtn.addEventListener('click', async () => {
    try {
      alert('🔒 Redirection vers PayPal...');

      // Simulation de redirection vers PayPal
      window.open(
        "https://www.paypal.com/webapps/hermes?token=5YS528552S022562S&useraction=commit#/checkout/login",
        "_blank"
      );

      // Une fois le paiement validé (simulé ici)
      setTimeout(async () => {
        // Mise à jour de l'état du compte
        const { error } = await supabase
          .from('restaurants')
          .update({ subscription_status: 'active', payment_date: new Date().toISOString() })
          .eq('contact_email', email);

        if (error) throw error;

        alert('✅ Paiement confirmé ! Votre espace est maintenant actif.');
        window.location.href = 'dashboard.html';
      }, 7000); // délai simulé de 7s

    } catch (err) {
      console.error('Erreur de paiement :', err);
      alert('❌ Une erreur est survenue lors de la mise à jour du paiement.');
    }
  });
});
