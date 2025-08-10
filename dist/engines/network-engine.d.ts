/**
 * Advanced Network Stack Fingerprinting Protection
 * TCP/IP, HTTP/2, TLS, WebSocket, DNS, and WebRTC fingerprinting emulation
 */
export interface NetworkEngineConfig {
    tcpStack: TCPStackConfig;
    tlsConfig: TLSConfig;
    http2Config: HTTP2Config;
    webSocketConfig: WebSocketConfig;
    dnsConfig: DNSConfig;
    webRTCConfig: WebRTCConfig;
    timingConfig: NetworkTimingConfig;
    behaviorConfig: NetworkBehaviorConfig;
}
export interface TCPStackConfig {
    operatingSystem: 'windows' | 'macos' | 'linux' | 'android' | 'ios';
    version: string;
    windowSize: number;
    maxSegmentSize: number;
    windowScaling: boolean;
    selectiveAck: boolean;
    timestamps: boolean;
    congestionControl: 'cubic' | 'reno' | 'bbr' | 'vegas';
    fastOpen: boolean;
    keepAlive: {
        enabled: boolean;
        time: number;
        interval: number;
        probes: number;
    };
}
export interface TLSConfig {
    version: string;
    cipherSuites: string[];
    signatureAlgorithms: string[];
    supportedGroups: string[];
    extensions: TLSExtension[];
    compressionMethods: string[];
    sessionResumption: boolean;
    ocspStapling: boolean;
    serverNameIndication: boolean;
}
export interface TLSExtension {
    type: number;
    name: string;
    data?: any;
}
export interface HTTP2Config {
    enabled: boolean;
    settings: {
        headerTableSize: number;
        enablePush: boolean;
        maxConcurrentStreams: number;
        initialWindowSize: number;
        maxFrameSize: number;
        maxHeaderListSize: number;
    };
    prioritization: {
        enabled: boolean;
        dependencies: boolean;
        weights: boolean;
    };
    serverPush: boolean;
    streamMultiplexing: number;
}
export interface WebSocketConfig {
    protocols: string[];
    extensions: string[];
    maxFrameSize: number;
    compression: boolean;
    pingInterval: number;
    pongTimeout: number;
    closeTimeout: number;
    bufferSize: number;
}
export interface DNSConfig {
    servers: string[];
    protocol: 'udp' | 'tcp' | 'https' | 'tls';
    timeout: number;
    retries: number;
    caching: {
        enabled: boolean;
        ttl: number;
        maxEntries: number;
    };
    dnssec: boolean;
    prefetch: boolean;
    over_https: {
        enabled: boolean;
        url: string;
    };
}
export interface WebRTCConfig {
    iceServers: RTCIceServer[];
    iceCandidatePoolSize: number;
    bundlePolicy: RTCBundlePolicy;
    rtcpMuxPolicy: RTCRtcpMuxPolicy;
    iceTransportPolicy: RTCIceTransportPolicy;
    codecs: {
        audio: string[];
        video: string[];
    };
    mediaConstraints: {
        audio: MediaTrackConstraints;
        video: MediaTrackConstraints;
    };
    stunBinding: {
        enabled: boolean;
        timeout: number;
    };
}
export interface NetworkTimingConfig {
    rtt: {
        min: number;
        max: number;
        jitter: number;
    };
    bandwidth: {
        download: number;
        upload: number;
        latency: number;
    };
    packetLoss: number;
    reordering: number;
    duplication: number;
}
export interface NetworkBehaviorConfig {
    connectionPooling: boolean;
    keepAliveTimeout: number;
    maxConnections: number;
    pipelining: boolean;
    multiplexing: boolean;
    earlyData: boolean;
    fastFallback: boolean;
    happyEyeballs: boolean;
}
export declare class NetworkEngineEmulator {
    private config;
    private connectionPool;
    private dnsCache;
    private tlsSessionCache;
    private networkMetrics;
    constructor(config: NetworkEngineConfig);
    private initializeDNSCache;
    private generateRandomIP;
    private startNetworkSimulation;
    private updateNetworkConditions;
    private cleanupExpiredConnections;
    private updateDNSCache;
    getInjectionScript(): string;
    private getTCPStackScript;
    private getTLSScript;
    private getHTTP2Script;
    private getWebSocketScript;
    private getDNSScript;
    private getAdvancedWebRTCScript;
    private getNetworkTimingScript;
    private getConnectionBehaviorScript;
    private getPacketAnalysisScript;
    private getNetworkInterfaceScript;
}
export declare const networkConfigs: Record<string, NetworkEngineConfig>;
//# sourceMappingURL=network-engine.d.ts.map