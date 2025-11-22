/**
 * Blend a color with white
 * @param {string} color - Hex color string (e.g., '#FF6B6B')
 * @param {number} ratio - Blend ratio (0 = full color, 1 = full white)
 * @returns {string} RGB color string
 */
export const blendWithWhite = (color, ratio) => {
  // Parse hex color
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Blend with white (255, 255, 255)
  const blendedR = Math.round(r + (255 - r) * ratio);
  const blendedG = Math.round(g + (255 - g) * ratio);
  const blendedB = Math.round(b + (255 - b) * ratio);
  
  return `rgb(${blendedR}, ${blendedG}, ${blendedB})`;
};
