import { invoke } from "@tauri-apps/api/core";
import type { AppData } from "../types";

export async function loadData(): Promise<AppData> {
  return invoke<AppData>("load_data");
}

export async function saveData(data: AppData): Promise<void> {
  return invoke("save_data", { data });
}

export async function writeClipboard(text: string): Promise<void> {
  return invoke("write_clipboard", { text });
}

export function nowIso(): string {
  return new Date().toISOString();
}
