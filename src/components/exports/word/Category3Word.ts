import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx";
import { Staff } from "../../../interfaces/staff";
import { formRowNoDash, noBorder, gridCell } from "./wordExportHelpers";

export const createCategory3Doc = (staff: Staff): Document => {
    // ── Form fields list (18 points format) ──────────────────────────
    const formFields: [string, string, string][] = [
        ["၁။", "အမည်(ကျား/မ)", `${staff.staff_name ?? "-"} (${staff.staff_gender ?? "-"})`],
        ["၂။", "ဝန်ထမ်းအမှတ်", staff.staff_id ?? "-"],
        ["၃။", "မွေးနေ့ (ရက်၊လ၊နှစ်)", "၁၅-၀၅-၁၉၉၆"],
        ["၄။", "လူမျိုး/ဘာသာ", "ဗမာ / ဗုဒ္ဓဘာသာ"],
        ["၅။", "အဘအမည်", "ဦးကျော်အောင်"],
        ["၆။", "အမိအမည်", "ဒေါ်ခင်မာ"],
        ["၇။", "နိုင်ငံသားစိစစ်ရေးအမှတ်", "၁၂/ကမန(နိုင်)၁၂၃၄၅၆"],
        ["၈။", "ဇနီး/ခင်ပွန်းအမည်", "-"],
        ["၉။", "သား/သမီးအမည်", "-"],
        ["၁၀။", "လိပ်စာ", staff.staff_address ?? "-"],
        ["၁၁။", "ပညာအရည်အချင်း", "B.C.Sc (Computer Science)"],
        ["၁၂။", "လက်ရှိရာထူး/လစာနှုန်း/ဌာန", `${staff.role?.role_name ?? "-"} / ၅၀၀,၀၀၀ ကျပ် / ICT`],
        ["၁၃။", "သွေးအုပ်စု", "O"],
    ];

    const table14 = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [gridCell("စဉ်", true), gridCell("ရာထူး/ဌာန", true), gridCell("တာဝန်ထမ်းဆောင်သည့်ကာလ (မှ - ထိ)", true), gridCell("နေရာ/ဒေသ", true)] }),
            new TableRow({ children: [gridCell("၁"), gridCell("Junior Developer / ICT"), gridCell(""), gridCell("Yangon")] }),
            new TableRow({ children: [gridCell(""), gridCell(""), gridCell(""), gridCell("")] }),
        ]
    });

    const table15 = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [gridCell("စဉ်", true), gridCell("သင်တန်းအမည်", true), gridCell("တာဝန်ထမ်းဆောင်မည့်ကာလ (မှ - ထိ)", true), gridCell("နေရာ/ဒေသ", true)] }),
            new TableRow({ children: [gridCell("၁"), gridCell(""), gridCell(""), gridCell("")] }),
        ]
    });

    const table16 = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [gridCell("စဉ်", true), gridCell("သင်တန်းအမည်", true), gridCell("တာဝန်ထမ်းဆောင်မည့်ကာလ (မှ - ထိ)", true), gridCell("နေရာ/နိုင်ငံ", true)] }),
            new TableRow({ children: [gridCell("၁"), gridCell(""), gridCell(""), gridCell("")] }),
        ]
    });

    const table17 = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [gridCell("ပြစ်ဒဏ်", true), gridCell("ပြစ်ဒဏ်ချမှတ်ခံရသည့်အကြောင်းအရာ", true), gridCell("ပြစ်ဒဏ်ချမှတ်သည့်ကာလ (မှ - ထိ)", true)] }),
            new TableRow({ children: [gridCell(""), gridCell(""), gridCell("")] }),
        ]
    });

    const table18 = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [gridCell("စဉ်", true), gridCell("ဘွဲ့ထူး၊ဂုဏ်ထူးတံဆိပ်အမည်", true), gridCell("အမိန့်အမှတ်/ခုနှစ်", true)] }),
            new TableRow({ children: [gridCell("၁"), gridCell(""), gridCell("")] }),
        ]
    });

    return new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                        children: [new TextRun({ text: "ကိုယ်ရေးမှတ်တမ်း", bold: true, size: 28 })],
                    }),

                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: noBorder,
                        rows: formFields.map(([num, label, val]) => formRowNoDash(num, label, val)),
                    }),

                    new Paragraph({ text: "၁၄။ နိုင်ငံ့ဝန်ထမ်းတာဝန်ထမ်းဆောင်မှုမှတ်တမ်း (စစ်ဘက်/နယ်ဘက်)", spacing: { before: 200, after: 100 } }),
                    table14,

                    new Paragraph({ text: "၁၅။ ပြည်တွင်းသင်တန်းများ တက်ရောက်မှု", spacing: { before: 200, after: 100 } }),
                    table15,

                    new Paragraph({ text: "၁၆။ ပြည်ပသင်တန်းများ တက်ရောက်မှု", spacing: { before: 200, after: 100 } }),
                    table16,

                    new Paragraph({ text: "၁၇။ ပြစ်မှုမှတ်တမ်း", spacing: { before: 200, after: 100 } }),
                    table17,

                    new Paragraph({ text: "၁၈။ ချီးမြှင့်ခံရသည့် ဘွဲ့ထူး၊ဂုဏ်ထူးတံဆိပ်များ", spacing: { before: 200, after: 100 } }),
                    table18,

                    new Paragraph({ text: "အထက်ပါ ဖြည့်စွက်ချက်များ မှန်ကန်ကြောင်း လက်မှတ်ရေးထိုးပါသည်။", spacing: { before: 200, after: 400 } }),

                    // Signatures
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ borders: noBorder, children: [] }),
                                    new TableCell({
                                        borders: noBorder,
                                        children: [
                                            new Paragraph({ children: [new TextRun({ text: "လက်မှတ် - ________________________", size: 20 })] }),
                                            new Paragraph({ children: [new TextRun({ text: `အမည် - ${staff.staff_name}`, size: 20 })], spacing: { before: 100 } }),
                                            new Paragraph({ children: [new TextRun({ text: `ရာထူး - ${staff.role?.role_name ?? "-"}`, size: 20 })], spacing: { before: 100 } }),
                                            new Paragraph({ children: [new TextRun({ text: `ဖုန်းနံပါတ်(ရုံး/လက်ကိုင်ဖုန်း) - ${staff.staff_ph_number ?? "-"}`, size: 20 })], spacing: { before: 100 } }),
                                            new Paragraph({ children: [new TextRun({ text: `အီးမေးလ် - ${staff.staff_email ?? "-"}`, size: 20 })], spacing: { before: 100 } }),
                                            new Paragraph({ children: [new TextRun({ text: `ရက်စွဲ - ${new Date().toLocaleDateString()}`, size: 20 })], spacing: { before: 100 } }),
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ],
            },
        ],
    });
};
