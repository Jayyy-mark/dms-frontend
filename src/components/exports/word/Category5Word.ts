import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx";
import { Staff } from "../../../interfaces/staff";
import { formRow, noBorder, gridCell } from "./wordExportHelpers";

export const createCategory5Doc = (staff: Staff): Document => {
    // ── Form fields list (17 points format) ──────────────────────────
    const formFields: [string, string, string][] = [
        ["၁။", "အမည်", staff.staff_name ?? "-"],
        ["၂။", "အသက်/မွေးသက္ကရာဇ်", "၃၀ နှစ် (၁၅-၀၅-၁၉၉၆)"],
        ["၃။", "လူမျိုး/ကိုးကွယ်သည့်ဘာသာ", "ဗမာ / ဗုဒ္ဓဘာသာ"],
        ["၄။", "နိုင်ငံသားစိစစ်ရေးကတ်အမှတ်", staff.staff_id ?? "-"],
        ["၅။", "ရာထူး/ဌာန", `${staff.role?.role_name ?? "-"} / ICT`],
        ["၆။", "အမှုထမ်းသက်၊ ဝင်ရောက်သည့်ရက်စွဲ", "(၃)နှစ် (၅)လ / ၀၁-၀၆-၂၀၂၀"],
        ["၇။", "လက်ရှိနေရပ်လိပ်စာ", staff.staff_address ?? "-"],
        ["၈။", "ပညာအရည်အချင်း", "B.C.Sc (Computer Science)"],
        ["၉။", "အဖအမည်", "ဦးကျော်အောင်"],
        ["၁၀။", "အလုပ်အကိုင်", "စီးပွားရေးလုပ်ငန်းရှင်"],
        ["၁၁။", "အမိအမည်", "ဒေါ်ခင်မာ"],
        ["၁၂။", "အလုပ်အကိုင်", "ဆရာမ"],
        ["၁၃။", "နိုင်ငံခြားသို့သွားရောက်ခဲ့ဖူးခြင်းရှိ-မရှိ-", "မရှိပါ- ပထမဆုံးအကြိမ်သွားရောက်ခြင်းဖြစ်ပါသည်။"],
    ];

    const createEmptyTableCols = (cols: string[]) => new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: cols.map(c => gridCell(c, true)) }),
            new TableRow({ children: cols.map(() => gridCell("-")) }),
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
                        rows: formFields.map(([num, label, val]) => formRow(num, label, val)),
                    }),

                    new Paragraph({ text: "၁၄။ ဇနီး/ခင်ပွန်း-", spacing: { before: 200, after: 100 } }),
                    createEmptyTableCols(["အမည်", "လူမျိုး/နိုင်ငံသား", "အလုပ်အကိုင်", "နေရပ်လိပ်စာ", "မှတ်ချက်"]),

                    new Paragraph({ text: "၁၅။ နိုင်ငံခြားသို့သွားရောက်မည့်ကိစ္စ-", spacing: { before: 200, after: 100 } }),
                    createEmptyTableCols(["သွားရောက်မည့်ကိစ္စ", "စေလွှတ်သည့် နိုင်ငံ", "အချိန်ကာလ (မှ - ထိ)", "နိုင်ငံခြားသို့ သွားရောက်မည့်နေ့", "မည်သည့် အထောက်အပံ့", "ပြန်ရောက်လျှင် အမှုထမ်းမည့် ဌာန/ ရာထူး"]),

                    new Paragraph({ text: "၁၆။ အထက်ပါအချက်အလက်များကို မှန်ကန်သည့်အတိုင်း ဖြည့်သွင်းရေးသားထားပါကြောင်း ကိုယ်တိုင် လက်မှတ်ရေးထိုးပါသည်။", spacing: { before: 200, after: 400 } }),

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
                                            new Paragraph({ children: [new TextRun({ text: `အလုပ်အကိုင် - ${staff.role?.role_name ?? "-"}`, size: 20 })], spacing: { before: 100 } }),
                                            new Paragraph({ children: [new TextRun({ text: `ဌာန - ICT`, size: 20 })], spacing: { before: 100 } }),
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    new Paragraph({ text: `ရက်စွဲ - ${new Date().toLocaleDateString()}`, spacing: { before: 200, after: 400 } }),

                    new Paragraph({ text: "၁၇။ နိုင်ငံခြားသို့သွားရောက်မည့်ပုဂ္ဂိုလ်၏လုပ်ရည်ကိုင်ရည်နှင့် အကျင့်စာရိတ္တကောင်းမွန်ကြောင်း ထပ်ဆင့် လက်မှတ်ရေးထိုးပါသည်။", spacing: { before: 200, after: 400 } }),

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
                                            new Paragraph({ children: [new TextRun({ text: "အမည် - ________________________", size: 20 })], spacing: { before: 100 } }),
                                            new Paragraph({ children: [new TextRun({ text: "အလုပ်အကိုင် - ________________________", size: 20 })], spacing: { before: 100 } }),
                                            new Paragraph({ children: [new TextRun({ text: "ဌာန - မြန်မာ့ရေနံနှင့်သဘာဝဓာတ်ငွေ့လုပ်ငန်း", size: 20 })], spacing: { before: 100 } }),
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    new Paragraph({ text: `ရက်စွဲ - ${new Date().toLocaleDateString()}`, spacing: { before: 200, after: 400 } }),
                ],
            },
        ],
    });
};
