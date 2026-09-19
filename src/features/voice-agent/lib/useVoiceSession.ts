import { computed, onUnmounted, readonly, ref, shallowRef, type Ref } from "vue"
import {
  VOICE_AGENT_API_KEY,
  VOICE_AGENT_BASE_URL,
  VOICE_AGENT_ICE_SERVERS,
} from "@/shared/config/voiceAgent"

/**
 * Drives a live two-way voice session with the agent over WebRTC, as a Vue
 * composable. It is a faithful port of the reference client in
 * `test-client.html`; the three rules that silently break a session are called
 * out inline because they are easy to drop when refactoring:
 *
 *   1. add a video transceiver even though this is audio-only, or no audio flows
 *   2. create the data channel ourselves — the server never does — or no events
 *   3. send `ping` once a second, or the server drops the session after ~3s
 *
 * The caller supplies an `<audio>` element for the agent's voice and gets back
 * reactive `phase`, `speaker`, `transcript` and `error`, plus `start`/`stop`.
 * The session is torn down automatically on unmount.
 */

/** Coarse lifecycle of the session, for driving the button and orb. */
export type VoicePhase = "idle" | "connecting" | "live" | "error"

/** Who currently holds the floor while the session is live. */
export type VoiceSpeaker = "idle" | "listening" | "speaking"

export interface TranscriptEntry {
  id: number
  role: "user" | "agent"
  text: string
}

/** The subset of data-channel events we render; everything else is ignored. */
interface AgentEvent {
  type: string
  data?: {
    text?: string
    final?: boolean
    spoken_status?: string
    message?: string
  }
}

const headers = (): HeadersInit => ({
  "Content-Type": "application/json",
  "X-API-Key": VOICE_AGENT_API_KEY,
})

export interface UseVoiceSessionOptions {
  /** Element that plays the agent's returned audio track. */
  audioEl: Ref<HTMLAudioElement | null>
}

export function useVoiceSession({ audioEl }: UseVoiceSessionOptions) {
  const phase = ref<VoicePhase>("idle")
  const speaker = ref<VoiceSpeaker>("idle")
  const transcript = ref<TranscriptEntry[]>([])
  const error = ref<string | null>(null)

  const isActive = computed(() => phase.value !== "idle" && phase.value !== "error")

  // Live session resources, held outside reactivity — they are DOM/network
  // objects, not state to render.
  const pc = shallowRef<RTCPeerConnection | null>(null)
  const channel = shallowRef<RTCDataChannel | null>(null)
  let micStream: MediaStream | null = null
  let keepalive: ReturnType<typeof setInterval> | null = null
  let entryId = 0

  const addEntry = (role: TranscriptEntry["role"], text: string) => {
    if (!text) return
    transcript.value = [...transcript.value, { id: entryId++, role, text }]
  }

  const handleEvent = (msg: AgentEvent) => {
    switch (msg.type) {
      case "user-transcription":
        // Partials arrive with final:false and are superseded — commit the final.
        if (msg.data?.final && msg.data.text) addEntry("user", msg.data.text)
        break
      case "bot-output":
        // Fires more than once per sentence — take the completed one only.
        if (msg.data?.spoken_status === "completed" && msg.data.text)
          addEntry("agent", msg.data.text)
        break
      case "user-started-speaking":
        speaker.value = "listening"
        break
      case "bot-started-speaking":
        speaker.value = "speaking"
        break
      case "bot-stopped-speaking":
        speaker.value = "idle"
        break
      case "error":
        error.value = msg.data?.message || "unknown error"
        break
    }
  }

  /** Tears everything down and releases the microphone. Safe to call twice. */
  const teardown = () => {
    if (keepalive) clearInterval(keepalive)
    keepalive = null
    try {
      channel.value?.close()
    } catch {
      /* already closed */
    }
    channel.value = null
    pc.value?.close()
    pc.value = null
    for (const track of micStream?.getTracks() ?? []) track.stop() // clears the mic indicator
    micStream = null
    if (audioEl.value) audioEl.value.srcObject = null
    speaker.value = "idle"
  }

  const stop = () => {
    if (phase.value === "idle") return
    teardown()
    phase.value = "idle"
  }

  async function start() {
    if (isActive.value) return
    error.value = null
    transcript.value = []
    phase.value = "connecting"

    try {
      // 1. Microphone. Rejects if the user denies permission or has none.
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const connection = new RTCPeerConnection({
        iceServers: VOICE_AGENT_ICE_SERVERS,
      })
      pc.value = connection

      // 2. Play the agent's voice.
      connection.ontrack = (e) => {
        if (e.track.kind === "audio" && audioEl.value)
          audioEl.value.srcObject = e.streams[0]
      }

      // Rule 1 — both transceivers, even though this is audio-only.
      connection.addTransceiver(micStream.getAudioTracks()[0], {
        direction: "sendrecv",
      })
      connection.addTransceiver("video", { direction: "sendrecv" })

      // Rule 2 — the client creates the data channel; the server never does.
      const events = connection.createDataChannel("events")
      channel.value = events
      // Rule 3 — ping every second or the session is dropped after ~3s.
      events.onopen = () => {
        keepalive = setInterval(() => {
          if (events.readyState === "open") events.send("ping")
        }, 1000)
      }
      events.onmessage = (e) => {
        let msg: AgentEvent
        try {
          msg = JSON.parse(e.data)
        } catch {
          return
        }
        handleEvent(msg)
      }

      // Trickle ICE — queue candidates until we have a pc_id, then flush.
      let pcId: string | null = null
      const queued: RTCIceCandidate[] = []
      const sendCandidate = (c: RTCIceCandidate) =>
        fetch(`${VOICE_AGENT_BASE_URL}/api/offer`, {
          method: "PATCH",
          headers: headers(),
          body: JSON.stringify({
            pc_id: pcId,
            candidates: [
              {
                candidate: c.candidate,
                sdp_mid: c.sdpMid,
                sdp_mline_index: c.sdpMLineIndex,
              },
            ],
          }),
        }).catch(() => {}) // a lost candidate is not fatal
      connection.onicecandidate = (e) => {
        if (!e.candidate) return
        if (pcId) sendCandidate(e.candidate)
        else queued.push(e.candidate)
      }

      connection.onconnectionstatechange = () => {
        const s = connection.connectionState
        if (s === "connected") {
          phase.value = "live"
        } else if (["failed", "disconnected", "closed"].includes(s)) {
          // Don't treat our own stop() (which reaches "closed") as a failure.
          if (s !== "closed" && phase.value !== "idle") {
            error.value = "Connection lost"
            teardown()
            phase.value = "error"
          }
        }
      }

      // Negotiate.
      await connection.setLocalDescription(await connection.createOffer())

      const res = await fetch(`${VOICE_AGENT_BASE_URL}/api/offer`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          sdp: connection.localDescription?.sdp,
          type: connection.localDescription?.type,
        }),
      })
      if (res.status === 401) throw new Error("Invalid or missing API key")
      if (!res.ok) throw new Error(`Could not start session (HTTP ${res.status})`)

      const answer = await res.json()
      pcId = answer.pc_id
      await connection.setRemoteDescription(answer)

      for (const c of queued) await sendCandidate(c)
      queued.length = 0
    } catch (err) {
      teardown()
      phase.value = "error"
      error.value = messageFor(err)
    }
  }

  onUnmounted(teardown)

  return {
    phase: readonly(phase),
    speaker: readonly(speaker),
    transcript: readonly(transcript),
    error: readonly(error),
    isActive,
    start,
    stop,
  }
}

/** Maps the failure modes worth distinguishing to a short user-facing string. */
function messageFor(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError") return "Microphone permission denied"
    if (err.name === "NotFoundError") return "No microphone found"
  }
  return err instanceof Error ? err.message : "Could not start the call"
}
