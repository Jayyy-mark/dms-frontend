import PageMeta from "../../components/common/PageMeta";
import RegisterStaff from "../../components/staffs/RegisterStaff";
import StaffGuidelineDrawer from "../../components/staffs/StaffGuidelineDrawer";

export default function RegisterStaffPage() {
  return (
    <div>
      <PageMeta
        title="Staff Registration | MOGE HRMS"
        description="Register a new staff member with full personnel record"
      />
      <RegisterStaff />
      <StaffGuidelineDrawer />
    </div>
  );
}
