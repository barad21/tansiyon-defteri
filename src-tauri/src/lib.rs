use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_measurements_table",
            sql: "
            CREATE TABLE IF NOT EXISTS measurements (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                date        TEXT NOT NULL,
                period      TEXT NOT NULL CHECK (period IN ('sabah', 'aksam')),
                pulse_bpm   INTEGER NOT NULL,
                systolic    INTEGER NOT NULL,
                diastolic   INTEGER NOT NULL,
                recorded_at TEXT NOT NULL,
                UNIQUE (date, period)
            );
        ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "rename_measurements_for_dual_readings",
            sql: "ALTER TABLE measurements RENAME TO measurements_legacy;",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_measurements_dual_readings",
            sql: "
                CREATE TABLE measurements (
                    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
                    date                 TEXT NOT NULL,
                    period               TEXT NOT NULL CHECK (period IN ('sabah', 'aksam')),
                    pulse_bpm_initial    INTEGER NOT NULL,
                    systolic_initial     INTEGER NOT NULL,
                    diastolic_initial    INTEGER NOT NULL,
                    pulse_bpm_followup   INTEGER NOT NULL,
                    systolic_followup    INTEGER NOT NULL,
                    diastolic_followup   INTEGER NOT NULL,
                    recorded_at          TEXT NOT NULL,
                    UNIQUE (date, period)
                );
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "migrate_legacy_measurements",
            sql: "
                INSERT INTO measurements (
                    date, period,
                    pulse_bpm_initial, systolic_initial, diastolic_initial,
                    pulse_bpm_followup, systolic_followup, diastolic_followup,
                    recorded_at
                )
                SELECT
                    date, period,
                    pulse_bpm, systolic, diastolic,
                    pulse_bpm, systolic, diastolic,
                    recorded_at
                FROM measurements_legacy;
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "drop_measurements_legacy",
            sql: "DROP TABLE measurements_legacy;",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:tansiyon.db", migrations)
                .build(),
        )
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                let icon = tauri::include_image!("icons/32x32.png");
                let _ = window.set_icon(icon);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
