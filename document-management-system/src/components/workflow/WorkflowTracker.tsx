"use client";

import React from "react";
import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react";
import type { WorkflowData } from "@/features/workflow/api";

interface WorkflowTrackerProps {
  workflow: WorkflowData;
}

export function WorkflowTracker({ workflow }: WorkflowTrackerProps) {
  if (!workflow || !workflow.steps) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">สถานะการอนุมัติ (Workflow Tracker)</h3>
      
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        {workflow.steps.map((step, index) => {
          
          let Icon = Circle;
          let iconColor = "text-gray-300";
          let bgColor = "bg-white";
          
          if (step.status === "Approved") {
            Icon = CheckCircle2;
            iconColor = "text-emerald-500";
            bgColor = "bg-emerald-50";
          } else if (step.status === "Rejected") {
            Icon = XCircle;
            iconColor = "text-rose-500";
            bgColor = "bg-rose-50";
          } else if (step.status === "Pending") {
            if (step.stepOrder === workflow.currentStep) {
              Icon = Clock;
              iconColor = "text-blue-500";
              bgColor = "bg-blue-50";
            } else {
              Icon = Circle;
              iconColor = "text-gray-300";
              bgColor = "bg-gray-50";
            }
          }

          return (
            <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-xl border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{step.roleName}</h4>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${bgColor} ${iconColor}`}>
                    {step.status}
                  </span>
                </div>
                
                {step.approverName && (
                  <p className="text-sm text-gray-600 mb-1">ผู้อนุมัติ: <span className="font-medium text-gray-800">{step.approverName}</span></p>
                )}
                
                {step.actionDate && (
                  <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {step.actionDate}
                  </p>
                )}
                
                {step.comment && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 relative">
                    <div className="absolute -top-2 left-4 w-4 h-4 bg-gray-50 border-t border-l border-gray-100 rotate-45"></div>
                    <p className="text-sm text-gray-700 relative z-10">"{step.comment}"</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
