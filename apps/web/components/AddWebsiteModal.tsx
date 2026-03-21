"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LucidePlus, LucideLoader2, LucideGlobe } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface AddWebsiteModalProps {
  onSuccess: () => void;
}

const REGIONS = [
  { id: "US", label: "US" },
  { id: "EU", label: "EU" },
  { id: "INDIA", label: "IND" }
];

export function AddWebsiteModal({ onSuccess }: AddWebsiteModalProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRegionChange = (regionId: string) => {
    setSelectedRegions((prev) =>
      prev.includes(regionId)
        ? prev.filter((id) => id !== regionId)
        : [...prev, regionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRegions.length === 0) {
      toast.error("Please select at least one region.");
      return;
    }

    setLoading(true);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(process.env.NEXT_PUBLIC_API_URL + "/add-website", 
        { url, regions: selectedRegions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUrl("");
      setSelectedRegions([]);
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add website");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 bg-primary text-primary-foreground font-semibold px-6 h-11">
          <LucidePlus className="mr-2 h-5 w-5" />
          Add Website
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-border bg-background shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Add Website</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter a URL and select regions to start monitoring.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="url" className="text-sm font-semibold ml-1">Website URL</Label>
            <div className="relative">
              <LucideGlobe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-border focus-visible:ring-primary"
              />
            </div>
          </div>
          <div className="grid gap-3">
            <Label className="text-sm font-semibold ml-1">Monitoring Regions</Label>
            <div className="flex flex-wrap gap-4 px-1">
              {REGIONS.map((region) => (
                <div key={region.id} className="flex items-center space-x-2 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 rounded-lg border border-border">
                  <Checkbox
                    id={region.id}
                    checked={selectedRegions.includes(region.id)}
                    onCheckedChange={() => handleRegionChange(region.id)}
                  />
                  <label
                    htmlFor={region.id}
                    className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {region.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-11 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Start Monitoring"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
