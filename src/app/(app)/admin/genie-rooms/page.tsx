"use client";

import { useState } from "react";
import { Plus, Database, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { GenieRoomForm } from "@/components/admin/GenieRoomForm";
import { useGenieRooms } from "@/hooks/useGenieRooms";
import type { GenieRoom } from "@/types/database";

export default function GenieRoomsPage() {
  const { rooms, loading, addRoom, updateRoom, deleteRoom } = useGenieRooms();
  const [formOpen, setFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<GenieRoom | null>(null);

  function handleEdit(room: GenieRoom) {
    setEditingRoom(room);
    setFormOpen(true);
  }

  async function handleSave(data: Partial<GenieRoom>) {
    if (editingRoom) {
      await updateRoom(editingRoom.id, data);
    } else {
      await addRoom(data);
    }
    setEditingRoom(null);
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Genie Rooms</h1>
          <p className="text-sm text-muted-foreground">
            Configure Databricks Genie rooms for data analytics queries.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingRoom(null);
            setFormOpen(true);
          }}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Room
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <Database className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p>No Genie rooms configured yet.</p>
          <p className="text-xs mt-1">
            Add a Databricks Genie room to enable data analytics queries.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{room.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {room.space_id}
                    </p>
                  </div>
                  <Badge
                    variant={room.is_active ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {room.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {room.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {room.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={room.is_active}
                      onCheckedChange={(checked) =>
                        updateRoom(room.id, { is_active: checked })
                      }
                    />
                    <span className="text-xs text-muted-foreground">
                      {room.is_active ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(room)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteRoom(room.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <GenieRoomForm
        room={editingRoom}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingRoom(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
