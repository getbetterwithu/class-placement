import os
import openpyxl

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 1. 샘플 데이터 로드 (194명)
wb = openpyxl.load_workbook(os.path.join(base_dir, '학생데이터_샘플.xlsx'))
ws = wb.active
raw_students = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if row[2]:
        ban = int(row[0])
        no = int(row[1])
        name = str(row[2]).strip()
        gender = str(row[3]).strip() if row[3] else ''
        score = float(row[5]) if row[5] is not None else 0.0
        raw_students.append({
            'id': f'{ban}-{no}',
            '학번': f'1{ban}{no:02d}',
            '구반': ban,
            '구번호': no,
            '성명': name,
            '성별': gender,
            '기준성적': score
        })

print(f"📊 기본 테스트 데이터 로드: 총 {len(raw_students)}명")

# 2. 분반 배치 알고리즘 (JS app.jsx 구현체와 100% 동일)
def assign_classes(students_list, num_classes, gender_mode, balance_gender=True):
    classes = {i: [] for i in range(1, num_classes + 1)}
    do_balance = balance_gender and (gender_mode == 'coed')
    has_gender = do_balance and any(s['성별'] == '남' for s in students_list) and any(s['성별'] == '여' for s in students_list)

    if has_gender:
        # 남녀공학 성비 균형 ㄹ자 (남학생 1->N, 여학생 N->1)
        males = [s for s in students_list if s['성별'] == '남']
        females = [s for s in students_list if s['성별'] == '여']

        m_scored = sorted([s for s in males if s['기준성적'] > 0], key=lambda x: x['기준성적'], reverse=True)
        m_zero = [s for s in males if s['기준성적'] == 0]
        f_scored = sorted([s for s in females if s['기준성적'] > 0], key=lambda x: x['기준성적'], reverse=True)
        f_zero = [s for s in females if s['기준성적'] == 0]

        def snake_assign(items, start_class, start_dir):
            c, d = start_class, start_dir
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

        m_res, mc, md = snake_assign(m_scored, 1, 1)
        mz_res, _, _ = snake_assign(m_zero, mc, md)
        f_res, fc, fd = snake_assign(f_scored, num_classes, -1)
        fz_res, _, _ = snake_assign(f_zero, fc, fd)

        for i in range(1, num_classes + 1):
            classes[i] = m_res[i] + mz_res[i] + f_res[i] + fz_res[i]
    else:
        # 단성 학교 (남학교/여학교) 또는 성비균형 OFF: 순수 성적순 ㄹ자 (1->N->1)
        scored = sorted([s for s in students_list if s['기준성적'] > 0], key=lambda x: x['기준성적'], reverse=True)
        zero = [s for s in students_list if s['기준성적'] == 0]

        c, d = 1, 1
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

# 3. 학번 생성 수식 (JS app.jsx exportToExcel / confirmImport 와 100% 동일)
def generate_student_id(grade_transition, class_num, ban_no, id_format, num_classes):
    new_grade = 1 if grade_transition == 'freshman' else (2 if grade_transition == '1to2' else 3)
    is_5digit = (id_format == '5digit') or (num_classes >= 10)
    if is_5digit:
        return f"{new_grade}{class_num:02d}{ban_no:02d}"
    else:
        return f"{new_grade}{class_num}{ban_no:02d}"

# 4. 전수 매트릭스 검사 실행
print("\n" + "="*80)
print("🧪 [전수 검증 테스트 매트릭스 시작]")
print("="*80)

passed_count = 0
total_scenarios = 0

school_types = ['middle', 'high']
gender_modes = ['coed', 'boys', 'girls']
id_formats = ['4digit', '5digit']
class_counts = [4, 8, 12]  # 4반(소규모), 8반(표준), 12반(10반 이상 대규모)
grade_transitions = ['1to2', '2to3', 'freshman']

results_table = []

for s_type in school_types:
    for g_mode in gender_modes:
        for i_fmt in id_formats:
            for n_cls in class_counts:
                for g_trans in grade_transitions:
                    total_scenarios += 1
                    case_name = f"{s_type} | {g_mode:5s} | {i_fmt} | {n_cls:2d}반 | {g_trans:8s}"

                    # 데이터 준비 (성별 모드 반영)
                    test_students = []
                    for s in raw_students:
                        item = dict(s)
                        if g_mode == 'boys': item['성별'] = '남'
                        elif g_mode == 'girls': item['성별'] = '여'
                        test_students.append(item)

                    # 분반 실행
                    classes = assign_classes(test_students, n_cls, g_mode, balance_gender=(g_mode == 'coed'))

                    # 1. 인원수 균등 분배 검증 (전체 194명이 n_cls반에 n 또는 n+1명씩 고르게 나뉘었는가)
                    counts = [len(classes[c]) for c in range(1, n_cls + 1)]
                    min_c, max_c = min(counts), max(counts)
                    assert (max_c - min_c) <= 1, f"인원수 불균형: min={min_c}, max={max_c}"
                    assert sum(counts) == len(test_students), "총 학생 수 불일치"

                    # 2. 성비 검증
                    if g_mode == 'coed':
                        # 남녀공학: 각 반 남학생 수 차이 <= 1, 여학생 수 차이 <= 1
                        m_counts = [sum(1 for s in classes[c] if s['성별'] == '남') for c in range(1, n_cls + 1)]
                        f_counts = [sum(1 for s in classes[c] if s['성별'] == '여') for c in range(1, n_cls + 1)]
                        assert (max(m_counts) - min(m_counts)) <= 1, f"공학 남학생 성비 왜곡: {m_counts}"
                        assert (max(f_counts) - min(f_counts)) <= 1, f"공학 여학생 성비 왜곡: {f_counts}"
                    elif g_mode == 'boys':
                        assert all(all(s['성별'] == '남' for s in classes[c]) for c in range(1, n_cls + 1)), "남학교에 여학생 포함"
                    elif g_mode == 'girls':
                        assert all(all(s['성별'] == '여' for s in classes[c]) for c in range(1, n_cls + 1)), "여학교에 남학생 포함"

                    # 3. 성적 평균 균등성 검증 (성적보유자 평균 편차)
                    avgs = []
                    for c in range(1, n_cls + 1):
                        sc = [s['기준성적'] for s in classes[c] if s['기준성적'] > 0]
                        if sc: avgs.append(sum(sc) / len(sc))
                    avg_spread = max(avgs) - min(avgs)
                    # print if spread is large
                    if avg_spread >= 35.0:
                        print(f"Notice: {case_name} spread={avg_spread:.2f}점")
                    assert avg_spread < 50.0, f"학급 간 성적 편차 과다 ({avg_spread:.2f}점)"

                    # 4. 학번 생성 및 자릿수/오버플로 검증
                    sample_id_1 = generate_student_id(g_trans, 1, 1, i_fmt, n_cls)
                    sample_id_last = generate_student_id(g_trans, n_cls, 25, i_fmt, n_cls)

                    expected_grade = '1' if g_trans == 'freshman' else ('2' if g_trans == '1to2' else '3')
                    assert sample_id_1.startswith(expected_grade), f"신학번 학년 접두어 오류: {sample_id_1}"

                    if n_cls >= 10:
                        # 10반 이상이면 4자리 요청 여부와 무관하게 무조건 5자리여야 함 (오버플로 방지)
                        assert len(sample_id_last) == 5, f"10반 이상 5자리 강제 실패: {sample_id_last}"
                        assert sample_id_last.startswith(expected_grade), f"10반 학번이 윗학년으로 오버플로됨: {sample_id_last}"
                    else:
                        if i_fmt == '4digit':
                            assert len(sample_id_1) == 4, f"4자리 학번 길이 오류: {sample_id_1}"
                        else:
                            assert len(sample_id_1) == 5, f"5자리 학번 길이 오류: {sample_id_1}"

                    passed_count += 1

print(f"\n✅ 전수 검증 매트릭스 완료: 총 {total_scenarios}개 조합 중 {passed_count}개 100% 통과!\n")

# 대표 시나리오 6종 요약 리포트 출력
print("-" * 80)
print(f"{'시나리오':<35} | {'반수':<4} | {'성비 결과':<16} | {'성적 편차':<9} | {'학번 샘플':<10}")
print("-" * 80)

check_samples = [
    ('middle', 'coed', '4digit', 8, '1to2', '중학교 남녀공학 8반 4자리 (1→2학년)'),
    ('middle', 'boys', '4digit', 4, '1to2', '중학교 남학교 4반 4자리 (1→2학년)'),
    ('middle', 'girls', '5digit', 8, '2to3', '중학교 여학교 8반 5자리 (2→3학년)'),
    ('high', 'coed', '4digit', 12, '1to2', '고등학교 공학 12반 4자리요청→5자리자동 (고1→고2)'),
    ('high', 'boys', '5digit', 8, '2to3', '고등학교 남학교 8반 5자리 (고2→고3)'),
    ('high', 'coed', '5digit', 8, 'freshman', '고등학교 공학 8반 5자리 (신입생 배정)'),
]

for s_type, g_mode, i_fmt, n_cls, g_trans, desc in check_samples:
    test_students = [dict(s, 성별='남' if g_mode=='boys' else ('여' if g_mode=='girls' else s['성별'])) for s in raw_students]
    classes = assign_classes(test_students, n_cls, g_mode, balance_gender=(g_mode == 'coed'))
    m_cnts = [sum(1 for s in classes[c] if s['성별'] == '남') for c in range(1, n_cls + 1)]
    f_cnts = [sum(1 for s in classes[c] if s['성별'] == '여') for c in range(1, n_cls + 1)]
    avgs = [sum(s['기준성적'] for s in classes[c] if s['기준성적'] > 0) / len([s for s in classes[c] if s['기준성적'] > 0]) for c in range(1, n_cls + 1)]
    spread = max(avgs) - min(avgs)
    
    if g_mode == 'coed':
        gender_res = f"남{min(m_cnts)}~{max(m_cnts)}/여{min(f_cnts)}~{max(f_cnts)}"
    else:
        gender_res = f"{'남' if g_mode=='boys' else '여'} 전원({min(len(classes[c]) for c in classes)}~{max(len(classes[c]) for c in classes)}명)"
        
    s_id = generate_student_id(g_trans, n_cls, 1, i_fmt, n_cls)
    print(f"{desc:<35} | {n_cls:2d}반 | {gender_res:<16} | {spread:6.2f}점   | {s_id}")

print("-" * 80)
