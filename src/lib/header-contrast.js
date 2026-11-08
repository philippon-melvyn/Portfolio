export function compositeColors(front, back) {
  const alpha = front[3] + back[3] * (1 - front[3]);
  if (!alpha) return [0, 0, 0, 0];
  return [0, 1, 2].map((channel) =>
    (front[channel] * front[3] + back[channel] * back[3] * (1 - front[3])) / alpha,
  ).concat(alpha);
}

export function relativeLuminance(color) {
  const linear = color.slice(0, 3).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

export function headerInk(luminance, previous) {
  // Une petite marge évite les oscillations sur une image ou pendant une transition.
  const threshold = previous === "white" ? 0.2 : previous === "black" ? 0.16 : 0.179;
  return luminance < threshold ? "white" : "black";
}

export function imageSamplePoint(image, bounds, x, y, fit = "fill", position = "50% 50%") {
  if (!bounds.width || !bounds.height || !image.naturalWidth || !image.naturalHeight) return null;
  let width = bounds.width;
  let height = bounds.height;
  if (fit === "cover" || fit === "contain") {
    const scale = Math[fit === "cover" ? "max" : "min"](bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
    width = image.naturalWidth * scale;
    height = image.naturalHeight * scale;
  }
  const tokens = position.split(/\s+/);
  function fraction(value = "50%") {
    if (value === "left" || value === "top") return 0;
    if (value === "right" || value === "bottom") return 1;
    return value.endsWith("%") ? parseFloat(value) / 100 : 0.5;
  }
  const u = (x - bounds.left - (bounds.width - width) * fraction(tokens[0])) / width;
  const v = (y - bounds.top - (bounds.height - height) * fraction(tokens[1])) / height;
  return u >= 0 && u <= 1 && v >= 0 && v <= 1 ? { u, v } : null;
}
