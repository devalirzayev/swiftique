function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Muted, refined palette that works on dark backgrounds
const PALETTES = [
  { bg: "#1e3a5f", fg: "#60a5fa" }, // deep blue / bright blue
  { bg: "#3b1f5e", fg: "#c084fc" }, // deep purple / lavender
  { bg: "#1a3c34", fg: "#4ade80" }, // deep green / mint
  { bg: "#4a1d2e", fg: "#f472b6" }, // deep rose / pink
  { bg: "#3d2b1a", fg: "#fb923c" }, // deep brown / orange
  { bg: "#1a2f3d", fg: "#22d3ee" }, // deep teal / cyan
  { bg: "#3d1a3d", fg: "#e879f9" }, // deep magenta / fuchsia
  { bg: "#2d3a1a", fg: "#a3e635" }, // deep olive / lime
];

interface HashimageProps {
  id: string;
  size?: number;
}

export function Hashimage({ id, size = 32 }: HashimageProps) {
  const hash = hashCode(id);
  const palette = PALETTES[hash % PALETTES.length];

  // Generate a 5x5 symmetric grid (only need to compute left half + center)
  // 5 rows, 3 columns (col 0, 1, 2) — col 3 mirrors col 1, col 4 mirrors col 0
  const bits: boolean[] = [];
  for (let i = 0; i < 15; i++) {
    bits.push(((hash >> (i % 30)) & 1) === 1 || (((hash * 13 + i * 7) >> 2) & 1) === 1);
  }

  const grid: boolean[][] = [];
  for (let row = 0; row < 5; row++) {
    const r = [
      bits[row * 3],
      bits[row * 3 + 1],
      bits[row * 3 + 2],
      bits[row * 3 + 1],
      bits[row * 3],
    ];
    grid.push(r);
  }

  const cellSize = size / 5;
  const r = size * 0.18; // border radius

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <rect width={size} height={size} rx={r} ry={r} fill={palette.bg} />
      {grid.map((row, y) =>
        row.map((filled, x) =>
          filled ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize + cellSize * 0.1}
              y={y * cellSize + cellSize * 0.1}
              width={cellSize * 0.8}
              height={cellSize * 0.8}
              rx={cellSize * 0.15}
              ry={cellSize * 0.15}
              fill={palette.fg}
              opacity={0.85}
            />
          ) : null
        )
      )}
    </svg>
  );
}
