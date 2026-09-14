import PageMeta from "../../components/common/PageMeta";
import DashboardDocumentsTab from "../../components/ecommerce/DashboardDocumentsTab";

export default function DashboardDocuments() {
  return (
    <>
      <PageMeta
        title="MOGE Dashboard — Documents"
        description="MOGE Internal System Management Dashboard — Documents view"
      />
      <DashboardDocumentsTab />
    </>
  );
}
