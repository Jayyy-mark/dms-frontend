import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";


const userTableData = [
  {
    id: 1,
    userId: "USR-001",
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
    avatar: "/images/user/user-01.jpg",
  },
  {
    id: 2,
    userId: "USR-002",
    name: "Sarah Smith",
    email: "sarah@example.com",
    role: "Manager",
    status: "Inactive",
    avatar: "/images/user/user-02.jpg",
  },
  {
    id: 3,
    userId: "USR-003",
    name: "David Lee",
    email: "david@example.com",
    role: "User",
    status: "Suspended",
    avatar: "/images/user/user-03.jpg",
  },
];

export default function SystemUsers() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          System Users
        </h3>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 text-start text-theme-xs">
                User
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs">
                User ID
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs">
                Email
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs">
                Role
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {userTableData.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[40px] w-[40px] overflow-hidden rounded-full">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-[40px] w-[40px]"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {user.name}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-3 text-theme-sm">
                  {user.userId}
                </TableCell>

                <TableCell className="py-3 text-theme-sm">
                  {user.email}
                </TableCell>

                <TableCell className="py-3 text-theme-sm">
                  {user.role}
                </TableCell>

                <TableCell className="py-3">
                  <Badge
                    size="sm"
                    color={
                      user.status === "Active"
                        ? "success"
                        : user.status === "Inactive"
                        ? "warning"
                        : "error"
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}