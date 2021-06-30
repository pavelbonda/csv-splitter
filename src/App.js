import "./App.css";
import React, { useState, useCallback, useRef } from "react";
import { Container, Jumbotron, Button } from "reactstrap";

function App() {
  const NO_FILE = "No File Chosen";

  const fileInput = useRef();

  const onChooseFileClick = useCallback(() => {
    fileInput.current.click();
  }, []);

  const [fileName, setFileName] = useState(NO_FILE);

  const updateFileName = useCallback((e) => {
    setFileName(e.target.files[0]?.name || NO_FILE);
  }, []);

  const splitFile = useCallback(() => {
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      let lines = e.target.result.split("\n")
      let headers = lines.shift()
      console.log(headers)
      console.log(lines)
    };
    fileReader.onerror = () => {
      alert("Error while reading file.");
    };
    fileReader.readAsText(fileInput.current.files[0]);
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
            >
              Choose File
            </Button>
            {fileName}
          </p>
          <p className="lead">
            <Button
              color="success"
              className="me-2"
              onClick={splitFile}
              disabled={fileName === NO_FILE}
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
