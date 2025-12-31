# 🚀 PXMonitor MVP - Quick Start Guide

## What is This?

This is a **demo version** of PXMonitor that works **without TShark, Npcap, or administrator privileges**. Perfect for:
- 🎯 Demonstrations
- 💻 Development
- 📊 Testing UI/UX
- 🎓 Learning the codebase

---

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Start Backend (MVP Mode)

```bash
cd backend
start-mvp.bat
```

Or manually:
```bash
cd backend
node index-mvp.js
```

You should see:
```
========================================
🚀 PXMonitor MVP Backend Server
========================================
✓ Server running on port 3001
✓ MVP Mode: Using mock data generation
✓ No TShark required
✓ Script execution simulated
========================================
```

### Step 3: Start Frontend

Open a **new terminal**:

```bash
npm run dev
```

### Step 4: Open Browser

Navigate to: **http://localhost:5173**

---

## 🎮 What Works?

### ✅ Fully Functional Features

1. **Dashboard** - Real-time metrics with mock data
2. **Diagnosis** - Shows notification instead of running scripts
3. **Connection Mapper** - Network topology visualization
4. **System Monitor** - Process and resource monitoring
5. **Seraphims AI** - ML model predictions
6. **Settings** - Theme, preferences, export

### ⚠️ MVP Limitations

- **Network Data**: Random generated (not real packets)
- **Diagnostic Scripts**: Show notification message only
- **System Data**: Simulated processes and connections

---

## 📋 Testing the Features

### Test Dashboard
1. Go to **Dashboard** page
2. Watch metrics update every 2 seconds
3. See charts populate with data
4. Click "Analyze Network" for AI insights (if Gemini configured)

### Test Diagnosis
1. Go to **Diagnosis** page
2. Click any "Run Diagnosis" button
3. See notification: "This would execute [script] on your local machine..."
4. Metrics will update to show before/after comparison

### Test Seraphims AI
1. Go to **Seraphims** page
2. Wait for metrics to load
3. Click "Run Model" on any prediction
4. See AI-powered network analysis

---

## 🔧 Optional: Add AI Features

To enable Gemini AI features:

1. Get API key from: https://makersuite.google.com/app/apikey

2. Edit `backend/services/gemini-service.js`:
```javascript
const API_KEY = "YOUR_API_KEY_HERE";
```

3. Edit `src/services/gemini-service.ts`:
```typescript
const API_KEY = "YOUR_API_KEY_HERE";
```

4. Restart backend

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Node.js version (need v18+)
node --version

# Reinstall dependencies
cd backend
rm -rf node_modules
npm install
```

### Frontend won't connect
```bash
# Check if backend is running
curl http://localhost:3001/health

# Should return: {"status":"ok","mvpMode":true,...}
```

### No data showing
1. Open browser DevTools (F12)
2. Check Console for errors
3. Verify backend is on port 3001
4. Check Network tab for failed requests

---

## 📊 Understanding Mock Data

The MVP generates realistic data that:
- Updates every 2 seconds
- Follows network trends (stable/degrading/improving)
- Responds to simulated conditions
- Maintains consistency

**Example metrics:**
```json
{
  "latency": 32.45,
  "jitter": 6.78,
  "bandwidth": 78.90,
  "packetLoss": 0.85,
  "healthScore": 84
}
```

---

## 🔄 Switching to Full Version

When ready for real monitoring:

1. Install **Npcap**: https://npcap.com/
2. Install **TShark** (Wireshark CLI)
3. Use `start-admin.bat` instead of `start-mvp.bat`
4. Run with administrator privileges

---

## 📁 Key Files

```
backend/
├── index-mvp.js              ← MVP backend (use this)
├── mock-data-generator.js    ← Random data generation
├── start-mvp.bat             ← MVP launcher
└── index.js                  ← Full version (TShark)

src/
└── pages/
    ├── Dashboard.tsx         ← Main monitoring page
    ├── Diagnosis.tsx         ← Diagnostic tools
    └── Seraphims.tsx         ← AI predictions
```

---

## 💡 Tips

1. **Dark Mode**: Toggle in Settings page
2. **Export Data**: Click "Export Data" in sidebar
3. **AI Analysis**: Works if Gemini API configured
4. **Data Control**: Enable/disable data collection in Settings

---

## 🎯 Next Steps

1. ✅ Explore all pages
2. ✅ Test diagnostic tools
3. ✅ Try AI features (with API key)
4. ✅ Customize mock data ranges
5. ✅ Build your own features

---

## 📞 Need Help?

- Check `README-MVP.md` for detailed docs
- Review console logs for errors
- Ensure ports 3001 and 5173 are free

---

**Happy Monitoring! 🎉**

MVP Mode: Perfect for demos, development, and testing without complex setup.
