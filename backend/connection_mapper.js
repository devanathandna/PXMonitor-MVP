import { execFile } from 'child_process';
import { reverse as reverseDns } from 'dns/promises';
import geoip from 'geoip-lite';
import https from 'https';

// A cache to avoid re-looking up IPs repeatedly, improving performance.
const ipCache = new Map();
let cachedPublicIP = null;
let publicIPLastFetched = 0;
const PUBLIC_IP_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check if an IP address is private/local
 */
function isPrivateIP(ip) {
  // IPv4 private ranges
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('127.')) return true;
  
  // 172.16.0.0 - 172.31.255.255
  const parts = ip.split('.');
  if (parts[0] === '172') {
    const second = parseInt(parts[1], 10);
    if (second >= 16 && second <= 31) return true;
  }
  
  // Link-local addresses
  if (ip.startsWith('169.254.')) return true;
  
  // IPv6 private/local
  if (ip === '::1' || ip.startsWith('fe80:') || ip.startsWith('fc00:') || ip.startsWith('fd00:')) return true;
  
  return false;
}

/**
 * Fetch device's public IP from ipinfo.io with caching
 */
async function getPublicIP() {
  const now = Date.now();
  
  // Return cached IP if still valid
  if (cachedPublicIP && (now - publicIPLastFetched) < PUBLIC_IP_CACHE_DURATION) {
    return cachedPublicIP;
  }
  
  return new Promise((resolve, reject) => {
    https.get('https://ipinfo.io/ip', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const ip = data.trim();
        cachedPublicIP = ip;
        publicIPLastFetched = now;
        resolve(ip);
      });
    }).on('error', (err) => {
      console.error('Failed to fetch public IP:', err);
      // Return a default IP or null if fetch fails
      resolve(null);
    });
  });
}

/**
 * Uses a robust PowerShell command to get all TCP and UDP connections.
 * @returns {Promise<object[]>} A promise that resolves to an array of connections.
 */
function getConnectionsWithPowerShell() {
  return new Promise((resolve, reject) => {
    // This command is more robust: it gets TCP & UDP, and includes process names directly.
    const psCommand = `
      $tcpConnections = Get-NetTCPConnection | Select-Object -Property OwningProcess, State, RemoteAddress, RemotePort
      $udpEndpoints = Get-NetUDPEndpoint | Select-Object -Property OwningProcess, LocalAddress, LocalPort

      $allConnections = @()
      $allConnections += $tcpConnections | Where-Object { $_.RemoteAddress -ne '::' -and $_.RemoteAddress -ne '0.0.0.0' } | ForEach-Object {
          [PSCustomObject]@{
              pid = $_.OwningProcess
              name = (Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue).ProcessName
              remoteAddress = $_.RemoteAddress
              remotePort = $_.RemotePort
              protocol = 'TCP'
          }
      }
      # Note: UDP is connectionless, so we can only see what ports are open (listening).
      # This part can be expanded if needed, but for now we focus on active TCP.

      $allConnections | ConvertTo-Json -Depth 3
    `;

    execFile('powershell.exe', ['-NoProfile', '-Command', psCommand], { maxBuffer: 1024 * 1024 * 10 }, (err, stdout) => {
      if (err) {
        return reject(err);
      }
      if (!stdout) {
        return resolve([]); // Resolve with an empty array if there's no output
      }
      try {
        const connections = JSON.parse(stdout);
        resolve(Array.isArray(connections) ? connections : [connections]);
      } catch (e) {
        console.error("Failed to parse PowerShell JSON:", stdout); // Log the problematic output
        reject(e);
      }
    });
  });
}


/**
 * Takes an IP address and resolves its hostname and country.
 */
async function resolveIpDetails(ip) {
    if (ipCache.has(ip)) return ipCache.get(ip);
  
    let hostname = 'N/A';
    try {
      // Handle IPv6 addresses correctly for DNS lookup
      const sanitizedIp = ip.includes('%') ? ip.split('%')[0] : ip;
      const hostnames = await reverseDns(sanitizedIp);
      hostname = hostnames?.[0] || 'N/A';
    } catch (e) { /* Ignore errors for IPs with no reverse record */ }
  
    const geo = geoip.lookup(ip);
    const details = { hostname, country: geo?.country || 'N/A' };
    ipCache.set(ip, details);
    return details;
}

/**
 * Main exported function to get the complete, enriched list of connections.
 */
export async function getMappedConnections() {
  const rawConnections = await getConnectionsWithPowerShell();
  const publicIP = await getPublicIP();

  const enrichedConnections = await Promise.all(
    rawConnections.map(async (conn) => {
      // Filter out local, loopback, and private IP addresses
      if (!conn.remoteAddress || isPrivateIP(conn.remoteAddress)) {
        return null;
      }
      
      const ipDetails = await resolveIpDetails(conn.remoteAddress);
      
      // Only include connections with valid geolocation
      const geo = geoip.lookup(conn.remoteAddress);
      if (!geo || !geo.ll) {
        return null;
      }
      
      return {
        pid: conn.pid,
        name: conn.name,
        remoteAddress: conn.remoteAddress,
        remotePort: conn.remotePort,
        hostname: ipDetails.hostname,
        country: ipDetails.country,
        lat: geo.ll[0],
        lng: geo.ll[1],
      };
    })
  );
  
  // Remove null entries and sort by process name
  const validConnections = enrichedConnections.filter(Boolean);
  
  return {
    connections: validConnections.sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    devicePublicIP: publicIP,
  };
}