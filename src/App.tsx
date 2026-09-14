import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import DashboardDocuments from "./pages/Dashboard/DashboardDocuments";
import DashboardLocations from "./pages/Dashboard/DashboardLocations";
import Users from "./pages/Users/Users";
import ProtectedRoute from "./security/ProtectedRoute";
import AddUser from "./pages/Users/AddUser";
import EditUser from "./pages/Users/EditUser";
import Documents from "./pages/Documents/Document";
import Archives from "./pages/Archives/Archives";
import AddDocuments from "./pages/Documents/AddDocuments";
import Category from "./pages/Categories/Category";
import Logs from "./pages/Logs/Logs";
import AddRoles from "./pages/Roles/AddRole";
import Roles from "./pages/Roles/Roles";
import EditRoles from "./pages/Roles/EditRoles";
import Ranks from "./pages/Ranks/Rank";
import AddRanks from "./pages/Ranks/AddRanks";
import EditRanks from "./pages/Ranks/EditRanks";
import Buildings from "./pages/Buildings/Building";
import AddBuildings from "./pages/Buildings/AddBuilding";
import EditBuildings from "./pages/Buildings/EditBuilding";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Rooms from "./pages/Rooms/Room";
import AddRooms from "./pages/Rooms/AddRoom";
import EditRooms from "./pages/Rooms/EditRoom";
import AddDepartments from "./pages/Departments/AddDepartment";
import EditDepartments from "./pages/Departments/EditDepartment";
import Departments from "./pages/Departments/Department";
import Stypes from "./pages/Stypes/Stype";
import AddStypes from "./pages/Stypes/AddStype";
import EditStypes from "./pages/Stypes/EditStype";
import Dtypes from "./pages/Dtypes/Dtype";
import AddDtypes from "./pages/Dtypes/AddDtype";
import EditDtypes from "./pages/Dtypes/EditDtype";
import AddCategory from "./pages/Categories/AddCategory";
import EditCategory from "./pages/Categories/EditCategory";
import EditStaffs from "./pages/Staffs/EditStaff";
import Staffs from "./pages/Staffs/Staff";
import AddStaffs from "./pages/Staffs/AddStaff";
import EditDocuments from "./pages/Documents/EditDocument";
import Recycles from "./pages/Recycles/Recycles";
import Chatbot from "./pages/Users/Chatbot";
import DeepSearchDocuments from "./pages/Documents/DeepSearch";
import Locations from "./pages/Locations/Location";
import AddLocations from "./pages/Locations/AddLocations";
import EditLocations from "./pages/Locations/EditLocation";

import ModulesControl from "./pages/Modules/ModulesControl";
import UserRolesPage from "./pages/Settings/UserRolesPage";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={
              <ProtectedRoute roles={["admin", "super admin"]}>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/documents" element={
              <ProtectedRoute roles={["admin", "super admin"]}>
                <DashboardDocuments />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/locations" element={
              <ProtectedRoute roles={["admin", "super admin"]}>
                <DashboardLocations />
              </ProtectedRoute>
            } />

            <Route path="/modules" element={<ProtectedRoute roles={["admin", "super admin"]}><ModulesControl /></ProtectedRoute>} />
            <Route path="/settings/user-roles" element={<ProtectedRoute roles={["admin", "super admin"]}><UserRolesPage /></ProtectedRoute>} />

            {/* Others Page */}
            <Route path="/users/" element={<Users />} />
            <Route path="/users/add/" element={<AddUser />} />
            <Route path="/users/edit/" element={<EditUser />} />
            <Route path="/users/edit/:id" element={<EditUser />} />
            <Route path="/users/chatbot/" element={<Chatbot />} />


            {/* Departments Page */}
            <Route path="/departments/" element={<Departments />} />
            <Route path="/departments/add/" element={<AddDepartments />} />
            <Route path="/departments/edit/" element={<EditDepartments />} />
            <Route path="/departments/edit/:id" element={<EditDepartments />} />

            {/* Staffs Page */}
            <Route path="/staffs/" element={
              <ProtectedRoute roles={["admin", "super admin"]}>
                <Staffs />
              </ProtectedRoute>
            } />
            <Route path="/staffs/add/" element={<AddStaffs />} />
            <Route path="/staff/edit/" element={<EditStaffs />} />
            <Route path="/staff/edit/:id" element={<EditStaffs />} />

            <Route path="/stypes/" element={<Stypes />} />
            <Route path="/stypes/add/" element={<AddStypes />} />
            <Route path="/stypes/edit/" element={<EditStypes />} />
            <Route path="/stypes/edit/:id" element={<EditStypes />} />

            <Route path="/dtypes/" element={<Dtypes />} />
            <Route path="/dtypes/add/" element={<AddDtypes />} />
            <Route path="/dtypes/edit/" element={<EditDtypes />} />
            <Route path="/dtypes/edit/:id" element={<EditDtypes />} />

            <Route path="/logs/" element={<Logs />} />

            <Route path="/categories/" element={<Category />} />
            <Route path="/categories/add/" element={<AddCategory />} />
            <Route path="/categories/edit/" element={<EditCategory />} />
            <Route path="/categories/edit/:id" element={<EditCategory />} />

            <Route path="/roles/" element={<Roles />} />
            <Route path="/roles/add/" element={<AddRoles />} />
            <Route path="/roles/edit/" element={<EditRoles />} />
            <Route path="/roles/edit/:id" element={<EditRoles />} />

            <Route path="/ranks/" element={<Ranks />} />
            <Route path="/ranks/add/" element={<AddRanks />} />
            <Route path="/ranks/edit/" element={<EditRanks />} />
            <Route path="/ranks/edit/:id" element={<EditRanks />} />

            <Route path="/buildings/" element={<Buildings />} />
            <Route path="/buildings/add/" element={<AddBuildings />} />
            <Route path="/buildings/edit/" element={<EditBuildings />} />
            <Route path="/buildings/edit/:id" element={<EditBuildings />} />

            <Route path="/rooms/" element={<Rooms />} />
            <Route path="/rooms/add/" element={<AddRooms />} />
            <Route path="/rooms/edit/" element={<EditRooms />} />
            <Route path="/rooms/edit/:id" element={<EditRooms />} />

            <Route path="/documents/" element={<Documents />} />
            <Route path="/documents/add/" element={<AddDocuments />} />
            <Route path="/documents/edit/" element={<EditDocuments />} />
            <Route path="/documents/edit/:id" element={<EditDocuments />} />
            <Route path="/documents/deepsearch/" element={<DeepSearchDocuments />} />

            <Route path="/locations/" element={<Locations />} />
            <Route path="/locations/add/" element={<AddLocations />} />
            <Route path="/locations/edit/" element={<EditLocations />} />
            <Route path="/locations/edit/:id" element={<EditLocations />} />

            <Route path="/documents/archives/" element={<Archives />} />
            <Route path="/documents/recycles/" element={<Recycles />} />
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={
              <ProtectedRoute roles={["admin", "super admin"]}>
                <Calendar />
              </ProtectedRoute>
            }
            />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        className="z-100"
      />
    </>
  );
}
