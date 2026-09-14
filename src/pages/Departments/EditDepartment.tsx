import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import EditDepartmentForm from "../../components/departments/EditDepartmentForm";

export default function EditDepartments() {
  return (
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadCrumb pageTitle="Departments Management" />
      <div className="space-y-6">
        <EditDepartmentForm/>
      </div>
    </>
  );
}
