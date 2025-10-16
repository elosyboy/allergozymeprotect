// assets/supabase.js

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://fnkkksacsvvbetcbcqan.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZua2trc2Fjc3Z2YmV0Y2JjcWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NzQzMTksImV4cCI6MjA3NjA1MDMxOX0.T68q25FUP7K7lUDNTMG35MVaH3TKUpKawfE7ZCn1BNI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
