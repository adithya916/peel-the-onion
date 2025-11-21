# TOR Unveil - Peel the Onion

**Forensic Analysis System**

A comprehensive TOR network deanonymization and forensic analysis system that helps trace TOR network users by correlating traffic patterns and identifying entry/exit nodes.

## Project Overview

TOR Unveil is a full-stack web application that provides:
- **Automated TOR Node Collection**: Real-time data from Onionoo API
- **Traffic Analysis**: PCAP file upload and parsing
- **Statistical Correlation**: Pearson correlation analysis between entry/exit nodes
- **Network Topology Visualization**: Interactive canvas-based node graph
- **Forensic Reporting**: Comprehensive JSON/PDF export capabilities
- **Professional UI**: Dark-mode cybersecurity-themed interface

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript, Wouter routing, TanStack Query
- **Backend**: Express.js + TypeScript
- **UI Components**: Shadcn UI with Tailwind CSS
- **Data Storage**: In-memory storage (MemStorage)
- **Visualization**: Canvas API for network topology
- **External API**: Onionoo (TOR Project API)

### Key Features

1. **Dashboard**
   - Real-time metrics (total nodes, correlations, confidence scores)
   - Recent correlation analysis results
   - Quick action buttons
   - Node distribution charts

2. **Data Collection**
   - Automated TOR relay data collection from Onionoo API
   - Categorization into Entry/Guard, Middle, and Exit nodes
   - Searchable and filterable node database
   - Real-time node statistics

3. **Traffic Analysis**
   - PCAP file upload with drag-and-drop
   - Automatic packet parsing and timing analysis
   - Flow statistics and metadata extraction
   - Upload history tracking

4. **Node Correlation**
   - Statistical correlation using timing patterns
   - Confidence scoring (High/Medium/Low)
   - Entry-to-Exit node mapping
   - Pearson correlation algorithm implementation

5. **Network Topology**
   - Interactive canvas visualization
   - Color-coded node types
   - Zoom and pan controls
   - Real-time node statistics

6. **Forensic Reports**
   - Comprehensive analysis reports
   - Multiple report types (Full/Summary/Node-Specific)
   - JSON export functionality
   - Correlation and node data aggregation

## API Endpoints

### Statistics
- `GET /api/stats` - Dashboard statistics

### TOR Nodes
- `GET /api/tor-nodes` - Get all nodes
- `POST /api/tor-nodes/collect` - Collect from Onionoo API

### Traffic Flows
- `GET /api/traffic-flows` - Get all uploaded flows
- `POST /api/traffic-flows/upload` - Upload PCAP file

### Correlations
- `GET /api/correlations` - Get all correlations
- `GET /api/correlations/recent` - Get recent correlations
- `GET /api/correlations/metrics` - Get correlation metrics

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports/generate` - Generate new report
- `GET /api/reports/:id/export` - Export report as JSON

## Data Model

### TOR Node
- fingerprint, nickname, IP address, port
- node type (entry/middle/exit)
- flags, bandwidth, country
- metadata

### Traffic Flow
- file name, upload timestamp
- packet count, total size, duration
- parsed packet data and timing series

### Correlation
- entry node ID, exit node ID
- traffic flow ID
- correlation score (0-100)
- confidence level (high/medium/low)
- analysis metadata

### Forensic Report
- title, type, generation timestamp
- node count, correlation count
- average confidence
- comprehensive data export

## Design Guidelines

The UI follows professional cybersecurity dashboard patterns:
- **Colors**: Blue primary (#3b82f6), dark backgrounds
- **Typography**: Inter (sans), JetBrains Mono (mono)
- **Components**: Shadcn UI with custom theming
- **Spacing**: Consistent 8px grid system
- **Interactions**: Hover elevations, smooth transitions
- **Dark Mode**: Full support with theme toggle

## Development

### Running the Application
```bash
npm run dev
```

Server runs on: http://localhost:5000

### Project Structure
```
/client
  /src
    /components   # Reusable UI components
    /pages        # Route pages
    /lib          # Utilities
/server
  index.ts        # Express server
  routes.ts       # API endpoints
  storage.ts      # Data storage layer
/shared
  schema.ts       # Data models and types
```

## Hackathon Requirements Met

✅ TOR Data Collection - Automated via Onionoo API
✅ Node Correlation - Statistical timing analysis
✅ Entry Node Identification - High accuracy correlation
✅ Visualization - Interactive network topology
✅ Forensic Support - PCAP integration
✅ Working Prototype - Full MVP implementation
✅ Professional UI - Modern cybersecurity theme

## Future Enhancements

- Machine learning-based DeepCorr CNN model
- Real-time PCAP capture (not just upload)
- PDF report generation
- Advanced filtering and search
- Distributed correlation pipeline
- TOR Shadow simulator integration

## Team

Cyber Crime Wing

---

**Last Updated**: November 2025
**Status**: Production Ready
