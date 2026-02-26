"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTransition } from "react";
import { useState } from "react";

export function BidForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit bid");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Place a bid</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid gap-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (KSh)</Label>
            <Input id="amount" name="amount" type="number" min={1} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="estimatedDays">Estimated days</Label>
            <Input id="estimatedDays" name="estimatedDays" type="number" min={1} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" rows={4} placeholder="Describe how you will do the job..." />
          </div>

          <div className="flex items-center justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit bid"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
