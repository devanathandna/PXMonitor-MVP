# PXMonitor MVP - Network Monitoring Demo

## 🎯 MVP Overview

This is a **Minimum Viable Product (MVP)** version of PXMonitor that demonstrates the full UI/UX and features **without requiring TShark, Npcap, or administrator privileges**.

### Key Differences from Full Version

| Feature | Full Version | MVP Version |
|---------|-------------|-------------|
| **Network Data** | Real packet capture via TShark | Random generated realistic data |
| **Diagnostic Scripts** | Executes PowerShell scripts | Shows notification message |
| **Requirements** | TShark, Npcap, Admin rights | Just Node.js |
| **System Access** | Real system monitoring | Mock system data |
| **Installation** | Complex setup | Simple npm install |

---

## ✨ Features (All Working in MVP)

### 1. **Dashboard** (/dashboard)
- ✅ Real-time metrics display (mock data)
- ✅ Network Health Score calculation
- ✅ Interactive charts for latency, jitter, bandwidth
- ✅ Protocol distribution visualization
- ✅ Top applications bandwidth analysis
- ✅ Network stability indicators
- ✅ AI-powered analysis (if Gemini API configured)

### 2. **Diagnosis** (/diagnosis)
- ✅ All diagnostic tools visible
- ✅ Before/after metric comparison
- ⚠️ **Script execution shows notification instead of running**
- ✅ Ping and DNS tests (mock results)

**Notification Message Example:**
```
✓ This would execute Flush-DnsCache.ps1 on your local machine.

In the full version, this script would:
- Run with administrator privileges
- Perform network diagnostics
- Apply system-level fixes

MVP Mode: Script execution simulated successfully.
```

### 3. **Connection Mapper** (/connection-mapper)
- ✅ Interactive network topology visualization
- ✅ Connection tracking (mock data)
- ✅ IP address and port mapping
- ✅ Protocol identification
- ✅ Security analysis integration

### 4. **System Monitor** (/system-monitor)
- ✅ CPU, memory, disk usage (mock data)
- ✅ Process-level resource consumption
- ✅ Battery impact analysis
- ✅ Suspicious activity detection
- ✅ System health aggregation

### 5. **Seraphims AI** (/seraphims)
- ✅ Anomaly Detection Model
- ✅ Quality Prediction Model
- ✅ Network Bottleneck Detection
- ✅ Real-time inference on mock metrics

### 6. **Settings** (/settings)
- ✅ Dark/Light theme toggle
- ✅ Notification preferences
- ✅ Alert threshold customization
- ✅ Settings export to CSV

---

## 🚀 Quick Start (MVP)

### Prerequisites
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- ✅ **No TShark required**
- ✅ **No Npcap required**
- ✅ **No admin privileges required**

### Installation

1. **Clone or navigate to the project**:
```bash
cd d:\PXMonitor\Copy_PXmonitor
```

2. **Install Frontend Dependencies**:
```bash
npm install
```

3. **Install Backend Dependencies**:
```bash
cd backend
npm install
cd ..
```

4. **(Optional) Configure Gemini API**:
If you want AI features, add your API key to:
- `backend/services/gemini-service.js`
- `src/services/gemini-service.ts`

```javascript
const API_KEY = "YOUR_GEMINI_API_KEY_HERE";
```

### Running the MVP

**Terminal 1 - Backend Server**:
```bash
cd backend
start-mvp.bat
# OR
node index-mvp.js
```

**Terminal 2 - Frontend Dev Server**:
```bash
npm run dev
```

Access the application at **http://localhost:5173**

---

## 📊 How Mock Data Works

### Network Metrics Generation
The MVP generates realistic network metrics that:
- Fluctuate naturally over time
- Maintain network "trends" (stable/improving/degrading)
- Respond to simulated network conditions
- Update every 2 seconds

**Example Metrics:**
```json
{
  "latency": 32.45,
  "jitter": 6.78,
  "bandwidth": 78.90,
  "packetLoss": 0.85,
  "dnsDelay": 18.23,
  "healthScore": 84,
  "stability": "stable",
  "congestion": "moderate"
}
```

### System Data Generation
- **Processes**: Random but realistic process names and resource usage
- **Connections**: Simulated network connections with various states
- **Battery**: Dynamic battery status and power consumption
- **Health**: CPU, memory, disk, and network statistics

---

## 🎨 UI/UX Features (Fully Functional)

All visual features work exactly as in the full version:
- ✅ Beautiful dark/light themes
- ✅ Responsive charts and graphs
- ✅ Real-time data updates
- ✅ Interactive visualizations
- ✅ Toast notifications
- ✅ Loading states and animations
- ✅ Error handling
- ✅ Data export functionality

---

## 🔄 Switching to Full Version

To use the full version with real network monitoring:

1. **Install TShark and Npcap**:
   - Download Npcap: https://npcap.com/
   - Install TShark (Wireshark CLI)

2. **Use the full backend**:
```bash
cd backend
start-admin.bat  # Requires admin privileges
# OR
node index.js
```

3. **Update TShark path** in `backend/scripts/tshark-interface.js`:
```javascript
const TSHARK_CONFIG = {
  command: 'D:\\PXMonitor\\pxmonitor\\tshark_libs\\tshark.exe',
  // ... rest of config
};
```

---

## 📁 Project Structure

```
PXMonitor/
├── backend/
│   ├── index.js              # Full version backend (TShark)
│   ├── index-mvp.js          # MVP backend (Mock data) ⭐
│   ├── mock-data-generator.js # Random data generation ⭐
│   ├── start-mvp.bat         # MVP launcher ⭐
│   ├── start-admin.bat       # Full version launcher
│   ├── services/
│   │   └── gemini-service.js # AI integration
│   ├── Seraphims/
│   │   └── seraphims-service.js # ML models
│   └── scripts/
│       └── *.ps1             # PowerShell diagnostic scripts
├── src/
│   ├── pages/                # All UI pages
│   ├── components/           # Reusable components
│   └── services/             # Frontend services
├── package.json
└── README-MVP.md             # This file
```

---

## 🛠️ API Endpoints (MVP)

All endpoints work the same as the full version, but return mock data:

### Network Metrics
- `GET /metrics` - Current network metrics (mock)
- `GET /status` - Server status
- `GET /health` - Health check

### System Monitoring
- `GET /api/system/processes` - Process list (mock)
- `GET /api/system/health` - System health (mock)
- `GET /api/system/battery` - Battery status (mock)
- `GET /api/system/suspicious` - Suspicious activity (mock)

### Diagnostics
- `GET /api/diagnostics/ping-test` - Ping test (mock)
- `GET /api/diagnostics/dns-test` - DNS test (mock)
- `POST /api/run-script/:scriptName` - **Returns notification message** ⚠️

### Connections
- `GET /api/connections/` - Network connections (mock)
- `POST /api/connections/security-scan` - Security analysis

### AI/ML
- `POST /api/seraphims/anomaly` - Anomaly detection
- `POST /api/seraphims/quality` - Quality prediction
- `POST /api/seraphims/bottleneck` - Bottleneck detection
- `POST /analyze` - Network analysis (Gemini)
- `GET /explain/:component` - Component explanation (Gemini)

---

## 🎯 Use Cases for MVP

### Perfect For:
- ✅ **Demonstrations** - Show the UI/UX without complex setup
- ✅ **Development** - Test frontend changes without TShark
- ✅ **Presentations** - Demo features to stakeholders
- ✅ **Learning** - Understand the application architecture
- ✅ **Quick Testing** - Rapid iteration on UI components

### Not Suitable For:
- ❌ Real network monitoring
- ❌ Actual network diagnostics
- ❌ Production use
- ❌ Security analysis of real traffic

---

## 🔧 Configuration

### Data Control
The MVP respects the data control settings:
- Dashboard data can be enabled/disabled
- System monitor data can be enabled/disabled
- Settings persist across restarts

### Mock Data Customization
Edit `backend/mock-data-generator.js` to customize:
- Metric ranges
- Update frequencies
- Network trends
- Process names
- Connection patterns

---

## 📝 Notes

1. **No Admin Required**: The MVP runs without administrator privileges
2. **Fast Startup**: No TShark initialization delay
3. **Consistent Data**: Mock data is predictable and reliable
4. **Full UI**: All visual features work identically to full version
5. **AI Features**: Gemini AI features work if API key is configured
6. **ML Models**: ONNX models work with mock data

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check Node.js version
node --version  # Should be v18+

# Reinstall dependencies
cd backend
npm install
```

### Frontend Won't Connect
```bash
# Verify backend is running
curl http://localhost:3001/health

# Check CORS settings in backend/index-mvp.js
```

### No Metrics Showing
- Check browser console for errors
- Verify backend is running on port 3001
- Check `/debug` endpoint: http://localhost:3001/debug

---

## 📞 Support

For issues or questions:
- Check the main README.md for detailed documentation
- Review the console logs in both frontend and backend
- Ensure all dependencies are installed

---

## 🎓 Learning Path

1. **Start with MVP** - Understand the UI and features
2. **Explore the code** - Review mock data generation
3. **Test AI features** - Configure Gemini API
4. **Try ML models** - Test Seraphims predictions
5. **Upgrade to full** - Install TShark for real monitoring

---

**Version**: 1.0.0 MVP  
**Mode**: Mock Data Generation  
**Requirements**: Node.js only  
**Perfect for**: Demos, Development, Testing
