import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processDocument } from "@/lib/rag/pipeline";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const fileName = file.name;
  const fileType = fileName.split(".").pop()?.toLowerCase() || "";

  if (!["pdf", "txt", "md", "docx"].includes(fileType)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use PDF, TXT, MD, or DOCX." },
      { status: 400 }
    );
  }

  // Upload to storage
  const filePath = `${user.id}/${Date.now()}-${fileName}`;
  const { error: uploadError } = await admin.storage
    .from("documents")
    .upload(filePath, file);

  if (uploadError) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 500 }
    );
  }

  // Create document record
  const { data: doc, error: insertError } = await admin
    .from("documents")
    .insert({
      title: fileName.replace(/\.[^.]+$/, ""),
      source: fileName,
      file_path: filePath,
      file_type: fileType,
      file_size: file.size,
      uploaded_by: user.id,
      status: "pending",
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    );
  }

  // Process document in background (non-blocking)
  processDocument(doc.id, filePath, fileType, admin).catch((err) => {
    console.error("Document processing failed:", err);
  });

  return NextResponse.json(doc);
}
