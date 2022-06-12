import axios from "axios";
import { parseCookies } from "nookies";

const cookies = parseCookies();

export const api = axios.create({
  baseURL: "http://localhost:3333",

  //passa como header o token em todas as requisições
  headers: {
    Authorization: `Bearer ${cookies["nextauth.token"]}`,
  },
});
