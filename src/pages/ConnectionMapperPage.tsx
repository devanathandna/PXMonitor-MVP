import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, Shield, RefreshCw, Globe, List, MapPin, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlobeVisualization from "@/components/dashboard/Globe";

interface ConnectionInfo {
  pid: number;
  name: string;
  remoteAddress: string;
  remotePort: number;
  hostname: string;
  country: string;
  lat?: number;
  lng?: number;
}

interface ConnectionResponse {
  connections: ConnectionInfo[];
  devicePublicIP: string | null;
}

interface DeviceLocation {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string; // "lat,lng" format
}

interface GroupedConnection {
  pid: number;
  name: string;
  count: number;
  connections: Omit<ConnectionInfo, 'pid' | 'name'>[];
}

export default function ConnectionMapperPage() {
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [devicePublicIP, setDevicePublicIP] = useState<string | null>(null);
  const [deviceLocation, setDeviceLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>("Ready to analyze.");
  const [isScanning, setIsScanning] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [explainingHostname, setExplainingHostname] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  
  const groupedConnections = useMemo(() => {
    const groups: Record<string, GroupedConnection> = {};
    connections.forEach(conn => {
      const key = `${conn.name}-${conn.pid}`;
      if (!groups[key]) {
        groups[key] = {
          pid: conn.pid,
          name: conn.name,
          count: 0,
          connections: [],
        };
      }
      groups[key].count++;
      groups[key].connections.push({
        remoteAddress: conn.remoteAddress,
        remotePort: conn.remotePort,
        hostname: conn.hostname,
        country: conn.country,
      });
    });
    return Object.values(groups).sort((a, b) => b.count - a.count);
  }, [connections]);

  // Transform connections for Globe component - only public IPs with valid coordinates
  const globeConnections = useMemo(() => {
    return connections
      .filter(conn => 
        conn.lat && 
        conn.lng && 
        conn.country !== 'N/A' && 
        conn.country !== 'Local'
      )
      .map(conn => ({
        ip: conn.remoteAddress,
        hostname: conn.hostname,
        country: conn.country,
        lat: conn.lat!,
        lng: conn.lng!,
        processName: conn.name,
        port: conn.remotePort
      }));
  }, [connections]);

  // Fetch device location from ipinfo.io
  const fetchDeviceLocation = async (ip: string) => {
    try {
      const response = await fetch(`https://ipinfo.io/${ip}/json`);
      if (response.ok) {
        const data: DeviceLocation = await response.json();
        if (data.loc) {
          const [lat, lng] = data.loc.split(',').map(Number);
          setDeviceLocation({ lat, lng });
        }
      }
    } catch (err) {
      console.error("Failed to fetch device location:", err);
    }
  };


  useEffect(() => {
    const fetchConnections = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch("http://localhost:3001/api/connections");
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.statusText}`);
        }
        const data: ConnectionResponse = await res.json();
        setConnections(data.connections || []);
        setDevicePublicIP(data.devicePublicIP);
        
        // Fetch device location if we have a public IP
        if (data.devicePublicIP) {
          await fetchDeviceLocation(data.devicePublicIP);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections(); 
    const interval = setInterval(() => {
      fetchConnections();
    }, 600000); 
    
    return () => clearInterval(interval); // Cleanup on component unmount
  }, [refreshTrigger]); // Refresh every 15 seconds
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1); // Increment the trigger to re-run useEffect
  };

  const handleExplainConnection = async (hostname: string) => {
    if (!hostname || hostname === 'N/A') {
      return;
    }
    // Set the current hostname to show the popover with a loading message
    setExplainingHostname(hostname);
    setExplanation("AI is analyzing this connection...");

    try {
      const res = await fetch("/api/connections/explain", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostname }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get explanation.');
      
      // Update the state with the AI's response
      setExplanation(data.explanation);

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      setExplanation(`Sorry, an error occurred: ${errorMessage}`);
    }
  };

  const handleSecurityScan = async () => {
    if (connections.length === 0) {
      setAiSummary("No connections to analyze.");
      return;
    }
    setIsScanning(true);
    setAiSummary("AI is scanning your connections for security risks...");
    try {
      const res = await fetch("/api/connections/security-scan", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connections }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get analysis.');
      setAiSummary(data.analysis);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      setAiSummary(`An error occurred during the scan: ${errorMessage}`);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="p-4 md:p-8 overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle>Live Network Footprints</CardTitle>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Interactive map of active connections with built-in security insights.
            </p>
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh Now'}
            </Button>
            <Button onClick={handleSecurityScan} size="sm" disabled={isScanning}>
              <Shield className="h-4 w-4 mr-2" />
              {isScanning ? 'Scanning...' : 'Analyze Security'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Shield className="h-4 w-4" />
            <AlertTitle>AI Security Analysis</AlertTitle>
            <AlertDescription>{aiSummary}</AlertDescription>
          </Alert>
          
          {isLoading && <p>Loading active connections...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          
          {!isLoading && !error && (
            <Tabs defaultValue="map" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  World Map View
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Detailed List
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="map" className="mt-4">
                <div className="space-y-4">
                  {deviceLocation ? (
                    <>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
                        <MapPin className="w-4 h-4" />
                        <span>
                          Showing {globeConnections.length} active public connections from your device
                          {devicePublicIP && <span className="ml-2 font-mono text-blue-600">({devicePublicIP})</span>}
                        </span>
                      </div>
                      <div 
                        className="relative w-full"
                        style={{ 
                          height: '600px',
                          touchAction: 'none',
                          pointerEvents: 'auto',
                          isolation: 'isolate'
                        }}
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                      >
                        <GlobeVisualization 
                          connections={globeConnections}
                          deviceIP={devicePublicIP || undefined}
                          deviceLat={deviceLocation.lat}
                          deviceLng={deviceLocation.lng}
                          height={600}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-lg">
                      <div className="text-center space-y-2">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                        <p className="text-sm text-muted-foreground">Fetching device location...</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="list" className="mt-4">
                <Accordion type="single" collapsible className="w-full">
                  {groupedConnections.map(({ name, pid, count, connections: connList }) => (
                    <AccordionItem value={`item-${pid}`} key={pid}>
                      <AccordionTrigger>
                        <div className="flex justify-between w-full pr-4">
                          <span>{name} ({pid})</span>
                          <span className="text-sm text-muted-foreground">{count} connections</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Remote Address</TableHead>
                              <TableHead>Hostname</TableHead>
                              <TableHead>Country</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {connList.map((conn, index) => (
                              <TableRow key={index}>
                                <TableCell>{conn.remoteAddress}:{conn.remotePort}</TableCell>
                                <TableCell className="font-mono text-xs">{conn.hostname}</TableCell>
                                <TableCell>{conn.country}</TableCell>
                                <TableCell className="text-right space-x-2">
                                  {/* --- THIS IS THE UPDATED POPOVER UI --- */}
                                <Popover onOpenChange={(isOpen) => !isOpen && setExplainingHostname(null)}>
                                  <PopoverTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => handleExplainConnection(conn.hostname)}
                                      disabled={!conn.hostname || conn.hostname === 'N/A'}
                                    >
                                      <Info className="h-4 w-4" />
                                    </Button>
                                  </PopoverTrigger>
                                  {/* Show the popover only for the hostname we are currently explaining */}
                                  {explainingHostname === conn.hostname && (
                                    <PopoverContent className="w-80">
                                      <div className="grid gap-4">
                                        <div className="space-y-2">
                                          <h4 className="font-medium leading-none">AI Explanation</h4>
                                          <p className="text-sm text-muted-foreground">
                                            {explanation}
                                          </p>
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  )}
                                </Popover>
                              </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}