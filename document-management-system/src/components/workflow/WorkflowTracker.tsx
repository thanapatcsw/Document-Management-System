import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkflowStep } from "@/types";

export interface WorkflowTrackerProps {
  steps: WorkflowStep[];
  currentStep: number;
}

export function WorkflowTracker({ steps, currentStep }: WorkflowTrackerProps) {
  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isDone = step.status === "Approved";
          const isRejected = step.status === "Rejected";
          const isCurrent = step.step_order === currentStep && !isDone && !isRejected;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle & Role Label */}
              <div className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
                    isDone && "border-green-500 bg-green-500 text-white shadow-sm shadow-green-200",
                    isRejected && "border-red-500 bg-red-500 text-white shadow-sm shadow-red-200",
                    isCurrent && "border-blue-600 bg-blue-50 text-blue-600 ring-4 ring-blue-100",
                    !isDone && !isRejected && !isCurrent && "border-slate-300 bg-slate-100 text-slate-400"
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="size-5" />
                  ) : isRejected ? (
                    <XCircle className="size-5" />
                  ) : (
                    step.step_order
                  )}
                </div>

                <div className="mt-2 space-y-0.5">
                  <p className="text-xs font-bold text-slate-700">{step.approver_role}</p>
                  <p className="text-[11px] font-medium text-slate-500">{step.approver_name}</p>
                  {step.action_date && (
                    <p className="text-[10px] text-slate-400">
                      {new Date(step.action_date).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Connecting Line */}
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 -mt-6 transition-colors",
                    idx < currentStep - 1 || isDone ? "bg-green-500" : "bg-slate-200"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

import React from "react";
