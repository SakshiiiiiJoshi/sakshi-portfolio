const svg =
  "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>" +
  "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/>" +
  "<feColorMatrix values='0 0 0 0 0.17  0 0 0 0 0.16  0 0 0 0 0.15  0 0 0 1 0'/></filter>" +
  "<rect width='100%' height='100%' filter='url(#n)'/></svg>";

// Module-level constant: the tile is rasterised once by the browser and repeated.
const tile = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

export function Grain() {
  return (
    <div
      aria-hidden="true"
      className="world-grain pointer-events-none fixed inset-0 z-50"
      style={{
        backgroundImage: tile,
        backgroundSize: "200px 200px",
        opacity: "var(--grain-opacity)",
      }}
    />
  );
}
