# AI Mystery Room — The Case Room

A cinematic, responsive detective game. Start with the included fictional Blackwood case, inspect evidence and suspect files, connect clues, use progressive hints, and make one final accusation. A correct or incorrect accusation reveals the authoritative solution and the evidence that supports it.

## Run locally

Requires Node.js 20 or newer and npm.

1. Copy `.env.example` to `.env`.
2. Set `GEMINI_API_KEY` to enable new mystery generation. The key stays on the server. The sample case works without it.
3. Optionally set `MONGODB_URI` for persisted generated cases. Without MongoDB, generated cases live in server memory until it restarts.
4. Run `npm install`, then `npm run dev`.
5. Open `http://localhost:5173`.

For production, run `npm run build`, set production environment variables, and run `npm start`. Express serves the built frontend and API on the same port. The configured MongoDB database should be backed up and reachable from the server.

## Deploy to Render

This repository includes `render.yaml`, which configures a single Render web service to build the Vite frontend and serve it together with the Express API. Pushes to the connected GitHub branch trigger new deployments.

### 1. Rotate credentials shown in the earlier screenshot

The screenshot shared during development showed the Gemini API key and MongoDB connection credentials. Revoke that Gemini key and change the MongoDB database user's password before deploying. Use the replacement credentials only in Render's environment settings; do not commit them or put them in `render.yaml`.

### 2. Prepare MongoDB Atlas

1. In Atlas, create or select a cluster and create a database user with access limited to this app's database (typically `readWrite`).
2. Copy the cluster's application connection string. Replace its username, password, and database name with the new values, and URL-encode special characters in the password.
3. After Render creates the service, open its **Connect** menu and view **Outbound** IP ranges. Add those ranges to Atlas **Network Access**. Render uses shared regional ranges unless you configure dedicated outbound IPs; avoid `0.0.0.0/0`, which allows connections from anywhere.

The first service start may report that MongoDB is unavailable until its outbound ranges are allowlisted. Once Atlas access is configured, restart the Render service and confirm `/api/health` reports `"persistence":"mongodb"`.

### 3. Create the Render service from the Blueprint

1. Sign in to Render and choose **New → Blueprint**.
2. Connect GitHub if asked, then select `kamalsainikkondi/AI_Mystery_Room` and the `main` branch.
3. Render reads `render.yaml`. During setup, enter the rotated `GEMINI_API_KEY` and the Atlas `MONGODB_URI` when prompted. These are marked `sync: false` and are not stored in the Blueprint file.
4. Create the Blueprint and wait for the first deploy to finish. Render uses `npm ci && npm run build`, starts the app with `npm start`, and checks `/api/health`.
5. Finish the Atlas network access step above, restart the service if needed, and open the `onrender.com` URL shown in the Render dashboard.

### 4. Verify the deployed app

Open `<your-service>.onrender.com/api/health`. Expect a JSON response with `"status":"ok"` and `"persistence":"mongodb"`. Then open the homepage, try the sample case, and create one fictional case to check Gemini. If generation fails, inspect the service's Render logs and environment settings; never paste credentials into logs, issues, or chat.

The Blueprint uses Render's Free web service plan for a hobby deployment. Free services spin down after 15 minutes without requests and can take about a minute to wake up. Choose a paid plan if you need the app to stay available without cold starts. See [Render's free service limits](https://render.com/docs/free).

After the initial setup, push future updates with `git add .`, `git commit -m "Describe the change"`, and `git push`; Render deploys the connected branch automatically.

## Product behavior

- The bundled sample case is a complete, pre-authored mystery with a single fixed solution.
- New cases are generated on the server through Gemini structured JSON output. Input is limited to 12–700 characters; outputs must pass Zod validation and relationship checks before the case is accepted.
- Generated cases have 3–5 suspects and 5–12 evidence items. Generation asks for exactly four suspects; the validator accepts 3–5 to allow compatible model output. Every solution culprit and key clue must refer to existing records.
- The browser receives public case fields and a hint count only. `solution` and the hint list are stored separately and excluded from case retrieval; one hint is returned per request, and the solution appears only when the one accusation resolves the case.
- Notes and the active case ID are stored in browser local storage. MongoDB case documents expire after 30 days. No accounts, tracking, or real-person records are used.
- Images and surveillance recordings are not generated. Evidence cards are designed as fictional text artifacts; any CCTV reference is explicitly a written transcript.

## API

All endpoints return JSON; errors use `{ "error": "..." }`.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health and storage mode |
| `POST` | `/api/cases` | Generate a case from `{ premise, difficulty, length }` |
| `GET` | `/api/cases/:id` | Retrieve public case data only |
| `GET` | `/api/cases/:id/evidence` | List evidence |
| `GET` | `/api/cases/:id/suspects` | List suspect profiles |
| `POST` | `/api/cases/:id/hints` | Get `{ hintIndex }` hint |
| `POST` | `/api/cases/:id/accusations` | Submit `{ suspectId, hintsUsed? }`; returns resolution and explanation |
| `GET` | `/api/cases/:id/report` | Retrieve the report after the case has been resolved |

Production generation is limited to three requests per IP per hour (local development allows ten); case actions are limited to 30 per case path per IP per hour. Case IDs for generated mysteries are random UUIDs. This MVP has no user accounts, so case access is based on possession of the case ID.

## Architecture

```text
React + Vite browser
  ├── localStorage: active case ID and private field notes
  └── /api requests
        Express + Helmet + input validation
          ├── Gemini API (server key; structured JSON)
          └── MongoDB (optional; public case and separately selected solution)
```

`src/demoCase.js` contains the public sample case. Its authoritative solution and hints live only in `server/index.js`. `server/caseSchema.js` defines the generated case contract and consistency checks. `server/index.js` owns generation, persistence, public case access, hints, and answer evaluation. The case DTO removes both the solution and unrevealed hints before case data is sent to the browser.

## Environment

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Express port; defaults to `3001` |
| `CLIENT_ORIGIN` | No | Comma-separated allowed browser origins for cross-origin clients; local development defaults to Vite, while same-origin production hosting does not need it |
| `MONGODB_URI` | No | MongoDB connection string; omitted means in-memory case storage |
| `GEMINI_API_KEY` | For generation | Server-only Google Gemini API credential |
| `GEMINI_MODEL` | No | Gemini model name; defaults to `gemini-3.5-flash-lite` for lower latency |

## MVP limitations

There are no user accounts or per-player server-side progress records. Each case accepts one accusation; its result is saved in MongoDB when configured. Hint limits and request throttling are IP-based rather than identity-based. Generated content is schema-checked and key references are checked, but semantic contradiction detection remains a generation prompt requirement rather than a formal theorem prover. Add authenticated guest sessions and deterministic contradiction checks before treating the service as a multi-user production game.
