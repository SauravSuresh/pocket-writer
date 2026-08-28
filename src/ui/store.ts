import { useEffect, useReducer } from "preact/hooks";
import { Account, emptyAccount } from "../domain/types";
import { loadAccount, saveAccount, requestPersistence } from "../storage/db";
import { installSample } from "../domain/sample";

let acc: Account = emptyAccount();
let ready = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export const store = {
  get acc() { return acc; },
  get ready() { return ready; },
  async init() { acc = await loadAccount(); if (!acc.projects.length) { installSample(acc); await saveAccount(acc); } ready = true; emit(); },
  update(fn: (a: Account) => void) { fn(acc); void saveAccount(acc); void requestPersistence(); emit(); },
  replace(next: Account) { acc = next; void saveAccount(acc); emit(); },
};
export function useStore(): Account {
  const [, force] = useReducer<number, void>((x: number) => x + 1, 0);
  useEffect(() => { listeners.add(force); return () => { listeners.delete(force); }; }, []);
  return acc;
}
