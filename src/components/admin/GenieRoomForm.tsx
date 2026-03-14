"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GenieRoom } from "@/types/database";

interface GenieRoomFormProps {
  room?: GenieRoom | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<GenieRoom>) => Promise<void>;
}

export function GenieRoomForm({ room, open, onClose, onSave }: GenieRoomFormProps) {
  const [name, setName] = useState(room?.name || "");
  const [spaceId, setSpaceId] = useState(room?.space_id || "");
  const [host, setHost] = useState(
    room?.databricks_host || process.env.NEXT_PUBLIC_DATABRICKS_HOST || ""
  );
  const [description, setDescription] = useState(room?.description || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      name,
      space_id: spaceId,
      databricks_host: host,
      description,
    });
    setSaving(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{room ? "Edit" : "Add"} Genie Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Room Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="US Weather Data"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Space ID</label>
            <Input
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              placeholder="Databricks Genie Space ID"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Databricks Host URL</label>
            <Input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="https://dbc-xxxxx.cloud.databricks.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What data is available in this room?"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {room ? "Update" : "Add"} Room
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
