// How far (0–1) the pattern is tinted from the background towards the text
// colour. Kept tiny so it stays in the background.
export const STRENGTH = { dark: 0.05, light: 0.08 };
// Dev-only: the strength panel dispatches this event to tune values live.
export const STRENGTH_EVENT = "shader-strength";
