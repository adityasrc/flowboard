import Image from "next/image";

const PREVIEWS = [
  "/previews/preview-01.svg",
  "/previews/preview-02.svg",
  "/previews/preview-03.svg",
  "/previews/preview-04.svg",
  "/previews/preview-05.svg",
  "/previews/preview-06.svg",
  "/previews/preview-07.svg",
  "/previews/preview-08.svg",
  "/previews/preview-09.svg",
  "/previews/preview-10.svg",
  "/previews/preview-11.svg",
  "/previews/preview-12.svg",
];

function hashSlug(slug: string) {
  let h = 0;

  for (const ch of slug) {
    h = (h << 5) - h + ch.charCodeAt(0);
    h |= 0;
  }

  return h >>> 0;
}

export function CanvasThumbnail({ slug }: { slug: string }) {
  const src = PREVIEWS[hashSlug(slug) % PREVIEWS.length];

  return (
    <div className="relative h-full w-full select-none pointer-events-none">
      <Image
        src={src}
        alt={`Preview for ${slug}`}
        fill
        className="object-cover"
      />
    </div>
  );
}
