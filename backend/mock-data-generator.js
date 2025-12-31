/**
 * Mock Data Generator for PXMonitor MVP
 * Generates realistic random network metrics without TShark
 */

// Generate random value within range
const randomInRange = (min, max) => {
  return Math.random() * (max - min) + min;
};

// Generate random integer within range
const randomIntInRange = (min, max) => {
  return Math.floor(randomInRange(min, max));
};

// Network state to maintain some consistency
let networkState = {
  baseLatency: 30,
  baseJitter: 5,
  baseBandwidth: 80,
  basePacketLoss: 0.5,
  baseDnsDelay: 15,
  trend: 'stable' // stable, improving, degrading
};

// Simulate network trends
const updateNetworkTrend = () => {
  const rand = Math.random();
  if (rand < 0.05) {
    networkState.trend = 'degrading';
  } else if (rand < 0.10) {
    networkState.trend = 'improving';
  } else {
    networkState.trend = 'stable';
  }
};

// Apply trend to base values
const applyTrend = (baseValue, variance) => {
  let value = baseValue;
  
  if (networkState.trend === 'degrading') {
    value += randomInRange(0, variance * 2);
  } else if (networkState.trend === 'improving') {
    value -= randomInRange(0, variance);
  } else {
    value += randomInRange(-variance, variance);
  }
  
  return Math.max(0, value);
};

/**
 * Generate realistic network metrics
 */
export const generateNetworkMetrics = () => {
  updateNetworkTrend();
  
  const latency = applyTrend(networkState.baseLatency, 15);
  const jitter = applyTrend(networkState.baseJitter, 5);
  const bandwidth = applyTrend(networkState.baseBandwidth, 20);
  const packetLoss = applyTrend(networkState.basePacketLoss, 2);
  const dnsDelay = applyTrend(networkState.baseDnsDelay, 10);
  
  // Calculate health score
  const healthScore = calculateHealthScore({
    latency,
    jitter,
    packet_loss: packetLoss,
    bandwidth,
    dns_delay: dnsDelay
  });
  
  // Determine stability
  let stability = 'stable';
  if (jitter > 15 || packetLoss > 3) {
    stability = 'unstable';
  } else if (jitter < 5 && packetLoss < 1) {
    stability = 'excellent';
  }
  
  // Determine congestion
  let congestion = 'stable';
  if (latency > 80 || bandwidth < 40) {
    congestion = 'high';
  } else if (latency > 50 || bandwidth < 60) {
    congestion = 'moderate';
  }
  
  return {
    latency: Number(latency.toFixed(2)),
    jitter: Number(jitter.toFixed(2)),
    packetLoss: Number(packetLoss.toFixed(2)),
    bandwidth: Number(bandwidth.toFixed(2)),
    dnsDelay: Number(dnsDelay.toFixed(2)),
    healthScore: Math.round(healthScore),
    stability,
    congestion,
    protocolData: generateProtocolData(),
    topAppsData: generateTopAppsData(),
    timestamp: new Date().toISOString(),
    packetsReceived: randomIntInRange(800, 1500)
  };
};

/**
 * Generate protocol distribution data
 */
const generateProtocolData = () => {
  const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'ICMP'];
  const data = [];
  let remaining = 100;
  
  for (let i = 0; i < protocols.length - 1; i++) {
    const value = randomIntInRange(5, remaining / 2);
    data.push({ name: protocols[i], value });
    remaining -= value;
  }
  
  data.push({ name: protocols[protocols.length - 1], value: remaining });
  
  return data.sort((a, b) => b.value - a.value);
};

/**
 * Generate top applications data
 */
const generateTopAppsData = () => {
  const apps = [
    'Chrome',
    'Firefox',
    'Edge',
    'Discord',
    'Zoom',
    'Teams',
    'Spotify',
    'Steam',
    'System',
    'OneDrive'
  ];
  
  const numApps = randomIntInRange(4, 7);
  const selectedApps = [];
  const usedIndices = new Set();
  
  while (selectedApps.length < numApps) {
    const idx = randomIntInRange(0, apps.length);
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      selectedApps.push({
        name: apps[idx],
        value: randomIntInRange(100, 5000)
      });
    }
  }
  
  return selectedApps.sort((a, b) => b.value - a.value);
};

/**
 * Calculate health score from metrics
 */
const calculateHealthScore = (metrics) => {
  if (!metrics) return 50;
  
  const latencyScore = Math.max(0, 100 - (Number(metrics.latency || 0) / 2)) * 0.3;
  const jitterScore = Math.max(0, 100 - (Number(metrics.jitter || 0) * 2)) * 0.2;
  const packetLossScore = Math.max(0, 100 - (Number(metrics.packet_loss || 0) * 10)) * 0.25;
  const bandwidthScore = Math.min(100, Number(metrics.bandwidth || 0)) * 0.15;
  const dnsScore = Math.max(0, 100 - (Number(metrics.dns_delay || 0) * 2)) * 0.1;
  
  return Math.max(1, Math.min(100, latencyScore + jitterScore + packetLossScore + bandwidthScore + dnsScore));
};

/**
 * Generate mock process data
 */
export const generateProcessData = () => {
  const processNames = [
    'chrome.exe',
    'firefox.exe',
    'code.exe',
    'discord.exe',
    'spotify.exe',
    'explorer.exe',
    'svchost.exe',
    'system',
    'dwm.exe',
    'teams.exe',
    'node.exe',
    'python.exe'
  ];
  
  const numProcesses = randomIntInRange(15, 30);
  const processes = [];
  
  for (let i = 0; i < numProcesses; i++) {
    const name = processNames[randomIntInRange(0, processNames.length)];
    processes.push({
      pid: randomIntInRange(1000, 9999),
      name,
      cpu: Number(randomInRange(0, 25).toFixed(1)),
      mem: Number(randomInRange(50, 500).toFixed(1)),
      disk: Number(randomInRange(0, 10).toFixed(2)),
      network: Number(randomInRange(0, 1000).toFixed(0))
    });
  }
  
  return processes.sort((a, b) => b.cpu - a.cpu);
};

/**
 * Generate system health data
 */
export const generateSystemHealth = () => {
  return {
    cpu: {
      usage: Number(randomInRange(10, 60).toFixed(1)),
      cores: 8,
      temperature: Number(randomInRange(45, 75).toFixed(1))
    },
    memory: {
      used: Number(randomInRange(4000, 12000).toFixed(0)),
      total: 16384,
      percentage: Number(randomInRange(25, 75).toFixed(1))
    },
    disk: {
      read: Number(randomInRange(0, 100).toFixed(2)),
      write: Number(randomInRange(0, 50).toFixed(2)),
      usage: Number(randomInRange(40, 80).toFixed(1))
    },
    network: {
      sent: Number(randomInRange(100, 5000).toFixed(0)),
      received: Number(randomInRange(500, 10000).toFixed(0))
    }
  };
};

/**
 * Generate battery data
 */
export const generateBatteryData = () => {
  const isCharging = Math.random() > 0.5;
  return {
    percentage: randomIntInRange(20, 100),
    isCharging,
    timeRemaining: isCharging ? null : randomIntInRange(60, 300),
    powerConsumption: Number(randomInRange(5, 25).toFixed(2)),
    highImpactProcesses: [
      { name: 'chrome.exe', impact: 'High' },
      { name: 'discord.exe', impact: 'Medium' }
    ]
  };
};

/**
 * Generate suspicious activity data
 */
export const generateSuspiciousActivity = () => {
  const suspicious = [];
  
  // Randomly add 0-2 suspicious items
  const count = randomIntInRange(0, 3);
  const possibleSuspicious = [
    { name: 'unknown.exe', reason: 'Unknown process with high network activity' },
    { name: 'svchost.exe', reason: 'Multiple instances detected' },
    { name: 'powershell.exe', reason: 'Running with elevated privileges' }
  ];
  
  for (let i = 0; i < count; i++) {
    if (possibleSuspicious[i]) {
      suspicious.push(possibleSuspicious[i]);
    }
  }
  
  return suspicious;
};

/**
 * Generate connection data
 */
export const generateConnectionData = () => {
  const connections = [];
  const numConnections = randomIntInRange(10, 25);
  
  const processes = ['chrome.exe', 'discord.exe', 'teams.exe', 'spotify.exe', 'system'];
  const protocols = ['TCP', 'UDP'];
  const states = ['ESTABLISHED', 'TIME_WAIT', 'CLOSE_WAIT', 'LISTENING'];
  
  for (let i = 0; i < numConnections; i++) {
    connections.push({
      local_ip: '192.168.1.' + randomIntInRange(100, 200),
      local_port: randomIntInRange(49152, 65535),
      remote_ip: randomIntInRange(1, 255) + '.' + randomIntInRange(1, 255) + '.' + randomIntInRange(1, 255) + '.' + randomIntInRange(1, 255),
      remote_port: [80, 443, 8080, 3000, 5000][randomIntInRange(0, 5)],
      state: states[randomIntInRange(0, states.length)],
      process_name: processes[randomIntInRange(0, processes.length)],
      protocol: protocols[randomIntInRange(0, protocols.length)],
      bytes_sent: randomIntInRange(1000, 100000),
      bytes_received: randomIntInRange(5000, 500000)
    });
  }
  
  return connections;
};

/**
 * Generate ping test result
 */
export const generatePingTest = () => {
  return {
    latency: randomIntInRange(10, 100)
  };
};

/**
 * Generate DNS test result
 */
export const generateDnsTest = () => {
  return {
    responseTime: randomIntInRange(5, 50)
  };
};

export default {
  generateNetworkMetrics,
  generateProcessData,
  generateSystemHealth,
  generateBatteryData,
  generateSuspiciousActivity,
  generateConnectionData,
  generatePingTest,
  generateDnsTest
};
