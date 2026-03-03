"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X } from "lucide-react";
import { COLORS, SHADOWS } from "@/lib/design-tokens";
import { createOrGetConversation } from "@/app/actions/messages";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Bidder {
  id: string;
  first_name: string;
  avatar_url: string | null;
}

interface Job {
  id: string;
  title: string;
  bids?: Array<{
    pro_id: string;
    pro: Bidder;
  }>;
  client?: Bidder;
  client_id?: string;
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  userRole: "client" | "fundi";
  recipientName?: string;
}

export function NewConversationModal({
  isOpen,
  onClose,
  jobs,
  userRole,
  recipientName,
}: NewConversationModalProps) {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<Bidder | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleStartConversation = async () => {
    if (!selectedJob) return;

    setIsLoading(true);
    try {
      let recipientId = "";
      
      if (userRole === "client" && selectedRecipient) {
        recipientId = selectedRecipient.id;
      } else if (userRole === "fundi") {
        // For fundi, get the client ID from the job
        const job = jobs.find((j) => j.id === selectedJob);
        if (job && job.client) {
          recipientId = job.client.id;
        }
      }

      if (!recipientId) throw new Error("No recipient selected");

      const conversation = await createOrGetConversation(selectedJob, recipientId);
      window.location.href = `/chat/${conversation.id}`;
    } catch (error) {
      console.error("Failed to start conversation:", error);
      setIsLoading(false);
    }
  };

  const currentJob = jobs.find((j) => j.id === selectedJob);
  const bidders = (currentJob?.bids || []).map((b) => b.pro) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card
        style={{
          boxShadow: SHADOWS.lg,
          backgroundColor: "white",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <CardHeader style={{ borderBottom: `1px solid ${COLORS["border-light"]}` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={24} style={{ color: COLORS["trust-green"] }} />
              <CardTitle style={{ color: COLORS["text-dark"] }}>New Conversation</CardTitle>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={isLoading}
            >
              <X size={20} style={{ color: COLORS["text-muted"] }} />
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {!selectedJob ? (
            <div className="space-y-2">
              <p style={{ color: COLORS["text-muted"] }} className="text-sm mb-4">
                {userRole === "client"
                  ? "Select a job to discuss with a fundi"
                  : "Select a job you've bid on to message the client"}
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {jobs.length === 0 ? (
                  <p
                    style={{ color: COLORS["text-muted"] }}
                    className="text-sm text-center py-4"
                  >
                    {userRole === "client"
                      ? "No jobs with bids yet"
                      : "You haven't bid on any jobs yet"}
                  </p>
                ) : (
                  jobs.map((job) => {
                    const bidderCount =
                      userRole === "client" ? (job.bids?.length || 0) : 1;
                    return (
                      <button
                        key={job.id}
                        onClick={() => setSelectedJob(job.id)}
                        className="w-full p-3 rounded border transition-all text-left hover:border-green-500 hover:bg-green-50"
                        style={{ borderColor: COLORS["border-light"] }}
                      >
                        <p className="font-medium" style={{ color: COLORS["text-dark"] }}>
                          {job.title}
                        </p>
                        <p style={{ color: COLORS["text-muted"] }} className="text-xs mt-1">
                          {bidderCount} {userRole === "client" ? "fundi" : "client"}
                          {bidderCount !== 1 ? "s" : ""}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setSelectedJob(null);
                  setSelectedRecipient(null);
                }}
                className="text-sm flex items-center gap-1"
                style={{ color: COLORS["trust-green"] }}
              >
                ← Back to jobs
              </button>

              <div>
                {userRole === "client" ? (
                  <>
                    <p style={{ color: COLORS["text-muted"] }} className="text-sm mb-2">
                      Select a fundi to message:
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {bidders.length === 0 ? (
                        <p style={{ color: COLORS["text-muted"] }} className="text-sm text-center py-4">
                          No fundis have bid on this job yet
                        </p>
                      ) : (
                        bidders.map((bidder) => (
                          <button
                            key={bidder.id}
                            onClick={() => setSelectedRecipient(bidder)}
                            className={`w-full p-3 rounded border transition-all flex items-center gap-2 text-left ${
                              selectedRecipient?.id === bidder.id
                                ? "border-green-500 bg-green-50"
                                : "hover:border-green-500 hover:bg-green-50"
                            }`}
                            style={{
                              borderColor:
                                selectedRecipient?.id === bidder.id
                                  ? COLORS["trust-green"]
                                  : COLORS["border-light"],
                            }}
                          >
                            {bidder.avatar_url ? (
                              <Image
                                src={bidder.avatar_url}
                                alt={bidder.first_name}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: COLORS["trust-green"] }}
                              >
                                {bidder.first_name[0]}
                              </div>
                            )}
                            <span style={{ color: COLORS["text-dark"] }}>{bidder.first_name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ color: COLORS["text-muted"] }} className="text-sm mb-2">
                      Message the client:
                    </p>
                    <div className="space-y-2">
                      {currentJob?.client ? (
                        <div
                          className="w-full p-3 rounded border flex items-center gap-2 bg-green-50"
                          style={{
                            borderColor: COLORS["trust-green"],
                          }}
                        >
                          {currentJob.client.avatar_url ? (
                            <Image
                              src={currentJob.client.avatar_url}
                              alt={currentJob.client.first_name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ backgroundColor: COLORS["trust-green"] }}
                            >
                              {currentJob.client.first_name[0]}
                            </div>
                          )}
                          <div>
                            <p style={{ color: COLORS["text-dark"] }} className="font-medium">
                              {currentJob.client.first_name}
                            </p>
                            <p style={{ color: COLORS["text-muted"] }} className="text-xs">
                              Job poster
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p style={{ color: COLORS["text-muted"] }} className="text-sm text-center py-4">
                          Unable to load client information
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <Button
                onClick={handleStartConversation}
                disabled={
                  userRole === "client" ? !selectedRecipient || isLoading : !selectedJob || isLoading
                }
                style={{
                  backgroundColor: COLORS["trust-green"],
                  color: "white",
                }}
                className="w-full"
              >
                {isLoading ? "Starting..." : "Start Conversation"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
