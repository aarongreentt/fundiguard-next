"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { handleUpdateBid } from "@/app/actions/edit-bid";
import { useTransition } from "react";
import { useState } from "react";

export function EditBidForm({ bid, onCancel }: { bid: any; onCancel: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await handleUpdateBid(bid.id, formData);
        onCancel();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update bid");
      }
    });
  };

  return (
    <form action={handleSubmit} className="grid gap-3 p-3 border rounded-md bg-muted/30">
      {error && (
        <div className="rounded-md bg-red-50 text-sm text-red-700 p-2">
          {error}
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="amount">Amount (KSh)</Label>
        <Input id="amount" name="amount" defaultValue={bid.amount ?? ""} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="estimatedDays">Estimated days</Label>
        <Input id="estimatedDays" name="estimatedDays" defaultValue={bid.estimated_days ?? ""} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={3} defaultValue={bid.message ?? ""} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={isPending}>Cancel</Button>
      </div>
    </form>
  );
}
