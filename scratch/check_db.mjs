import { createClient } from '@supabase/supabase-js';

const url = "https://xxnhaubnssjjoglohdtc.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bmhhdWJuc3Nqam9nbG9oZHRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTU5MjkwNiwiZXhwIjoyMTA1MTY4OTA2fQ.K1NbVFfEfwrB4oTzUZUOas2mf3s5p0o1Ko0lE3n6yUg";

const supabase = createClient(url, key);

async function run() {
  const { data: tutorials } = await supabase.from('tutorials').select('*');
  console.log("Tutorials:", tutorials);

  const { data: assignments } = await supabase.from('tutorial_assignments').select('*');
  console.log("Assignments:", assignments);
}

run();
