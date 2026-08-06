// The wire format shared by the Send and Receive screens.
//
// A file is read as Base64, split into fixed-size chunks, and each chunk is
// wrapped in a small JSON frame that also carries the file name, mime type and
// the total frame count so the receiver can rebuild the file with no other
// channel. Every frame is self-describing, so the receiver can join a transfer
// that is already looping.
//
// Keys are single letters (i, t, n, y, d) to keep per-frame overhead small, so
// more of each QR code's capacity carries actual file data. A larger chunk plus
// this slimmer envelope means fewer total frames, which is the main lever on how
// quickly a file gets across.

export const CHUNK_SIZE = 1000; // Base64 characters per frame.
export const SIZE_WARN_BYTES = 150 * 1024; // Practical ceiling for this approach.

// Split a Base64 string into an ordered array of frame objects (short keys).
export function buildFrames(base64, name, type) {
  const chunks = [];
  for (let i = 0; i < base64.length; i += CHUNK_SIZE) {
    chunks.push(base64.slice(i, i + CHUNK_SIZE));
  }
  const t = chunks.length;
  return chunks.map((d, i) => ({ i, t, n: name, y: type, d }));
}

// Parse a scanned string back into a frame, or return null if it is not one of
// ours. Normalizes the short keys back to descriptive names so the screens stay
// readable. Keeps the receiver resilient to stray QR codes in view.
export function parseFrame(raw) {
  try {
    const f = JSON.parse(raw);
    if (
      typeof f.i === "number" &&
      typeof f.t === "number" &&
      typeof f.d === "string" &&
      f.t > 0 &&
      f.i >= 0 &&
      f.i < f.t
    ) {
      return { index: f.i, total: f.t, name: f.n, type: f.y, data: f.d };
    }
  } catch {
    // Not JSON, or not our shape — ignore it.
  }
  return null;
}

export function formatBytes(bytes) {
  if (bytes == null) return "unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
