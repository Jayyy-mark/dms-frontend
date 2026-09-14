import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx";
import { Staff } from "../../../interfaces/staff";
import { formRow, noBorder, gridCell } from "./wordExportHelpers";

export const createCategory2Doc = (staff: Staff): Document => {
    // ── Form fields list (21 points format) ──────────────────────────
    const formFields: [string, string, string][] = [
        ["၁။", "အမည်", staff.staff_name ?? "-"],
        ["၂။", "နိုင်ငံသားစိစစ်ရေးကတ်ပြားအမှတ်", staff.staff_id ?? "-"],
        ["၃။", "လူမျိုး/ဘာသာ", "ဗမာ / ဗုဒ္ဓဘာသာ"],
        ["၄။", "မွေးဖွားရာအရပ်", "ရန်ကုန်တိုင်းဒေသကြီး၊ ရန်ကုန်မြို့"],
        ["၅။", "အဘအမည်", "ဦးကျော်အောင်"],
        ["", "အမိအမည်", "ဒေါ်ခင်မာ"],
        ["၆။", "အဘအလုပ်အကိုင်", "စီးပွားရေးလုပ်ငန်းရှင်"],
        ["", "အမိအလုပ်အကိုင်", "ဆရာမ"],
        ["၇။", "ဇနီး/ခင်ပွန်းအမည်နှင့် အလုပ်အကိုင်", "-"],
        ["၈။", "မွေးဖွားသည့်ရက်၊ လ၊ ခုနှစ်", "၁၅-၀၅-၁၉၉၆"],
        ["၉။", "ကိုယ်တွင်ထင်ရှားသည့်အမှတ်အသား", "ညာဘက်လက်မောင်းတွင် မှဲ့ရှိ"],
        ["၁၀။", "လက်ရှိရာထူး", staff.role?.role_name ?? "-"],
        ["၁၁။", "လက်ရှိနေရပ်လိပ်စာ", staff.staff_address ?? "-"],
        ["၁၂။", "အမြဲတမ်းနေရပ်လိပ်စာ", staff.staff_address ?? "-"],
        ["၁၃။", "ပညာအရည်အချင်း", "B.C.Sc (Computer Science)"],
        ["၁၄။", "တတ်မြောက်သည့် အခြားဘာသာစကားနှင့် တတ်ကျွမ်းသည့်အဆင့်", "English (Advanced)"],
    ];

    const table15 = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [gridCell("စဉ်", true), gridCell("ကာလ (နေ့ရက်မှ - နေ့ရက်အထိ)", true), gridCell("သင်တန်းအကြောင်းအရာ", true), gridCell("တည်နေရာ", true), gridCell("အဆင့်", true)] }),
            new TableRow({ children: [gridCell("၁"), gridCell(""), gridCell(""), gridCell(""), gridCell("")] }),
            new TableRow({ children: [gridCell(""), gridCell(""), gridCell(""), gridCell(""), gridCell("")] }),
        ]
    });

    const table16 = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [gridCell("တာဝန်", true), gridCell("ရုံး/ဌာန/အဖွဲ့အစည်း", true), gridCell("နေ့ရက်မှ", true), gridCell("နေ့ရက်အထိ", true), gridCell("မှတ်ချက်", true)] }),
            new TableRow({ children: [gridCell("Junior Developer"), gridCell("ICT"), gridCell(""), gridCell(""), gridCell("")] }),
            new TableRow({ children: [gridCell(""), gridCell(""), gridCell(""), gridCell(""), gridCell("")] }),
        ]
    });

    const table18 = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [gridCell("စဉ်", true), gridCell("ချီးမြှင့်ခံရသည့်ကာလ", true), gridCell("ချီးမြှင့်သည့်ဘွဲ့/တံဆိပ်အမျိုးအစား", true), gridCell("ဆုတံဆိပ်အမှတ် အမိန့်စာနှင့်ရရှိသည့်ရက်စွဲ", true)] }),
            new TableRow({ children: [gridCell("၁"), gridCell(""), gridCell(""), gridCell("")] }),
        ]
    });

    return new Document({
        sections: [
            {
                properties: {},
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                        children: [new TextRun({ text: "ကိုယ်ရေးမှတ်တမ်း", bold: true, size: 28 })],
                    }),

                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: noBorder,
                        rows: formFields.map(([num, label, val]) => formRow(num, label, val)),
                    }),

                    new Paragraph({ text: "၁၅။ တက်ရောက်ခဲ့သည့် သင်တန်းများ", spacing: { before: 200, after: 100 } }),
                    table15,

                    new Paragraph({ text: "၁၆။ ထမ်းဆောင်ခဲ့သောတာဝန်များ", spacing: { before: 200, after: 100 } }),
                    table16,

                    new Paragraph({ text: "၁၇။ ပါဝင်ဆောင်ရွက်ဆဲနှင့် ဆောင်ရွက်ခဲ့သည့်လူမှုရေးနှင့် အစိုးရမဟုတ်သော အဖွဲ့အစည်းများ၏ အမည်များနှင့်တာဝန်များ", spacing: { before: 200, after: 100 } }),
                    new Paragraph({ text: "မရှိပါ", indent: { left: 720 }, spacing: { after: 200 } }),

                    new Paragraph({ text: "၁၈။ ချီးမြှင့်ခံရသည့်ဘွဲ့ထူး၊ ဂုဏ်ထူးတံဆိပ်လက်မှတ်များ", spacing: { before: 200, after: 100 } }),
                    table18,

                    new Paragraph({ text: "၁၉။ အပြစ်ပေးခံရခြင်းများ", spacing: { before: 200, after: 100 } }),
                    new Paragraph({ text: "မရှိပါ", indent: { left: 720 }, spacing: { after: 200 } }),

                    new Paragraph({ text: "၂၀။ အခြားတင်ပြလိုသည့်အချက်များ", spacing: { before: 200, after: 100 } }),
                    new Paragraph({ text: "မရှိပါ", indent: { left: 720 }, spacing: { after: 400 } }),

                    new Paragraph({ text: "၂၁။ အထက်ဖော်ပြပါ ဝန်ထမ်း၏ကိုယ်ရေးမှတ်တမ်းနှင့်ပတ်သက်၍ မှန်ကန်စွာဖြည့်သွင်းရေးသားထား ပါကြောင်း စိစစ်အတည်ပြုပါသည်။", spacing: { before: 200, after: 400 } }),

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
                                            new Paragraph({ children: [new TextRun({ text: `အဆင့်/ရာထူး - ${staff.role?.role_name ?? "-"}`, size: 20 })], spacing: { before: 100 } }),
                                            new Paragraph({ children: [new TextRun({ text: `ရုံး/ဌာန - ICT`, size: 20 })], spacing: { before: 100 } }),
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
