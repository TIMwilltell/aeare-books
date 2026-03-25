---
phase: quick
plan: "01"
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: true
requirements: []
user_setup: []

must_haves:
  truths:
    - "HTTPS dev server runs on local network"
    - "Phone can access app via local IP with HTTPS"
  artifacts:
    - path: "./ssl/localhost.crt"
      provides: "SSL certificate for HTTPS"
    - path: "./ssl/localhost.key"
      provides: "SSL private key"
  key_links:
    - from: "https://[LOCAL_IP]:5173"
      to: "SvelteKit dev server"
      via: "Vite HTTPS config"
---

<objective>
Deploy SvelteKit app with HTTPS on local machine for staging/test on phone via OrbStack
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
This is a SvelteKit PWA project using vite-plugin-pwa. Need to:
- Enable HTTPS in Vite dev server
- Generate self-signed SSL certificate
- Make accessible on local network for phone testing
</context>

<tasks>

<task type="auto">
  <name>Task 1: Generate self-signed SSL certificate</name>
  <files>./ssl/localhost.crt, ./ssl/localhost.key</files>
  <action>
Generate a self-signed SSL certificate using openssl for localhost:
```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/localhost.key -out ssl/localhost.crt -days 365 -nodes -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
```
  </action>
  <verify>ls -la ssl/localhost.crt ssl/localhost.key</verify>
  <done>SSL certificate and key files exist in ./ssl/ directory</done>
</task>

<task type="auto">
  <name>Task 2: Configure Vite for HTTPS</name>
  <files>vite.config.ts</files>
  <action>
Add HTTPS configuration to vite.config.ts. Read current config first, then add:
- server.https with key and cert paths
- server.host to bind to all interfaces (0.0.0.0)
- Configure for local network access
  </action>
  <verify>grep -q "https:" vite.config.ts</verify>
  <done>Vite configured to serve with HTTPS on local network</done>
</task>

<task type="auto">
  <name>Task 3: Start dev server and verify</name>
  <files>package.json</files>
  <action>
Start Vite dev server with HTTPS:
```bash
npm run dev -- --host
```
Server should listen on https://0.0.0.0:5173 with HTTPS enabled.
  </action>
  <verify>curl -k https://localhost:5173 returns HTML</verify>
  <done>HTTPS dev server running on port 5173</done>
</task>

<task type="auto">
  <name>Task 4: Get local IP and setup port access</name>
  <files></files>
  <action>
Get local IP address:
```bash
ipconfig getifaddr en0
```
This will show the local IP (e.g., 192.168.x.x) to access from phone.
  </action>
  <verify>Local IP address displayed</verify>
  <done>Local network IP identified for phone access</done>
</task>

</tasks>

<verification>
- HTTPS server accessible at https://localhost:5173
- Server accessible at https://[LOCAL_IP]:5173 from other devices on network
- Phone can access via HTTPS (may need to trust self-signed cert)
</verification>

<success_criteria>
HTTPS dev server running on local network, accessible from phone at https://[LOCAL_IP]:5173
</success_criteria>

<output>
After completion, create `.planning/quick/260324-rgw-deploy-this-for-staging-using-orbstack-o/260324-rgw-SUMMARY.md`
</output>
