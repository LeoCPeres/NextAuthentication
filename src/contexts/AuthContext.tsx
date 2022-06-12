import { createContext, ReactNode, useState } from "react";
import { api } from "../services/api";
import { useRouter } from "next/router";

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

  const router = useRouter();

  async function signIn({ email, password }: SignInCredentialsProps) {
    try {
      const response = await api.post("sessions", { email, password });

      const { token, refreshToken, permissions, roles } = response.data;

      setUser({ email, permissions, roles });
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
