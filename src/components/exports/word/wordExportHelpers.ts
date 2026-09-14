import { TableRow, TableCell, Paragraph, TextRun, WidthType, BorderStyle } from "docx";

export const noBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

export const formRow = (num: string, label: string, value: string): TableRow =>
    new TableRow({
        children: [
            new TableCell({
                width: { size: 8, type: WidthType.PERCENTAGE },
                borders: noBorder,
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: num, size: 20 })],
                    }),
                ],
            }),
            new TableCell({
                width: { size: 47, type: WidthType.PERCENTAGE },
                borders: noBorder,
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: label, size: 20 })],
                    }),
                ],
            }),
            new TableCell({
                width: { size: 5, type: WidthType.PERCENTAGE },
                borders: noBorder,
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: "-", size: 20 })],
                    }),
                ],
            }),
            new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                borders: noBorder,
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: value || "", size: 20 })],
                    }),
                ],
            }),
        ],
    });

export const formRowNoDash = (num: string, label: string, value: string): TableRow =>
    new TableRow({
        children: [
            new TableCell({
                width: { size: 8, type: WidthType.PERCENTAGE },
                borders: noBorder,
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: num, size: 20 })],
                    }),
                ],
            }),
            new TableCell({
                width: { size: 47, type: WidthType.PERCENTAGE },
                borders: noBorder,
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: label, size: 20 })],
                    }),
                ],
            }),
            new TableCell({
                width: { size: 45, type: WidthType.PERCENTAGE },
                borders: noBorder,
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: value || "", size: 20 })],
                    }),
                ],
            }),
        ],
    });

export const gridCell = (text: string, bold: boolean = false, align: "left"|"center"|"right" = "center") => {
    return new TableCell({
        children: [
            new Paragraph({
                alignment: align === "center" ? "center" : align === "right" ? "right" : "left",
                children: [new TextRun({ text, size: 20, bold })],
            })
        ],
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        }
    });
};
