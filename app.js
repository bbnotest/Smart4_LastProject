const config = window.firebaseConfig || {};
const firebaseReady = Boolean(config.apiKey && config.projectId && config.authDomain);
const emailDomain = "@smart.com";
const adminEmails = ["안중재@smart.com"];
const guestEmails = ["기획자@smart.com"];
const monitoredTeams = ["1팀", "2팀", "3팀", "4팀", "5팀", "6팀", "7팀", "8팀"];
const ganttPeriods = [
  { key: "all", label: "전체", start: "2026-05-28", end: "2026-07-15" },
  { key: "demo", label: "데모", start: "2026-05-28", end: "2026-06-09" },
  { key: "cbt", label: "CBT", start: "2026-06-10", end: "2026-06-23" },
  { key: "release", label: "출시", start: "2026-06-24", end: "2026-06-30" },
  { key: "polish", label: "폴리싱", start: "2026-07-01", end: "2026-07-15" }
];
const holidayKeys = ["2026-06-03"];
const rosterRoles = {
  "1팀": {
    "기획": { leader: "맹지훈", pm: "박영성" },
    "플밍": { leader: "강세환" }
  },
  "2팀": {
    "기획": { leader: "이정헌", pm: "박원우" },
    "플밍": { leader: "박승훈" }
  }
};
const teamRoster = {
  "1팀": {
    "기획": ["맹지훈", "박영성", "손호진", "송아영", "이동현", "조준현", "한의호", "홍태광"],
    "플밍": ["강세환", "송근형", "신하용", "이인"]
  },
  "2팀": {
    "기획": ["이정헌", "박원우", "강태성", "김태훈", "김흥규", "이도건", "이영우", "정재훈", "한지우"],
    "플밍": ["박승훈", "이수형", "제갈도원", "조경민", "최완용"]
  },
  "3팀": {
    "기획": ["주재형", "권현민", "김민제", "김영도", "우현승", "윤동현", "이승진", "이원홍", "장근혁"],
    "플밍": ["문조영", "고병희", "김영빈", "이종현", "조민형"]
  },
  "4팀": {
    "기획": ["승정하", "김서현", "김경민", "김윤규", "김태환", "이승구", "이찬규", "임동균"],
    "플밍": ["채병희", "김동현", "장지훈", "한성우"]
  },
  "5팀": {
    "기획": ["정수진", "천영현", "고승주", "권수빈", "김재환", "박기은", "박현수", "윤유나", "안성진"],
    "플밍": ["박언약", "나현수", "이승열", "조진행", "허범"]
  },
  "6팀": {
    "기획": ["예인해", "정우경", "곽용준", "김현우A", "박민규", "서진호", "유해찬", "정석현", "정재용"],
    "플밍": ["배정민", "김덕환", "김유훈", "손지원", "최원탁"]
  },
  "7팀": {
    "기획": ["김민수", "채지형", "김범진", "김시온", "배주빈", "오종호", "이동우", "임소영", "최선동"],
    "플밍": ["이성규", "김경민", "안정연"]
  },
  "8팀": {
    "기획": ["이형진", "이준혁", "김현우B", "신석균", "이가현", "이균호", "오동건", "장윤우", "한재환"],
    "플밍": ["정승우", "김영찬", "조규민", "최동훈", "홍정옥"]
  }
};

const state = {
  entries: [],
  teamNotes: [],
  studentReports: [],
  delayReviews: [],
  delayContexts: new Map(),
  openDelaySummaryKeys: new Set(),
  comments: [],
  user: null,
  view: "team",
  teamMode: "overview",
  part: "all",
  selectedStudent: "",
  historyTeam: "1팀",
  historyIndex: -1,
  studentMode: "overview",
  reportFilter: "all",
  exportStartDate: "",
  exportEndDate: "",
  ganttPeriod: "all",
  issueFilters: {
    date: "all",
    student: "all",
    decision: "all",
    sort: "date-desc"
  },
  filters: {
    team: "all",
    date: "all"
  }
};

const els = {
  authView: document.querySelector("#authView"),
  dashboardView: document.querySelector("#dashboardView"),
  loginForm: document.querySelector("#loginForm"),
  emailInput: document.querySelector("#emailInput"),
  passwordInput: document.querySelector("#passwordInput"),
  authMessage: document.querySelector("#authMessage"),
  logoutButton: document.querySelector("#logoutButton"),
  themeToggle: document.querySelector("#themeToggle"),
  configNotice: document.querySelector("#configNotice"),
  permissionNotice: document.querySelector("#permissionNotice"),
  todayNotice: document.querySelector("#todayNotice"),
  missingRosterNotice: document.querySelector("#missingRosterNotice"),
  teamTab: document.querySelector("#teamTab"),
  studentTab: document.querySelector("#studentTab"),
  adminTab: document.querySelector("#adminTab"),
  teamOverviewTab: document.querySelector("#teamOverviewTab"),
  teamDailyTab: document.querySelector("#teamDailyTab"),
  teamIssueTab: document.querySelector("#teamIssueTab"),
  overviewTab: document.querySelector("#overviewTab"),
  historyTab: document.querySelector("#historyTab"),
  reportTab: document.querySelector("#reportTab"),
  studentSearchInput: document.querySelector("#studentSearchInput"),
  jsonInput: document.querySelector("#jsonInput"),
  reportJsonInput: document.querySelector("#reportJsonInput"),
  exportDateCalendar: document.querySelector("#exportDateCalendar"),
  exportDateRangeText: document.querySelector("#exportDateRangeText"),
  exportTeamSelect: document.querySelector("#exportTeamSelect"),
  exportFirebaseButton: document.querySelector("#exportFirebaseButton"),
  exportMessage: document.querySelector("#exportMessage"),
  uploadMessage: document.querySelector("#uploadMessage"),
  adminStatus: document.querySelector("#adminStatus"),
  teamFilterButtons: document.querySelector("#teamFilterButtons"),
  historyTeamFilterButtons: document.querySelector("#historyTeamFilterButtons"),
  teamRosterTable: document.querySelector("#teamRosterTable"),
  dateStrip: document.querySelector("#dateStrip"),
  teamTaskSummary: document.querySelector("#teamTaskSummary"),
  teamPage: document.querySelector("#teamPage"),
  studentPage: document.querySelector("#studentPage"),
  adminPage: document.querySelector("#adminPage"),
  teamList: document.querySelector("#teamList"),
  studentHistory: document.querySelector("#studentHistory")
};

let auth = null;
let db = null;
let fb = null;

if (firebaseReady) {
  fb = await loadFirebase();
  const app = fb.initializeApp(config);
  if (config.appCheckSiteKey) {
    fb.initializeAppCheck(app, {
      provider: new fb.ReCaptchaEnterpriseProvider(config.appCheckSiteKey),
      isTokenAutoRefreshEnabled: true
    });
  }
  auth = fb.getAuth(app);
  db = fb.getFirestore(app);
  fb.onAuthStateChanged(auth, async (user) => {
    state.user = user;
    if (user) {
      showDashboard();
      await loadRemoteData();
    } else {
      showLogin();
    }
  });
} else {
  els.configNotice.classList.remove("is-hidden");
  showLogin();
}

els.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  els.authMessage.textContent = "";

  if (!firebaseReady) {
    state.user = {
      email: buildEmail(els.emailInput.value) || `preview${emailDomain}`,
      uid: "preview"
    };
    showDashboard();
    return;
  }

  try {
    await fb.signInWithEmailAndPassword(auth, buildEmail(els.emailInput.value), els.passwordInput.value);
  } catch (error) {
    els.authMessage.textContent = getAuthErrorMessage(error);
  }
});

els.logoutButton.addEventListener("click", async () => {
  if (firebaseReady) {
    await fb.signOut(auth);
  } else {
    state.user = null;
    showLogin();
  }
});

els.themeToggle.addEventListener("click", () => {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  localStorage.setItem("scrum-theme", next);
});

els.teamTab.addEventListener("click", () => setView("team"));
els.studentTab.addEventListener("click", () => setView("student"));
els.adminTab.addEventListener("click", () => {
  if (isAdmin()) {
    setView("admin");
  }
});
els.teamOverviewTab.addEventListener("click", () => setTeamMode("overview"));
els.teamDailyTab.addEventListener("click", () => setTeamMode("daily"));
els.teamIssueTab.addEventListener("click", () => setTeamMode("issue"));
els.overviewTab.addEventListener("click", () => setStudentMode("overview"));
els.historyTab.addEventListener("click", () => setStudentMode("history"));
els.reportTab.addEventListener("click", () => setStudentMode("report"));
els.studentSearchInput.addEventListener("input", () => {
  const match = findStudentByKeyword(els.studentSearchInput.value);
  if (match) {
    state.selectedStudent = match;
    renderStudentHistory();
  }
});

function setStudentMode(mode) {
  state.studentMode = mode;
  els.overviewTab.classList.toggle("is-active", mode === "overview");
  els.historyTab.classList.toggle("is-active", mode === "history");
  els.reportTab.classList.toggle("is-active", mode === "report");
  renderStudentHistory();
}

function setTeamMode(mode) {
  state.teamMode = mode;
  els.teamOverviewTab.classList.toggle("is-active", mode === "overview");
  els.teamDailyTab.classList.toggle("is-active", mode === "daily");
  els.teamIssueTab.classList.toggle("is-active", mode === "issue");
  render();
}

els.jsonInput.addEventListener("change", async (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  if (!isAdmin()) {
    alert("관리자 계정만 업로드할 수 있습니다.");
    event.target.value = "";
    return;
  }
  await uploadJsonFiles(files);
  event.target.value = "";
});

els.reportJsonInput?.addEventListener("change", async (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  if (!isAdmin()) {
    alert("관리자 계정만 보고서 JSON을 업로드할 수 있습니다.");
    event.target.value = "";
    return;
  }
  await uploadReportJsonFiles(files);
  event.target.value = "";
});

els.exportFirebaseButton?.addEventListener("click", async () => {
  if (!isAdmin()) {
    alert("관리자 계정만 Firebase 데이터를 추출할 수 있습니다.");
    return;
  }
  await exportFirebaseDataByPeriod();
});

function showLogin() {
  els.authView.classList.remove("is-hidden");
  els.dashboardView.classList.add("is-hidden");
}

function showDashboard() {
  els.authView.classList.add("is-hidden");
  els.dashboardView.classList.remove("is-hidden");
  syncAdminAccess();
  setAdminExportDefaults();
  render();
}

function setView(view) {
  if (view === "admin" && !isAdmin()) {
    view = "team";
  }
  state.view = view;
  els.teamTab.classList.toggle("is-active", view === "team");
  els.studentTab.classList.toggle("is-active", view === "student");
  els.adminTab.classList.toggle("is-active", view === "admin");
  els.teamPage.classList.toggle("is-hidden", view !== "team");
  els.studentPage.classList.toggle("is-hidden", view !== "student");
  els.adminPage.classList.toggle("is-hidden", view !== "admin");
  render();
}

function syncAdminAccess() {
  const allowed = isAdmin();
  els.adminTab.classList.toggle("is-hidden", !allowed);
  if (els.adminStatus) {
    els.adminStatus.textContent = `현재 계정: ${state.user?.email || "없음"} · 관리자 권한: ${allowed ? "확인됨" : "없음"}${isGuest() ? " · 게스트 읽기 전용" : ""}`;
  }
  if (!allowed && state.view === "admin") {
    setView("team");
  }
}

function setAdminExportDefaults() {
  const dates = availableExportDates();
  if (!dates.length) return;
  const selectedDate = state.filters.date !== "all" && dates.includes(state.filters.date)
    ? state.filters.date
    : dates[dates.length - 1];
  if (state.exportStartDate && !state.exportEndDate && dates.includes(state.exportStartDate)) {
    return;
  }
  if (!state.exportStartDate || !dates.includes(state.exportStartDate)) {
    state.exportStartDate = selectedDate;
  }
  if (!state.exportEndDate || !dates.includes(state.exportEndDate)) {
    state.exportEndDate = selectedDate;
  }
}

async function loadRemoteData() {
  if (!firebaseReady) {
    render();
    return;
  }

  try {
    els.permissionNotice.classList.add("is-hidden");
    const entriesSnapshot = await fb.getDocs(fb.query(fb.collection(db, "scrumEntries"), fb.orderBy("date", "desc")));
    state.entries = entriesSnapshot.docs.map((item) => item.data());

    try {
      const notesSnapshot = await fb.getDocs(fb.query(fb.collection(db, "scrumTeamNotes"), fb.orderBy("date", "desc")));
      state.teamNotes = notesSnapshot.docs.map((item) => item.data());
    } catch (notesError) {
      state.teamNotes = [];
      if (notesError?.code === "permission-denied") {
        els.permissionNotice.textContent = "scrumTeamNotes 읽기 권한이 없습니다. Firebase 보안 규칙에 scrumTeamNotes 권한을 추가하세요.";
        els.permissionNotice.classList.remove("is-hidden");
      } else {
        throw notesError;
      }
    }

    try {
      const reportsSnapshot = await fb.getDocs(fb.query(fb.collection(db, "scrumStudentReports"), fb.orderBy("period.endDate", "desc")));
      state.studentReports = reportsSnapshot.docs.map((item) => item.data());
    } catch (reportsError) {
      state.studentReports = [];
      if (reportsError?.code === "permission-denied") {
        els.permissionNotice.textContent = "scrumStudentReports 읽기 권한이 없습니다. Firebase 보안 규칙에 scrumStudentReports 권한을 추가하세요.";
        els.permissionNotice.classList.remove("is-hidden");
      } else {
        throw reportsError;
      }
    }

    try {
      const reviewsSnapshot = await fb.getDocs(fb.collection(db, "scrumDelayReviews"));
      state.delayReviews = reviewsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    } catch (reviewsError) {
      state.delayReviews = [];
      if (reviewsError?.code === "permission-denied") {
        els.permissionNotice.textContent = "scrumDelayReviews 읽기 권한이 없습니다. Firebase 보안 규칙에 scrumDelayReviews 권한을 추가하세요.";
        els.permissionNotice.classList.remove("is-hidden");
      } else {
        throw reviewsError;
      }
    }

    render();
  } catch (error) {
    if (error?.code === "permission-denied") {
      els.permissionNotice.textContent = "Firestore 읽기 권한이 없습니다. Firebase 보안 규칙에서 현재 로그인 계정의 권한을 확인하세요.";
      els.permissionNotice.classList.remove("is-hidden");
      render();
      return;
    }
    throw error;
  }
}

async function importEntries(entries, options = {}) {
  if (!entries.length) return;

  if (options.overwrite && options.team && options.date) {
    await removeEntriesForTeamDate(options.team, options.date);
  }

  if (firebaseReady) {
    await Promise.all(entries.map((entry) => {
      const id = [entry.team, entry.date, entry.student].map(slug).join("_");
      return fb.setDoc(fb.doc(db, "scrumEntries", id), entry, { merge: true });
    }));
    await loadRemoteData();
  } else {
    const existing = new Map(state.entries.map((entry) => {
      return [[entry.team, entry.date, entry.student].join("|"), entry];
    }));
    entries.forEach((entry) => existing.set([entry.team, entry.date, entry.student].join("|"), entry));
    state.entries = Array.from(existing.values());
    render();
  }
}

async function importTeamNotes(notes, options = {}) {
  if (!options.team || !options.date) return;

  if (options.overwrite) {
    await removeTeamNotesForTeamDate(options.team, options.date);
  }

  if (!notes.length) return;

  if (firebaseReady) {
    await Promise.all(notes.map((note, index) => {
      const id = [note.team, note.date, index + 1].map(slug).join("_");
      return fb.setDoc(fb.doc(db, "scrumTeamNotes", id), note, { merge: true });
    }));
    return;
  }

  state.teamNotes = state.teamNotes.filter((note) => !(note.team === options.team && note.date === options.date));
  state.teamNotes.push(...notes);
}

async function importStudentReports(reports, options = {}) {
  if (!reports.length) return;

  if (options.overwrite && options.team && options.date) {
    await removeStudentReportsForTeamDate(options.team, options.date);
  }

  if (firebaseReady) {
    await Promise.all(reports.map((report) => {
      const id = studentReportId(report);
      return fb.setDoc(fb.doc(db, "scrumStudentReports", id), report, { merge: true });
    }));
    return;
  }

  const existing = new Map(state.studentReports.map((report) => [studentReportId(report), report]));
  reports.forEach((report) => existing.set(studentReportId(report), report));
  state.studentReports = Array.from(existing.values());
}

async function removeEntriesForTeamDate(team, date) {
  if (firebaseReady) {
    const snapshot = await fb.getDocs(fb.query(
      fb.collection(db, "scrumEntries"),
      fb.where("team", "==", team),
      fb.where("date", "==", date)
    ));
    await Promise.all(snapshot.docs.map((item) => fb.deleteDoc(fb.doc(db, "scrumEntries", item.id))));
    return;
  }

  state.entries = state.entries.filter((entry) => !(entry.team === team && entry.date === date));
}

async function removeTeamNotesForTeamDate(team, date) {
  if (firebaseReady) {
    const snapshot = await fb.getDocs(fb.query(
      fb.collection(db, "scrumTeamNotes"),
      fb.where("team", "==", team),
      fb.where("date", "==", date)
    ));
    await Promise.all(snapshot.docs.map((item) => fb.deleteDoc(fb.doc(db, "scrumTeamNotes", item.id))));
    return;
  }

  state.teamNotes = state.teamNotes.filter((note) => !(note.team === team && note.date === date));
}

async function removeStudentReportsForTeamDate(team, date) {
  if (firebaseReady) {
    const snapshot = await fb.getDocs(fb.query(
      fb.collection(db, "scrumStudentReports"),
      fb.where("team", "==", team),
      fb.where("date", "==", date)
    ));
    await Promise.all(snapshot.docs.map((item) => fb.deleteDoc(fb.doc(db, "scrumStudentReports", item.id))));
    return;
  }

  state.studentReports = state.studentReports.filter((report) => !(report.team === team && report.date === date));
}

async function uploadJsonFiles(files) {
  const invalid = files.find((file) => !parseScrumFileName(file.name));
  if (invalid) {
    setUploadMessage(`파일명 형식이 맞지 않습니다: ${invalid.name}`, true);
    alert("파일명은 yyyy-mm-dd_team번호.json 형식이어야 합니다. 예: 2026-05-27_team1.json");
    return;
  }

  try {
    setUploadMessage(`${files.length}개 파일을 업로드 중입니다...`);
    for (const file of files) {
      const fileInfo = parseScrumFileName(file.name);
      const parsed = JSON.parse(await file.text());
      const entries = normalizeEntries(parsed, { team: fileInfo.team, date: fileInfo.date });
      const teamNotes = normalizeTeamNotes(parsed, { team: fileInfo.team, date: fileInfo.date });
      const studentReports = normalizeStudentReports(parsed, { team: fileInfo.team, date: fileInfo.date });
      await importEntries(entries, {
        team: fileInfo.team,
        date: fileInfo.date,
        overwrite: true
      });
      await importTeamNotes(teamNotes, {
        team: fileInfo.team,
        date: fileInfo.date,
        overwrite: true
      });
      await importStudentReports(studentReports, {
        team: fileInfo.team,
        date: fileInfo.date,
        overwrite: true
      });
      if (firebaseReady) {
        await loadRemoteData();
      } else {
        render();
      }
    }
    setUploadMessage(`${files.length}개 파일 업로드를 완료했습니다.`);
  } catch (error) {
    if (error?.code === "permission-denied") {
      setUploadMessage(`Firestore 업로드 권한이 없습니다. 현재 계정: ${state.user?.email || "없음"}`, true);
      return;
    }
    setUploadMessage("업로드 중 오류가 발생했습니다. JSON 형식과 Firebase 권한을 확인하세요.", true);
  }
}

async function uploadReportJsonFiles(files) {
  try {
    setUploadMessage(`${files.length}개 보고서 파일을 업로드 중입니다...`);
    let total = 0;
    for (const file of files) {
      const parsed = JSON.parse(await file.text());
      const reports = normalizeStudentReports(parsed);
      if (!reports.length) {
        throw new Error(`보고서 데이터가 없습니다: ${file.name}`);
      }
      await importStudentReports(reports);
      total += reports.length;
    }
    if (firebaseReady) {
      await loadRemoteData();
    } else {
      render();
    }
    setUploadMessage(`보고서 ${total}건 업로드를 완료했습니다.`);
  } catch (error) {
    if (error?.code === "permission-denied") {
      setUploadMessage(`보고서 업로드 권한이 없습니다. 현재 계정: ${state.user?.email || "없음"}`, true);
      return;
    }
    setUploadMessage(`보고서 업로드 중 오류가 발생했습니다. ${error?.message || "JSON 형식을 확인하세요."}`, true);
  }
}

async function exportFirebaseDataByPeriod() {
  const startDate = normalizeDateKey(state.exportStartDate);
  const endDate = normalizeDateKey(state.exportEndDate);
  const team = clean(els.exportTeamSelect?.value || "all");

  if (!startDate || !endDate) {
    setExportMessage("달력에서 시작일과 종료일을 선택하세요.", true);
    return;
  }
  if (startDate > endDate) {
    setExportMessage("시작일은 종료일보다 늦을 수 없습니다.", true);
    return;
  }

  const teams = team === "all" ? monitoredTeams : [team];
  if (firebaseReady) {
    setExportMessage("Firebase 최신 데이터를 불러오는 중입니다...");
    await loadRemoteData();
  }
  const payload = {
    exportedAt: new Date().toISOString(),
    source: "firebase-admin-export",
    period: {
      startDate,
      endDate
    },
    teams,
    scrumEntries: state.entries.filter((entry) => {
      return teams.includes(entry.team) && dateInRange(entry.date, startDate, endDate);
    }).map(sanitizeForExport),
    scrumTeamNotes: state.teamNotes.filter((note) => {
      return teams.includes(note.team) && dateInRange(note.date, startDate, endDate);
    }).map(sanitizeForExport),
    scrumDelayReviews: state.delayReviews.filter((review) => {
      const reviewTeam = clean(review.team || review.context?.team);
      const reviewDate = clean(review.currentDate || review.date || review.context?.date);
      return (!reviewTeam || teams.includes(reviewTeam)) && dateInRange(reviewDate, startDate, endDate);
    }).map(sanitizeForExport),
    scrumStudentReports: state.studentReports.filter((report) => {
      return teams.includes(report.team) && reportIntersectsPeriod(report, startDate, endDate);
    }).map(sanitizeForExport)
  };

  const filename = `firebase-export_${startDate}_${endDate}_${team === "all" ? "all-teams" : slug(team)}.json`;
  downloadJson(filename, payload);
  setExportMessage(`데이터 추출 완료: 작업 ${payload.scrumEntries.length}건, 특이사항 ${payload.scrumTeamNotes.length}건, 검토 ${payload.scrumDelayReviews.length}건, 보고서 ${payload.scrumStudentReports.length}건`);
}

function setExportMessage(message, isError = false) {
  if (!els.exportMessage) return;
  els.exportMessage.textContent = message;
  els.exportMessage.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function downloadJson(filename, payload) {
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function sanitizeForExport(value) {
  if (value == null) return value;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(sanitizeForExport);
  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeForExport(item)]));
  }
  return value;
}

function setUploadMessage(message, isError = false) {
  if (!els.uploadMessage) return;
  els.uploadMessage.textContent = message;
  els.uploadMessage.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function normalizeEntries(payload, override = {}) {
  const rows = Array.isArray(payload) ? payload : payload.entries || [];
  return rows.map((row) => ({
    team: clean(override.team || row.team),
    date: clean(override.date || row.date),
    part: clean(row.part),
    student: clean(row.student),
    tasks: Array.isArray(row.tasks) ? row.tasks.map((task) => ({
      title: clean(task.title),
      deadline: parseDeadlineValue(task.deadline),
      deadlineText: clean(task.deadlineText),
      note: clean(task.note)
    })).filter((task) => task.title) : [],
    specialNote: clean(row.specialNote),
    statusComparedToPrevious: clean(row.statusComparedToPrevious)
  })).filter((row) => row.team && row.date && row.student);
}

function normalizeTeamNotes(payload, override = {}) {
  const rows = Array.isArray(payload?.teamSpecialNotes) ? payload.teamSpecialNotes : [];
  return rows.map((row) => ({
    team: clean(override.team || row.team),
    date: clean(override.date || row.date),
    type: clean(row.type || "note"),
    title: clean(row.title),
    message: clean(row.message),
    items: Array.isArray(row.items) ? row.items.map((item) => ({
      part: clean(item.part),
      student: clean(item.student),
      taskTitle: clean(item.taskTitle),
      previousDate: clean(item.previousDate),
      previousDeadline: parseDeadlineValue(item.previousDeadline),
      previousDeadlineText: clean(item.previousDeadlineText),
      currentDate: clean(item.currentDate || item.date),
      currentDeadline: parseDeadlineValue(item.currentDeadline),
      currentDeadlineText: clean(item.currentDeadlineText),
      note: clean(item.note)
    })).filter((item) => item.student || item.taskTitle || item.note) : []
  })).filter((row) => row.team && row.date && (row.title || row.message || row.items.length));
}

function normalizeStudentReports(payload, override = {}) {
  const rows = Array.isArray(payload?.studentReports)
    ? payload.studentReports
    : Array.isArray(payload?.scrumStudentReports)
      ? payload.scrumStudentReports
      : [];
  return rows.map((row) => {
    const period = normalizeReportPeriod(row.period);
    const milestone = normalizeReportPeriod(row.milestone);
    return {
      team: clean(override.team || row.team),
      date: clean(override.date || row.date),
      student: clean(row.student),
      part: clean(row.part),
      reportType: clean(row.reportType || "weekly"),
      period,
      milestone,
      summary: clean(row.summary),
      taskAnalysis: normalizeReportTasks(row.taskAnalysis),
      stats: normalizeReportStats(row.stats),
      gantt: normalizeReportGantt(row.gantt),
      notice: clean(row.notice) || "보고된 데일리 스크럼을 기준으로 AI가 정리한 문서입니다. 실제 수행 내용과 다를 수 있으니 참고용으로만 확인해 주세요."
    };
  }).filter((row) => row.team && row.date && row.student && row.reportType && row.period.startDate && row.period.endDate);
}

function normalizeReportPeriod(value = {}) {
  return {
    label: clean(value.label),
    name: clean(value.name),
    startDate: normalizeDateKey(value.startDate),
    endDate: normalizeDateKey(value.endDate)
  };
}

function normalizeReportTasks(rows) {
  return Array.isArray(rows) ? rows.map((row) => ({
    title: clean(row.title),
    startDate: normalizeDateKey(row.startDate),
    endDate: normalizeDateKey(row.endDate),
    deadline: parseDeadlineValue(row.deadline),
    status: clean(row.status),
    delayReason: clean(row.delayReason),
    evidenceDates: Array.isArray(row.evidenceDates) ? row.evidenceDates.map(normalizeDateKey).filter(Boolean) : [],
    note: clean(row.note)
  })).filter((row) => row.title) : [];
}

function normalizeReportGantt(rows) {
  return Array.isArray(rows) ? rows.map((row) => ({
    title: clean(row.title),
    startDate: normalizeDateKey(row.startDate),
    endDate: normalizeDateKey(row.endDate),
    deadline: parseDeadlineValue(row.deadline),
    status: clean(row.status)
  })).filter((row) => row.title && row.startDate && row.endDate) : [];
}

function normalizeReportStats(value = {}) {
  return {
    reportedDays: numberOrZero(value.reportedDays),
    taskCount: numberOrZero(value.taskCount),
    deadlineTaskCount: numberOrZero(value.deadlineTaskCount),
    delayedIssueCount: numberOrZero(value.delayedIssueCount),
    specialNoteCount: numberOrZero(value.specialNoteCount)
  };
}

function render() {
  preserveOpenDelaySummaries();
  state.delayContexts = new Map();
  syncFilterOptions();
  renderExportDateCalendar();
  const entries = filteredEntries();
  renderTodayNotice();
  renderMissingRosterNotice();
  els.dateStrip.classList.toggle("is-hidden", state.teamMode !== "daily");
  if (state.teamMode === "overview") {
    els.teamTaskSummary.classList.remove("is-hidden");
    renderTeamOverview(teamOverviewEntries());
    els.teamList.innerHTML = "";
  } else if (state.teamMode === "issue") {
    els.teamTaskSummary.classList.remove("is-hidden");
    renderIssueHistory();
    els.teamList.innerHTML = "";
  } else {
    const entries = filteredEntries();
    const teamNotes = storedTeamNotesForEntries(entries);
    const delayedItems = teamNotes.length ? [] : delayedTaskItems(entries);
    const summaryHtml = renderTeamSpecialNotes(teamNotes) || renderDelayedTaskSummary(delayedItems);
    els.teamTaskSummary.innerHTML = summaryHtml;
    els.teamTaskSummary.classList.toggle("is-hidden", !summaryHtml);
    renderTeamList(entries);
  }
  renderStudentHistory();
  restoreOpenDelaySummaries();
  bindDelayReviewButtons();
}

function renderTodayNotice() {
  const today = todayKey();
  const teams = unique([...monitoredTeams, ...state.entries.map((entry) => entry.team)]);
  const uploadedToday = unique(state.entries.filter((entry) => entry.date === today).map((entry) => entry.team));

  if (!uploadedToday.length) {
    els.todayNotice.textContent = `오늘(${today}) 데일리 스크럼이 아직 업로드되지 않았습니다.`;
    els.todayNotice.classList.remove("is-hidden");
    return;
  }

  const missing = teams.filter((team) => !uploadedToday.includes(team));
  if (missing.length) {
    els.todayNotice.textContent = `오늘(${today}) 데일리 스크럼 미업로드 팀: ${missing.join(", ")}`;
    els.todayNotice.classList.remove("is-hidden");
    return;
  }

  els.todayNotice.classList.add("is-hidden");
}

function renderMissingRosterNotice() {
  if (!els.missingRosterNotice || state.view !== "team" || state.filters.date === "all") {
    els.missingRosterNotice?.classList.add("is-hidden");
    return;
  }

  const team = state.filters.team;
  const roster = teamRoster[team];
  if (!roster) {
    els.missingRosterNotice.classList.add("is-hidden");
    return;
  }

  const reported = new Set(state.entries
    .filter((entry) => entry.team === team && entry.date === state.filters.date)
    .map((entry) => entry.student));
  const missingByPart = Object.entries(roster)
    .map(([part, students]) => {
      const missing = students.filter((student) => {
        if (part === "기획" && ["팀장", "PM"].includes(getRosterRole(team, part, student))) {
          return false;
        }
        return !reported.has(student);
      });
      return missing.length ? `${part}: ${missing.join(", ")}` : "";
    })
    .filter(Boolean);

  if (!missingByPart.length) {
    els.missingRosterNotice.classList.add("is-hidden");
    return;
  }

  els.missingRosterNotice.textContent = `${state.filters.date} ${team} 데이터 누락 인원: ${missingByPart.join(" / ")}`;
  els.missingRosterNotice.classList.remove("is-hidden");
}

function syncFilterOptions() {
  const dates = unique(state.entries.map((entry) => entry.date)).sort().reverse();

  if (!monitoredTeams.includes(state.filters.team)) {
    state.filters.team = monitoredTeams[0];
  }
  if (!monitoredTeams.includes(state.historyTeam)) {
    state.historyTeam = monitoredTeams[0];
  }
  renderTeamFilterButtons();
  renderHistoryTeamFilterButtons();
  focusTodayDate(dates);
  renderDateStrip(dates);
}

function renderTeamFilterButtons() {
  els.teamFilterButtons.innerHTML = monitoredTeams.map((team) => `
    <button class="team-filter-button ${state.filters.team === team ? "is-active" : ""}" type="button" data-team="${escapeHtml(team)}">
      ${escapeHtml(team)}
    </button>
  `).join("");

  els.teamFilterButtons.querySelectorAll(".team-filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.filters.team = button.dataset.team || monitoredTeams[0];
      render();
    });
  });
}

function renderHistoryTeamFilterButtons() {
  els.historyTeamFilterButtons.innerHTML = monitoredTeams.map((team) => `
    <button class="team-filter-button ${state.historyTeam === team ? "is-active" : ""}" type="button" data-team="${escapeHtml(team)}">
      ${escapeHtml(team)}
    </button>
  `).join("");

  els.historyTeamFilterButtons.querySelectorAll(".team-filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.historyTeam = button.dataset.team || monitoredTeams[0];
      state.selectedStudent = firstStudentInTeam(state.historyTeam);
      state.historyIndex = -1;
      els.studentSearchInput.value = "";
      renderStudentHistory();
      renderHistoryTeamFilterButtons();
    });
  });
}

function focusTodayDate(dates) {
  const today = todayKey();
  if (state.filters.date === "all" && dates.includes(today)) {
    state.filters.date = today;
    return;
  }
  if (state.filters.date === "all" && dates.length) {
    state.filters.date = dates[0];
  }
}

function renderDateStrip(dates) {
  if (!dates.length) {
    els.dateStrip.innerHTML = `<div class="empty-state">업로드된 날짜가 없습니다.</div>`;
    return;
  }

  els.dateStrip.innerHTML = dates.map((date) => {
    const dateObj = new Date(`${date}T00:00:00`);
    const weekday = Number.isNaN(dateObj.getTime())
      ? ""
      : dateObj.toLocaleDateString("ko-KR", { weekday: "short" });
    const day = date.slice(8, 10);
    return `
      <button class="date-pill ${date === state.filters.date ? "is-active" : ""}" type="button" data-date="${escapeHtml(date)}">
        <span>${escapeHtml(weekday)}</span>
        <strong>${escapeHtml(day)}</strong>
        <small>${escapeHtml(date)}</small>
      </button>
    `;
  }).join("");

  document.querySelectorAll(".date-pill").forEach((button) => {
    button.addEventListener("click", () => {
      state.filters.date = button.dataset.date || state.filters.date;
      render();
    });
  });
}

function availableExportDates() {
  return unique([
    ...state.entries.map((entry) => entry.date),
    ...state.teamNotes.map((note) => note.date),
    ...state.delayReviews.map((review) => review.currentDate || review.date || review.context?.date),
    ...state.studentReports.flatMap((report) => [report.date, report.period?.startDate, report.period?.endDate])
  ].map(normalizeDateKey).filter(Boolean)).sort();
}

function renderExportDateCalendar() {
  if (!els.exportDateCalendar || !els.exportDateRangeText) return;
  const dates = availableExportDates();
  setAdminExportDefaults();

  if (!dates.length) {
    els.exportDateCalendar.innerHTML = `<div class="empty-state">추출 가능한 데이터 날짜가 없습니다.</div>`;
    els.exportDateRangeText.textContent = "Firebase 데이터를 먼저 업로드하거나 불러오세요.";
    return;
  }

  const startDate = normalizeDateKey(state.exportStartDate);
  const endDate = normalizeDateKey(state.exportEndDate);
  const minDate = dateFromKey(dates[0]);
  const maxDate = dateFromKey(dates[dates.length - 1]);
  const monthCursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const monthEnd = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  const availableSet = new Set(dates);
  const monthBlocks = [];

  while (monthCursor <= monthEnd) {
    monthBlocks.push(renderExportCalendarMonth(new Date(monthCursor), availableSet, startDate, endDate));
    monthCursor.setMonth(monthCursor.getMonth() + 1);
  }

  els.exportDateCalendar.innerHTML = monthBlocks.join("");
  els.exportDateRangeText.textContent = endDate
    ? `${formatDateKeyShort(startDate)} ~ ${formatDateKeyShort(endDate)} 기간 데이터를 추출합니다.`
    : `${formatDateKeyShort(startDate)}부터 선택했습니다. 종료일을 선택하세요.`;

  els.exportDateCalendar.querySelectorAll("[data-export-date]").forEach((button) => {
    button.addEventListener("click", () => {
      selectExportDate(button.dataset.exportDate);
    });
  });
}

function renderExportCalendarMonth(monthDate, availableSet, startDate, endDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const cells = [];

  for (let i = 0; i < first.getDay(); i += 1) {
    cells.push(`<span class="export-date-cell is-blank"></span>`);
  }

  for (let day = 1; day <= last.getDate(); day += 1) {
    const date = new Date(year, month, day);
    const key = dateKey(date);
    const hasData = availableSet.has(key);
    const isStart = key === startDate;
    const isEnd = key === endDate;
    const inRange = startDate && endDate && key >= startDate && key <= endDate;
    const classes = [
      "export-date-cell",
      hasData ? "has-data" : "is-disabled",
      inRange ? "is-in-range" : "",
      isStart ? "is-start" : "",
      isEnd ? "is-end" : "",
      isOffDay(date) ? "is-off-day" : ""
    ].filter(Boolean).join(" ");

    cells.push(`
      <button class="${classes}" type="button" data-export-date="${escapeHtml(key)}" ${hasData ? "" : "disabled"}>
        ${escapeHtml(String(day))}
      </button>
    `);
  }

  return `
    <section class="export-calendar-month">
      <h4>${escapeHtml(String(year))}.${escapeHtml(String(month + 1).padStart(2, "0"))}</h4>
      <div class="export-calendar-weekdays">
        ${["일", "월", "화", "수", "목", "금", "토"].map((day) => `<span>${day}</span>`).join("")}
      </div>
      <div class="export-calendar-grid">
        ${cells.join("")}
      </div>
    </section>
  `;
}

function selectExportDate(date) {
  const key = normalizeDateKey(date);
  if (!key) return;

  if (!state.exportStartDate || (state.exportStartDate && state.exportEndDate)) {
    state.exportStartDate = key;
    state.exportEndDate = "";
  } else if (key < state.exportStartDate) {
    state.exportEndDate = state.exportStartDate;
    state.exportStartDate = key;
  } else {
    state.exportEndDate = key;
  }

  if (!state.exportEndDate) {
    els.exportDateRangeText.textContent = `${formatDateKeyShort(state.exportStartDate)}부터 선택했습니다. 종료일을 선택하세요.`;
  }
  renderExportDateCalendar();
}

function filteredEntries() {
  return state.entries.filter((entry) => {
    return (state.filters.team === "all" || entry.team === state.filters.team)
      && (state.filters.date === "all" || entry.date === state.filters.date);
  }).sort((a, b) => b.date.localeCompare(a.date) || a.team.localeCompare(b.team) || a.student.localeCompare(b.student));
}

function teamOverviewEntries() {
  return state.entries
    .filter((entry) => state.filters.team === "all" || entry.team === state.filters.team)
    .sort((a, b) => a.date.localeCompare(b.date) || compareByRole(a, b));
}

function renderTeamList(entries) {
  const teamEntries = entries.sort(compareByRole);
  const plannedEntries = teamEntries.filter((entry) => entry.part === "기획");
  const devEntries = teamEntries.filter((entry) => entry.part === "플밍");

  if (!teamEntries.length) {
    els.teamList.innerHTML = `<div class="empty-state">업로드된 작업 데이터가 없습니다.</div>`;
    return;
  }

  els.teamList.innerHTML = `
    <section class="team-board">
      ${renderTeamColumn("기획", plannedEntries)}
      ${renderTeamColumn("플밍", devEntries)}
    </section>
  `;

  document.querySelectorAll(".student-link").forEach((button) => {
    button.addEventListener("click", () => {
      selectStudent(button.dataset.student || "", button.dataset.team || "");
      setView("student");
    });
  });
}

function renderTeamOverview(entries) {
  const rows = consolidateGanttRows(ganttRows(entries));

  if (!rows.length) {
    els.teamTaskSummary.innerHTML = `<div class="empty-state">등록된 작업 데이터가 없습니다.</div>`;
    return;
  }

  const range = ganttRange();
  const ticks = ganttTicks(range);
  const planRows = rows.filter((row) => row.part === "기획");
  const devRows = rows.filter((row) => row.part === "플밍");

  els.teamTaskSummary.innerHTML = `
    <div class="task-summary-head">
      <h2>${escapeHtml(state.filters.team)} 작업 개요</h2>
      <span>${escapeHtml(range.label)}</span>
    </div>
    ${renderGanttPeriodControls()}
    <div class="gantt-board">
      ${renderGanttGroup("기획", planRows, range, ticks)}
      ${renderGanttGroup("플밍", devRows, range, ticks)}
    </div>
  `;
  bindGanttPeriodControls();
}

function renderIssueHistory() {
  const allIssues = issueHistoryItems();
  const visibleIssues = allIssues.filter((item) => item.decision !== "rejected");
  const rejectedIssues = allIssues.filter((item) => item.decision === "rejected");
  syncIssueFilters(visibleIssues);
  const issues = filteredIssueHistoryItems(visibleIssues);
  els.teamTaskSummary.innerHTML = `
    <div class="task-summary-head">
      <h2>${escapeHtml(state.filters.team)} 이슈 히스토리</h2>
      <span>${escapeHtml(`${issues.length}/${visibleIssues.length}건`)}</span>
    </div>
    ${renderIssueHistoryControls(visibleIssues, rejectedIssues.length)}
    ${issues.length ? `
      ${renderIssueHistoryTable(issues)}
    ` : `<div class="empty-state">등록된 이슈가 없습니다.</div>`}
  `;
  bindIssueHistoryControls();
  bindIssueHistoryRows();
}

function issueHistoryItems() {
  const selectedTeam = state.filters.team;
  const stored = state.teamNotes
    .filter((note) => note.team === selectedTeam)
    .flatMap((note) => (note.items || [])
      .filter((item) => isActionableDelayItem(item, note))
      .map((item) => buildDelayContext(item, note)));

  const storedKeys = new Set(stored.map((item) => item.key));
  const computed = state.entries
    .filter((entry) => entry.team === selectedTeam)
    .flatMap((entry) => delayedTaskItems([entry]).map(({ task, previous }) => buildDelayContext({
      team: entry.team,
      date: entry.date,
      part: entry.part,
      student: entry.student,
      taskTitle: task.title,
      previousTaskTitle: previous.task.title,
      previousDate: previous.entry.date,
      previousDeadline: previous.task.deadline,
      previousDeadlineText: previous.task.deadlineText,
      currentDeadline: task.deadline,
      currentDeadlineText: task.deadlineText,
      note: ""
    }, { team: entry.team, date: entry.date })))
    .filter((item) => !storedKeys.has(item.key));

  return uniqueIssueContexts([...stored, ...computed])
    .map((context) => {
      state.delayContexts.set(context.key, context);
      const review = delayReviewForKey(context.key);
      return {
        ...context,
        review,
        decision: normalizeReviewDecision(review?.decision)
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date)
      || a.part.localeCompare(b.part)
      || a.student.localeCompare(b.student)
      || a.currentTitle.localeCompare(b.currentTitle));
}

function uniqueIssueContexts(items) {
  const uniqueItems = new Map();
  items.forEach((item) => {
    const key = issueIdentityKey(item);
    if (!uniqueItems.has(key)) {
      uniqueItems.set(key, item);
      return;
    }

    const existing = uniqueItems.get(key);
    const existingHasReview = Boolean(delayReviewForKey(existing.key));
    const itemHasReview = Boolean(delayReviewForKey(item.key));
    if (itemHasReview && !existingHasReview) {
      uniqueItems.set(key, item);
      return;
    }

    const existingHasPreviousDate = Boolean(existing.previousDate);
    if (!existingHasPreviousDate && item.previousDate) {
      uniqueItems.set(key, item);
    }
  });
  return Array.from(uniqueItems.values());
}

function issueIdentityKey(item) {
  return [
    item.team,
    item.date,
    item.part,
    item.student,
    normalizedTaskTitle(item.currentTitle || item.note)
  ].join("|");
}

function syncIssueFilters(issues) {
  const dates = new Set(issues.map((item) => item.date));
  const students = new Set(issues.map((item) => item.student));
  const decisions = new Set(issues.map((item) => item.decision));
  if (state.issueFilters.date !== "all" && !dates.has(state.issueFilters.date)) state.issueFilters.date = "all";
  if (state.issueFilters.student !== "all" && !students.has(state.issueFilters.student)) state.issueFilters.student = "all";
  if (state.issueFilters.decision !== "all" && !decisions.has(state.issueFilters.decision)) state.issueFilters.decision = "all";
}

function filteredIssueHistoryItems(issues) {
  const filtered = issues.filter((item) => {
    return (state.issueFilters.date === "all" || item.date === state.issueFilters.date)
      && (state.issueFilters.student === "all" || item.student === state.issueFilters.student)
      && (state.issueFilters.decision === "all" || item.decision === state.issueFilters.decision);
  });
  return sortIssueHistoryItems(filtered);
}

function sortIssueHistoryItems(issues) {
  const decisionOrder = { pending: 0, confirmed: 1, rejected: 2 };
  return [...issues].sort((a, b) => {
    if (state.issueFilters.sort === "date-asc") return a.date.localeCompare(b.date) || a.student.localeCompare(b.student);
    if (state.issueFilters.sort === "student") return a.student.localeCompare(b.student) || b.date.localeCompare(a.date);
    if (state.issueFilters.sort === "decision") return (decisionOrder[a.decision] ?? 9) - (decisionOrder[b.decision] ?? 9) || b.date.localeCompare(a.date);
    return b.date.localeCompare(a.date) || a.student.localeCompare(b.student);
  });
}

function renderIssueHistoryControls(issues, rejectedCount = 0) {
  const dates = unique(issues.map((item) => item.date)).sort().reverse();
  const students = unique(issues.map((item) => item.student));
  return `
    <div class="issue-history-controls">
      <label>
        보고일
        <select data-issue-filter="date">
          <option value="all">전체</option>
          ${dates.map((date) => `<option value="${escapeHtml(date)}" ${state.issueFilters.date === date ? "selected" : ""}>${escapeHtml(formatDateKeyShort(date))}</option>`).join("")}
        </select>
      </label>
      <label>
        작업인원
        <select data-issue-filter="student">
          <option value="all">전체</option>
          ${students.map((student) => `<option value="${escapeHtml(student)}" ${state.issueFilters.student === student ? "selected" : ""}>${escapeHtml(student)}</option>`).join("")}
        </select>
      </label>
      <label>
        상태
        <select data-issue-filter="decision">
          <option value="all">전체</option>
          ${["pending", "confirmed"].map((decision) => `<option value="${decision}" ${state.issueFilters.decision === decision ? "selected" : ""}>${escapeHtml(reviewLabel(decision))}</option>`).join("")}
        </select>
      </label>
      <label>
        정렬
        <select data-issue-filter="sort">
          <option value="date-desc" ${state.issueFilters.sort === "date-desc" ? "selected" : ""}>보고일 최신순</option>
          <option value="date-asc" ${state.issueFilters.sort === "date-asc" ? "selected" : ""}>보고일 오래된순</option>
          <option value="student" ${state.issueFilters.sort === "student" ? "selected" : ""}>작업인원순</option>
          <option value="decision" ${state.issueFilters.sort === "decision" ? "selected" : ""}>상태순</option>
        </select>
      </label>
      ${isGuest() ? "" : `
        <button id="showRejectedIssuesButton" class="ghost-button" type="button" ${rejectedCount ? "" : "disabled"}>
          제외한 이슈 확인하기 ${escapeHtml(String(rejectedCount))}
        </button>
      `}
    </div>
  `;
}

function renderIssueHistoryTable(issues) {
  return `
    <div class="issue-history-table-wrap">
      <table class="issue-history-table">
        <thead>
          <tr>
            <th>보고일</th>
            <th>작업인원</th>
            <th>작업</th>
            <th>이전 마감</th>
            <th>현재 마감</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          ${issues.map(renderIssueHistoryRow).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderIssueHistoryRow(item) {
  const isRejected = item.decision === "rejected";
  return `
    <tr class="${isRejected ? "is-disabled" : ""}" data-issue-key="${escapeHtml(item.key)}" tabindex="0">
      <td>${escapeHtml(formatDateKeyShort(item.date))}</td>
      <td>
        <strong>${escapeHtml(item.student)}</strong>
        <small>${escapeHtml(item.part)}</small>
      </td>
      <td>
        <span>${escapeHtml(item.currentTitle || item.note || "작업명 확인 필요")}</span>
        ${item.review?.comment ? `<small class="issue-comment-inline">${escapeHtml(item.review.comment)}</small>` : ""}
      </td>
      <td>${escapeHtml(item.previousDeadlineLabel)}</td>
      <td>${escapeHtml(item.currentDeadlineLabel)}</td>
      <td><span class="delay-review-chip ${decisionClass(item.decision)}">${escapeHtml(reviewLabel(item.decision))}</span></td>
    </tr>
  `;
}

function bindIssueHistoryControls() {
  document.querySelectorAll("[data-issue-filter]").forEach((select) => {
    select.addEventListener("change", () => {
      const key = select.dataset.issueFilter;
      state.issueFilters[key] = select.value;
      renderIssueHistory();
      bindDelayReviewButtons();
    });
  });
  document.querySelector("#showRejectedIssuesButton")?.addEventListener("click", () => {
    openRejectedIssuesModal(issueHistoryItems().filter((item) => item.decision === "rejected"));
  });
}

function openRejectedIssuesModal(items) {
  const modal = ensureDelayReviewModal();
  modal.innerHTML = `
    <div class="review-modal-backdrop" data-review-close="true"></div>
    <section class="review-modal-panel" role="dialog" aria-modal="true" aria-label="제외한 이슈 확인">
      <div class="review-modal-head">
        <div>
          <p class="eyebrow">${escapeHtml(state.filters.team)} · 제외 이슈</p>
          <h2>제외한 이슈 확인</h2>
        </div>
        <button class="icon-button" type="button" data-review-close="true" aria-label="닫기">×</button>
      </div>
      ${items.length ? `
        <div class="issue-history-table-wrap">
          <table class="issue-history-table">
            <thead>
              <tr>
                <th>보고일</th>
                <th>작업인원</th>
                <th>작업</th>
                <th>이전 마감</th>
                <th>현재 마감</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item) => `
                <tr data-rejected-issue-key="${escapeHtml(item.key)}" tabindex="0">
                  <td>${escapeHtml(formatDateKeyShort(item.date))}</td>
                  <td>
                    <strong>${escapeHtml(item.student)}</strong>
                    <small>${escapeHtml(item.part)}</small>
                  </td>
                  <td>
                    <span>${escapeHtml(item.currentTitle || item.note || "작업명 확인 필요")}</span>
                    ${item.review?.comment ? `<small class="issue-comment-inline">${escapeHtml(item.review.comment)}</small>` : ""}
                  </td>
                  <td>${escapeHtml(item.previousDeadlineLabel)}</td>
                  <td>${escapeHtml(item.currentDeadlineLabel)}</td>
                  <td><span class="delay-review-chip ${decisionClass(item.decision)}">${escapeHtml(reviewLabel(item.decision))}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : `<div class="empty-state">제외한 이슈가 없습니다.</div>`}
    </section>
  `;
  modal.classList.remove("is-hidden");
  modal.querySelectorAll("[data-review-close]").forEach((button) => {
    button.addEventListener("click", closeDelayReviewModal);
  });
  modal.querySelectorAll("[data-rejected-issue-key]").forEach((row) => {
    const open = () => openDelayReviewModal(row.dataset.rejectedIssueKey || "");
    row.addEventListener("click", open);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

function bindIssueHistoryRows() {
  document.querySelectorAll("[data-issue-key]").forEach((row) => {
    const open = () => openDelayReviewModal(row.dataset.issueKey || "");
    row.addEventListener("click", open);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

function ganttRows(entries) {
  return entries
    .flatMap((entry) => entry.tasks.map((task) => {
      const start = dateFromKey(entry.date);
      const deadline = deadlineToDate(task.deadline);
      const hasDeadline = !Number.isNaN(deadline.getTime());
      const end = hasDeadline ? deadline : start;
      const isDueToday = hasDeadline && sameDate(deadline, new Date());
      return {
        part: entry.part || "파트 미지정",
        team: entry.team,
        student: entry.student,
        task,
        start,
        end: end < start ? start : end,
        date: entry.date,
        role: getRole(entry),
        hasDeadline,
        isDueToday
      };
    }))
    .sort((a, b) => {
      const partDiff = (a.part === "기획" ? 0 : 1) - (b.part === "기획" ? 0 : 1);
      if (partDiff) return partDiff;
      const roleOrder = { "팀장": 0, "PM": 1, "팀원": 2 };
      const roleDiff = (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9);
      if (roleDiff) return roleDiff;
      return a.student.localeCompare(b.student)
        || Number(b.hasDeadline) - Number(a.hasDeadline)
        || a.start - b.start
        || a.task.title.localeCompare(b.task.title);
    });
}

function consolidateGanttRows(rows) {
  const sorted = [...rows].sort((a, b) => {
    return a.team.localeCompare(b.team)
      || a.part.localeCompare(b.part)
      || a.student.localeCompare(b.student)
      || normalizedTaskTitle(a.task.title).localeCompare(normalizedTaskTitle(b.task.title))
      || a.start - b.start;
  });
  const merged = [];

  sorted.forEach((row) => {
    const key = ganttMergeKey(row);
    const previous = [...merged].reverse().find((item) => item.mergeKey === key);
    if (previous && shouldMergeGanttRows(previous, row)) {
      previous.start = previous.start < row.start ? previous.start : row.start;
      previous.end = previous.end > row.end ? previous.end : row.end;
      previous.hasDeadline = previous.hasDeadline || row.hasDeadline;
      previous.isDueToday = previous.isDueToday || row.isDueToday;
      previous.date = previous.date < row.date ? previous.date : row.date;
      previous.task = row.task;
      return;
    }

    merged.push({
      ...row,
      mergeKey: key
    });
  });

  return merged.sort(compareGanttRows);
}

function compareGanttRows(a, b) {
  const partDiff = (a.part === "기획" ? 0 : 1) - (b.part === "기획" ? 0 : 1);
  if (partDiff) return partDiff;
  const roleOrder = { "팀장": 0, "PM": 1, "팀원": 2 };
  const roleDiff = (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9);
  if (roleDiff) return roleDiff;
  return a.student.localeCompare(b.student)
    || Number(b.hasDeadline) - Number(a.hasDeadline)
    || a.start - b.start
    || a.task.title.localeCompare(b.task.title);
}

function ganttMergeKey(row) {
  return `${row.team}|${row.part}|${row.student}|${normalizedTaskTitle(row.task.title)}`;
}

function shouldMergeGanttRows(previous, row) {
  if (previous.mergeKey !== ganttMergeKey(row)) return false;
  if (!previous.hasDeadline && row.hasDeadline) return true;
  if (!previous.hasDeadline || !row.hasDeadline) return false;
  return true;
}

function ganttRange() {
  const period = ganttPeriods.find((item) => item.key === state.ganttPeriod) || ganttPeriods[0];
  const min = dateFromKey(period.start);
  const max = dateFromKey(period.end);
  min.setHours(0, 0, 0, 0);
  max.setHours(23, 59, 59, 999);
  return {
    min,
    max,
    days: Math.max(1, Math.ceil((max - min) / 86400000)),
    label: `${period.label} · ${dateKey(min)} ~ ${dateKey(max)}`
  };
}

function ganttTicks(range) {
  const ticks = [];
  const cursor = new Date(range.min);
  while (cursor <= range.max && ticks.length < 45) {
    ticks.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return ticks;
}

function renderGanttGroup(title, rows, range, ticks) {
  const days = Math.max(1, ticks.length);
  const timelineStyle = `--gantt-days:${days};--gantt-width:${days * 42}px;`;
  const visibleRows = rows.filter((row) => rowShouldShowInGantt(row) && rowIntersectsRange(row, range));
  return `
    <section class="gantt-group">
      <h3>${escapeHtml(title)}</h3>
      <div class="gantt-table" style="${timelineStyle}">
        <div class="gantt-row gantt-header" style="${timelineStyle}">
          <span class="gantt-sticky-cell gantt-student-cell">작업자</span>
          <span class="gantt-sticky-cell gantt-task-cell">작업</span>
          <div class="gantt-date-header" style="${timelineStyle}">
            <div class="gantt-month-row">
              ${renderGanttMonthCells(ticks)}
            </div>
            <div class="gantt-day-row">
              ${ticks.map((tick) => `<span class="${ganttDayClass(tick)}">${escapeHtml(String(tick.getDate()).padStart(2, "0"))}</span>`).join("")}
            </div>
          </div>
        </div>
        ${visibleRows.length ? visibleRows.map((row) => renderGanttRow(row, range, ticks)).join("") : `<div class="task-summary-empty">해당 기간 작업 없음</div>`}
      </div>
    </section>
  `;
}

function renderGanttPeriodControls() {
  return `
    <div class="gantt-period-controls" aria-label="간트 기간 선택">
      <div class="gantt-period-buttons">
        ${ganttPeriods.map((period) => `
          <button class="gantt-period-button ${state.ganttPeriod === period.key ? "is-active" : ""}" type="button" data-period="${escapeHtml(period.key)}">
            ${escapeHtml(period.label)}
          </button>
        `).join("")}
      </div>
      <div class="gantt-legend" aria-label="간트 색상 안내">
        <span><i class="legend-dot is-active"></i>작업중</span>
        <span><i class="legend-dot is-completed"></i>작업완료</span>
      </div>
    </div>
  `;
}

function bindGanttPeriodControls() {
  document.querySelectorAll(".gantt-period-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.ganttPeriod = button.dataset.period || "all";
      render();
    });
  });
}

function rowIntersectsRange(row, range) {
  if (!row.hasDeadline) {
    return row.start >= range.min && row.start <= range.max;
  }
  return row.start <= range.max && row.end >= range.min;
}

function rowShouldShowInGantt(row) {
  return !(row.part === "기획" && (row.role === "팀장" || row.role === "PM") && !row.hasDeadline);
}

function renderGanttRow(row, range, ticks) {
  const days = Math.max(1, ticks.length);
  const visibleStart = row.start < range.min ? range.min : row.start;
  const visibleEnd = row.end > range.max ? range.max : row.end;
  const startIndex = Math.max(0, Math.min(days - 1, daysBetween(range.min, visibleStart)));
  const endIndex = row.hasDeadline
    ? Math.max(startIndex, Math.min(days - 1, daysBetween(range.min, visibleEnd)))
    : startIndex;
  const left = (startIndex / days) * 100;
  const width = ((endIndex - startIndex + 1) / days) * 100;
  const timelineStyle = `--gantt-days:${days};--gantt-width:${days * 42}px;`;
  const completed = isGanttCompleted(row);
  const rowClass = [
    row.hasDeadline ? "" : "is-unscheduled",
    row.isDueToday ? "is-due-today" : "",
    completed ? "is-completed" : ""
  ].filter(Boolean).join(" ");
  const barClass = [
    row.hasDeadline ? "" : "is-unscheduled",
    row.isDueToday ? "is-due-today" : "",
    completed ? "is-completed" : ""
  ].filter(Boolean).join(" ");
  return `
    <div class="gantt-row ${rowClass}" style="${timelineStyle}">
      <span class="gantt-sticky-cell gantt-student-cell">${escapeHtml(row.student)}</span>
      <span class="gantt-sticky-cell gantt-task-cell" title="${escapeHtml(row.task.title)}">${escapeHtml(row.task.title)}</span>
      <div class="gantt-timeline" style="${timelineStyle}">
        ${renderGanttDayLayer(ticks)}
        <div class="gantt-bar ${barClass}" style="${row.hasDeadline ? `--bar-left:${left.toFixed(2)}%;--bar-width:${width.toFixed(2)}%;` : ""}"></div>
        ${row.hasDeadline ? `
          <span class="gantt-bar-label ${completed ? "is-completed" : ""}" style="--bar-left:${left.toFixed(2)}%;--bar-width:${width.toFixed(2)}%;">
            ${escapeHtml(formatDeadline(row.task.deadline, row.task.deadlineText))}
          </span>
        ` : `
          <span class="gantt-bar gantt-bar-label is-unscheduled">미정</span>
        `}
      </div>
    </div>
  `;
}

function isGanttCompleted(row) {
  if (!row.hasDeadline) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return row.end < today;
}

function taskTitlesMatch(a, b) {
  const left = normalizedTaskTitle(a);
  const right = normalizedTaskTitle(b);
  return Boolean(left && right && (left === right || left.includes(right) || right.includes(left)));
}

function renderGanttMonthCells(ticks) {
  const groups = [];
  ticks.forEach((tick) => {
    const month = String(tick.getMonth() + 1).padStart(2, "0");
    const current = groups[groups.length - 1];
    if (current?.month === month) {
      current.count += 1;
    } else {
      groups.push({ month, count: 1 });
    }
  });
  return groups.map((group) => `<span style="grid-column: span ${group.count};">${escapeHtml(group.month)}</span>`).join("");
}

function renderGanttDayLayer(ticks) {
  return `
    <div class="gantt-day-layer" aria-hidden="true">
      ${ticks.map((tick) => `<span class="${ganttDayClass(tick)}"></span>`).join("")}
    </div>
  `;
}

function ganttDayClass(date) {
  const classes = [];
  if (sameDate(date, new Date())) classes.push("is-today");
  if (isOffDay(date)) classes.push("is-off-day");
  return classes.join(" ");
}

function isOffDay(date) {
  const day = date.getDay();
  return day === 0 || day === 6 || holidayKeys.includes(dateKey(date));
}

function renderTeamColumn(title, entries) {
  return `
    <section class="team-column">
      <h2>${escapeHtml(title)}</h2>
      <div class="team-column-list">
        ${entries.length ? entries.map(renderTeamEntry).join("") : `<div class="empty-state">데이터가 없습니다.</div>`}
      </div>
    </section>
  `;
}

function storedTeamNotesForEntries(entries) {
  const team = entries[0]?.team || state.filters.team;
  const date = entries[0]?.date || state.filters.date;
  return state.teamNotes
    .filter((note) => note.team === team && note.date === date)
    .sort((a, b) => a.type.localeCompare(b.type) || a.title.localeCompare(b.title));
}

function renderTeamSpecialNotes(notes) {
  if (!notes.length) return "";
  return notes.map((note) => {
    const visibleItems = (note.items || [])
      .filter((item) => isActionableDelayItem(item, note))
      .filter((item) => !isRejectedDelayItem(item, note));
    if ((note.items || []).length && !visibleItems.length) return "";
    if (!visibleItems.length && !note.message) return "";
    const summaryKey = delaySummaryKey({
      team: note.team,
      date: note.date,
      type: note.type,
      title: displayTeamNoteTitle(note.title)
    });
    return `
      <details class="daily-delay-summary" data-delay-summary-key="${escapeHtml(summaryKey)}">
        <summary>
          <span>${escapeHtml(displayTeamNoteTitle(note.title))}</span>
          <small>${escapeHtml(`${visibleItems.length}건`)}</small>
        </summary>
        ${note.message ? `<p>${escapeHtml(note.message)}</p>` : ""}
        ${visibleItems.length ? renderDelayTable(visibleItems, note) : ""}
      </details>
    `;
  }).join("");
}

function delayedTaskItems(entries) {
  const items = [];
  const seen = new Set();

  entries.forEach((entry) => {
    entry.tasks.forEach((task) => {
      const previous = findPreviousSameTask(entry, task);
      if (!previous) return;
      const key = `${entry.team}|${entry.date}|${entry.student}|${normalizedTaskTitle(task.title)}`;
      if (seen.has(key)) return;
      seen.add(key);
      items.push({
        entry,
        task,
        previous
      });
    });
  });

  return items.sort((a, b) => {
    return a.entry.part.localeCompare(b.entry.part)
      || a.entry.student.localeCompare(b.entry.student)
      || a.task.title.localeCompare(b.task.title);
  });
}

function findPreviousSameTask(entry, task) {
  const currentDate = dateFromKey(entry.date);
  const normalizedTitle = normalizedTaskTitle(task.title);
  return state.entries
    .filter((candidate) => {
      return candidate.team === entry.team
        && candidate.part === entry.part
        && candidate.student === entry.student
        && candidate.date < entry.date;
    })
    .flatMap((candidate) => candidate.tasks.map((candidateTask) => ({
      entry: candidate,
      task: candidateTask,
      deadline: deadlineToDate(candidateTask.deadline)
    })))
    .filter((candidate) => {
      return normalizedTaskTitle(candidate.task.title) === normalizedTitle
        && !Number.isNaN(candidate.deadline.getTime())
        && candidate.deadline < currentDate;
    })
    .sort((a, b) => b.entry.date.localeCompare(a.entry.date))[0];
}

function renderDelayedTaskSummary(items) {
  const delayItems = items
    .map(({ entry, task, previous }) => ({
      team: entry.team,
      date: entry.date,
      part: entry.part,
      student: entry.student,
      taskTitle: task.title,
      previousTaskTitle: previous.task.title,
      previousDate: previous.entry.date,
      previousDeadline: previous.task.deadline,
      previousDeadlineText: previous.task.deadlineText,
      currentDeadline: task.deadline,
      currentDeadlineText: task.deadlineText,
      note: ""
    }))
    .filter((item) => isActionableDelayItem(item, { team: item.team, date: item.date }))
    .filter((item) => !isRejectedDelayItem(item, { team: item.team, date: item.date }));
  if (!delayItems.length) return "";
  const summaryKey = delaySummaryKey({
    team: delayItems[0]?.team,
    date: delayItems[0]?.date,
    type: "computed-delay",
    title: "특이사항"
  });
  return `
    <details class="daily-delay-summary" data-delay-summary-key="${escapeHtml(summaryKey)}">
      <summary>
        <span>특이사항</span>
        <small>${escapeHtml(`${delayItems.length}건`)}</small>
      </summary>
      ${renderDelayTable(delayItems)}
    </details>
  `;
}

function isRejectedDelayItem(item, note = {}) {
  const context = buildDelayContext(item, note);
  return normalizeReviewDecision(delayReviewForKey(context.key)?.decision) === "rejected";
}

function preserveOpenDelaySummaries() {
  state.openDelaySummaryKeys = new Set(
    Array.from(document.querySelectorAll(".daily-delay-summary[open][data-delay-summary-key]"))
      .map((details) => details.dataset.delaySummaryKey)
      .filter(Boolean)
  );
}

function restoreOpenDelaySummaries() {
  document.querySelectorAll(".daily-delay-summary[data-delay-summary-key]").forEach((details) => {
    if (state.openDelaySummaryKeys.has(details.dataset.delaySummaryKey)) {
      details.open = true;
    }
  });
}

function delaySummaryKey(value) {
  return [
    clean(value.team),
    clean(value.date),
    clean(value.type),
    clean(value.title)
  ].join("|");
}

function isActionableDelayItem(item, note = {}) {
  const currentDate = clean(item.currentDate || item.date || note.date);
  const previousDate = clean(item.previousDate);
  if (previousDate && currentDate && previousDate === currentDate) return false;

  const context = buildDelayContext(item, note);
  if (context.previousDate && context.date && context.previousDate === context.date) return false;

  return true;
}

function displayTeamNoteTitle(value) {
  const title = clean(value);
  if (!title || title.includes("밀린 작업 추정")) return "특이사항";
  return title;
}

function renderDelayTable(items, note = {}) {
  return `
    <div class="delay-table-wrap">
      <table class="delay-table">
        <thead>
          <tr>
            <th>파트</th>
            <th>학생</th>
            <th>작업</th>
            <th>이전 마감</th>
            <th>현재 마감</th>
            <th>판정</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => renderDelayTableRow(item, note)).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderDelayTableRow(item, note = {}) {
  const context = buildDelayContext(item, note);
  const review = delayReviewForKey(context.key);
  const decision = normalizeReviewDecision(review?.decision);
  const isRejected = decision === "rejected";
  state.delayContexts.set(context.key, context);
  return `
    <tr class="${isRejected ? "is-disabled" : ""}">
      <td>${escapeHtml(context.part)}</td>
      <td>${escapeHtml(context.student)}</td>
      <td>
        <div class="delay-task-cell">
          <span>${escapeHtml(context.currentTitle || context.note || "")}</span>
        </div>
      </td>
      <td>${escapeHtml(context.previousDeadlineLabel)}</td>
      <td>${escapeHtml(context.currentDeadlineLabel)}</td>
      <td>${renderDelayReviewChip(context.key, decision)}</td>
    </tr>
    ${review?.comment ? `
      <tr class="delay-comment-row ${isRejected ? "is-disabled" : ""}">
        <td></td>
        <td colspan="5">${escapeHtml(review.comment)}</td>
      </tr>
    ` : ""}
  `;
}

function renderDelayReviewChip(key, decision) {
  const label = reviewLabel(decision);
  if (isGuest()) {
    return `<span class="delay-review-chip ${decisionClass(decision)}">${escapeHtml(label)}</span>`;
  }
  return `
    <button class="delay-review-chip ${decisionClass(decision)}" type="button" data-review-key="${escapeHtml(key)}" title="전/후 데이터를 비교하고 판정합니다">
      ${escapeHtml(label)}
    </button>
  `;
}

function buildDelayContext(item, note = {}) {
  const team = clean(item.team || note.team);
  const date = clean(item.date || note.date);
  const part = clean(item.part);
  const student = clean(item.student);
  const currentTitle = clean(item.taskTitle || item.note);
  const currentEntry = state.entries.find((entry) => {
    return entry.team === team
      && entry.date === date
      && entry.part === part
      && entry.student === student;
  });
  const currentTask = currentEntry?.tasks?.find((task) => normalizedTaskTitle(task.title) === normalizedTaskTitle(currentTitle))
    || currentEntry?.tasks?.find((task) => task.title.includes(currentTitle) || currentTitle.includes(task.title));
  const previous = currentEntry && currentTask ? findPreviousSameTask(currentEntry, currentTask) : null;
  const fallbackPrevious = previous || findPreviousEntryByDelayItem({
    team,
    date,
    part,
    student,
    taskTitle: currentTitle,
    previousDeadlineText: item.previousDeadlineText
  });
  const previousTitle = clean(item.previousTaskTitle || fallbackPrevious?.task?.title || currentTitle);
  const previousDate = clean(item.previousDate || fallbackPrevious?.entry?.date || "");
  const previousDeadline = item.previousDeadline || fallbackPrevious?.task?.deadline || null;
  const previousDeadlineText = clean(item.previousDeadlineText || fallbackPrevious?.task?.deadlineText);
  const currentDeadline = item.currentDeadline || currentTask?.deadline || null;
  const currentDeadlineText = clean(item.currentDeadlineText || currentTask?.deadlineText);
  const key = delayReviewKey({
    team,
    date,
    part,
    student,
    currentTitle,
    previousDeadlineText,
    currentDeadlineText
  });

  return {
    key,
    team,
    date,
    part,
    student,
    currentTitle,
    previousTitle,
    previousDate,
    previousDeadline,
    previousDeadlineText,
    previousDeadlineLabel: previousDeadline ? formatDeadline(previousDeadline, previousDeadlineText) : previousDeadlineText || "미정",
    currentDeadline,
    currentDeadlineText,
    currentDeadlineLabel: currentDeadline ? formatDeadline(currentDeadline, currentDeadlineText) : currentDeadlineText || "미정",
    note: clean(item.note),
    currentNote: clean(currentTask?.note || item.note),
    specialNote: clean(currentEntry?.specialNote)
  };
}

function findPreviousEntryByDelayItem(item) {
  const normalizedTitle = normalizedTaskTitle(item.taskTitle);
  return state.entries
    .filter((entry) => {
      return entry.team === item.team
        && entry.part === item.part
        && entry.student === item.student
        && entry.date < item.date;
    })
    .flatMap((entry) => entry.tasks.map((task) => ({ entry, task })))
    .filter(({ task }) => {
      const taskTitle = normalizedTaskTitle(task.title);
      return taskTitle === normalizedTitle
        || taskTitle.includes(normalizedTitle)
        || normalizedTitle.includes(taskTitle);
    })
    .sort((a, b) => b.entry.date.localeCompare(a.entry.date))[0];
}

function delayReviewKey(value) {
  return [
    value.team,
    value.date,
    value.part,
    value.student,
    normalizedTaskTitle(value.currentTitle),
    clean(value.previousDeadlineText),
    clean(value.currentDeadlineText)
  ].join("|");
}

function delayReviewForKey(key) {
  return state.delayReviews.find((review) => review.key === key);
}

function decisionClass(decision) {
  if (decision === "confirmed") return "is-confirmed";
  if (decision === "rejected") return "is-rejected";
  return "is-pending";
}

function bindDelayReviewButtons() {
  document.querySelectorAll(".delay-review-chip").forEach((button) => {
    button.addEventListener("click", () => openDelayReviewModal(button.dataset.reviewKey || ""));
  });
}

function openDelayReviewModal(key) {
  const context = state.delayContexts.get(key);
  if (!context) return;
  const review = delayReviewForKey(key);
  const readOnly = isGuest();
  const modal = ensureDelayReviewModal();
  modal.innerHTML = `
    <div class="review-modal-backdrop" data-review-close="true"></div>
    <section class="review-modal-panel" role="dialog" aria-modal="true" aria-label="추정 작업 판정">
      <div class="review-modal-head">
        <div>
          <p class="eyebrow">${escapeHtml(context.team)} · ${escapeHtml(context.part)} · ${escapeHtml(context.student)}</p>
          <h2>검토</h2>
        </div>
        <button class="icon-button" type="button" data-review-close="true" aria-label="닫기">×</button>
      </div>
      <div class="review-compare-grid">
        <article class="review-compare-card">
          <h3>이전 보고</h3>
          <dl>
            <div><dt>날짜</dt><dd>${escapeHtml(context.previousDate || "이전 데이터")}</dd></div>
            <div><dt>작업</dt><dd>${escapeHtml(context.previousTitle || "확인 필요")}</dd></div>
            <div><dt>마감</dt><dd>${escapeHtml(context.previousDeadlineLabel)}</dd></div>
          </dl>
        </article>
        <article class="review-compare-card">
          <h3>오늘 보고</h3>
          <dl>
            <div><dt>날짜</dt><dd>${escapeHtml(context.date)}</dd></div>
            <div><dt>작업</dt><dd>${escapeHtml(context.currentTitle || "확인 필요")}</dd></div>
            <div><dt>마감</dt><dd>${escapeHtml(context.currentDeadlineLabel)}</dd></div>
          </dl>
        </article>
      </div>
      ${(context.currentNote || context.specialNote || context.note) ? `
        <div class="review-note-box">
          ${context.currentNote ? `<p><strong>작업 특이사항</strong> ${escapeHtml(context.currentNote)}</p>` : ""}
          ${context.specialNote ? `<p><strong>개인 특이사항</strong> ${escapeHtml(context.specialNote)}</p>` : ""}
          ${context.note ? `<p><strong>추정 근거</strong> ${escapeHtml(context.note)}</p>` : ""}
        </div>
      ` : ""}
      <div class="review-current-state">
        현재 판정: <strong>${escapeHtml(reviewLabel(normalizeReviewDecision(review?.decision)))}</strong>
        ${review?.reviewedBy ? `<span>${escapeHtml(review.reviewedBy)}</span>` : ""}
      </div>
      ${readOnly ? `
        <div class="review-comment-readonly">
          <strong>코멘트</strong>
          <p>${escapeHtml(review?.comment || "등록된 코멘트가 없습니다.")}</p>
        </div>
      ` : `
        <label class="review-comment-field">
          코멘트
          <textarea id="reviewCommentInput" placeholder="확인 내용이나 보류 사유를 입력하세요.">${escapeHtml(review?.comment || "")}</textarea>
        </label>
      `}
      <div class="review-modal-actions">
        ${readOnly ? `
          <span class="readonly-note">게스트 계정은 보기만 가능합니다.</span>
        ` : `
          <button class="ghost-button" type="button" data-review-save-comment="true">코멘트 저장</button>
          <button class="primary-button" type="button" data-review-decision="confirmed">확인</button>
          <button class="ghost-button" type="button" data-review-decision="pending">보류</button>
          <button class="ghost-button" type="button" data-review-decision="rejected">제외</button>
          <button class="ghost-button danger-button" type="button" data-review-delete-comment="true" ${review?.comment ? "" : "disabled"}>코멘트 삭제</button>
        `}
      </div>
    </section>
  `;
  modal.classList.remove("is-hidden");

  modal.querySelectorAll("[data-review-close]").forEach((button) => {
    button.addEventListener("click", closeDelayReviewModal);
  });
  modal.querySelectorAll("[data-review-decision]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const comment = clean(modal.querySelector("#reviewCommentInput")?.value);
        await saveDelayReview(context, button.dataset.reviewDecision, comment);
        closeDelayReviewModal();
        render();
      } catch (error) {
        if (error?.code === "permission-denied") {
          els.permissionNotice.textContent = "scrumDelayReviews 저장 권한이 없습니다. Firebase 보안 규칙에 scrumDelayReviews 권한을 추가하세요.";
          els.permissionNotice.classList.remove("is-hidden");
          return;
        }
        throw error;
      }
    });
  });
  modal.querySelector("[data-review-save-comment]")?.addEventListener("click", async () => {
    try {
      const comment = clean(modal.querySelector("#reviewCommentInput")?.value);
      await saveDelayReview(context, normalizeReviewDecision(review?.decision), comment);
      closeDelayReviewModal();
      render();
    } catch (error) {
      if (error?.code === "permission-denied") {
        els.permissionNotice.textContent = "scrumDelayReviews 저장 권한이 없습니다. Firebase 보안 규칙에 scrumDelayReviews 권한을 추가하세요.";
        els.permissionNotice.classList.remove("is-hidden");
        return;
      }
      throw error;
    }
  });
  modal.querySelector("[data-review-delete-comment]")?.addEventListener("click", async () => {
    try {
      await saveDelayReview(context, normalizeReviewDecision(review?.decision), "");
      closeDelayReviewModal();
      render();
    } catch (error) {
      if (error?.code === "permission-denied") {
        els.permissionNotice.textContent = "scrumDelayReviews 저장 권한이 없습니다. Firebase 보안 규칙에 scrumDelayReviews 권한을 추가하세요.";
        els.permissionNotice.classList.remove("is-hidden");
        return;
      }
      throw error;
    }
  });
}

function ensureDelayReviewModal() {
  let modal = document.querySelector("#delayReviewModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "delayReviewModal";
    modal.className = "review-modal is-hidden";
    document.body.appendChild(modal);
  }
  return modal;
}

function closeDelayReviewModal() {
  document.querySelector("#delayReviewModal")?.classList.add("is-hidden");
}

function reviewLabel(decision) {
  const normalized = normalizeReviewDecision(decision);
  if (normalized === "confirmed") return "확인";
  if (normalized === "rejected") return "제외";
  return "보류";
}

function normalizeReviewDecision(decision) {
  if (decision === "confirmed") return "confirmed";
  if (decision === "rejected") return "rejected";
  return "pending";
}

async function saveDelayReview(context, decision, comment = "") {
  if (isGuest()) {
    throw new Error("guest-read-only");
  }

  const review = {
    key: context.key,
    team: context.team,
    date: context.date,
    part: context.part,
    student: context.student,
    taskTitle: context.currentTitle,
    previousTaskTitle: context.previousTitle,
    previousDeadlineText: context.previousDeadlineText,
    currentDeadlineText: context.currentDeadlineText,
    decision: normalizeReviewDecision(decision),
    comment: clean(comment),
    reviewedBy: state.user?.email || "preview",
    reviewedAt: new Date().toISOString()
  };
  const id = slug(context.key);

  if (firebaseReady) {
    await fb.setDoc(fb.doc(db, "scrumDelayReviews", id), review, { merge: true });
    const existing = state.delayReviews.findIndex((item) => item.key === context.key);
    if (existing >= 0) {
      state.delayReviews[existing] = { id, ...review };
    } else {
      state.delayReviews.push({ id, ...review });
    }
    return;
  }

  const existing = state.delayReviews.findIndex((item) => item.key === context.key);
  if (existing >= 0) {
    state.delayReviews[existing] = { id, ...review };
  } else {
    state.delayReviews.push({ id, ...review });
  }
}

function renderTeamEntry(entry) {
    const previous = findPreviousEntry(entry);
    const tasks = entry.tasks.length ? entry.tasks.map((task) => renderTask(task)).join("") : renderEmptyTask("오늘 작업 없음");
    const previousTasks = previous?.tasks?.length ? previous.tasks.map((task) => renderTask(task, true)).join("") : "";
    const role = getRole(entry);
    const specialNote = meaningfulSpecialNote(entry.specialNote);
    return `
      <article class="entry-card">
        <div class="entry-head">
          <div>
            <h2 class="entry-title">
              <button class="student-link" type="button" data-team="${escapeHtml(entry.team)}" data-student="${escapeHtml(entry.student)}">${escapeHtml(entry.student)}</button>
              ${role !== "팀원" ? `<span class="role-tag">${escapeHtml(role)}</span>` : ""}
            </h2>
            ${specialNote ? `<p class="entry-special-note">${escapeHtml(specialNote)}</p>` : ""}
          </div>
          <span class="badge">${escapeHtml(entry.statusComparedToPrevious || "상태 미지정")}</span>
        </div>
        <section class="work-current">
          <div class="task-list">${tasks}</div>
        </section>
        ${previousTasks ? `
          <details class="previous-work-dropdown">
            <summary>${escapeHtml(previous.date)}</summary>
            <div class="task-list">${previousTasks}</div>
          </details>
        ` : ""}
      </article>
    `;
}

function renderTask(task, muted = false) {
  const overdue = isOverdue(task.deadline);
  const note = meaningfulNote(task.note);
  return `
    <div class="task-card ${muted ? "is-muted" : ""}">
      <div class="task-card-head">
        <div class="task-name">${escapeHtml(task.title)}</div>
        <div class="task-deadline ${overdue ? "danger" : ""}">${escapeHtml(formatDeadline(task.deadline, task.deadlineText))}</div>
      </div>
      ${note ? `<p class="task-note">특이사항: ${escapeHtml(note)}</p>` : ""}
    </div>
  `;
}

function renderEmptyTask(message, muted = false) {
  return `
    <div class="task-card ${muted ? "is-muted" : ""}">
      <div class="task-card-head">
        <div class="task-name">${escapeHtml(message)}</div>
        <div class="task-deadline">미정</div>
      </div>
    </div>
  `;
}

function renderStudentHistory() {
  if (!state.selectedStudent) {
    state.selectedStudent = firstStudentInTeam(state.historyTeam);
  }
  const selected = state.selectedStudent;
  renderTeamRosterTable();

  if (!selected) {
    els.studentHistory.innerHTML = `<div class="empty-state">학생 데이터가 없습니다.</div>`;
    return;
  }

  const history = state.entries
    .filter((entry) => entry.student === selected)
    .sort((a, b) => b.date.localeCompare(a.date));
  const chronological = [...history].sort((a, b) => a.date.localeCompare(b.date));
  if (state.historyIndex < 0) {
    state.historyIndex = Math.max(0, chronological.length - 1);
  }
  if (state.historyIndex >= chronological.length) {
    state.historyIndex = Math.max(0, chronological.length - 1);
  }
  els.studentHistory.innerHTML = `
    ${renderStudentModePanel(selected, chronological, history)}
  `;

  if (state.studentMode === "overview") {
    bindGanttPeriodControls();

    document.querySelector("#historyPrev")?.addEventListener("click", () => {
      state.historyIndex = Math.max(0, state.historyIndex - 1);
      renderStudentHistory();
    });

    document.querySelector("#historyNext")?.addEventListener("click", () => {
      state.historyIndex = Math.min(chronological.length - 1, state.historyIndex + 1);
      renderStudentHistory();
    });

    bindHistorySwipe(chronological.length);
  }
  if (state.studentMode === "report") {
    bindReportControls();
  }
}

function renderStudentModePanel(selected, chronological, history) {
  if (state.studentMode === "overview") {
    return renderOverviewPanel(selected, chronological);
  }
  if (state.studentMode === "report") {
    return renderStudentReportPanel(selected);
  }
  return renderChroniclePanel(selected, history);
}

function findStudentByKeyword(value) {
  const rosterStudents = Object.values(teamRoster[state.historyTeam] || {}).flat();
  const uploadedStudents = state.entries
    .filter((entry) => entry.team === state.historyTeam)
    .map((entry) => entry.student);
  const students = unique([...rosterStudents, ...uploadedStudents]);
  const keyword = clean(value);
  if (!keyword) return "";
  return students.find((student) => student.includes(keyword)) || "";
}

function selectStudent(student, team = "") {
  if (team && monitoredTeams.includes(team)) {
    state.historyTeam = team;
  }
  state.selectedStudent = student;
  state.historyIndex = -1;
  if (els.studentSearchInput) {
    els.studentSearchInput.value = student;
  }
  renderStudentHistory();
}

function renderTeamRosterTable() {
  const roster = teamRoster[state.historyTeam] || {};
  els.teamRosterTable.innerHTML = `
    <div class="roster-section">
      ${["기획", "플밍"].map((part) => renderRosterPart(state.historyTeam, part, roster[part] || [])).join("")}
    </div>
  `;

  document.querySelectorAll(".roster-student").forEach((button) => {
    button.addEventListener("click", () => {
      selectStudent(button.dataset.student || "");
    });
  });
}

function renderRosterPart(team, part, students) {
  if (!students.length) return "";
  return `
    <section class="roster-part">
      <h3>${escapeHtml(part)}</h3>
      <div class="roster-button-grid">
        ${students.map((student) => {
          const role = getRosterRole(team, part, student);
          const label = role === "팀원" ? student : `${student}(${role})`;
          return `
            <button class="roster-student ${student === state.selectedStudent ? "is-selected" : ""}" type="button" data-student="${escapeHtml(student)}">
              ${escapeHtml(label)}
            </button>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function firstStudentInTeam(team) {
  return teamRoster[team]?.["기획"]?.[0]
    || teamRoster[team]?.["플밍"]?.[0]
    || "";
}

function renderOverviewPanel(selected, history) {
  const rows = consolidateGanttRows(ganttRows(history));
  const range = rows.length ? ganttRange() : null;
  const ticks = range ? ganttTicks(range) : [];
  const activeIndex = state.historyIndex;
  const previous = history[activeIndex - 1] || null;
  const active = history[activeIndex] || null;
  const next = history[activeIndex + 1] || null;
  return `
    <section class="history-panel personal-gantt-panel">
      <div class="task-summary-head">
        <h2>${escapeHtml(selected)} 작업 개요</h2>
        <span>${escapeHtml(range?.label || "작업 없음")}</span>
      </div>
      ${rows.length ? `
        ${renderGanttPeriodControls()}
        <div class="gantt-board">
          ${renderGanttGroup("개인 작업", rows, range, ticks)}
        </div>
      ` : `<div class="empty-state">히스토리가 없습니다.</div>`}
    </section>
    <section class="history-panel history-carousel">
      <div class="history-carousel-head">
        <h2>${escapeHtml(selected)} 날짜별 작업</h2>
        <div class="carousel-controls">
          <button id="historyPrev" class="icon-button" type="button" aria-label="과거 날짜" ${activeIndex === 0 ? "disabled" : ""}>‹</button>
          <button id="historyNext" class="icon-button" type="button" aria-label="최신 날짜" ${activeIndex >= history.length - 1 ? "disabled" : ""}>›</button>
        </div>
      </div>
      ${history.length ? `
        <div class="slot-track">
          ${renderHistorySlot(previous, "side")}
          ${renderHistorySlot(active, "active")}
          ${renderHistorySlot(next, "side")}
        </div>
      ` : `<div class="empty-state">히스토리가 없습니다.</div>`}
    </section>
  `;
}

function renderStudentReportPanel(selected) {
  const reports = studentReportsFor(selected);
  const filtered = reports.filter((report) => state.reportFilter === "all" || report.reportType === state.reportFilter);
  return `
    <section class="history-panel report-panel">
      <div class="report-toolbar">
        <div>
          <h2>${escapeHtml(selected)} 학생 보고서</h2>
          <p>프로젝트·마일스톤·주간 보고서를 시간순으로 확인하고 HTML 문서로 저장합니다.</p>
        </div>
        <button id="exportReportHtmlButton" class="primary-button" type="button" ${filtered.length ? "" : "disabled"}>HTML 저장</button>
      </div>
      <div class="report-filter-buttons" aria-label="보고서 종류 선택">
        ${[
          ["all", "전체"],
          ["project", "프로젝트"],
          ["milestone", "마일스톤"],
          ["weekly", "주간"]
        ].map(([key, label]) => `
          <button class="report-filter-button ${state.reportFilter === key ? "is-active" : ""}" type="button" data-report-filter="${escapeHtml(key)}">
            ${escapeHtml(label)}
          </button>
        `).join("")}
      </div>
      ${filtered.length ? `
        <div class="report-document-list">
          ${filtered.map(renderStudentReportDocument).join("")}
        </div>
      ` : `<div class="empty-state">등록된 보고서 데이터가 없습니다.</div>`}
    </section>
  `;
}

function studentReportsFor(student) {
  return state.studentReports
    .filter((report) => report.student === student && report.team === state.historyTeam)
    .sort(compareStudentReports);
}

function compareStudentReports(a, b) {
  const projectDiff = Number(a.reportType !== "project") - Number(b.reportType !== "project");
  if (projectDiff) return projectDiff;

  const aMilestoneStart = normalizeDateKey(a.milestone?.startDate || a.period?.startDate || a.date);
  const bMilestoneStart = normalizeDateKey(b.milestone?.startDate || b.period?.startDate || b.date);
  const milestoneDiff = aMilestoneStart.localeCompare(bMilestoneStart);
  if (milestoneDiff) return milestoneDiff;

  const typeDiff = reportTypeOrder(a.reportType) - reportTypeOrder(b.reportType);
  if (typeDiff) return typeDiff;

  const periodDiff = normalizeDateKey(a.period?.startDate || a.date)
    .localeCompare(normalizeDateKey(b.period?.startDate || b.date));
  if (periodDiff) return periodDiff;

  return normalizeDateKey(a.period?.endDate || a.date)
    .localeCompare(normalizeDateKey(b.period?.endDate || b.date));
}

function reportTypeOrder(type) {
  if (type === "project") return 0;
  if (type === "milestone") return 1;
  if (type === "weekly") return 2;
  return 3;
}

function renderStudentReportDocument(report) {
  const range = reportRange(report);
  const ticks = ganttTicks(range);
  const rows = reportGanttRows(report);
  const label = report.reportType === "project"
    ? "프로젝트 보고서"
    : report.reportType === "milestone"
      ? "마일스톤 보고서"
      : "주간 보고서";
  return `
    <article class="student-report-document">
      <section class="report-sheet">
        ${renderReportHeader(report, label, "작업 개요")}
        <section class="report-stat-grid">
          ${renderReportStat("보고일", report.stats.reportedDays)}
          ${renderReportStat("작업 수", report.stats.taskCount)}
          ${renderReportStat("마감 작업", report.stats.deadlineTaskCount)}
          ${renderReportStat("검토 이슈", report.stats.delayedIssueCount)}
          ${renderReportStat("특이사항", report.stats.specialNoteCount)}
        </section>
        <section class="report-section report-summary-section">
          <div class="report-section-title">
            <span>01</span>
            <h3>분석 요약</h3>
          </div>
          <p>${escapeHtml(report.summary || "등록된 분석 요약이 없습니다.")}</p>
        </section>
        <section class="report-section report-gantt-section">
          <div class="report-section-title">
            <span>02</span>
            <h3>개인 작업 간트차트</h3>
          </div>
          ${rows.length ? `
            <div class="gantt-board report-gantt">
              ${renderGanttGroup("작업 흐름", rows, range, ticks)}
            </div>
          ` : `<div class="empty-state">간트차트 데이터가 없습니다.</div>`}
        </section>
        <section class="report-section report-analysis-section">
          <div class="report-section-title">
            <span>03</span>
            <h3>작업 분석</h3>
          </div>
          ${report.taskAnalysis.length ? `
            <div class="report-task-table-wrap">
              <table class="report-task-table">
                <colgroup>
                  <col class="report-task-title-column">
                  <col class="report-task-period-column">
                  <col class="report-task-deadline-column">
                  <col class="report-task-status-column">
                  <col class="report-task-evidence-column">
                </colgroup>
                <thead>
                  <tr>
                    <th>작업</th>
                    <th>진행 기간</th>
                    <th>마감일</th>
                    <th>상태</th>
                    <th>보고 근거</th>
                  </tr>
                </thead>
                <tbody>
                  ${report.taskAnalysis.map((item) => `
                    <tr>
                      <td>
                        <strong>${escapeHtml(item.title)}</strong>
                        ${item.note ? `<small>${escapeHtml(item.note)}</small>` : ""}
                        ${item.delayReason ? `<small class="report-delay-reason"><b>지연 사유</b>${escapeHtml(item.delayReason)}</small>` : ""}
                      </td>
                      <td>${escapeHtml(formatDateKeyShort(item.startDate))} ~ ${escapeHtml(formatDateKeyShort(item.endDate))}</td>
                      <td>${escapeHtml(formatDeadline(item.deadline))}</td>
                      <td><span class="report-status ${reportStatusClass(item.status)}">${escapeHtml(item.status || "미지정")}</span></td>
                      <td>${escapeHtml(item.evidenceDates.map(formatDateKeyShort).join(", "))}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          ` : `<div class="empty-state">작업 분석 데이터가 없습니다.</div>`}
        </section>
        <footer class="report-page-footer">
          <span>${escapeHtml(report.notice)}</span>
          <strong>${escapeHtml(formatDateKeyShort(report.period.startDate))} ~ ${escapeHtml(formatDateKeyShort(report.period.endDate))}</strong>
        </footer>
      </section>
    </article>
  `;
}

function renderReportHeader(report, label, sectionLabel) {
  return `
    <header class="report-cover">
      <div class="report-title-block">
        <div class="report-brand-line">
          <span class="report-brand-mark"></span>
          <p class="eyebrow">${escapeHtml(label)} · ${escapeHtml(sectionLabel)}</p>
        </div>
        <h2>${escapeHtml(report.period.label || report.milestone?.name || report.date)}</h2>
        <p>${escapeHtml(report.team)} · ${escapeHtml(report.part || "파트 미지정")} · <strong>${escapeHtml(report.student)}</strong></p>
      </div>
      <div class="report-period-box">
        <span>REPORT PERIOD</span>
        <strong>${escapeHtml(formatDateKeyShort(report.period.startDate))} ~ ${escapeHtml(formatDateKeyShort(report.period.endDate))}</strong>
        ${report.milestone?.name ? `<small>${escapeHtml(report.milestone.name)} · ${escapeHtml(formatDateKeyShort(report.milestone.startDate))} ~ ${escapeHtml(formatDateKeyShort(report.milestone.endDate))}</small>` : ""}
      </div>
    </header>
  `;
}

function reportStatusClass(status) {
  const value = clean(status);
  if (value.includes("완료") || value.includes("확인")) return "is-complete";
  if (value.includes("검토") || value.includes("보류") || value.includes("지연")) return "is-review";
  return "is-progress";
}

function renderReportStat(label, value) {
  return `
    <div class="report-stat">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value ?? 0))}</strong>
    </div>
  `;
}

function reportRange(report) {
  const min = dateFromKey(report.period.startDate);
  const max = dateFromKey(report.period.endDate);
  min.setHours(0, 0, 0, 0);
  max.setHours(23, 59, 59, 999);
  return {
    min,
    max,
    days: Math.max(1, Math.ceil((max - min) / 86400000)),
    label: `${report.period.label || "보고 기간"} · ${dateKey(min)} ~ ${dateKey(max)}`
  };
}

function reportGanttRows(report) {
  return report.gantt.map((item) => {
    const start = dateFromKey(item.startDate);
    const end = dateFromKey(item.endDate);
    const deadline = deadlineToDate(item.deadline);
    const hasDeadline = !Number.isNaN(deadline.getTime());
    return {
      part: report.part || "파트 미지정",
      team: report.team,
      student: report.student,
      task: {
        title: item.title,
        deadline: item.deadline,
        deadlineText: item.deadline ? "" : "미정"
      },
      start,
      end: end < start ? start : end,
      date: report.date,
      role: getRosterRole(report.team, report.part, report.student),
      hasDeadline,
      isDueToday: hasDeadline && sameDate(deadline, new Date())
    };
  }).sort(compareGanttRows);
}

function bindReportControls() {
  document.querySelectorAll(".report-filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.reportFilter = button.dataset.reportFilter || "all";
      renderStudentHistory();
    });
  });
  document.querySelector("#exportReportHtmlButton")?.addEventListener("click", exportSelectedStudentReportsHtml);
}

async function exportSelectedStudentReportsHtml() {
  const student = state.selectedStudent;
  const reports = studentReportsFor(student)
    .filter((report) => state.reportFilter === "all" || report.reportType === state.reportFilter);
  if (!student || !reports.length) return;

  const button = document.querySelector("#exportReportHtmlButton");
  if (button) {
    button.disabled = true;
    button.textContent = "HTML 생성 중";
  }

  try {
    const stylesheet = await fetch("./styles.css").then((response) => {
      if (!response.ok) throw new Error("보고서 스타일을 불러오지 못했습니다.");
      return response.text();
    });
    const generatedAt = new Date().toLocaleString("ko-KR");
    const title = `${state.historyTeam} ${student} 프로젝트 작업 보고서`;
    const documentHtml = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>${stylesheet.replace(/<\/style/gi, "<\\/style")}</style>
</head>
<body class="html-report-export">
  <header class="html-report-header">
    <div>
      <p>SMART4 LAST PROJECT</p>
      <h1>${escapeHtml(student)} 프로젝트 작업 보고서</h1>
      <span>${escapeHtml(state.historyTeam)} · ${escapeHtml(reports[0]?.part || "파트 미지정")}</span>
    </div>
    <div class="html-report-meta">
      <span>생성일</span>
      <strong>${escapeHtml(generatedAt)}</strong>
      <small>프로젝트 및 마일스톤 시간순 정렬</small>
    </div>
  </header>
  <main class="report-document-list">
    ${reports.map(renderStudentReportDocument).join("")}
  </main>
</body>
</html>`;
    downloadTextFile(
      `${slug(state.historyTeam)}_${slug(student)}_프로젝트_작업보고서.html`,
      documentHtml,
      "text/html;charset=utf-8"
    );
  } catch (error) {
    console.error(error);
    window.alert("HTML 보고서를 생성하지 못했습니다. 잠시 후 다시 시도하세요.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "HTML 저장";
    }
  }
}

function downloadTextFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderChroniclePanel(selected, history) {
  return `
    <section class="history-panel chronicle-panel">
      <h2>${escapeHtml(selected)} 작업 연혁</h2>
      <div class="chronicle-list">
        ${history.length ? history.map(renderChronicleItem).join("") : `<div class="empty-state">히스토리가 없습니다.</div>`}
      </div>
    </section>
  `;
}

function renderChronicleItem(entry) {
  return `
    <article class="chronicle-item">
      <div class="chronicle-date">${escapeHtml(entry.date)}</div>
      <div class="chronicle-body">
        <div class="chronicle-head">
          <span>${escapeHtml(entry.statusComparedToPrevious || "상태 미지정")}</span>
        </div>
        <ul>
          ${entry.tasks.length ? entry.tasks.map((task) => `
            <li>
              <span>${escapeHtml(task.title)}</span>
              <small>${escapeHtml(formatDeadline(task.deadline, task.deadlineText))}</small>
              ${meaningfulNote(task.note) ? `<p>특이사항: ${escapeHtml(meaningfulNote(task.note))}</p>` : ""}
            </li>
          `).join("") : `<li><span>등록된 작업 없음</span></li>`}
        </ul>
        ${meaningfulSpecialNote(entry.specialNote) ? `<p class="special-note">${escapeHtml(meaningfulSpecialNote(entry.specialNote))}</p>` : ""}
      </div>
    </article>
  `;
}

function renderHistorySlot(entry, mode) {
  if (!entry) {
    return `<article class="history-slot ${mode === "active" ? "is-active" : ""} is-empty-slot"></article>`;
  }
  return `
    <article class="history-slot ${mode === "active" ? "is-active" : ""}">
      ${renderHistoryItem(entry)}
    </article>
  `;
}

function bindHistorySwipe(length) {
  const track = document.querySelector(".slot-track");
  if (!track || length < 2) return;

  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  const start = (clientX) => {
    startX = clientX;
    currentX = clientX;
    isDragging = true;
    track.classList.add("is-dragging");
    track.style.setProperty("--drag-x", "0px");
  };

  const move = (clientX) => {
    if (!isDragging) return;
    currentX = clientX;
    const delta = Math.max(-120, Math.min(120, currentX - startX));
    track.style.setProperty("--drag-x", `${delta}px`);
  };

  const end = (clientX) => {
    if (!isDragging) return;
    const delta = clientX - startX;
    isDragging = false;
    track.classList.remove("is-dragging");
    track.style.setProperty("--drag-x", "0px");
    if (Math.abs(delta) < 45) return;

    if (delta > 0) {
      state.historyIndex = Math.max(0, state.historyIndex - 1);
    } else {
      state.historyIndex = Math.min(length - 1, state.historyIndex + 1);
    }
    renderStudentHistory();
  };

  track.addEventListener("pointerdown", (event) => {
    track.setPointerCapture?.(event.pointerId);
    start(event.clientX);
  });
  track.addEventListener("pointermove", (event) => move(event.clientX));
  track.addEventListener("pointerup", (event) => end(event.clientX));
  track.addEventListener("pointercancel", () => {
    isDragging = false;
    track.classList.remove("is-dragging");
    track.style.setProperty("--drag-x", "0px");
  });
  track.addEventListener("touchstart", (event) => {
    start(event.touches[0]?.clientX || 0);
  }, { passive: true });
  track.addEventListener("touchmove", (event) => {
    move(event.touches[0]?.clientX || currentX);
  }, { passive: true });
  track.addEventListener("touchend", (event) => {
    end(event.changedTouches[0]?.clientX || startX);
  }, { passive: true });
}

function renderHistoryItem(entry) {
  return `
    <article class="entry-card">
      <div class="entry-head">
        <div>
          <h3 class="entry-title">${escapeHtml(entry.date)}</h3>
          <p class="entry-meta">${escapeHtml(entry.team)} · ${escapeHtml(entry.part || "파트 미지정")}</p>
        </div>
        <span class="badge">${escapeHtml(entry.statusComparedToPrevious || "상태 미지정")}</span>
      </div>
      <div class="task-list">
        ${entry.tasks.length ? entry.tasks.map((task) => renderTask(task)).join("") : `<div class="task-row"><span class="task-name">등록된 작업 없음</span></div>`}
      </div>
      ${meaningfulSpecialNote(entry.specialNote) ? `<p class="special-note">${escapeHtml(meaningfulSpecialNote(entry.specialNote))}</p>` : ""}
    </article>
  `;
}

function findPreviousEntry(entry) {
  return state.entries
    .filter((candidate) => {
      return candidate.team === entry.team
        && candidate.student === entry.student
        && candidate.date < entry.date;
    })
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

function compareByRole(a, b) {
  const roleOrder = { "팀장": 0, "PM": 1, "팀원": 2 };
  const partOrder = { "기획": 0, "플밍": 1 };
  const roleDiff = roleOrder[getRole(a)] - roleOrder[getRole(b)];
  if (roleDiff) return roleDiff;
  const partDiff = (partOrder[a.part] ?? 9) - (partOrder[b.part] ?? 9);
  if (partDiff) return partDiff;
  return a.student.localeCompare(b.student);
}

function getRole(entry) {
  const rosterRole = getRosterRole(entry.team, entry.part, entry.student);
  if (rosterRole !== "팀원") return rosterRole;
  if (entry.specialNote === "팀장") return "팀장";
  if (entry.specialNote === "PM") return "PM";
  return "팀원";
}

function getRosterRole(team, part, student) {
  const members = teamRoster[team]?.[part] || [];
  if (members[0] === student) return "팀장";
  if (part === "기획" && members[1] === student) return "PM";
  return "팀원";
}

function roleClass(role) {
  if (role === "팀장") return "leader";
  if (role === "PM") return "pm";
  return "member";
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function clean(value) {
  return String(value ?? "").trim();
}

function normalizeDateKey(value) {
  const text = clean(value);
  if (!text) return "";
  const match = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (match) {
    return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  }
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return "";
  return dateKey(date);
}

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function meaningfulNote(value) {
  const note = clean(value);
  if (!note || note === "없음" || note === "X" || note === "-") return "";
  return note;
}

function meaningfulSpecialNote(value) {
  const note = meaningfulNote(value);
  if (!note || note === "팀장" || note === "PM") return "";
  return note;
}

function normalizedTaskTitle(value) {
  return clean(value)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[()[\]{}·,./:_\-~]/g, "");
}

function slug(value) {
  return clean(value).replace(/[^a-zA-Z0-9가-힣_-]+/g, "-");
}

function studentReportId(report) {
  return [
    report.team,
    report.student,
    report.reportType,
    report.period?.startDate,
    report.period?.endDate
  ].map(slug).join("_");
}

function dateInRange(value, startDate, endDate) {
  const key = normalizeDateKey(value);
  return Boolean(key && key >= startDate && key <= endDate);
}

function reportIntersectsPeriod(report, startDate, endDate) {
  const reportStart = normalizeDateKey(report.period?.startDate || report.date);
  const reportEnd = normalizeDateKey(report.period?.endDate || report.date);
  if (!reportStart || !reportEnd) return dateInRange(report.date, startDate, endDate);
  return reportStart <= endDate && reportEnd >= startDate;
}

function isOverdue(value) {
  if (!value) return false;
  const date = deadlineToDate(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function parseDeadlineValue(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value;
  if (value instanceof Date) return value;
  const text = clean(value);
  if (!text || text === "-" || text === "없음") return null;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date;
}

function deadlineToDate(value) {
  if (!value) return new Date("invalid");
  if (typeof value?.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value);
}

function formatDeadline(value, fallback = "") {
  if (!value) return "미정";
  if (typeof value === "string" && Number.isNaN(new Date(value).getTime())) return "미정";
  const date = deadlineToDate(value);
  if (Number.isNaN(date.getTime())) return "미정";
  return formatMonthDay(date);
}

function formatDate(value) {
  if (!value) return "";
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ko-KR");
}

function formatDateKeyShort(value) {
  const date = dateFromKey(value);
  if (Number.isNaN(date.getTime())) return value || "";
  return formatMonthDay(date);
}

function formatMonthDay(date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

function dateFromKey(value) {
  return new Date(`${value}T00:00:00+09:00`);
}

function dateKey(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sameDate(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function addDays(value, days) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function daysBetween(start, end) {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endUtc - startUtc) / 86400000);
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildEmail(value) {
  const loginId = clean(value).replace(/\s/g, "");
  if (!loginId) return "";
  if (loginId.includes("@")) {
    return loginId.toLowerCase();
  }
  return `${loginId}${emailDomain}`.toLowerCase();
}

function isAdmin() {
  const email = clean(state.user?.email).toLowerCase();
  return adminEmails.map((item) => item.toLowerCase()).includes(email);
}

function isGuest() {
  const email = clean(state.user?.email).toLowerCase();
  return guestEmails.map((item) => item.toLowerCase()).includes(email);
}

function parseScrumFileName(fileName) {
  const match = clean(fileName).match(/^(\d{4}-\d{2}-\d{2})_team(\d+)\.json$/i);
  if (!match) return null;
  return {
    date: match[1],
    team: `${Number(match[2])}팀`
  };
}

function getAuthErrorMessage(error) {
  const code = error?.code || "";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
    return "아이디 또는 비밀번호가 맞지 않습니다.";
  }
  if (code === "auth/user-not-found") {
    return "등록되지 않은 계정입니다. Firebase Authentication에 계정을 먼저 추가하세요.";
  }
  if (code === "auth/invalid-email") {
    return "아이디 형식을 확인하세요.";
  }
  if (code === "auth/too-many-requests") {
    return "로그인 시도가 많아 잠시 제한되었습니다. 조금 뒤 다시 시도하세요.";
  }
  if (code === "auth/unauthorized-domain") {
    return "현재 접속 주소가 Firebase 승인 도메인에 없습니다. localhost 또는 GitHub Pages 도메인을 추가하세요.";
  }
  return `로그인에 실패했습니다. ${code || "계정 정보를 확인하세요."}`;
}

function todayKey() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

async function loadFirebase() {
  const appModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
  const appCheckModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-check.js");
  const authModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");
  const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
  return {
    ...appModule,
    ...appCheckModule,
    ...authModule,
    ...firestoreModule
  };
}

const savedTheme = localStorage.getItem("scrum-theme");
if (savedTheme) {
  document.documentElement.dataset.theme = savedTheme;
}
