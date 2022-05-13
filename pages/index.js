import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState([]);

  async function handleUploadFile(event) {
    event.preventDefault();
    const file = document.getElementById("inputFile");
    const formData = new FormData();
    formData.append("files", file.files[0]);

    if (!file.files[0]) {
      alert("Please select a file");

      // clear input file
      file.value = "";
      return;
    }

    if (file.files[0].name.split(".")[1] !== "xlsx") {
      alert("Please select xlsx file");

      // clear input file
      file.value = "";
      return;
    }
    try {
      const res = await fetch("/uploadExcel", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      setResult(json.data);

      // clear input file
      file.value = "";
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container">
        <nav className="navbar bg-white ">
          <h1>explore planet</h1>
        </nav>
        <hr />
        <h4 className="text-success mb-3">Input excel file</h4>
        <input id="inputFile" type="file" accept=".xlsx" />
        <button
          className="btn btn-outline-primary"
          type="button"
          onClick={handleUploadFile}
        >
          Submit
        </button>

        <h4 className="mt-5">Result</h4>
        {result.length !== 0 && (
          <table className="text-center my-3">
            <thead>
              <tr>
                <th>Input</th>
                <th>Output</th>
              </tr>
            </thead>
            <tbody>
              {result.map((el, index) => (
                <tr key={index}>
                  <td>{el.input}</td>
                  <td>{`${el.dir}:${el.x},${el.y}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
