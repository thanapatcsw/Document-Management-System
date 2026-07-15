export const adminService = {
  async getDepartments(): Promise<string[]> {
    return Promise.resolve(["แผนก IT", "แผนกจัดซื้อ", "แผนก HR", "แผนกผลิต"]);
  },

  async getPositions(): Promise<string[]> {
    return Promise.resolve(["ผู้อำนวยการ", "ผู้จัดการ", "หัวหน้าแผนก", "พนักงาน"]);
  },
};
