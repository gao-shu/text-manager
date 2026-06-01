mod models;
mod settings;
mod storage;

use models::AppData;
use settings::{load_settings, save_settings};
use storage::{get_data_path, validate_app_data};
use tauri_plugin_dialog::DialogExt;

#[tauri::command]
fn load_data() -> Result<AppData, String> {
    storage::load_data()
}

#[tauri::command]
fn save_data(data: AppData) -> Result<(), String> {
    validate_app_data(&data)?;
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

#[tauri::command]
fn get_data_file_path() -> Result<String, String> {
    get_data_path().map(|p| p.to_string_lossy().into_owned())
}

#[tauri::command]
fn get_default_data_file_path() -> Result<String, String> {
    settings::default_data_path().map(|p| p.to_string_lossy().into_owned())
}

#[tauri::command]
fn set_data_file_path(path: Option<String>) -> Result<String, String> {
    let mut settings = load_settings()?;
    settings.data_file_path = path.and_then(|p| {
        let trimmed = p.trim().to_string();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed)
        }
    });
    save_settings(&settings)?;
    get_data_file_path()
}

#[tauri::command]
fn open_data_folder(app: tauri::AppHandle) -> Result<(), String> {
    use tauri_plugin_opener::OpenerExt;

    let path = get_data_path()?;
    let folder = if path.is_file() {
        path.parent()
            .map(|p| p.to_path_buf())
            .ok_or_else(|| "无法获取数据文件所在目录".to_string())?
    } else {
        path
    };

    app.opener()
        .open_path(folder.to_string_lossy(), None::<&str>)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn export_data(app: tauri::AppHandle, data: AppData) -> Result<Option<String>, String> {
    validate_app_data(&data)?;

    let picked = app
        .dialog()
        .file()
        .set_title("导出数据")
        .set_file_name("text-manager-backup.json")
        .add_filter("JSON 文件", &["json"])
        .blocking_save_file();

    let Some(file_path) = picked else {
        return Ok(None);
    };

    let path = file_path
        .into_path()
        .map_err(|e| format!("无效路径: {e}"))?;

    let content = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    std::fs::write(&path, content).map_err(|e| e.to_string())?;

    Ok(Some(path.to_string_lossy().into_owned()))
}

#[tauri::command]
async fn import_data(app: tauri::AppHandle) -> Result<Option<AppData>, String> {
    let picked = app
        .dialog()
        .file()
        .set_title("导入数据")
        .add_filter("JSON 文件", &["json"])
        .blocking_pick_file();

    let Some(file_path) = picked else {
        return Ok(None);
    };

    let path = file_path
        .into_path()
        .map_err(|e| format!("无效路径: {e}"))?;

    let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let data: AppData =
        serde_json::from_str(&content).map_err(|e| format!("JSON 格式无效: {e}"))?;
    validate_app_data(&data)?;
    storage::save_data(&data)?;

    Ok(Some(data))
}

#[tauri::command]
async fn pick_data_file_path(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let picked = app
        .dialog()
        .file()
        .set_title("选择数据文件")
        .set_file_name("data.json")
        .add_filter("JSON 文件", &["json"])
        .blocking_save_file();

    let Some(file_path) = picked else {
        return Ok(None);
    };

    let path = file_path
        .into_path()
        .map_err(|e| format!("无效路径: {e}"))?;

    Ok(Some(path.to_string_lossy().into_owned()))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            load_data,
            save_data,
            write_clipboard,
            exit_app,
            get_data_file_path,
            get_default_data_file_path,
            set_data_file_path,
            open_data_folder,
            export_data,
            import_data,
            pick_data_file_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
