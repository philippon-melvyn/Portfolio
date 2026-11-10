export function introState(progress) {
  const p = Math.max(0, Math.min(1, progress));
  function phase(start, end) {
    const t = Math.max(0, Math.min(1, (p - start) / (end - start)));
    return t * t * (3 - 2 * t);
  }
  return {
    slide: phase(.08, 1),
    nameOpacity: 1 - phase(.02, .38),
    nameX: -48 * phase(0, .4),
    shade: phase(.16, .8),
  };
}
