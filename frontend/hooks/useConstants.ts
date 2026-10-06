import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "./use-toast";
import { handleGet, handleResponse } from "@/lib/utils";
import { redirect } from "next/navigation";

export function useConstants() {
  const id = Cookies.get("id");
  const BASE_URL = "http://localhost:5000";
  const [loading, setloading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // if (!id) {
    //   redirect("/auth/login");
    //   return;
    // }
    const getUser = async () => {
      const response = await handleGet(`${BASE_URL}/api/users/${id}`);
      console.log("userResponse ", response);

      if (response.status === "200") {
        setUser(response.data);
      } else {
        handleResponse(response);
      }
      setloading(false);
    };
    getUser();
  }, []);

  return { user, loading };
}
