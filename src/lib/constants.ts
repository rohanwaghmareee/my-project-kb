export const BIRTHDAY_GIRL = "Khushi";

export const TULIP_COLORS = {
  pink: "#ff6fa5",
  red: "#e63b5a",
  yellow: "#ffd54a",
  purple: "#b57bee",
  white: "#fff4f7",
  orange: "#ff9a4d",
} as const;

export type TulipColor = keyof typeof TULIP_COLORS;
export const TULIP_COLOR_KEYS = Object.keys(TULIP_COLORS) as TulipColor[];

export function isTulipColor(value: unknown): value is TulipColor {
  return typeof value === "string" && value in TULIP_COLORS;
}

/** Everything in the fairy land that reacts and counts as a discovery. */
export const DISCOVERY_ITEMS = [
  { key: "bunny", label: "Bunny", icon: "🐰" },
  { key: "deer", label: "Deer", icon: "🦌" },
  { key: "fox", label: "Fox", icon: "🦊" },
  { key: "unicorn", label: "Unicorn", icon: "🦄" },
  { key: "duck", label: "Ducks", icon: "🦆" },
  { key: "swan", label: "Swan", icon: "🦢" },
  { key: "frog", label: "Frog", icon: "🐸" },
  { key: "butterfly", label: "Butterfly", icon: "🦋" },
  { key: "fairy", label: "Fairy", icon: "🧚" },
  { key: "tulip", label: "Tulips", icon: "🌷" },
  { key: "tree", label: "Trees", icon: "🌳" },
  { key: "mushroom", label: "Mushroom", icon: "🍄" },
  { key: "waterfall", label: "Waterfall", icon: "💦" },
  { key: "gift", label: "Gifts", icon: "🎁" },
  { key: "cake", label: "Cake", icon: "🎂" },
  { key: "balloon", label: "Balloons", icon: "🎈" },
  { key: "castle", label: "Castle", icon: "🏰" },
  { key: "ring", label: "The Ring", icon: "💍" },
] as const;

export type DiscoveryKey = (typeof DISCOVERY_ITEMS)[number]["key"];
export const DISCOVERY_KEYS = DISCOVERY_ITEMS.map((i) => i.key) as DiscoveryKey[];

export function isDiscoveryKey(value: unknown): value is DiscoveryKey {
  return typeof value === "string" && (DISCOVERY_KEYS as string[]).includes(value);
}

export type WishDTO = {
  id: number;
  name: string;
  message: string;
  color: TulipColor;
  createdAt: string;
};
