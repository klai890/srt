const headerObj = {
  repeatCell: {
    range: {
      sheetId: 0,
      startRowIndex: 0,
      endRowIndex: 1,
      endColumnIndex: 9,
      startColumnIndex: 0,
    },
    cell: {
      userEnteredFormat: {
        horizontalAlignment: "CENTER",
        backgroundColorStyle: {
          rgbColor: {
            red: 0.257,
            green: 0.257,
            blue: 0.257,
          },
        },
        textFormat: {
          foregroundColor: {
            blue: 1,
            green: 1,
            red: 1,
          },
          bold: true,
        },
      },
    },
    fields:
      "userEnteredFormat(backgroundColorStyle,horizontalAlignment,textFormat)",
  },
};

const bodyReq = {
  repeatCell: {
    range: {
      sheetId: 0,
      startRowIndex: 1,
      endRowIndex: 61,
      endColumnIndex: 8,
      startColumnIndex: 1,
    },
    cell: {
      userEnteredFormat: {
        horizontalAlignment: "CENTER",
        backgroundColorStyle: {
          rgbColor: {
            red: 0.95,
            green: 0.95,
            blue: 0.95,
          },
        },
        textFormat: {
          foregroundColor: {
            blue: 0,
            green: 0,
            red: 0,
          },
        },
      },
    },
    fields:
      "userEnteredFormat(backgroundColorStyle,horizontalAlignment,textFormat)",
  },
};

const rightReq = {
  repeatCell: {
    range: {
      sheetId: 0,
      startRowIndex: 1,
      endRowIndex: 61,
      endColumnIndex: 9,
      startColumnIndex: 8,
    },
    cell: {
      userEnteredFormat: {
        horizontalAlignment: "CENTER",
        backgroundColorStyle: {
          rgbColor: {
            red: 0.988,
            green: 0.3,
            blue: 0.01,
          },
        },
        textFormat: {
          foregroundColor: {
            blue: 1,
            green: 1,
            red: 1,
          },
          bold: true,
        },
      },
    },
    fields:
      "userEnteredFormat(backgroundColorStyle,horizontalAlignment,textFormat)",
  },
};

const leftReq = {
  repeatCell: {
    range: {
      sheetId: 0,
      startRowIndex: 1,
      endRowIndex: 62,
      endColumnIndex: 1,
      startColumnIndex: 0,
    },
    cell: {
      userEnteredFormat: {
        horizontalAlignment: "CENTER",
        backgroundColorStyle: {
          rgbColor: {
            red: 0.988,
            green: 0.3,
            blue: 0.01,
          },
        },
        textFormat: {
          foregroundColor: {
            blue: 1,
            green: 1,
            red: 1,
          },
          bold: true,
        },
      },
    },
    fields:
      "userEnteredFormat(backgroundColorStyle,horizontalAlignment,textFormat)",
  },
};

export const formatRequests = [headerObj, bodyReq, rightReq, leftReq];
