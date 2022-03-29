import PdfPrinter from "pdfmake";

export const getPDFReadableStream = (name, bio, experiences, imageUrl) => {
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
        fit: [350, 350],
      },
      {
        text: name,
        style: "header",
      },
      {
        text: bio,
        style: "header2",
      },
      {
        text: "experiences",
        style: "header",
      },

      {
        style: "tableExample",
        table: {
          widths: [100, "*", 200, "*"],
          body: experiences,
        },
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,

        margin: [8, 8],
      },
      tableExample: {
        margin: [0, 5, 0, 15],
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
