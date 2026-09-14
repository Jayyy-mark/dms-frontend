import { Packer } from "docx";
import { saveAs } from "file-saver";
import { Staff } from "../../../interfaces/staff";
import { createCategory1Doc } from "./Category1Word";
import { createCategory2Doc } from "./Category2Word";
import { createCategory3Doc } from "./Category3Word";
import { createCategory4Doc } from "./Category4Word";
import { createCategory5Doc } from "./Category5Word";

export const exportStaffToWord = async (staff: Staff, category: number = 1) => {
    let doc;
    let fileNameSuffix = "";

    switch (category) {
        case 1:
            doc = createCategory1Doc(staff);
            fileNameSuffix = "Promotion_Transfer_Form";
            break;
        case 2:
            doc = createCategory2Doc(staff);
            fileNameSuffix = "Promotion_Other_Form";
            break;
        case 3:
            doc = createCategory3Doc(staff);
            fileNameSuffix = "Civil_Service_DB_Form";
            break;
        case 4:
            doc = createCategory4Doc(staff);
            fileNameSuffix = "Foreign_Travel_Initial_Form";
            break;
        case 5:
            doc = createCategory5Doc(staff);
            fileNameSuffix = "Secondee_Foreign_Travel_Form";
            break;
        default:
            doc = createCategory1Doc(staff);
            fileNameSuffix = "Form";
            break;
    }

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Staff_${staff.staff_id}_${staff.staff_name.replace(/\s+/g, "_")}_${fileNameSuffix}.docx`);
};
