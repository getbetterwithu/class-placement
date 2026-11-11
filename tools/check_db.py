import sqlite3

conn = sqlite3.connect(r'C:\Users\user\.gemini\antigravity\conversation_summaries.db')
cursor = conn.cursor()
cursor.execute("SELECT title, project_id, workspace_uris FROM conversation_summaries WHERE project_id != '' AND project_id != 'outside-of-project';")
rows = cursor.fetchall()
for r in rows:
    print(r)
