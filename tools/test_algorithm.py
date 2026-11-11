import os
import json
import openpyxl

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Load sample students
wb1 = openpyxl.load_workbook(f'{base_dir}/학생데이터_샘플.xlsx')
ws1 = wb1.active
students = []
for row in ws1.iter_rows(min_row=2, values_only=True):
    if row[2]:
        ban = int(row[0])
        no = int(row[1])
        name = str(row[2]).strip()
        gender = str(row[3]).strip() if row[3] else ''
        score = float(row[5]) if row[5] is not None else 0.0
        students.append({
            'id': f'{ban}-{no}',
            '학번': f'1{ban}{no:02d}',
            '구반': ban,
            '구번호': no,
            '성명': name,
            '성별': gender,
            '기준성적': score
        })

# Load separations
wb2 = openpyxl.load_workbook(f'{base_dir}/분리대상_샘플.xlsx')
ws2 = wb2.active
separations = []
for row in ws2.iter_rows(min_row=2, values_only=True):
    if row[0] and row[1]:
        separations.append({
            'student1': str(row[0]).strip(),
            'student2': str(row[1]).strip()
        })

print(f"Total students: {len(students)}, Separations: {len(separations)}")

# Algorithm Implementation in Python matching JS
def do_l_shape_assignment(student_data, num_classes=8, balance_gender=True):
    classes = {i: [] for i in range(1, num_classes + 1)}
    has_gender = balance_gender and any(s['성별'] == '남' for s in student_data) and any(s['성별'] == '여' for s in student_data)

    if has_gender:
        males = [s for s in student_data if s['성별'] == '남']
        females = [s for s in student_data if s['성별'] == '여']

        m_scored = sorted([s for s in males if s['기준성적'] > 0], key=lambda x: x['기준성적'], reverse=True)
        m_zero = [s for s in males if s['기준성적'] == 0]

        f_scored = sorted([s for s in females if s['기준성적'] > 0], key=lambda x: x['기준성적'], reverse=True)
        f_zero = [s for s in females if s['기준성적'] == 0]

        # Snake assign helper
        def snake_assign(items, start_class, start_dir):
            c = start_class
            d = start_dir
            assigned = {i: [] for i in range(1, num_classes + 1)}
            for item in items:
                assigned[c].append(dict(item, 원래분반=c, 현재분반=c))
                if d == 1:
                    if c == num_classes: d = -1
                    else: c += 1
                else:
                    if c == 1: d = 1
                    else: c -= 1
            return assigned, c, d

        # 1. 남학생 순방향 (1 -> N -> 1)
        m_res, mc, md = snake_assign(m_scored, 1, 1)
        mz_res, _, _ = snake_assign(m_zero, mc, md)

        # 2. 여학생 역방향 (N -> 1 -> N) - 전체 학급 성적 합계 및 성비 균형
        f_res, fc, fd = snake_assign(f_scored, num_classes, -1)
        fz_res, _, _ = snake_assign(f_zero, fc, fd)

        for i in range(1, num_classes + 1):
            classes[i] = m_res[i] + mz_res[i] + f_res[i] + fz_res[i]
    else:
        # 단성 또는 성별 없음: 일반 성적순 ㄹ자
        scored = sorted([s for s in student_data if s['기준성적'] > 0], key=lambda x: x['기준성적'], reverse=True)
        zero = [s for s in student_data if s['기준성적'] == 0]

        c = 1
        d = 1
        for s in scored:
            classes[c].append(dict(s, 원래분반=c, 현재분반=c))
            if d == 1:
                if c == num_classes: d = -1
                else: c += 1
            else:
                if c == 1: d = 1
                else: c -= 1

        for s in zero:
            classes[c].append(dict(s, 원래분반=c, 현재분반=c))
            if d == 1:
                if c == num_classes: d = -1
                else: c += 1
            else:
                if c == 1: d = 1
                else: c -= 1

    return classes

classes = do_l_shape_assignment(students, 8, True)

print("\n--- RESULTS OF NEW ALGORITHM ---")
for i in range(1, 9):
    cnt = len(classes[i])
    m_cnt = sum(1 for s in classes[i] if s['성별'] == '남')
    f_cnt = sum(1 for s in classes[i] if s['성별'] == '여')
    scores = [s['기준성적'] for s in classes[i] if s['기준성적'] > 0]
    avg = sum(scores) / len(scores) if scores else 0
    print(f"Class {i}: Total={cnt}, 남={m_cnt}, 여={f_cnt}, 성적보유자평균={avg:.2f}")

# Verification assertions
assert all(len(classes[i]) in [24, 25] for i in range(1, 9)), "Class total counts uneven!"
assert all(sum(1 for s in classes[i] if s['성별'] == '남') in [12, 13] for i in range(1, 9)), "Male counts uneven!"
assert all(sum(1 for s in classes[i] if s['성별'] == '여') in [12, 13] for i in range(1, 9)), "Female counts uneven!"
print("\n✅ Co-ed algorithmic assertions PASSED!")

# 2. Test Single-gender (남학교 / 여학교) mode
boys_only_students = [dict(s, 성별='남') for s in students]
classes_boys = do_l_shape_assignment(boys_only_students, 8, balance_gender=False)
assert all(len(classes_boys[i]) in [24, 25] for i in range(1, 9)), "Boys school class total counts uneven!"
scores_boys = []
for i in range(1, 9):
    sc = [s['기준성적'] for s in classes_boys[i] if s['기준성적'] > 0]
    scores_boys.append(sum(sc) / len(sc) if sc else 0)
assert max(scores_boys) - min(scores_boys) < 15, "Boys school score spread too high!"
print("✅ Boys/Girls single-gender mode assertions PASSED!")

# 3. Test Student ID generation logic (4-digit vs 5-digit)
def generate_hakbun(new_grade, class_num, ban_no, id_format, total_classes):
    is_5digit = (id_format == '5digit') or (total_classes >= 10)
    if is_5digit:
        return f"{new_grade}{class_num:02d}{ban_no:02d}"
    else:
        return f"{new_grade}{class_num}{ban_no:02d}"

# 4-digit check (Grade 2, Class 3, No 15 -> 2315)
assert generate_hakbun(2, 3, 15, '4digit', 8) == '2315', "4-digit format failed!"
# 5-digit check (Grade 2, Class 3, No 15 -> 20315)
assert generate_hakbun(2, 3, 15, '5digit', 8) == '20315', "5-digit format failed!"
# 10 classes overflow protection (Grade 2, Class 10, No 15 -> 21015 even when requested 4digit)
assert generate_hakbun(2, 10, 15, '4digit', 12) == '21015', "10+ class 5-digit fallback failed!"
print("✅ Student ID format (4-digit vs 5-digit & 10+ class protection) assertions PASSED!\n")
