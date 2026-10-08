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
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/documents" element={
              <ProtectedRoute feature="documents" action="view">
                <DashboardDocuments />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/locations" element={
              <ProtectedRoute feature="locations" action="view">
                <DashboardLocations />
              </ProtectedRoute>
            } />

            <Route path="/modules" element={<ProtectedRoute roles={["admin", "super admin"]}><ModulesControl /></ProtectedRoute>} />
            <Route path="/settings/user-roles" element={<ProtectedRoute roles={["admin", "super admin"]}><UserRolesPage /></ProtectedRoute>} />

            {/* Users Page */}
            <Route path="/users/" element={<ProtectedRoute feature="users" action="view"><Users /></ProtectedRoute>} />
            <Route path="/users/add/" element={<ProtectedRoute feature="users" action="add"><AddUser /></ProtectedRoute>} />
            <Route path="/users/edit/" element={<ProtectedRoute feature="users" action="edit"><EditUser /></ProtectedRoute>} />
            <Route path="/users/edit/:id" element={<ProtectedRoute feature="users" action="edit"><EditUser /></ProtectedRoute>} />
            <Route path="/users/chatbot/" element={<ProtectedRoute feature="chatbot" action="view"><Chatbot /></ProtectedRoute>} />

            {/* Departments Page */}
            <Route path="/departments/" element={<ProtectedRoute feature="departments" action="view"><Departments /></ProtectedRoute>} />
            <Route path="/departments/add/" element={<ProtectedRoute feature="departments" action="add"><AddDepartments /></ProtectedRoute>} />
            <Route path="/departments/edit/" element={<ProtectedRoute feature="departments" action="edit"><EditDepartments /></ProtectedRoute>} />
            <Route path="/departments/edit/:id" element={<ProtectedRoute feature="departments" action="edit"><EditDepartments /></ProtectedRoute>} />

            {/* Staffs Page */}
            <Route path="/staffs/" element={<ProtectedRoute feature="employees" action="view"><Staffs /></ProtectedRoute>} />
            <Route path="/staffs/add/" element={<ProtectedRoute feature="employees" action="add"><AddStaffs /></ProtectedRoute>} />
            <Route path="/staff/edit/" element={<ProtectedRoute feature="employees" action="edit"><EditStaffs /></ProtectedRoute>} />
            <Route path="/staff/edit/:id" element={<ProtectedRoute feature="employees" action="edit"><EditStaffs /></ProtectedRoute>} />

            {/* Staff Types */}
            <Route path="/stypes/" element={<ProtectedRoute feature="staff_types" action="view"><Stypes /></ProtectedRoute>} />
            <Route path="/stypes/add/" element={<ProtectedRoute feature="staff_types" action="add"><AddStypes /></ProtectedRoute>} />
            <Route path="/stypes/edit/" element={<ProtectedRoute feature="staff_types" action="edit"><EditStypes /></ProtectedRoute>} />
            <Route path="/stypes/edit/:id" element={<ProtectedRoute feature="staff_types" action="edit"><EditStypes /></ProtectedRoute>} />

            {/* Document Types */}
            <Route path="/dtypes/" element={<ProtectedRoute feature="dtypes" action="view"><Dtypes /></ProtectedRoute>} />
            <Route path="/dtypes/add/" element={<ProtectedRoute feature="dtypes" action="add"><AddDtypes /></ProtectedRoute>} />
            <Route path="/dtypes/edit/" element={<ProtectedRoute feature="dtypes" action="edit"><EditDtypes /></ProtectedRoute>} />
            <Route path="/dtypes/edit/:id" element={<ProtectedRoute feature="dtypes" action="edit"><EditDtypes /></ProtectedRoute>} />

            {/* Logs */}
            <Route path="/logs/" element={<ProtectedRoute feature="logs" action="view"><Logs /></ProtectedRoute>} />

            {/* Categories */}
            <Route path="/categories/" element={<ProtectedRoute feature="categories" action="view"><Category /></ProtectedRoute>} />
            <Route path="/categories/add/" element={<ProtectedRoute feature="categories" action="add"><AddCategory /></ProtectedRoute>} />
            <Route path="/categories/edit/" element={<ProtectedRoute feature="categories" action="edit"><EditCategory /></ProtectedRoute>} />
            <Route path="/categories/edit/:id" element={<ProtectedRoute feature="categories" action="edit"><EditCategory /></ProtectedRoute>} />

            {/* Roles */}
            <Route path="/roles/" element={<ProtectedRoute feature="roles" action="view"><Roles /></ProtectedRoute>} />
            <Route path="/roles/add/" element={<ProtectedRoute feature="roles" action="add"><AddRoles /></ProtectedRoute>} />
            <Route path="/roles/edit/" element={<ProtectedRoute feature="roles" action="edit"><EditRoles /></ProtectedRoute>} />
            <Route path="/roles/edit/:id" element={<ProtectedRoute feature="roles" action="edit"><EditRoles /></ProtectedRoute>} />

            {/* Ranks */}
            <Route path="/ranks/" element={<ProtectedRoute feature="ranks" action="view"><Ranks /></ProtectedRoute>} />
            <Route path="/ranks/add/" element={<ProtectedRoute feature="ranks" action="add"><AddRanks /></ProtectedRoute>} />
            <Route path="/ranks/edit/" element={<ProtectedRoute feature="ranks" action="edit"><EditRanks /></ProtectedRoute>} />
            <Route path="/ranks/edit/:id" element={<ProtectedRoute feature="ranks" action="edit"><EditRanks /></ProtectedRoute>} />

            {/* Buildings */}
            <Route path="/buildings/" element={<ProtectedRoute feature="buildings" action="view"><Buildings /></ProtectedRoute>} />
            <Route path="/buildings/add/" element={<ProtectedRoute feature="buildings" action="add"><AddBuildings /></ProtectedRoute>} />
            <Route path="/buildings/edit/" element={<ProtectedRoute feature="buildings" action="edit"><EditBuildings /></ProtectedRoute>} />
            <Route path="/buildings/edit/:id" element={<ProtectedRoute feature="buildings" action="edit"><EditBuildings /></ProtectedRoute>} />

            {/* Rooms */}
            <Route path="/rooms/" element={<ProtectedRoute feature="rooms" action="view"><Rooms /></ProtectedRoute>} />
            <Route path="/rooms/add/" element={<ProtectedRoute feature="rooms" action="add"><AddRooms /></ProtectedRoute>} />
            <Route path="/rooms/edit/" element={<ProtectedRoute feature="rooms" action="edit"><EditRooms /></ProtectedRoute>} />
            <Route path="/rooms/edit/:id" element={<ProtectedRoute feature="rooms" action="edit"><EditRooms /></ProtectedRoute>} />

            {/* Documents */}
            <Route path="/documents/" element={<ProtectedRoute feature="documents" action="view"><Documents /></ProtectedRoute>} />
            <Route path="/documents/add/" element={<ProtectedRoute feature="documents" action="add"><AddDocuments /></ProtectedRoute>} />
            <Route path="/documents/edit/" element={<ProtectedRoute feature="documents" action="edit"><EditDocuments /></ProtectedRoute>} />
            <Route path="/documents/edit/:id" element={<ProtectedRoute feature="documents" action="edit"><EditDocuments /></ProtectedRoute>} />
            <Route path="/documents/deepsearch/" element={<ProtectedRoute feature="deepsearch" action="view"><DeepSearchDocuments /></ProtectedRoute>} />

            {/* Locations / Activities */}
            <Route path="/locations/" element={<ProtectedRoute feature="locations" action="view"><Locations /></ProtectedRoute>} />
            <Route path="/locations/add/" element={<ProtectedRoute feature="locations" action="add"><AddLocations /></ProtectedRoute>} />
            <Route path="/locations/edit/" element={<ProtectedRoute feature="locations" action="edit"><EditLocations /></ProtectedRoute>} />
            <Route path="/locations/edit/:id" element={<ProtectedRoute feature="locations" action="edit"><EditLocations /></ProtectedRoute>} />

            <Route path="/documents/archives/" element={<ProtectedRoute feature="archives" action="view"><Archives /></ProtectedRoute>} />
            <Route path="/documents/recycles/" element={<ProtectedRoute feature="recycle_bin" action="view"><Recycles /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfiles /></ProtectedRoute>} />
            <Route path="/calendar" element={
              <ProtectedRoute feature="calendar" action="view">
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
