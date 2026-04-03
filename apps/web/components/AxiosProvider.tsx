"use client";

import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export function AxiosProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Add a global response interceptor
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Token expired or invalid
          localStorage.removeItem("token");
          localStorage.removeItem("sessionId");
          
          // Redirect the user seamlessly without triggering any error toasts or crashes in the UI
          router.push("/signin");
          
          // Return a promise that never resolves, so the component's catch block doesn't execute
          return new Promise(() => {}); 
        }
        return Promise.reject(error);
      }
    );

    // Cleanup the interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [router]);

  return <>{children}</>;
}
