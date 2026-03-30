export interface FlowerInstance {
  id: string;
  typeId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  note?: string;
}

export interface BouquetState {
  flowers: FlowerInstance[];
  letter: {
    to: string;
    from: string;
    content: string;
    unlockAt?: string; // ISO string
  };
  styleId: string;
}

export interface FlowerType {
  id: string;
  name: string;
  color: string;
  path: string;
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
