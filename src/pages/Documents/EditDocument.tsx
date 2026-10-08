import PageMeta from "../../components/common/PageMeta";
import EditDocumentForm from "../../components/documents/EditDocumentForm";
import DocumentGuidelineDrawer from "../../components/documents/DocumentGuidelineDrawer";

export default function EditDocuments() {
  return (
    <>
      <PageMeta
        title="Edit Document | MOEE"
        description="Edit and update official document record"
      />
      <div className="space-y-6">
        <EditDocumentForm />
      </div>
      <DocumentGuidelineDrawer />
    </>
  );
}
