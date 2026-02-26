"use server";

import { updateBidStatus, deleteBid } from "@/app/actions/bids";

export async function handleAcceptBid(bidId: string) {
  await updateBidStatus(bidId, "accepted");
}

export async function handleRejectBid(bidId: string) {
  await updateBidStatus(bidId, "rejected");
}

export async function handleDeleteBid(bidId: string) {
  await deleteBid(bidId);
}
