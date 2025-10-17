import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fnkkksacsvvbetcbcqan.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZua2trc2Fjc3Z2YmV0Y2JjcWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NzQzMTksImV4cCI6MjA3NjA1MDMxOX0.T68q25FUP7K7lUDNTMG35MVaH3TKUpKawfE7ZCn1BNI";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  try {
    // Autoriser uniquement les requêtes POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Méthode non autorisée" });
    }

    const { restaurant_id, first_name, last_name, birthdate, phone, device } =
      req.body;

    if (!restaurant_id || !first_name || !last_name || !birthdate) {
      return res.status(400).json({
        error: "Champs manquants : restaurant_id, first_name, last_name, birthdate requis.",
      });
    }

    // Création de l'objet à insérer
    const signature = {
      restaurant_id,
      first_name,
      last_name,
      birthdate,
      phone: phone || null,
      device: device || null,
      accepted: true,
      ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      created_at: new Date().toISOString(),
    };

    // Insertion dans la table clients_signatures
    const { data, error } = await supabaseAdmin
      .from("clients_signatures")
      .insert([signature])
      .select("*");

    if (error) {
      console.error("Erreur Supabase :", error);
      return res.status(500).json({ error: "Erreur lors de l’insertion", details: error.message });
    }

    return res.status(200).json({
      success: true,
      message: "Signature enregistrée avec succès",
      data,
    });
  } catch (err) {
    console.error("Erreur serveur :", err);
    return res.status(500).json({ error: "Erreur serveur interne" });
  }
}
