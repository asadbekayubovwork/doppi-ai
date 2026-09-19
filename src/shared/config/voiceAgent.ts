/**
 * Configuration for the live voice-agent WebRTC session behind the Hero orb.
 *
 * The contract is two endpoints under `${VOICE_AGENT_BASE_URL}`:
 *
 *   GET   /healthz     no auth — reachability check
 *   POST  /api/offer   X-API-Key — open a session
 *   PATCH /api/offer   X-API-Key — add ICE candidates
 *
 * See `UI_INTEGRATION_GUIDE.md` / `QUICKSTART.md` at the repo root for the full
 * protocol. Ending a session needs no API call — the browser closes the
 * connection and the server tears the session down on its own.
 *
 * ⚠️  The API key ships in the browser bundle and is therefore public. That is
 * acceptable for a landing-page demo against a rate-limited `ui` key, but for
 * anything beyond a prototype put a thin proxy on our own backend that adds the
 * key server-side (guide §8). Never use the `admin` key here.
 *
 * The base URL is a temporary Cloudflare tunnel that changes on every restart,
 * so both values are overridable from the environment and should be kept in the
 * deployment config rather than relied on from the defaults below.
 */
const configuredBase = import.meta.env.VITE_VOICE_AGENT_BASE_URL?.trim()
const configuredKey = import.meta.env.VITE_VOICE_AGENT_API_KEY?.trim()

/** Origin of the voice-agent API, without a trailing slash. */
export const VOICE_AGENT_BASE_URL = (
  configuredBase || "https://heavily-silent-around-forge.trycloudflare.com"
).replace(/\/+$/, "")

/** The public `ui` API key sent as `X-API-Key` on both `/api/offer` calls. */
export const VOICE_AGENT_API_KEY =
  configuredKey || "pv_ak_0ZuqhTPvlKh9IBfj4yWIN-i6EBqK2xcQYVBpm0U8qAQ"

/** STUN server used to gather ICE candidates for the peer connection. */
export const VOICE_AGENT_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
]
