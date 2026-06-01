import { invoke } from "@tauri-apps/api/core";
import type { AppData } from "../types";

export async function getDataFilePath(): Promise<string> {
  return invoke<string>("get_data_file_path");
}

export async function getDefaultDataFilePath(): Promise<string> {
  return invoke<string>("get_default_data_file_path");
}

export async function setDataFilePath(path: string | null): Promise<string> {
  return invoke<string>("set_data_file_path", { path });
}

export async function openDataFolder(): Promise<void> {
  return invoke("open_data_folder");
}

export async function exportData(data: AppData): Promise<string | null> {
  return invoke<string | null>("export_data", { data });
}

export async function importData(): Promise<AppData | null> {
  return invoke<AppData | null>("import_data");
}

export async function pickDataFilePath(): Promise<string | null> {
  return invoke<string | null>("pick_data_file_path");
}
