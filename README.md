# sports_match_scheduling
# SportsHub – Sports Tournament and Match Scheduling (Frontend)
Plain HTML/CSS/JS. No build step, no CDN, works offline.

## Run
1. Open `index.html` in a browser (double-click), or run `python -m http.server 8000` here and visit http://localhost:8000.
2. Demo mode is on by default: data lives in memory and resets on refresh.

## Structure
index.html · css/style.css · js/config.js (MODE + BASE_URL) · js/mockData.js (demo data) · js/api.js (fetch layer + demo DB) · js/app.js (UI)

## Connect Flask + MySQL
1. Edit `js/config.js`: `MODE:'api'`, `BASE_URL:'http://127.0.0.1:5000/api'`.
2. In Flask: `pip install flask-cors`, then `CORS(app)`.
3. Implement these endpoints (JSON in/out). Errors: return `{"error":"message"}` with 400/409/500.
   - `GET/POST /api/{tournaments|teams|players|registrations|venues|matches}`
   - `PUT/DELETE /api/<entity>/<id>`
   - `GET /api/reports/fixtures|results|participation` (optional-style rows; see buildReport in api.js for the keys)
4. Row fields (use `id` as primary key alias):
   - tournaments: id, name, sport, start_date, end_date, status (Upcoming/Ongoing/Completed)
   - teams: id, name, coach, city
   - players: id, name, team_id, jersey, position
   - venues: id, name, city, capacity
   - registrations (Tournament_Team): id, tournament_id, team_id, reg_date
   - matches: id, tournament_id, home_id, away_id, venue_id, datetime ('YYYY-MM-DDTHH:MM'), status (Scheduled/Completed/Cancelled), home_score, away_score
   - Report endpoints return arrays of flat objects whose keys become column headers.

## Test checklist (demo mode)
- Dashboard: counts, upcoming, results, status chart, tournament overview.
- Any page: Add / 👁 View / ✏️ Edit / 🗑 Delete (confirm dialog), search, filters, pagination (8/page).
- Tournaments: end date before start date is rejected.
- Players: reuse a jersey number in the same team → error.
- Registrations: register the same team twice in a tournament → error.
- Venues: capacity 0 or negative → error.
- Matches: home = away rejected; team dropdowns list only the tournament's registered teams; scores appear only for "Completed" and must be ≥ 0; calendar view toggle; filter by date.
- Reports: switch report, search, click headers to sort, Export CSV, Print.

