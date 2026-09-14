import PageMeta from "../../components/common/PageMeta";
import AddLocationForm from "../../components/locations/AddLocationForm";
import LocationGuidelineDrawer from "../../components/locations/LocationGuidelineDrawer";

export default function AddLocations() {
  return (
    <>
      <PageMeta
        title="Add Activity Location | MOEE"
        description="Add a new activity record and photo location"
      />
      <div className="space-y-6">
        <AddLocationForm />
      </div>
      <LocationGuidelineDrawer />
    </>
  );
}
