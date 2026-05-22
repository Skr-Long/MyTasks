use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::BufReader;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::Manager;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Book {
    pub id: String,
    pub title: String,
    pub author: String,
    pub format: String,
    pub path: String,
    pub file_size: u64,
    pub added_at: String,
    pub progress: u32,
}

#[derive(Debug, Serialize, Deserialize, Default)]
struct Library {
    books: Vec<Book>,
}

fn get_library_path(app_handle: &tauri::AppHandle) -> PathBuf {
    let mut path = app_handle
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    fs::create_dir_all(&path).expect("Failed to create app data directory");
    path.push("library.json");
    path
}

fn load_library(app_handle: &tauri::AppHandle) -> Library {
    let path = get_library_path(app_handle);
    if path.exists() {
        if let Ok(file) = File::open(&path) {
            let reader = BufReader::new(file);
            if let Ok(library) = serde_json::from_reader(reader) {
                return library;
            }
        }
    }
    Library::default()
}

fn save_library(app_handle: &tauri::AppHandle, library: &Library) -> Result<(), String> {
    let path = get_library_path(app_handle);
    let file = File::create(&path).map_err(|e| e.to_string())?;
    serde_json::to_writer_pretty(file, library).map_err(|e| e.to_string())?;
    Ok(())
}

fn extract_title_from_filename(filename: &str) -> String {
    let name = filename
        .rsplitn(2, '.')
        .last()
        .unwrap_or(filename)
        .to_string();
    let name = name.replace('_', " ").replace('-', " ");
    let name = name.trim();
    if name.is_empty() {
        "未知书籍".to_string()
    } else {
        name.to_string()
    }
}

fn get_file_extension(filename: &str) -> String {
    filename
        .rsplitn(2, '.')
        .next()
        .unwrap_or("txt")
        .to_lowercase()
}

fn get_current_timestamp() -> String {
    match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(duration) => duration.as_secs().to_string(),
        Err(_) => "0".to_string(),
    }
}

#[tauri::command]
async fn import_book(app_handle: tauri::AppHandle) -> Result<Book, String> {
    let file_path = tauri_plugin_dialog::DialogExt::dialog(&app_handle)
        .file()
        .add_filter(
            "电子书",
            &["txt", "epub", "pdf", "mobi", "azw3", "md", "html", "htm"],
        )
        .set_title("选择要导入的书籍")
        .pick_file()
        .await
        .map_err(|e| e.to_string())?;

    let file_path = file_path.ok_or_else(|| "未选择文件".to_string())?;

    let metadata = fs::metadata(&file_path).map_err(|e| e.to_string())?;
    let file_size = metadata.len();

    let filename = file_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("未知书籍");

    let title = extract_title_from_filename(filename);
    let format = get_file_extension(filename);
    let path_str = file_path.to_string_lossy().to_string();

    let book = Book {
        id: Uuid::new_v4().to_string(),
        title,
        author: "未知作者".to_string(),
        format,
        path: path_str,
        file_size,
        added_at: get_current_timestamp(),
        progress: 0,
    };

    let mut library = load_library(&app_handle);
    library.books.push(book.clone());
    save_library(&app_handle, &library)?;

    Ok(book)
}

#[tauri::command]
fn load_books(app_handle: tauri::AppHandle) -> Result<Vec<Book>, String> {
    let library = load_library(&app_handle);
    Ok(library.books)
}

#[tauri::command]
fn delete_book(app_handle: tauri::AppHandle, book_id: String) -> Result<(), String> {
    let mut library = load_library(&app_handle);
    library.books.retain(|b| b.id != book_id);
    save_library(&app_handle, &library)?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![import_book, load_books, delete_book])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
