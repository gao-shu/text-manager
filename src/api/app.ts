import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

export async function quitApp(): Promise<void> {
  const win = getCurrentWindow();
  try {
    await win.destroy();
  } catch {
    // window may already be gone
  }
  await invoke("exit_app");
}
