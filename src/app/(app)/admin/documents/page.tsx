"use client";

import { DocumentUploader } from "@/components/admin/DocumentUploader";
import { DocumentList } from "@/components/admin/DocumentList";
import { useDocuments } from "@/hooks/useDocuments";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentsPage() {
  const { documents, loading, deleteDocument, refresh } = useDocuments();

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Knowledge Base</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Upload weather research documents to enhance the chatbot&apos;s knowledge.
      </p>

      <DocumentUploader onUploadComplete={refresh} />

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Documents</h2>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <DocumentList documents={documents} onDelete={deleteDocument} />
        )}
      </div>
    </div>
  );
}
