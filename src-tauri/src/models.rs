use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Category {
    pub id: String,
    pub name: String,
    pub sort_order: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Snippet {
    pub id: String,
    pub category_id: String,
    pub title: String,
    pub content: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AppData {
    pub categories: Vec<Category>,
    pub snippets: Vec<Snippet>,
}

impl AppData {
    pub fn new_default() -> Self {
        Self {
            categories: vec![Category {
                id: uuid::Uuid::new_v4().to_string(),
                name: "默认".to_string(),
                sort_order: 0,
            }],
            snippets: vec![],
        }
    }
}
