import PageMeta from "../../components/common/PageMeta";
import DashboardLocationsTab from "../../components/ecommerce/DashboardLocationsTab";

export default function DashboardLocations() {
  return (
    <>
      <PageMeta
        title="MOGE Dashboard — Locations"
        description="MOGE Internal System Management Dashboard — Locations view"
      />
      <DashboardLocationsTab />
    </>
  );
}
