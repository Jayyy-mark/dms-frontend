import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import EditLocationForm from "../../components/locations/EditLocationForm";



export default function EditLocations() {
  return (
    <div>
      <PageMeta
        title="Edit Activity Location | MOGE"
        description="Edit activity record details and photos"
      />
      <PageBreadCrumb pageTitle="Activities Management" />
      <div className="space-y-6">
        <EditLocationForm />
      </div>
    </div>
  );
}
