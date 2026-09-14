import jsPDF from "jspdf";

export const drawPdfRow = (
    doc: jsPDF, 
    y: number, 
    marginL: number, 
    pageW: number, 
    marginR: number, 
    num: string, 
    label: string, 
    value: string, 
    lineH: number = 9
) => {
    const numX = marginL;
    const labelX = marginL + 14;
    const dashX = marginL + 95;
    const valueX = marginL + 100;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.text(`${num}`, numX, y);
    // Note: jsPDF without a custom Myanmar TTF font may render Myanmar text incorrectly
    doc.text(label, labelX, y);
    if(num !== "") {
        doc.text("-", dashX, y);
    }
    doc.text(value, valueX, y);

    // Bottom row separator
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.1);
    doc.line(marginL, y + 3, pageW - marginR, y + 3);

    return y + lineH;
};
