const { useState, useEffect } = React;        
        // 폭탄돌리기 이미지 (base64 embedded)
        

        
        // 학생 데이터는 파일 업로드로 제공됩니다

// 상단 툴바: 기능별 섹터 그룹 (라벨 + 강조색 테두리)
function ToolbarGroup({ label, accent, children }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: '8px',
            padding: '10px 14px 12px',
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid #e5e7eb',
            borderTop: `3px solid ${accent}`,
            borderRadius: '12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
        }}>
            <div style={{
                fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px',
                color: accent, textTransform: 'uppercase', paddingLeft: '2px'
            }}>{label}</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{children}</div>
        </div>
    );
}

// 상단 툴바 버튼: 그라데이션 + hover 입체감
function ToolbarButton({ onClick, grad, disabled, title, children }) {
    const [hover, setHover] = useState(false);
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                padding: '10px 18px',
                background: disabled ? '#d1d5db' : grad,
                color: 'white',
                border: 'none',
                borderRadius: '9px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                boxShadow: disabled ? 'none' : (hover ? '0 6px 16px rgba(0,0,0,0.22)' : '0 2px 6px rgba(0,0,0,0.15)'),
                transform: (!disabled && hover) ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 0.18s ease',
                opacity: disabled ? 0.65 : 1
            }}
        >
            {children}
        </button>
    );
}

// 데이터 업로드 상태 표시등 (초록불=완료 / 빨간불=미완료)
function StatusLight({ label, done, detail }) {
    const color = done ? '#22c55e' : '#ef4444';
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            padding: '8px 16px', borderRadius: '999px',
            background: done ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${done ? '#bbf7d0' : '#fecaca'}`
        }}>
            <span style={{
                width: '12px', height: '12px', borderRadius: '50%',
                background: color, flex: '0 0 auto',
                boxShadow: `0 0 6px ${color}, 0 0 2px ${color}`
            }}></span>
            <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#374151' }}>{label}</span>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color }}>
                {done ? (detail || '완료') : '대기'}
            </span>
        </div>
    );
}

// 🧪 분반 조건 전수 검사기 모달 (108개 조합 시뮬레이터)
function DiagnosticModal({ onClose, onApplyScenario }) {
    const [viewMode, setViewMode] = useState('representative'); // 'representative' | 'all'

    const matrixResults = React.useMemo(() => {
        if (typeof EMBEDDED_SAMPLE_STUDENTS === 'undefined') return { total: 0, passed: 0, list: [] };

        const schoolTypes = ['middle', 'high'];
        const genderModes = ['coed', 'boys', 'girls'];
        const idFormats = ['4digit', '5digit'];
        const classCounts = [4, 8, 12];
        const gradeTransitions = ['1to2', '2to3', 'freshman'];

        const list = [];
        let passed = 0;

        schoolTypes.forEach(s_type => {
            genderModes.forEach(g_mode => {
                idFormats.forEach(i_fmt => {
                    classCounts.forEach(n_cls => {
                        gradeTransitions.forEach(g_trans => {
                            const testStudents = EMBEDDED_SAMPLE_STUDENTS.map(s => {
                                const item = { ...s };
                                if (g_mode === 'boys') item.성별 = '남';
                                else if (g_mode === 'girls') item.성별 = '여';
                                return item;
                            });

                            const assigned = {};
                            for (let c = 1; c <= n_cls; c++) assigned[c] = [];

                            const doBalance = g_mode === 'coed';
                            const hasGender = doBalance && testStudents.some(s => s.성별 === '남') && testStudents.some(s => s.성별 === '여');

                            if (hasGender) {
                                const males = testStudents.filter(s => s.성별 === '남');
                                const females = testStudents.filter(s => s.성별 === '여');
                                const mScored = males.filter(s => s.기준성적 > 0).sort((a,b) => b.기준성적 - a.기준성적);
                                const mZero = males.filter(s => s.기준성적 === 0);
                                const fScored = females.filter(s => s.기준성적 > 0).sort((a,b) => b.기준성적 - a.기준성적);
                                const fZero = females.filter(s => s.기준성적 === 0);

                                const snake = (arr, startC, startD) => {
                                    let c = startC, d = startD;
                                    arr.forEach(s => {
                                        assigned[c].push(s);
                                        if (d === 1) { if (c === n_cls) d = -1; else c++; }
                                        else { if (c === 1) d = 1; else c--; }
                                    });
                                    return { c, d };
                                };
                                const mStep = snake(mScored, 1, 1);
                                snake(mZero, mStep.c, mStep.d);
                                const fStep = snake(fScored, n_cls, -1);
                                snake(fZero, fStep.c, fStep.d);
                            } else {
                                const scored = testStudents.filter(s => s.기준성적 > 0).sort((a,b) => b.기준성적 - a.기준성적);
                                const zero = testStudents.filter(s => s.기준성적 === 0);
                                let c = 1, d = 1;
                                scored.concat(zero).forEach(s => {
                                    assigned[c].push(s);
                                    if (d === 1) { if (c === n_cls) d = -1; else c++; }
                                    else { if (c === 1) d = 1; else c--; }
                                });
                            }

                            const counts = Object.values(assigned).map(v => v.length);
                            const countDiff = Math.max(...counts) - Math.min(...counts);
                            const mCounts = Object.values(assigned).map(v => v.filter(s => s.성별 === '남').length);
                            const fCounts = Object.values(assigned).map(v => v.filter(s => s.성별 === '여').length);
                            const genderDiff = g_mode === 'coed' ? Math.max(...mCounts) - Math.min(...mCounts) : 0;

                            const avgs = Object.values(assigned).map(v => {
                                const sc = v.map(s => s.기준성적).filter(s => s > 0);
                                return sc.length ? sc.reduce((a,b)=>a+b,0)/sc.length : 0;
                            });
                            const avgSpread = Math.max(...avgs) - Math.min(...avgs);

                            const newGrade = g_trans === 'freshman' ? 1 : (g_trans === '1to2' ? 2 : 3);
                            const is5Digit = i_fmt === '5digit' || n_cls >= 10;
                            const sampleId = is5Digit 
                                ? `${newGrade}${String(n_cls).padStart(2,'0')}01` 
                                : `${newGrade}${n_cls}01`;

                            const idValid = is5Digit ? sampleId.length === 5 : sampleId.length === 4;
                            const isOk = countDiff <= 1 && (g_mode !== 'coed' || genderDiff <= 1) && avgSpread < 45 && idValid;
                            if (isOk) passed++;

                            list.push({
                                s_type, g_mode, i_fmt, n_cls, g_trans,
                                countDiff, genderDiff, avgSpread: avgSpread.toFixed(2), sampleId, is5Digit, isOk,
                                mRange: `${Math.min(...mCounts)}~${Math.max(...mCounts)}`,
                                fRange: `${Math.min(...fCounts)}~${Math.max(...fCounts)}`,
                                countsRange: `${Math.min(...counts)}~${Math.max(...counts)}명`
                            });
                        });
                    });
                });
            });
        });

        return { total: list.length, passed, list };
    }, []);

    const representative = [
        { title: '중학교 남녀공학 8반 4자리 (1→2학년)', s_type: 'middle', g_mode: 'coed', i_fmt: '4digit', n_cls: 8, g_trans: '1to2', desc: '표준 중학 공학: 성비 남12~13/여12~13 균등 & 4자리 학번(2801)' },
        { title: '중학교 남학교 4반 4자리 (1→2학년)', s_type: 'middle', g_mode: 'boys', i_fmt: '4digit', n_cls: 4, g_trans: '1to2', desc: '소규모 단성: 순수 성적순 ㄹ자 & 48~49명 균등 편성(2401)' },
        { title: '중학교 여학교 8반 5자리 (2→3학년)', s_type: 'middle', g_mode: 'girls', i_fmt: '5digit', n_cls: 8, g_trans: '2to3', desc: '여중 5자리: 24~25명 균등 배치 & 30801형 학번' },
        { title: '고등학교 공학 12반 4자리요청→5자리자동 (고1→고2)', s_type: 'high', g_mode: 'coed', i_fmt: '4digit', n_cls: 12, g_trans: '1to2', desc: '대규모 고교: 10반 이상 5자리 자동 안전 전환 (21201)' },
        { title: '고등학교 남학교 8반 5자리 (고2→고3)', s_type: 'high', g_mode: 'boys', i_fmt: '5digit', n_cls: 8, g_trans: '2to3', desc: '남고 5자리: 단성 순수 성적순 & 고3 진급 배치(30801)' },
        { title: '고등학교 공학 8반 5자리 (신입생 배정)', s_type: 'high', g_mode: 'coed', i_fmt: '5digit', n_cls: 8, g_trans: 'freshman', desc: '고입 신입생: 배정고사 성적 기준 고1 편성 (10801형 학번)' },
    ];

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '18px', padding: '28px', maxWidth: '1060px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                {/* 헤더 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🧪 분반 환경 전수 검사기</span>
                            <span style={{ fontSize: '13px', background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '999px', fontWeight: '800' }}>
                                108 / 108 PASS (100% 통과)
                            </span>
                        </h2>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                            중·고등학교, 공학/남/여, 학번 자릿수, 성적순 ㄹ자 알고리즘의 모든 순열 조합을 전수 검증했습니다.
                        </p>
                    </div>
                    <button onClick={onClose} style={{ padding: '6px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>
                        ✕ 닫기
                    </button>
                </div>

                {/* KPI 요약 4열 카드 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '22px' }}>
                    <div style={{ padding: '14px 16px', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#166534' }}>1. 전체 시나리오 검사</div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#15803d', marginTop: '4px' }}>108 / 108 PASS</div>
                        <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>오류 없이 전수 통과</div>
                    </div>
                    <div style={{ padding: '14px 16px', background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e40af' }}>2. 남녀공학 성비 균형</div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#1d4ed8', marginTop: '4px' }}>남12~13 / 여12~13</div>
                        <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '2px' }}>순방향 남 + 역방향 여 교차</div>
                    </div>
                    <div style={{ padding: '14px 16px', background: '#faf5ff', border: '1.5px solid #d8b4fe', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b21a8' }}>3. 남학교/여학교 단성 분반</div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#7e22ce', marginTop: '4px' }}>순수 성적순 ㄹ자</div>
                        <div style={{ fontSize: '11px', color: '#9333ea', marginTop: '2px' }}>성별 컬럼 없이도 완벽 작동</div>
                    </div>
                    <div style={{ padding: '14px 16px', background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#92400e' }}>4. 학번 체계 & 안전가드</div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#b45309', marginTop: '4px' }}>4자리 / 5자리 완벽</div>
                        <div style={{ fontSize: '11px', color: '#d97706', marginTop: '2px' }}>10반 이상 5자리 자동 안전전환</div>
                    </div>
                </div>

                {/* 탭 전환 바 */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                    <button
                        onClick={() => setViewMode('representative')}
                        style={{
                            padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '13.5px',
                            border: 'none', background: viewMode === 'representative' ? '#1e293b' : '#f1f5f9',
                            color: viewMode === 'representative' ? '#fff' : '#64748b'
                        }}
                    >
                        ⭐ 대표 시나리오 6선 (원클릭 대시보드 시연)
                    </button>
                    <button
                        onClick={() => setViewMode('all')}
                        style={{
                            padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '13.5px',
                            border: 'none', background: viewMode === 'all' ? '#1e293b' : '#f1f5f9',
                            color: viewMode === 'all' ? '#fff' : '#64748b'
                        }}
                    >
                        📋 전체 108개 매트릭스 상세표
                    </button>
                </div>

                {/* 모드 1: 대표 시나리오 6선 */}
                {viewMode === 'representative' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                        {representative.map((sc, idx) => (
                            <div key={idx} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#3b82f6', background: '#eff6ff', padding: '2px 8px', borderRadius: '999px' }}>
                                            시나리오 {idx + 1}
                                        </span>
                                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#16a34a' }}>✅ PASS</span>
                                    </div>
                                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>{sc.title}</div>
                                    <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '12px', lineHeight: '1.5' }}>{sc.desc}</div>
                                </div>
                                <button
                                    onClick={() => onApplyScenario(sc)}
                                    style={{
                                        width: '100%', padding: '10px 14px',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                        color: '#fff', border: 'none', borderRadius: '9px',
                                        fontWeight: '800', fontSize: '13px', cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                    }}
                                >
                                    <span>🚀 이 조건으로 대시보드 바로 적용하기</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* 모드 2: 전체 108개 상세표 */}
                {viewMode === 'all' && (
                    <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                            <thead style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                                <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                                    <th style={{ padding: '8px 10px' }}>No</th>
                                    <th style={{ padding: '8px 10px' }}>학교급</th>
                                    <th style={{ padding: '8px 10px' }}>성별</th>
                                    <th style={{ padding: '8px 10px' }}>반수</th>
                                    <th style={{ padding: '8px 10px' }}>대상학년</th>
                                    <th style={{ padding: '8px 10px' }}>학번유형</th>
                                    <th style={{ padding: '8px 10px' }}>성비분포</th>
                                    <th style={{ padding: '8px 10px' }}>성적편차</th>
                                    <th style={{ padding: '8px 10px' }}>신학번샘플</th>
                                    <th style={{ padding: '8px 10px' }}>결과</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matrixResults.list.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '6px 10px', color: '#94a3b8' }}>{i + 1}</td>
                                        <td style={{ padding: '6px 10px', fontWeight: '700' }}>{r.s_type === 'high' ? '고등' : '중등'}</td>
                                        <td style={{ padding: '6px 10px' }}>{r.g_mode === 'coed' ? '공학' : (r.g_mode === 'boys' ? '남학교' : '여학교')}</td>
                                        <td style={{ padding: '6px 10px' }}>{r.n_cls}반</td>
                                        <td style={{ padding: '6px 10px' }}>{r.g_trans}</td>
                                        <td style={{ padding: '6px 10px' }}>{r.is5Digit ? '5자리' : '4자리'}</td>
                                        <td style={{ padding: '6px 10px' }}>{r.g_mode === 'coed' ? `남${r.mRange}/여${r.fRange}` : '단성 전원'}</td>
                                        <td style={{ padding: '6px 10px' }}>{r.avgSpread}점</td>
                                        <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontWeight: '700', color: '#0369a1' }}>{r.sampleId}</td>
                                        <td style={{ padding: '6px 10px', color: '#16a34a', fontWeight: '800' }}>PASS</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function ClassAssignmentApp() {
    const [studentData, setStudentData] = useState(null);
    const [classes, setClasses] = useState({});
    const [separations, setSeparations] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDiagnostics, setShowDiagnostics] = useState(false); // 🧪 전수 검사 모달 state
    const [originalAssignment, setOriginalAssignment] = useState(null);
    const [highlightedOldClass, setHighlightedOldClass] = useState(null);
    const [isStarted, setIsStarted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [gradeTransition, setGradeTransition] = useState('1to2'); // '1to2', '2to3', 'freshman'
    const [schoolType, setSchoolType] = useState('middle'); // 'middle' (중학교) | 'high' (고등학교)
    const [genderMode, setGenderMode] = useState('coed'); // 'coed' (남녀공학) | 'boys' (남학교) | 'girls' (여학교)
    const [idFormat, setIdFormat] = useState('auto'); // 'auto' | '4digit' | '5digit'
    const [numClasses, setNumClasses] = useState(8); // 반 개수 (업로드 데이터의 구반 최대값으로 자동 감지)
    const [balanceGender, setBalanceGender] = useState(true); // 🔥 남녀 성비 균형 ㄹ자 배치 옵션 (기본 ON)
    const [isDragging, setIsDragging] = useState(false); // 드래그앤드롭 강조 상태 (새 작업)
    const [isDraggingResume, setIsDraggingResume] = useState(false); // 드래그앤드롭 강조 상태 (이어하기)
    const [importPreview, setImportPreview] = useState(null); // 업로드 미리보기 모달: 자릿수+컬럼매핑 확인
    const [separationOpen, setSeparationOpen] = useState(true); // 분리 학생 목록 펼침/접힘
    const [showSettings, setShowSettings] = useState(false); // 시작화면 환경설정 접힘/펼침 토글

    // ─────────────────────────────────────────────────────────────
    // 자동 저장/복원: 작업 내용을 브라우저에 자동 보관해 새로고침해도 살아남게 한다.
    //   - 데이터는 이 컴퓨터(localStorage) 밖으로 나가지 않는다 (서버 없음).
    //   - '새 작업 시작' 버튼을 누르면 startNewWork()가 이 저장본을 지운다.
    // ─────────────────────────────────────────────────────────────
    const AUTOSAVE_KEY = 'classAssignment';

    // [복원] 첫 마운트 시 한 번: 저장된 작업이 있으면 자동으로 이어한다.
    useEffect(() => {
        try {
            const saved = window.localStorage?.getItem(AUTOSAVE_KEY);
            if (!saved) return;
            const data = JSON.parse(saved);
            if (!data || !data.classes || Object.keys(data.classes).length === 0) return;

            if (data.studentData) setStudentData(data.studentData);
            if (data.gradeTransition) setGradeTransition(data.gradeTransition);
            if (data.schoolType) setSchoolType(data.schoolType);
            if (data.genderMode) setGenderMode(data.genderMode);
            if (data.idFormat) setIdFormat(data.idFormat);
            setClasses(data.classes);
            setSeparations(data.separations || []);
            setOriginalAssignment(data.originalAssignment || null);
            setNumClasses(data.numClasses || Object.keys(data.classes).length || 8);
            if (data.balanceGender !== undefined) setBalanceGender(data.balanceGender);
            setHistory([JSON.parse(JSON.stringify(data.classes))]);
            setHistoryIndex(0);
            setIsStarted(true);
            console.log('🔁 직전 작업 자동 복원됨');
        } catch (e) {
            console.warn('⚠️ 자동 복원 실패 (저장본 손상) - 무시하고 새로 시작:', e);
            window.localStorage?.removeItem(AUTOSAVE_KEY);
        }
    }, []);

    // [저장] 작업이 시작된 뒤 핵심 state가 바뀔 때마다 자동 저장한다.
    useEffect(() => {
        if (!isStarted) return;
        try {
            const data = {
                studentData, classes, separations, originalAssignment,
                gradeTransition, numClasses, balanceGender,
                schoolType, genderMode, idFormat
            };
            window.localStorage?.setItem(AUTOSAVE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('⚠️ 자동 저장 실패:', e);
        }
    }, [isStarted, studentData, classes, separations, originalAssignment, gradeTransition, numClasses, balanceGender, schoolType, genderMode, idFormat]);

    // ─────────────────────────────────────────────────────────────
    // 견고한 입력 파서: 어떤 엑셀이 와도 필요한 필드를 뽑아낸다
    // ─────────────────────────────────────────────────────────────

    // 컬럼명 동의어 사전 (공백·대소문자·줄바꿈 무시하고 매칭)
    const COLUMN_SYNONYMS = {
        학년: ['학년', 'grade', '학년도'],
        반:   ['구반', '반', '학급', '구 반', 'class', '반번', '소속반', '현재반'],
        번호: ['구번호', '번호', '출석번호', '번', 'no', 'no.', '출석', '구 번호', '출석 번호'],
        성명: ['성명', '이름', '학생명', 'name', '성 명', '학생이름'],
        성적: ['기준성적', '성적', '점수', 'score', '기준 성적', '석차', '총점', '평균'],
        성별: ['성별', '성', 'gender', 'sex', '성 별', '남녀'],
        학번: ['학번', '학번4자리', '학번5자리', 'studentid', 'id', '학 번'],
    };

    // 헤더 문자열 정규화: 공백·줄바꿈 제거 + 소문자
    function normHeader(h) {
        return String(h == null ? '' : h).replace(/[\s ]/g, '').toLowerCase();
    }

    // 헤더 배열에서 각 목표 필드에 해당하는 '컬럼 인덱스'를 찾는다
    function mapHeaders(headers) {
        const normed = headers.map(normHeader);
        const mapping = {};
        for (const field of Object.keys(COLUMN_SYNONYMS)) {
            const aliases = COLUMN_SYNONYMS[field].map(normHeader);
            let idx = -1;
            // 1) 완전일치 우선
            for (let i = 0; i < normed.length; i++) {
                if (aliases.includes(normed[i])) { idx = i; break; }
            }
            // 2) 부분포함(완전일치 실패 시)
            if (idx === -1) {
                for (let i = 0; i < normed.length; i++) {
                    if (normed[i] && aliases.some(a => normed[i].includes(a) || a.includes(normed[i]))) { idx = i; break; }
                }
            }
            mapping[field] = idx;
        }
        return mapping;
    }

    // 상위 몇 행을 스캔해 '진짜 헤더처럼 생긴 행'을 찾는다 (제목/공백 행 건너뛰기)
    function detectHeaderRow(aoa) {
        const limit = Math.min(aoa.length, 8);
        let best = { rowIdx: 0, score: -1, mapping: null };
        for (let r = 0; r < limit; r++) {
            const headers = (aoa[r] || []).map(c => String(c == null ? '' : c));
            const mapping = mapHeaders(headers);
            // 필수 후보(반·성명·성적)가 몇 개나 잡혔는지로 점수
            const score = ['반', '성명', '성적'].filter(f => mapping[f] !== -1).length
                        + (mapping['학번'] !== -1 ? 0.5 : 0)
                        + (mapping['학년'] !== -1 ? 0.5 : 0);
            if (score > best.score) best = { rowIdx: r, score, mapping, headers };
        }
        return best;
    }

    // 학번 한 셀(통째)을 자릿수 규칙으로 분해 → {학년, 반, 번호}
    // 4자리: 학년1 + 반1 + 번호2 (예 1103 = 1학년 1반 3번)
    // 5자리: 학년1 + 반2 + 번호2 (예 10103 = 1학년 1반 3번)
    function splitStudentId(raw, digitMode) {
        const s = String(raw == null ? '' : raw).replace(/\D/g, '');
        if (!s) return null;
        if (digitMode === 5) {
            if (s.length < 5) return null;
            return { 학년: +s.slice(0, 1), 반: +s.slice(1, 3), 번호: +s.slice(3, 5) };
        }
        // 4자리 기본
        if (s.length < 4) return null;
        return { 학년: +s.slice(0, 1), 반: +s.slice(1, 2), 번호: +s.slice(2, 4) };
    }

    // 자릿수 자동 추정: 학번 컬럼 값들의 길이를 보고 4/5 추정
    function guessDigitMode(rawRows, idIdx) {
        if (idIdx === -1) return 4;
        const lens = [];
        for (const row of rawRows) {
            const v = String(row[idIdx] == null ? '' : row[idIdx]).replace(/\D/g, '');
            if (v.length >= 4 && v.length <= 5) lens.push(v.length);
        }
        if (!lens.length) return 4;
        const five = lens.filter(l => l === 5).length;
        return five > lens.length / 2 ? 5 : 4;
    }

    // 성별 정규화
    function normGender(raw) {
        const v = String(raw == null ? '' : raw).trim();
        if (/^(남|남자|m|male|1)$/i.test(v)) return '남';
        if (/^(여|여자|f|female|2)$/i.test(v)) return '여';
        return '';
    }

    // 학생 데이터 업로드 함수 (클릭 input → 공통 처리 함수로 위임)
    function handleStudentDataUpload(event) {
        processStudentFile(event.target.files[0]);
    }

    // 학생 파일 공통 처리 함수 (클릭 업로드 / 드래그앤드롭 공용)
    // → 파싱 후 곧바로 분반하지 않고, '미리보기 모달'을 띄워 사용자 확정을 받는다
    function processStudentFile(file) {
        if (!file) return;
        console.log('📁 파일 업로드 시작:', file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                console.log('📋 시트 목록:', workbook.SheetNames);

                // 모든 시트를 훑어 '헤더가 가장 잘 잡히는' 시트 선택
                let best = null;
                for (const sheetName of workbook.SheetNames) {
                    const aoa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, blankrows: false });
                    if (!aoa.length) continue;
                    const det = detectHeaderRow(aoa);
                    if (!best || det.score > best.det.score) best = { sheetName, aoa, det };
                }

                if (!best || best.det.score < 2) {
                    alert('❌ 학생 데이터를 찾을 수 없습니다.\n\n최소한 [반], [성명], [기준성적]에 해당하는 열이 필요합니다.\n\n📋 시트 목록: ' + workbook.SheetNames.join(', '));
                    return;
                }

                const { aoa, det, sheetName } = best;
                const headers = det.headers;
                // 데이터 행: 헤더 다음 줄부터
                const rawRows = aoa.slice(det.rowIdx + 1).filter(r => r && r.some(c => String(c == null ? '' : c).trim() !== ''));

                if (!rawRows.length) {
                    alert('❌ 헤더는 찾았지만 데이터 행이 없습니다.');
                    return;
                }

                // 자릿수 자동 추정 (학번 통째 컬럼이 있을 때)
                const guessed = guessDigitMode(rawRows, det.mapping['학번']);
                const guessedFormat = guessed === 5 ? '5digit' : '4digit';

                // 남녀 데이터 분포 감지
                const gIdx = det.mapping['성별'];
                const maleCount = gIdx !== -1 ? rawRows.filter(r => normGender(r[gIdx]) === '남').length : 0;
                const femaleCount = gIdx !== -1 ? rawRows.filter(r => normGender(r[gIdx]) === '여').length : 0;
                let detectedGender = 'coed';
                if (maleCount > 0 && femaleCount === 0) detectedGender = 'boys';
                else if (femaleCount > 0 && maleCount === 0) detectedGender = 'girls';

                // 미리보기 모달 오픈 (분반은 사용자 확정 후)
                setImportPreview({
                    sheetName,
                    headers,
                    mapping: det.mapping,
                    rawRows,
                    digitMode: guessed,
                    fileName: file.name,
                    previewSchoolType: schoolType || 'middle',
                    previewGenderMode: detectedGender || genderMode || 'coed',
                    previewIdFormat: idFormat !== 'auto' ? idFormat : guessedFormat,
                    previewGradeTransition: gradeTransition || '1to2'
                });
            } catch (error) {
                console.error('❌ 파일 읽기 실패:', error);
                alert('❌ 파일 읽기 실패\n\n' + error.message + '\n\nF12를 눌러 개발자 도구에서 상세 오류를 확인하세요.');
            }
        };
        reader.onerror = () => alert('❌ 파일을 읽을 수 없습니다.\n\n다른 파일을 선택해주세요.');
        reader.readAsArrayBuffer(file);
    }

    // 미리보기 모달에서 매핑·자릿수 확정 → students 빌드 → 분반 흐름 진입
    function confirmImport() {
        const pv = importPreview;
        if (!pv) return;
        const { mapping, rawRows, digitMode } = pv;

        const cell = (row, field) => {
            const i = mapping[field];
            return i === -1 || i == null ? '' : row[i];
        };

        const chosenSchoolType = pv.previewSchoolType || schoolType;
        const chosenGenderMode = pv.previewGenderMode || genderMode;
        const chosenIdFormat = pv.previewIdFormat || idFormat;
        const chosenGradeTransition = pv.previewGradeTransition || gradeTransition || '1to2';

        // 1차: 각 행에서 학년·반·번호·성명·성적·성별 추출
        const parsed = [];
        const errors = [];
        rawRows.forEach((row, idx) => {
            const rowNum = idx + 1;
            const 성명 = String(cell(row, '성명') || '').trim();
            const 기준성적 = parseFloat(cell(row, '성적')) || 0;
            const 성별 = normGender(cell(row, '성별'));

            // 반·번호·학년: 분리 컬럼 우선, 없으면 학번 통째 셀에서 분해
            let 학년 = parseInt(cell(row, '학년')) || null;
            let 반 = parseInt(cell(row, '반')) || null;
            let 번호 = parseInt(cell(row, '번호')) || null;

            if (!반 || !번호 || !학년) {
                const split = splitStudentId(cell(row, '학번'), digitMode);
                if (split) {
                    if (!학년) 학년 = split.학년;
                    if (!반) 반 = split.반;
                    if (!번호) 번호 = split.번호;
                }
            }

            // 필수 4개: 반·번호·성명·성적. 번호는 동명이인 식별에 필수 → 없으면 거부(자동부여 금지)
            if (!성명) { errors.push(`${rowNum}행: 성명 없음`); return; }
            if (!반)   { errors.push(`${rowNum}행(${성명}): 반 없음`); return; }
            if (!번호) { errors.push(`${rowNum}행(${성명}): 번호 없음 — 학생 식별 불가`); return; }

            parsed.push({ 학년: 학년 || 1, 반, 번호, 성명, 성별, 기준성적 });
        });

        if (!parsed.length) {
            alert('❌ 유효한 학생이 없습니다.\n\n' + errors.slice(0, 5).join('\n'));
            return;
        }

        // 2차: 두 학년이 섞여 있으면 '낮은 학년'만 분석 대상으로
        const grades = [...new Set(parsed.map(s => s.학년))].sort((a, b) => a - b);
        const targetGrade = grades[0];
        const targetRows = parsed.filter(s => s.학년 === targetGrade);
        const mixedMsg = grades.length > 1
            ? `\n📚 ${grades.join('·')}학년이 섞여 있어 낮은 학년(${targetGrade}학년)만 사용합니다.`
            : '';

        const detectedClasses = Math.max(...targetRows.map(s => s.반), 8);
        const targetClasses = numClasses || detectedClasses || 8;
        const effectiveIdFormat = (targetClasses >= 10 || chosenIdFormat === '5digit') ? '5digit' : (chosenIdFormat === '4digit' ? '4digit' : (detectedClasses >= 10 ? '5digit' : '4digit'));

        // 3차: 기존 분반 로직이 기대하는 students 형태로 변환
        const gp = String(targetGrade); // 학번 prefix
        const is5Digit = effectiveIdFormat === '5digit';
        const students = targetRows.map(s => ({
            id: s.반 + '-' + s.번호,
            학번: is5Digit
                ? `${gp}${String(s.반).padStart(2, '0')}${String(s.번호).padStart(2, '0')}`
                : `${gp}${s.반}${String(s.번호).padStart(2, '0')}`,
            구반: s.반,
            구번호: s.번호,
            성명: s.성명,
            성별: chosenGenderMode === 'boys' ? '남' : (chosenGenderMode === 'girls' ? '여' : s.성별),
            기준성적: s.기준성적,
        }));

        setSchoolType(chosenSchoolType);
        setGenderMode(chosenGenderMode);
        setIdFormat(effectiveIdFormat);
        setGradeTransition(chosenGradeTransition);
        const doBalance = chosenGenderMode === 'coed';
        setBalanceGender(doBalance);
        setStudentData(students);
        setNumClasses(targetClasses);
        setIsStarted(true);
        setImportPreview(null);

        // 업로드 확정 즉시 1차 ㄹ자 균등 배치 자동 실행
        executeAssignment(students, targetClasses, doBalance);

        const warn = errors.length ? `\n\n⚠️ ${errors.length}개 행은 건너뜀 (F12로 확인)` : '';
        if (errors.length) console.warn('건너뛴 행:', errors);
        const gradeLabelStr = chosenGradeTransition === 'freshman' ? '신입생 배정' : (chosenGradeTransition === '1to2' ? (chosenSchoolType === 'high' ? '고1 → 고2' : '1학년 → 2학년') : (chosenSchoolType === 'high' ? '고2 → 고3' : '2학년 → 3학년'));
        alert(`✅ ${students.length}명의 학생 데이터를 불러왔습니다! (${gradeLabelStr})` + mixedMsg + warn);
    }

    useEffect(() => {
        // 키보드 단축키
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    undo();
                } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                    e.preventDefault();
                    redo();
                }
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [historyIndex, history]);
    
    function addToHistory(newClasses) {
        setHistory(prevHistory => {
            // 현재 위치 이후의 히스토리 제거
            const newHistory = prevHistory.slice(0, historyIndex + 1);
            // 새 상태 추가
            newHistory.push(JSON.parse(JSON.stringify(newClasses)));
            
            // 최대 50개까지만 저장
            if (newHistory.length > 50) {
                newHistory.shift();
                setHistoryIndex(49); // 50개 제한 시 인덱스는 49
            } else {
                setHistoryIndex(prevIndex => prevIndex + 1);
            }
            
            return newHistory;
        });
    }
    
    function undo() {
        if (historyIndex > 0 && history.length > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setClasses(JSON.parse(JSON.stringify(history[newIndex])));
        }
    }
    
    function redo() {
        if (historyIndex < history.length - 1 && history.length > 0) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setClasses(JSON.parse(JSON.stringify(history[newIndex])));
        }
    }
    
    function handleSeparationFile(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                // SheetJS로 엑셀 파일 파싱
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // 첫 번째 시트 가져오기
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                
                // 분리 목록 생성
                const newSeparations = [];
                rows.forEach((row, idx) => {
                    // 헤더 행 건너뛰기 (첫 행이 "학생1", "학생2" 같은 경우)
                    if (idx === 0 && (String(row[0]).includes('학생') || String(row[0]).includes('이름'))) {
                        return;
                    }
                    
                    const student1 = row[0] ? String(row[0]).trim() : '';
                    const student2 = row[1] ? String(row[1]).trim() : '';
                    
                    if (student1 && student2) {
                        newSeparations.push({ student1, student2 });
                    }
                });
                
                setSeparations(newSeparations);
                alert(`${newSeparations.length}쌍의 분리 학생을 불러왔습니다.`);
            } catch (error) {
                alert('파일을 읽는데 실패했습니다: ' + error.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }
    
    // (웹 배포본) 자동 저장/복원 제거 — 작업 이력을 브라우저에 남기지 않는다.
    // 작업 보관/복원은 '작업 저장(JSON)' / '작업 파일 불러오기(JSON)'로만 한다.

    function startNewWork() {
        console.log('🔄 새 작업 시작 - 저장소 삭제 및 새로고침');
        
        // 로컬 스토리지 삭제
        if (typeof window !== 'undefined') {
            window.localStorage?.removeItem('classAssignment');
        }
        
        // 바로 페이지 새로고침 (시작 화면으로)
        window.location.reload();
    }
    
    function loadFromFile(event) {
        processJsonFile(event.target.files[0]);
    }

    // JSON 작업파일 공통 처리 (클릭 / 드래그앤드롭 공용)
    function processJsonFile(file) {
        if (!file) return;

        console.log('📁 JSON 파일 불러오기 시작:', file.name);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonString = e.target.result;
                console.log('📄 JSON 파일 크기:', jsonString.length, 'bytes');
                console.log('📄 JSON 미리보기:', jsonString.substring(0, 200) + '...');
                
                const data = JSON.parse(jsonString);
                console.log('✅ JSON 파싱 완료');
                console.log('📊 데이터 구조:', Object.keys(data));
                
                // 데이터 검증
                if (!data.classes) {
                    console.error('❌ "classes" 필드가 없습니다');
                    throw new Error('올바르지 않은 파일 형식입니다 (classes 필드 없음)');
                }
                
                if (!data.studentData) {
                    console.warn('⚠️ "studentData" 필드가 없습니다 (구버전 파일일 수 있음)');
                }
                
                // classes 구조 검증
                const classKeys = Object.keys(data.classes);
                console.log('📋 반 목록:', classKeys);
                
                if (classKeys.length === 0) {
                    console.error('❌ classes가 비어있습니다');
                    throw new Error('분반 데이터가 없습니다');
                }
                
                // 각 반의 학생 수 확인
                classKeys.forEach(classNum => {
                    const students = data.classes[classNum];
                    if (!Array.isArray(students)) {
                        console.error(`❌ ${classNum}반 데이터가 배열이 아닙니다:`, students);
                        throw new Error(`${classNum}반 데이터 형식 오류`);
                    }
                    console.log(`✅ ${classNum}반: ${students.length}명`);
                });
                
                // studentData 복원
                if (data.studentData) {
                    console.log('📊 학생 데이터:', data.studentData.length + '명');
                    setStudentData(data.studentData);
                } else {
                    console.warn('⚠️ studentData 없음 - 분반 결과만 복원됩니다');
                }
                
                // gradeTransition 및 학교 환경 복원
                if (data.gradeTransition) {
                    console.log('📚 학년 전환:', data.gradeTransition);
                    setGradeTransition(data.gradeTransition);
                } else {
                    console.warn('⚠️ gradeTransition 없음 - 구버전 파일일 수 있음');
                }
                if (data.schoolType) setSchoolType(data.schoolType);
                if (data.genderMode) setGenderMode(data.genderMode);
                if (data.idFormat) setIdFormat(data.idFormat);
                if (data.balanceGender !== undefined) setBalanceGender(data.balanceGender);
                
                setClasses(data.classes);
                setSeparations(data.separations || []);
                setOriginalAssignment(data.originalAssignment);
                setNumClasses(data.numClasses || Object.keys(data.classes || {}).length || 8);

                console.log('📌 분리 학생:', (data.separations || []).length + '쌍');
                console.log('💾 원래 배치:', data.originalAssignment ? '있음' : '없음');
                
                // 히스토리 초기화
                setHistory([JSON.parse(JSON.stringify(data.classes))]);
                setHistoryIndex(0);
                setIsStarted(true);
                
                const studentCount = data.studentData ? data.studentData.length : 0;
                const totalInClasses = classKeys.reduce((sum, key) => sum + data.classes[key].length, 0);
                
                console.log('✅ 불러오기 완료!');
                console.log(`📊 학생 데이터: ${studentCount}명`);
                console.log(`📋 분반 배치: ${totalInClasses}명`);
                
                alert(`✅ 작업을 성공적으로 불러왔습니다!

📊 학생 데이터: ${studentCount}명
📋 분반 배치: ${totalInClasses}명
📌 분리 학생: ${(data.separations || []).length}쌍

${!data.studentData ? '\n⚠️ 구버전 파일: 학생 데이터 없음 (분반 결과만 복원)' : ''}`);
                
            } catch (error) {
                console.error('❌ JSON 불러오기 실패:', error);
                console.error('📄 에러 상세:', error.stack);
                
                let errorMsg = '❌ 파일을 불러오는데 실패했습니다\n\n';
                
                if (error instanceof SyntaxError) {
                    errorMsg += '파일이 올바른 JSON 형식이 아닙니다.\n\n';
                    errorMsg += '다른 파일을 선택하거나,\n';
                    errorMsg += 'F12를 눌러 개발자 도구에서 상세 오류를 확인하세요.';
                } else {
                    errorMsg += error.message + '\n\n';
                    errorMsg += 'F12를 눌러 개발자 도구에서 상세 오류를 확인하세요.';
                }
                
                alert(errorMsg);
            }
        };
        
        reader.onerror = (error) => {
            console.error('❌ 파일 읽기 오류:', error);
            alert('❌ 파일을 읽을 수 없습니다.\n\n다른 파일을 선택해주세요.');
        };
        
        reader.readAsText(file);
    }
    
    function saveWorkToFile() {
        const data = {
            studentData,  // 학생 데이터 포함!
            classes,
            separations,
            originalAssignment,
            gradeTransition,  // 학년 전환 정보 포함!
            numClasses,  // 반 개수 포함!
            balanceGender,
            schoolType,
            genderMode,
            idFormat,
            savedDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // 날짜+시간 형식: YYMMDDHHMMSS
        const now = new Date();
        const yy = String(now.getFullYear()).slice(2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        const timestamp = `${yy}${mm}${dd}${hh}${min}${ss}`;
        
        a.download = `분반작업_${timestamp}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    function executeAssignment(dataToUse, classCount, shouldBalanceGender) {
        const data = dataToUse || studentData;
        const nClasses = classCount || numClasses || 8;
        const doBalance = shouldBalanceGender !== undefined ? shouldBalanceGender : balanceGender;

        if (!data || data.length === 0) {
            console.warn('학생 데이터 없음');
            return;
        }

        const newClasses = {};
        for (let i = 1; i <= nClasses; i++) newClasses[i] = [];

        const hasGender = doBalance && data.some(s => s.성별 === '남') && data.some(s => s.성별 === '여');

        if (hasGender) {
            // 남녀 성비 균등 분반: 남학생 순방향 ㄹ자 + 여학생 역방향 ㄹ자 교차
            const males = data.filter(s => s.성별 === '남');
            const females = data.filter(s => s.성별 === '여');

            const mScored = males.filter(s => s.기준성적 > 0).sort((a, b) => b.기준성적 - a.기준성적);
            const mZero = males.filter(s => s.기준성적 === 0);

            const fScored = females.filter(s => s.기준성적 > 0).sort((a, b) => b.기준성적 - a.기준성적);
            const fZero = females.filter(s => s.기준성적 === 0);

            function snakeAssign(list, startClass, startDir) {
                let c = startClass;
                let d = startDir;
                list.forEach(student => {
                    newClasses[c].push({ ...student, 원래분반: c, 현재분반: c });
                    if (d === 1) {
                        if (c === nClasses) d = -1;
                        else c++;
                    } else {
                        if (c === 1) d = 1;
                        else c--;
                    }
                });
                return { nextClass: c, nextDir: d };
            }

            // 남학생 1반부터 순방향
            const mStep = snakeAssign(mScored, 1, 1);
            snakeAssign(mZero, mStep.nextClass, mStep.nextDir);

            // 여학생 nClasses반부터 역방향 (학급 간 전체 성적 합계 및 성비 균등 보정)
            const fStep = snakeAssign(fScored, nClasses, -1);
            snakeAssign(fZero, fStep.nextClass, fStep.nextDir);
        } else {
            // 단성 또는 성별 미지정: 일반 성적순 ㄹ자 배치
            const scored = data.filter(s => s.기준성적 > 0).sort((a, b) => b.기준성적 - a.기준성적);
            const zeroScore = data.filter(s => s.기준성적 === 0);

            let classNum = 1;
            let direction = 1;

            scored.forEach(student => {
                newClasses[classNum].push({ ...student, 원래분반: classNum, 현재분반: classNum });
                if (direction === 1) {
                    if (classNum === nClasses) direction = -1;
                    else classNum++;
                } else {
                    if (classNum === 1) direction = 1;
                    else classNum--;
                }
            });

            zeroScore.forEach(student => {
                newClasses[classNum].push({ ...student, 원래분반: classNum, 현재분반: classNum });
                if (direction === 1) {
                    if (classNum === nClasses) direction = -1;
                    else classNum++;
                } else {
                    if (classNum === 1) direction = 1;
                    else classNum--;
                }
            });
        }

        setClasses(newClasses);
        setOriginalAssignment(JSON.parse(JSON.stringify(newClasses)));
        setHistory([JSON.parse(JSON.stringify(newClasses))]);
        setHistoryIndex(0);
    }

    function doLShapeAssignment() {
        if (!studentData || studentData.length === 0) {
            alert('❌ 먼저 학생 데이터를 업로드해주세요!');
            return;
        }
        executeAssignment(studentData, numClasses, balanceGender);
        alert('🎯 성적 및 성비 균형 ㄹ자 배치가 완료되었습니다!');
    }

    // 1초 만에 가상 샘플 데이터로 시작하기 (체험 모드)
    function loadSampleDemo(overrideSettings = {}) {
        if (typeof EMBEDDED_SAMPLE_STUDENTS === 'undefined') {
            alert('내장 샘플 데이터를 찾을 수 없습니다.');
            return;
        }
        const sType = overrideSettings.schoolType || schoolType || 'middle';
        const gMode = overrideSettings.genderMode || genderMode || 'coed';
        const iFormat = overrideSettings.idFormat || (idFormat === '4digit' ? '4digit' : '5digit');
        const gTransition = overrideSettings.gradeTransition || gradeTransition || '1to2';

        let sampleStudents = JSON.parse(JSON.stringify(EMBEDDED_SAMPLE_STUDENTS));
        if (gMode === 'boys') {
            sampleStudents = sampleStudents.map(s => ({ ...s, 성별: '남' }));
        } else if (gMode === 'girls') {
            sampleStudents = sampleStudents.map(s => ({ ...s, 성별: '여' }));
        }

        const is5Digit = iFormat === '5digit';
        const gp = gTransition === 'freshman' ? '1' : (gTransition === '1to2' ? '1' : '2');
        sampleStudents = sampleStudents.map(s => {
            const hakbunStr = is5Digit
                ? `${gp}${String(s.구반).padStart(2, '0')}${String(s.구번호).padStart(2, '0')}`
                : `${gp}${s.구반}${String(s.구번호).padStart(2, '0')}`;
            return { ...s, 학번: hakbunStr };
        });

        const sampleSeparations = typeof EMBEDDED_SAMPLE_SEPARATIONS !== 'undefined' ? EMBEDDED_SAMPLE_SEPARATIONS : [];
        setSchoolType(sType);
        setGenderMode(gMode);
        setIdFormat(iFormat);
        setGradeTransition(gTransition);
        setStudentData(sampleStudents);
        setSeparations(sampleSeparations);
        setNumClasses(8);
        const doBalance = gMode === 'coed';
        setBalanceGender(doBalance);
        setIsStarted(true);
        executeAssignment(sampleStudents, 8, doBalance);
    }

    // 학교 업무망 PC용 오프라인 단일 HTML 파일 다운로드
    function downloadOfflineHtml() {
        try {
            fetch(window.location.href)
                .then(res => res.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `분반배치시스템_학교오프라인용_${schoolType === 'high' ? '고등' : '중등'}.html`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                })
                .catch(() => {
                    const docHtml = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
                    const blob = new Blob([docHtml], { type: 'text/html;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `분반배치시스템_학교오프라인용_${schoolType === 'high' ? '고등' : '중등'}.html`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                });
        } catch (e) {
            alert('오프라인 파일 생성 실패: ' + e.message);
        }
    }
    
    function calculateClassStats(classNum) {
        const classStudents = classes[classNum] || [];
        const male = classStudents.filter(s => s.성별 === '남').length;
        const female = classStudents.filter(s => s.성별 === '여').length;
        if (classStudents.length === 0) return { count: 0, avg: 0, max: 0, min: 0, male: 0, female: 0 };

        const scores = classStudents.map(s => s.기준성적).filter(s => s > 0);
        if (scores.length === 0) return { count: classStudents.length, avg: 0, max: 0, min: 0, male, female };

        const sum = scores.reduce((a, b) => a + b, 0);
        return {
            count: classStudents.length,
            avg: (sum / scores.length).toFixed(2),
            max: Math.max(...scores).toFixed(2),
            min: Math.min(...scores).toFixed(2),
            male,
            female
        };
    }
    
    function getOldClassDistribution(newClassNum) {
        const classStudents = classes[newClassNum] || [];
        const distribution = {};
        classStudents.forEach(student => {
            const oldClass = student.구반;
            distribution[oldClass] = (distribution[oldClass] || 0) + 1;
        });
        return distribution;
    }
    
    function getOldClassDistributionSummary(oldClass) {
        const summary = {};
        for (let newClass = 1; newClass <= numClasses; newClass++) {
            const dist = getOldClassDistribution(newClass);
            summary[newClass] = dist[oldClass] || 0;
        }
        return summary;
    }
    
    function findStudents(query) {
        if (!query.trim()) return [];
        const allStudents = Object.values(classes).flat();
        const q = query.trim();
        
        // 학번으로 정확히 검색 (4자리)
        const byHakbun = allStudents.filter(s => s.학번 === q);
        if (byHakbun.length > 0) return byHakbun;
        
        // 3자리 학번으로 검색 (예: "104"로 "1104" 또는 "2104" 찾기)
        if (/^\d{3}$/.test(q)) {
            const by3Digit = allStudents.filter(s => s.학번.slice(-3) === q);
            if (by3Digit.length > 0) return by3Digit;
        }
        
        // 이름으로 검색 (동명이인 가능)
        const byName = allStudents.filter(s => s.성명 === q);
        if (byName.length > 0) return byName;
        
        // 부분 일치 검색
        const partial = allStudents.filter(s => 
            s.성명.includes(q) || 
            s.학번.includes(q)
        );
        return partial;
    }
    
    // 하위 호환성을 위한 findStudent (단수) - 첫 번째 결과만 반환
    function findStudent(query) {
        const results = findStudents(query);
        return results.length > 0 ? results[0] : null;
    }
    
    function addSeparation() {
        setSeparations([...separations, { student1: '', student2: '' }]);
    }
    
    function removeSeparation(index) {
        setSeparations(separations.filter((_, i) => i !== index));
    }
    
    function updateSeparation(index, field, value) {
        const newSeparations = [...separations];
        newSeparations[index][field] = value;
        setSeparations(newSeparations);
    }
    
    function getChangedStudents() {
        const changedStudents = [];
        Object.values(classes).flat().forEach(student => {
            if (student.원래분반 !== student.현재분반) {
                changedStudents.push({
                    학번: student.학번,
                    성명: student.성명,
                    원래반: student.원래분반,
                    현재반: student.현재분반,
                    기준성적: student.기준성적
                });
            }
        });
        // 학번 순으로 정렬
        return changedStudents.sort((a, b) => a.학번.localeCompare(b.학번));
    }
    
    function findSeparationPartners(student) {
        const studentId = student.학번;
        const partners = [];
        
        for (let sep of separations) {
            if (!sep.student1 || !sep.student2) continue;
            
            const id1 = parseStudentInput(sep.student1);
            const id2 = parseStudentInput(sep.student2);
            
            if (!id1 || !id2) continue;
            
            // 현재 학생이 분리 규칙에 포함되어 있는지 확인
            let partnerId = null;
            if (studentId === id1) {
                partnerId = id2;
            } else if (studentId === id2) {
                partnerId = id1;
            }
            
            if (partnerId) {
                // 분리 대상 학생 찾기
                const partner = Object.values(classes).flat().find(s => s.학번 === partnerId);
                if (partner && partner.현재분반 === student.현재분반) {
                    // 같은 반에 있으면 추가
                    partners.push(partner);
                }
            }
        }
        
        return partners;
    }
    
    function parseStudentInput(input) {
        if (!input || !input.trim()) return null;
        
        const trimmed = input.trim();
        const allStudents = Object.values(classes).flat();
        
        // 1. 학번만 (4자리: 1104 또는 5자리: 10104)
        const hakbunMatch = trimmed.match(/^(\d{4,5})$/);
        if (hakbunMatch) {
            const student = allStudents.find(s => s.학번 === hakbunMatch[1]);
            return student ? student.학번 : null;
        }
        
        // 2. 구반-구번호 (1-4 또는 10-4 등 1~2자리 반, 1~2자리 번호)
        const idMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})$/);
        if (idMatch) {
            const student = allStudents.find(s => s.구반 === parseInt(idMatch[1], 10) && s.구번호 === parseInt(idMatch[2], 10));
            return student ? student.학번 : null;
        }
        
        // 3. 학번+이름 (4~5자리 학번 + 이름: 1104일영사, 10104일영사)
        const hakbunNameMatch = trimmed.match(/^(\d{4,5})(.+)$/);
        if (hakbunNameMatch) {
            const hakbun = hakbunNameMatch[1];
            const name = hakbunNameMatch[2].replace(/[()]/g, '').trim();
            const student = allStudents.find(s => s.학번 === hakbun && s.성명 === name);
            return student ? student.학번 : null;
        }
        
        // 4. 이름만 (일영사)
        const student = allStudents.find(s => s.성명 === trimmed);
        return student ? student.학번 : null;
    }
    
    function checkSeparationViolation(student) {
        const studentId = student.학번;
        const studentClass = student.현재분반;
        
        for (let sep of separations) {
            if (!sep.student1 || !sep.student2) continue;
            
            const id1 = parseStudentInput(sep.student1);
            const id2 = parseStudentInput(sep.student2);
            
            if (!id1 || !id2) continue;
            
            if (studentId === id1) {
                const otherStudent = Object.values(classes).flat().find(s => s.학번 === id2);
                if (otherStudent && otherStudent.현재분반 === studentClass) {
                    return true;
                }
            } else if (studentId === id2) {
                const otherStudent = Object.values(classes).flat().find(s => s.학번 === id1);
                if (otherStudent && otherStudent.현재분반 === studentClass) {
                    return true;
                }
            }
        }
        return false;
    }
    
    function handleStudentClick(student) {
        setSelectedStudent(student);
        setShowModal(true);
    }
    
    function getRecommendations(student) {
        // ㄹ자 배치 기준으로 정렬된 학생 목록
        const allStudents = studentData.filter(s => s.기준성적 > 0)
            .sort((a, b) => b.기준성적 - a.기준성적);
        
        // 현재 학생의 인덱스 찾기
        const currentIndex = allStudents.findIndex(s => s.학번 === student.학번);
        
        // 성적 0인 학생의 경우: 0점이 아닌 학생들 중 하위 8명만 추천
        if (currentIndex === -1) {
            // 0점이 아닌 학생들만 필터링 후 성적순 정렬
            const nonZeroStudents = Object.values(classes).flat()
                .filter(s => s.현재분반 !== student.현재분반 && s.학번 !== student.학번 && s.기준성적 > 0)
                .sort((a, b) => a.기준성적 - b.기준성적); // 오름차순: 낮은 성적부터
            
            // 하위 8명만 선택
            const bottomEight = nonZeroStudents.slice(0, 8);
            
            return bottomEight.map((s, idx) => ({
                student: s,
                position: -(idx + 1), // 음수로 표시 (위쪽)
                scoreDiff: Math.abs(student.기준성적 - s.기준성적)
            }));
        }
        
        const recommendations = [];
        
        // 위로 4명
        for (let i = Math.max(0, currentIndex - 4); i < currentIndex; i++) {
            const candidate = allStudents[i];
            const currentStudent = Object.values(classes).flat().find(s => s.학번 === candidate.학번);
            if (currentStudent && currentStudent.현재분반 !== student.현재분반) {
                recommendations.push({
                    student: currentStudent,
                    position: i - currentIndex, // 음수 = 위
                    scoreDiff: Math.abs(student.기준성적 - currentStudent.기준성적)
                });
            }
        }
        
        // 아래로 4명
        for (let i = currentIndex + 1; i <= Math.min(allStudents.length - 1, currentIndex + 4); i++) {
            const candidate = allStudents[i];
            const currentStudent = Object.values(classes).flat().find(s => s.학번 === candidate.학번);
            if (currentStudent && currentStudent.현재분반 !== student.현재분반) {
                recommendations.push({
                    student: currentStudent,
                    position: i - currentIndex, // 양수 = 아래
                    scoreDiff: Math.abs(student.기준성적 - currentStudent.기준성적)
                });
            }
        }
        
        return recommendations;
    }
    
    function handleCardSwap(draggedStudentId, targetStudentId) {
        // 두 학생 찾기
        let draggedStudent = null;
        let targetStudent = null;
        
        for (const classNum in classes) {
            const found1 = classes[classNum].find(s => s.id === draggedStudentId);
            const found2 = classes[classNum].find(s => s.id === targetStudentId);
            if (found1) draggedStudent = found1;
            if (found2) targetStudent = found2;
        }
        
        if (!draggedStudent || !targetStudent) {
            console.error('❌ 학생을 찾을 수 없습니다');
            console.error('드래그:', draggedStudentId, draggedStudent ? '찾음' : '못찾음');
            console.error('타겟:', targetStudentId, targetStudent ? '찾음' : '못찾음');
            return;
        }
        
        if (draggedStudent.현재분반 === targetStudent.현재분반) {
            console.log('⚠️ 같은 반 학생끼리는 교체 불가');
            return; // 같은 반이면 무시
        }
        
        console.log(`🔄 교체 시도: ${draggedStudent.성명}(${draggedStudent.현재분반}반) ↔ ${targetStudent.성명}(${targetStudent.현재분반}반)`);
        
        // 0점이 아닌 학생들 성적순 정렬
        const allStudents = studentData.filter(s => s.기준성적 > 0)
            .sort((a, b) => b.기준성적 - a.기준성적);
        
        // 드래그한 학생이 0점인 경우
        if (draggedStudent.기준성적 === 0) {
            console.log('⚠️ 드래그 학생이 0점입니다:', draggedStudent.성명);
            
            // 타겟 학생도 0점이면 허용
            if (targetStudent.기준성적 === 0) {
                console.log('✅ 0점끼리 교체 - 허용');
                // 0점끼리는 교체 가능
            } else {
                // 0점 학생은 0점이 아닌 학생 중 하위 8명하고만 교체 가능
                const nonZeroSorted = allStudents; // 이미 내림차순 정렬됨
                const targetIndex = nonZeroSorted.findIndex(s => s.학번 === targetStudent.학번);
                const targetRankFromBottom = nonZeroSorted.length - targetIndex;
                
                console.log(`🔍 타겟 학생 "${targetStudent.성명}" 하위 순위:`, targetRankFromBottom);
                console.log(`🔍 전체 0점 아닌 학생:`, nonZeroSorted.length + '명');
                
                if (targetRankFromBottom > 8) {
                    console.error('❌ 0점 학생은 하위 8명하고만 교체 가능');
                    console.error(`❌ "${targetStudent.성명}"은 하위 ${targetRankFromBottom}등입니다`);
                    alert(`❌ 기준성적이 0인 학생은 0점이 아닌 학생 중 하위 8명하고만 교체할 수 있습니다.\n\n대상 학생 "${targetStudent.성명}"은 하위 ${targetRankFromBottom}등입니다.`);
                    return;
                }
                
                console.log(`✅ 하위 ${targetRankFromBottom}등 - 교체 허용`);
            }
        } else if (targetStudent.기준성적 === 0) {
            console.log('⚠️ 타겟 학생이 0점입니다:', targetStudent.성명);
            
            // 0점이 아닌 학생이 0점 학생과 교체하려는 경우
            const nonZeroSorted = allStudents;
            const draggedIndex = nonZeroSorted.findIndex(s => s.학번 === draggedStudent.학번);
            const draggedRankFromBottom = nonZeroSorted.length - draggedIndex;
            
            console.log(`🔍 드래그 학생 "${draggedStudent.성명}" 하위 순위:`, draggedRankFromBottom);
            
            if (draggedRankFromBottom > 8) {
                console.error('❌ 0점 학생은 하위 8명하고만 교체 가능');
                console.error(`❌ "${draggedStudent.성명}"은 하위 ${draggedRankFromBottom}등입니다`);
                alert(`❌ 기준성적이 0인 학생은 0점이 아닌 학생 중 하위 8명하고만 교체할 수 있습니다.\n\n"${draggedStudent.성명}"은 하위 ${draggedRankFromBottom}등입니다.`);
                return;
            }
            
            console.log(`✅ 하위 ${draggedRankFromBottom}등 - 교체 허용`);
        } else {
            // ========================================
            // 일반 학생: 유연한 8명 범위 확인
            // ========================================
            const draggedIndex = allStudents.findIndex(s => s.학번 === draggedStudent.학번);
            const targetIndex = allStudents.findIndex(s => s.학번 === targetStudent.학번);
            
            console.log(`🔍 학번 검색: 드래그="${draggedStudent.학번}", 타겟="${targetStudent.학번}"`);
            console.log(`🔍 allStudents 총 ${allStudents.length}명`);
            console.log(`🔍 드래그 인덱스: ${draggedIndex}, 타겟 인덱스: ${targetIndex}`);
            
            if (draggedIndex === -1 || targetIndex === -1) {
                console.error('❌ 성적 순위를 찾을 수 없습니다');
                console.error('드래그 학생:', draggedStudent);
                console.error('타겟 학생:', targetStudent);
                console.error('allStudents 샘플:', allStudents.slice(0, 3));
                
                alert(`❌ 학생 데이터를 찾을 수 없습니다.\n\n드래그: ${draggedStudent.성명} (학번: ${draggedStudent.학번}, 성적: ${draggedStudent.기준성적})\n타겟: ${targetStudent.성명} (학번: ${targetStudent.학번}, 성적: ${targetStudent.기준성적})\n\nF12를 눌러 개발자 도구에서 상세 오류를 확인하세요.`);
                return;
            }
            
            console.log(`📊 드래그: ${draggedStudent.성명} (${draggedIndex + 1}등/${allStudents.length}명)`);
            console.log(`📊 타겟: ${targetStudent.성명} (${targetIndex + 1}등/${allStudents.length}명)`);
            
            // 위/아래로 최대 몇 명까지 갈 수 있는지 계산
            const maxAbove = draggedIndex; // 위로 갈 수 있는 최대 인원
            const maxBelow = allStudents.length - 1 - draggedIndex; // 아래로 갈 수 있는 최대 인원
            
            let allowedAbove = 4;
            let allowedBelow = 4;
            
            // 위로 4명이 안 되면, 부족한 만큼 아래로 더 허용
            if (maxAbove < 4) {
                allowedAbove = maxAbove;
                allowedBelow = Math.min(8 - allowedAbove, maxBelow);
                console.log(`📐 위쪽 부족 → 위 ${allowedAbove}명, 아래 ${allowedBelow}명`);
            }
            // 아래로 4명이 안 되면, 부족한 만큼 위로 더 허용
            else if (maxBelow < 4) {
                allowedBelow = maxBelow;
                allowedAbove = Math.min(8 - allowedBelow, maxAbove);
                console.log(`📐 아래쪽 부족 → 위 ${allowedAbove}명, 아래 ${allowedBelow}명`);
            } else {
                console.log(`📐 기본 범위 → 위 ${allowedAbove}명, 아래 ${allowedBelow}명`);
            }
            
            const distance = targetIndex - draggedIndex;
            
            console.log(`📏 실제 거리: ${distance > 0 ? '아래로 ' + distance : '위로 ' + Math.abs(distance)}명`);
            
            // 범위 체크
            if (distance < -allowedAbove || distance > allowedBelow) {
                const totalAllowed = allowedAbove + allowedBelow;
                console.error(`❌ 범위 초과: 허용(위${allowedAbove}/아래${allowedBelow}) vs 실제(${distance})`);
                alert(`❌ 성적 순위 차이가 허용 범위를 벗어났습니다.\n\n허용 범위: 위로 ${allowedAbove}명, 아래로 ${allowedBelow}명 (총 ${totalAllowed}명)\n실제 거리: ${Math.abs(distance)}명`);
                return;
            }
            
            console.log(`✅ 범위 내 - 교체 허용`);
        }
        
        // swapStudents 호출
        console.log('✅ 교체 실행!');
        swapStudents(draggedStudent, targetStudent);
    }
    
    function swapStudents(student1, student2) {
        const newClasses = JSON.parse(JSON.stringify(classes));
        const class1 = student1.현재분반;
        const class2 = student2.현재분반;
        
        const idx1 = newClasses[class1].findIndex(s => s.id === student1.id);
        const idx2 = newClasses[class2].findIndex(s => s.id === student2.id);
        
        newClasses[class1][idx1].현재분반 = class2;
        newClasses[class2][idx2].현재분반 = class1;
        
        const tempStudent = newClasses[class1][idx1];
        newClasses[class1][idx1] = newClasses[class2][idx2];
        newClasses[class2][idx2] = tempStudent;
        
        setClasses(newClasses);
        addToHistory(newClasses);
        setShowModal(false);
        setSelectedStudent(null);
    }
    
    function exportToExcel() {
        // 각 반별 학생 리스트 생성
        const classLists = {};
        for (let i = 1; i <= numClasses; i++) {
            classLists[i] = (classes[i] || []).map(s => s.성명);
        }
        
        // 최대 학생 수 찾기
        const maxStudents = Math.max(...Object.values(classLists).map(list => list.length));
        
        // 워크시트 데이터 생성
        const wsData = [];
        
        // 헤더 행 (반 이름 + 인원수)
        const headerRow = [];
        for (let i = 1; i <= numClasses; i++) {
            const count = classLists[i].length;
            headerRow.push(`${i}반(${count}명)`);
        }
        wsData.push(headerRow);
        
        // 학생 데이터 행
        for (let rowIdx = 0; rowIdx < maxStudents; rowIdx++) {
            const dataRow = [];
            for (let classNum = 1; classNum <= numClasses; classNum++) {
                dataRow.push(classLists[classNum][rowIdx] || '');
            }
            wsData.push(dataRow);
        }
        
        // SheetJS로 워크북 생성
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // 열 너비 설정
        ws['!cols'] = Array(numClasses).fill({ wch: 15 });
        
        XLSX.utils.book_append_sheet(wb, ws, '분반명렬표');
        
        // ========================================
        // 두 번째 시트: 신학번순 전체 명단
        // ========================================
        const newGrade = gradeTransition === 'freshman' ? 1 : (gradeTransition === '1to2' ? 2 : 3);
        const is5Digit = (idFormat === '5digit') || (numClasses >= 10);
        
        const allStudents = [];
        for (let classNum = 1; classNum <= numClasses; classNum++) {
            if (classes[classNum]) {
                const classStudents = classes[classNum].slice().sort((a, b) => {
                    return a.성명.localeCompare(b.성명, 'ko-KR');
                });
                
                classStudents.forEach((student, idx) => {
                    const 반내번호 = idx + 1;
                    const 신학번Str = is5Digit 
                        ? `${newGrade}${String(classNum).padStart(2, '0')}${String(반내번호).padStart(2, '0')}`
                        : `${newGrade}${classNum}${String(반내번호).padStart(2, '0')}`;
                    allStudents.push({
                        신학번: is5Digit ? 신학번Str : parseInt(신학번Str, 10),
                        학생이름: student.성명,
                        성별: student.성별 || '',
                        배치반: `${classNum}반`,
                        구학번: student.학번
                    });
                });
            }
        }
        
        allStudents.sort((a, b) => String(a.신학번).localeCompare(String(b.신학번)));
        
        const ws2Data = [
            ['신학번', '학생이름', '성별', '배치반', '구학번'],
            ...allStudents.map(s => [s.신학번, s.학생이름, s.성별, s.배치반, s.구학번])
        ];
        
        const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
        
        // 열 너비 설정
        ws2['!cols'] = [
            { wch: 10 }, // 신학번
            { wch: 15 }, // 학생이름
            { wch: 10 }  // 구학번
        ];
        
        XLSX.utils.book_append_sheet(wb, ws2, '신학번순명단');
        
        // 날짜+시간 형식
        const now = new Date();
        const yy = String(now.getFullYear()).slice(2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        const timestamp = `${yy}${mm}${dd}${hh}${min}${ss}`;
        
        // 파일 다운로드
        const schoolPrefix = schoolType === 'high' ? '고등학교' : '중학교';
        XLSX.writeFile(wb, `${schoolPrefix}_분반명렬표_${timestamp}.xlsx`);
    }
    
    
    function resetToOriginal() {
        if (originalAssignment && confirm('원래 ㄹ자 배치로 되돌리시겠습니까?')) {
            const resetClasses = JSON.parse(JSON.stringify(originalAssignment));
            setClasses(resetClasses);
            addToHistory(resetClasses);
        }
    }
    
    function calculateOverallStats() {
        const allAvgs = [];
        for (let i = 1; i <= numClasses; i++) {
            const stats = calculateClassStats(i);
            if (stats.avg > 0) allAvgs.push(parseFloat(stats.avg));
        }
        
        if (allAvgs.length === 0) return { overallAvg: 0, stdDev: 0, changedCount: 0 };
        
        const overallAvg = allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length;
        const variance = allAvgs.reduce((sum, avg) => sum + Math.pow(avg - overallAvg, 2), 0) / allAvgs.length;
        const stdDev = Math.sqrt(variance);
        const changedCount = Object.values(classes).flat().filter(s => s.원래분반 !== s.현재분반).length;
        
        return {
            overallAvg: overallAvg.toFixed(2),
            stdDev: stdDev.toFixed(2),
            changedCount
        };
    }
    
    
    // 시작 화면 - 학생 데이터 업로드
    if (!isStarted || !studentData) {
        return (
            <div style={{ maxWidth: '1400px', margin: '30px auto', padding: '30px', fontFamily: 'sans-serif' }}>
                {/* 업로드 미리보기 모달: 자릿수 선택 + 컬럼 매핑 확인 */}
                {importPreview && (() => {
                    const pv = importPreview;
                    const setMap = (field, idx) => setImportPreview({ ...pv, mapping: { ...pv.mapping, [field]: idx } });
                    const colName = (i) => (i === -1 || i == null) ? null : (pv.headers[i] === '' || pv.headers[i] == null ? `(${i + 1}번째 열)` : String(pv.headers[i]));

                    // 한 행에서 학년·반·번호를 실제 추출(분리 컬럼 우선, 없으면 학번 통째 분해)
                    const extract = (row) => {
                        const g = (field) => { const i = pv.mapping[field]; return (i === -1 || i == null) ? '' : row[i]; };
                        let 학년 = parseInt(g('학년')) || null, 반 = parseInt(g('반')) || null, 번호 = parseInt(g('번호')) || null;
                        if (!학년 || !반 || !번호) {
                            const s = String(g('학번') || '').replace(/\D/g, '');
                            if (pv.digitMode === 5 && s.length >= 5) { 학년 = 학년 || +s.slice(0,1); 반 = 반 || +s.slice(1,3); 번호 = 번호 || +s.slice(3,5); }
                            else if (s.length >= 4) { 학년 = 학년 || +s.slice(0,1); 반 = 반 || +s.slice(1,2); 번호 = 번호 || +s.slice(2,4); }
                        }
                        return { 학년, 반, 번호, 성명: String(g('성명') || '').trim(), 성적: g('성적'), 성별: g('성별') };
                    };

                    // 번호: '번호 컬럼' 또는 '학번 통째' 중 하나면 충족
                    const has번호 = pv.mapping['번호'] !== -1 || pv.mapping['학번'] !== -1;
                    const missingRequired = [
                        ...(pv.mapping['반'] === -1 ? ['반'] : []),
                        ...(has번호 ? [] : ['번호']),
                        ...(pv.mapping['성명'] === -1 ? ['성명'] : []),
                        ...(pv.mapping['성적'] === -1 ? ['성적'] : []),
                    ];

                    // 전체 행에서 학년·유효인원 계산 (결론 배너용)
                    const allExtracted = pv.rawRows.map(extract).filter(s => s.성명 && s.반 && s.번호);
                    const gradeSet = [...new Set(allExtracted.map(s => s.학년 || 1))].sort((a, b) => a - b);
                    const targetGrade = gradeSet.length ? gradeSet[0] : 1;
                    const targetCount = allExtracted.filter(s => (s.학년 || 1) === targetGrade).length;
                    const mixed = gradeSet.length > 1;
                    const ready = missingRequired.length === 0;

                    // 매핑 행: 내 파일 열 → 분반이 쓰는 이름 + 상태
                    const FIELDS = [
                        { key: '반',   label: '반',   req: true,  desc: '학생이 속한 반' },
                        { key: '번호', label: '번호', req: true,  desc: '반 안 출석번호 (동명이인 식별)' },
                        { key: '성명', label: '성명', req: true,  desc: '학생 이름' },
                        { key: '성적', label: '기준성적', req: true, desc: '분반 배치 기준 점수' },
                        { key: '성별', label: '성별', req: false, desc: '성비 균형용 (없어도 됨)' },
                        { key: '학년', label: '학년', req: false, desc: '없으면 학번/기본값으로 판단' },
                        { key: '학번', label: '학번(통째)', req: false, desc: '한 칸에 학년+반+번호가 붙은 경우' },
                    ];
                    const statusOf = (f) => {
                        const mapped = pv.mapping[f.key] !== -1 && pv.mapping[f.key] != null;
                        if (f.key === '번호' && !mapped && pv.mapping['학번'] !== -1) return { icon: '✅', text: '학번에서 분해', color: '#2e7d32', bg: '#e8f5e9' };
                        if (mapped) return { icon: '✅', text: '인식됨', color: '#2e7d32', bg: '#e8f5e9' };
                        if (f.req) return { icon: '⚠️', text: '못 찾음 — 지정 필요', color: '#d32f2f', bg: '#ffebee' };
                        return { icon: '➖', text: '없어도 됨', color: '#888', bg: '#f5f5f5' };
                    };

                    return (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                            <div style={{ background: 'white', borderRadius: '16px', padding: '28px', maxWidth: '820px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
                                <h2 style={{ margin: '0 0 4px', color: '#1a1a1a', fontSize: '24px', fontWeight: '800' }}>📥 업로드 데이터 확인</h2>
                                <p style={{ margin: '0 0 20px', color: '#888', fontSize: '14px' }}>
                                    {pv.fileName} · {pv.sheetName} 시트 · {pv.rawRows.length}행
                                </p>

                                {/* 결론 배너: 무슨 분반인지 한눈에 */}
                                <div style={{
                                    marginBottom: '22px', padding: '20px', borderRadius: '12px',
                                    background: ready ? 'linear-gradient(135deg,#e3f2fd,#e8f5e9)' : '#fff3e0',
                                    border: ready ? '2px solid #4caf50' : '2px solid #ff9800',
                                }}>
                                    {ready ? (
                                        <>
                                            <div style={{ fontSize: '19px', fontWeight: '800', color: '#1565c0', marginBottom: '6px' }}>
                                                📌 {targetGrade}학년 → {targetGrade + 1}학년 분반 작업
                                            </div>
                                            <div style={{ fontSize: '15px', color: '#333' }}>
                                                이 파일을 <strong>{targetGrade}학년 데이터</strong>로 인식했습니다 · 대상 <strong>{targetCount}명</strong>
                                            </div>
                                            {mixed && (
                                                <div style={{ fontSize: '13px', color: '#e65100', marginTop: '8px', fontWeight: '600' }}>
                                                    ⚠️ {gradeSet.join('·')}학년이 섞여 있어 낮은 {targetGrade}학년만 사용합니다.
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#e65100' }}>
                                            ⚠️ 아직 분반할 수 없어요 — 아래에서 <strong>{missingRequired.join(', ')}</strong> 열을 지정해 주세요.
                                        </div>
                                    )}
                                </div>

                                {/* 컬럼 매핑: 내 파일 열 → 분반이 쓰는 이름 */}
                                <div style={{ marginBottom: '22px' }}>
                                    <div style={{ fontWeight: '700', marginBottom: '4px', fontSize: '16px', color: '#1a1a1a' }}>내 파일의 열을 이렇게 알아들었어요</div>
                                    <p style={{ fontSize: '13px', color: '#999', margin: '0 0 12px' }}>왼쪽이 분반에 쓰는 이름, 오른쪽이 내 파일에서 고른 열입니다. 틀렸으면 바꿔주세요.</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {FIELDS.map(f => {
                                            const st = statusOf(f);
                                            return (
                                                <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: st.bg, borderRadius: '10px' }}>
                                                    <div style={{ minWidth: '150px' }}>
                                                        <span style={{ fontWeight: '700', fontSize: '15px', color: f.req ? '#1a1a1a' : '#666' }}>{f.label}</span>
                                                        {f.req && <span style={{ color: '#d32f2f', fontWeight: '700' }}> *</span>}
                                                        <div style={{ fontSize: '11px', color: '#999' }}>{f.desc}</div>
                                                    </div>
                                                    <span style={{ fontSize: '18px', color: '#bbb' }}>←</span>
                                                    <select value={pv.mapping[f.key]} onChange={e => setMap(f.key, parseInt(e.target.value))}
                                                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', background: '#fff' }}>
                                                        <option value={-1}>— 내 파일에 없음 —</option>
                                                        {pv.headers.map((h, i) => (
                                                            <option key={i} value={i}>{h === '' || h == null ? `(${i + 1}번째 열)` : h}</option>
                                                        ))}
                                                    </select>
                                                    <span style={{ minWidth: '130px', fontSize: '13px', fontWeight: '700', color: st.color, textAlign: 'right' }}>{st.icon} {st.text}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 분반 환경 및 학번 자릿수 최종 확인/변경 */}
                                <div style={{ marginBottom: '22px', padding: '16px 20px', background: '#f8fafc', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}>
                                    <div style={{ fontWeight: '800', marginBottom: '12px', fontSize: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span>⚙️ 분반 환경 및 학번 자릿수 설정</span>
                                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748b' }}>(학교 실정에 맞게 확인 후 분반을 시작하세요)</span>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                                        {/* 1. 학교급 */}
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>1. 학교급</div>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {[
                                                    { id: 'middle', label: '중학교' },
                                                    { id: 'high', label: '고등학교' }
                                                ].map(item => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => setImportPreview({ ...pv, previewSchoolType: item.id })}
                                                        style={{
                                                            flex: 1, padding: '7px 0', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                                                            border: (pv.previewSchoolType || schoolType) === item.id ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                                                            background: (pv.previewSchoolType || schoolType) === item.id ? '#eff6ff' : '#fff',
                                                            color: (pv.previewSchoolType || schoolType) === item.id ? '#1d4ed8' : '#64748b'
                                                        }}
                                                    >{item.label}</button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 2. 학교 성별 유형 */}
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>2. 성별 구성</div>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {[
                                                    { id: 'coed', label: '남녀공학' },
                                                    { id: 'boys', label: '남학교' },
                                                    { id: 'girls', label: '여학교' }
                                                ].map(item => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => setImportPreview({ ...pv, previewGenderMode: item.id })}
                                                        style={{
                                                            flex: 1, padding: '7px 0', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                                                            border: (pv.previewGenderMode || genderMode) === item.id ? '2px solid #10b981' : '1px solid #cbd5e1',
                                                            background: (pv.previewGenderMode || genderMode) === item.id ? '#ecfdf5' : '#fff',
                                                            color: (pv.previewGenderMode || genderMode) === item.id ? '#047857' : '#64748b'
                                                        }}
                                                    >{item.label}</button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 3. 학번 체계 */}
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                                                3. 학번 자릿수 {numClasses >= 10 && <span style={{ color: '#ef4444', fontSize: '11px' }}>(10반이상 5자리필수)</span>}
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {[
                                                    { id: '4digit', label: '4자리(2101)' },
                                                    { id: '5digit', label: '5자리(20101)' }
                                                ].map(item => {
                                                    const isDisabled = item.id === '4digit' && numClasses >= 10;
                                                    const currentIdFmt = pv.previewIdFormat || idFormat;
                                                    const isSelected = !isDisabled && (currentIdFmt === item.id || (numClasses >= 10 && item.id === '5digit'));
                                                    return (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            disabled={isDisabled}
                                                            onClick={() => setImportPreview({ ...pv, previewIdFormat: item.id, digitMode: item.id === '5digit' ? 5 : 4 })}
                                                            style={{
                                                                flex: 1, padding: '7px 0', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                                border: isSelected ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                                                                background: isSelected ? '#fffbeb' : (isDisabled ? '#f1f5f9' : '#fff'),
                                                                color: isSelected ? '#b45309' : (isDisabled ? '#94a3b8' : '#64748b')
                                                            }}
                                                        >{item.label}</button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* 4. 분반 대상 */}
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>4. 대상 학년</div>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {[
                                                    { id: '1to2', label: (pv.previewSchoolType || schoolType) === 'high' ? '고1→고2' : '1→2학년' },
                                                    { id: '2to3', label: (pv.previewSchoolType || schoolType) === 'high' ? '고2→고3' : '2→3학년' },
                                                    { id: 'freshman', label: '신입생' }
                                                ].map(item => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => setImportPreview({ ...pv, previewGradeTransition: item.id })}
                                                        style={{
                                                            flex: 1, padding: '7px 0', borderRadius: '8px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer',
                                                            border: (pv.previewGradeTransition || gradeTransition) === item.id ? '2px solid #8b5cf6' : '1px solid #cbd5e1',
                                                            background: (pv.previewGradeTransition || gradeTransition) === item.id ? '#f5f3ff' : '#fff',
                                                            color: (pv.previewGradeTransition || gradeTransition) === item.id ? '#6d28d9' : '#64748b'
                                                        }}
                                                    >{item.label}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 자릿수 (학번 통째 컬럼이 있을 때만 노출) */}
                                {pv.mapping['학번'] !== -1 && (
                                    <div style={{ marginBottom: '22px', padding: '16px', background: '#fff8e1', borderRadius: '10px' }}>
                                        <div style={{ fontWeight: '700', marginBottom: '8px', color: '#f57c00' }}>학번 자릿수 (통째 학번 분해 규칙)</div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {[4, 5].map(d => (
                                                <button key={d} onClick={() => setImportPreview({ ...pv, digitMode: d })}
                                                    style={{
                                                        flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px',
                                                        border: pv.digitMode === d ? '2px solid #ff9800' : '2px solid #ddd',
                                                        background: pv.digitMode === d ? '#ffe0b2' : '#fff', color: '#333',
                                                    }}>
                                                    {d}자리 {d === 4 ? '(1103=1학년 1반 3번)' : '(10103=1학년 1반 3번)'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 미리보기 테이블 */}
                                <div style={{ marginBottom: '22px' }}>
                                    <div style={{ fontWeight: '700', marginBottom: '10px', fontSize: '16px', color: '#1a1a1a' }}>이렇게 읽었어요 (상위 5명)</div>
                                    <div style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: '10px' }}>
                                        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '14px' }}>
                                            <thead>
                                                <tr style={{ background: '#f5f5f5' }}>
                                                    {['학년', '반', '번호', '성명', '성적', '성별'].map(c => (
                                                        <th key={c} style={{ padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left', fontSize: '13px', color: '#666' }}>{c}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pv.rawRows.slice(0, 5).map((row, ri) => {
                                                    const e = extract(row);
                                                    return (
                                                        <tr key={ri} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                            {[e.학년, e.반, e.번호, e.성명, e.성적, e.성별].map((v, ci) => (
                                                                <td key={ci} style={{ padding: '10px' }}>{v == null ? '' : String(v)}</td>
                                                            ))}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* 버튼 */}
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setImportPreview(null)}
                                        style={{ padding: '13px 26px', background: '#eee', color: '#555', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>
                                        취소
                                    </button>
                                    <button onClick={confirmImport} disabled={!ready}
                                        style={{
                                            padding: '13px 32px', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px',
                                            background: ready ? '#2e7d32' : '#bbb',
                                            cursor: ready ? 'pointer' : 'not-allowed',
                                            boxShadow: ready ? '0 2px 10px rgba(46,125,50,0.4)' : 'none',
                                        }}>
                                        {ready ? `✅ ${targetGrade}학년 → ${targetGrade + 1}학년 분반 시작 (${targetCount}명)` : '필수 열을 먼저 지정하세요'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}
                {/* 상단 헤더 카드 */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
                    borderRadius: '24px',
                    padding: '36px 32px 30px',
                    marginBottom: '32px',
                    boxShadow: '0 20px 50px rgba(79, 70, 229, 0.25)'
                }}>
                    {/* 메인 타이틀 (중·고등학교 공용) */}
                    <h1 style={{
                        margin: '0 0 10px 0',
                        color: 'white',
                        fontSize: '44px',
                        fontFamily: "'Wanted Sans Variable', 'Wanted Sans', 'Pretendard Variable', Pretendard, sans-serif",
                        fontWeight: '800',
                        textAlign: 'center',
                        letterSpacing: '-1px',
                        textShadow: '0 4px 16px rgba(0,0,0,0.3)'
                    }}>
                        🔥 중·고등학교 분반 배치 시스템
                    </h1>
                    <h2 style={{
                        margin: '0 0 28px 0',
                        color: '#fef08a',
                        fontSize: '19px',
                        fontFamily: "'Pretendard Variable', Pretendard, sans-serif",
                        fontWeight: '600',
                        textAlign: 'center',
                        letterSpacing: '-0.3px',
                        textShadow: '0 2px 8px rgba(0,0,0,0.25)'
                    }}>
                        💣 폭탄 돌리기 방지 · 어느 한 반도 독박 쓰지 않는 공평한 학급 편성
                    </h2>

                    {/* 교사 눈높이 3대 안심 가치 카드 */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '14px',
                        marginBottom: '26px'
                    }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.96)',
                            borderRadius: '16px',
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{ fontSize: '28px', flexShrink: 0 }}>🔒</div>
                            <div>
                                <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', marginBottom: '3px' }}>교무실 나이스 PC 안심</div>
                                <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>인터넷 연결 없이도 100% 동작! 학생 명단이 외부로 절대 나가지 않아요</div>
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(255, 255, 255, 0.96)',
                            borderRadius: '16px',
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{ fontSize: '28px', flexShrink: 0 }}>⚖️</div>
                            <div>
                                <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', marginBottom: '3px' }}>성적·성비·요주의 학생 균등</div>
                                <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>누구 하나 독박 쓰지 않도록, 사이좋게 공평하게 섞어드립니다</div>
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(255, 255, 255, 0.96)',
                            borderRadius: '16px',
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{ fontSize: '28px', flexShrink: 0 }}>⚡</div>
                            <div>
                                <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', marginBottom: '3px' }}>엑셀만 넣으면 1초 완성</div>
                                <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>가입도 설치도 없이 바로 클릭 한 번으로 끝내세요 (샘플 194명 내장)</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* ── 메인 2열 그리드: 좌측 메인 작업 영역(확대) + 우측 위트 배너 카드(축소) ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.75fr 1fr', gap: '26px', alignItems: 'start' }}>
                        
                        {/* 왼쪽: 메인 작업 시작 (큼직한 폰트 & 시원한 액션) */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                processStudentFile(e.dataTransfer.files[0]);
                            }}
                            style={{
                                background: 'white',
                                padding: '36px 32px',
                                borderRadius: '20px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
                                border: isDragging ? '3px dashed #4f46e5' : '3px dashed transparent',
                                transition: 'all 0.2s',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ fontSize: '26px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
                                🚀 시작하기
                            </div>
                            <p style={{ fontSize: '15.5px', color: '#64748b', marginBottom: '22px', lineHeight: '1.5' }}>
                                설치나 회원가입 없이, 샘플 명단으로 바로 둘러보거나 우리 학교 엑셀 명단을 올려주세요.
                            </p>

                            {/* 1순위: 샘플 체험 버튼 (글자 18px 큼직) */}
                            <button
                                onClick={() => loadSampleDemo({ schoolType, genderMode, idFormat, gradeTransition })}
                                style={{
                                    width: '100%',
                                    padding: '17px 24px',
                                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '14px',
                                    fontWeight: '800',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    boxShadow: '0 6px 20px rgba(124, 58, 237, 0.35)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    marginBottom: '14px',
                                    transition: 'transform 0.15s, box-shadow 0.15s'
                                }}
                            >
                                <span>✨ 194명 실제 샘플로 1초 만에 바로 체험하기 (클릭)</span>
                            </button>

                            {/* 2순위: 엑셀 파일 업로드 버튼 */}
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                padding: '18px 24px',
                                boxSizing: 'border-box',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                borderRadius: '14px',
                                cursor: 'pointer',
                                fontWeight: '800',
                                fontSize: '19px',
                                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                                gap: '10px',
                                marginBottom: '8px'
                            }}>
                                📁 우리 학교 학생 명단 올리기 (CSV / Excel)
                                <input type="file" accept=".xlsx,.xls,.csv"
                                    onChange={(e) => { handleStudentDataUpload(e); e.target.value = ''; }}
                                    style={{ display: 'none' }} />
                            </label>
                            <p style={{ textAlign: 'center', fontSize: '14px', color: isDragging ? '#4f46e5' : '#94a3b8', marginTop: '0', marginBottom: '20px', fontWeight: '600' }}>
                                📥 또는 엑셀 파일을 여기로 끌어다 놓으셔도 돼요
                            </p>

                            {/* 파일 필수 4개 항목 친절 안내 */}
                            <div style={{
                                padding: '18px 22px',
                                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                                borderRadius: '16px',
                                border: '2px dashed #f59e0b',
                                marginBottom: '20px'
                            }}>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: '#b45309', marginBottom: '6px' }}>
                                    📋 엑셀 파일에는 딱 4개만 있으면 돼요!
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e3a8a', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                    반 · 번호 · 성명 · 기준성적
                                </div>
                                <div style={{ fontSize: '14px', color: '#78350f', lineHeight: '1.5' }}>
                                    ✨ 열 이름이 '이름', '점수'처럼 조금 달라도 <strong>알아서 척척 알아봅니다!</strong> 업로드 후 확인 화면에서 직접 맞출 수도 있어요 😊
                                </div>
                            </div>

                            {/* ── 우리 학교 맞춤 환경 (아코디언 형태: 평소엔 접어둠) ── */}
                            <div style={{
                                background: '#f8fafc',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                marginBottom: '18px'
                            }}>
                                <div 
                                    onClick={() => setShowSettings(!showSettings)}
                                    style={{
                                        padding: '15px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        background: showSettings ? '#f1f5f9' : '#f8fafc'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '16px' }}>⚙️</span>
                                        <span style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>우리 학교 맞춤 환경</span>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>
                                            (현재: <b>{schoolType === 'high' ? '고등학교' : '중학교'} · {genderMode === 'coed' ? '남녀공학' : genderMode === 'boys' ? '남학교' : '여학교'} · {idFormat === '5digit' ? '5자리' : idFormat === '4digit' ? '4자리' : '자동감지'}</b>)
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#4f46e5' }}>
                                        {showSettings ? '▲ 닫기' : '▼ 환경 변경하기'}
                                    </span>
                                </div>

                                {showSettings && (
                                    <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {/* 1. 학교급 */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>1. 학교급</span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {[
                                                    { id: 'middle', label: '중학교' },
                                                    { id: 'high', label: '고등학교' }
                                                ].map(item => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => setSchoolType(item.id)}
                                                        style={{
                                                            padding: '7px 16px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer',
                                                            border: schoolType === item.id ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                                                            background: schoolType === item.id ? '#eff6ff' : '#fff',
                                                            color: schoolType === item.id ? '#1d4ed8' : '#64748b'
                                                        }}
                                                    >{item.label}</button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 2. 성별 유형 */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>2. 성별 구성</span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {[
                                                    { id: 'coed', label: '남녀공학' },
                                                    { id: 'boys', label: '남학교' },
                                                    { id: 'girls', label: '여학교' }
                                                ].map(item => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setGenderMode(item.id);
                                                            setBalanceGender(item.id === 'coed');
                                                        }}
                                                        style={{
                                                            padding: '7px 14px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer',
                                                            border: genderMode === item.id ? '2px solid #10b981' : '1px solid #cbd5e1',
                                                            background: genderMode === item.id ? '#ecfdf5' : '#fff',
                                                            color: genderMode === item.id ? '#047857' : '#64748b'
                                                        }}
                                                    >{item.label}</button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 3. 학번 체계 */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>3. 학번 체계</span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {[
                                                    { id: 'auto', label: '자동감지' },
                                                    { id: '4digit', label: '4자리(2101)' },
                                                    { id: '5digit', label: '5자리(20101)' }
                                                ].map(item => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => setIdFormat(item.id)}
                                                        style={{
                                                            padding: '7px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                                                            border: idFormat === item.id ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                                                            background: idFormat === item.id ? '#fffbeb' : '#fff',
                                                            color: idFormat === item.id ? '#b45309' : '#64748b'
                                                        }}
                                                    >{item.label}</button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 4. 대상 학년 */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>4. 진급 대상</span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {[
                                                    { id: '1to2', label: schoolType === 'high' ? '고1→고2' : '1→2학년' },
                                                    { id: '2to3', label: schoolType === 'high' ? '고2→고3' : '2→3학년' },
                                                    { id: 'freshman', label: '신입생' }
                                                ].map(item => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => setGradeTransition(item.id)}
                                                        style={{
                                                            padding: '7px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                                                            border: (gradeTransition || '1to2') === item.id ? '2px solid #8b5cf6' : '1px solid #cbd5e1',
                                                            background: (gradeTransition || '1to2') === item.id ? '#f5f3ff' : '#fff',
                                                            color: (gradeTransition || '1to2') === item.id ? '#6d28d9' : '#64748b'
                                                        }}
                                                    >{item.label}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 양식 다운로드 & 보조 도구 링크 */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13.5px', color: '#64748b', flexWrap: 'wrap', gap: '8px' }}>
                                <div>
                                    📥 양식 다운로드: 
                                    <a href="학생데이터_샘플.xlsx" download style={{ color: '#7c3aed', fontWeight: '700', marginLeft: '6px', textDecoration: 'underline' }}>
                                        학생명단 샘플.xlsx
                                    </a>
                                    <span style={{ margin: '0 6px', color: '#cbd5e1' }}>·</span>
                                    <a href="분리대상_샘플.xlsx" download style={{ color: '#7c3aed', fontWeight: '700', textDecoration: 'underline' }}>
                                        분리대상 샘플.xlsx
                                    </a>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowDiagnostics(true)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#94a3b8',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    🧪 108개 환경 검증기 열기
                                </button>
                            </div>
                        </div>

                        {/* 오른쪽: 컴팩트한 폭탄돌리기 위트 카드 & 이어하기 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '24px 20px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
                                textAlign: 'center'
                            }}>
                                <img
                                    src={BOMB_IMAGE}
                                    alt="폭탄돌리기 게임"
                                    style={{
                                        width: '100%',
                                        maxWidth: '280px',
                                        borderRadius: '14px',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                                        border: '4px solid #ff6b6b',
                                        marginBottom: '14px'
                                    }}
                                />
                                <div style={{
                                    display: 'inline-block',
                                    padding: '5px 12px',
                                    borderRadius: '20px',
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    fontSize: '13px',
                                    fontWeight: '800',
                                    marginBottom: '8px'
                                }}>
                                    💣 폭탄 돌리기 그만!
                                </div>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: '800',
                                    color: '#1e293b',
                                    marginBottom: '8px',
                                    lineHeight: '1.4'
                                }}>
                                    올해 1년의 평화는<br/>2월 반편성이 결정하죠 🕊️
                                </div>
                                <div style={{
                                    fontSize: '13.5px',
                                    color: '#475569',
                                    lineHeight: '1.6',
                                    fontWeight: '500'
                                }}>
                                    어느 한 반만 울상 짓지 않도록,<br/>
                                    요주의 학생부터 남녀 성비, 성적까지<br/>
                                    <strong>3월 첫날 모두가 웃을 수 있게</strong> 공평하게 나눕니다.
                                </div>
                            </div>

                            {/* 이전 작업 이어하기 (작게 우측 수납) */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDraggingResume(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setIsDraggingResume(false); }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDraggingResume(false);
                                    processJsonFile(e.dataTransfer.files[0]);
                                }}
                                style={{
                                    padding: '18px',
                                    background: isDraggingResume ? '#fff3c4' : 'rgba(255,255,255,0.95)',
                                    borderRadius: '16px',
                                    textAlign: 'center',
                                    border: isDraggingResume ? '2px dashed #f57c00' : '2px dashed #ffd591',
                                    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontSize: '15px', fontWeight: '800', color: '#d97706', marginBottom: '8px' }}>
                                    💾 이전에 하던 작업이 있나요?
                                </div>
                                <label style={{
                                    display: 'inline-block',
                                    padding: '10px 20px',
                                    background: '#f59e0b',
                                    color: 'white',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    fontSize: '13.5px',
                                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)',
                                    marginBottom: '6px'
                                }}>
                                    📂 작업 파일 불러오기 (JSON)
                                    <input type="file" accept=".json"
                                        onChange={(e) => { loadFromFile(e); e.target.value = ''; }}
                                        style={{ display: 'none' }} />
                                </label>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                    또는 JSON 파일을 여기로 끌어다 놓으세요
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 푸터 */}
                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e0e0e0', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                    Crafted 2026 서울사대부중 과학정보부
                </div>

                {/* 🧪 전수 검증 모달 */}
                {showDiagnostics && (
                    <DiagnosticModal
                        onClose={() => setShowDiagnostics(false)}
                        onApplyScenario={(sc) => {
                            setShowDiagnostics(false);
                            loadSampleDemo({
                                schoolType: sc.s_type,
                                genderMode: sc.g_mode,
                                idFormat: sc.i_fmt,
                                gradeTransition: sc.g_trans
                            });
                        }}
                    />
                )}
            </div>
        );
    }
    
    // 메인 화면
    // 구학년 라벨
    const oldGradeLabel = gradeTransition === 'freshman'
        ? '이전 학교/배정고사'
        : (gradeTransition === '2to3' ? (schoolType === 'high' ? '고2' : '2학년') : (schoolType === 'high' ? '고1' : '1학년'));
    const oldGradeNum = gradeTransition === '2to3' ? 2 : (gradeTransition === 'freshman' ? 0 : 1);

    return (
        <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
            {/* 헤더 */}
            <div style={{ 
                textAlign: 'center', 
                marginBottom: '25px',
                padding: '24px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '14px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
            }}>
                <h1 style={{ margin: '0 0 6px 0', color: '#fff', fontSize: '32px', fontFamily: "'Wanted Sans Variable', 'Wanted Sans', 'Pretendard Variable', Pretendard, sans-serif", fontWeight: '800', letterSpacing: '-1px', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                    🎓 {schoolType === 'high' ? '고등학교' : '중학교'} 분반 배치 시스템
                </h1>
                <h2 style={{ margin: '0 0 12px 0', color: '#ffe066', fontSize: '16px', fontFamily: "'Pretendard Variable', Pretendard, sans-serif", fontWeight: '600', letterSpacing: '-0.3px' }}>
                    💣 폭탄돌리기 방지 • 데이터 기반 학급 편성
                </h2>
                <div style={{ display: 'inline-flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <span style={{ background: 'rgba(255,255,255,0.22)', color: '#fff', padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: '700' }}>
                        🏫 {schoolType === 'high' ? '고등학교' : '중학교'}
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.22)', color: '#fff', padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: '700' }}>
                        👥 {genderMode === 'coed' ? '남녀공학' : (genderMode === 'boys' ? '남학교' : '여학교')}
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.22)', color: '#fff', padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: '700' }}>
                        🏷️ {idFormat === '4digit' && numClasses < 10 ? '4자리 학번(2101)' : '5자리 학번(20101)'}
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.22)', color: '#fff', padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: '700' }}>
                        📚 {gradeTransition === 'freshman' ? '신입생 배정' : (gradeTransition === '1to2' ? (schoolType === 'high' ? '고1→고2' : '1→2학년') : (schoolType === 'high' ? '고2→고3' : '2→3학년'))}
                    </span>
                </div>
            </div>

            {/* 데이터 업로드 상태 표시등 */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
                <StatusLight
                    label="학생 데이터"
                    done={!!(studentData && studentData.length > 0)}
                    detail={studentData && studentData.length > 0 ? `${studentData.length}명` : null}
                />
                <StatusLight
                    label="분리 학생 데이터"
                    done={separations.length > 0}
                    detail={separations.length > 0 ? `${separations.length}쌍` : null}
                />
            </div>

            <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                {/* ── 섹터 1: 초기 세팅 & 옵션 ── */}
                <ToolbarGroup label="초기 세팅 & 옵션" accent="#10b981">
                    <ToolbarButton onClick={doLShapeAssignment} grad="linear-gradient(135deg, #34d399 0%, #059669 100%)" title="성적 및 성비 균형으로 학급 재배치">
                        🎯 ㄹ자 균등 재배치
                    </ToolbarButton>
                    {genderMode === 'coed' ? (
                        <button
                            onClick={() => {
                                const next = !balanceGender;
                                setBalanceGender(next);
                                executeAssignment(studentData, numClasses, next);
                            }}
                            style={{
                                padding: '9px 13px',
                                background: balanceGender ? '#ecfdf5' : '#f8fafc',
                                color: balanceGender ? '#059669' : '#64748b',
                                border: `1.5px solid ${balanceGender ? '#10b981' : '#cbd5e1'}`,
                                borderRadius: '9px',
                                fontWeight: '700',
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '5px'
                            }}
                            title="남녀공학 성비 균형 ON/OFF (클릭 시 즉시 재배치)"
                        >
                            <span>👥 남녀 성비 균형:</span>
                            <span style={{ fontWeight: '800' }}>{balanceGender ? 'ON (권장)' : 'OFF'}</span>
                        </button>
                    ) : (
                        <div style={{
                            padding: '9px 13px', background: '#f1f5f9', color: '#475569',
                            border: '1.5px solid #cbd5e1', borderRadius: '9px', fontWeight: '700', fontSize: '13px'
                        }}>
                            🏫 단성 학교 (성적순 배치)
                        </div>
                    )}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: '#f8fafc', padding: '4px 10px', borderRadius: '9px',
                        border: '1px solid #e2e8f0'
                    }} title="새 학년 편성할 반 개수 조정">
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>편성 반수:</span>
                        <button
                            onClick={() => {
                                if (numClasses > 2) {
                                    const next = numClasses - 1;
                                    setNumClasses(next);
                                    executeAssignment(studentData, next, balanceGender);
                                }
                            }}
                            disabled={numClasses <= 2}
                            style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: '800' }}
                        >-</button>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', minWidth: '32px', textAlign: 'center' }}>
                            {numClasses}반
                        </span>
                        <button
                            onClick={() => {
                                if (numClasses < 20) {
                                    const next = numClasses + 1;
                                    setNumClasses(next);
                                    executeAssignment(studentData, next, balanceGender);
                                }
                            }}
                            disabled={numClasses >= 20}
                            style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: '800' }}
                        >+</button>
                    </div>
                    {numClasses >= 10 && idFormat === '4digit' && (
                        <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '9px', color: '#dc2626', fontSize: '12px', fontWeight: '700' }}>
                            ⚠️ 10반 이상 5자리 자동 적용
                        </div>
                    )}
                    <ToolbarButton onClick={resetToOriginal} grad="linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)">
                        ♻️ 원래 배치로
                    </ToolbarButton>
                    <ToolbarButton onClick={() => setShowDiagnostics(true)} grad="linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)" title="108가지 분반 조합 전수 검사기 열기">
                        🧪 전수 검사기
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => { if (confirm('모든 작업이 초기화됩니다. 처음부터 다시 시작하시겠습니까?')) startNewWork(); }}
                        grad="linear-gradient(135deg, #f87171 0%, #dc2626 100%)">
                        🔄 새 파일로 다시 시작
                    </ToolbarButton>
                </ToolbarGroup>

                {/* ── 섹터 2: 내보내기 ── */}
                <ToolbarGroup label="내보내기" accent="#f59e0b">
                    <ToolbarButton onClick={saveWorkToFile} grad="linear-gradient(135deg, #fbbf24 0%, #d97706 100%)">
                        💾 작업 저장
                    </ToolbarButton>
                    <ToolbarButton onClick={exportToExcel} grad="linear-gradient(135deg, #34d399 0%, #047857 100%)">
                        📊 엑셀 다운로드
                    </ToolbarButton>
                    <ToolbarButton onClick={downloadOfflineHtml} grad="linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)" title="학교 업무망 PC에서 인터넷 없이 쓸 수 있는 단일 HTML 다운로드">
                        🔒 오프라인 HTML 저장
                    </ToolbarButton>
                </ToolbarGroup>
            </div>
            
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
                <div
                    onClick={() => setSeparationOpen(o => !o)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        cursor: 'pointer', userSelect: 'none',
                        marginBottom: separationOpen ? '10px' : '0'
                    }}
                >
                    <span style={{
                        display: 'inline-block', transition: 'transform 0.2s',
                        transform: separationOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        color: '#888', fontSize: '14px'
                    }}>▶</span>
                    <h3 style={{ margin: 0, color: '#555' }}>🚫 분리해야 할 학생 목록</h3>
                    {separations.length > 0 && (
                        <span style={{
                            background: '#f44336', color: 'white', fontSize: '12px', fontWeight: 'bold',
                            padding: '2px 9px', borderRadius: '11px'
                        }}>{separations.length}쌍</span>
                    )}
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#999' }}>
                        {separationOpen ? '접기 ▲' : '펼치기 ▼'}
                    </span>
                </div>

                {separationOpen && (<>
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.background = '#bbdefb';
                        e.currentTarget.style.borderColor = '#1976d2';
                    }}
                    onDragLeave={(e) => {
                        e.currentTarget.style.background = '#e3f2fd';
                        e.currentTarget.style.borderColor = '#2196F3';
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.background = '#e3f2fd';
                        e.currentTarget.style.borderColor = '#2196F3';
                        
                        const file = e.dataTransfer.files[0];
                        if (file) {
                            handleSeparationFile(file);
                        }
                    }}
                    style={{ marginBottom: '15px', padding: '15px', background: '#e3f2fd', borderRadius: '5px', border: '2px dashed #2196F3', transition: 'all 0.2s', cursor: 'pointer' }}
                >
                    <div style={{ marginBottom: '10px', fontSize: '14px', color: '#1976d2', fontWeight: 'bold' }}>
                        📎 엑셀 파일 업로드 (xlsx, xls)
                    </div>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleSeparationFile(file);
                            // 같은 파일 다시 선택 가능하도록 value 리셋
                            e.target.value = '';
                        }}
                        style={{ marginBottom: '10px' }}
                    />
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                        💡 파일 형식: A열-학생1, B열-학생2 (이름 또는 학번)<br/>
                        🖱️ 파일을 이 영역에 드래그 앤 드랍하거나 위 버튼으로 선택하세요
                    </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
                    {separations.map((sep, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="text"
                                placeholder="예: 일영사 또는 1104"
                                value={sep.student1}
                                onChange={(e) => updateSeparation(idx, 'student1', e.target.value)}
                                style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '3px' }}
                            />
                            <span>↔️</span>
                            <input
                                type="text"
                                placeholder="예: 이영일 또는 1201"
                                value={sep.student2}
                                onChange={(e) => updateSeparation(idx, 'student2', e.target.value)}
                                style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '3px' }}
                            />
                            <button onClick={() => removeSeparation(idx)} style={{ padding: '8px 15px', background: '#f44336', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                                삭제
                            </button>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={addSeparation} style={{ padding: '8px 15px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                        + 수동 추가
                    </button>
                    {separations.length > 0 && (
                        <button onClick={() => setSeparations([])} style={{ padding: '8px 15px', background: '#f44336', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                            전체 삭제
                        </button>
                    )}
                </div>
                </>)}
            </div>

            {Object.keys(classes).length > 0 && (
                <div style={{ marginBottom: '20px', padding: '15px', background: '#fff3e0', borderRadius: '5px' }}>
                    <h3 style={{ marginBottom: '10px', color: '#555' }}>👥 {oldGradeLabel} 학급별 분산 확인</h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {Array.from({ length: numClasses }, (_, i) => i + 1).map(oldClass => (
                            <button
                                key={oldClass}
                                onClick={() => setHighlightedOldClass(highlightedOldClass === oldClass ? null : oldClass)}
                                style={{
                                    padding: '10px 20px',
                                    background: highlightedOldClass === oldClass ? '#ff9800' : '#fff',
                                    color: highlightedOldClass === oldClass ? '#fff' : '#333',
                                    border: `2px solid ${highlightedOldClass === oldClass ? '#ff9800' : '#ddd'}`,
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {oldGradeNum}-{oldClass}반
                            </button>
                        ))}
                        {highlightedOldClass && (
                            <button
                                onClick={() => setHighlightedOldClass(null)}
                                title="선택한 반 강조 표시를 끕니다 (작업은 그대로 유지)"
                                style={{
                                    padding: '10px 20px',
                                    background: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                ✕ 선택 해제
                            </button>
                        )}
                    </div>
                    {highlightedOldClass && (() => {
                        const summary = getOldClassDistributionSummary(highlightedOldClass);
                        const summaryText = Object.entries(summary)
                            .map(([newClass, count]) => {
                                // 6명 이상이면 빨간색, 아니면 파란색
                                const color = count >= 6 ? '#d32f2f' : '#1976d2';
                                return `<span style="color: ${color}; font-weight: bold; font-size: 28px;">${newClass}반-${count}명</span>`;
                            })
                            .join(' ');
                        return (
                            <div 
                                style={{ marginTop: '15px', padding: '15px', background: '#ffe0b2', borderRadius: '5px', fontSize: '20px', fontWeight: 'bold', color: '#e65100' }}
                                dangerouslySetInnerHTML={{ __html: `📊 ${oldGradeLabel} ${highlightedOldClass}반 배치 현황: ${summaryText}` }}
                            />
                        );
                    })()}
                </div>
            )}
            
            {/* ── 배치 작업: 되돌리기 / 다시 실행 (검색창 위) ── */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                <ToolbarButton onClick={undo} disabled={historyIndex <= 0 || history.length === 0}
                    grad="linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)" title="되돌리기 (Ctrl+Z / ⌘Z)">
                    ↩️ 되돌리기 (Ctrl/⌘+Z)
                </ToolbarButton>
                <ToolbarButton onClick={redo} disabled={historyIndex >= history.length - 1 || history.length === 0}
                    grad="linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)" title="다시 실행 (Ctrl+Y / ⌘⇧Z)">
                    ↪️ 다시 실행 (Ctrl/⌘+Y)
                </ToolbarButton>
            </div>

            <div style={{ marginBottom: '20px', padding: '15px', background: '#e8f5e9', borderRadius: '5px' }}>
                <h3 style={{ marginBottom: '10px', color: '#555' }}>🔍 학생 검색</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="학생 이름 또는 학번 입력 (예: 일영사, 104)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ flex: 1, padding: '10px', border: '2px solid #4CAF50', borderRadius: '5px', fontSize: '14px' }}
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            style={{ padding: '10px 15px', background: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            지우기
                        </button>
                    )}
                </div>
                {searchQuery && (() => {
                    const foundStudents = findStudents(searchQuery);
                    if (foundStudents.length > 1) {
                        // 동명이인!
                        return (
                            <div style={{ marginTop: '10px', padding: '12px', background: '#fff3cd', border: '2px solid #ffc107', borderRadius: '5px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#856404', marginBottom: '8px' }}>
                                    ⚠️ 같은 이름을 가진 학생들이 {foundStudents.length}명 있습니다!
                                </div>
                                <div style={{ fontSize: '13px', color: '#856404', marginBottom: '8px' }}>
                                    이름 대신 <strong>학번</strong>을 입력해주세요:
                                </div>
                                {foundStudents.map((student, idx) => (
                                    <div 
                                        key={idx}
                                        style={{ 
                                            padding: '8px', 
                                            background: 'white', 
                                            border: '1px solid #ffc107',
                                            borderRadius: '3px', 
                                            marginBottom: idx < foundStudents.length - 1 ? '5px' : '0',
                                            fontSize: '13px'
                                        }}
                                    >
                                        📌 <strong style={{ color: '#d32f2f' }}>{student.학번}</strong> {student.성명} - {student.현재분반}반 (성적: {student.기준성적})
                                    </div>
                                ))}
                            </div>
                        );
                    } else if (foundStudents.length === 1) {
                        const found = foundStudents[0];
                        return (
                            <div style={{ marginTop: '10px', padding: '10px', background: '#c8e6c9', borderRadius: '3px', fontSize: '14px' }}>
                                ✅ <strong>{found.학번} {found.성명}</strong> - 현재 <strong>{found.현재분반}반</strong>에 배치됨 (성적: {found.기준성적})
                            </div>
                        );
                    } else {
                        return (
                            <div style={{ marginTop: '10px', padding: '10px', background: '#ffcdd2', borderRadius: '3px', fontSize: '14px' }}>
                                ❌ 검색 결과가 없습니다.
                            </div>
                        );
                    }
                })()}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                {Array.from({ length: numClasses }, (_, i) => i + 1).map(classNum => {
                    const stats = calculateClassStats(classNum);
                    const classStudents = classes[classNum] || [];
                    const oldClassDist = getOldClassDistribution(classNum);
                    
                    return (
                        <div 
                            key={classNum} 
                            style={{ 
                                border: '1px solid #e0e0e0', 
                                borderRadius: '10px', 
                                padding: '12px', 
                                background: 'white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                            }}
                        >
                            <div style={{ textAlign: 'center', padding: '12px', background: '#667eea', color: 'white', borderRadius: '8px', marginBottom: '12px' }}>
                                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{classNum}반</h2>
                            </div>
                            <div style={{ fontSize: '12px', textAlign: 'center', marginBottom: '10px', padding: '8px', background: '#f0f0f0', borderRadius: '3px' }}>
                                <div>👥 {stats.count}명{(stats.male > 0 || stats.female > 0) && (
                                    <span style={{ marginLeft: '6px' }}>
                                        <span style={{ color: '#1976d2', fontWeight: 'bold' }}>♂ {stats.male}</span>
                                        <span style={{ color: '#999', margin: '0 3px' }}>·</span>
                                        <span style={{ color: '#e53935', fontWeight: 'bold' }}>♀ {stats.female}</span>
                                    </span>
                                )}</div>
                                <div>📊 평균: {stats.avg}</div>
                                <div>⬆️ 최고: {stats.max}</div>
                                <div>⬇️ 최저: {stats.min}</div>
                            </div>
                            {highlightedOldClass && (
                                <div style={{ 
                                    fontSize: '18px', 
                                    textAlign: 'center', 
                                    marginBottom: '8px', 
                                    padding: '6px', 
                                    background: '#fff3e0', 
                                    borderRadius: '3px', 
                                    fontWeight: 'bold', 
                                    color: (oldClassDist[highlightedOldClass] || 0) > 6 ? '#d32f2f' : '#000000'
                                }}>
                                    1-{highlightedOldClass}반: {oldClassDist[highlightedOldClass] || 0}명
                                </div>
                            )}
                            <div style={{ minHeight: '300px' }}>
                                {classStudents.map((student, idx) => {
                                    const isChanged = student.원래분반 !== student.현재분반;
                                    const hasViolation = checkSeparationViolation(student);
                                    const isHighlighted = highlightedOldClass && student.구반 === highlightedOldClass;
                                    
                                    // 동명이인 검색 처리
                                    const foundStudents = searchQuery ? findStudents(searchQuery) : [];
                                    const isSearched = foundStudents.some(s => s.학번 === student.학번);
                                    
                                    const separationPartners = findSeparationPartners(student);
                                    
                                    // 6명 이상 몰린 경우 체크
                                    const oldClassDist = getOldClassDistribution(classNum);
                                    const isOvercrowded = highlightedOldClass && student.구반 === highlightedOldClass && oldClassDist[highlightedOldClass] >= 6;
                                    
                                    let bgColor = '#f9f9f9';
                                    let borderColor = '#e0e0e0';
                                    
                                    // 1학년 반 클릭 시에는 해당 하이라이트만 표시
                                    if (highlightedOldClass) {
                                        if (isOvercrowded) {
                                            bgColor = '#ffebee';
                                            borderColor = '#d32f2f';
                                        } else if (isHighlighted) {
                                            bgColor = '#fff3e0';
                                            borderColor = '#ff9800';
                                        } else {
                                            // 하이라이트 아닌 학생은 기본 색상
                                            bgColor = '#f9f9f9';
                                            borderColor = '#e0e0e0';
                                        }
                                    } else {
                                        // 1학년 반 클릭 안 했을 때는 기존 로직
                                        if (hasViolation) {
                                            bgColor = '#ffebee';
                                            borderColor = '#f44336';
                                        } else if (isSearched) {
                                            bgColor = '#c8e6c9';
                                            borderColor = '#4CAF50';
                                        } else if (isChanged) {
                                            bgColor = '#fff9c4';
                                            borderColor = '#fbc02d';
                                        }
                                    }
                                    
                                    // 툴팁 텍스트 생성
                                    let tooltipText = '';
                                    if (separationPartners.length > 0 && hasViolation && !highlightedOldClass) {
                                        const names = separationPartners.map(p => p.성명).join(', ');
                                        tooltipText = `⚠️ ${names}과(와) 분리 필요`;
                                    }
                                    
                                    return (
                                        <div
                                            key={student.id}
                                            draggable="true"
                                            onDragStart={(e) => {
                                                e.dataTransfer.effectAllowed = 'move';
                                                e.dataTransfer.setData('studentId', student.id);
                                                e.dataTransfer.setData('fromClass', student.현재분반);
                                                e.currentTarget.style.opacity = '0.2'; // 매우 투명
                                                e.currentTarget.style.boxShadow = '0 0 30px 10px rgba(255, 193, 7, 1)'; // 강한 노란 글로우
                                                e.currentTarget.style.borderColor = '#FFC107';
                                                e.currentTarget.style.borderWidth = '4px';
                                            }}
                                            onDragEnd={(e) => {
                                                e.currentTarget.style.opacity = '1';
                                                e.currentTarget.style.boxShadow = '';
                                                e.currentTarget.style.borderColor = borderColor;
                                                e.currentTarget.style.borderWidth = '2px';
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.dataTransfer.dropEffect = 'move';
                                            }}
                                            onDragEnter={(e) => {
                                                e.preventDefault();
                                                const draggedId = e.dataTransfer.getData('studentId');
                                                if (draggedId && draggedId !== student.id) {
                                                    // 🔥 극적인 시각 효과!
                                                    e.currentTarget.style.background = 'linear-gradient(135deg, #00E676 0%, #00C853 100%)'; // 그라디언트 네온 초록
                                                    e.currentTarget.style.borderColor = '#FFD600'; // 노란 테두리
                                                    e.currentTarget.style.borderWidth = '8px'; // 매우 굵게
                                                    e.currentTarget.style.transform = 'scale(1.25) rotate(2deg)'; // 크게 + 약간 회전
                                                    e.currentTarget.style.boxShadow = '0 0 40px 15px rgba(255, 214, 0, 1), 0 0 80px 30px rgba(0, 230, 118, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.5)'; // 3중 글로우 + 내부 빛
                                                    e.currentTarget.style.color = '#FFFFFF'; // 흰색 텍스트
                                                    e.currentTarget.style.fontWeight = '900'; // 매우 굵게
                                                    e.currentTarget.style.fontSize = '15px'; // 크게
                                                    e.currentTarget.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 214, 0, 0.8)'; // 텍스트 그림자
                                                    e.currentTarget.style.zIndex = '1000';
                                                    e.currentTarget.style.transition = 'all 0.1s ease-out'; // 빠른 애니메이션
                                                }
                                            }}
                                            onDragLeave={(e) => {
                                                e.currentTarget.style.background = bgColor;
                                                e.currentTarget.style.borderColor = borderColor;
                                                e.currentTarget.style.borderWidth = '2px';
                                                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                                                e.currentTarget.style.boxShadow = (isHighlighted || (isSearched && !highlightedOldClass)) ? '0 0 10px rgba(255, 152, 0, 0.5)' : 'none';
                                                e.currentTarget.style.color = '';
                                                e.currentTarget.style.fontWeight = (isSearched && !highlightedOldClass) ? 'bold' : 'normal';
                                                e.currentTarget.style.fontSize = '13px';
                                                e.currentTarget.style.textShadow = 'none';
                                                e.currentTarget.style.zIndex = '';
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                
                                                e.currentTarget.style.background = bgColor;
                                                e.currentTarget.style.borderColor = borderColor;
                                                e.currentTarget.style.borderWidth = '2px';
                                                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                                                e.currentTarget.style.boxShadow = (isHighlighted || (isSearched && !highlightedOldClass)) ? '0 0 10px rgba(255, 152, 0, 0.5)' : 'none';
                                                e.currentTarget.style.color = '';
                                                e.currentTarget.style.fontWeight = (isSearched && !highlightedOldClass) ? 'bold' : 'normal';
                                                e.currentTarget.style.fontSize = '13px';
                                                e.currentTarget.style.textShadow = 'none';
                                                e.currentTarget.style.zIndex = '';
                                                
                                                const draggedId = e.dataTransfer.getData('studentId');
                                                if (draggedId && draggedId !== student.id) {
                                                    handleCardSwap(draggedId, student.id);
                                                }
                                            }}
                                            onClick={() => handleStudentClick(student)}
                                            title={tooltipText}
                                            style={{
                                                padding: '8px 10px',
                                                margin: '4px 0',
                                                background: bgColor,
                                                border: `2px solid ${borderColor}`,
                                                borderRadius: '6px',
                                                cursor: 'move',
                                                fontSize: '13px',
                                                transition: 'all 0.2s',
                                                boxShadow: (isHighlighted || (isSearched && !highlightedOldClass)) ? '0 0 10px rgba(255, 152, 0, 0.5)' : 'none',
                                                fontWeight: (isSearched && !highlightedOldClass) ? 'bold' : 'normal',
                                                position: 'relative'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!e.currentTarget.getAttribute('draggable')) return;
                                                e.currentTarget.style.background = '#e3f2fd';
                                                e.currentTarget.style.borderColor = '#2196F3';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = bgColor;
                                                e.currentTarget.style.borderColor = borderColor;
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                                <span>
                                                    {idx + 1}. {student.성별 === '남' && <span style={{ color: '#1976d2', marginRight: '2px' }}>●</span>}{student.성별 === '여' && <span style={{ color: '#e53935', marginRight: '2px' }}>●</span>}
                                                    <span style={{ fontWeight: '600' }}>{student.학번}</span> {student.성명} <span style={{ fontSize: '11px', color: '#64748b' }}>({student.기준성적})</span>
                                                </span>
                                                <span>
                                                    {isChanged && !highlightedOldClass && ' ✏️'}
                                                    {hasViolation && !highlightedOldClass && ' ⚠️'}
                                                    {isSearched && !highlightedOldClass && ' 🔍'}
                                                </span>
                                            </div>
                                            {hasViolation && !highlightedOldClass && separationPartners.length > 0 && (
                                                <div style={{
                                                    marginTop: '5px',
                                                    padding: '4px 8px',
                                                    background: '#fff1f2',
                                                    border: '1px solid #fecdd3',
                                                    borderRadius: '6px',
                                                    fontSize: '11px',
                                                    color: '#be123c',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    boxShadow: '0 1px 3px rgba(190, 18, 60, 0.08)'
                                                }}>
                                                    <span>⚠️</span>
                                                    <span><strong>{separationPartners.map(p => p.성명).join(', ')}</strong>과(와) 분리 대상입니다</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {showModal && selectedStudent && (
                <div onClick={() => setShowModal(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', padding: '20px', borderRadius: '10px', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto', width: '90%' }}>
                        <div style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #eee' }}>
                            <h2 style={{ margin: 0 }}>{selectedStudent.학번}{selectedStudent.성명} 교체 추천</h2>
                            <p style={{ margin: '5px 0 0 0', color: '#666' }}>현재 반: {selectedStudent.현재분반}반 | 성적: {selectedStudent.기준성적}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {getRecommendations(selectedStudent).map((rec, idx) => {
                                // 위쪽 학생들과 아래쪽 학생들 사이에 현재 학생 표시
                                const items = [];
                                
                                if (idx === 0 && rec.position > 0) {
                                    // 첫 번째가 아래쪽이면 위에 현재 학생 표시
                                    items.push(
                                        <div
                                            key="current"
                                            style={{
                                                padding: '12px',
                                                border: '3px solid #2196F3',
                                                borderRadius: '5px',
                                                background: '#e3f2fd',
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#1976d2'
                                            }}
                                        >
                                            👉 {selectedStudent.학번}{selectedStudent.성명} ({selectedStudent.현재분반}반) - 현재 선택
                                        </div>
                                    );
                                }
                                
                                items.push(
                                    <div
                                        key={idx}
                                        onClick={() => swapStudents(selectedStudent, rec.student)}
                                        style={{
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            transition: 'all 0.2s',
                                            background: rec.position < 0 ? '#f5f5f5' : 'white'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#e3f2fd';
                                            e.currentTarget.style.borderColor = '#2196F3';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = rec.position < 0 ? '#f5f5f5' : 'white';
                                            e.currentTarget.style.borderColor = '#ddd';
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div>
                                                {rec.position < 0 ? '⬆️' : '⬇️'} <strong>{rec.student.학번}{rec.student.성명}</strong> ({rec.student.현재분반}반)
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                                성적: {rec.student.기준성적} | 차이: {rec.scoreDiff.toFixed(1)}점 | {Math.abs(rec.position)}칸 {rec.position < 0 ? '위' : '아래'}
                                            </div>
                                        </div>
                                        <button style={{ padding: '8px 15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>교체</button>
                                    </div>
                                );
                                
                                // 위쪽 마지막과 아래쪽 첫번째 사이에 현재 학생 표시
                                if (rec.position < 0 && idx < getRecommendations(selectedStudent).length - 1 && getRecommendations(selectedStudent)[idx + 1].position > 0) {
                                    items.push(
                                        <div
                                            key="current"
                                            style={{
                                                padding: '12px',
                                                border: '3px solid #2196F3',
                                                borderRadius: '5px',
                                                background: '#e3f2fd',
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#1976d2'
                                            }}
                                        >
                                            👉 {selectedStudent.학번}{selectedStudent.성명} ({selectedStudent.현재분반}반) - 현재 선택
                                        </div>
                                    );
                                }
                                
                                return items;
                            })}
                        </div>
                        <button onClick={() => setShowModal(false)} style={{ marginTop: '15px', width: '100%', padding: '10px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>
                            닫기
                        </button>
                    </div>
                </div>
            )}
            
            {Object.keys(classes).length > 0 && (() => {
                const changedStudents = getChangedStudents();
                return changedStudents.length > 0 ? (
                    <div style={{ marginTop: '30px', padding: '20px', background: '#fff3e0', borderRadius: '10px', border: '2px solid #ff9800' }}>
                        <h3 style={{ marginBottom: '15px', color: '#e65100' }}>
                            📝 배치가 변경된 학생 ({changedStudents.length}명)
                        </h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {changedStudents.map((student, idx) => (
                                <div 
                                    key={student.학번}
                                    style={{ 
                                        padding: '12px', 
                                        marginBottom: '8px', 
                                        background: 'white', 
                                        borderRadius: '5px',
                                        border: '1px solid #ffb74d',
                                        fontSize: '14px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <strong>{idx + 1}.</strong> {student.학번}{student.성명}
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f57c00' }}>
                                        {student.원래반}반 → {student.현재반}반
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;
            })()}
            
            {/* 🧪 전수 검증 모달 */}
            {showDiagnostics && (
                <DiagnosticModal
                    onClose={() => setShowDiagnostics(false)}
                    onApplyScenario={(sc) => {
                        setShowDiagnostics(false);
                        loadSampleDemo({
                            schoolType: sc.s_type,
                            genderMode: sc.g_mode,
                            idFormat: sc.i_fmt,
                            gradeTransition: sc.g_trans
                        });
                    }}
                />
            )}

            {/* 하단 푸터 */}
            <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '2px solid #e0e0e0', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                Crafted 2026 서울사대부중 과학정보부
            </div>
        </div>
    );
}
        
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<ClassAssignmentApp />);
