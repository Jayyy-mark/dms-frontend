import PageMeta from "../../components/common/PageMeta";
import AddDocumentForm from "../../components/documents/AddDocumentForm";
import DocumentGuidelineDrawer from "../../components/documents/DocumentGuidelineDrawer";

export default function AddDocuments() {
  return (
    <>
      <PageMeta
        title="Upload Document | MOEE"
        description="Upload a new official document record"
      />
      <div className="space-y-6">
        <AddDocumentForm />
      </div>
      <DocumentGuidelineDrawer />
    </>
  );
}
