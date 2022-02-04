import streamSaver from "streamsaver";
import fileLineIterator from "./fileLineIterator";

const ROWS_PER_FILE = 900000;

export default async function splitFile(file, onPartChange, onFinish) {
  const encoder = new TextEncoder();
  let writer = null;

  const writeLine = async (writer, line) => {
    await writer.write(encoder.encode(`${line}\n`));
  };

  const closeWriter = (writer) => writer && writer.close();

  const partFileName = (partNumber) =>
    `${file.name.split(".")[0]}_part_${partNumber}.csv`;

  let headers = null;
  let currentPart = 0;
  let currentRow = 0;

  for await (let line of fileLineIterator(file)) {
    if (!headers) {
      headers = line;
    } else {
      if (currentRow >= ROWS_PER_FILE) {
        currentRow = 0;
        closeWriter(writer);
      }

      if (currentRow === 0) {
        currentPart += 1;

        onPartChange(currentPart);

        let writableStream = streamSaver.createWriteStream(
          partFileName(currentPart)
        );
        writer = writableStream.getWriter();

        await writeLine(writer, headers);
      }

      currentRow += 1;
      await writeLine(writer, line);
    }
  }

  closeWriter(writer);
  onFinish();
}
