"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Plus,
  ToggleLeft,
  ToggleRight,
  Shield,
  Hash,
  Users,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  getMasterData,
  createDocumentType,
  updateDocumentType,
  getDocumentTypes,
  createDepartment,
  updateDepartment,
  createPosition,
  updatePosition,
  createApprovalMatrix,
  updateApprovalMatrix,
  createUser,
  updateUser,
  createRole,
  updateRole,
  updateRolePermissions,
  createRunningNumber,
  updateRunningNumber,
} from "@/features/master-data/api";
import { DashboardLayout } from "@/components/shared";
import PageHeader from "@/components/shared/PageHeader";
import { useToast } from "@/components/providers/ToastProvider";

type Tab = "docTypes" | "departments" | "positions" | "matrix" | "users" | "roles" | "runningNumbers";

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<Tab>("docTypes");
  const { data: masterData, error, mutate } = useSWR("master-data", getMasterData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (masterData) {
      setData(masterData);
    }
  }, [masterData]);

  const isLoading = !masterData && !error;

  const { showToast } = useToast();

  // User Modal / Form states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [formName, setFormName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDepartment, setFormDepartment] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formSignatureImagePath, setFormSignatureImagePath] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  // Document Type Modal / Form states
  const [isDocTypeModalOpen, setIsDocTypeModalOpen] = useState(false);
  const [editingDocType, setEditingDocType] = useState<any | null>(null);
  const [docTypeName, setDocTypeName] = useState("");
  const [docTypePrefix, setDocTypePrefix] = useState("");

  // Department Modal / Form states
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any | null>(null);
  const [departmentName, setDepartmentName] = useState("");
  const [departmentCostCenter, setDepartmentCostCenter] = useState("");

  // Position Modal / Form states
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<any | null>(null);
  const [positionTitle, setPositionTitle] = useState("");
  const [positionLevel, setPositionLevel] = useState(1);

  // Approval Matrix Modal / Form states
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [editingMatrix, setEditingMatrix] = useState<any | null>(null);
  const [matrixDocTypeId, setMatrixDocTypeId] = useState("");
  const [matrixStepOrder, setMatrixStepOrder] = useState(1);
  const [matrixRoleId, setMatrixRoleId] = useState("");

  // Roles Modal / Form states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [roleName, setRoleName] = useState("");
  const [rolePermissionIds, setRolePermissionIds] = useState<string[]>([]);

  // Running Number Modal / Form states
  const [isRunningNumberModalOpen, setIsRunningNumberModalOpen] = useState(false);
  const [editingRunningNumber, setEditingRunningNumber] = useState<any | null>(null);
  const [runningDocTypeId, setRunningDocTypeId] = useState("");
  const [runningYearFormat, setRunningYearFormat] = useState("YYYY");
  const [runningPaddingLength, setRunningPaddingLength] = useState(3);


  const handleOpenAddUser = () => {
    setEditingUser(null);
    setFormName("");
    setFormUsername("");
    setFormEmail("");
    setFormDepartment(data?.departments?.[0]?.id || "");
    setFormPosition(data?.positions?.[0]?.id || "");
    setFormRole(data?.roles?.[0]?.id || "");
    setFormSignatureImagePath("");
    setFormIsActive(true);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: any) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormDepartment(user.department?.id || "");
    setFormPosition(user.position?.id || "");
    setFormRole(user.role?.id || "");
    setFormSignatureImagePath(user.signatureImagePath || "");
    setFormIsActive(user.isActive);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (user: any) => {
    if (!confirm("Are you sure you want to deactivate this user?")) {
      return;
    }
    try {
      await updateUser(user.id, { isActive: false });
      showToast("User deactivated successfully!");
      await mutate();
    } catch (error: any) {
      showToast("Failed to deactivate user.");
      alert(error.response?.data?.message || "Failed to deactivate user");
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formUsername || !formEmail || !formRole) {
      alert("Please fill in all required fields (Name, Username, Email, Role)");
      return;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          fullName: formName,
          username: formUsername,
          email: formEmail,
          departmentId: formDepartment || undefined,
          positionId: formPosition || undefined,
          roleId: formRole || undefined,
          signatureImagePath: formSignatureImagePath,
          isActive: formIsActive,
        });
        showToast("User updated successfully!");
      } else {
        await createUser({
          fullName: formName,
          username: formUsername,
          email: formEmail,
          departmentId: formDepartment || undefined,
          positionId: formPosition || undefined,
          roleId: formRole,
          signatureImagePath: formSignatureImagePath,
          isActive: formIsActive,
        });
        showToast("User created successfully!");
      }
      setIsUserModalOpen(false);
      await mutate();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save user");
    }
  };

  const handleToggleUserActive = async (user: any) => {
    try {
      await updateUser(user.id, { isActive: !user.isActive });
      showToast("User status updated!");
      await mutate();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleOpenAddDocType = () => {
    setEditingDocType(null);
    setDocTypeName("");
    setDocTypePrefix("");
    setIsDocTypeModalOpen(true);
  };

  const handleOpenEditDocType = (doc: any) => {
    setEditingDocType(doc);
    setDocTypeName(doc.name);
    setDocTypePrefix(doc.prefix || "");
    setIsDocTypeModalOpen(true);
  };

  const handleSaveDocType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTypeName || !docTypePrefix) {
      alert("Please fill in all required fields (Template Name, Code Prefix)");
      return;
    }

    try {
      if (editingDocType) {
        await updateDocumentType(editingDocType.id, {
          name: docTypeName,
          prefix: docTypePrefix,
        });
        showToast("Document type updated successfully!");
      } else {
        await createDocumentType({
          name: docTypeName,
          prefix: docTypePrefix,
        });
        showToast("Document type created successfully!");
      }
      setIsDocTypeModalOpen(false);
      // Refetch list
      await mutate();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save document type");
    }
  };

  const handleToggleDocTypeActive = async (doc: any) => {
    try {
      await updateDocumentType(doc.id, {
        isActive: !doc.isActive,
      });
      showToast(`Document type "${doc.name}" status updated!`);
      // Refetch list
      await mutate();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleOpenAddDepartment = () => {
    setEditingDepartment(null);
    setDepartmentName("");
    setDepartmentCostCenter("");
    setIsDepartmentModalOpen(true);
  };

  const handleOpenEditDepartment = (dept: any) => {
    setEditingDepartment(dept);
    setDepartmentName(dept.name);
    setDepartmentCostCenter(dept.costCenterCode || "");
    setIsDepartmentModalOpen(true);
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentName || !departmentCostCenter) {
      alert("Please fill in all required fields (Department Name, Cost Center Code)");
      return;
    }
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, {
          name: departmentName,
          costCenterCode: departmentCostCenter,
        });
        showToast("Department updated successfully!");
      } else {
        await createDepartment({
          name: departmentName,
          costCenterCode: departmentCostCenter,
        });
        showToast("Department created successfully!");
      }
      setIsDepartmentModalOpen(false);
      await mutate();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save department");
    }
  };

  const handleToggleDepartmentActive = async (dept: any) => {
    try {
      await updateDepartment(dept.id, { isActive: !dept.isActive });
      showToast(`Department "${dept.name}" status updated!`);
      await mutate();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleOpenAddPosition = () => {
    setEditingPosition(null);
    setPositionTitle("");
    setPositionLevel(1);
    setIsPositionModalOpen(true);
  };

  const handleOpenEditPosition = (pos: any) => {
    setEditingPosition(pos);
    setPositionTitle(pos.title);
    setPositionLevel(pos.authorityGradeLevel || 1);
    setIsPositionModalOpen(true);
  };

  const handleSavePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!positionTitle) {
      alert("Please fill in Position Title");
      return;
    }
    try {
      if (editingPosition) {
        await updatePosition(editingPosition.id, {
          title: positionTitle,
          authorityGradeLevel: Number(positionLevel),
        });
        showToast("Position updated successfully!");
      } else {
        await createPosition({
          title: positionTitle,
          authorityGradeLevel: Number(positionLevel),
        });
        showToast("Position created successfully!");
      }
      setIsPositionModalOpen(false);
      await mutate();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save position");
    }
  };

  const handleTogglePositionActive = async (pos: any) => {
    try {
      await updatePosition(pos.id, { isActive: !pos.isActive });
      showToast(`Position "${pos.title}" status updated!`);
      await mutate();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleOpenAddMatrix = () => {
    setEditingMatrix(null);
    setMatrixDocTypeId(data?.docTypes?.[0]?.id || "");
    setMatrixStepOrder(1);
    setMatrixRoleId(data?.roles?.[0]?.id || "");
    setIsMatrixModalOpen(true);
  };

  const handleOpenEditMatrix = (row: any) => {
    setEditingMatrix(row);
    setMatrixDocTypeId(row.documentType?.id || "");
    setMatrixStepOrder(row.stepOrder || 1);
    setMatrixRoleId(row.requiredRole?.id || "");
    setIsMatrixModalOpen(true);
  };

  const handleSaveMatrix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matrixDocTypeId || !matrixRoleId) {
      alert("Please select Document Type and Required Role");
      return;
    }
    try {
      if (editingMatrix) {
        await updateApprovalMatrix(editingMatrix.id, {
          documentTypeId: matrixDocTypeId,
          stepOrder: Number(matrixStepOrder),
          requiredRoleId: matrixRoleId,
        });
        showToast("Approval matrix updated successfully!");
      } else {
        await createApprovalMatrix({
          documentTypeId: matrixDocTypeId,
          stepOrder: Number(matrixStepOrder),
          requiredRoleId: matrixRoleId,
        });
        showToast("Approval matrix row created successfully!");
      }
      setIsMatrixModalOpen(false);
      await mutate();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save approval matrix");
    }
  };

  const handleToggleMatrixActive = async (row: any) => {
    try {
      await updateApprovalMatrix(row.id, { isActive: !row.isActive });
      showToast("Approval matrix status updated!");
      await mutate();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleOpenAddRole = () => {
    setEditingRole(null);
    setRoleName("");
    setRolePermissionIds([]);
    setIsRoleModalOpen(true);
  };

  const handleOpenEditRole = (role: any) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRolePermissionIds((role.permissions || []).map((p: any) => p.id));
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName) {
      alert("Please fill in Role Name");
      return;
    }
    try {
      if (editingRole) {
        await updateRole(editingRole.id, { name: roleName });
        await updateRolePermissions(editingRole.id, { permissionIds: rolePermissionIds });
        showToast("Role updated successfully!");
      } else {
        const newRole = await createRole({ name: roleName });
        if (rolePermissionIds.length > 0) {
          await updateRolePermissions(newRole.id, { permissionIds: rolePermissionIds });
        }
        showToast("Role created successfully!");
      }
      setIsRoleModalOpen(false);
      await mutate();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save role");
    }
  };

  const handleToggleRoleActive = async (role: any) => {
    try {
      await updateRole(role.id, { isActive: !role.isActive });
      showToast(`Role "${role.name}" status updated!`);
      await mutate();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleOpenAddRunningNumber = () => {
    setEditingRunningNumber(null);
    setRunningDocTypeId(data?.docTypes?.[0]?.id || "");
    setRunningYearFormat("YYYY");
    setRunningPaddingLength(3);
    setIsRunningNumberModalOpen(true);
  };

  const handleOpenEditRunningNumber = (rn: any) => {
    setEditingRunningNumber(rn);
    setRunningDocTypeId(rn.documentType?.id || "");
    setRunningYearFormat(rn.yearFormat || "YYYY");
    setRunningPaddingLength(rn.paddingLength || 3);
    setIsRunningNumberModalOpen(true);
  };

  const handleSaveRunningNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runningDocTypeId) {
      alert("Please select Document Type");
      return;
    }
    try {
      if (editingRunningNumber) {
        await updateRunningNumber(editingRunningNumber.id, {
          documentTypeId: runningDocTypeId,
          yearFormat: runningYearFormat,
          paddingLength: Number(runningPaddingLength),
        });
        showToast("Running number updated successfully!");
      } else {
        await createRunningNumber({
          documentTypeId: runningDocTypeId,
          yearFormat: runningYearFormat,
          paddingLength: Number(runningPaddingLength),
        });
        showToast("Running number created successfully!");
      }
      setIsRunningNumberModalOpen(false);
      await mutate();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to save running number");
    }
  };

  const handleToggleRunningNumberActive = async (rn: any) => {
    try {
      await updateRunningNumber(rn.id, { isActive: !rn.isActive });
      showToast("Running number status updated!");
      await mutate();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleAdd = () => {
    if (activeTab === "users") {
      handleOpenAddUser();
    } else if (activeTab === "docTypes") {
      handleOpenAddDocType();
    } else if (activeTab === "departments") {
      handleOpenAddDepartment();
    } else if (activeTab === "positions") {
      handleOpenAddPosition();
    } else if (activeTab === "matrix") {
      handleOpenAddMatrix();
    } else if (activeTab === "roles") {
      handleOpenAddRole();
    } else if (activeTab === "runningNumbers") {
      handleOpenAddRunningNumber();
    } else {
      alert(`Add New Item in tab: ${activeTab}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <PageHeader
          size="compact"
          title="Master Data Configuration"
          subtitle="Administer document templates, positions, department nodes, and workflow routing matrix."
        />

        <div className="bg-white rounded-2xl p-6 border border-slate-100/50 shadow-sm flex flex-col h-full space-y-6">
          
          {/* TABS SELECTOR */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "docTypes", label: "Document Types" },
                { id: "departments", label: "Departments" },
                { id: "positions", label: "Positions" },
                { id: "matrix", label: "Approval Matrix" },
                { id: "users", label: "Users" },
                { id: "roles", label: "Roles & Permissions" },
                { id: "runningNumbers", label: "Running Numbers" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : "bg-transparent text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleAdd}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New
            </button>
          </div>

          {/* TABLES DEPENDING ON ACTIVE TAB */}
          <div className="overflow-x-auto border border-slate-100/50 rounded-2xl">
            {isLoading ? (
              <div className="py-16 text-center">
                <div className="inline-block w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[700px]">
                
                {/* 1. DOCUMENT TYPES TABLE */}
                {activeTab === "docTypes" && (
                  <>
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-4 pl-4">ID</th>
                        <th className="py-4">Template Name</th>
                        <th className="py-4">Code Prefix</th>
                        <th className="py-4 text-center">Status</th>
                        <th className="py-4 pr-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50/80">
                      {data?.docTypes?.map((doc: any) => (
                        <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 pl-4 text-sm font-bold text-slate-500">
                            {doc.id.length > 8 ? `#${doc.id.substring(0, 8)}...` : `#${doc.id}`}
                          </td>
                          <td className="py-4 text-sm font-bold text-slate-800">{doc.name}</td>
                          <td className="py-4 text-sm font-semibold text-slate-600">
                            <span className="font-mono bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{doc.prefix}</span>
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => handleToggleDocTypeActive(doc)}
                              className="inline-flex cursor-pointer text-blue-600"
                            >
                              {doc.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-slate-300" />}
                            </button>
                          </td>
                          <td className="py-4 pr-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditDocType(doc)}
                                className="p-1 hover:text-blue-600 text-slate-400 transition-colors cursor-pointer"
                                title="Edit Document Type"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 2. DEPARTMENTS TABLE */}
                {activeTab === "departments" && (
                  <>
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-4 pl-4">ID</th>
                        <th className="py-4">Department Name</th>
                        <th className="py-4">Cost Center Code</th>
                        <th className="py-4 text-center">Status</th>
                        <th className="py-4 pr-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50/80">
                      {data?.departments.map((dept: any) => (
                        <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 pl-4 text-sm font-bold text-slate-500">
                            {dept.id.length > 8 ? `#${dept.id.substring(0, 8)}...` : `#${dept.id}`}
                          </td>
                          <td className="py-4 text-sm font-bold text-slate-800">{dept.name}</td>
                          <td className="py-4 text-sm font-semibold text-slate-600">{dept.costCenterCode}</td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => handleToggleDepartmentActive(dept)}
                              className="inline-flex cursor-pointer text-blue-600"
                            >
                              {dept.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-slate-300" />}
                            </button>
                          </td>
                          <td className="py-4 pr-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditDepartment(dept)}
                                className="p-1 hover:text-blue-600 text-slate-400 transition-colors cursor-pointer"
                                title="Edit Department"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 3. POSITIONS TABLE */}
                {activeTab === "positions" && (
                  <>
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-4 pl-4">ID</th>
                        <th className="py-4">Position Title</th>
                        <th className="py-4">Authority Grade Level</th>
                        <th className="py-4 text-center">Status</th>
                        <th className="py-4 pr-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50/80">
                      {data?.positions.map((pos: any) => (
                        <tr key={pos.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 pl-4 text-sm font-bold text-slate-500">
                            {pos.id.length > 8 ? `#${pos.id.substring(0, 8)}...` : `#${pos.id}`}
                          </td>
                          <td className="py-4 text-sm font-bold text-slate-800">{pos.title}</td>
                          <td className="py-4 pr-4">
                            <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-md">
                              Level {pos.authorityGradeLevel}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => handleTogglePositionActive(pos)}
                              className="inline-flex cursor-pointer text-blue-600"
                            >
                              {pos.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-slate-300" />}
                            </button>
                          </td>
                          <td className="py-4 pr-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditPosition(pos)}
                                className="p-1 hover:text-blue-600 text-slate-400 transition-colors cursor-pointer"
                                title="Edit Position"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 4. APPROVAL MATRIX TABLE */}
                {activeTab === "matrix" && (
                  <>
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-4 pl-4">ID</th>
                        <th className="py-4">Document Type</th>
                        <th className="py-4 text-center">Step Order</th>
                        <th className="py-4">Required Role</th>
                        <th className="py-4 text-center">Status</th>
                        <th className="py-4 pr-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50/80">
                      {data?.matrix.map((row: any) => (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 pl-4 text-sm font-bold text-slate-500">
                            {row.id.length > 8 ? `#${row.id.substring(0, 8)}...` : `#${row.id}`}
                          </td>
                          <td className="py-4 text-sm font-bold text-slate-800">{row.documentType?.name}</td>
                          <td className="py-4 text-center text-xs font-semibold text-slate-600">Level {row.stepOrder}</td>
                          <td className="py-4 text-xs font-semibold text-slate-600">{row.requiredRole?.name}</td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => handleToggleMatrixActive(row)}
                              className="inline-flex cursor-pointer text-blue-600"
                            >
                              {row.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-slate-300" />}
                            </button>
                          </td>
                          <td className="py-4 pr-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditMatrix(row)}
                                className="p-1 hover:text-blue-600 text-slate-400 transition-colors cursor-pointer"
                                title="Edit Approval Matrix"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 5. USERS TABLE */}
                {activeTab === "users" && (
                  <>
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-4 pl-4">Name</th>
                        <th className="py-4">Username / Email</th>
                        <th className="py-4">Department</th>
                        <th className="py-4">Position</th>
                        <th className="py-4">Role</th>
                        <th className="py-4">Signature Path</th>
                        <th className="py-4 text-center">Status</th>
                        <th className="py-4 pr-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50/80">
                      {data?.users?.map((u: any) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 pl-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="w-7 h-7">
                                <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold text-[10px]">
                                  {u.name.split(" ").map((n: string) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-bold text-slate-800">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="text-xs font-semibold text-slate-700">{u.username}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{u.email}</div>
                          </td>
                          <td className="py-4 text-xs font-bold text-slate-600">{u.department?.name || "-"}</td>
                          <td className="py-4 text-xs font-semibold text-slate-500">{u.position?.title || "-"}</td>
                          <td className="py-4">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md">
                              {u.role?.name || "-"}
                            </span>
                          </td>
                          <td className="py-4">
                            {u.signatureImagePath ? (
                              <span className="font-mono text-[10px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                {u.signatureImagePath}
                              </span>
                            ) : (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] py-0.5">
                                No Signature
                              </Badge>
                            )}
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => handleToggleUserActive(u)}
                              className="inline-flex cursor-pointer text-blue-600"
                            >
                              {u.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-slate-300" />}
                            </button>
                          </td>
                          <td className="py-4 pr-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditUser(u)}
                                className="p-1 hover:text-blue-600 text-slate-400 transition-colors cursor-pointer"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1 hover:text-rose-600 text-slate-400 transition-colors cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 6. ROLES & PERMISSIONS TABLE */}
                {activeTab === "roles" && (
                  <>
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-4 pl-4">Role Name</th>
                        <th className="py-4">Assigned Permissions</th>
                        <th className="py-4 text-center">Status</th>
                        <th className="py-4 pr-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50/80">
                      {data?.roles?.map((r: any) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 pl-4">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-indigo-500" />
                              <span className="text-sm font-bold text-slate-800">{r.name}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-wrap gap-1 max-w-xl">
                              {r.permissions.map((perm: any) => (
                                <span key={perm.id} className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-50 text-slate-500 border border-slate-100 rounded">
                                  {perm.module}:{perm.action}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <button onClick={() => handleToggleRoleActive(r)} className="inline-flex cursor-pointer text-blue-600">
                              {r.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-slate-300" />}
                            </button>
                          </td>
                          <td className="py-4 pr-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditRole(r)}
                                className="p-1 hover:text-blue-600 text-slate-400 transition-colors cursor-pointer"
                                title="Edit Role"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {/* 7. RUNNING NUMBERS TABLE */}
                {activeTab === "runningNumbers" && (
                  <>
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-4 pl-4">Document Type</th>
                        <th className="py-4">Year Format</th>
                        <th className="py-4">Current Sequence No.</th>
                        <th className="py-4">Padding Width</th>
                        <th className="py-4">Generated Preview Format</th>
                        <th className="py-4 text-center">Status</th>
                        <th className="py-4 pr-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50/80">
                      {data?.runningNumbers?.map((rn: any) => {
                        const yearStr = rn.yearFormat === "YYYY" ? "2026" : "26";
                        const paddedNum = String(rn.currentNumber).padStart(rn.paddingLength, "0");
                        const preview = `${rn.documentType?.prefix || "DOC"}-${yearStr}-${paddedNum}`;

                        return (
                          <tr key={rn.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 pl-4">
                              <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-bold text-slate-800">{rn.documentType?.name}</span>
                              </div>
                            </td>
                            <td className="py-4 text-xs font-semibold text-slate-600">{rn.yearFormat}</td>
                            <td className="py-4 text-xs font-bold text-slate-800">{rn.currentNumber}</td>
                            <td className="py-4 text-xs font-semibold text-slate-500">{rn.paddingLength} digits</td>
                            <td className="py-4">
                              <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-lg">
                                {preview}
                              </span>
                            </td>
                            <td className="py-4 text-center">
                              <button
                                onClick={() => handleToggleRunningNumberActive(rn)}
                                className="inline-flex cursor-pointer text-blue-600"
                              >
                                {rn.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-slate-300" />}
                              </button>
                            </td>
                            <td className="py-4 pr-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenEditRunningNumber(rn)}
                                  className="p-1 hover:text-blue-600 text-slate-400 transition-colors cursor-pointer"
                                  title="Edit Running Number"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </>
                )}

              </table>
            )}
          </div>

        </div>

      </div>

      {/* ADD/EDIT DOCUMENT TYPE MODAL */}
      {isDocTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-md overflow-hidden animate-zoom-in flex flex-col">
            
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">
                {editingDocType ? "Edit Document Type" : "Create Document Type"}
              </h3>
              <button
                onClick={() => setIsDocTypeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <form onSubmit={handleSaveDocType} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Template Name *</label>
                <input
                  type="text"
                  required
                  value={docTypeName}
                  onChange={(e) => setDocTypeName(e.target.value)}
                  placeholder="e.g. Purchase Request (PR)"
                  className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Code Prefix *</label>
                <input
                  type="text"
                  required
                  value={docTypePrefix}
                  onChange={(e) => setDocTypePrefix(e.target.value)}
                  placeholder="e.g. PR"
                  className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-300"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDocTypeModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  {editingDocType ? "Apply Changes" : "Create"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ADD/EDIT DEPARTMENT MODAL */}
      {isDepartmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-md overflow-hidden animate-zoom-in flex flex-col">
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">
                {editingDepartment ? "Edit Department" : "Create Department"}
              </h3>
              <button
                onClick={() => setIsDepartmentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <form onSubmit={handleSaveDepartment} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Department Name *</label>
                <input
                  type="text"
                  required
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="e.g. Accounting & Finance"
                  className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Cost Center Code *</label>
                <input
                  type="text"
                  required
                  value={departmentCostCenter}
                  onChange={(e) => setDepartmentCostCenter(e.target.value)}
                  placeholder="e.g. ACC"
                  className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDepartmentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  {editingDepartment ? "Apply Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT POSITION MODAL */}
      {isPositionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-md overflow-hidden animate-zoom-in flex flex-col">
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">
                {editingPosition ? "Edit Position" : "Create Position"}
              </h3>
              <button
                onClick={() => setIsPositionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <form onSubmit={handleSavePosition} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Position Title *</label>
                <input
                  type="text"
                  required
                  value={positionTitle}
                  onChange={(e) => setPositionTitle(e.target.value)}
                  placeholder="e.g. Department Manager"
                  className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Authority Grade Level</label>
                <select
                  value={positionLevel}
                  onChange={(e) => setPositionLevel(Number(e.target.value))}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white"
                >
                  {[1, 2, 3, 4].map((level) => (
                    <option key={level} value={level}>
                      Level {level}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPositionModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  {editingPosition ? "Apply Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT APPROVAL MATRIX MODAL */}
      {isMatrixModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-md overflow-hidden animate-zoom-in flex flex-col">
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">
                {editingMatrix ? "Edit Approval Matrix" : "Create Approval Matrix"}
              </h3>
              <button
                onClick={() => setIsMatrixModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <form onSubmit={handleSaveMatrix} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Document Type</label>
                <select
                  value={matrixDocTypeId}
                  onChange={(e) => setMatrixDocTypeId(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white"
                >
                  {data?.docTypes?.map((doc: any) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Step Order</label>
                <input
                  type="number"
                  min={1}
                  value={matrixStepOrder}
                  onChange={(e) => setMatrixStepOrder(Number(e.target.value))}
                  className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Required Role</label>
                <select
                  value={matrixRoleId}
                  onChange={(e) => setMatrixRoleId(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white"
                >
                  {data?.roles?.map((role: any) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMatrixModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  {editingMatrix ? "Apply Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT ROLE MODAL */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-lg overflow-hidden animate-zoom-in flex flex-col max-h-[90vh]">
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">
                {editingRole ? "Edit Role" : "Create Role"}
              </h3>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <form onSubmit={handleSaveRole} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Role Name *</label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Finance Manager"
                  className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Permissions</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {data?.permissions?.map((perm: any) => {
                    const checked = rolePermissionIds.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-xs font-semibold cursor-pointer ${
                          checked ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRolePermissionIds((prev) => [...prev, perm.id]);
                            } else {
                              setRolePermissionIds((prev) => prev.filter((id) => id !== perm.id));
                            }
                          }}
                          className="accent-blue-600"
                        />
                        {perm.module}:{perm.action}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  {editingRole ? "Apply Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT RUNNING NUMBER MODAL */}
      {isRunningNumberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-md overflow-hidden animate-zoom-in flex flex-col">
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">
                {editingRunningNumber ? "Edit Running Number" : "Create Running Number"}
              </h3>
              <button
                onClick={() => setIsRunningNumberModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <form onSubmit={handleSaveRunningNumber} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Document Type</label>
                <select
                  value={runningDocTypeId}
                  onChange={(e) => setRunningDocTypeId(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white"
                >
                  {data?.docTypes?.map((doc: any) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Year Format</label>
                <select
                  value={runningYearFormat}
                  onChange={(e) => setRunningYearFormat(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white"
                >
                  <option value="YYYY">YYYY</option>
                  <option value="YY">YY</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Padding Length</label>
                <input
                  type="number"
                  min={1}
                  value={runningPaddingLength}
                  onChange={(e) => setRunningPaddingLength(Number(e.target.value))}
                  className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Preview</label>
                <div className="font-mono text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-2 rounded-lg">
                  {(() => {
                    const doc = data?.docTypes?.find((item: any) => item.id === runningDocTypeId);
                    const yearStr = runningYearFormat === "YYYY" ? "2026" : "26";
                    const padded = String(1).padStart(runningPaddingLength, "0");
                    return `${doc?.prefix || "DOC"}-${yearStr}-${padded}`;
                  })()}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRunningNumberModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  {editingRunningNumber ? "Apply Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT USER MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-lg overflow-hidden animate-zoom-in flex flex-col max-h-[90vh]">
            
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">
                {editingUser ? "Edit User Node" : "Register New User"}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-300"
                  />
                </div>

                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Username *</label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="e.g. john.doe"
                    className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-300"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="john.doe@company.com"
                    className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-300"
                  />
                </div>

                {/* Department dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white"
                  >
                    <option value="">No Department</option>
                    {data?.departments?.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Position dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Position</label>
                  <select
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white"
                  >
                    <option value="">No Position</option>
                    {data?.positions?.map((pos: any) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Role Profile</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white"
                  >
                    {data?.roles?.map((role: any) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Signature Image Path text input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Signature Image Path</label>
                  <input
                    type="text"
                    value={formSignatureImagePath}
                    onChange={(e) => setFormSignatureImagePath(e.target.value)}
                    placeholder="e.g. /signatures/john.png"
                    className="px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-300"
                  />
                </div>

                {/* Status (isActive toggle) */}
                <div className="flex items-center justify-between md:col-span-2 py-2 border-t border-slate-50 mt-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-600 uppercase">Active Node Status</span>
                    <span className="text-[10px] text-slate-400 font-medium">Inactive users are suspended from all document approvals.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className="cursor-pointer text-blue-600"
                  >
                    {formIsActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  {editingUser ? "Apply Changes" : "Create User"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
