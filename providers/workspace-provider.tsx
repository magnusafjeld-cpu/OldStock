"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  CategoryScope,
  RecentFileMeta,
  Snapshot,
  WorkflowStatus,
} from "@/types/domain";
import { buildSnapshotFromFile } from "@/lib/analytics/dataset";
import {
  clearAllSnapshots,
  deleteSnapshot,
  getAllSnapshots,
  saveSnapshot,
} from "@/lib/db/indexeddb";
import {
  loadWorkflowMap,
  saveWorkflowMap,
  workflowKey,
  type WorkflowMap,
} from "@/lib/db/workflow-store";

interface WorkspaceContextValue {
  hydrated: boolean;
  snapshots: Snapshot[];
  stores: string[];
  activeStore: string | null;
  /** Snapshots for the active store, oldest → newest. */
  activeHistory: Snapshot[];
  activeSnapshot: Snapshot | null;
  previousSnapshot: Snapshot | null;
  weeklySnapshot: Snapshot | null;
  recentFiles: RecentFileMeta[];
  categoryScope: CategoryScope;

  importFile: (file: File) => Promise<Snapshot>;
  setActiveStore: (store: string) => void;
  removeSnapshot: (id: string) => Promise<void>;
  clearWorkspace: () => Promise<void>;
  setCategoryScope: (scope: CategoryScope) => void;

  getWorkflow: (store: string, articleKey: string) => WorkflowStatus;
  setWorkflow: (store: string, articleKey: string, status: WorkflowStatus) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function daysBetween(aDate: string, bDate: string): number {
  return Math.round((Date.parse(bDate) - Date.parse(aDate)) / 86_400_000);
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [activeStore, setActiveStoreState] = useState<string | null>(null);
  const [categoryScope, setCategoryScope] = useState<CategoryScope>("all");
  const [workflowMap, setWorkflowMap] = useState<WorkflowMap>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const stored = await getAllSnapshots();
      if (!alive) return;
      setSnapshots(stored);
      setActiveStoreState(stored[stored.length - 1]?.store ?? null);
      setWorkflowMap(loadWorkflowMap());
      setHydrated(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const importFile = useCallback(async (file: File) => {
    const snapshot = await buildSnapshotFromFile(file);
    await saveSnapshot(snapshot);
    setSnapshots((prev) => {
      const others = prev.filter((s) => s.id !== snapshot.id);
      return [...others, snapshot].sort(
        (a, b) => a.date.localeCompare(b.date) || a.uploadedAt - b.uploadedAt
      );
    });
    setActiveStoreState(snapshot.store);
    return snapshot;
  }, []);

  const removeSnapshot = useCallback(async (id: string) => {
    await deleteSnapshot(id);
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearWorkspace = useCallback(async () => {
    await clearAllSnapshots();
    setSnapshots([]);
    setActiveStoreState(null);
    setWorkflowMap({});
    saveWorkflowMap({});
  }, []);

  const setActiveStore = useCallback((store: string) => setActiveStoreState(store), []);

  const getWorkflow = useCallback(
    (store: string, articleKey: string): WorkflowStatus =>
      workflowMap[workflowKey(store, articleKey)] ?? "Open",
    [workflowMap]
  );

  const setWorkflow = useCallback(
    (store: string, articleKey: string, status: WorkflowStatus) => {
      setWorkflowMap((prev) => {
        const next = { ...prev, [workflowKey(store, articleKey)]: status };
        saveWorkflowMap(next);
        return next;
      });
    },
    []
  );

  const stores = useMemo(
    () => Array.from(new Set(snapshots.map((s) => s.store))),
    [snapshots]
  );

  const activeHistory = useMemo(
    () =>
      snapshots
        .filter((s) => s.store === activeStore)
        .sort((a, b) => a.date.localeCompare(b.date) || a.uploadedAt - b.uploadedAt),
    [snapshots, activeStore]
  );

  const activeSnapshot = activeHistory[activeHistory.length - 1] ?? null;
  const previousSnapshot =
    activeHistory.length >= 2 ? activeHistory[activeHistory.length - 2] : null;

  const weeklySnapshot = useMemo(() => {
    if (!activeSnapshot || activeHistory.length < 2) return null;
    // Closest prior snapshot at least ~7 days before the latest; else the oldest.
    const prior = activeHistory.slice(0, -1);
    const target = prior.filter((s) => daysBetween(s.date, activeSnapshot.date) >= 6);
    return (target[target.length - 1] ?? prior[0]) ?? null;
  }, [activeHistory, activeSnapshot]);

  const recentFiles = useMemo<RecentFileMeta[]>(
    () =>
      [...snapshots]
        .sort((a, b) => b.uploadedAt - a.uploadedAt)
        .map((s) => ({
          id: s.id,
          store: s.store,
          date: s.date,
          fileName: s.fileName,
          uploadedAt: s.uploadedAt,
          obsoleteNow: s.aggregates.obsoleteNow,
        })),
    [snapshots]
  );

  const value: WorkspaceContextValue = {
    hydrated,
    snapshots,
    stores,
    activeStore,
    activeHistory,
    activeSnapshot,
    previousSnapshot,
    weeklySnapshot,
    recentFiles,
    categoryScope,
    importFile,
    setActiveStore,
    removeSnapshot,
    clearWorkspace,
    setCategoryScope,
    getWorkflow,
    setWorkflow,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
