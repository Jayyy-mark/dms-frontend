import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx";
import { Staff } from "../../../interfaces/staff";
import { formRow, noBorder, gridCell } from "./wordExportHelpers";

export const createCategory4Doc = (staff: Staff): Document => {
    // ── Form fields list (30 points format) ──────────────────────────
    const formFields: [string, string, string][] = [
        ["၁။", "အမည်", staff.staff_name ?? "-"],
        ["၂။", "ငယ်နာမည်", "မောင်အောင်"],
        ["၃။", "အခြားအမည် (ရှိလျှင်)", "ကိုအောင်"],
        ["၄။", "အသက်(မွေးသက္ကရာဇ်)", "( ၃၀ )နှစ် ( ၁၅-၀၅-၁၉၉၆ )"],
        ["၅။", "မွေးရာဇာတိ", "ရန်ကုန်တိုင်းဒေသကြီး၊ ရန်ကုန်မြို့"],
        ["၆။", "ကိုးကွယ်သည့်ဘာသာ", "ဗုဒ္ဓဘာသာ"],
        ["၇။", "လူမျိုး", "ဗမာ"],
        ["၈။", "အမျိုးသားမှတ်ပုံတင်အမှတ်/ နိုင်ငံသားမှတ်ပုံတင်အမှတ်/နိုင်ငံသား အဖြစ်အသိအမှတ်ပြုလက်မှတ်အမှတ်", staff.staff_id ?? "-"],
        ["၉။", "အလုပ်အကိုင်/ဌာန", `${staff.role?.role_name ?? "-"} / ICT`],
        ["၁၀။", "အမှုထမ်းသက်", "( ၃ )နှစ် ၊ ( ၅ )လ"],
        ["၁၁။", "လက်ရှိနေရပ်", staff.staff_address ?? "-"],
        ["၁၂။", "အမြဲတမ်းနေရပ်", staff.staff_address ?? "-"],
        ["၁၃။", "ပညာအရည်အချင်း", "B.C.Sc (Computer Science)"],
    ];

    const createFamilyTable2 = () => new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [gridCell("အမည်(အခြားအမည်များရှိလျှင်လည်း ဖော်ပြရန်)", true), gridCell("တော်စပ်ပုံ", true), gridCell("ကျား/မ", true), gridCell("နိုင်ငံသား", true), gridCell("အလုပ်အကိုင်", true), gridCell("နေရပ်", true), gridCell("မှတ်ချက်", true)] }),
            new TableRow({ children: [gridCell("-"), gridCell("-"), gridCell("-"), gridCell("-"), gridCell("-"), gridCell("-"), gridCell("-")] }),
        ]
    });

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
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: noBorder,
                        rows: formFields.map(([num, label, val]) => formRow(num, label, val)),
                    }),

                    new Paragraph({ text: "၁၄။ ပညာဆည်းပူးခဲ့သောသင်တန်း/တက်ခဲ့သောကျောင်း၊ကောလိပ်၊တက္ကသိုလ်၊အလုပ်ဌာနသင်တန်းစသည်များ။", spacing: { before: 200, after: 100 } }),
                    createEmptyTableCols(["မှ - ထိ", "ကျောင်း၊တက္ကသိုလ်၊အလုပ်ဌာနသင်တန်း", "တည်နေရာအရပ်", "အဆင့်အတန်း"]),

                    new Paragraph({ text: "၁၅။ ယခင်လုပ်ကိုင်ခဲ့သော အလုပ်ဌာနများ။", spacing: { before: 200, after: 100 } }),
                    createEmptyTableCols(["မှ - ထိ", "အလုပ်ဌာန", "အလုပ်အကိုင်", "မှတ်ချက်"]),

                    new Paragraph({ text: "၁၆။ နိုင်ငံခြားရောက်ဖူးခြင်းရှိ/မရှိ။ - မရှိပါ", spacing: { before: 200, after: 100 } }),
                    createEmptyTableCols(["ကာလ (မှ - ထိ)", "သွားရောက်သည့် နိုင်ငံများ", "သွားရောက်သည့် ကိစ္စ", "နိုင်ငံခြားငွေမည်မျှ ထုတ်ယူခဲ့သည်"]),

                    new Paragraph({ text: "၁၇။ နိုင်ငံခြားသို့သွားရောက်မည့် ပုဂ္ဂိုလ်၏ မိဘနှင့် မိဘ၏မောင်နှမအရင်းအချာများ။", spacing: { before: 200, after: 100 } }),
                    createFamilyTable2(),

                    new Paragraph({ text: "၁၈။ သွားရောက်မည့်ပုဂ္ဂိုလ်၏ မောင်နှမအရင်းအချာများ။", spacing: { before: 200, after: 100 } }),
                    createFamilyTable2(),

                    new Paragraph({ text: "၁၉။ ဇနီး / ခင်ပွန်းနှင့် မောင်နှမအရင်းအချာများ။", spacing: { before: 200, after: 100 } }),
                    createFamilyTable2(),

                    new Paragraph({ text: "၂၀။ ဇနီး/ ခင်ပွန်း၏ မိဘနှင့် မိဘ၏မောင်နှမအရင်းအချာများ။", spacing: { before: 200, after: 100 } }),
                    createFamilyTable2(),

                    new Paragraph({ text: "၂၁။ သား / သမီးများနှင့်၎င်းတို့၏ ဇနီး / ခင်ပွန်း ။", spacing: { before: 200, after: 100 } }),
                    createFamilyTable2(),

                    new Paragraph({ text: "၂၂။ နိုင်ငံခြားတွင်ရောက်ရှိနေကြသည့်ဆွေမျိုးများ။", spacing: { before: 200, after: 100 } }),
                    createEmptyTableCols(["အမည်", "တော်စပ်ပုံ", "အလုပ်အကိုင်", "ရောက်ရှိနေသည့်နိုင်ငံ", "သွားရောက်သည့်ကိစ္စ", "ပြန်လည်ရောက်ရှိမည့်ကာလ", "မှတ်ချက်"]),

                    new Paragraph({ text: "၂၃။ ဌာနဆိုင်ရာအရေးယူခံရခြင်းရှိ - မရှိ။", spacing: { before: 200, after: 100 } }),
                    createEmptyTableCols(["အရေးယူခံရသည့်ကာလ", "အရေးယူခံရသည့်အကြောင်း ကိစ္စ", "ချမှတ်ခံရသည့်ပြစ်ဒဏ်", "မှတ်ချက်"]),

                    new Paragraph({ text: "၂၄။ တရားရုံးတွင် တရားစွဲဆိုခံရဖူးခြင်း ရှိ - မရှိ။", spacing: { before: 200, after: 100 } }),
                    createEmptyTableCols(["တရားစွဲဆိုခံရသည့် ကာလ", "တရားစွဲဆိုခံရသည့်အကြောင်း ကိစ္စနှင့်စွဲဆိုခံရသည့်ဥပဒေပုဒ်မ", "ချမှတ်ခံရသည့် ပြစ်ဒဏ်", "မှတ်ချက်"]),

                    new Paragraph({ text: "၂၅။ ဘွဲ့ / တံဆိပ်ချီးမြှင့်ခံရခြင်းရှိ - မရှိ။", spacing: { before: 200, after: 100 } }),
                    createEmptyTableCols(["ချီးမြှင့်ခံရသည့်ကာလ", "ချီးမြှင့်ခံရသည့်ဘွဲ့/တံဆိပ်အမျိုးအစား", "မှတ်ချက်"]),

                    new Paragraph({ text: "၂၆။ နိုင်ငံခြားသို့သွားရောက်မည့်ကိစ္စ။", spacing: { before: 200, after: 100 } }),
                    createEmptyTableCols(["သင်ကြားမည့် ဘာသာရပ် / သွားရောက်မည့်ကိစ္စ", "စေလွှတ်သည့် တိုင်းပြည်", "အချိန် ကာလ", "နိုင်ငံခြား သို့ ရောက်ရှိ ရမည့်နေ့", "မည်သည့် အစိုးရ အဖွဲ့အစည်း အထောက်အပံ့", "ပြန်လည်ရောက်ရှိ လျှင်အမှုထမ်းမည့် ဌာန / တာဝန်"]),

                    new Paragraph({ text: "၂၇။ အထက်ပါအချက်အလက်များကို မှန်ကန်သည့်အတိုင်း ဖြည့်သွင်းရေးသွင်းထားပါကြောင်း ကိုယ်တိုင်လက်မှတ်ရေးထိုးပါသည်။", spacing: { before: 200, after: 400 } }),
                    new Paragraph({ text: "(ဝန်ထမ်း၏လက်မှတ်)", alignment: AlignmentType.RIGHT }),

                    new Paragraph({ text: "၂၈။ နိုင်ငံခြားသွားရောက်မည့်ပုဂ္ဂိုလ်၏ လုပ်ရည်ကိုင်ရည်နှင့်ပြည့်စုံပါသည်။", spacing: { before: 200, after: 200 } }),
                    new Paragraph({ text: "၂၉။ ကျောင်းထွက်သည်မှာ(၅)နှစ်မပြည့်သေးလျှင် နောက်ဆုံးစာမေးပွဲတွင်ရရှိသည့်အမှတ်နှင့်အဆင့် - (၅)နှစ်ပြည့်ပြီးဖြစ်ပါသည်။", spacing: { before: 200, after: 200 } }),
                    new Paragraph({ text: "၃၀။ ပဏာမရွေးဖြေစာမေးပွဲတွင် ရရှိသည့်အမှတ်နှင့်အဆင့်။", spacing: { before: 200, after: 200 } }),

                    new Paragraph({ text: "ထပ်ဆင့်လက်မှတ်ရေးထိုးပါသည်။", spacing: { before: 200, after: 400 } }),
                    
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
                                            new Paragraph({ children: [new TextRun({ text: "အမည် - ________________________", size: 20 })] }),
                                            new Paragraph({ children: [new TextRun({ text: "ရာထူး - ________________________", size: 20 })], spacing: { before: 100 } }),
                                            new Paragraph({ children: [new TextRun({ text: "ဌာန - မြန်မာ့ရေနံနှင့်သဘာဝဓာတ်ငွေ့လုပ်ငန်း", size: 20 })], spacing: { before: 100 } }),
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
