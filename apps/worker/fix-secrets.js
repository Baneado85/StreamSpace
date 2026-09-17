const { execSync } = require('child_process');
const secrets = {
  SUPABASE_URL: "https://xxnhaubnssjjoglohdtc.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_6gWiaUWmG_SDehcAy9ROyw_qCuUFA_V",
  VDOCIPHER_API_SECRET: "Tbx9p4LkSZSQsKWX81pbQXe9OwTQntQWOwkICyqB9ntz28KRS18lDPrF3UmcZATu",
  SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bmhhdWJuc3Nqam9nbG9oZHRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTU5MjkwNiwiZXhwIjoyMTA1MTY4OTA2fQ.K1NbVFfEfwrB4oTzUZUOas2mf3s5p0o1Ko0lE3n6yUg",
  ALLOWED_ORIGIN: "https://stream-space-web-azure.vercel.app"
};

for (const [k, v] of Object.entries(secrets)) {
  console.log(`Setting ${k}...`);
  execSync(`npx wrangler secret put ${k}`, { 
    input: v, 
    stdio: ['pipe', 'inherit', 'inherit'] 
  });
}
console.log("All secrets updated!");
