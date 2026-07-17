import { createClient } from
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://SU-PROYECTO.supabase.co";
const supabaseKey = "SU_CLAVE_PUBLICA";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);