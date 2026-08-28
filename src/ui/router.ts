import { useEffect, useReducer } from "preact/hooks";
export interface Route { name: string; pid?: string; did?: string; sid?: string; iid?: string }
export function route(): Route {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (!parts.length) return { name: "projects" };
  if (parts[0] === "how") return { name: "how" };
  if (parts[0] === "settings") return { name: "settings" };
  if (parts[0] === "p") {
    const pid = parts[1];
    if (parts[2] === "ideas") return { name: "ideas", pid };
    if (parts[2] === "d") {
      const did = parts[3];
      if (parts[4] === "s") return { name: "session", pid, did, sid: parts[5] };
      if (parts[4] === "campaign") return { name: "campaign", pid, did, iid: parts[5] };
      if (parts[4] === "summary") return { name: "summary", pid, did };
      return { name: "draft", pid, did };
    }
    return { name: "project", pid };
  }
  return { name: "projects" };
}
export const go = (path: string) => { location.hash = "#" + path; };
export function useRoute(): Route {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => { addEventListener("hashchange", force); return () => removeEventListener("hashchange", force); }, []);
  return route();
}
