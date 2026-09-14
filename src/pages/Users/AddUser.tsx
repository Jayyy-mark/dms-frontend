import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import UserInputs from "../../components/Users/form/UserInputs";


export default function AddUser() {
  return (
    <div>
      <PageMeta
        title="User Management | Add User"
        description="Add User Page"
      />
      <PageBreadCrumb pageTitle="Users Management" />
      <div className="space-y-6">
        <UserInputs />
      </div>
    </div>
  );
}
