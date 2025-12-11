export interface PaymentData {
  id: string
  amount: number
  description: string
  timestamp: number
}

export interface PaymentResponse {
  id: string
  success: boolean
  message: string
  timestamp: number
}

export interface DeviceInfo {
  name: string
  host: string
  port: number
  addresses: string[]
}

export interface ConnectionStatus {
  isConnected: boolean
  deviceName?: string
  address?: string
}

export interface SlaveDevice {
  id: string
  name: string
  status: "connected" | "disconnected" | "pairing"
}

export interface SlaveConfig {
  device: SlaveDevice | null
  isEnabled: boolean
}

export type AppMode = "normal" | "slave"

export type RootStackParamList = {
  Normal: undefined
  Slave: undefined
}

export type NormalStackParamList = {
  Home: undefined
  Settings: undefined
  SlaveConfig: undefined
}

export type SlaveStackParamList = {
  SlavePayment: { paymentData: PaymentData }
  SlaveTrouble: undefined
  SlaveWaiting: undefined
}

export interface TcpSocketOptions {
  allowHalfOpen?: boolean
  family?: number
  host?: string
  localAddress?: string
  localPort?: number
  port: number
}

export interface TcpSocket {
  destroy(): void
  end(): void
  localAddress?: string
  localPort?: number
  on(event: "close", listener: () => void): void
  on(event: "connect", listener: () => void): void
  on(event: "data", listener: (data: Buffer) => void): void
  on(event: "error", listener: (error: Error) => void): void
  remoteAddress?: string
  remotePort?: number
  write(data: Buffer | string): boolean
}

export interface TcpServer {
  close(callback?: () => void): void
  listen(options: TcpSocketOptions, callback?: () => void): void
  on(event: "connection", listener: (socket: TcpSocket) => void): void
  on(event: "error", listener: (error: Error) => void): void
  on(event: "listening", listener: () => void): void
}

export interface ServerLog {
  message: string
  timestamp: string
  type: "error" | "info" | "success" | "warning"
  category?: LogCategory
  metadata?: Record<string, any>
}

export interface SlaveServiceState {
  connectedClientsCount: number
  isListening: boolean
  logs: ServerLog[]
  processedPayments: PaymentResponse[]
  serverPort: number
  serviceName: string
}

// Error handling types
export type ErrorSeverity = "low" | "medium" | "high" | "critical"

export type LogCategory = "connection" | "payment" | "server" | "network" | "authentication" | "validation" | "system"

export interface ErrorDetails {
  code: string
  message: string
  severity: ErrorSeverity
  category: LogCategory
  timestamp: number
  stack?: string
  metadata?: Record<string, any>
  retryable: boolean
  retryCount?: number
  maxRetries?: number
}

export interface LogEntry {
  id: string
  timestamp: number
  level: "debug" | "info" | "warn" | "error" | "fatal"
  category: LogCategory
  message: string
  metadata?: Record<string, any>
  error?: ErrorDetails
  source: string
}

export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryableErrors: string[]
}

export interface NetworkHealth {
  isOnline: boolean
  latency?: number
  lastCheck: number
  consecutiveFailures: number
}

export interface SystemMetrics {
  memoryUsage: number
  cpuUsage: number
  networkHealth: NetworkHealth
  uptime: number
  errorRate: number
  lastUpdated: number
}
