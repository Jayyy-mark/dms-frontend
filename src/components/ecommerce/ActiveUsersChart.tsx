import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useState } from "react";

export function ActiveUsersChart() {
  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 180,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
  };

  const series = [
    {
      name: "Active Users",
      data: [12, 18, 15, 22, 30],
    },
  ];

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Active Users
        </h3>

        <div className="relative inline-block">
          <button onClick={() => setIsOpen(!isOpen)}>
            <MoreDotIcon className="size-6 text-gray-400" />
          </button>

          <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
            <DropdownItem onItemClick={() => setIsOpen(false)}>User Report</DropdownItem>
            <DropdownItem onItemClick={() => setIsOpen(false)}>Export Data</DropdownItem>
          </Dropdown>
        </div>
      </div>

      <Chart options={options} series={series} type="line" height={180} />
    </div>
  );
}