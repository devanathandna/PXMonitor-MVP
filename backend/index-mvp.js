/**
 * PXMonitor MVP Backend
 * Simplified version with mock data generation (no TShark required)
 */

import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from "body-parser";
import fs from 'fs';
import * as geminiService from './services/gemini-service.js';
import { askSystemQuestion } from './services/gemini-service.js';
import { analyzeConnectionsForSecurity, explainHostname } from './services/gemini-service.js';
import { runAnomalyDetection, runQualityPrediction, runBottleneckDetection } from './Seraphims/seraphims-service.js';
import {
    generateNetworkMetrics,
    generateProcessData,
    generateSystemHealth,
    generateBatteryData,
    generateSuspiciousActivity,
    generateConnectionData,
    generatePingTest,
    generateDnsTest
} from './mock-data-generator.js';

const app = express();
const server = createServer(app);

// Add CORS middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:5173','https://px-monitor-b3tsoewnn-deavanathans-projects.vercel.app'],
    credentials: true
}));

// Configure body-parser
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

// Global data control state
let dataControlState = {
    dashboardEnabled: true,
    systemMonitorEnabled: true
};

// Load data control state from file if it exists
const DATA_CONTROL_FILE = './data-control-state.json';

try {
    if (fs.existsSync(DATA_CONTROL_FILE)) {
        const savedState = JSON.parse(fs.readFileSync(DATA_CONTROL_FILE, 'utf8'));
        dataControlState = { ...dataControlState, ...savedState };
        console.log('Loaded data control state:', dataControlState);
    }
} catch (error) {
    console.error('Error loading data control state:', error);
}

// Function to save data control state
const saveDataControlState = () => {
    try {
        fs.writeFileSync(DATA_CONTROL_FILE, JSON.stringify(dataControlState, null, 2));
    } catch (error) {
        console.error('Error saving data control state:', error);
    }
};

// Store latest metrics
let latestMetrics = null;
let metricsInterval = null;

// Generate metrics periodically
const startMetricsGeneration = () => {
    if (metricsInterval) {
        clearInterval(metricsInterval);
    }

    // Generate initial metrics
    latestMetrics = generateNetworkMetrics();

    // Update metrics every 2 seconds
    metricsInterval = setInterval(() => {
        if (dataControlState.dashboardEnabled) {
            latestMetrics = generateNetworkMetrics();
        }
    }, 2000);

    console.log('Started mock metrics generation');
};

const stopMetricsGeneration = () => {
    if (metricsInterval) {
        clearInterval(metricsInterval);
        metricsInterval = null;
        latestMetrics = null;
        console.log('Stopped mock metrics generation');
    }
};

// --- SYSTEM ENDPOINTS - TASKMANAGER ---

app.get("/api/system/processes", async (req, res) => {
    console.log("[API] GET /api/system/processes called");

    if (!dataControlState.systemMonitorEnabled) {
        res.status(423).json({
            error: 'System monitor data disabled',
            message: 'Data collection is disabled for system monitor',
            enabled: false
        });
        return;
    }

    try {
        const procs = generateProcessData();
        console.log(`[API] Returning ${procs.length} processes`);
        res.json(procs);
    } catch (err) {
        console.error("[API] Error in /api/system/processes:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/system/battery", async (req, res) => {
    try {
        const bat = generateBatteryData();
        res.json(bat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/system/suspicious", async (req, res) => {
    try {
        const bad = generateSuspiciousActivity();
        res.json(bad);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/system/health", async (req, res) => {
    console.log("[API] GET /api/system/health called");

    if (!dataControlState.systemMonitorEnabled) {
        res.status(423).json({
            error: 'System monitor data disabled',
            message: 'Data collection is disabled for system monitor',
            enabled: false
        });
        return;
    }

    try {
        const health = generateSystemHealth();
        console.log("[API] Health data generated");
        res.json(health);
    } catch (err) {
        console.error("[API] Error in /api/system/health:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- DIAGNOSTIC TEST ENDPOINTS ---

app.get('/api/diagnostics/ping-test', async (req, res) => {
    try {
        const result = generatePingTest();
        res.json(result);
    } catch (err) {
        console.error('Ping test failed:', err);
        res.status(500).json({ error: 'Ping test failed', details: err.message });
    }
});

app.get('/api/diagnostics/dns-test', async (req, res) => {
    try {
        const result = generateDnsTest();
        res.json(result);
    } catch (err) {
        console.error('DNS test failed:', err);
        res.status(500).json({ error: 'DNS test failed', details: err.message });
    }
});

// --- SCRIPT EXECUTION ENDPOINTS (MVP - Returns notification message) ---

const VALID_SCRIPTS = [
    'Clear-NetworkCongestion.ps1',
    'Flush-DnsCache.ps1',
    'Maintain-PowerfulConnection.ps1',
    'Optimize-Bandwidth.ps1',
    'Reconnect-WiFi.ps1',
    'Reset-NetworkIP.ps1',
    'Switch-DnsServer.ps1'
];

app.post('/api/run-script/:scriptName', async (req, res) => {
    const { scriptName } = req.params;

    try {
        if (!VALID_SCRIPTS.includes(scriptName)) {
            return res.status(400).json({
                success: false,
                error: `Invalid script: ${scriptName}`
            });
        }

        // MVP: Return notification message instead of executing
        const message = `✓ This would execute ${scriptName} on your local machine.\n\nIn the full version, this script would:\n- Run with administrator privileges\n- Perform network diagnostics\n- Apply system-level fixes\n\nMVP Mode: Script execution simulated successfully.`;

        console.log(`[MVP] Simulated execution of ${scriptName}`);

        res.json({
            success: true,
            message,
            mvpMode: true,
            scriptName
        });
    } catch (err) {
        console.error(`Error simulating script ${scriptName}:`, err);
        res.status(500).json({
            success: false,
            error: `Failed to simulate ${scriptName}`,
            details: err.message
        });
    }
});

// --- CONNECTION SECURITY ENDPOINTS ---

app.post("/api/connections/security-scan", async (req, res) => {
    try {
        const { connections } = req.body;
        if (!connections) {
            return res.status(400).json({ error: "Connection data is required." });
        }
        const analysis = await analyzeConnectionsForSecurity(connections);
        res.json({ analysis });
    } catch (err) {
        res.status(500).json({ error: "Failed to perform security scan." });
    }
});

app.post("/api/connections/explain", async (req, res) => {
    try {
        const { hostname } = req.body;
        if (!hostname || hostname === 'N/A') {
            return res.status(400).json({ error: "A valid hostname is required." });
        }
        const explanation = await explainHostname(hostname);
        res.json({ explanation });
    } catch (err) {
        res.status(500).json({ error: "Failed to get explanation." });
    }
});

// --- NETWORK INTERFACE ENDPOINTS (MVP - Mock) ---

let currentInterface = 'Wi-Fi';

app.get('/interface', (req, res) => {
    res.json({ interface: currentInterface });
});

app.post('/interface', (req, res) => {
    const { interfaceName } = req.body;
    if (!interfaceName) {
        return res.status(400).json({ error: 'Interface name required' });
    }

    console.log(`[MVP] Switching interface to: ${interfaceName}`);
    currentInterface = interfaceName;

    res.json({ interface: currentInterface });
});

// --- METRICS ENDPOINT ---

app.get('/metrics', (req, res) => {
    if (!dataControlState.dashboardEnabled) {
        res.status(423).json({
            error: 'Dashboard data disabled',
            message: 'Data collection is disabled for dashboard',
            enabled: false
        });
        return;
    }

    if (latestMetrics) {
        res.json(latestMetrics);
    } else {
        res.status(503).json({
            error: 'No metrics available',
            message: 'Waiting for metrics generation to initialize'
        });
    }
});

// --- DATA CONTROL ENDPOINTS ---

app.get('/api/data-control', (req, res) => {
    res.json(dataControlState);
});

app.post('/api/data-control', (req, res) => {
    const { dashboardEnabled, systemMonitorEnabled } = req.body;

    if (typeof dashboardEnabled === 'boolean') {
        const wasEnabled = dataControlState.dashboardEnabled;
        dataControlState.dashboardEnabled = dashboardEnabled;
        console.log(`Dashboard data ${dashboardEnabled ? 'enabled' : 'disabled'}`);

        if (dashboardEnabled && !wasEnabled) {
            startMetricsGeneration();
        } else if (!dashboardEnabled && wasEnabled) {
            stopMetricsGeneration();
        }
        saveDataControlState();
    }

    if (typeof systemMonitorEnabled === 'boolean') {
        dataControlState.systemMonitorEnabled = systemMonitorEnabled;
        console.log(`System monitor data ${systemMonitorEnabled ? 'enabled' : 'disabled'}`);
        saveDataControlState();
    }

    res.json(dataControlState);
});

// --- STATUS ENDPOINT ---

app.get('/status', (req, res) => {
    const status = {
        captureRunning: dataControlState.dashboardEnabled,
        interface: currentInterface,
        hasMetrics: !!latestMetrics,
        lastUpdate: latestMetrics?.timestamp || null,
        mvpMode: true
    };

    console.log('Status check:', status);
    res.json(status);
});

// --- GEMINI AI ENDPOINTS ---

app.get('/explain/:component', async (req, res) => {
    try {
        const explanation = await geminiService.explainNetworkComponent(req.params.component);
        res.json({ explanation });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/analyze', async (req, res) => {
    try {
        const analysis = await geminiService.analyzeNetworkMetrics(req.body);
        res.json({ analysis });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- HEALTH CHECK ENDPOINT ---

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mvpMode: true,
        metricsGenerating: !!metricsInterval,
        hasMetrics: !!latestMetrics
    });
});

// --- DEBUG ENDPOINT ---

app.get('/debug', (req, res) => {
    res.json({
        latestMetrics,
        metricsGenerating: !!metricsInterval,
        interface: currentInterface,
        serverTime: new Date().toISOString(),
        mvpMode: true
    });
});

// --- CONNECTIONS ENDPOINT ---

app.get('/api/connections/', async (req, res) => {
    try {
        const data = generateConnectionData();
        res.json(data || []);
    } catch (e) {
        console.error('connections error', e);
        res.status(500).json({ error: "Failed to get connections" });
    }
});

// --- SYSTEM ANALYSIS ENDPOINT ---

app.post("/api/system/analyze", async (req, res) => {
    console.log("[API] POST /api/system/analyze called");

    try {
        const { question, context, history } = req.body;

        const topProcessesString = (context.processes || [])
            .sort((a, b) => b.cpu - a.cpu)
            .slice(0, 15)
            .map(p => `${p.name} (CPU: ${p.cpu.toFixed(1)}%, Mem: ${p.mem.toFixed(1)}MB)`)
            .join(', ');

        const summarizedContext = {
            topProcesses: topProcessesString,
            health: context.health || {},
            suspicious: (context.suspicious || []).slice(0, 5).map(p => p.name).join(', ') || 'None',
        };

        const answer = await askSystemQuestion(question, summarizedContext, history);

        res.json({ answer });
    } catch (err) {
        console.error("[API] Error in /api/system/analyze:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- SERAPHIMS ML MODEL ENDPOINTS ---

app.post('/api/seraphims/anomaly', async (req, res) => {
    try {
        console.log('[API] POST /api/seraphims/anomaly called with data:', req.body);
        const metrics = req.body;

        const requiredFields = ['latency', 'jitter', 'bandwidth', 'packet_loss', 'dns_delay'];
        for (const field of requiredFields) {
            if (metrics[field] === undefined || metrics[field] === null) {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        const result = await runAnomalyDetection(metrics);
        res.json(result);
    } catch (err) {
        console.error('[API] Error in /api/seraphims/anomaly:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/seraphims/quality', async (req, res) => {
    try {
        console.log('[API] POST /api/seraphims/quality called with data:', req.body);
        const metrics = req.body;

        const requiredFields = ['latency', 'jitter', 'packet_loss', 'bandwidth'];
        for (const field of requiredFields) {
            if (metrics[field] === undefined || metrics[field] === null) {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        const result = await runQualityPrediction(metrics);
        res.json(result);
    } catch (err) {
        console.error('[API] Error in /api/seraphims/quality:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/seraphims/bottleneck', async (req, res) => {
    try {
        console.log('[API] POST /api/seraphims/bottleneck called with data:', req.body);
        const metrics = req.body;

        const requiredFields = ['latency', 'jitter', 'bandwidth', 'packet_loss', 'dns_delay'];
        for (const field of requiredFields) {
            if (metrics[field] === undefined || metrics[field] === null) {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        const result = await runBottleneckDetection(metrics);
        res.json(result);
    } catch (err) {
        console.error('[API] Error in /api/seraphims/bottleneck:', err);
        res.status(500).json({ error: err.message });
    }
});

// --- SERVER STARTUP ---

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`🚀 PXMonitor MVP Backend Server`);
    console.log(`========================================`);
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ MVP Mode: Using mock data generation`);
    console.log(`✓ No TShark required`);
    console.log(`✓ Script execution simulated`);
    console.log(`========================================`);
    console.log(`📊 Endpoints:`);
    console.log(`   - Health: http://localhost:${PORT}/health`);
    console.log(`   - Status: http://localhost:${PORT}/status`);
    console.log(`   - Debug:  http://localhost:${PORT}/debug`);
    console.log(`========================================\n`);

    // Start metrics generation if enabled
    if (dataControlState.dashboardEnabled) {
        startMetricsGeneration();
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    stopMetricsGeneration();
    server.close(() => {
        console.log('Server shut down');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    stopMetricsGeneration();
    server.close(() => {
        console.log('Server shut down');
        process.exit(0);
    });
});
