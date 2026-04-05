"use client";

import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export function AxiosProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem("token");
          localStorage.removeItem("sessionId");
          router.push("/signin");
          return new Promise(() => {}); 
        }
        return Promise.reject(error);
      }
    );

    
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [router]);

  return <>{children}</>;
}
