import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import AddDtypeForm from "../../components/dtypes/AddDtypeFrom";


export default function AddDtypes() {
  return (
    <div>
      <PageMeta
        title="React.js Form Elements Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadCrumb pageTitle="Dtype Management" />
        <div className="space-y-6">
          <AddDtypeForm />
        </div>
    </div>
  );
}
