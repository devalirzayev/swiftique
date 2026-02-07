"use client";

import { useState, useEffect } from "react";
import { ProjectPending } from "./project-pending";

const PROJECT_KEY = "swiftique_current_project";

export function ProjectContentGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "pending" | "ready">("loading");

  useEffect(() => {
    const projectId = localStorage.getItem(PROJECT_KEY);
    if (!projectId) {
      setStatus("ready");
      return;
    }

    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => {
        setStatus(data.status === "pending" ? "pending" : "ready");
      })
      .catch(() => setStatus("ready"));
  }, []);

  useEffect(() => {
    if (status !== "pending") return;

    const projectId = localStorage.getItem(PROJECT_KEY);
    if (!projectId) return;

    const interval = setInterval(() => {
      fetch(`/api/projects/${projectId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.status !== "pending") {
            setStatus("ready");
            clearInterval(interval);
            window.location.reload();
          }
        })
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, [status]);

  if (status === "pending") return <ProjectPending />;
  return <>{children}</>;
}
