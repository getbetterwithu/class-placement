import os

# 스크립트 위치를 기준으로 레포지토리 루트 경로 자동 인식
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

preamble_path = os.path.join(base_dir, 'tools/preamble.html')
assets_path = os.path.join(base_dir, 'src/assets.js')
sample_path = os.path.join(base_dir, 'src/sample_data.js')
app_path = os.path.join(base_dir, 'src/app.jsx')
epilogue_path = os.path.join(base_dir, 'tools/epilogue.html')
output_path = os.path.join(base_dir, 'index.html')

with open(preamble_path, 'r', encoding='utf-8') as f:
    preamble = f.read()

with open(assets_path, 'r', encoding='utf-8') as f:
    assets = f.read()

with open(sample_path, 'r', encoding='utf-8') as f:
    sample = f.read()

with open(app_path, 'r', encoding='utf-8') as f:
    app = f.read()

with open(epilogue_path, 'r', encoding='utf-8') as f:
    epilogue = f.read()

full_html = preamble + '\n' + assets + '\n' + sample + '\n' + app + '\n' + epilogue

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(full_html)

size_mb = len(full_html.encode('utf-8')) / (1024 * 1024)
print(f"Build complete -> index.html ({size_mb:.2f} MB)")

# Babel JSX 구문 무결성 자동 검증 실행
import subprocess
ret = subprocess.run(['node', os.path.join(base_dir, 'tools/test_compile.js')])
if ret.returncode != 0:
    raise SystemExit("❌ Babel 컴파일 검증 실패! index.html 빌드가 중단되었습니다.")

