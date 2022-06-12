import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

interface AxiosErrorResponse {
  code?: string;
}

let cookies = parseCookies();

export const api = axios.create({
  baseURL: "http://localhost:3333",

  //passa como header o token em todas as requisições
  headers: {
    Authorization: `Bearer ${cookies["nextauth.token"]}`,
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<AxiosErrorResponse>) => {
    if (error.response.status === 401) {
      if (error.response.data?.code === "token.expired") {
        //renova token
        cookies = parseCookies();

        const { "nextauth.refreshToken": refreshToken } = cookies;

        api.post("/refresh", { refreshToken }).then((response) => {
          const { token } = response.data;

          setCookie(undefined, "nextauth.token", token, {
            maxAge: 60 * 60 * 24 * 30, //quanto tempo fica salvo no browser (no caso 30 dias)
            path: "/", //qualquer endereço do app tem acesso ao cookie
          });

          setCookie(
            undefined,
            "nextauth.refreshToken",
            response.data.refreshToken,
            {
              maxAge: 60 * 60 * 24 * 30,
              path: "/",
            }
          );

          api.defaults.headers["Authorization"] = `Bearer ${token}`;
        });
      } else {
        //deslogar usuario
      }
    }
  }
);
