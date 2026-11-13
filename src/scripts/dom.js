// These selectors target HTML controls/content, not SVG elements. JSDoc keeps
// the native DOM APIs precise in JavaScript and in Astro's editor diagnostics.
/** @param {ParentNode} root @param {string} selector @returns {HTMLElement | null} */
export function htmlElement(root, selector) {
  return /** @type {HTMLElement | null} */ (root.querySelector(selector));
}

/** @param {ParentNode} root @param {string} selector @returns {HTMLElement[]} */
export function htmlElements(root, selector) {
  return /** @type {HTMLElement[]} */ ([...root.querySelectorAll(selector)]);
}

/** @param {ParentNode} root @returns {(HTMLElement | SVGElement)[]} */
export function contentElements(root) {
  return /** @type {(HTMLElement | SVGElement)[]} */ ([...root.querySelectorAll("*")]);
}

/** @param {ParentNode} root @param {string} selector @returns {HTMLDetailsElement | null} */
export function detailsElement(root, selector) {
  return /** @type {HTMLDetailsElement | null} */ (root.querySelector(selector));
}

/** @param {ParentNode} root @param {string} selector @returns {HTMLFormElement | null} */
export function formElement(root, selector) {
  return /** @type {HTMLFormElement | null} */ (root.querySelector(selector));
}

/** @param {ParentNode} root @param {string} selector @returns {HTMLImageElement[]} */
export function imageElements(root, selector) {
  return /** @type {HTMLImageElement[]} */ ([...root.querySelectorAll(selector)]);
}

/** @param {HTMLElement} element @returns {HTMLElement} */
export function cloneElement(element) {
  return /** @type {HTMLElement} */ (element.cloneNode(true));
}

/** @returns {Set<Animation>} */
export function animationSet() {
  return new Set();
}

/** @param {EventTarget | null} target @param {string} selector @returns {HTMLElement | null} */
export function closestElement(target, selector) {
  return /** @type {HTMLElement | null} */ (target?.["closest"]?.(selector) || null);
}

/** @param {Node} root @param {EventTarget | null} target */
export function containsTarget(root, target) {
  return root.contains(/** @type {Node | null} */ (target));
}

/** @param {ParentNode} root @param {string} selector @returns {HTMLDetailsElement[]} */
export function detailsElements(root, selector) {
  return /** @type {HTMLDetailsElement[]} */ ([...root.querySelectorAll(selector)]);
}

/** @param {Element} element @returns {HTMLElement} */
export function observedElement(element) {
  return /** @type {HTMLElement} */ (element);
}

/** @param {Element} element @returns {HTMLImageElement} */
export function observedImage(element) {
  return /** @type {HTMLImageElement} */ (element);
}

/** @param {EventTarget | null} target @param {string} selector @param {boolean} fallback */
export function matchesTarget(target, selector, fallback = false) {
  return target?.["matches"] ? target["matches"](selector) : fallback;
}
