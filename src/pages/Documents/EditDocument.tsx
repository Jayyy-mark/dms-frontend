import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import EditDocumentForm from "../../components/documents/EditDocumentForm";



export default function EditDocuments() {
  return (
    <div>
      <PageMeta
        title="React.js Form Elements Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadCrumb pageTitle="Documents Management" />
        <div className="space-y-6">
          <EditDocumentForm />
        </div>
    </div>
  );
}
