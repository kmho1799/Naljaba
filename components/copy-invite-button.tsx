"use client";

import { useState } from "react";
import { Check, LinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CopyInviteButton({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url = `${window.location.origin}/invite/${inviteCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleClick}>
      {copied ? <Check className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
      {copied ? "복사됨!" : "초대"}
    </Button>
  );
}
