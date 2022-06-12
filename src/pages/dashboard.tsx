import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <h1 style={{ color: "white" }}>dashboard.</h1>
      <h2 style={{ color: "white" }}>{user?.email}</h2>
    </>
  );
}
