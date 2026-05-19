"use client";

import { useState } from "react";
import { toast } from "sonner";

interface AdminUuidCopyProps {
  uuid: string;
}

export function AdminUuidCopy({ uuid }: AdminUuidCopyProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(uuid);
      setCopied(true);
      toast.success("UUID kopyalandı");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopyalanamadı, manuel seç");
    }
  }

  return (
    <div className="mt-1 flex items-center gap-2">
      <code className="flex-1 select-all rounded-input border border-chalk bg-powder px-3 py-2 font-mono text-[13px] text-obsidian">
        {uuid}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-pill bg-obsidian px-4 py-2 text-[12px] font-medium text-eggshell hover:bg-obsidian/90"
      >
        {copied ? "Kopyalandı ✓" : "Kopyala"}
      </button>
    </div>
  );
}
