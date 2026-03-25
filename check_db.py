import sqlite3
import os

DB_PATH = os.path.join("server", "gdm_app.db")

if not os.path.exists(DB_PATH):
    print("DB does not exist")
else:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("PRAGMA table_info(predictions)")
    columns = [row[1] for row in c.fetchall()]
    print(f"Columns in predictions: {columns}")
    conn.close()
