import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx";
import { Staff } from "../../../interfaces/staff";
import { formRow, noBorder, gridCell } from "./wordExportHelpers";

export const createCategory1Doc = (staff: Staff): Document => {
    // ── Form fields list Part 1 (Points 1 to 42) ──────────────────────────
    const formFields: [string, string, string][] = [
        ["၁။", "အမည်", staff.staff_name ?? "မောင်မောင်အောင်"],
        ["၂။", "ငယ်အမည်", "မောင်အောင်"],
        ["၃။", "အခြားအမည်", "ကိုအောင်"],
        ["၄။", "အသက် (မွေးသက္ကရာဇ်)", "၃၀ နှစ် (၁၅-၀၅-၁၉၉၆)"],
        ["၅။", "လူမျိုးနှင့်ကိုးကွယ်သည့်ဘာသာ", "ဗမာ / ဗုဒ္ဓဘာသာ"],
        ["၆။", "အရပ်အမြင့်", "၅ ပေ ၈ လက်မ"],
        ["၇။", "ဆံပင်အရောင်", "အနက်ရောင်"],
        ["၈။", "မျက်စိအရောင်", "အညိုရောင်"],
        ["၉။", "ထင်ရှားသည့်အမှတ်အသား", "ညာဘက်လက်မောင်းတွင် မှဲ့ရှိ"],
        ["၁၀။", "အသားအရောင်", "ညိုဖျော့ရောင်"],
        ["၁၁။", "ကိုယ်အလေးချိန်", "၆၈ ကီလိုဂရမ်"],
        ["၁၂။", "မွေးဖွားရာဇာတိ", "ရန်ကုန်တိုင်းဒေသကြီး၊ ရန်ကုန်မြို့"],
        ["၁၃။", "နိုင်ငံသားစိစစ်ရေးကတ်ပြားအမှတ်", "၁၂/ကမန(နိုင်)၁၂၃၄၅၆"],
        ["၁၄။", "ယခုနေရပ်လိပ်စာအပြည့်အစုံ", staff.staff_address ?? "အမှတ်(၁၂၃)၊ မြောက်ဒဂုံမြို့နယ်၊ ရန်ကုန်မြို့"],
        ["၁၅။", "အမြဲတမ်းနေရပ်လိပ်စာအပြည့်အစုံ", "အမှတ်(၄၅၆)၊ တောင်ဥက္ကလာပမြို့နယ်၊ ရန်ကုန်မြို့"],
        ["၁၆။", "ယခင်နေဖူးသောဒေသနှင့်နေရပ်လိပ်စာများ", "မန္တလေးတိုင်းဒေသကြီး၊ မန္တလေးမြို့"],
        ["", "အပြည့်အစုံ (တပ်မတော်သားဖြစ်က တပ်လိပ်စာဖော်ပြရန်မလိုပါ)", "အမှတ်(၇၈၉)၊ ချမ်းအေးသာဇံမြို့နယ်၊ မန္တလေးမြို့"],
        ["၁၇။", "တပ်မတော်သို့ဝင်ခဲ့ဖူးလျှင်/ တပ်မတော်သားဖြစ်လျှင်", "မဝင်ရောက်ဖူးပါ"],
        ["", "(က) ကိုယ်ပိုင်အမှတ်", "မရှိပါ"],
        ["", "(ခ) တပ်သို့ဝင်သည့်နေ့", "မရှိပါ"],
        ["", "(ဂ) ဗိုလ်လောင်းသင်တန်းအမှတ်စဉ်", "မရှိပါ"],
        ["", "(ဃ) ပြန်တမ်းဝင်ဖြစ်သည့်နေ့", "မရှိပါ"],
        ["", "(င) တပ်ထွက်သည့်နေ့", "မရှိပါ"],
        ["", "(စ) ထွက်သည့်အကြောင်း", "မရှိပါ"],
        ["", "(ဆ) အမှုထမ်းဆောင်ခဲ့သောတပ်များ", "မရှိပါ"],
        ["", "(ဇ) တပ်တွင်းရာဇဝင်အကျဉ်း/ပြစ်မှု", "မရှိပါ"],
        ["", "(ဈ) အငြိမ်းစားလစာ", "မရှိပါ"],
        ["၁၈။", "ပညာအရည်အချင်း", "B.C.Sc (Computer Science)"],
        ["၁၉။", "အဘအမည်၊ လူမျိုး၊ ကိုးကွယ်သည့်ဘာသာ၊ ဇာတိနှင့်အလုပ်အကိုင်", "ဦးကျော်အောင်၊ ဗမာ၊ ဗုဒ္ဓဘာသာ၊ ရန်ကုန်၊ စီးပွားရေးလုပ်ငန်းရှင်"],
        ["၂၀။", "၎င်း၏နေရပ်လိပ်စာအပြည့်အစုံ", "အမှတ်(၁၂)၊ မြောက်ဒဂုံမြို့နယ်၊ ရန်ကုန်မြို့"],
        ["၂၁။", "အမိအမည်၊ လူမျိုး၊ ကိုးကွယ်သည့်ဘာသာ၊ ဇာတိနှင့်အလုပ်အကိုင်", "ဒေါ်ခင်မာ၊ ဗမာ၊ ဗုဒ္ဓဘာသာ၊ ရန်ကုန်၊ ဆရာမ"],
        ["၂၂။", "၎င်း၏နေရပ်လိပ်စာအပြည့်အစုံ", "အမှတ်(၁၂)၊ မြောက်ဒဂုံမြို့နယ်၊ ရန်ကုန်မြို့"],
        ["၂၃။", "ကာယကံရှင်မွေးဖွားချိန်၌ မိဘနှစ်ပါးသည် နိုင်ငံသားဟုတ်/မဟုတ်", "နိုင်ငံသားဖြစ်ပါသည်"],
        ["၂၄။", "လက်ရှိအလုပ်အကိုင်နှင့်အဆင့်", "Software Engineer / Junior Developer"],
        ["၂၅။", "လက်ရှိရာထူးရသည့်နေ့", "၀၁-၀၆-၂၀၂၄"],
        ["၂၆။", "လက်ရှိအလုပ်အကိုင်ရလာပုံ", "ဝန်ထမ်းအဖြစ် တာဝန်ထမ်းဆောင်ခြင်း"],
        ["၂၇။", "ပြိုင်အရွေးခံ (သို့) တိုက်ရိုက်ခန့်", "တိုက်ရိုက်ခန့်"],
        ["၂၈။", "လစာဝင်ငွေ", "၅၀၀,၀၀၀ ကျပ်"],
        ["၂၉။", "ဌာန၊ နေရာ", "ICT ဌာန၊ ရန်ကုန်"],
    ];

    // Grid tables
    const table30 = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [gridCell("စဉ်", true), gridCell("ချီးမြှင့်ခံရသည့်ကာလ", true), gridCell("ချီးမြှင့်သည့်ဘွဲ့/တံဆိပ်အမျိုးအစား", true), gridCell("ဆုတံဆိပ်အမှတ် အမိန့်စာနှင့်ရရှိသည့်ရက်စွဲ", true)] }),
            new TableRow({ children: [gridCell("၁"), gridCell("၂၀၂၅"), gridCell("Certificate of Achievement"), gridCell("-")] }),
            new TableRow({ children: [gridCell(""), gridCell(""), gridCell(""), gridCell("")] }),
        ]
    });

    const table31 = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [gridCell("စဉ်", true), gridCell("ကာလ (နေ့ရက်မှ - နေ့ရက်အထိ)", true), gridCell("သင်တန်းအကြောင်းအရာ", true), gridCell("တည်နေရာ", true), gridCell("အဆင့်", true)] }),
            new TableRow({ children: [gridCell("၁"), gridCell("၀၁-၀၁-၂၀၂၄ - ၃၁-၀၁-၂၀၂၄"), gridCell("Basic Training"), gridCell("Yangon"), gridCell("A")] }),
            new TableRow({ children: [gridCell(""), gridCell(""), gridCell(""), gridCell(""), gridCell("")] }),
        ]
    });

    const table33 = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [gridCell("စဉ်", true), gridCell("အဆင့်", true), gridCell("တပ်/ဌာန", true), gridCell("နေရာ", true)] }),
            new TableRow({ children: [gridCell("၁"), gridCell("Junior"), gridCell("ICT"), gridCell("Yangon")] }),
            new TableRow({ children: [gridCell(""), gridCell(""), gridCell(""), gridCell("")] }),
        ]
    });

    // Family grid tables
    const createFamilyTable = () => new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [gridCell("စဉ်", true), gridCell("အမည်", true), gridCell("လူမျိုး/ဘာသာ", true), gridCell("ဇာတိ", true), gridCell("အလုပ်အကိုင်", true), gridCell("နေရပ်လိပ်စာ", true)] }),
            new TableRow({ children: [gridCell("၁"), gridCell("-"), gridCell("-"), gridCell("-"), gridCell("-"), gridCell("-")] }),
            new TableRow({ children: [gridCell(""), gridCell(""), gridCell(""), gridCell(""), gridCell(""), gridCell("")] }),
        ]
    });

    // ── Part 2 (Childhood to present) ─────────────────────────────────────────
    const part2Fields: [string, string, string][] = [
        ["၁။", "နေခဲ့ဖူးသောကျောင်းများ (ခုနှစ်၊ သက္ကရာဇ်ဖော်ပြရန်)", "အ.ထ.က(၁) ဒဂုံ (၂၀၀၀-၂၀၁၂)"],
        ["၂။", "နောက်ဆုံးအောင်မြင်ခဲ့သည့်ကျောင်း/အတန်း၊ ခုံအမှတ်၊ ဘာသာရပ်အထိအကျဖော်ပြရန်", "တက္ကသိုလ်ဝင်တန်း၊ ခုံအမှတ် - ၁၂၃၄"],
        ["၃။", "ကျောင်းသားဘဝတွင် နိုင်ငံရေး/မြို့ရေး/ရွာရေး ဆောင်ရွက်မှုများနှင့် အဆင့်အတန်း၊ တာဝန်", "မရှိပါ"],
        ["၄။", "ဝါသနာပါပြီး၊ လေ့လာလိုက်စားခဲ့သော ကျန်းမာရေး ကစားခုန်စားမှုများ၊ အနုပညာဆိုင်ရာအတီးအမှုတ်များ၊ ပညာရေး၊ စက်မှုလက်မှု", "ဘောလုံးကစားခြင်း၊ ဂစ်တာတီးခြင်း"],
        ["၅။", "လုပ်ကိုင်ခဲ့သော အလုပ်အကိုင်များနှင့် ဌာန/မြို့နယ်", "System Admin, ရန်ကုန်"],
        ["၆။", "တောခိုခဲ့ဖူးလျှင် (သို့) သောင်းကျန်းသူများကြီးစိုးသော နယ်မြေတွင်နေခဲ့ဖူးလျှင် လုပ်ကိုင်ဆောင်ရွက်ချက်များ ကိုဖော်ပြပါ", "မရှိပါ"],
        ["၇။", "အလုပ်အကိုင်ပြောင်းရွှေ့ခဲ့သော အကြောင်းအကျိုးနှင့် လစာ", "ရာထူးတိုးမြှင့်ခြင်း၊ လစာ - ၅၀၀,၀၀၀"],
        ["၈။", "အမှုထမ်းနေစဉ် (သို့) ကိုယ်ပိုင်အလုပ်အကိုင်ဆောင်ရွက် နေစဉ် နိုင်ငံရေး၊ မြို့/ရွာရေးဆောင်ရွက်မှုများ၊ ဆောင်ရွက် နေစဉ်အဆင့်အတန်းနှင့်တာဝန်", "မရှိပါ"],
        ["၉။", "စစ်ဘက်/ နယ်ဘက်/ ရဲဘက်နှင့် နိုင်ငံရေးဘက်တွင် ခင်မင်ရင်းနှီးသော မိတ်ဆွေများ ရှိ မရှိ", "မရှိပါ"],
    ];

    const tablePart2_10 = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({ children: [gridCell("စဉ်", true), gridCell("သွားရောက်ခဲ့သည့်နိုင်ငံ", true), gridCell("သွားရောက်ခဲ့သည့်အကြောင်း", true), gridCell("တွေ့ဆုံခဲ့သည့်ကုမ္ပဏီ/လူပုဂ္ဂိုလ်ဌာန", true), gridCell("သွား/ပြန်သည့်နေ့", true)] }),
            new TableRow({ children: [gridCell("၁"), gridCell("စင်ကာပူ"), gridCell("လေ့လာရေး"), gridCell("-"), gridCell("၀၁-၀၁-၂၀၂၀ / ၁၀-၀၁-၂၀၂၀")] }),
        ]
    });

    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    // Title
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 120 },
                        children: [new TextRun({ text: "ပုံစံ (၁)", size: 24 })],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 120 },
                        children: [new TextRun({ text: "ကိုယ်ရေးမှတ်တမ်း", bold: true, size: 28 })],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                        children: [new TextRun({ text: "[နည်းဥပဒေ ၂၄ (ခ)]", size: 22 })],
                    }),

                    // ── Main form table ───────────────────────────────────────
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: noBorder,
                        rows: formFields.map(([num, label, val]) => formRow(num, label, val)),
                    }),

                    new Paragraph({ text: "၃၀။ ချီးမြှင့်ခံရသည့် ဘွဲ့ထူး၊ ဂုဏ်ထူး တံဆိပ်လက်မှတ်များ", spacing: { before: 200, after: 100 } }),
                    table30,

                    new Paragraph({ text: "၃၁။ တက်ရောက်ခဲ့သည့်သင်တန်းများ", spacing: { before: 200, after: 100 } }),
                    table31,

                    new Paragraph({ text: "၃၂။ အလုပ်အကိုင်အတွက် ထောက်ခံသူများ: (မရှိပါ)", spacing: { before: 200, after: 100 } }),

                    new Paragraph({ text: "၃၃။ ယခင်လုပ်ကိုင်ဖူးသည့်အလုပ်အကိုင်", spacing: { before: 200, after: 100 } }),
                    table33,

                    new Paragraph({ text: "၃၄။ ညီအစ်ကိုမောင်နှမများ", spacing: { before: 200, after: 100 } }),
                    createFamilyTable(),
                    
                    new Paragraph({ text: "၃၅။ အဘ၏ညီအစ်ကိုမောင်နှမများ", spacing: { before: 200, after: 100 } }),
                    createFamilyTable(),

                    new Paragraph({ text: "၃၆။ အမိ၏ညီအစ်ကိုမောင်နှမများ", spacing: { before: 200, after: 100 } }),
                    createFamilyTable(),

                    new Paragraph({ text: "၃၇။ ခင်ပွန်း/ဇနီးသည်", spacing: { before: 200, after: 100 } }),
                    createFamilyTable(),

                    new Paragraph({ text: "၃၈။ သားသမီးများ", spacing: { before: 200, after: 100 } }),
                    createFamilyTable(),

                    new Paragraph({ text: "၃၉။ ခင်ပွန်း/ဇနီးသည်၏ညီအစ်ကိုမောင်နှမများ", spacing: { before: 200, after: 100 } }),
                    createFamilyTable(),

                    new Paragraph({ text: "၄၀။ ခင်ပွန်း/ဇနီးသည် အဘနှင့်ညီအစ်ကိုမောင်နှမများ", spacing: { before: 200, after: 100 } }),
                    createFamilyTable(),

                    new Paragraph({ text: "၄၁။ ခင်ပွန်း/ဇနီးသည် အမိနှင့်ညီအစ်ကိုမောင်နှမများ", spacing: { before: 200, after: 100 } }),
                    createFamilyTable(),

                    new Paragraph({ text: "၄၂။ မိမိနှင့် မိမိ၏ဇနီး သို့မဟုတ် ခင်ပွန်းတို့၏ မိဘ၊ ညီအစ်ကိုမောင်နှမများ၊ သားသမီးများသည် နိုင်ငံရေးပါတီများတွင် ဝင်ရောက်ဆောင်ရွက်မှု ရှိ မရှိ (ရှိကအသေးစိတ်ဖော်ပြရန်)", spacing: { before: 200, after: 100 } }),
                    new Paragraph({ text: "မရှိပါ", indent: { left: 720 }, spacing: { after: 400 } }),

                    // Part 2 title
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 400 },
                        children: [new TextRun({ text: "ငယ်စဉ်မှယခုအချိန်ထိ ကိုယ်ရေးရာဇဝင်", bold: true, size: 28 })],
                    }),

                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: noBorder,
                        rows: part2Fields.map(([num, label, val]) => formRow(num, label, val)),
                    }),

                    new Paragraph({ text: "၁၀။ နိုင်ငံခြားသို့ သွားရောက်ခဲ့ဖူးလျှင်", spacing: { before: 200, after: 100 } }),
                    tablePart2_10,

                    new Paragraph({ text: "၁၁။ မိမိနှင့်ခင်မင်ရင်းနှီးသော နိုင်ငံခြားသား ရှိ မရှိ၊ ရှိက မည်သည့်အလုပ်အကိုင်၊ လူမျိုး၊ တိုင်းပြည်၊ မည်ကဲ့သို့ ရင်းနှီးသည်", spacing: { before: 200, after: 100 } }),
                    new Paragraph({ text: "မရှိပါ", indent: { left: 720 }, spacing: { after: 100 } }),

                    new Paragraph({ text: "၁၂။ မိမိအားထောက်ခံသည့်ပုဂ္ဂိုလ်", spacing: { before: 200, after: 100 } }),
                    new Paragraph({ text: "-", indent: { left: 720 }, spacing: { after: 100 } }),

                    new Paragraph({ text: "၁၃။ ရာဇဝတ်ပြစ်မှုခံရခြင်း ရှိ/မရှိ", spacing: { before: 200, after: 100 } }),
                    new Paragraph({ text: "မရှိပါ", indent: { left: 720 }, spacing: { after: 400 } }),

                    new Paragraph({ text: "အထက်ပါဇယားကွက်များအတွင်း ဖြည့်စွက်ရေးသွင်းထားသော အကြောင်းအရာများအား မှန်ကန်ကြောင်း တာဝန်ခံလက်မှတ်ရေးထိုးပါသည်။", spacing: { before: 200, after: 400 } }),

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
                                            new Paragraph({ children: [new TextRun({ text: `ကိုယ်ပိုင်အမှတ် - ${staff.staff_id}`, size: 20 })], spacing: { before: 100 } }),
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

    return doc;
};
