import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import EditDtypeForm from "../../components/dtypes/EditDtypeForm";

export default function EditDtypes() {
  return (
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadCrumb pageTitle="Document types Management" />
      <div className="space-y-6">
        <EditDtypeForm/>
      </div>
    </>
  );
}
