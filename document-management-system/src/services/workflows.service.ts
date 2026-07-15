import type { Workflow } from "@/types";

export const workflowsService = {
  async approveStep(workflowId: string, comment?: string): Promise<boolean> {
    // Stub for POST /workflows/:id/approve
    return Promise.resolve(true);
  },

  async rejectStep(workflowId: string, comment: string, returnToStep?: number): Promise<boolean> {
    // Stub for POST /workflows/:id/reject
    return Promise.resolve(true);
  },
};
