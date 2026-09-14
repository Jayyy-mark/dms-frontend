import { useState } from "react";
import { MoreDotIcon } from "../../icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export function DocumentCategoryChart() {
  const options: ApexOptions = {
    chart: {
      type: "pie",
      height: 180,
      fontFamily: "Outfit, sans-serif",
    },
    labels: ["HR", "Finance", "Legal", "Operations"],
    legend: {
      position: "bottom",
    },
  };

  const series = [120, 95, 60, 150];

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between pb-10">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Documents by Category
        </h3>

        <div className="relative inline-block">
          <button onClick={() => setIsOpen(!isOpen)}>
            <MoreDotIcon className="size-6 text-gray-400" />
          </button>

          <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
            <DropdownItem onItemClick={() => setIsOpen(false)}>Manage Categories</DropdownItem>
            <DropdownItem onItemClick={() => setIsOpen(false)}>View Details</DropdownItem>
          </Dropdown>
        </div>
      </div>

      <Chart options={options} series={series} type="pie" height={180} />
    </div>
  );
}