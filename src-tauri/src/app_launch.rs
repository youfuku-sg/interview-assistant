use serde::Serialize;
use sqlx::Row;
use tauri::{AppHandle, Manager};
use tauri_plugin_sql::DbPool;

const DB_KEY: &str = "sqlite:pluely.db";

#[derive(Serialize)]
pub struct AppLaunchEntry {
    id: i64,
    launched_at: i64,
}

async fn sqlite_pool(app: &AppHandle) -> Result<sqlx::SqlitePool, String> {
    let instances = app.state::<tauri_plugin_sql::DbInstances>();
    let pools = instances.0.read().await;
    match pools.get(DB_KEY) {
        Some(DbPool::Sqlite(pool)) => Ok(pool.clone()),
        Some(_) => Err(format!("Unexpected pool type for {}", DB_KEY)),
        None => Err(format!("Database pool not found for {}", DB_KEY)),
    }
}

/// Records a single app-launch row. Called once from `setup()` per process start.
pub async fn record_launch(app: &AppHandle) -> Result<(), String> {
    let pool = sqlite_pool(app).await?;
    sqlx::query("INSERT INTO app_launches DEFAULT VALUES")
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to record app launch: {}", e))?;
    Ok(())
}

#[tauri::command]
pub async fn get_app_launch_history(app: AppHandle) -> Result<Vec<AppLaunchEntry>, String> {
    let pool = sqlite_pool(&app).await?;
    let rows = sqlx::query(
        "SELECT id, launched_at FROM app_launches ORDER BY launched_at DESC, id DESC LIMIT 10",
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| format!("Failed to fetch app launch history: {}", e))?;
    let entries = rows
        .into_iter()
        .map(|row| AppLaunchEntry {
            id: row.get("id"),
            launched_at: row.get("launched_at"),
        })
        .collect();
    Ok(entries)
}
