use std::path::PathBuf;

use crate::models::AppData;

pub fn get_data_path() -> Result<PathBuf, String> {
    let app_data = std::env::var("APPDATA").map_err(|e| e.to_string())?;
    Ok(PathBuf::from(app_data).join("TextManager").join("data.json"))
}

pub fn load_data() -> Result<AppData, String> {
    let path = get_data_path()?;
    if !path.exists() {
        let data = AppData::new_default();
        save_data(&data)?;
        return Ok(data);
    }

    let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

pub fn save_data(data: &AppData) -> Result<(), String> {
    let path = get_data_path()?;
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let tmp_path = path.with_extension("json.tmp");
    let content = serde_json::to_string_pretty(data).map_err(|e| e.to_string())?;
    std::fs::write(&tmp_path, &content).map_err(|e| e.to_string())?;
    std::fs::rename(&tmp_path, &path).map_err(|e| e.to_string())?;
    Ok(())
}

pub fn write_clipboard(text: &str) -> Result<(), String> {
    arboard::Clipboard::new()
        .map_err(|e| e.to_string())?
        .set_text(text)
        .map_err(|e| e.to_string())
}
