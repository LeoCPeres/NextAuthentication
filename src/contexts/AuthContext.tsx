import { createContext, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { setCookie, parseCookies } from "nookies";
import { api } from "../services/api";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

interface SignInCredentialsProps {
  email: string;
  password: string;
}

type AuthContextData = {
  signIn(credentials: SignInCredentialsProps): Promise<void>;
  isAuthenticated: boolean;
  user: User;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user; //se user for vazio retorna false

  useEffect(() => {
    const { "nextauth.token": token } = parseCookies();

    if (token) {
      api.get("/me").then((response) => {
        const { email, roles, permissions } = response.data;
        setUser({ email, roles, permissions });
      });
    }
  }, []);

  const router = useRouter();

  async function signIn({ email, password }: SignInCredentialsProps) {
    try {
      const response = await api.post("sessions", { email, password });

      const { token, refreshToken, permissions, roles } = response.data;

      //sempre que estiver tentando lidar com cookies (destruir, editar ou criar) do lado do browser
      //o primeiro parâmetro deve ser undefined

      setCookie(undefined, "nextauth.token", token, {
        maxAge: 60 * 60 * 24 * 30, //quanto tempo fica salvo no browser (no caso 30 dias)
        path: "/", //qualquer endereço do app tem acesso ao cookie
      });

      setCookie(undefined, "nextauth.refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      setUser({ email, permissions, roles });

      //atualiza header com token para usuário conseguir fazer as requisições
      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      router.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
