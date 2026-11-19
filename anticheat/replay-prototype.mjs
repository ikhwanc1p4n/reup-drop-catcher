/* RE:UP deterministic replay prototype (STAGING ONLY).
 * This is NOT wired to the live game or a production score validator.
 * No browser-submitted score is trusted.
 */
export const REPLAY_VERSION = 1;
const MAX_TICKS = 60 * 60 * 10; // prototype 10-minute resource bound
const MAX_EVENTS = 120000;
const TICKS_PER_SECOND = 60;
const WIDTH = 360;
const PLAYER_SPEED = 210 / TICKS_PER_SECOND;
function assert(condition, message) { if (!condition) throw new Error(message); }
function uint32(n) { return n >>> 0; }
export function seededRandom(seed) {
  assert(Number.isSafeInteger(seed) && seed >= 0 && seed <= 0xffffffff, 'Invalid seed');
  let state = uint32(seed);
  return () => {
    state = uint32(state + 0x6D2B79F5);
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return uint32(t ^ (t >>> 14)) / 4294967296;
  };
}
export function validateInputLog(log, totalTicks) {
  assert(Number.isSafeInteger(totalTicks) && totalTicks >= 1 && totalTicks <= MAX_TICKS, 'Invalid duration');
  assert(Array.isArray(log) && log.length <= MAX_EVENTS, 'Invalid input log');
  let lastTick = -1;
  for (const event of log) {
    assert(event && typeof event === 'object' && !Array.isArray(event), 'Invalid input event');
    assert(Number.isSafeInteger(event.tick) && event.tick >= 0 && event.tick < totalTicks, 'Invalid input tick');
    assert(event.tick > lastTick, 'Input ticks must increase strictly');
    assert(['left', 'right', 'neutral'].includes(event.direction), 'Invalid direction');
    assert(Object.keys(event).sort().join(',') === 'direction,tick', 'Unexpected input fields');
    lastTick = event.tick;
  }
  return true;
}
/* Deterministic input/PRNG proof, NOT production gameplay parity.
 * Server must replay the exact approved collision, scoring, spawn and life rules
 * before accepting any score. This function intentionally emits no score.
 */
export function replayPrototype({ seed, totalTicks, inputs }) {
  validateInputLog(inputs, totalTicks);
  const random = seededRandom(seed);
  let x = 180, direction = 'neutral', cursor = 0, checksum = 2166136261;
  for (let tick = 0; tick < totalTicks; tick++) {
    if (cursor < inputs.length && inputs[cursor].tick === tick) direction = inputs[cursor++].direction;
    const step = direction === 'left' ? -PLAYER_SPEED : direction === 'right' ? PLAYER_SPEED : 0;
    x = Math.max(0, Math.min(WIDTH, x + step));
    const sample = Math.floor(random() * 65536);
    checksum = Math.imul(checksum ^ sample ^ Math.floor(x * 1000), 16777619) >>> 0;
  }
  return { version: REPLAY_VERSION, ticks: totalTicks, finalX: x, checksum, verifiedScore: null, eligibleForLeaderboard: false };
}
