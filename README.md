# FreshBasket — Fruit Shop REST API

A responsive HTML/CSS/JavaScript fruit shop with a Node.js CRUD REST API deployed as Vercel Functions and a hosted MySQL-compatible database (TiDB Cloud recommended).

## API

- `GET /api/fruits` — list fruits
- `GET /api/fruits?search=app` — search by name
- `GET /api/fruits/:id` — get one fruit
- `POST /api/fruits` — create
- `PUT /api/fruits/:id` — replace/update fruit fields
- `DELETE /api/fruits/:id` — delete

Request JSON for POST/PUT:
```json
{
  "name": "Dragon fruit",
  "price": 140,
  "quantity": 12,
  "image": null
}
```

## 1. Create the hosted database

1. Create a TiDB Cloud Starter cluster: https://tidbcloud.com/
2. Create a database (for example `fruit_shop`).
3. Connect using the SQL editor or your provider's SQL client.
4. Run `database.sql` against that database.
5. Create database credentials and allow the Vercel app to connect. Use the provider's recommended secure network/TLS settings.

TiDB is MySQL-compatible. If using another MySQL provider, check its TLS and network access instructions.

## 2. Deploy to Vercel

1. Put this folder in a Git repository and push it to GitHub.
2. Import the repository at https://vercel.com/new.
3. In Vercel → Project → Settings → Environment Variables, add these variables for Production (and Preview if needed):
   - `DB_HOST` — database hostname only
   - `DB_PORT` — provider port, commonly `4000` for TiDB
   - `DB_USER` — database username
   - `DB_PASSWORD` — database password
   - `DB_NAME` — database name, such as `fruit_shop`
4. Redeploy after adding variables.
5. Open your deployed URL. The page will call the same-origin `/api/fruits` endpoint.

Never commit credentials to Git or put database secrets in `script.js`.

## 3. Test

Open `https://YOUR-PROJECT.vercel.app/api/fruits`. You should get JSON. Then use Postman for POST, PUT and DELETE. POST/PUT require `Content-Type: application/json`.

Example POST body:
```json
{
  "name": "Dragon fruit",
  "price": 140,
  "quantity": 12,
  "image": null
}
```

## Notes

- `api/fruits/index.js` and `api/fruits/[id].js` are Vercel Node.js functions; shared helper modules live in the root `lib/` directory.
- The frontend is static and calls same-origin API paths, so CORS configuration is not needed for this single-domain deployment.
- SQL queries use parameterized statements.
- This is a learning/portfolio starter. Before real public use, protect write endpoints with authentication/authorization and consider rate limiting, request logging, image upload validation, and abuse prevention.
- A Vercel function cannot reach a MySQL server running only on your own computer. Use a publicly reachable hosted database with secure TLS and the provider's access controls.
