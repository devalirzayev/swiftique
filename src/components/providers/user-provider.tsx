"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getUserId } from "@/lib/user";

const UserContext = createContext<string>("");

export function useUserId() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState("");

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  return <UserContext value={userId}>{children}</UserContext>;
}
