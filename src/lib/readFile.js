import { File } from "expo-file-system";

// Read a picked local file as a Base64 string.
//
// DocumentPicker is called with copyToCacheDirectory: true, so on both platforms
// the file is copied into the app's own cache and `asset.uri` is a sandbox
// `file://` path. SDK 57's scoped File API can read anything inside the sandbox,
// so that is the primary path. As a safety net for URIs that arrive in another
// shape, we fall back to the networking layer, which can pull a local URI into a
// Blob. No storage permission is involved — picking the file grants access.
export async function readAsBase64(uri) {
  const errors = [];

  // 1) Scoped File API — reads the cache copy the picker made for us.
  try {
    const value = await new File(uri).base64();
    if (value) return value;
    errors.push("file: empty result");
  } catch (e) {
    errors.push(`file: ${e?.message || e}`);
  }

  // 2) Networking layer fallback — handles content:// and other local URIs.
  try {
    return await blobToBase64(uri);
  } catch (e) {
    errors.push(`blob: ${e?.message || e}`);
  }

  const scheme = String(uri).split(":")[0];
  throw new Error(`[${scheme}] ${errors.join(" | ")}`);
}

function blobToBase64(uri) {
  return new Promise((resolve, reject) => {
    // XMLHttpRequest reads the local URI into a Blob; FileReader turns that Blob
    // into a base64 data URL. This avoids depending on Response.blob().
    const xhr = new XMLHttpRequest();
    xhr.responseType = "blob";
    xhr.onerror = () => reject(new Error("network read failed"));
    xhr.onload = () => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error || new Error("FileReader failed"));
      reader.onload = () => {
        const result = String(reader.result);
        const comma = result.indexOf(",");
        resolve(comma >= 0 ? result.slice(comma + 1) : result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open("GET", uri);
    xhr.send();
  });
}
