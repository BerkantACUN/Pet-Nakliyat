"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function NotificationBell() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function load() {
      const { count: c } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .is("read_at", null);
      if (mounted) setCount(c ?? 0);
    }

    void load();

    const channel = supabase
      .channel("notif-bell")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => void load(),
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Link
      href="/bildirimler"
      aria-label={`Bildirimler${count > 0 ? ` (${count} okunmamış)` : ""}`}
      className="relative grid size-9 place-items-center rounded-full border border-chalk bg-white transition hover:bg-powder"
    >
      <Bell className="size-4 text-obsidian" />
      {count > 0 ? (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-paw px-1 text-[10px] font-bold text-obsidian shadow-sm"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
