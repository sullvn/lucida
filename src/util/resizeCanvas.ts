/**
 * Resize canvas for Hi-DPI screens
 *
 * @param el Canvas HTML DOM element
 */
export function resizeCanvas(el: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1

  // Lookup size browser is displaying the canvas and
  // increase the natural size for Hi-DPI screens
  const width = Math.floor(el.clientWidth * dpr)
  const height = Math.floor(el.clientHeight * dpr)
  if (el.width === width && el.height === height) {
    return
  }

  el.width = width
  el.height = height
}
