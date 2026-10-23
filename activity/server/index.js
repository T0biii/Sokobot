import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startPresence } from './presence.js';

const { DISCORD_CLIENT_ID: clientId, DISCORD_CLIENT_SECRET: clientSecret, DISCORD_BOT_TOKEN: botToken, PORT = 3001 } = process.env;
if (!clientId || !clientSecret) {
  console.error('[ERROR] DISCORD_CLIENT_ID und DISCORD_CLIENT_SECRET müssen gesetzt sein (siehe .env.example).');
  process.exit(1);
}

const app = express();
app.use(express.json());

// Die Client-ID wird zur Laufzeit geliefert, damit dasselbe Image überall läuft.
app.get('/api/config', (req, res) => res.json({ clientId }));

// Tauscht den OAuth2-Code der Activity gegen ein Access-Token.
app.post('/api/token', async (req, res) => {
  const { code } = req.body ?? {};
  if (typeof code !== 'string' || !code) return res.status(400).json({ error: 'code fehlt' });

  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
    }),
  });
  if (!response.ok) return res.status(502).json({ error: 'Token-Austausch fehlgeschlagen' });
  const { access_token } = await response.json();
  res.json({ access_token });
});

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
app.use(express.static(dist));

app.listen(PORT, () => console.log(`[INFO] Sokobot Activity läuft auf Port ${PORT}`));

if (botToken) startPresence(botToken);
else console.warn('[WARN] DISCORD_BOT_TOKEN fehlt, der Bot wird nicht als online angezeigt.');
