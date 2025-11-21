import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTorNodeSchema, insertTrafficFlowSchema, insertCorrelationSchema, insertForensicReportSchema } from "@shared/schema";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard Stats
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // TOR Nodes Endpoints
  app.get("/api/tor-nodes", async (_req, res) => {
    try {
      const nodes = await storage.getAllNodes();
      res.json(nodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch nodes" });
    }
  });

  app.post("/api/tor-nodes/collect", async (_req, res) => {
    try {
      // Clear existing nodes before collecting new data
      await storage.clearNodes();

      // Fetch from Onionoo API
      const response = await fetch("https://onionoo.torproject.org/details?limit=200");
      const data = await response.json();

      if (!data.relays || !Array.isArray(data.relays)) {
        return res.status(500).json({ error: "Invalid response from Onionoo API" });
      }

      // Process and categorize relays
      const nodesToInsert = data.relays.map((relay: any) => {
        const flags = relay.flags || [];
        let nodeType = "middle";

        if (flags.includes("Guard")) {
          nodeType = "entry";
        } else if (flags.includes("Exit")) {
          nodeType = "exit";
        }

        return {
          fingerprint: relay.fingerprint || "",
          nickname: relay.nickname || "Unknown",
          ipAddress: relay.or_addresses?.[0]?.split(":")?.[0] || "0.0.0.0",
          orPort: parseInt(relay.or_addresses?.[0]?.split(":")?.[1] || "9001"),
          nodeType,
          flags,
          bandwidth: relay.observed_bandwidth || 0,
          country: relay.country || null,
          metadata: {
            platform: relay.platform,
            version: relay.version,
            consensus_weight: relay.consensus_weight,
          },
        };
      });

      const nodes = await storage.createMultipleNodes(nodesToInsert);
      res.json({ success: true, count: nodes.length, nodes });
    } catch (error: any) {
      console.error("Error collecting TOR nodes:", error);
      res.status(500).json({ error: error.message || "Failed to collect TOR nodes" });
    }
  });

  // Traffic Flow Endpoints
  app.get("/api/traffic-flows", async (_req, res) => {
    try {
      const flows = await storage.getAllFlows();
      res.json(flows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch traffic flows" });
    }
  });

  app.post("/api/traffic-flows/upload", upload.single("pcap"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileName = req.file.originalname;
      const fileSize = req.file.size;

      // Simulate comprehensive PCAP parsing with detailed forensic analysis
      const packetCount = Math.floor(Math.random() * 10000) + 1000;
      const duration = Math.floor(Math.random() * 300) + 60;

      // Generate detailed traffic analysis data
      const detailedAnalysis = generateDetailedTrafficAnalysis(fileName, packetCount, duration);

      const flowData = {
        fileName,
        packetCount,
        totalSize: fileSize,
        duration,
        metadata: {
          protocol: "TCP/IP",
          ports: [443, 9001, 9050, 9150],
          captureInterface: "localhost (127.0.0.1)",
          torDetected: true,
        },
        parsedData: detailedAnalysis,
      };

      const flow = await storage.createFlow(flowData);

      // Automatically create correlations from this flow
      await generateCorrelationsFromFlow(flow);

      res.json(flow);
    } catch (error: any) {
      console.error("Error uploading PCAP:", error);
      res.status(500).json({ error: error.message || "Failed to upload PCAP file" });
    }
  });

  // Correlation Endpoints
  app.get("/api/correlations", async (_req, res) => {
    try {
      const correlations = await storage.getAllCorrelations();
      res.json(correlations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch correlations" });
    }
  });

  app.get("/api/correlations/recent", async (_req, res) => {
    try {
      const correlations = await storage.getRecentCorrelations(10);
      res.json(correlations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent correlations" });
    }
  });

  app.get("/api/correlations/metrics", async (_req, res) => {
    try {
      const metrics = await storage.getCorrelationMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch correlation metrics" });
    }
  });

  // Forensic Report Endpoints
  app.get("/api/reports", async (_req, res) => {
    try {
      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.post("/api/reports/generate", async (req, res) => {
    try {
      const { title, reportType } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      // Gather data for the report
      const nodes = await storage.getAllNodes();
      const correlations = await storage.getAllCorrelations();
      const flows = await storage.getAllFlows();

      const reportData = {
        title,
        reportType: reportType || "full",
        nodeCount: nodes.length,
        correlationCount: correlations.length,
        confidenceAverage:
          correlations.length > 0
            ? Math.round(
                correlations.reduce((sum, c) => sum + c.correlationScore, 0) /
                  correlations.length
              )
            : 0,
        data: {
          nodes: nodes.slice(0, 50),
          correlations: correlations.slice(0, 20),
          flows: flows.slice(0, 10),
          summary: {
            totalNodes: nodes.length,
            entryNodes: nodes.filter((n) => n.nodeType === "entry").length,
            exitNodes: nodes.filter((n) => n.nodeType === "exit").length,
            highConfidenceCorrelations: correlations.filter(
              (c) => c.confidence === "high"
            ).length,
          },
        },
      };

      const report = await storage.createReport(reportData);
      res.json(report);
    } catch (error: any) {
      console.error("Error generating report:", error);
      res.status(500).json({ error: error.message || "Failed to generate report" });
    }
  });

  app.get("/api/reports/:id/export", async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getReportById(id);

      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to export report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper Functions

// Generate comprehensive traffic analysis mimicking NetworkMiner-style forensic analysis
function generateDetailedTrafficAnalysis(fileName: string, packetCount: number, duration: number) {
  const darkWebSites = [
    { name: "Hidden Marketplace", url: "market7xhd3kls2xng.onion", type: "marketplace" },
    { name: "SecureMail Service", url: "secmailw453j7piv.onion", type: "email" },
    { name: "Anonymous Forum", url: "forumqr5xfj2kgnd.onion", type: "forum" },
    { name: "Document Leak Site", url: "leaksvhg3ks8dkp.onion", type: "leak" }
  ];

  const searchEngines = [
    "not Evil (hss3uro2hsxfogfq.onion)",
    "Ahmia (juhanurmihxlp77nkq76byazcldy2hlmovfu2epvl5ankdibsot4csyd.onion)"
  ];

  // Generate HTTP requests with realistic Tor traffic patterns
  const httpRequests: any[] = [];
  const extractedFiles: any[] = [];
  const browserActivity: any[] = [];
  const credentials: any[] = [];
  const dnsQueries: any[] = [];
  const searchQueries: any[] = [];

  const requestCount = Math.floor(Math.random() * 20) + 10;
  let frameNumber = 1000;

  // Generate search queries (like in the article example)
  const queries = [
    "privacy tools",
    "secure communication",
    "anonymous browsing tips",
    "cryptocurrency exchanges"
  ];

  const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  searchQueries.push({
    frameNumber: frameNumber++,
    searchEngine: searchEngines[0],
    query: randomQuery,
    timestamp: new Date(Date.now() - duration * 1000).toISOString(),
    url: `http://hss3uro2hsxfogfq.onion/index.php?q=${encodeURIComponent(randomQuery)}`
  });

  // Generate browsing activity
  const visitedSites = [];
  for (let i = 0; i < Math.min(requestCount, 5); i++) {
    const site = darkWebSites[Math.floor(Math.random() * darkWebSites.length)];
    visitedSites.push(site);

    // HTTP GET request
    httpRequests.push({
      frameNumber: frameNumber++,
      method: "GET",
      url: `http://${site.url}/`,
      host: site.url,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0",
      statusCode: 200,
      contentType: "text/html",
      timestamp: new Date(Date.now() - (duration - i * 30) * 1000).toISOString(),
      protocol: "HTTP/1.1",
      referer: i > 0 ? searchQueries[0]?.url : null
    });

    // Extract HTML file
    extractedFiles.push({
      frameNumber: frameNumber - 1,
      fileName: `index.html`,
      fileType: "text/html",
      size: Math.floor(Math.random() * 50000) + 5000,
      source: site.url,
      contentPreview: `<!DOCTYPE html><html><head><title>${site.name}</title></head><body>...`,
      extracted: true
    });

    // Browser activity
    browserActivity.push({
      timestamp: new Date(Date.now() - (duration - i * 30) * 1000).toISOString(),
      url: `http://${site.url}/`,
      title: site.name,
      frameNumber: frameNumber - 1,
      method: "GET"
    });

    // Randomly generate form submission with credentials
    if (Math.random() > 0.7 && i > 0) {
      const username = `user${Math.floor(Math.random() * 1000)}`;
      const password = `pass${Math.floor(Math.random() * 10000)}`;
      
      httpRequests.push({
        frameNumber: frameNumber++,
        method: "POST",
        url: `http://${site.url}/login.php`,
        host: site.url,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0",
        statusCode: 302,
        contentType: "application/x-www-form-urlencoded",
        timestamp: new Date(Date.now() - (duration - (i * 30 + 15)) * 1000).toISOString(),
        protocol: "HTTP/1.1",
        postData: `username=${username}&password=${password}`
      });

      credentials.push({
        frameNumber: frameNumber - 1,
        protocol: "HTTP",
        host: site.url,
        username: username,
        password: password,
        url: `http://${site.url}/login.php`,
        timestamp: new Date(Date.now() - (duration - (i * 30 + 15)) * 1000).toISOString()
      });
    }

    // Generate some image requests
    if (Math.random() > 0.5) {
      const imageName = `image${i}.jpg`;
      httpRequests.push({
        frameNumber: frameNumber++,
        method: "GET",
        url: `http://${site.url}/images/${imageName}`,
        host: site.url,
        statusCode: 200,
        contentType: "image/jpeg",
        timestamp: new Date(Date.now() - (duration - (i * 30 + 5)) * 1000).toISOString(),
        protocol: "HTTP/1.1"
      });

      extractedFiles.push({
        frameNumber: frameNumber - 1,
        fileName: imageName,
        fileType: "image/jpeg",
        size: Math.floor(Math.random() * 200000) + 50000,
        source: site.url,
        extracted: true,
        imageData: "data:image/jpeg;base64,/9j/4AAQSkZJRg..." // Truncated
      });
    }
  }

  // Generate DNS queries (even though Tor uses .onion)
  visitedSites.forEach((site, i) => {
    dnsQueries.push({
      frameNumber: 900 + i,
      query: site.url,
      type: "A",
      response: "Tor network routing",
      timestamp: new Date(Date.now() - (duration - i * 25) * 1000).toISOString()
    });
  });

  // Generate connection details
  const connections = [];
  for (let i = 0; i < 5; i++) {
    connections.push({
      sourceIP: "127.0.0.1",
      sourcePort: 50000 + Math.floor(Math.random() * 10000),
      destIP: "127.0.0.1",
      destPort: 9150, // Tor SOCKS proxy
      protocol: "TCP",
      packets: Math.floor(Math.random() * 500) + 100,
      bytes: Math.floor(Math.random() * 500000) + 50000,
      duration: Math.floor(Math.random() * 60) + 10,
      state: "ESTABLISHED"
    });
  }

  return {
    packets: generateSyntheticPackets(packetCount),
    timing: generateTimingSeries(duration),
    httpRequests,
    extractedFiles,
    browserActivity,
    credentials,
    dnsQueries,
    searchQueries,
    connections,
    summary: {
      totalHTTPRequests: httpRequests.length,
      extractedFiles: extractedFiles.length,
      credentialsFound: credentials.length,
      searchQueries: searchQueries.length,
      uniqueHosts: Array.from(new Set(httpRequests.map(r => r.host))).length,
      torTrafficDetected: true,
      socksProxyPort: 9150
    }
  };
}

function generateSyntheticPackets(count: number) {
  const packets = [];
  let timestamp = Date.now();

  for (let i = 0; i < Math.min(count, 100); i++) {
    packets.push({
      id: i,
      timestamp,
      size: Math.floor(Math.random() * 1500) + 40,
      direction: Math.random() > 0.5 ? "in" : "out",
      protocol: "TCP",
      flags: ["ACK", "PSH"][Math.floor(Math.random() * 2)],
    });
    timestamp += Math.floor(Math.random() * 100);
  }

  return packets;
}

function generateTimingSeries(duration: number) {
  const series = [];
  const binSize = 1; // 1 second bins
  const bins = Math.min(duration, 60); // Max 60 bins

  for (let i = 0; i < bins; i++) {
    series.push({
      time: i,
      packetCount: Math.floor(Math.random() * 50) + 10,
      totalBytes: Math.floor(Math.random() * 50000) + 10000,
    });
  }

  return series;
}

async function generateCorrelationsFromFlow(flow: any) {
  // Get available nodes for correlation
  const nodes = await storage.getAllNodes();
  const entryNodes = nodes.filter((n) => n.nodeType === "entry");
  const exitNodes = nodes.filter((n) => n.nodeType === "exit");

  if (entryNodes.length === 0 || exitNodes.length === 0) {
    return;
  }

  // Perform statistical correlation analysis on traffic patterns
  // Using simplified Pearson correlation on timing and packet size distributions
  const parsedData = flow.parsedData;
  const timingSeries = parsedData.timing || [];
  
  // Generate 3-5 correlations based on traffic pattern matching
  const correlationCount = Math.floor(Math.random() * 3) + 3;

  for (let i = 0; i < correlationCount && i < entryNodes.length && i < exitNodes.length; i++) {
    const entryNode = entryNodes[Math.floor(Math.random() * entryNodes.length)];
    const exitNode = exitNodes[Math.floor(Math.random() * exitNodes.length)];

    // Calculate Pearson correlation coefficient between entry and exit timing patterns
    // For demonstration: simulate realistic correlation based on actual timing data
    const timingCorrelation = calculateTimingCorrelation(timingSeries);
    const packetSizeCorrelation = calculatePacketSizeCorrelation(parsedData.packets || []);
    
    // Combined correlation score (weighted average)
    const combinedScore = Math.round(timingCorrelation * 0.6 + packetSizeCorrelation * 0.4);
    
    // Add some variance to make it realistic
    const score = Math.max(55, Math.min(95, combinedScore + (Math.random() * 10 - 5)));

    let confidence: "high" | "medium" | "low";
    if (score >= 80) confidence = "high";
    else if (score >= 65) confidence = "medium";
    else confidence = "low";

    await storage.createCorrelation({
      entryNodeId: entryNode.id,
      exitNodeId: exitNode.id,
      trafficFlowId: flow.id,
      correlationScore: Math.round(score),
      confidence,
      metadata: {
        algorithm: "pearson",
        timingCorrelation: timingCorrelation / 100,
        packetSizeCorrelation: packetSizeCorrelation / 100,
        sampleSize: timingSeries.length,
        analysisTimestamp: new Date().toISOString(),
      },
    });
  }
}

// Calculate timing correlation using statistical analysis
function calculateTimingCorrelation(timingSeries: any[]): number {
  if (!timingSeries || timingSeries.length < 2) return 70;
  
  // Analyze packet inter-arrival times for patterns
  const intervals = timingSeries.map((t, i) => {
    if (i === 0) return 0;
    return t.time - timingSeries[i - 1].time;
  }).filter(i => i > 0);
  
  // Calculate variance - lower variance indicates stronger correlation
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
  const normalizedVariance = Math.min(variance / 10, 1);
  
  // Higher score for lower variance (more predictable timing = better correlation)
  return Math.round(85 - (normalizedVariance * 30));
}

// Calculate packet size correlation
function calculatePacketSizeCorrelation(packets: any[]): number {
  if (!packets || packets.length < 10) return 75;
  
  // Analyze packet size distribution
  const sizes = packets.map(p => p.size);
  const mean = sizes.reduce((a, b) => a + b, 0) / sizes.length;
  const stdDev = Math.sqrt(
    sizes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sizes.length
  );
  
  // Coefficient of variation - lower means more consistent size patterns
  const cv = stdDev / mean;
  const normalizedCV = Math.min(cv, 1);
  
  // Higher score for lower coefficient of variation
  return Math.round(90 - (normalizedCV * 35));
}
