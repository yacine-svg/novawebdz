/* Street dimensions (metres). The street runs along -Z, the camera starts at +Z. */

export const HALF = 5.2; // facades sit at x = ±HALF
export const SIDEWALK = 1.5; // sidewalk width in front of each facade
export const BW = 11; // building width along the street
export const GROUND = 5; // ground floor height
export const FASCIA = 0.9; // band above the shops that carries the signs
export const FLOOR = 3; // upper floor height
export const START = -14; // z of the first storefront
export const UPPER = GROUND + FASCIA; // y where the upper floors begin

/** z of the building slot k (both sides share the same slots). */
export const slotZ = (k: number) => START - k * BW;

/** Shop i sits in slot i, alternating left / right. */
export const shopSide = (i: number): -1 | 1 => (i % 2 === 0 ? -1 : 1);

/** The street ends with a building facing the camera, after the last slot. */
export const endZ = (shopCount: number) => slotZ(shopCount - 1) - BW / 2 - 7;
