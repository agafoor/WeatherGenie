"use client";

import { Trash2, FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Document } from "@/types/database";

const statusConfig = {
  pending: { icon: Loader2, color: "bg-yellow-100 text-yellow-800", animate: true },
  processing: { icon: Loader2, color: "bg-blue-100 text-blue-800", animate: true },
  ready: { icon: CheckCircle2, color: "bg-green-100 text-green-800", animate: false },
  error: { icon: AlertCircle, color: "bg-red-100 text-red-800", animate: false },
};

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No documents uploaded yet. Upload your first weather research document above.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Chunks</TableHead>
          <TableHead>Uploaded</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => {
          const status = statusConfig[doc.status];
          const StatusIcon = status.icon;

          return (
            <TableRow key={doc.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate max-w-[200px]">
                    {doc.title}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs uppercase">
                  {doc.file_type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={`text-xs gap-1 ${status.color}`}>
                  <StatusIcon
                    className={`h-3 w-3 ${status.animate ? "animate-spin" : ""}`}
                  />
                  {doc.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{doc.chunk_count}</TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {new Date(doc.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onDelete(doc.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
