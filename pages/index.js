import Head from "next/head";
import { useState } from "react";
// import axios from "axios";
// import Image from "next/image";
// import styles from '../styles/Home.module.css'

export async function getStaticProps() {
  const res = await fetch("https://api.github.com/repos/vercel/next.js");
  const json = await res.json();
  // console.log("json", json);
  return {
    props: { data: ["a", "b", "c"] },
  };
}

export default function Home() {
  const [result, setResult] = useState([]);

  async function handleClick(event) {
    event.preventDefault();
    const file = document.getElementById("inputFile");
    const formData = new FormData();
    formData.append("files", file.files[0]);

    if (!file.files[0]) {
      alert("Please select a file");
      return;
    }

    if (file.files[0].name.split(".")[1] !== "xlsx") {
      alert("Please select xlsx file");
      return;
    }
    try {
      const res = await fetch("/uploadExcel", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      setResult(json.data);
      console.log(json.data);
    } catch (error) {
      console.log(error);
    }

    // const json = await res.json();
    // setData(json);
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
          onClick={handleClick}
        >
          Submit
        </button>

        <h4 className="mt-5">Result</h4>
        {result.length !== 0 && (
          <table className="text-center my-3">
            <tr>
              <th>Input</th>
              <th>Output</th>
            </tr>
            {result.map((el, index) => (
              <tr key={index}>
                <td>{el.input}</td>
                <td>{`${el.dir}:${el.x},${el.y}`}</td>
              </tr>
            ))}
          </table>
        )}
      </main>
    </div>
  );
}
