import "./App.css";
import { useState, useCallback, useRef, useEffect } from "react";
import { Container, Button, Alert } from "reactstrap";
import splitFile from "./utils/splitFile";

function App() {
  const fileInput = useRef();

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPart, setCurrentPart] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    window.onbeforeunload = (e) => {
      if (isProcessing) {
        e.returnValue = `Are you sure you want to leave?`;
      }
    };
  }, [isProcessing]);

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
                accept=".csv,.gz"
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
              {file?.name || "No File Chosen"}
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
    </Container>
  );
}

export default App;
