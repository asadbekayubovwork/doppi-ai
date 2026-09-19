# Quickstart — connect a UI in 5 steps

Follow this page top to bottom. It uses this deployment's real values, so you
can paste and run without substituting anything.

Read this first; `UI_INTEGRATION_GUIDE.md` next to it is the same material in
depth (error handling, edge cases, the full checklist) and is the version to
hand to another developer.

---

## Your values

```
BASE_URL   https://heavily-silent-around-forge.trycloudflare.com
API_KEY    pv_ak_0ZuqhTPvlKh9IBfj4yWIN-i6EBqK2xcQYVBpm0U8qAQ
```

That key is the `ui` entry in `synoravoice/config/users.yaml`. Never use the
`admin` key from that same file — it is for maintenance from the server box
and must not reach a browser.

> ⚠️ **This file now contains a live credential.** Don't commit it to a public
> repo, and don't hand this page to an outside developer — give them
> `UI_INTEGRATION_GUIDE.md`, which is the same instructions with placeholders.
> To rotate: generate a new key, replace the `ui` entry's `api_key`, restart
> the app, and update the value above.
>
> ```bash
> python3 -c "import secrets; print('pv_ak_' + secrets.token_urlsafe(32))"
> ```

> The Base URL above is a temporary tunnel address: it changes every time the
> tunnel restarts. Get the current one with `pv-data/stack.local.sh url` and
> keep it in your UI's config rather than hardcoding it.

---

## Step 1 — Prove the connection works, before writing any code

Open `test-client.html` (in this folder) in a browser, paste the Base URL and
the API key into the two fields, and press **Check connection**.

Serve it over HTTP rather than opening the file directly — browsers only grant
microphone access on a secure origin, and `localhost` counts as one:

```bash
cd synoravoice/docs/api && python3 -m http.server 8777 --bind 127.0.0.1
# then open http://127.0.0.1:8777/test-client.html
```

- **"service reachable"** → continue to step 2.
- **"unreachable"** → wrong URL, the service is down, or your origin isn't
  allow-listed for CORS.

Then press **Start**, allow the microphone, and talk. You should hear a reply
and see the transcript fill in. That page is a complete working client — once
it works, any failure in your own UI is in your integration, not the API.

---

## Step 2 — Copy the two endpoints into your UI

That is the entire API surface:

```
GET   {BASE_URL}/healthz                     no auth — reachability check
POST  {BASE_URL}/api/offer    X-API-Key      open a session
PATCH {BASE_URL}/api/offer    X-API-Key      add network candidates
```

Every other path returns `404` by design. **Ending a session needs no API
call** — you close the connection in the browser and the server cleans up.

Verify the key from a terminal:

```bash
# expects 200
curl -s -o /dev/null -w '%{http_code}\n' \
  https://heavily-silent-around-forge.trycloudflare.com/healthz

# expects 401 — proves auth is actually enforced
curl -s -o /dev/null -w '%{http_code}\n' -X POST \
  https://heavily-silent-around-forge.trycloudflare.com/api/offer \
  -H 'Content-Type: application/json' -d '{"sdp":"x","type":"offer"}'
```

---

## Step 3 — Take the client code

`test-client.html` is deliberately dependency-free: no SDK, no build step,
plain `RTCPeerConnection`. Lift these three pieces into your UI:

| From `test-client.html` | What it does |
|---|---|
| `startSession()` | Everything from microphone to connected session |
| `handleEvent(msg)` | Maps live events to transcript + status |
| `stopSession()` | Closes the connection and releases the microphone |

`startSession()` returns an object with a `stop()` method — keep it in
whatever your framework uses for state, and call it from your Stop button.

### The three rules that silently break a session

Every one of these produces a session that *looks* connected but isn't. They
are already handled in the file above — keep them when you port the code.

1. **Add a video transceiver** even though this is audio-only. Without it the
   connection establishes but no audio flows, with no error anywhere. Your
   camera is never opened, only the channel is negotiated.
2. **Create the data channel yourself.** The server never creates one. Skip it
   and audio works but you get no transcript and no status events.
3. **Send `ping` every second** once that channel is open. Miss it for 3
   seconds and the server drops the session — the agent goes silent
   mid-conversation.

---

## Step 4 — Wire your Start and Stop buttons

```js
let session = null;

startBtn.onclick = async () => {
  startBtn.disabled = true;
  try {
    session = await startSession();
    stopBtn.disabled = false;
  } catch (err) {
    startBtn.disabled = false;
    showError(err.message);          // 401 here = bad key
  }
};

stopBtn.onclick = () => {
  session?.stop();                   // also releases the microphone
  session = null;
  startBtn.disabled = false;
  stopBtn.disabled = true;
};

window.addEventListener("pagehide", () => session?.stop());
```

Start must run from a real click. A session opened without a user gesture has
its audio muted by the browser's autoplay policy.

---

## Step 5 — Render the live events

Events arrive on the data channel as JSON with a `type` and a `data` object.
The five worth handling:

| `type` | Use it for |
|---|---|
| `user-transcription` | The user's words — commit only when `data.final` is true |
| `bot-output` | The agent's reply — commit only when `data.spoken_status === "completed"` |
| `user-started-speaking` | Switch the UI to "listening" |
| `bot-started-speaking` / `bot-stopped-speaking` | Switch to "speaking" / "idle" |
| `error` | Show a failure state |

Both filters matter. `user-transcription` can arrive as a partial that is
later superseded, and `bot-output` fires **twice per sentence** — once as
`new`, once as `completed`. Skip the filters and every reply renders twice.

The agent decides on its own when a turn has ended and handles being
interrupted. You do not implement any of that.

---

## If something doesn't work

| Symptom | Cause |
|---|---|
| CORS error in the console | Your origin isn't allow-listed — send it to the API operator |
| `401` from `/api/offer` | Wrong or missing key, or you used the `admin` key's roster entry name instead of its value |
| Connects, but silence both ways | Missing video transceiver (rule 1) |
| Audio fine, no transcript | Missing data channel (rule 2) |
| Agent goes quiet after ~3 s | Keepalive stopped (rule 3) |
| Microphone indicator stays on after Stop | You closed the connection but didn't stop the tracks |
| First connection after a restart is very slow | Warm-up — allow up to ~30 s before timing out |
| Works locally, not from another network | Media is direct UDP; a tunnel only carries signalling. Needs TURN |

The full error table, the production checklist, and how to keep the API key
out of your frontend bundle are in `UI_INTEGRATION_GUIDE.md` §8–9.
