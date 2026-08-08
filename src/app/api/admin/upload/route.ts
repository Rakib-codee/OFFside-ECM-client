import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { isDbConfigured, supabaseConfig, supabaseStorage } from "@/lib/supabase";

const BUCKET = "product-images";
const MAX_FILE_BYTES = 4 * 1024 * 1024;

/** Creates the public bucket on first use. */
async function ensureBucket(): Promise<boolean> {
  const probe = await supabaseStorage(`bucket/${BUCKET}`, { method: "GET" });
  if (probe.ok) {
    return true;
  }
  const created = await supabaseStorage("bucket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  if (!created.ok) {
    console.error("Bucket create failed:", created.status, await created.text());
  }
  return created.ok;
}

/** Admin: upload a product photo, returns its public URL. */
export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "Image must be 4MB or smaller" }, { status: 400 });
  }

  if (!(await ensureBucket())) {
    return NextResponse.json({ error: "Could not prepare the image bucket" }, { status: 502 });
  }

  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/\.{2,}/g, ".")
    .slice(-60);
  const path = `${Date.now().toString(36)}-${safeName}`;
  const upload = await supabaseStorage(`object/${BUCKET}/${path}`, {
    method: "POST",
    headers: { "Content-Type": file.type, "x-upsert": "true" },
    body: Buffer.from(await file.arrayBuffer()),
  });
  if (!upload.ok) {
    console.error("Upload failed:", upload.status, await upload.text());
    return NextResponse.json({ error: "Upload failed" }, { status: 502 });
  }

  const { url } = supabaseConfig()!;
  return NextResponse.json({ url: `${url}/storage/v1/object/public/${BUCKET}/${path}` });
}
