export function galleryEase(value) {
  const t = Math.max(0, Math.min(1, value));
  return t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2;
}

// Un seul pilote du scroll : aucune animation native ou aimantation CSS concurrente.
export function createGalleryMotion({
  read,
  write,
  requestFrame,
  cancelFrame,
  now,
}) {
  let frame;
  let generation = 0;
  let running = false;
  function cancel() {
    generation += 1;
    if (frame !== undefined) cancelFrame(frame);
    frame = undefined;
    running = false;
  }
  function to(
    target,
    { duration = 1400, onUpdate = () => {}, onComplete = () => {} } = {},
  ) {
    cancel();
    const from = read();
    const start = now();
    const token = generation;
    if (!duration || Math.abs(target - from) < 0.5) {
      write(target);
      onUpdate(1);
      onComplete();
      return;
    }
    running = true;
    function step(time) {
      if (token !== generation) return;
      const progress = Math.min(1, Math.max(0, (time - start) / duration));
      write(from + (target - from) * galleryEase(progress));
      onUpdate(progress);
      if (progress < 1) frame = requestFrame(step);
      else {
        frame = undefined;
        running = false;
        onComplete();
      }
    }
    frame = requestFrame(step);
  }
  return {
    to,
    cancel,
    get running() {
      return running;
    },
  };
}
