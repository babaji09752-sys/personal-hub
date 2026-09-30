/**
 * Web Audio API synthesizer for tactile UI sound effects
 * Zero external audio assets required; synthesized in real time.
 */

let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (AudioContext) {
      audioCtx = new AudioContext()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export const sound = {
  isMuted: () => {
    return localStorage.getItem('sound_muted') === 'true'
  },

  setMuted: (muted) => {
    localStorage.setItem('sound_muted', muted ? 'true' : 'false')
  },

  // Soft mechanical click
  click: () => {
    if (sound.isMuted()) return
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04)

      gain.gain.setValueAtTime(0.04, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.04)
    } catch (e) {
      // Audio autoplay policy fallback
    }
  },

  // Soft pleasant switch toggle
  toggle: () => {
    if (sound.isMuted()) return
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(450, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.06)

      gain.gain.setValueAtTime(0.035, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.06)
    } catch (e) {}
  },

  // Harmonic celebratory chime
  success: () => {
    if (sound.isMuted()) return
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const startTime = ctx.currentTime + idx * 0.06

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime)

        gain.gain.setValueAtTime(0.04, startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(startTime)
        osc.stop(startTime + 0.3)
      })
    } catch (e) {}
  },

  // Low gentle deletion pop
  delete: () => {
    if (sound.isMuted()) return
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(320, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.09)

      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.09)
    } catch (e) {}
  },
}
