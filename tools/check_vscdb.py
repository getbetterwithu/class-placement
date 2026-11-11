import sqlite3

p = r'C:\Users\user\AppData\Roaming\Antigravity\User\globalStorage\state.vscdb'
conn = sqlite3.connect(p)
c = conn.cursor()
c.execute("SELECT key, value FROM ItemTable WHERE value LIKE '%깃허브%' OR value LIKE '%textbook%' LIMIT 10;")
rows = c.fetchall()
for r in rows:
    print('Key:', r[0])
    print('Val:', str(r[1])[:300])
