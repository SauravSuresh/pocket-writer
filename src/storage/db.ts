import { openDB } from "idb";
import { Account, emptyAccount } from "../domain/types";

const DB = "pocket-writer", STORE = "kv", KEY = "account";
const db = () => openDB(DB, 1, { upgrade(d) { d.createObjectStore(STORE); } });

export async function loadAccount(): Promise<Account> {
  const acc = await (await db()).get(STORE, KEY);
  return (acc as Account | undefined) ?? emptyAccount();
}
export async function saveAccount(acc: Account): Promise<void> {
  await (await db()).put(STORE, JSON.parse(JSON.stringify(acc)), KEY);
}
let persistAsked = false;
export async function requestPersistence(): Promise<boolean> {
  if (persistAsked || !navigator.storage?.persist) return false;
  persistAsked = true;
  try { return await navigator.storage.persist(); } catch { return false; }
}
