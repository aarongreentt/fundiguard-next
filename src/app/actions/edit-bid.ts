"use server";

import { updateBid } from "@/app/actions/bids";

export async function handleUpdateBid(bidId: string, formData: FormData) {
  await updateBid(bidId, formData);
}
