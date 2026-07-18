import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNodesState, useEdgesState, useReactFlow } from 'reactflow';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import type { NetworkNode, NetworkEdge, NetworkFilterOptions, NetworkEdgeData, NetworkNodeData } from '../types';
import { DEFAULT_FILTERS } from '../types';
import {
  getFilteredGraph,
  getFullGraph,
  expandNode as expandNodeService,
  getConnectedNodeIds,
  searchEntities,
} from '../services/networkService';

export function useNetworkGraph() {
  const { fitView, setCenter } = useReactFlow();

  // ── State ───────────────────────────────────────────────────────────────────
  const [nodes, setNodes, onNodesChange] = useNodesState<NetworkNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<NetworkEdgeData>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filters, setFilters] = useState<NetworkFilterOptions>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<Set<string> | null>(null);
  const [isFullGraph, setIsFullGraph] = useState(false);

  const location = useLocation();
  const state = location.state as { caseId?: string; firNumber?: string } | null;

  // ── Query for Graph ──────────────────────────────────────────────────────────
  const { data: graphData, isSuccess } = useQuery({
    queryKey: ['networkGraph', filters, isFullGraph],
    queryFn: () => isFullGraph ? getFullGraph() : getFilteredGraph(filters),
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (isSuccess && graphData) {
      setNodes(graphData.nodes);
      setEdges(graphData.edges);
      
      // Only fit view if there's no custom focal state in routing
      if (!state?.firNumber) {
        setTimeout(() => fitView({ padding: 0.15, duration: 800 }), 100);
      }
    }
  }, [graphData, isSuccess, setNodes, setEdges, fitView, state]);

  // ── Search Query ─────────────────────────────────────────────────────────────
  const { data: searchResults = [] } = useQuery({
    queryKey: ['networkSearch', searchQuery],
    queryFn: () => searchEntities(searchQuery),
    enabled: !!searchQuery.trim(),
  });

  // ── Derived: apply dim/highlight ────────────────────────────────────────────
  const processedNodes = useMemo(() => {
    if (!highlightedNodeIds) return nodes;
    return nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        highlighted: highlightedNodeIds.has(n.id),
        dimmed: !highlightedNodeIds.has(n.id),
      },
    })) as NetworkNode[];
  }, [nodes, highlightedNodeIds]);

  const processedEdges = useMemo(() => {
    if (!highlightedNodeIds) return edges;
    return edges.map((e) => ({
      ...e,
      data: {
        ...e.data,
        relation: e.data?.relation as string,
        highlighted:
          highlightedNodeIds.has(e.source) && highlightedNodeIds.has(e.target),
        dimmed:
          !highlightedNodeIds.has(e.source) || !highlightedNodeIds.has(e.target),
      },
    })) as NetworkEdge[];
  }, [edges, highlightedNodeIds]);

  // ── Select node ─────────────────────────────────────────────────────────────
  const selectNode = useCallback(
    (nodeId: string | null) => {
      setSelectedNodeId(nodeId);
      if (nodeId) {
        const connected = getConnectedNodeIds(nodeId, edges);
        setHighlightedNodeIds(connected);
      } else {
        setHighlightedNodeIds(null);
      }
    },
    [edges],
  );

  // ── Expand node ─────────────────────────────────────────────────────────────
  const expandNode = useCallback(
    async (nodeId: string) => {
      const existingIds = new Set(nodes.map((n) => n.id));
      const { nodes: newNodes, edges: newEdges } = await expandNodeService(
        nodeId,
        existingIds,
      );
      if (newNodes.length === 0) return;

      // Position new nodes around the expanded node
      const sourceNode = nodes.find((n) => n.id === nodeId);
      const cx = sourceNode?.position.x ?? 0;
      const cy = sourceNode?.position.y ?? 0;
      const positioned = newNodes.map((n, i) => ({
        ...n,
        position: {
          x: cx + 250 * Math.cos((2 * Math.PI * i) / newNodes.length),
          y: cy + 250 * Math.sin((2 * Math.PI * i) / newNodes.length),
        },
      }));

      setNodes((prev) => [...prev, ...positioned]);
      setEdges((prev) => {
        const existingEdgeIds = new Set(prev.map((e) => e.id));
        return [...prev, ...newEdges.filter((e) => !existingEdgeIds.has(e.id))];
      });

      // Mark node as expanded
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, expanded: true } } : n,
        ),
      );

      setTimeout(() => fitView({ padding: 0.2, duration: 600 }), 100);
    },
    [nodes, setNodes, setEdges, fitView],
  );

  // ── Focus node ──────────────────────────────────────────────────────────────
  const focusNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      setCenter(node.position.x + 60, node.position.y + 30, {
        zoom: 1.5,
        duration: 800,
      });
      selectNode(nodeId);
    },
    [nodes, setCenter, selectNode],
  );

  // ── Apply filters ────────────────────────────────────────────────────────────
  const applyFilters = useCallback((newFilters: NetworkFilterOptions) => {
    setFilters(newFilters);
    setIsFullGraph(false);
    setHighlightedNodeIds(null);
    setSelectedNodeId(null);
  }, []);

  // ── Reset graph ──────────────────────────────────────────────────────────────
  const resetGraph = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSelectedNodeId(null);
    setHighlightedNodeIds(null);
    setIsFullGraph(false);
  }, []);

  // ── Load full graph ─────────────────────────────────────────────────────────
  const loadFullGraph = useCallback(() => {
    setIsFullGraph(true);
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Autofocus effect once nodes are loaded
  useEffect(() => {
    const targetFir = state?.firNumber;
    if (targetFir && nodes.length > 0) {
      const targetNode = nodes.find(n => 
        n.id === `fir-${targetFir}` || 
        (n.data && (n.data as any).label === targetFir)
      );
      if (targetNode && selectedNodeId !== targetNode.id) {
        setTimeout(() => {
          focusNode(targetNode.id);
        }, 300);
      }
    }
  }, [state, nodes, focusNode, selectedNodeId]);

  return {
    nodes: processedNodes,
    edges: processedEdges,
    onNodesChange,
    onEdgesChange,
    selectedNodeId,
    selectNode,
    expandNode,
    focusNode,
    applyFilters,
    resetGraph,
    loadFullGraph,
    filters,
    searchQuery,
    setSearchQuery,
    searchResults,
    isFiltersOpen,
    setIsFiltersOpen,
    highlightedNodeIds,
    isFullGraph,
    totalNodeCount: nodes.length,
    totalEdgeCount: edges.length,
  };
}
