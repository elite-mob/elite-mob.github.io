# Portfolio chatbot

Scoped assistant on the portfolio site: project Q&A (OpenAI gpt-4.1-mini via Firebase) and Calendly booking (no OpenAI).

## Behavior

| Intent | OpenAI? | What happens |
|--------|---------|----------------|
| Off-topic | No | Fixed message; suggests portfolio or booking |
| Navigate | No | Scrolls or routes to site sections |
| Schedule | No | Collects name/email/topic/timezone → opens `VITE_SCHEDULE_MEETING_URL` with Calendly prefill |
| Project Q&A | Yes | Local keyword retrieval → `POST` Cloud Function → grounded reply |

## Frontend setup

1. Copy `.env.example` to `.env`.
2. Set `VITE_SCHEDULE_MEETING_URL` to your Calendly event link (same as hero/contact).
3. After deploying the function (below), set `VITE_CHAT_API_URL` to the function URL, e.g.  
   `https://us-central1-YOUR_PROJECT.cloudfunctions.net/chat`
4. `npm run dev`, chat launcher appears bottom-right.

Chat knowledge is loaded from `src/data/chatKnowledge.json` (regenerate when portfolio copy changes; the app can also rebuild chunks from `portfolioData` at runtime if that file is empty).

## Firebase function setup

1. Install Firebase CLI and log in: `firebase login`
2. Edit [`.firebaserc`](../.firebaserc), set `default` to your Firebase project ID (same as `VITE_FIREBASE_PROJECT_ID`).
3. Install function dependencies:

   ```bash
   cd functions && npm install && cd ..
   ```

4. Set secrets:

   ```bash
   firebase functions:secrets:set OPENAI_API_KEY
   ```

5. Optional env for deploy (Firebase console or `firebase functions:config`):

   - `OPENAI_MODEL`, default `gpt-4.1-mini`
   - `ALLOWED_ORIGINS`, comma-separated, e.g. `https://elite-mob.github.io,http://localhost:8080`

6. Deploy:

   ```bash
   firebase deploy --only functions
   ```

7. Copy the `chat` function URL into GitHub secret `VITE_CHAT_API_URL` and local `.env`.

## GitHub Actions

Add repository secret:

- `VITE_CHAT_API_URL`, production function URL

Existing secrets `VITE_SCHEDULE_MEETING_URL` and EmailJS vars are used for scheduling and optional meeting-intent email.

## Local emulator (optional)

```bash
cd functions && npm run build && firebase emulators:start --only functions
```

Point `VITE_CHAT_API_URL` at the emulator URL shown for `chat`.

## Cost and limits

- Function rate limit: 20 requests per IP per hour (in-memory, best-effort).
- Client max message length: 500 characters.
- At most 5 knowledge chunks per API request.
