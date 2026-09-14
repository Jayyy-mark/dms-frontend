import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal/index";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import { Staff } from "../../../interfaces/staff";
import Pagination from "../../ui/pagination/Pagination";

// --- YOUR INTERFACE ---
// Ensure this path matches your project

// --- MOCK DATA (Matching your interface) ---
const tableData: Staff[] = [
  {
    id: 1,
    staff_id: "S-001",
    staff_name: "Lindsey Curtis",
    staff_email: "lindsey.c@example.com",
    staff_ph_number: "+1 (555) 123-4567",
    staff_address: "123 Maple St, Springfield",
    staff_gender: "Female",
    department_id: "D-001",
    role_id: "R-01",
    rank_id: "RK-01",
    stype_id: "ST-01",
    department: {
      id: 1,
      department_id: "D-001",
      department_name: "Human Resources",
      room_id: ""
    },
    role: {
      id: 1,
      role_id: "R-01",
      role_name: "Manager",
    },
    rank: {
      id: 1,
      rank_name: "Senior",
      rank_id: ""
    },
    stype: {
      id: 1,
      stype_name: "Full-time",
      stype_id: ""
    },
  },
  {
    id: 2,
    staff_id: "S-002",
    staff_name: "Kaiya George",
    staff_email: "k.george@example.com",
    staff_ph_number: "+1 (555) 987-6543",
    staff_address: "456 Oak Ave, Metropolis",
    staff_gender: "Female",
    department_id: "D-002",
    role_id: "R-02",
    // Testing undefined relations
    department: undefined,
    role: {
      id: 2,
      role_id: "R-02",
      role_name: "Developer",
    },
    rank: { id: 2, rank_id: "RNK-002", rank_name: "Junior" },
    stype: { id: 2, stype_id: "STYP-002", stype_name: "Contract" },
    rank_id: "",
    stype_id: ""
  },

];

export default function StaffTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);



  //custom section
  const filteredData = tableData.filter((staff) =>
    staff.staff_name.toLowerCase().includes(search.toLowerCase()) ||
    staff.staff_email.toLowerCase().includes(search.toLowerCase())
  );

  const total = filteredData.length;
  const start = (page - 1) * pageSize;
  const paginatedData = filteredData.slice(start, start + pageSize);




  const closeModal = () => {
    setIsOpen(false);
    setSelectedStaff(null);
  };

  const handleSave = () => {
    console.log("Saving changes for:", selectedStaff?.staff_id);
    closeModal();
  };


  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <span className="text-sm text-gray-600">
            Recent Documents
          </span>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-[200px]"
            />

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="border rounded-md px-2 text-gray-600 py-1 text-sm"
            >
              {[5, 10, 20].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        </div>
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-sm font-semibold text-gray-500 uppercase">Document</TableCell>
              <TableCell isHeader className="px-5 py-3 text-sm font-semibold text-gray-500 uppercase">Staff</TableCell>
              <TableCell isHeader className="px-5 py-3 text-sm font-semibold text-gray-500 uppercase">Descriptions</TableCell>
              <TableCell isHeader className="px-5 py-3 text-sm font-semibold text-gray-500 uppercase">Details</TableCell>
              {/* <TableCell isHeader className="px-5 py-3 text-sm font-semibold text-gray-500 uppercase">Actions</TableCell> */}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginatedData.map((staff) => (
              <TableRow key={staff.id}>
                {/* User Column: ID, Name, Gender */}
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <span className="font-medium">{staff.staff_name.charAt(0)}</span>
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 text-sm dark:text-white/90">
                        {staff.staff_name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="block text-sm text-gray-500">ID: {staff.staff_id}</span>
                        <span className="text-sm bg-gray-100 px-1.5 rounded text-gray-600">{staff.staff_gender}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Contact Column: Email, Phone, Address */}
                <TableCell className="px-4 py-3 text-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-700">{staff.staff_email}</span>
                    <span className="text-sm text-gray-500">{staff.staff_ph_number}</span>
                    <span className="text-sm text-gray-400 truncate max-w-[200px]" title={staff.staff_address}>{staff.staff_address}</span>
                  </div>
                </TableCell>

                {/* Relations: Department and Role */}
                <TableCell className="px-4 py-3 text-start">
                  <div className="flex flex-col gap-1 text-sm text-gray-700">
                    <span className="font-medium">
                      {staff.department?.department_name || <span className="text-gray-400 italic">No Dept</span>}
                    </span>
                    <span className="text-sm text-gray-500">
                      {staff.role?.role_name || <span className="text-gray-400 italic">No Role</span>}
                    </span>
                  </div>
                </TableCell>

                {/* Details: Rank, Stype */}
                <TableCell className="px-4 py-3 text-start">
                  <div className="flex gap-2">
                    <Badge size="sm" variant="light">{staff.rank?.rank_name || 'N/A'}</Badge>
                    <Badge size="sm" color="success">{staff.stype?.stype_name || 'N/A'}</Badge>
                  </div>
                </TableCell>

                {/* Actions */}
                {/* <TableCell className="px-4 py-3 text-start">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2"
                      onClick={() => openModal(staff)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white text-base px-3 py-2"
                      onClick={() => handleDelete(staff.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Pagination
          page={page}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      {/* SINGLE MODAL OUTSIDE LOOP */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-yellow no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Staff: {selectedStaff?.staff_name}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Update staff details using the form below.
            </p>
          </div>

          <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="px-2 overflow-y-auto custom-scrollbar max-h-[60vh]">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Staff Name</Label>
                  <Input type="text" value={selectedStaff?.staff_name} />
                </div>

                <div>
                  <Label>Gender</Label>
                  <Input type="text" value={selectedStaff?.staff_gender} />
                </div>

                <div>
                  <Label>Email Address</Label>
                  <Input type="email" value={selectedStaff?.staff_email} />
                </div>

                <div>
                  <Label>Phone Number</Label>
                  <Input type="text" value={selectedStaff?.staff_ph_number} />
                </div>

                <div className="lg:col-span-2">
                  <Label>Address</Label>
                  <Input type="text" value={selectedStaff?.staff_address} />
                </div>

                <div>
                  <Label>Department</Label>
                  <Input
                    type="text"
                    value={selectedStaff?.department?.department_name ?? "Unassigned"}
                    
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label>Role</Label>
                  <Input
                    type="text"
                    value={selectedStaff?.role?.role_name ?? "Unassigned"}
                    
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-2 mt-8">
              <Button size="sm" variant="info" onClick={closeModal} className="border-gray-300 text-gray-700">
                Cancel
              </Button>
              <Button size="sm" variant="primary" className="bg-blue-600 text-white">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>

    </div>
  );
}