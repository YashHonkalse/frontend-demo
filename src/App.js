import "./App.css";
import axios from "axios";
import React, { useState, useEffect } from "react";

function App() {
  const [data, setData] = useState([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://3.84.3.212:3000/user"); // Hardcoded URL
      console.log(response.data);
      setData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const postData = async () => {
    try {
      const response = await axios.post("http://3.84.3.212:3000/user", { data: inputValue }); // Hardcoded URL
      console.log(response.data);
      fetchData(); // Fetch data again after posting
    } catch (error) {
      console.error(error);
    }
  };

  const dbinit = async () => {
    try {
      const response = await axios.post("http://3.84.3.212:3000/dbinit"); // Hardcoded URL
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const tbinit = async () => {
    try {
      const response = await axios.post("http://3.84.3.212:3000/tbinit"); // Hardcoded URL
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="App">
      <h1>User Submit Form</h1>
      <input name="input-parameter" onChange={handleChange} />
      <br />
      <br />
      <button onClick={postData}>Submit</button> <br />
      <br />
      <button style={{ backgroundColor: "red" }} onClick={dbinit}>
        DB Init
      </button>
      <br />
      <br />
      <button style={{ backgroundColor: "orange" }} onClick={tbinit}>
        Table Init
      </button>
      <br />
      <hr />
      <h2>Users List</h2>
      <center>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </center>
    </div>
  );
}

export default App;
