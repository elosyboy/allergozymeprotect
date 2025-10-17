import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fnkkksacsvvbetcbcqan.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZua2trc2Fjc3Z2YmV0Y2JjcWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NzQzMTksImV4cCI6MjA3NjA1MDMxOX0.T68q25FUP7K7lUDNTMG35MVaH3TKUpKawfE7ZCn1BNI";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * GET /api/getsignatures
 * Liste toutes les signatures d’un restaurant
 * Params : ?restaurant_id=xxx&from=2025-01-01&to=2025-01-31
 */
export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Méthode non autorisée" });
    }

    const { restaurant_id, from, to } = req.query;

    if (!restaurant_id) {
      return res.status(400).json({ error: "restaurant_id est requis" });
    }

    // Construction du filtre de dates
    let query = supabaseAdmin
      .from("clients_signatures")
      .select("*")
      .eq("restaurant_id", restaurant_id)
      .order("created_at", { ascending: false });

    if (from) query = query.gte("created_at", new Date(from).toISOString());
    if (to) query = query.lte("created_at", new Date(to).toISOString());

    const { data, error } = await query;

    if (error) {
      console.error("Erreur Supabase :", error);
      return res.status(500).json({ error: "Erreur de récupération", details: error.message });
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    console.error("Erreur serveur :", err);
    return res.status(500).json({ error: "Erreur serveur interne" });
  }
}
