#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use tauri::api::dialog;
use tauri::api::path::desktop_dir;
use tauri::Manager;
use chrono::{DateTime, TimeZone, Utc};
use std::fs;
use std::io;
use std::time::{SystemTime, UNIX_EPOCH};

// Structs
#[derive(Debug, Serialize, Deserialize)]
struct FileItem {
    name: String,
    type_: String,
    path: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct ListItem {
    metadata: i64,
    file_path: String,
}

impl ListItem {
    fn new(metadata: i64, file_path: String) -> ListItem {
        ListItem {
            metadata,
            file_path,
        }
    }
}

// Convert file creation time to YYYY.MM.DD format
fn convert_sec_to_ymd(seconds: i64) -> String {
    let naive_datetime: DateTime<Utc> = Utc.timestamp_opt(seconds, 0).single().expect("Invalid timestamp");
    naive_datetime.format("%Y.%m.%d").to_string()
}

// Create directory if it doesn't exist
fn create_dir_if_not_exists(dir_path: &String) -> io::Result<()> {
    match fs::create_dir(dir_path) {
        Ok(_) => println!("Directory created at: {}", dir_path),
        Err(e) => {
            if e.kind() == std::io::ErrorKind::AlreadyExists {
                println!("Directory already exists at: {}", dir_path);
            } else {
                return Err(e);
            }
        }
    }
    Ok(())
}

// Move file from source to destination
fn move_file(source: &str, destination: &str) -> io::Result<()> {
    fs::rename(source, destination)?;
    println!("Moved file from {} to {}", source, destination);
    Ok(())
}

// Check if the file has a valid extension
fn check_extension(file_name: &str) -> bool {
    let upper_case_file_name = file_name.to_uppercase();
    upper_case_file_name.contains(".JPG")
        || upper_case_file_name.contains(".JPEG")
        || upper_case_file_name.contains(".PNG")
        || upper_case_file_name.contains(".PDF")
        || upper_case_file_name.contains(".JS")
}

// List files in the folder and return a list of `ListItem` structs
#[tauri::command]
fn list_files_in_folder(folder_path: &str) -> Result<Vec<ListItem>, String> {
    let paths = fs::read_dir(folder_path).map_err(|e| e.to_string())?; // Convert error to String
    let mut file_list: Vec<ListItem> = Vec::new();

    for path in paths {
        let entry = path.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;

        if metadata.is_file() {
            if let Ok(system_time) = metadata.created() {
                let creation_time = system_time
                    .duration_since(UNIX_EPOCH)
                    .unwrap_or_else(|_| SystemTime::now().duration_since(UNIX_EPOCH).unwrap())
                    .as_secs() as i64;

                let list_item = ListItem::new(creation_time, entry.path().display().to_string());
                file_list.push(list_item);
            } else {
                println!("Creation time not available for file: {}", entry.path().display());
            }
        }
    }

    Ok(file_list) // Return the list of files
}


// Handle the file sorting based on creation date
#[tauri::command]
fn file_handler(file_list: Vec<ListItem>, parent_folder_path: String) {
    for file in file_list {
        if check_extension(&file.file_path) {
            let folder_name: String = convert_sec_to_ymd(file.metadata);
            let child_folder_path = format!("{}/{}", parent_folder_path, folder_name);
            if let Err(e) = create_dir_if_not_exists(&child_folder_path) {
                println!("Error creating directory: {}", e);
                continue;
            }
            let source = &file.file_path;
            let destination = &format!("{}/{}", child_folder_path, source.split("/").last().unwrap());
            if let Err(e) = move_file(source, destination) {
                println!("Error moving file: {}", e);
            }
        }
    }
}

// Command to open file system and select a folder
#[tauri::command]
async fn open_file_system() -> Option<String> {
    let (sender, receiver) = std::sync::mpsc::channel();

    let desktop_path = tauri::api::path::desktop_dir().unwrap_or_else(|| std::env::current_dir().unwrap());
    dialog::FileDialogBuilder::new()
        .set_title("Select a Folder")
        .set_directory(desktop_path)
        .pick_folder(move |path| {
            if let Some(path) = path {
                let _ = sender.send(path.display().to_string());
            } else {
                let _ = sender.send("No folder selected".to_string());
            }
        });

    receiver.recv().ok()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            open_file_system,
            list_files_in_folder,
            file_handler
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

