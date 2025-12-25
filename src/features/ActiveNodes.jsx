import { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SignalHigh, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Cpu, MemoryStick, HardDrive, Wifi, Clock, History, CalendarClock, CreditCard, Wallet, DollarSign, CheckSquare, Zap, Database, ClipboardList, FileText, Inbox } from "lucide-react";
import { api } from "@/api/netrumApi";

const highlightAnimationStyles = `
  @keyframes purpleBlink {
    0%, 100% { 
      background-color: rgba(147, 51, 234, 0.3); 
      box-shadow: 0 0 10px rgba(147, 51, 234, 0.5);
    }
    50% { 
      background-color: rgba(147, 51, 234, 0.6); 
      box-shadow: 0 0 20px rgba(147, 51, 234, 0.8);
    }
  }
  
  .purple-blink {
    animation: purpleBlink 1s ease-in-out infinite;
  }
  
  .purple-fixed {
    background-color: rgba(147, 51, 234, 0.4) !important;
    box-shadow: 0 0 15px rgba(147, 51, 234, 0.6);
  }
`;

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ActiveNodes() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const nodesPerPage = 10;

  const [rawAddress, setRawAddress] = useState("");
  const [address, setAddress] = useState("");
  const [nodeId, setNodeId] = useState(null);
  const [error, setError] = useState("");
  const [cooldownActive, setCooldownActive] = useState(false);
  const [activeAddress, setActiveAddress] = useState("");
  const [highlightedRows, setHighlightedRows] = useState(new Set());

  const hoveringCardRef = useRef(false);
  const closeTimerRef = useRef(null);
  const previousRawAddressRef = useRef("");

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = highlightAnimationStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    api.activeNodes().then((r) => {
      if (!mounted) return;
      setLoading(false);

      if (r?.error || r?.cooldown) return;

      const list = Array.isArray(r?.nodes) ? r.nodes : [];
      setNodes(list);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const currentAddress = rawAddress;
    const previousAddress = previousRawAddressRef.current;
    
    if (currentAddress && previousAddress && currentAddress !== previousAddress) {
      setActiveAddress("");
    }
    
    if (!currentAddress && previousAddress) {
      const nodeElement = document.querySelector(`[data-wallet="${previousAddress}"]`);
      if (nodeElement) {
        nodeElement.classList.remove('purple-blink', 'purple-fixed');
      }
      setHighlightedRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(previousAddress);
        return newSet;
      });
    }
    
    previousRawAddressRef.current = currentAddress;
  }, [rawAddress]);

  useEffect(() => {
    if (!rawAddress) {
      setAddress("");
      setError("");
      setNodeId(null);
      setActiveAddress("");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(rawAddress)) {
      setAddress("");
      setError("Invalid wallet address. Must start with 0x and be 42 chars long.");
      setNodeId(null);
      setActiveAddress("");
      return;
    }

    const timer = setTimeout(async () => {
      setCooldownActive(true);
      setAddress(rawAddress);
      setError("");
      setActiveAddress("");

      try {
        const nodeIdFromHistory = await api.claimHistoryNodeId(rawAddress);
        setNodeId(nodeIdFromHistory);
        
        setActiveAddress(rawAddress);
        
        setTimeout(async () => {
          const nodeIndex = nodes.findIndex(node => 
            node.wallet === rawAddress || node.address === rawAddress
          );
          
          if (nodeIndex !== -1) {
            const targetPage = Math.floor(nodeIndex / nodesPerPage) + 1;
            
            if (targetPage !== currentPage) {
              setCurrentPage(targetPage);
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            const nodeElement = document.querySelector(`[data-wallet="${rawAddress}"]`);
            if (nodeElement) {
              nodeElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              });
              
              setHighlightedRows(prev => new Set([...prev, rawAddress]));
              
              nodeElement.classList.add('purple-blink');
              
              setTimeout(() => {
                nodeElement.classList.remove('purple-blink');
                nodeElement.classList.add('purple-fixed');
              }, 5000);
            }
          }
        }, 100);
      } catch {
        setNodeId(null);
        setActiveAddress("");
      } finally {
        setCooldownActive(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [rawAddress, nodes]);

  useEffect(() => {
    if (!rawAddress || nodes.length === 0 || activeAddress) return;

    const matchingNode = nodes.find(node => 
      node.wallet === rawAddress || node.address === rawAddress
    );
    
    if (matchingNode) {
      setActiveAddress(rawAddress);
      
      setTimeout(() => {
            const nodeElement = document.querySelector(`[data-wallet="${rawAddress}"]`);
            if (nodeElement) {
              setHighlightedRows(prev => new Set([...prev, rawAddress]));
              
              nodeElement.classList.add('purple-blink');
              
              setTimeout(() => {
                nodeElement.classList.remove('purple-blink');
                nodeElement.classList.add('purple-fixed');
              }, 5000);
            }
      }, 200);
    }
  }, [nodes, rawAddress]);

  const truncateAddress = (addr) => {
    if (!addr) return 'N/A';
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatNodeId = (nodeId) => {
    if (!nodeId) return 'N/A';
    
    const netrumIndex = nodeId.indexOf('netrum.lite.');
    const baseEthIndex = nodeId.indexOf('.base.eth');
    
    if (netrumIndex !== -1 && baseEthIndex !== -1 && baseEthIndex > netrumIndex) {
      const afterNetrum = netrumIndex + 'netrum.lite.'.length;
      const first3Chars = nodeId.substring(afterNetrum, afterNetrum + 3);
      
      const beforeBaseEth = baseEthIndex;
      const last3Chars = nodeId.substring(beforeBaseEth - 3, beforeBaseEth);
      
      return `netrum.lite.${first3Chars}...${last3Chars}.base.eth`;
    }
    
    if (nodeId.length > 30) {
      return `${nodeId.substring(0, 12)}...${nodeId.substring(nodeId.length - 10)}`;
    }
    
    return nodeId;
  };

  const getStatusBadge = (node) => {
    const status = node.nodeStatus || node.status;
    const isActive = status === 'Active' || status === 'active' || status === 'online';
    
    return isActive ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
        <XCircle className="w-3 h-3" />
        Idle
      </span>
    );
  };

  const [nodeMetricsCache, setNodeMetricsCache] = useState({});
  const [loadingMetrics, setLoadingMetrics] = useState({});
  const [selectedNodeMetrics, setSelectedNodeMetrics] = useState(null);
  
  const [miningCache, setMiningCache] = useState({});
  const [selectedNodeMining, setSelectedNodeMining] = useState(null);
  const [loadingMining, setLoadingMining] = useState({});
  
  const [balancesCache, setBalancesCache] = useState({});
  const [selectedNodeBalances, setSelectedNodeBalances] = useState(null);
  const [loadingBalances, setLoadingBalances] = useState({});
  
  const [selectedNodeTaskStats, setSelectedNodeTaskStats] = useState(null);
  const [loadingTaskStats, setLoadingTaskStats] = useState({});
  
  const [dataReady, setDataReady] = useState(false);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [lastDataUpdate, setLastDataUpdate] = useState(null);

  const requestTrackerRef = useRef(new Map());
  const nodeSelectionTimerRef = useRef(null);
  const currentNodeIdRef = useRef(null);
  const abortControllerRef = useRef(null);

  const getNodeByAddress = (address) => {
    return nodes.find(node => 
      node.wallet === address || node.address === address
    );
  };

  const getNodeByNodeId = (nodeId) => {
    return nodes.find(node => 
      node.nodeId === nodeId || node.id === nodeId
    );
  };

  const getNodeIdFromAddress = (address) => {
    const node = getNodeByAddress(address);
    return node?.nodeId || node?.id || null;
  };

  const getAddressFromNodeId = (nodeId) => {
    const node = getNodeByNodeId(nodeId);
    return node?.wallet || node?.address || null;
  };

  const fetchBalances = async (address, nodeId) => {
    if (!address) return null;

    if (requestTrackerRef.current.has(`balances_${address}`)) {
      const previousRequest = requestTrackerRef.current.get(`balances_${address}`);
      if (previousRequest?.controller) {
        previousRequest.controller.abort();
      }
    }

    const controller = new AbortController();
    const requestId = `balances_${address}_${Date.now()}`;
    requestTrackerRef.current.set(`balances_${address}`, { controller, requestId, nodeId });

    if (balancesCache[address] && currentNodeIdRef.current === nodeId) {
      return balancesCache[address];
    }

    setLoadingBalances(prev => ({ ...prev, [address]: true }));

    try {
      const RPC = "https://base-rpc.publicnode.com";
      const NPT_CONTRACT = "0xB8c2CE84F831175136cebBFD48CE4BAb9c7a6424";
      const walletHex = address.replace("0x", "");

      const [ethRes, nptRes, priceRes] = await Promise.all([
        fetch(RPC, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_getBalance",
            params: [address, "latest"],
          }),
        }).then(r => r.json()).catch(() => null),
        
        fetch(RPC, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 2,
            method: "eth_call",
            params: [
              {
                to: NPT_CONTRACT,
                data: `0x70a08231000000000000000000000000${walletHex}`,
              },
              "latest",
            ],
          }),
        }).then(r => r.json()).catch(() => null),
        
        fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd", {
          signal: controller.signal
        }).then(r => r.json()).catch(() => null)
      ]);

      const tracker = requestTrackerRef.current.get(`balances_${address}`);
      if (!tracker || tracker.requestId !== requestId || currentNodeIdRef.current !== nodeId) {
        return null; 
      }

      const eth = parseInt(ethRes?.result || "0x0", 16) / 1e18;
      const npt = parseInt(nptRes?.result || "0x0", 16) / 1e18;
      const ethUsd = Number(priceRes?.ethereum?.usd || 0);

      const result = {
        eth: isNaN(eth) ? 0 : eth,
        npt: isNaN(npt) ? 0 : npt,
        usd: isNaN(eth) ? 0 : eth * ethUsd,
      };

      if (currentNodeIdRef.current === nodeId) {
        setBalancesCache(prev => ({ ...prev, [address]: result }));
      }
      
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.warn('Failed to fetch balances:', error);
      }
      return null;
    } finally {
      setLoadingBalances(prev => ({ ...prev, [address]: false }));
      requestTrackerRef.current.delete(`balances_${address}`);
    }
  };

  const fetchTaskStats = async (nodeId) => {
    if (!nodeId) return null;

    if (requestTrackerRef.current.has(`taskStats_${nodeId}`)) {
      const previousRequest = requestTrackerRef.current.get(`taskStats_${nodeId}`);
      if (previousRequest?.controller) {
        previousRequest.controller.abort();
      }
    }

    const controller = new AbortController();
    const requestId = `taskStats_${nodeId}_${Date.now()}`;
    requestTrackerRef.current.set(`taskStats_${nodeId}`, { controller, requestId, nodeId });

    if (nodeMetricsCache[nodeId]?.taskStats && currentNodeIdRef.current === nodeId) {
      return nodeMetricsCache[nodeId].taskStats;
    }

    try {
      const r = await api.taskStats?.(nodeId).catch(() => null);

      const tracker = requestTrackerRef.current.get(`taskStats_${nodeId}`);
      if (!tracker || tracker.requestId !== requestId || currentNodeIdRef.current !== nodeId) {
        return null; 
      }

      if (r && !r.error) {
        if (currentNodeIdRef.current === nodeId) {
          setNodeMetricsCache(prev => ({
            ...prev,
            [nodeId]: {
              ...prev[nodeId],
              taskStats: r
            }
          }));
        }
        return r;
      }
      return null;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.warn('Failed to fetch task stats:', error);
      }
      return null;
    } finally {
      requestTrackerRef.current.delete(`taskStats_${nodeId}`);
    }
  };

  const getNodeMetricsFromAPI = async (identifier) => {
    if (!identifier) return null;
    
    const nodeId = identifier.startsWith('0x') ? getNodeIdFromAddress(identifier) : identifier;
    if (!nodeId) return null;

    if (requestTrackerRef.current.has(`metrics_${nodeId}`)) {
      const previousRequest = requestTrackerRef.current.get(`metrics_${nodeId}`);
      if (previousRequest?.controller) {
        previousRequest.controller.abort();
      }
    }

    const controller = new AbortController();
    const requestId = `metrics_${nodeId}_${Date.now()}`;
    requestTrackerRef.current.set(`metrics_${nodeId}`, { controller, requestId, nodeId });
    
    if (nodeMetricsCache[nodeId] && currentNodeIdRef.current === nodeId) {
      return nodeMetricsCache[nodeId];
    }

    setLoadingMetrics(prev => ({ ...prev, [nodeId]: true }));

    try {
      const res = await api.checkCooldown(nodeId);
      
      const tracker = requestTrackerRef.current.get(`metrics_${nodeId}`);
      if (!tracker || tracker.requestId !== requestId || currentNodeIdRef.current !== nodeId) {
        return null;
      }

      const lastSync = res?.lastSuccessfulSync?.details || {};
      const metrics = lastSync.metrics || {};
      const meetsRequirements = lastSync?.meetsRequirements ?? null;
      
      const result = {
        metrics,
        meetsRequirements,
        lastSyncTimestamp: res?.lastSuccessfulSync?.timestamp || null,
        nodeId: nodeId,
        address: getAddressFromNodeId(nodeId)
      };

      if (currentNodeIdRef.current === nodeId) {
        setNodeMetricsCache(prev => ({ ...prev, [nodeId]: result }));
      }
      
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.warn('Failed to fetch node metrics:', error);
      }
      return null;
    } finally {
      setLoadingMetrics(prev => ({ ...prev, [nodeId]: false }));
      requestTrackerRef.current.delete(`metrics_${nodeId}`);
    }
  };

  useEffect(() => {
    if (!selectedNode) {
      setSelectedNodeMetrics(null);
      setSelectedNodeMining(null);
      setSelectedNodeTaskStats(null);
      setSelectedNodeBalances(null);
      setDataReady(false);
      setIsExpanded(false);
      setLastDataUpdate(null);
      currentNodeIdRef.current = null;
      
      requestTrackerRef.current.forEach((request, key) => {
        if (request.controller) {
          request.controller.abort();
        }
      });
      requestTrackerRef.current.clear();
      return;
    }

    const identifier = selectedNode.wallet || selectedNode.address || selectedNode.nodeId || selectedNode.id;
    if (!identifier) {
      setSelectedNodeMetrics(null);
      setSelectedNodeMining(null);
      setSelectedNodeTaskStats(null);
      setSelectedNodeBalances(null);
      setDataReady(false);
      return;
    }

    if (nodeSelectionTimerRef.current) {
      clearTimeout(nodeSelectionTimerRef.current);
      nodeSelectionTimerRef.current = null;
    }

    const nodeId = identifier.startsWith('0x') ? getNodeIdFromAddress(identifier) : identifier;
    currentNodeIdRef.current = nodeId;

    nodeSelectionTimerRef.current = setTimeout(async () => {
      if (nodeId) {
        setNodeMetricsCache(prev => {
          const newCache = { ...prev };
          delete newCache[nodeId];
          return newCache;
        });
        setMiningCache(prev => {
          const newCache = { ...prev };
          delete newCache[nodeId];
          return newCache;
        });
      }

      const address = identifier.startsWith('0x') ? identifier : getAddressFromNodeId(identifier);
      if (address) {
        setBalancesCache(prev => {
          const newCache = { ...prev };
          delete newCache[address];
          return newCache;
        });
      }
      
      setDataReady(false);
      
      const [metricsResult, miningResult, balancesResult, taskStatsResult] = await Promise.all([
        getNodeMetricsFromAPI(identifier),
        (async () => {
          const nodeId = identifier.startsWith('0x') ? getNodeIdFromAddress(identifier) : identifier;
          if (nodeId) {
            return await loadMiningData(nodeId, identifier);
          }
          return null;
        })(),
        (async () => {
          const address = identifier.startsWith('0x') ? identifier : getAddressFromNodeId(identifier);
          if (address) {
            return await fetchBalances(address, nodeId);
          }
          return null;
        })(),
        (async () => {
          const nodeId = identifier.startsWith('0x') ? getNodeIdFromAddress(identifier) : identifier;
          if (nodeId) {
            return await fetchTaskStats(nodeId);
          }
          return null;
        })()
      ]);

      if (currentNodeIdRef.current === nodeId) {
        setSelectedNodeMetrics(metricsResult);
        if (miningResult !== null) {
          setSelectedNodeMining(miningResult);
        }
        if (balancesResult !== null) {
          setSelectedNodeBalances(balancesResult);
        }
        if (taskStatsResult !== null) {
          setSelectedNodeTaskStats(taskStatsResult);
        }
        
        setLastDataUpdate(new Date().toISOString());
        setDataReady(true);
      }
    }, 150);

    return () => {
      if (nodeSelectionTimerRef.current) {
        clearTimeout(nodeSelectionTimerRef.current);
        nodeSelectionTimerRef.current = null;
      }
    };
  }, [selectedNode]);

  const [countdown, setCountdown] = useState(300);
  const [countdownInterval, setCountdownInterval] = useState(null);

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };



  useEffect(() => {
    if (!selectedNode || !dataReady) {
      if (countdownInterval) {
        clearInterval(countdownInterval);
        setCountdownInterval(null);
      }
      setCountdown(300);
      return;
    }

    setCountdown(300);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          const identifier = selectedNode.wallet || selectedNode.address || selectedNode.nodeId || selectedNode.id;
          if (!identifier) return 300;

          const refreshData = async () => {
            setIsRefreshing(true);
            try {
              const nodeId = identifier.startsWith('0x') ? getNodeIdFromAddress(identifier) : identifier;
              const address = identifier.startsWith('0x') ? identifier : getAddressFromNodeId(identifier);

              if (currentNodeIdRef.current !== nodeId) {
                console.log('Auto-refresh cancelled: node changed during refresh');
                return;
              }

              if (requestTrackerRef.current.has(`refresh_${nodeId}`)) {
                const previousRequest = requestTrackerRef.current.get(`refresh_${nodeId}`);
                if (previousRequest?.controller) {
                  previousRequest.controller.abort();
                }
              }

              const controller = new AbortController();
              const requestId = `refresh_${nodeId}_${Date.now()}`;
              requestTrackerRef.current.set(`refresh_${nodeId}`, { controller, requestId, nodeId });

              if (nodeId) {
                setNodeMetricsCache(prev => {
                  const newCache = { ...prev };
                  delete newCache[nodeId];
                  return newCache;
                });
                setMiningCache(prev => {
                  const newCache = { ...prev };
                  delete newCache[nodeId];
                  return newCache;
                });
              }
              if (address) {
                setBalancesCache(prev => {
                  const newCache = { ...prev };
                  delete newCache[address];
                  return newCache;
                });
              }
              
              const [metricsResult, miningResult, balancesResult, taskStatsResult] = await Promise.all([
                getNodeMetricsFromAPI(identifier),
                (async () => {
                  const nodeId = identifier.startsWith('0x') ? getNodeIdFromAddress(identifier) : identifier;
                  if (nodeId) {
                    return await loadMiningData(nodeId, identifier);
                  }
                  return null;
                })(),
                (async () => {
                  const address = identifier.startsWith('0x') ? identifier : getAddressFromNodeId(identifier);
                  if (address) {
                    return await fetchBalances(address, nodeId);
                  }
                  return null;
                })(),
                (async () => {
                  const nodeId = identifier.startsWith('0x') ? getNodeIdFromAddress(identifier) : identifier;
                  if (nodeId) {
                    return await fetchTaskStats(nodeId);
                  }
                  return null;
                })()
              ]);

              if (currentNodeIdRef.current !== nodeId) {
                console.log('Auto-refresh response ignored: node changed during refresh');
                return;
              }

              setSelectedNodeMetrics(metricsResult);
              if (miningResult !== null) {
                setSelectedNodeMining(miningResult);
              }
              if (balancesResult !== null) {
                setSelectedNodeBalances(balancesResult);
              }
              if (taskStatsResult !== null) {
                setSelectedNodeTaskStats(taskStatsResult);
              }
              
              setLastDataUpdate(new Date().toISOString());
            } catch (error) {
              if (error.name !== 'AbortError') {
                console.warn('Auto refresh failed:', error);
              }
            } finally {
              setIsRefreshing(false);
              requestTrackerRef.current.delete(`refresh_${nodeId}`);
            }
          };

          refreshData();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    setCountdownInterval(interval);

    return () => {
      clearInterval(interval);
    };
  }, [selectedNode, dataReady]);

  const loadMiningData = async (nodeId, identifier) => {
    const address = identifier.startsWith('0x') ? identifier : getAddressFromNodeId(nodeId);
    if (!address) return null;

    if (requestTrackerRef.current.has(`mining_${nodeId}`)) {
      const previousRequest = requestTrackerRef.current.get(`mining_${nodeId}`);
      if (previousRequest?.controller) {
        previousRequest.controller.abort();
      }
    }

    const controller = new AbortController();
    const requestId = `mining_${nodeId}_${Date.now()}`;
    requestTrackerRef.current.set(`mining_${nodeId}`, { controller, requestId, nodeId });

    if (miningCache[nodeId] && currentNodeIdRef.current === nodeId) {
      return miningCache[nodeId];
    }

    setLoadingMining(prev => ({ ...prev, [nodeId]: true }));

    try {
      const [miningData, claimData, debugData] = await Promise.all([
        api.miningCooldown(nodeId).catch(() => null),
        api.claim(address).catch(() => null),
        api.miningDebugContract(address).catch(() => null),
      ]);

      const tracker = requestTrackerRef.current.get(`mining_${nodeId}`);
      if (!tracker || tracker.requestId !== requestId || currentNodeIdRef.current !== nodeId) {
        return null;
      }

      const minedTokens = parseFloat(claimData?.minedTokensFormatted ?? miningData?.minedTokens ?? 0);
      const miningSpeed = debugData?.contract?.miningInfo?.speedPerSec ? 
        parseFloat(debugData.contract.miningInfo.speedPerSec) : null;
      const percentComplete = debugData?.contract?.miningInfo?.percentCompleteNumber ? 
        parseFloat(debugData.contract.miningInfo.percentCompleteNumber) / 100 : null;

      const miningResult = {
        canStartMining: miningData?.canStartMining ?? null,
        lastMiningStart: miningData?.lastMiningStart ?? null,
        minedTokens: isNaN(minedTokens) ? null : minedTokens,
        canClaim: claimData?.canClaim ?? null,
        miningSpeed: miningSpeed,
        percentComplete: percentComplete,
        formattedRemainingTime: claimData?.miningSession?.formattedRemainingTime ?? null,
        lastClaimTime: claimData?.lastClaimTime ?? null,
        nodeId: nodeId,
        address: address
      };

      if (currentNodeIdRef.current === nodeId) {
        setMiningCache(prev => ({ ...prev, [nodeId]: miningResult }));
      }
      
      return miningResult;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.warn('Failed to fetch mining data:', error);
      }
      return null;
    } finally {
      setLoadingMining(prev => ({ ...prev, [nodeId]: false }));
      requestTrackerRef.current.delete(`mining_${nodeId}`);
    }
  };

  const formatDateTimeInline = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const formatTime = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const getMetrics = (node) => {
    const metrics = typeof node.nodeMetrics === 'object' && node.nodeMetrics !== null 
      ? node.nodeMetrics 
      : null;
    return metrics;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return String(timestamp);
    }
  };

  const displayWalletAddress = (addr) => {
    if (!addr) return 'N/A';
    return addr;
  };

  const fmtNumber = (n, d = 2) =>
    Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  const fmtInteger = (n) =>
    Number(n || 0).toLocaleString("en-US");

  const fmtMiningSpeed = (speed) => {
    if (speed === null) return 'N/A';
    const formatted = (speed / 1e18).toFixed(8);
    return `${formatted}/s`;
  };

  const totalPages = Math.ceil(nodes.length / nodesPerPage);
  const startIndex = (currentPage - 1) * nodesPerPage;
  const endIndex = startIndex + nodesPerPage;
  const currentNodes = nodes.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const tooltipStyle = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
  `;

  const MetricsSkeleton = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
            <div className="w-6 h-6 bg-slate-600 rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-2 bg-slate-600 rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-slate-600 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded border border-slate-600/50">
        <div className="h-3 bg-slate-600 rounded animate-pulse w-24"></div>
        <div className="h-4 w-16 bg-slate-600 rounded animate-pulse"></div>
      </div>
    </div>
  );

  const BalancesSkeleton = () => (
    <div className="grid grid-cols-2 gap-2">
      {[1, 2].map((i) => (
        <div key={i} className="p-2 bg-slate-800/50 rounded border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-slate-600 rounded animate-pulse"></div>
            <div className="h-3 bg-slate-600 rounded animate-pulse w-8"></div>
          </div>
          <div className="h-4 bg-slate-600 rounded animate-pulse mb-1"></div>
          <div className="h-3 bg-slate-600 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );

  const MiningSkeleton = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
            <div className="w-6 h-6 bg-slate-600 rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-2 bg-slate-600 rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-slate-600 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 bg-slate-800/30 rounded border border-slate-600/50">
        <div className="flex justify-between text-xs mb-2">
          <div className="h-3 bg-slate-600 rounded animate-pulse w-20"></div>
          <div className="h-3 bg-slate-600 rounded animate-pulse w-12"></div>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
          <div className="h-full rounded-full bg-slate-600 animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  const TaskStatsSkeleton = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
            <div className="w-6 h-6 bg-slate-600 rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-2 bg-slate-600 rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-slate-600 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl">
      {error && (
        <div className="fixed top-24 right-4 z-[9999]">
          <div className="bg-red-100 dark:bg-red-900/80 text-red-800 dark:text-red-200 px-4 py-2 rounded-lg text-xs font-semibold shadow-lg border border-red-200/50 dark:border-red-700/50 animate-in slide-in-from-top-2 duration-200">
            {error}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 backdrop-blur-sm shadow-lg shadow-emerald-500/20">
            <SignalHigh className="h-4 w-4 text-emerald-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-lg font-bold text-white">
                Active Nodes
              </h2>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Live node activity and performance</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              className="bg-transparent border border-white/20 rounded-xl p-2 text-xs text-white placeholder-gray-400 w-96 pr-10"
              placeholder="🔍 Search Node Address"
              value={rawAddress}
              onChange={(e) => setRawAddress(e.target.value.trim())}
              readOnly={!!address}
              onCopy={(e) => address && e.preventDefault()}
              onCut={(e) => address && e.preventDefault()}
              onPaste={(e) => address && e.preventDefault()}
              onMouseDown={(e) => address && e.preventDefault()}
              onSelect={(e) => address && e.preventDefault()}
              style={{
                userSelect: address ? "none" : "text",
                pointerEvents: "auto",
              }}
            />
            
            {cooldownActive && (
              <div className="absolute inset-y-0 right-8 flex items-center">
                <div className="h-4 w-4 border-2 border-transparent border-t-emerald-400 border-r-teal-400 rounded-full animate-spin" />
              </div>
            )}

            {rawAddress && (
              <button
                onClick={() => {
                  setRawAddress("");
                  setAddress("");
                  setNodeId(null);
                  setError("");
                }}
                className="absolute inset-y-0 right-2 flex items-center text-red-500 hover:text-red-400 text-xs"
                type="button"
              >
                ❌
              </button>
            )}
          </div>

          <span className="shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/50 text-orange-50 shadow-[0_0_8px_rgba(249,115,22,0.25)]">
            {nodes.length} nodes
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-600/30 bg-slate-800/30 backdrop-blur-sm overflow-hidden">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-slate-700/40 border-b border-slate-600/50">
              <TableHead className="h-12 px-2 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground">#</TableHead>
              <TableHead className="h-12 px-2 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Node ID
              </TableHead>
              <TableHead className="h-12 px-2 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Wallet
              </TableHead>
              <TableHead className="h-12 px-2 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Type
              </TableHead>
              <TableHead className="h-12 px-2 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="py-16">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="h-8 w-8 border-2 border-transparent border-t-emerald-400 border-r-teal-400 rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse">Loading active nodes...</p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              currentNodes.map((node, index) => (
                <TableRow
                  key={node._id || node.nodeId}
                  className={`group cursor-pointer transition-all duration-200 border-b border-slate-600/50 ${
                    index % 2 === 0 
                      ? 'bg-slate-800/20 hover:bg-slate-700/40' 
                      : 'bg-slate-700/10 hover:bg-slate-600/30'
                  }`}
                  data-wallet={node.wallet || node.address}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    if (closeTimerRef.current) {
                      window.clearTimeout(closeTimerRef.current);
                      closeTimerRef.current = null;
                    }
                    setSelectedNode(node);
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    closeTimerRef.current = window.setTimeout(() => {
                      if (!hoveringCardRef.current) {
                        setSelectedNode(null);
                      }
                    }, 150);
                  }}
                >
                  <TableCell className="px-2 py-3 text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {startIndex + index + 1}
                    </div>
                  </TableCell>

                  <TableCell className="px-2 py-3 text-left">
                    <div 
                      className="font-mono text-xs px-2 py-1 rounded border inline-block max-w-[240px] select-text"
                      style={{ 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: '#ffffff'
                      }}
                    >
                      {formatNodeId(node.nodeId || node.id)}
                    </div>
                  </TableCell>

                  <TableCell className="px-2 py-3 text-left">
                    <div 
                      className="font-mono text-xs px-2 py-1 rounded border inline-block max-w-[240px]"
                      style={{ 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: '#ffffff'
                      }}
                    >
                      {displayWalletAddress(node.wallet || node.address)}
                    </div>
                  </TableCell>

                  <TableCell className="px-2 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {node.type || 'Lite'}
                    </span>
                  </TableCell>

                  <TableCell className="px-2 py-3 text-center">
                    {getStatusBadge(node)}
                  </TableCell>
                </TableRow>
              ))}

            {!loading && nodes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <SignalHigh className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No active nodes found</p>
                    <p className="text-xs text-muted-foreground/70">Check back later for updates</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end mt-4 pt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                "inline-flex items-center justify-center w-8 h-8 rounded-full text-xs transition-colors",
                currentPage === 1
                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="text-xs text-muted-foreground px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={cn(
                "inline-flex items-center justify-center w-8 h-8 rounded-full text-xs transition-colors",
                currentPage === totalPages
                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {selectedNode && (
        <div
          style={{
            position: isExpanded ? 'absolute' : 'fixed',
            top: isExpanded ? '0' : '50%',
            left: isExpanded ? '0' : '50%',
            right: isExpanded ? '0' : 'auto',
            bottom: isExpanded ? '0' : 'auto',
            transform: isExpanded ? 'none' : 'translateX(-50%) translateY(-50%)',
            zIndex: isExpanded ? '9999' : '10000',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '10px',
            boxShadow: isExpanded ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(51, 65, 85, 0.3)',
            pointerEvents: 'auto',
            width: isExpanded ? '100%' : '900px',
            height: isExpanded ? '100%' : 'auto',
            maxHeight: isExpanded ? '100vh' : '60vh',
            overflowY: 'auto',
            backdropFilter: isExpanded ? 'none' : 'blur(16px)',
            animation: 'slideDown 0.3s ease-out'
          }}
          onMouseEnter={() => {
            hoveringCardRef.current = true;
            if (closeTimerRef.current) {
              window.clearTimeout(closeTimerRef.current);
              closeTimerRef.current = null;
            }
          }}
          onMouseLeave={() => {
            hoveringCardRef.current = false;
            if (!isExpanded) {
              setSelectedNode(null);
            }
          }}
        >
          <div 
            className="space-y-1 cursor-pointer"
            onClick={() => !isExpanded && setIsExpanded(true)}
          >
            <div className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-sm">Node Details</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    (selectedNode.nodeStatus || selectedNode.status) === 'Active' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-slate-600/50 text-slate-300 border border-slate-500/30'
                  }`}>
                    {(selectedNode.nodeStatus || selectedNode.status) || 'Unknown'}
                  </span>
                  
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs">
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
                    {isRefreshing ? 'Refreshing...' : `Next refresh: ${formatCountdown(countdown)}`}
                  </div>
                  
                  {!isExpanded && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(true);
                      }}
                      className="p-1 hover:bg-slate-600 rounded transition-colors"
                      title="Expand"
                    >
                      ➕
                    </button>
                  )}
                  {isExpanded && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(null);
                        setIsExpanded(false);
                      }}
                      className="p-1 hover:bg-red-600 rounded transition-colors text-red-400 hover:text-red-300"
                      title="Close"
                    >
                      ❌
                    </button>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {isRefreshing ? (
                  <>
                    <div className="h-3 w-3 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin"></div>
                    Refreshing...
                  </>
                ) : lastDataUpdate ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Updated {formatTime(lastDataUpdate)}
                  </>
                ) : (
                  <>
                    <div className="h-3 w-3 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin"></div>
                    Loading...
                  </>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-600/50 bg-slate-800/20 backdrop-blur-sm">
                <div className="p-2 border-b border-slate-600/50 bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-purple-500/20 border border-purple-500/30">
                      <SignalHigh className="w-3 h-3 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Node Information</h4>
                      <p className="text-[10px] text-slate-400">Basic node details</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-1">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs uppercase tracking-wider w-16 shrink-0">Node ID</span>
                      <span className="font-mono text-xs text-emerald-300 flex-1 break-all">
                        {selectedNode.nodeId || selectedNode.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs uppercase tracking-wider w-16 shrink-0">Wallet</span>
                      <span className="font-mono text-xs flex-1 break-all">
                        {displayWalletAddress(selectedNode.wallet || selectedNode.address)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs uppercase tracking-wider w-16 shrink-0">Type</span>
                      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-xs border border-cyan-500/30">
                        {selectedNode.type || 'Lite'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-600/50 bg-slate-800/20 backdrop-blur-sm">
                <div className="p-2 border-b border-slate-600/50 bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-cyan-500/20 border border-cyan-500/30">
                      <CreditCard className="w-3 h-3 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Wallet Balances</h4>
                      <p className="text-[10px] text-slate-400">Base Network</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-1">
                  {(() => {
                    const balances = selectedNodeBalances;
                    const isLoading = loadingBalances[selectedNode?.wallet || selectedNode?.address];

                    if (!dataReady || isLoading || !balances) {
                      return <BalancesSkeleton />;
                    }

                    return (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-slate-800/50 rounded border border-slate-700/50">
                          <div className="flex items-center gap-2 mb-1">
                            <Wallet className="w-3 h-3 text-indigo-400" />
                            <span className="text-[10px] text-slate-400">ETH</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-200">
                            {balances?.eth ? `${balances.eth.toFixed(4)} ETH` : '0.0000 ETH'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {balances?.usd ? `≈ $${balances.usd.toFixed(2)}` : '≈ $0.00'}
                          </p>
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded border border-slate-700/50">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-3 h-3 text-yellow-400" />
                            <span className="text-[10px] text-slate-400">NPT</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-200">
                            {balances?.npt ? balances.npt.toFixed(2) : '0.00'}
                          </p>
                          <p className="text-[10px] text-slate-400">Netrum Token</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="space-y-1 mt-1">
              <div className="grid md:grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-600/50 bg-slate-800/20 backdrop-blur-sm">
                  <div className="p-2 border-b border-slate-600/50 bg-slate-800/30">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-blue-500/20 border border-blue-500/30">
                        <Cpu className="w-3 h-3 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-200">Performance Metrics</h4>
                        <p className="text-[10px] text-slate-400">System specifications</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-1">
                    <div className="space-y-1">
                
                    {(() => {
                      const metrics = selectedNodeMetrics?.metrics;
                      const meetsRequirements = selectedNodeMetrics?.meetsRequirements;

                      if (!dataReady || loadingMetrics[selectedNode.nodeId || selectedNode.id] || !metrics) {
                        return (
                          <div className="space-y-1">
                            <div className="grid grid-cols-2 gap-2">
                              {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                                  <div className="w-6 h-6 bg-slate-600 rounded animate-pulse"></div>
                                  <div className="flex-1">
                                    <div className="h-2 bg-slate-600 rounded animate-pulse mb-1"></div>
                                    <div className="h-3 bg-slate-600 rounded animate-pulse"></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded border border-slate-600/50">
                              <div className="h-3 bg-slate-600 rounded animate-pulse w-24"></div>
                              <div className="h-4 w-16 bg-slate-600 rounded animate-pulse"></div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-1">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                                <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                                  <Cpu className="w-3 h-3 text-blue-400" />
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-400">CPU</div>
                                  <div className="text-xs font-semibold text-slate-200">
                                    {metrics?.cpu ? `${metrics.cpu} cores` : 'N/A'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                                <div className="w-6 h-6 bg-yellow-500/20 rounded flex items-center justify-center">
                                  <HardDrive className="w-3 h-3 text-yellow-400" />
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-400">Disk</div>
                                  <div className="text-xs font-semibold text-slate-200">
                                    {metrics?.diskGB ? `${metrics.diskGB} GB` : 'N/A'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                                <div className="w-5 h-5 bg-green-500/20 rounded flex items-center justify-center">
                                  {meetsRequirements === null || meetsRequirements === undefined ? (
                                    <div className="w-3 h-3 bg-slate-600 rounded animate-pulse"></div>
                                  ) : meetsRequirements ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <XCircle className="w-3 h-3 text-red-400" />
                                  )}
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-400">Meets Requirements</div>
                                  <div className="text-[10px] font-semibold text-slate-200">
                                    {meetsRequirements === null || meetsRequirements === undefined ? (
                                      <div className="h-3 bg-slate-600 rounded animate-pulse w-16"></div>
                                    ) : meetsRequirements ? (
                                      <span className="text-emerald-300">PASS</span>
                                    ) : (
                                      <span className="text-red-300">FAIL</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                                <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                                  <MemoryStick className="w-3 h-3 text-green-400" />
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-400">RAM</div>
                                  <div className="text-xs font-semibold text-slate-200">
                                    {metrics?.ramGB ? `${metrics.ramGB} GB` : 'N/A'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                                <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                                  <Wifi className="w-3 h-3 text-purple-400" />
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-400">Network</div>
                                  <div className="text-xs font-semibold text-slate-200">
                                    {metrics?.speedMbps ? 
                                      `↓ ${fmtNumber(metrics.speedMbps)} / ↑ ${metrics.uploadSpeedMbps ? fmtNumber(metrics.uploadSpeedMbps) : 'N/A'} Mbps` 
                                      : 'N/A'
                                    }
                                  </div>
                                </div>
                              </div>
                              
                              {selectedNode.createdAt && (
                                <div className="flex items-center gap-2 p-2 bg-purple-500/10 rounded border border-purple-500/20">
                                  <div className="w-5 h-5 bg-purple-500/20 rounded flex items-center justify-center">
                                    <Clock className="w-3 h-3 text-purple-400" />
                                  </div>
                                  <div>
                                    <div className="text-[10px] text-slate-400">Created At</div>
                                    <div className="text-[10px] font-semibold text-purple-300">{formatTimestamp(selectedNode.createdAt)}</div>
                                  </div>
                                </div>
                              )}
                              
                              {selectedNode.lastUpdated && (
                                <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                                  <div className="w-5 h-5 bg-blue-500/20 rounded flex items-center justify-center">
                                    <Clock className="w-3 h-3 text-blue-400" />
                                  </div>
                                  <div>
                                    <div className="text-[10px] text-slate-400">Last Updated</div>
                                    <div className="text-[10px] font-semibold text-blue-300">{formatTimestamp(selectedNode.lastUpdated)}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-600/50 bg-slate-800/20 backdrop-blur-sm">
                  <div className="p-2 border-b border-slate-600/50 bg-slate-800/30">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-green-500/20 border border-green-500/30">
                        <div className="w-3 h-3 text-green-400">⛏️</div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-200">Mining Data</h4>
                        <p className="text-[10px] text-slate-400">Mining statistics</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-1">
                    <div className="space-y-1">
                
                    {(() => {
                      const miningData = selectedNodeMining;

                      if (!dataReady || loadingMining[selectedNode.nodeId || selectedNode.id] || !miningData) {
                        return <MiningSkeleton />;
                      }

                      return (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                              <div className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center">
                                <div className="text-cyan-400 text-xs">💎</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400">Mined</div>
                                <div className="text-xs font-semibold text-slate-200">
                                  {miningData.minedTokens !== null ? `${miningData.minedTokens.toFixed(2)} NPT` : 'N/A'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                              <div className="w-6 h-6 bg-yellow-500/20 rounded flex items-center justify-center">
                                <div className="text-yellow-400 text-xs">⚡</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400">Speed</div>
                                <div className="text-xs font-semibold text-slate-200">
                                  {fmtMiningSpeed(miningData.miningSpeed)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                              <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                                <div className="text-green-400 text-xs">✅</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400">Claim</div>
                                <div className="text-xs font-semibold text-slate-200">
                                  {miningData.canClaim === null ? 'N/A' : 
                                    miningData.canClaim ? 'Available' : 'No'
                                  }
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                              <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                                <Clock className="w-3 h-3 text-purple-400" />
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400">Remaining</div>
                                <div className="text-xs font-semibold text-slate-200">
                                  {miningData.formattedRemainingTime || 'N/A'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                              <div className="w-6 h-6 bg-amber-500/20 rounded flex items-center justify-center">
                                <History className="w-3 h-3 text-amber-400" />
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400">Last Mining</div>
                                <div className="text-xs font-semibold text-slate-200">
                                  {miningData.lastMiningStart ? formatDateTimeInline(miningData.lastMiningStart) : 'N/A'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                              <div className="w-6 h-6 bg-emerald-500/20 rounded flex items-center justify-center">
                                <CalendarClock className="w-3 h-3 text-emerald-400" />
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400">Last Claim</div>
                                <div className="text-xs font-semibold text-slate-200">
                                  {miningData.lastClaimTime ? formatDateTimeInline(miningData.lastClaimTime) : 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-2 bg-slate-800/30 rounded border border-slate-600/50">
                            <div className="flex justify-between text-xs mb-2">
                              <span className="text-slate-300 font-semibold flex items-center gap-1">
                                <div className="text-green-300">📈</div>
                                24h Progress
                              </span>
                              <span className="font-mono font-bold text-slate-200">
                                {miningData.percentComplete === null ? 'N/A' : `${miningData.percentComplete.toFixed(1)}%`}
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-green-400 via-teal-400 to-blue-400"
                                style={{ width: miningData.percentComplete === null ? "0%" : `${miningData.percentComplete}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-600/50 bg-slate-800/20 backdrop-blur-sm">
                  <div className="p-2 border-b border-slate-600/50 bg-slate-800/30">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-orange-500/20 border border-orange-500/30">
                        <ClipboardList className="w-3 h-3 text-orange-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-200">Task Statistics</h4>
                        <p className="text-[10px] text-slate-400">Task performance data</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-1">
                    {(() => {
                      const taskStats = selectedNodeTaskStats;
                      const isLoading = loadingTaskStats[selectedNode.nodeId || selectedNode.id];

                      if (!dataReady || isLoading || !taskStats) {
                        return <TaskStatsSkeleton />;
                      }

                      const {
                        taskCount = null,
                        availableRam = null,
                        ttsPowerStatus = null,
                        lastTaskCompleted = null,
                        lastPolledAt = null,
                        lastTaskAssigned = null,
                      } = taskStats || {};

                      return (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                              <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                                <Database className="w-3 h-3 text-purple-400" />
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400">Total Tasks</div>
                                <div className="text-xs font-semibold text-slate-200">
                                  {taskCount !== null ? fmtInteger(taskCount) : 'N/A'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                              <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                                <MemoryStick className="w-3 h-3 text-blue-400" />
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400">Available RAM</div>
                                <div className="text-xs font-semibold text-slate-200">
                                  {availableRam ? `${fmtInteger(availableRam)} GB` : 'N/A'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                              <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                                <Zap className="w-3 h-3 text-green-400" />
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400">TTS Power Status</div>
                                <div className="text-xs font-semibold text-slate-200">
                                  {ttsPowerStatus || 'N/A'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                              <div className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center">
                                <CheckSquare className="w-3 h-3 text-cyan-400" />
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400">Last Task Completed</div>
                                <div className="text-xs font-semibold text-slate-200">
                                  {lastTaskCompleted ? formatTime(lastTaskCompleted) : 'N/A'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                              <div className="w-6 h-6 bg-amber-500/20 rounded flex items-center justify-center">
                                <FileText className="w-3 h-3 text-amber-400" />
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400">Last Polled</div>
                                <div className="text-xs font-semibold text-slate-200">
                                  {lastPolledAt ? formatTime(lastPolledAt) : 'N/A'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
                              <div className="w-6 h-6 bg-yellow-500/20 rounded flex items-center justify-center">
                                <Inbox className="w-3 h-3 text-yellow-400" />
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400">Last Task Assigned</div>
                                <div className="text-xs font-semibold text-slate-200">
                                  {lastTaskAssigned ? formatTime(lastTaskAssigned) : 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
