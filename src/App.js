import "./App.css";
import React, { useState, useCallback, useRef } from "react";
import { Container, Jumbotron, Button } from "reactstrap";
import streamSaver from "streamsaver";
const NO_FILE = "No File Chosen";
const ROWS_PER_FILE = 800000;

async function splitFile(file, onFinish) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  let reader = file.stream().getReader();

  let headers = null;
  let currentPart = 0;
  let currentRow = 0;
  let writer = null;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      onFinish(false);

      if (writer) {
        writer.close();
      }

      break;
    }

    let rows = decoder.decode(value).split("\n");

    if (!headers) {
      headers = rows.shift();
    }

    for (let i = 0; i < rows.length; i++) {
      if (currentRow >= ROWS_PER_FILE) {
        currentRow = 0;
        writer.close();
      }

      if (currentRow === 0) {
        currentPart += 1;
        let fileStream = streamSaver.createWriteStream(
          `${file.name.split(".")[0]}_part_${currentPart}.csv`
        );
        writer = fileStream.getWriter();
        await writer.write(encoder.encode(`${headers}\n`));
      }

      await writer.write(encoder.encode(`${rows[i]}\n`));
      currentRow += 1;
    }
  }
}

function App() {
  const fileInput = useRef();

  const [fileName, setFileName] = useState(NO_FILE);
  const [isProcessing, setIsProcessing] = useState(false);

  const onChooseFileClick = useCallback(() => {
    fileInput.current.click();
  }, []);

  const updateFileName = useCallback((e) => {
    setFileName(e.target.files[0]?.name || NO_FILE);
  }, []);

  const startProcessing = useCallback(() => {
    setIsProcessing(true);
    splitFile(fileInput.current.files[0], () => {
      setIsProcessing(false);
    });
  }, []);

  return (
    <Container className="mt-5">
      <Jumbotron>
        <h1 className="display-3">CSV Splitter</h1>
        <p className="lead">
          Split big .csv file into smaller parts for Excel.
        </p>
        <hr className="mb-4" />
        <div className="form">
          <p className="lead">
            <input
              type="file"
              ref={fileInput}
              accept=".csv"
              hidden
              onChange={updateFileName}
            />
            <Button
              color="primary"
              onClick={onChooseFileClick}
              className="me-2"
              disabled={isProcessing}
            >
              Choose File
            </Button>
            {fileName}
          </p>
          <p className="lead">
            <Button
              color="success"
              className="me-2"
              onClick={startProcessing}
              disabled={fileName === NO_FILE || isProcessing}
            >
              Split File
            </Button>
          </p>
        </div>
      </Jumbotron>
    </Container>
  );
}

export default App;
