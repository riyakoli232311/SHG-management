import React from "react";

function Login() {
  return (
    <div style={styles.container}>
      <h2>SHG Management Login</h2>

      <input type="text" placeholder="Username" style={styles.input} />
      <input type="password" placeholder="Password" style={styles.input} />

      <button style={styles.button}>Login</button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "350px",
    margin: "100px auto",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center"
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0"
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#2f855a",
    color: "white",
    border: "none",
    borderRadius: "5px"
  }
};

export default Login;
