import os
import json
import openpyxl

male_names = [
    '김민준', '이서준', '박도윤', '최예준', '정시우', '강하준', '조주원', '윤지호', '장지후', '임준우',
    '한준서', '오건우', '서도현', '신현우', '권지훈', '황우진', '안선우', '송유준', '류민재', '홍서진',
    '고연우', '문은우', '양정우', '손준혁', '배승우', '백승현', '허시윤', '유재윤', '남유찬', '심진우',
    '노민성', '하태윤', '곽윤우', '성동현', '차준영', '주지원', '우도겸', '구민우', '라태양', '민민규',
    '진기태', '지정민', '엄상원', '채진호', '원성준', '천현준', '방재원', '공수혁', '현명준', '함찬우',
    '변태현', '염동우', '여준호', '추시혁', '탁민찬', '도윤재', '진서원', '호준기', '선우진', '김태완',
    '김도하', '이로운', '박은찬', '최시온', '정유안', '강하율', '조태민', '윤진혁', '장도훈', '임우석',
    '한선재', '오동건', '서준상', '신민혁', '권태웅', '황정호', '안동욱', '송재민', '류태주', '홍성민',
    '고준하', '문영준', '양진욱', '손원우', '배지완', '백도원', '허승민', '유재현', '남태훈', '심규현',
    '노상혁', '하은호', '곽정후', '성민우', '차지호', '주영후', '우준서'
]

female_names = [
    '김서연', '이서윤', '박지우', '최서현', '정하은', '강민서', '조지민', '윤채원', '장수아', '임지아',
    '한윤서', '오다은', '서은서', '신예은', '권수빈', '황지원', '안시은', '송소율', '류예원', '홍예린',
    '고하윤', '문채은', '양나은', '손유진', '배유나', '백지안', '허아린', '유민아', '남서아', '심소은',
    '노하린', '하은채', '곽다인', '성가은', '차서하', '주예나', '우채윤', '구수현', '라지유', '민윤아',
    '진다윤', '지효주', '엄보민', '채시아', '원서우', '천유주', '방예솔', '공소연', '현정아', '함서은',
    '변다솜', '염은비', '여채린', '추세아', '탁보은', '도예슬', '진나율', '호수연', '선유나', '신다희',
    '김하음', '이다율', '박나은', '최서정', '정유빈', '강시현', '조채희', '윤서영', '장민주', '임예지',
    '한소미', '오은솔', '서채원', '신유림', '권세은', '황나영', '안다연', '송예담', '류수연', '홍하영',
    '고다혜', '문유정', '양가윤', '손소민', '배하민', '백서율', '허아윤', '유주하', '남채아', '심예린',
    '노시아', '하나율', '곽다영', '성지율', '차효은', '주하랑', '우하린'
]

base_dir = r'C:\Workspace\class-placement'
student_excel_path = os.path.join(base_dir, '학생데이터_샘플.xlsx')
sep_excel_path = os.path.join(base_dir, '분리대상_샘플.xlsx')
js_path = os.path.join(base_dir, 'src', 'sample_data.js')

wb = openpyxl.load_workbook(student_excel_path)
ws = wb.active

name_map = {}
m_idx = 0
f_idx = 0
students_data = []

for row in ws.iter_rows(min_row=2):
    if row[2].value:
        old_name = str(row[2].value).strip()
        gender = str(row[3].value).strip() if row[3].value else ''
        if gender == '남':
            new_name = male_names[m_idx]
            m_idx += 1
        else:
            new_name = female_names[f_idx]
            f_idx += 1
        name_map[old_name] = new_name
        row[2].value = new_name
        
        ban = int(row[0].value)
        no = int(row[1].value)
        score = float(row[5].value) if row[5].value is not None else 0.0
        students_data.append({
            "id": f"{ban}-{no}",
            "학번": f"1{ban}{no:02d}",
            "구반": ban,
            "구번호": no,
            "성명": new_name,
            "성별": gender,
            "기준성적": score
        })

wb.save(student_excel_path)
print(f"학생데이터_샘플.xlsx 저장 완료! 매핑된 학생 수: {len(name_map)}명")

# 2. 분리대상_샘플.xlsx 업데이트
wb_sep = openpyxl.load_workbook(sep_excel_path)
ws_sep = wb_sep.active
seps_data = []

for row in ws_sep.iter_rows(min_row=2):
    if row[0].value and row[1].value:
        old_s1 = str(row[0].value).strip()
        old_s2 = str(row[1].value).strip()
        new_s1 = name_map.get(old_s1, old_s1)
        new_s2 = name_map.get(old_s2, old_s2)
        row[0].value = new_s1
        row[1].value = new_s2
        seps_data.append({
            "student1": new_s1,
            "student2": new_s2
        })

wb_sep.save(sep_excel_path)
print(f"분리대상_샘플.xlsx 저장 완료! 매핑된 분리 대상: {len(seps_data)}쌍")

# 3. src/sample_data.js 업데이트
js_content = f"""// 내장 샘플 데이터 (가명 처리된 1학년 194명 + 분리대상 25쌍)
// 사용자가 파일 없이도 '1초 체험하기'를 누르면 즉시 전체 기능을 테스트할 수 있도록 제공
const EMBEDDED_SAMPLE_STUDENTS = {json.dumps(students_data, ensure_ascii=False, indent=2)};

const EMBEDDED_SAMPLE_SEPARATIONS = {json.dumps(seps_data, ensure_ascii=False, indent=2)};
"""

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"src/sample_data.js 저장 완료! 파일 크기: {len(js_content)} 바이트")
