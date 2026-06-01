use std::path::PathBuf;

use crate::models::AppData;
use crate::settings::{default_data_path, load_settings};

pub fn get_data_path() -> Result<PathBuf, String> {
    let settings = load_settings()?;
    if let Some(custom) = settings.data_file_path {
        let trimmed = custom.trim();
        if !trimmed.is_empty() {
            return Ok(PathBuf::from(trimmed));
        }
    }
    default_data_path()
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

pub fn validate_app_data(data: &AppData) -> Result<(), String> {
    if data.categories.is_empty() {
        return Err("数据至少需要包含一个分类".into());
    }
    Ok(())
}
