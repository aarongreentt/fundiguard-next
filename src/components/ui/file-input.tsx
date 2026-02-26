"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FileInput({ name, multiple = false }: { name: string; multiple?: boolean }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>Images</Label>
      <Input id={name} name={name} type="file" multiple={multiple} accept="image/*" />
      <p className="text-xs text-muted-foreground">
        {multiple ? "Select one or more images." : "Select an image."}
      </p>
    </div>
  );
}
