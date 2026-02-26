"use client";

import { Button } from "@/components/ui/button";
import { deleteJob } from "@/app/actions/jobs";
import { useTransition } from "react";
import { useState } from "react";

export function DeleteJobButton({ jobId }: { jobId: string }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        await deleteJob(jobId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete job");
        setShowConfirm(false);
      }
    });
  };

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          {isPending ? "Deleting..." : "Confirm Delete"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setShowConfirm(false);
            setError(null);
          }}
          disabled={isPending}
        >
          Cancel
        </Button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setShowConfirm(true)}
      disabled={isPending}
    >
      Delete Job
    </Button>
  );
}
