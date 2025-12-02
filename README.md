# AI Weather Outfit Suggestion Agent

A lightweight Node.js microservice that suggests weather-appropriate outfits based on a short user message. This repository implements a small agent-based wrapper that queries weather information and applies outfit rules to produce a concise, human-friendly outfit recommendation.

The project is production-oriented: clear inputs/outputs, validation, logging, and small composable tools are used so the agent can be integrated into larger systems (chatbots, mobile backends, or voice agents).

## Table of contents

- [Concept](#concept)
- [Quick start](#quick-start)
- [API](#api)
- [Contract (inputs / outputs)](#contract-inputs--outputs)
- [Architecture & components](#architecture--components)
- [Usage examples](#usage-examples)
- [Validation & edge cases](#validation--edge-cases)
- [Quality gates & how we verified](#quality-gates--how-we-verified)
- [Next steps / Improvements](#next-steps--improvements)

## Concept

This microservice exposes a single HTTP endpoint that accepts a short user message describing a location or weather-related question (for example: "What should I wear in Seattle today?"). The agent composes the required operations:

- validate and parse the request payload,
- fetch weather details using a weather tool,
- run outfit selection logic using domain rules and heuristics,
- return a short, actionable outfit suggestion.

The project favors small, testable modules: `tools` (weather, outfit), `agent` (orchestration), `route` (HTTP), and `validation` (input schemas).

## Quick start

Prerequisites:

- Node.js 18+ (tested on Node 18+)
- Git

Install and run in development mode (PowerShell on Windows):

```powershell
# from repository root
npm install
npm run dev
```

Notes:
- The repository uses `nodemon` for `npm run dev` (see `package.json`).
- If you want a production start script, add a `start` script to `package.json` like: `"start": "node index.js"`.

## API

POST /agent

- Content-Type: application/json
- Body: { "message": string }
- Response: { "message": string }

Route implementation summary (from `src/route/agentRoute.js`):

```javascript
// POST /agent
router.post("/agent", async (req, res, next) => {
  const response = await weatherOutfitAgent({ query: req.body.message });
  res.json({ message: response });
});
```

### Example request (curl)

```bash
curl -X POST http://localhost:3000/agent \
  -H "Content-Type: application/json" \
  -d '{"message":"What should I wear in New York City today?"}'
```

Example PowerShell (Invoke-RestMethod):

```powershell
Invoke-RestMethod -Uri http://localhost:3000/agent -Method Post -Body (@{ message = 'What should I wear in New York City today?' } | ConvertTo-Json) -ContentType 'application/json'
```

### Sample response

```json
{
  "message": "Light rain jacket, waterproof shoes, and an umbrella. Temperatures near 55°F — consider a light sweater under your jacket."
}
```

## Contract (inputs / outputs)

- Input: JSON object with a `message` string. This is intentionally flexible and human-friendly (the agent can parse free-text queries).
- Output: JSON object with a `message` string containing an actionable outfit suggestion.
- Error modes: the service returns standard non-2xx for validation or upstream errors and a descriptive message. Internally, the code uses Zod-based schemas (see `src/validation`) to validate input shapes.

## Architecture & components

- `index.js` — application entry (bootstraps Express app). See `src/app.js` for app wiring.
- `src/route/agentRoute.js` — HTTP route exposing `/agent`.
- `src/agent/weatherOutfitAgent.js` — orchestrator: validates inputs, calls tools, composes output.
- `src/tools/weatherTool.js` — small wrapper to fetch weather (abstracted so providers can be swapped).
- `src/tools/outfitTool.js` — contains outfit selection heuristics and rules.
- `src/helper/retry.js` / `src/helper/logger.js` — cross-cutting utilities.
- `src/validation/*` — request and domain validation schemas (Zod).

High-level flow:

1. Request arrives at `/agent` with `{ message }`.
2. `weatherOutfitAgent` validates and determines location/time intent.
3. `weatherTool` fetches forecast/current weather.
4. `outfitTool` maps weather to outfit suggestions (temperature ranges, precipitation rules, wind chill).
5. Response returned.

## Usage examples — code snippets

Programmatic call (Node.js fetch):

```javascript
import fetch from 'node-fetch';

const payload = { message: 'Going to London tomorrow morning — what should I wear?' };
const res = await fetch('http://localhost:3000/agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
const data = await res.json();
console.log(data.message);
```

How the agent is invoked inside the route (already present in `src/route/agentRoute.js`):

```javascript
import { weatherOutfitAgent } from '../agent/weatherOutfitAgent.js';

// in Express route
const response = await weatherOutfitAgent({ query: req.body.message });
res.json({ message: response });
```

A simple example of what `weatherOutfitAgent` expects and returns (contract):

- Input: { query: string }
- Returns: string (the final human-readable suggestion)

## Validation & edge cases

Edge cases to consider and how this codebase handles them:

- Empty or malformed message: input validation returns 400 with a helpful message.
- Unknown location or ambiguous query: the agent should ask for clarification (or return a best-effort generic suggestion) — implementer decision.
- Upstream weather API failures: the `retry` helper or fallback heuristics are available to produce a degraded but useful response.
- Rate limits / timeouts: wrap HTTP calls with timeouts and return a 503 when dependencies are unavailable.

## Quality gates & how we verified

Small checklist used while preparing this README and validating the repo:

- Lint/typecheck: none enforced by repo by default — consider adding ESLint and a precommit check.
- Unit tests: none present by default. Add tests for `outfitTool` (mapping temp/conditions → outfit) and for `weatherOutfitAgent` orchestration.
- Manual smoke: start server (`npm run dev`) and POST to `/agent` to confirm 200 + JSON response.

Recommended minimal tests:

- outfitTool: map temperatures at boundaries (e.g., 32°F, 50°F, 75°F) → expected layers.
- route: POST invalid body → 400 with validation error.

## Environment & deployment notes

- Uses `dotenv` for configuration. Add a `.env` file to provide keys for external weather providers or other secrets.
- Recommended environment variables:
  - WEATHER_API_KEY (if using a provider requiring an API key)
  - PORT (default to 3000 if unspecified)

Production checklist:

- Add `start` script to `package.json`.
- Add a process manager (PM2, systemd unit) or containerize with Docker.
- Add monitoring and structured logs (winston is already a dependency).

## Next steps / Improvements

- Add unit tests and a CI workflow (GitHub Actions) to run lint and tests on PRs.
- Add integration tests that mock the weather provider.
- Improve NLU: add small intent/location parser to better extract date/time and place from free text.
- Add caching for repeated weather lookups (Redis) to reduce cost/rate-limit usage.

## Files changed / created

- `README.md` — this file: professional documentation and usage guide for the project.

## Try it

1. Install dependencies

```powershell
npm install
```

2. Run in dev mode

```powershell
npm run dev
```

3. POST an example request (PowerShell):

```powershell
Invoke-RestMethod -Uri http://localhost:3000/agent -Method Post -Body (@{ message = 'What should I wear in Paris today?' } | ConvertTo-Json) -ContentType 'application/json'
```

## Final notes

This README is intentionally practical and concise to onboard new engineers quickly. If you'd like, I can:

- add a Dockerfile and a `start` script,
- scaffold unit tests for `outfitTool` and `agent` with Jest,
- or generate an OpenAPI spec for the `/agent` endpoint.

If you want any of those, tell me which and I'll implement it next.
