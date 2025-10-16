import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fnkkksacsvvbetcbcqan.supabase.co";
// Ici, la clé service_role, gardée privée, pas exposée au navigateur
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZua2trc2Fjc3Z2YmV0Y2JjcWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NzQzMTksImV4cCI6MjA3NjA1MDMxOX0.T68q25FUP7K7lUDNTMG35MVaH3TKUpKawfE7ZCn1BNI";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  // logique pour insérer dans clients_signatures
}
