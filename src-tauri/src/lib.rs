mod models;
mod storage;

use models::AppData;

#[tauri::command]
fn load_data() -> Result<AppData, String> {
    storage::load_data()
}

#[tauri::command]
fn save_data(data: AppData) -> Result<(), String> {
    storage::save_data(&data)
}

#[tauri::command]
fn write_clipboard(text: String) -> Result<(), String> {
    storage::write_clipboard(&text)
}

#[tauri::command]
fn exit_app() {
    std::process::exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![load_data, save_data, write_clipboard, exit_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
