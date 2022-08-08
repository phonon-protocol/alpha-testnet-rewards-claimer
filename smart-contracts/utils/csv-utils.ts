import csv from "csv-parser";
import fs from "fs";

export const csvToArray = <T>(filePath: string): Promise<T[]> => {
  const rows: T[] = [];
  return new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", function (row: any) {
        rows.push(row);
      })
      .on("end", function () {
        resolve(rows);
      });
  });
};

export const arrayToCsv = (filePath: string, data: any[]): Promise<void> => {
  return new Promise((resolve) => {
    fs.writeFile(filePath, data.join("\n"), () => {
      resolve();
    });
  });
};

export const arrayToCsVUsingPropertiesAsHeadings = (
  filePath: string,
  data: any[]
): Promise<void> => {
  const headings = Object.keys(data[0]);

  return arrayToCsv(filePath, [
    headings.join(","),
    ...data.map((result) => Object.values(result).join(",")),
  ]);
};
