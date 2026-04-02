export interface FlowerInstance {
  id: string;
  typeId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity?: number;
  note?: string;
  customImageUrl?: string;
  zIndex?: number;
}

export interface ButterflyInstance {
  id: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  color: string;
  speed: number;
}

export interface BouquetState {
  flowers: FlowerInstance[];
  butterflies?: ButterflyInstance[];
  letter: {
    to: string;
    from: string;
    content: string;
    unlockAt?: string; // ISO string
  };
  voiceUrl?: string;
  styleId: string;
  revealConfig?: {
    title: string;
    subtitle: string;
    buttonText?: string;
    icon?: "mail" | "heart" | "gift" | "sparkles";
  };
}

export interface FlowerType {
  id: string;
  name: string;
  color: string;
  path: string;
  imageUrl?: string;
}

export interface BouquetStyle {
  id: string;
  name: string;
  bgGradient: string;
  bgPattern: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  secondaryBg: string;
  secondaryText: string;
}
