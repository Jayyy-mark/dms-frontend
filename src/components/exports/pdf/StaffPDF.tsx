import jsPDF from "jspdf";
import { Staff } from "../../../interfaces/staff";
import { drawPdfRow } from "./pdfExportHelpers";

export const exportStaffToPDF = async (staff: Staff, category: number = 1) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const marginL = 20;
    const marginR = 20;

    let y = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    
    // Title
    doc.text(`Category ${category} Form`, pageW / 2, y, { align: "center" });
    y += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Note: Full Myanmar text layout is best viewed via Word Export (.docx)", pageW / 2, y, { align: "center" });
    doc.text("due to PDF font rendering limitations without custom TTF fonts.", pageW / 2, y + 5, { align: "center" });
    y += 15;

    // We use a simplified mapping for PDF to demonstrate the data is there
    const commonFields: [string, string, string][] = [
        ["1.", "Name", staff.staff_name ?? "-"],
        ["2.", "Staff ID", staff.staff_id ?? "-"],
        ["3.", "Department", staff.department?.department_name ?? "-"],
        ["4.", "Role", staff.role?.role_name ?? "-"],
        ["5.", "Rank", staff.rank?.rank_name ?? "-"],
        ["6.", "Phone", staff.staff_ph_number ?? "-"],
        ["7.", "Email", staff.staff_email ?? "-"],
        ["8.", "Address", staff.staff_address ?? "-"],
    ];

    commonFields.forEach(([num, label, val]) => {
        y = drawPdfRow(doc, y, marginL, pageW, marginR, num, label, val);
    });

    y += 20;
    doc.text("Generated on: " + new Date().toLocaleDateString(), marginL, y);

    let fileNameSuffix = `Cat${category}`;
    doc.save(`Staff_${staff.staff_id}_${staff.staff_name.replace(/\s+/g, "_")}_${fileNameSuffix}.pdf`);
};
