import type * as THREE from "three";

/** The animated detail in front of each storefront. Add a new one in shops.ts. */
export type ShopKind =
  | "barber"
  | "gym"
  | "garage"
  | "restaurant"
  | "beauty"
  | "dental"
  | "realestate"
  | "wedding"
  | "travel"
  | "empty";

export type ArchStyle = "round" | "horseshoe" | "pointed" | "square";

/** What the 3D street needs to know about one storefront. */
export type ShopSpec = {
  slug: string;
  sign: string; // neon sign text
  kind: ShopKind;
  arch: ArchStyle;
  neon: string; // neon colour
  accent: string; // second brand colour (details, awning)
  interiorTop: string;
  interiorBottom: string;
  shutter?: string; // colour of the upper floor shutters on this building
};

export type ShopInfo = {
  index: number;
  slug: string;
  side: -1 | 0 | 1; // -1 left, 1 right, 0 end of the street (faces the camera)
  /** World position of the centre of the storefront opening, at eye height. */
  door: THREE.Vector3;
  /** Unit vector pointing from the facade towards the street. */
  normal: THREE.Vector3;
  /** Point in front of the sign, used to aim the camera. */
  focus: THREE.Vector3;
};

export type StreetFrame = {
  time: number;
  dt: number;
  /** 0..1 lights switching on after the loader. */
  intro: number;
  /** Continuous position along the street: 0 = entrance, i + 1 = shop i. */
  t: number;
  /** Shop under the pointer, -1 when none. */
  hover: number;
  /** Pointer position in normalised device coordinates (-1..1), or null. */
  pointer: { x: number; y: number } | null;
  /** 0..1 lights switching off (footer). */
  dim: number;
};

export type StreetFonts = { display: string; mono: string };
