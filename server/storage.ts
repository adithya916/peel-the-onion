import {
  type TorNode,
  type InsertTorNode,
  type TrafficFlow,
  type InsertTrafficFlow,
  type Correlation,
  type InsertCorrelation,
  type ForensicReport,
  type InsertForensicReport,
  type DashboardStats,
  type CorrelationMetrics,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // TOR Nodes
  getAllNodes(): Promise<TorNode[]>;
  getNodeById(id: string): Promise<TorNode | undefined>;
  createNode(node: InsertTorNode): Promise<TorNode>;
  createMultipleNodes(nodes: InsertTorNode[]): Promise<TorNode[]>;
  clearNodes(): Promise<void>;

  // Traffic Flows
  getAllFlows(): Promise<TrafficFlow[]>;
  getFlowById(id: string): Promise<TrafficFlow | undefined>;
  createFlow(flow: InsertTrafficFlow): Promise<TrafficFlow>;

  // Correlations
  getAllCorrelations(): Promise<Correlation[]>;
  getRecentCorrelations(limit: number): Promise<Correlation[]>;
  getCorrelationById(id: string): Promise<Correlation | undefined>;
  createCorrelation(correlation: InsertCorrelation): Promise<Correlation>;
  getCorrelationMetrics(): Promise<CorrelationMetrics>;

  // Forensic Reports
  getAllReports(): Promise<ForensicReport[]>;
  getReportById(id: string): Promise<ForensicReport | undefined>;
  createReport(report: InsertForensicReport): Promise<ForensicReport>;

  // Dashboard Stats
  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private nodes: Map<string, TorNode>;
  private flows: Map<string, TrafficFlow>;
  private correlations: Map<string, Correlation>;
  private reports: Map<string, ForensicReport>;

  constructor() {
    this.nodes = new Map();
    this.flows = new Map();
    this.correlations = new Map();
    this.reports = new Map();
  }

  // TOR Nodes
  async getAllNodes(): Promise<TorNode[]> {
    return Array.from(this.nodes.values());
  }

  async getNodeById(id: string): Promise<TorNode | undefined> {
    return this.nodes.get(id);
  }

  async createNode(insertNode: InsertTorNode): Promise<TorNode> {
    const id = randomUUID();
    const node: TorNode = {
      ...insertNode,
      id,
      lastSeen: new Date(),
    };
    this.nodes.set(id, node);
    return node;
  }

  async createMultipleNodes(insertNodes: InsertTorNode[]): Promise<TorNode[]> {
    const nodes = insertNodes.map((insertNode) => {
      const id = randomUUID();
      const node: TorNode = {
        ...insertNode,
        id,
        lastSeen: new Date(),
      };
      this.nodes.set(id, node);
      return node;
    });
    return nodes;
  }

  async clearNodes(): Promise<void> {
    this.nodes.clear();
  }

  // Traffic Flows
  async getAllFlows(): Promise<TrafficFlow[]> {
    return Array.from(this.flows.values()).sort(
      (a, b) =>
        (b.uploadedAt?.getTime() || 0) - (a.uploadedAt?.getTime() || 0)
    );
  }

  async getFlowById(id: string): Promise<TrafficFlow | undefined> {
    return this.flows.get(id);
  }

  async createFlow(insertFlow: InsertTrafficFlow): Promise<TrafficFlow> {
    const id = randomUUID();
    const flow: TrafficFlow = {
      ...insertFlow,
      id,
      uploadedAt: new Date(),
    };
    this.flows.set(id, flow);
    return flow;
  }

  // Correlations
  async getAllCorrelations(): Promise<Correlation[]> {
    return Array.from(this.correlations.values()).sort(
      (a, b) =>
        (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)
    );
  }

  async getRecentCorrelations(limit: number): Promise<Correlation[]> {
    const all = await this.getAllCorrelations();
    return all.slice(0, limit);
  }

  async getCorrelationById(id: string): Promise<Correlation | undefined> {
    return this.correlations.get(id);
  }

  async createCorrelation(
    insertCorrelation: InsertCorrelation
  ): Promise<Correlation> {
    const id = randomUUID();
    const correlation: Correlation = {
      ...insertCorrelation,
      id,
      timestamp: new Date(),
    };
    this.correlations.set(id, correlation);
    return correlation;
  }

  async getCorrelationMetrics(): Promise<CorrelationMetrics> {
    const allCorrelations = Array.from(this.correlations.values());
    const high = allCorrelations.filter((c) => c.confidence === "high").length;
    const medium = allCorrelations.filter((c) => c.confidence === "medium")
      .length;
    const low = allCorrelations.filter((c) => c.confidence === "low").length;

    const avgScore =
      allCorrelations.length > 0
        ? Math.round(
            allCorrelations.reduce((sum, c) => sum + c.correlationScore, 0) /
              allCorrelations.length
          )
        : 0;

    return {
      totalCorrelations: allCorrelations.length,
      highConfidence: high,
      mediumConfidence: medium,
      lowConfidence: low,
      averageScore: avgScore,
    };
  }

  // Forensic Reports
  async getAllReports(): Promise<ForensicReport[]> {
    return Array.from(this.reports.values()).sort(
      (a, b) =>
        (b.generatedAt?.getTime() || 0) - (a.generatedAt?.getTime() || 0)
    );
  }

  async getReportById(id: string): Promise<ForensicReport | undefined> {
    return this.reports.get(id);
  }

  async createReport(
    insertReport: InsertForensicReport
  ): Promise<ForensicReport> {
    const id = randomUUID();
    const report: ForensicReport = {
      ...insertReport,
      id,
      generatedAt: new Date(),
    };
    this.reports.set(id, report);
    return report;
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const allNodes = Array.from(this.nodes.values());
    const allCorrelations = Array.from(this.correlations.values());

    const entryNodes = allNodes.filter((n) => n.nodeType === "entry").length;
    const middleNodes = allNodes.filter((n) => n.nodeType === "middle").length;
    const exitNodes = allNodes.filter((n) => n.nodeType === "exit").length;

    const identifiedEntryNodes = new Set(
      allCorrelations.map((c) => c.entryNodeId).filter(Boolean)
    ).size;

    const avgConfidence =
      allCorrelations.length > 0
        ? Math.round(
            allCorrelations.reduce((sum, c) => sum + c.correlationScore, 0) /
              allCorrelations.length
          )
        : 0;

    return {
      totalNodes: allNodes.length,
      entryNodes,
      middleNodes,
      exitNodes,
      activeCorrelations: allCorrelations.length,
      identifiedEntryNodes,
      averageConfidence: avgConfidence,
      recentUploads: this.flows.size,
    };
  }
}

export const storage = new MemStorage();
