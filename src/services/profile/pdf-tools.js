import PdfPrinter from "pdfmake";

export const getPDFReadableStream = (name, bio, imageUrl) => {
  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
    },
  };

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [
      {
        image: imageUrl,
        fit: [520, 520],
      },
      {
        text: name,
        style: "header",
      },
      {
        text: bio,
        style: "header2",
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [8, 8],
      },
    },
    defaultStyle: {
      font: "Helvetica",
    },
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {});
  pdfReadableStream.end();

  return pdfReadableStream;
};
