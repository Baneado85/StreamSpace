import { createClient } from '@supabase/supabase-js';

const url = "https://xxnhaubnssjjoglohdtc.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bmhhdWJuc3Nqam9nbG9oZHRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTU5MjkwNiwiZXhwIjoyMTA1MTY4OTA2fQ.K1NbVFfEfwrB4oTzUZUOas2mf3s5p0o1Ko0lE3n6yUg";

const supabase = createClient(url, key);

async function run() {
  // Simulate the student's JWT using service role
  const { data, error } = await supabase.rpc('simulate_student_query', {
    student_id: '2cefe5e9-041b-4c1a-a671-d0cd49d7b518'
  });
  
  if (error) {
    console.error("RPC failed, doing direct SQL", error.message);
  }
}

run();
