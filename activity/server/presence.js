import { Client, GatewayIntentBits, ActivityType } from 'discord.js';

// Eine Gateway-Verbindung hält den Bot in Discord als "Online".
export function startPresence(token) {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.once('ready', (c) => {
    c.user.setPresence({
      status: 'online',
      activities: [{ name: 'Sokoban', type: ActivityType.Playing }],
    });
    console.log(`[INFO] Bot online als ${c.user.tag}`);
  });
  client.login(token).catch((err) => console.error('[ERROR] Bot-Login fehlgeschlagen:', err.message));
  return client;
}
