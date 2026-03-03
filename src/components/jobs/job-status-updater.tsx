"use client";

import { useState } from "react";
import { updateJobStatus } from "@/app/actions/jobs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COLORS, SHADOWS, BORDER_RADIUS } from "@/lib/design-tokens";

type JobStatus = "open" | "in_progress" | "completed" | "cancelled" | "closed";

const STATUS_OPTIONS: { value: JobStatus; label: string; color: string }[] = [
  { value: "open", label: "Open", color: COLORS["trust-green"] },
  { value: "in_progress", label: "In Progress", color: "#2563eb" },
  { value: "completed", label: "Completed", color: COLORS["trust-green"] },
  { value: "cancelled", label: "Cancelled", color: "#d97706" },
];

interface JobStatusUpdaterProps {
  jobId: string;
  currentStatus: JobStatus;
}

export function JobStatusUpdater({
  jobId,
  currentStatus,
}: JobStatusUpdaterProps) {
  const [status, setStatus] = useState<JobStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const getStatusColor = (statusValue: JobStatus) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === statusValue);
    return option?.color || COLORS["text-muted"];
  };

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (newStatus === status) return;

    setIsUpdating(true);
    setMessage(null);

    try {
      console.log("[JobStatusUpdater] 📝 Updating status from", status, "to", newStatus);
      
      await updateJobStatus(jobId, newStatus);
      
      setStatus(newStatus);
      setMessage({
        type: "success",
        text: `Job status updated to ${newStatus}`,
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("[JobStatusUpdater] ❌ Error:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update status",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card style={{ boxShadow: SHADOWS.md, backgroundColor: "white" }}>
      <CardHeader style={{ borderBottom: `1px solid ${COLORS["border-light"]}` }}>
        <CardTitle style={{ color: COLORS["text-dark"] }}>
          Manage Job Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Current Status Display */}
          <div>
            <p className="text-sm mb-2" style={{ color: COLORS["text-muted"] }}>
              Current Status
            </p>
            <Badge
              style={{
                backgroundColor: getStatusColor(status),
                color: "white",
                fontSize: "14px",
                padding: "6px 12px",
              }}
            >
              {status.toUpperCase()}
            </Badge>
          </div>

          {/* Status Options */}
          <div>
            <p className="text-sm mb-3" style={{ color: COLORS["text-muted"] }}>
              Change Status To:
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  disabled={isUpdating || option.value === status}
                  variant={option.value === status ? "default" : "outline"}
                  style={{
                    backgroundColor:
                      option.value === status ? option.color : "transparent",
                    color:
                      option.value === status ? "white" : option.color,
                    borderColor: option.color,
                    opacity: isUpdating ? 0.6 : 1,
                  }}
                  className="disabled:cursor-not-allowed"
                >
                  {isUpdating && option.value === status ? "Updating..." : option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Status Message */}
          {message && (
            <div
              style={{
                backgroundColor:
                  message.type === "success"
                    ? `${COLORS["trust-green"]}15`
                    : "#fef2f2",
                borderRadius: BORDER_RADIUS.md,
                border: `1px solid ${
                  message.type === "success"
                    ? COLORS["trust-green"]
                    : "#fca5a5"
                }`,
                padding: "12px",
              }}
            >
              <p
                style={{
                  color:
                    message.type === "success"
                      ? COLORS["trust-green"]
                      : "#dc2626",
                  fontSize: "14px",
                }}
              >
                {message.type === "success" ? "✓ " : "✕ "}{message.text}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
