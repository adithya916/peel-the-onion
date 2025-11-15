import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// TOR Node/Relay Schema
export const torNodes = pgTable("tor_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fingerprint: text("fingerprint").notNull().unique(),
  nickname: text("nickname").notNull(),
  ipAddress: text("ip_address").notNull(),
  orPort: integer("or_port").notNull(),
  nodeType: text("node_type").notNull(), // 'entry', 'middle', 'exit'
  flags: text("flags").array().default(sql`ARRAY[]::text[]`),
  bandwidth: integer("bandwidth"),
  country: text("country"),
  lastSeen: timestamp("last_seen"),
  metadata: jsonb("metadata"),
});

// Traffic Flow Schema
export const trafficFlows = pgTable("traffic_flows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  packetCount: integer("packet_count").notNull(),
  totalSize: integer("total_size").notNull(),
  duration: integer("duration"), // in seconds
  metadata: jsonb("metadata"),
  parsedData: jsonb("parsed_data"),
});

// Correlation Result Schema
export const correlations = pgTable("correlations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entryNodeId: varchar("entry_node_id").references(() => torNodes.id),
  exitNodeId: varchar("exit_node_id").references(() => torNodes.id),
  trafficFlowId: varchar("traffic_flow_id").references(() => trafficFlows.id),
  correlationScore: integer("correlation_score").notNull(), // 0-100
  confidence: text("confidence").notNull(), // 'high', 'medium', 'low'
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"),
});

// Forensic Report Schema
export const forensicReports = pgTable("forensic_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
  reportType: text("report_type").notNull(), // 'full', 'summary', 'node-specific'
  nodeCount: integer("node_count"),
  correlationCount: integer("correlation_count"),
  confidenceAverage: integer("confidence_average"),
  data: jsonb("data").notNull(),
  exported: boolean("exported").default(false),
});

// Insert Schemas
export const insertTorNodeSchema = createInsertSchema(torNodes).omit({
  id: true,
  lastSeen: true,
});

export const insertTrafficFlowSchema = createInsertSchema(trafficFlows).omit({
  id: true,
  uploadedAt: true,
});

export const insertCorrelationSchema = createInsertSchema(correlations).omit({
  id: true,
  timestamp: true,
});

export const insertForensicReportSchema = createInsertSchema(forensicReports).omit({
  id: true,
  generatedAt: true,
});

// TypeScript Types
export type TorNode = typeof torNodes.$inferSelect;
export type InsertTorNode = z.infer<typeof insertTorNodeSchema>;

export type TrafficFlow = typeof trafficFlows.$inferSelect;
export type InsertTrafficFlow = z.infer<typeof insertTrafficFlowSchema>;

export type Correlation = typeof correlations.$inferSelect;
export type InsertCorrelation = z.infer<typeof insertCorrelationSchema>;

export type ForensicReport = typeof forensicReports.$inferSelect;
export type InsertForensicReport = z.infer<typeof insertForensicReportSchema>;

// Additional types for frontend use
export interface NetworkTopologyNode {
  id: string;
  fingerprint: string;
  nickname: string;
  ipAddress: string;
  nodeType: 'entry' | 'middle' | 'exit';
  x?: number;
  y?: number;
  connections: string[];
}

export interface CorrelationMetrics {
  totalCorrelations: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
  averageScore: number;
}

export interface DashboardStats {
  totalNodes: number;
  entryNodes: number;
  middleNodes: number;
  exitNodes: number;
  activeCorrelations: number;
  identifiedEntryNodes: number;
  averageConfidence: number;
  recentUploads: number;
}
