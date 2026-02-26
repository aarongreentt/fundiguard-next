"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { handleAcceptBid, handleRejectBid, handleDeleteBid } from "@/app/actions/bid-actions";
import { EditBidForm } from "@/components/bids/edit-bid-form";
import { useState } from "react";
import { useTransition } from "react";

export type BidRow = {
  id: string;
  pro_id: string;
  amount: number | null;
  estimated_days: number | null;
  message: string | null;
  status: string | null;
  created_at: string;
};

function canCancelBidFrontend(createdAt: string): boolean {
  const created = new Date(createdAt);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return created > oneHourAgo;
}

function getTimeRemaining(createdAt: string): string {
  const created = new Date(createdAt);
  const oneHourLater = new Date(created.getTime() + 60 * 60 * 1000);
  const now = new Date();
  const diff = oneHourLater.getTime() - now.getTime();
  
  if (diff <= 0) return "Expired";
  
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  return `${minutes}m ${seconds}s left`;
}

export function BidsList({ bids, isJobOwner, currentUserId }: { bids: BidRow[]; isJobOwner?: boolean; currentUserId?: string }) {
  const [editingBidId, setEditingBidId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAccept = (bidId: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await handleAcceptBid(bidId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to accept bid");
      }
    });
  };

  const handleReject = (bidId: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await handleRejectBid(bidId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reject bid");
      }
    });
  };

  const handleDelete = (bidId: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await handleDeleteBid(bidId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete bid");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bids</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {bids.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bids yet.</p>
        ) : (
          <div className="grid gap-3">
            {bids.map((b) => {
              const canCancel = canCancelBidFrontend(b.created_at);
              const timeRemaining = getTimeRemaining(b.created_at);
              
              return (
                <div key={b.id} className="rounded-md border p-3">
                  {editingBidId === b.id ? (
                    <EditBidForm
                      bid={b}
                      onCancel={() => setEditingBidId(null)}
                    />
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium">KSh {b.amount ?? "-"}</div>
                        <div className="text-xs text-muted-foreground">{b.status ?? ""}</div>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{b.estimated_days ?? "-"} days</div>
                      {b.message ? <p className="mt-2 text-sm">{b.message}</p> : null}
                      {isJobOwner && b.status === "pending" && (
                        <div className="mt-3 flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAccept(b.id)}
                            disabled={isPending}
                          >
                            {isPending ? "Accepting..." : "Accept"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleReject(b.id)}
                            disabled={isPending}
                          >
                            {isPending ? "Rejecting..." : "Reject"}
                          </Button>
                        </div>
                      )}
                      {currentUserId === b.pro_id && b.status === "pending" && (
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingBidId(b.id)} disabled={isPending}>Edit</Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDelete(b.id)}
                            disabled={isPending || !canCancel}
                            title={!canCancel ? "Can only cancel within 1 hour of posting" : ""}
                          >
                            {isPending ? "Deleting..." : !canCancel ? `Cancel (${timeRemaining})` : "Delete"}
                          </Button>
                        </div>
                      )}
                      {currentUserId === b.pro_id && b.status === "pending" && !canCancel && (
                        <p className="mt-2 text-xs text-orange-600">❌ Too late to cancel (can only cancel within 1 hour)</p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
