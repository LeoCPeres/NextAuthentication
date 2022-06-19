import { useContext, useEffect } from "react";
import { Can } from "../components/Can";
import { AuthContext } from "../contexts/AuthContext";
import { useCan } from "../hooks/useCan";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const userCanSeeMetrics = useCan({ permissions: ["metrics.list"] });

  useEffect(() => {
    api
      .get("/me")
      .then((response) => console.log(response.data))
      .catch((error) => console.log(error));
  }, []);

  return (
    <>
      <h1 style={{ color: "white" }}>dashboard.</h1>
      <h2 style={{ color: "white" }}>{user?.email}</h2>

      <Can permissions={["metrics.list"]}>
        <div style={{ color: "white" }}>Métricas</div>
      </Can>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (context) => {
  const apiClient = setupAPIClient(context);
  const response = await apiClient.get("/me");

  console.log(response.data);

  return {
    props: {},
  };
});
