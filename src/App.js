import "./App.css";
import React, { useState, useCallback, useRef } from "react";
import { Container, Jumbotron, Button, Alert } from "reactstrap";
import streamSaver from "streamsaver";

const NO_FILE = "No File Chosen";
const ROWS_PER_FILE = 900000;

async function splitFile(file, onPartChange, onFinish) {
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
      onFinish();

      if (writer) {
        writer.close();
      }

      break;
    }

    let textChunk = decoder.decode(value);
    let isChunkEndsWithNewLine = textChunk.slice(-1) === "\n";

    let rows = textChunk.split("\n");

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

        onPartChange(currentPart);

        let fileStream = streamSaver.createWriteStream(
          `${file.name
            .split(".")
            .slice(0, -1)
            .join(".")}_part_${currentPart}.csv`
        );
        
        writer = fileStream.getWriter();
        await writer.write(encoder.encode(`${headers}\n`));
      }

      if (i === rows.length - 1 && !isChunkEndsWithNewLine) {
        await writer.write(encoder.encode(`${rows[i]}`));
      } else {
        await writer.write(encoder.encode(`${rows[i]}\n`));
      }

      currentRow += 1;
    }
  }
}

function App() {
  const fileInput = useRef();

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPart, setCurrentPart] = useState(null);
  const [file, setFile] = useState(null);

  const onChooseFileClick = useCallback(() => {
    fileInput.current.click();
  }, []);

  const onFileChange = useCallback(
    (e) => {
      setFile(e.target.files[0]);
    },
    [setFile]
  );

  const startProcessing = useCallback(() => {
    setIsProcessing(true);
    splitFile(file, setCurrentPart, () => setIsProcessing(false));
  }, [file, setCurrentPart]);

  return (
    <Container className="mt-5">
      <Jumbotron>
        <h1 className="display-3">CSV Splitter for Excel</h1>
        <p className="lead mb-0">
          Excel has a limit of a maximum 1 million rows per file.
        </p>
        <p className="lead">
          This website will split your huge .CSV file into smaller files that
          Excel can handle.
        </p>
        <p className="lead">
          <b>
            Please, allow pop-up's since you will be asked to download multiple
            files.
          </b>
        </p>
        <hr className="mb-4" />
        {!isProcessing && (
          <div>
            <p className="lead">
              <input
                type="file"
                ref={fileInput}
                accept=".csv"
                hidden
                onChange={onFileChange}
              />
              <Button
                color="primary"
                onClick={onChooseFileClick}
                className="me-2"
              >
                Choose File
              </Button>
              {file?.name || NO_FILE}
            </p>
            <p className="lead">
              <Button
                color="success"
                className="me-2"
                onClick={startProcessing}
                disabled={!file}
              >
                Split File
              </Button>
            </p>
          </div>
        )}
        {isProcessing && (
          <Alert color="primary">
            Downloading part {currentPart}. Please, don't close this tab.
          </Alert>
        )}
      </Jumbotron>
    </Container>
  );
}

export default App;
