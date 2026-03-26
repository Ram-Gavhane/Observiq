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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  LucidePlus, 
  LucideLoader2, 
  LucideGlobe, 
  LucideActivity, 
  LucideShield, 
  LucideDatabase, 
  LucideArrowLeft,
  LucideArrowRight,
  LucideCheck
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddMonitorModalProps {
  onSuccess: () => void;
}

const REGIONS = [
  { id: "US", label: "US" },
  { id: "EU", label: "EU" },
  { id: "INDIA", label: "IND" }
];

const MONITOR_TYPES = [
  { id: "HTTP", label: "HTTP(s)", icon: LucideGlobe, description: "Monitor websites and APIs" },
  { id: "PING", label: "Ping", icon: LucideActivity, description: "Check network connectivity" },
  { id: "DNS", label: "DNS", icon: LucideDatabase, description: "Verify DNS records" },
  { id: "SSL", label: "SSL", icon: LucideShield, description: "Check SSL certificate expiry" }
];

const DNS_RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "NS", "PTR", "SOA", "SRV", "TXT"];

export function AddMonitorModal({ onSuccess }: AddMonitorModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [type, setType] = useState("HTTP");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Type specific config
  const [httpMethod, setHttpMethod] = useState("GET");
  const [httpStatusCodes, setHttpStatusCodes] = useState("200-299");
  const [httpTimeout, setHttpTimeout] = useState(30000);
  const [httpFollowRedirects, setHttpFollowRedirects] = useState(true);

  const [pingPacketCount, setPingPacketCount] = useState(5);
  const [pingTimeout, setPingTimeout] = useState(5000);

  const [dnsRecordType, setDnsRecordType] = useState("A");
  const [dnsExpectedValues, setDnsExpectedValues] = useState("");
  const [dnsResolver, setDnsResolver] = useState("");

  const [sslPort, setSslPort] = useState(443);
  const [sslExpiryThreshold, setSslExpiryThreshold] = useState(30);
  const [sslServerName, setSslServerName] = useState("");

  const handleRegionChange = (regionId: string) => {
    setSelectedRegions((prev) =>
      prev.includes(regionId)
        ? prev.filter((id) => id !== regionId)
        : [...prev, regionId]
    );
  };

  const resetForm = () => {
    setName("");
    setTarget("");
    setType("HTTP");
    setSelectedRegions([]);
    setStep(1);
    // Reset specific configs
    setHttpMethod("GET");
    setHttpStatusCodes("200-299");
    setHttpTimeout(30000);
    setHttpFollowRedirects(true);
    setPingPacketCount(5);
    setPingTimeout(5000);
    setDnsRecordType("A");
    setDnsExpectedValues("");
    setDnsResolver("");
    setSslPort(443);
    setSslExpiryThreshold(30);
    setSslServerName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRegions.length === 0) {
      toast.error("Please select at least one region.");
      return;
    }

    setLoading(true);

    const config: any = {};
    if (type === "HTTP") {
      config.method = httpMethod;
      config.expectedStatusCodes = httpStatusCodes.split(",").map(s => s.trim());
      config.timeoutMs = httpTimeout;
      config.followRedirects = httpFollowRedirects;
    } else if (type === "PING") {
      config.packetCount = pingPacketCount;
      config.timeoutMs = pingTimeout;
    } else if (type === "DNS") {
      config.recordType = dnsRecordType;
      config.expectedValues = dnsExpectedValues.split(",").map(v => v.trim());
      config.resolver = dnsResolver;
    } else if (type === "SSL") {
      config.port = sslPort;
      config.expiryThresholdDays = sslExpiryThreshold;
      config.serverName = sslServerName || target;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(process.env.NEXT_PUBLIC_API_URL + "/add-monitor", 
        { name, type, target, regions: selectedRegions, config },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      resetForm();
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add monitor");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) setStep(2);
  };

  const prevStep = () => {
    if (step === 2) setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="shadow-sm hover:shadow-md transition-all active:scale-95 bg-primary text-primary-foreground font-semibold px-4 h-9">
          <LucidePlus className="mr-2 h-4 w-4" />
          Add Monitor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] rounded-xl border-border bg-background shadow-2xl overflow-hidden p-0">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {step === 1 ? "Select Monitor Type" : `Configure ${type} Monitor`}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {step === 1 
                ? "Choose what you want to monitor today."
                : "Fill in the details to start monitoring."}
            </DialogDescription>
          </DialogHeader>

          {step === 1 ? (
            <div className="grid grid-cols-2 gap-4">
              {MONITOR_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setType(t.id);
                    nextStep();
                  }}
                  className={cn(
                    "flex flex-col items-start p-4 rounded-lg border text-left transition-all hover:border-primary/50 group",
                    type === t.id ? "border-primary bg-primary/5" : "border-border bg-muted/30"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-md flex items-center justify-center mb-3 transition-colors",
                    type === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/10"
                  )}>
                    <t.icon className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm mb-1">{t.label}</span>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {t.description}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-semibold ml-1">Friendly Name</Label>
                <div className="relative">
                  <LucideActivity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="My Service"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-border focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="target" className="text-sm font-semibold ml-1">
                  {type === "HTTP" || type === "SSL" ? "URL" : "Hostname / IP"}
                </Label>
                <div className="relative">
                  <LucideGlobe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                  <Input
                    id="target"
                    type="text"
                    placeholder={type === "HTTP" ? "https://example.com" : type === "SSL" ? "example.com" : "8.8.8.8"}
                    required
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-border focus-visible:ring-primary"
                  />
                </div>
              </div>

              {type === "HTTP" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold ml-1">HTTP Method</Label>
                    <Select value={httpMethod} onValueChange={setHttpMethod}>
                      <SelectTrigger className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold ml-1">Status Codes</Label>
                    <Input
                      placeholder="e.g. 200, 201"
                      value={httpStatusCodes}
                      onChange={(e) => setHttpStatusCodes(e.target.value)}
                      className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-border"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold ml-1">Timeout (ms)</Label>
                    <Input
                      type="number"
                      value={httpTimeout}
                      onChange={(e) => setHttpTimeout(parseInt(e.target.value))}
                      className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-border"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-6 ml-2">
                    <Checkbox
                      id="followRedirects"
                      checked={httpFollowRedirects}
                      onCheckedChange={(val) => setHttpFollowRedirects(!!val)}
                    />
                    <Label htmlFor="followRedirects" className="text-sm font-medium">Follow Redirects</Label>
                  </div>
                </div>
              )}

              {type === "PING" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold ml-1">Packet Count</Label>
                    <Input
                      type="number"
                      value={pingPacketCount}
                      onChange={(e) => setPingPacketCount(parseInt(e.target.value))}
                      className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-border"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold ml-1">Timeout (ms)</Label>
                    <Input
                      type="number"
                      value={pingTimeout}
                      onChange={(e) => setPingTimeout(parseInt(e.target.value))}
                      className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-border"
                    />
                  </div>
                </div>
              )}

              {type === "DNS" && (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold ml-1">Record Type</Label>
                      <Select value={dnsRecordType} onValueChange={setDnsRecordType}>
                        <SelectTrigger className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DNS_RECORD_TYPES.map(rt => (
                            <SelectItem key={rt} value={rt}>{rt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold ml-1">Expected Values</Label>
                      <Input
                        placeholder="e.g. 1.2.3.4, 5.6.7.8"
                        value={dnsExpectedValues}
                        onChange={(e) => setDnsExpectedValues(e.target.value)}
                        className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-border"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold ml-1">Resolver (Optional)</Label>
                    <Input
                      placeholder="e.g. 8.8.8.8"
                      value={dnsResolver}
                      onChange={(e) => setDnsResolver(e.target.value)}
                      className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-border"
                    />
                  </div>
                </div>
              )}

              {type === "SSL" && (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold ml-1">Port</Label>
                      <Input
                        type="number"
                        value={sslPort}
                        onChange={(e) => setSslPort(parseInt(e.target.value))}
                        className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-border"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold ml-1">Expiry Threshold (days)</Label>
                      <Input
                        type="number"
                        value={sslExpiryThreshold}
                        onChange={(e) => setSslExpiryThreshold(parseInt(e.target.value))}
                        className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-border"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold ml-1">Server Name (SNI)</Label>
                    <Input
                      placeholder="e.g. example.com"
                      value={sslServerName}
                      onChange={(e) => setSslServerName(e.target.value)}
                      className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-border"
                    />
                  </div>
                </div>
              )}

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
            </form>
          )}
        </div>

        <DialogFooter className="bg-zinc-50 dark:bg-zinc-900/50 p-6 border-t border-border">
          {step === 1 ? (
            <Button disabled className="w-full h-11 rounded-xl opacity-0">Next</Button>
          ) : (
            <div className="flex w-full gap-3">
              <Button 
                variant="outline" 
                onClick={prevStep}
                className="h-10 px-3 rounded-lg border-border"
              >
                <LucideArrowLeft className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex-1 h-10 rounded-lg font-bold transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <LucideCheck className="mr-2 h-4 w-4" />
                    Start Monitoring
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
