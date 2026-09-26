export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.error || "Upload failed");
  }
  return (await res.json()).url;
}