import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

interface AxiosErrorResponse {
  code?: string;
}

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestQueue = [];

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
        const originalConfig = error.config;

        if (!isRefreshing) {
          isRefreshing = true;

          api
            .post("/refresh", { refreshToken })
            .then((response) => {
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

              failedRequestQueue.forEach((request) => request.onSuccess(token));
              failedRequestQueue = [];
            })
            .catch((err) => {
              failedRequestQueue.forEach((request) => request.onFailure(err));
              failedRequestQueue = [];
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        return new Promise((resolve, reject) => {
          failedRequestQueue.push({
            onSuccess: (token: string) => {
              originalConfig.headers["Authorization"] = `Bearer ${token}`;

              resolve(api(originalConfig));
            },
            onFailure: (err: AxiosError) => {
              reject(err);
            },
          });
        });
      } else {
        //deslogar usuario
      }
    }
  }
);
