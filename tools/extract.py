import base64

with open(r'C:\Workspace\class-placement\src\assets.js', 'r', encoding='utf-8') as f:
    text = f.read()

s = text.find('base64,') + 7
e = text.find('"', s)
data = base64.b64decode(text[s:e])
with open(r'C:\Workspace\class-placement\preview\original_bomb.jpg', 'wb') as out:
    out.write(data)
print('Done, length:', len(data))
