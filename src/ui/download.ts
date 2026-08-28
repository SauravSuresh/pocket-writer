import { zipSync, strToU8 } from "fflate";
export function download(name: string, content: string | Uint8Array, type = "text/plain") {
  const blob = new Blob([content as BlobPart], { type }); const a = document.createElement("a"); // ponytail: TS lib dom's Uint8Array<ArrayBufferLike> vs BlobPart mismatch (fflate output), cast is safe
  a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
export function downloadZip(name: string, files: { path: string; content: string }[]) {
  download(name, zipSync(Object.fromEntries(files.map(f => [f.path, strToU8(f.content)]))), "application/zip");
}
