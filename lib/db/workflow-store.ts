import type { WorkflowStatus } from "@/types/domain";

/**
 * Workflow status overrides (Open / In progress / Done) are small and benefit
 * from synchronous reads, so they live in localStorage keyed by dataset+article.
 */

const KEY = "elkjop-os-workflow";

export type WorkflowMap = Record<string, WorkflowStatus>;

export function workflowKey(datasetId: string, articleId: string): string {
  return `${datasetId}::${articleId}`;
}

export function loadWorkflowMap(): WorkflowMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveWorkflowMap(map: WorkflowMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* ignore quota errors */
  }
}
