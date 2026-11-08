import test from "node:test";
import assert from "node:assert/strict";
import { galleryEase, createGalleryMotion } from "../src/lib/gallery-motion.js";

function motionEnvironment() {
  let value = 0;
  let clock = 0;
  let id = 0;
  const frames = new Map();
  const motion = createGalleryMotion({
    read: () => value,
    write: (next) => {
      value = next;
    },
    now: () => clock,
    requestFrame: (callback) => {
      frames.set(++id, callback);
      return id;
    },
    cancelFrame: (key) => frames.delete(key),
  });
  return {
    motion,
    get value() {
      return value;
    },
    step(time) {
      clock = time;
      const batch = [...frames.values()];
      frames.clear();
      batch.forEach((callback) => callback(clock));
    },
  };
}

test("Mouvement : départ lent, accélération au centre et arrivée sans saut", () => {
  assert.equal(galleryEase(0), 0);
  assert.equal(galleryEase(0.5), 0.5);
  assert.equal(galleryEase(1), 1);
  const env = motionEnvironment();
  env.motion.to(500, { duration: 1000 });
  env.step(250);
  const first = env.value;
  env.step(500);
  const middle = env.value;
  env.step(750);
  const last = env.value;
  env.step(1000);
  assert.ok(first > 0 && first < 20);
  assert.ok(middle - first > first * 10);
  assert.ok(last > 480 && last < 500);
  assert.equal(env.value, 500);
  assert.equal(env.motion.running, false);
});

test("Mouvement : une inversion repart de la position réelle et annule l’ancienne arrivée", () => {
  const env = motionEnvironment();
  let oldCompletion = false;
  env.motion.to(500, {
    duration: 1000,
    onComplete: () => {
      oldCompletion = true;
    },
  });
  env.step(500);
  assert.equal(env.value, 250);
  env.motion.to(0, { duration: 1000 });
  assert.equal(env.value, 250);
  env.step(750);
  assert.ok(env.value < 250 && env.value > 230);
  env.step(1500);
  assert.equal(env.value, 0);
  assert.equal(oldCompletion, false);
});
