# Sokobot

Sokobot ist ein [Sokoban](https://en.wikipedia.org/wiki/Sokoban)-Spiel als **Discord Activity**: Es läuft direkt in einem Sprach­kanal (oder DM) statt im Chat.

Die Level werden zufällig generiert und werden mit jedem Level größer und schwerer. Kisten, die auf einem ❎ landen, werden zur festen Wand.

## Steuerung
- Pfeiltasten oder `WASD` zum Laufen, oder die Buttons auf dem Bildschirm (auch mobil)
- `R` setzt das Level zurück, `N` erzeugt eine neue Karte
- `Enter` / `Leertaste` geht nach einem Sieg zum nächsten Level

## Einrichtung
1. Im [Developer Portal](https://discord.com/developers/applications) eine Application anlegen und unter **Activities → Settings** *Enable Activities* aktivieren.
2. Unter **OAuth2** die Client-ID und das Client-Secret kopieren.
3. `activity/.env.example` nach `activity/.env` kopieren und beide Werte eintragen.
4. Lokal starten:
   ```bash
   cd activity
   npm install
   npm run dev
   ```
5. Den Dev-Server per Tunnel (z. B. `cloudflared tunnel --url http://localhost:5173`) öffentlich machen und die Tunnel-URL im Developer Portal unter **Activities → URL Mappings** als Root Mapping (`/`) eintragen.
6. In Discord in einem Sprachkanal auf das Raketen-Symbol (Aktivitäten) klicken und Sokobot starten.

Ohne Discord lässt sich das Spiel auch direkt unter `http://localhost:5173` testen.

## Produktion (Docker)
Bei jedem Push auf `main` baut GitHub Actions das Image und veröffentlicht es als `ghcr.io/t0biii/sokobot` (GitHub Packages). `.env.example` nach `.env` kopieren, ausfüllen und starten:
```bash
docker compose up -d
```
Der Container lauscht auf Port 3001, der in `compose.yml` standardmäßig nicht veröffentlicht ist (Zeilen `ports` einkommentieren, falls nötig). Normalerweise erreichst du ihn über den Cloudflare Tunnel (siehe unten); die öffentliche URL kommt als URL Mapping ins Developer Portal.

Das Paket ist nach dem ersten Build privat. Entweder unter *Packages → Package settings* auf öffentlich stellen oder vorher `docker login ghcr.io` mit einem Personal Access Token (`read:packages`) ausführen.

**Cloudflare Tunnel** startet automatisch mit (`compose.yml`). Dafür den Token aus Zero Trust → Networks → Tunnels als `TUNNEL_TOKEN` in `.env` eintragen und im Tunnel den Public Hostname auf `http://sokobot:3001` zeigen lassen.

**Lokal bauen statt Image ziehen:**
```bash
docker compose -f compose.yml -f compose.build.yml up -d --build
```
## Tests
```bash
cd activity && npm test
```

## Contributing
Pull Requests sind willkommen. Bei größeren Änderungen bitte zuerst ein Issue öffnen.
