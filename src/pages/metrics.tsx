import { Can } from "../components/Can";
import { useCan } from "../hooks/useCan";
import { setupAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  return (
    <>
      <h1 style={{ color: "white" }}>metrics.</h1>

      <Can permissions={["metrics.list"]}>
        <div style={{ color: "white" }}>Métricas</div>
      </Can>
    </>
  );
}

export const getServerSideProps = withSSRAuth(
  async (context) => {
    const apiClient = setupAPIClient(context);
    const response = await apiClient.get("/me");

    console.log(response.data);

    return {
      props: {},
    };
  },
  {
    permissions: ["metrics.list"],
    roles: ["administrator"],
  }
);
