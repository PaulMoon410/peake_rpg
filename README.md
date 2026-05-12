# peake_rpg

Frontend lives in `The Peake/`.

Standalone Node.js backend lives in `peake_api/` and is designed to run separately, using HTTPS in production (Render) while staying isolated from the frontend at `http://geocities.ws/peakecoin/games/peake_rpg`.

Cloud saves are per-account and are designed to sync to FTP under:
- `/games/peake_rpg/saves/accounts/<username>/account.json`
- `/games/peake_rpg/saves/characters/<username>/character.json`
- `/games/peake_rpg/saves/game_state/<username>/game_state.json`

Live MMO-style play now uses the Render backend for shared player presence, live room updates, and world chat.