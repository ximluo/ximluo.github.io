/* One step per wheel gesture, whatever sends it. A macOS trackpad streams momentum that only ever decays; a Windows
   precision touchpad delivers momentum as ~200 ms bursts between ~190 ms pauses, each opening with a catch-up spike
   that dwarfs the plateau behind it; a notched mouse wheel sends one event per notch. So: after LONG silence a gesture
   is new and may step at once; a burst inside a gesture is judged on its opening, a spike followed by a drop being
   momentum and a ramp or plateau a finger; a burst of one notch-sized event is a wheel notch, which no momentum
   follows, so the notch after it steps as soon as the last step has landed; a stream that climbs for two events after
   decaying is a second swipe; and otherwise no step follows another within COOL. */
export const GAP = 100 /* silence that ends a burst */
const LONG = 450 /* silence that ends the gesture */
const COOL = 400 /* least time between two steps */
const DEAD = 28 /* travel before a step */

/** Feed each delta along the locked axis with its time and whether a step is still landing; returns the step to take
    (±1) or 0. */
export function wheelGesture() {
  let acc = 0
  let last = -1e9
  let dir = 0
  let armed = true
  let peak = 0
  let low = 0
  let stepT = -1e9
  let n = 0 /* events in the burst */
  let sum = 0 /* the burst's travel so far */
  let spike = 0 /* the burst's opening travel while the burst waits to be judged, else 0 */
  let notch = false /* the burst follows a lone notch */
  let r1 = 0 /* the last two travels, for the climb test */
  let r2 = 0
  return (dv: number, now: number, busy: boolean): number => {
    const a = Math.abs(dv)
    const d = Math.sign(dv)
    const gap = now - last
    last = now
    const cool = now - stepT >= COOL
    if (gap > GAP) {
      notch = n === 1 && Math.abs(sum) >= DEAD
      n = 0
      sum = 0
      acc = 0
      r1 = r2 = 0
      armed = gap > LONG || notch
      spike = armed ? 0 : a
    } else if (spike) {
      /* a bigger second event makes the opening a lead-in: the spike candidate moves and the third event judges */
      if (n === 1 && a > spike) spike = a
      else {
        const finger = spike < a * 2 + 8
        spike = 0
        /* a finger burst too soon after a step is spent, and the climb below is measured from it, not from its ramp */
        if (finger) {
          if (cool) {
            armed = true
            acc = sum
          } else peak = low = a
        }
      }
    } else if (!armed && cool && a > r1 && r1 > r2 && low < peak * 0.5 && a > low * 2 + 8) {
      armed = true
      acc = 0
    }
    n++
    sum += dv
    r2 = r1
    r1 = a
    if (d !== dir) {
      dir = d
      armed = true
      acc = 0
      spike = 0
    }
    if (a > peak) peak = low = a
    else low = Math.min(low, a)
    if (!armed) return 0
    acc += dv
    if (Math.abs(acc) < DEAD) return 0
    /* spent either way: a step refused while one is landing must not fire on the next trickle */
    armed = false
    acc = 0
    peak = low = a
    if (busy || !(cool || notch)) return 0
    stepT = now
    return dir
  }
}
