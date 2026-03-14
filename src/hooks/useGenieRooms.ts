"use client";

import { useState, useEffect, useCallback } from "react";
import type { GenieRoom } from "@/types/database";
import { toast } from "sonner";

export function useGenieRooms() {
  const [rooms, setRooms] = useState<GenieRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    const res = await fetch("/api/genie/rooms");
    if (res.ok) {
      setRooms(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  async function addRoom(data: Partial<GenieRoom>) {
    const res = await fetch("/api/genie/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Genie room added");
      fetchRooms();
    } else {
      toast.error("Failed to add room");
    }
  }

  async function updateRoom(id: string, data: Partial<GenieRoom>) {
    const res = await fetch(`/api/genie/rooms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Genie room updated");
      fetchRooms();
    } else {
      toast.error("Failed to update room");
    }
  }

  async function deleteRoom(id: string) {
    const res = await fetch(`/api/genie/rooms/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRooms((prev) => prev.filter((r) => r.id !== id));
      toast.success("Genie room deleted");
    } else {
      toast.error("Failed to delete room");
    }
  }

  return { rooms, loading, addRoom, updateRoom, deleteRoom, refresh: fetchRooms };
}
