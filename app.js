const config = window.firebaseConfig || {};
const firebaseReady = Boolean(config.apiKey && config.projectId && config.authDomain);
const emailDomain = "@smart.com";
const adminEmails = ["안중재@smart.com"];
const monitoredTeams = ["1팀", "2팀", "3팀", "4팀", "5팀", "6팀", "7팀", "8팀"];
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
  comments: [],
  user: null,
  view: "team",
  teamMode: "overview",
  part: "all",
  selectedStudent: "",
  historyTeam: "1팀",
  historyIndex: -1,
  studentMode: "overview",
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
  teamTab: document.querySelector("#teamTab"),
  studentTab: document.querySelector("#studentTab"),
  adminTab: document.querySelector("#adminTab"),
  teamOverviewTab: document.querySelector("#teamOverviewTab"),
  teamDailyTab: document.querySelector("#teamDailyTab"),
  overviewTab: document.querySelector("#overviewTab"),
  historyTab: document.querySelector("#historyTab"),
  studentSearchInput: document.querySelector("#studentSearchInput"),
  jsonInput: document.querySelector("#jsonInput"),
  uploadMessage: document.querySelector("#uploadMessage"),
  adminStatus: document.querySelector("#adminStatus"),
  teamFilter: document.querySelector("#teamFilter"),
  historyTeamFilter: document.querySelector("#historyTeamFilter"),
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
els.overviewTab.addEventListener("click", () => setStudentMode("overview"));
els.historyTab.addEventListener("click", () => setStudentMode("history"));
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
  renderStudentHistory();
}

function setTeamMode(mode) {
  state.teamMode = mode;
  els.teamOverviewTab.classList.toggle("is-active", mode === "overview");
  els.teamDailyTab.classList.toggle("is-active", mode === "daily");
  render();
}

els.historyTeamFilter.addEventListener("change", () => {
  state.historyTeam = els.historyTeamFilter.value;
  state.selectedStudent = firstStudentInTeam(state.historyTeam);
  els.studentSearchInput.value = "";
  renderStudentHistory();
});

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

[els.teamFilter].forEach((select) => {
  select.addEventListener("change", () => {
    state.filters.team = els.teamFilter.value;
    render();
  });
});

function showLogin() {
  els.authView.classList.remove("is-hidden");
  els.dashboardView.classList.add("is-hidden");
}

function showDashboard() {
  els.authView.classList.add("is-hidden");
  els.dashboardView.classList.remove("is-hidden");
  syncAdminAccess();
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
    els.adminStatus.textContent = `현재 계정: ${state.user?.email || "없음"} · 관리자 권한: ${allowed ? "확인됨" : "없음"}`;
  }
  if (!allowed && state.view === "admin") {
    setView("team");
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
      await importEntries(normalizeEntries(parsed, { team: fileInfo.team, date: fileInfo.date }), {
        team: fileInfo.team,
        date: fileInfo.date,
        overwrite: true
      });
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

function render() {
  syncFilterOptions();
  const entries = filteredEntries();
  renderTodayNotice();
  els.dateStrip.classList.toggle("is-hidden", state.teamMode !== "daily");
  if (state.teamMode === "overview") {
    renderTeamOverview(teamOverviewEntries());
    els.teamList.innerHTML = "";
  } else {
    els.teamTaskSummary.innerHTML = "";
    renderTeamList(entries);
  }
  renderStudentHistory();
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

function syncFilterOptions() {
  const dates = unique(state.entries.map((entry) => entry.date)).sort().reverse();

  fillSelect(els.teamFilter, monitoredTeams, "");
  fillSelect(els.historyTeamFilter, monitoredTeams, "");
  state.historyTeam = els.historyTeamFilter.value;
  focusTodayDate(dates);
  renderDateStrip(dates);
}

function fillSelect(select, values, allLabel) {
  const current = select.value || values[0];
  select.innerHTML = (allLabel ? `<option value="all">${allLabel}</option>` : "") + values.map((value) => {
    return `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`;
  }).join("");
  select.value = values.includes(current) ? current : values[0];
  state.filters[select.id.replace("Filter", "")] = select.value;
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
  const rows = ganttRows(entries);

  if (!rows.length) {
    els.teamTaskSummary.innerHTML = `<div class="empty-state">등록된 작업 데이터가 없습니다.</div>`;
    return;
  }

  const range = ganttRange(rows);
  const ticks = ganttTicks(range);
  const planRows = rows.filter((row) => row.part === "기획");
  const devRows = rows.filter((row) => row.part === "플밍");

  els.teamTaskSummary.innerHTML = `
    <div class="task-summary-head">
      <h2>${escapeHtml(state.filters.team)} 작업 개요</h2>
      <span>${escapeHtml(range.label)}</span>
    </div>
    <div class="gantt-board">
      ${renderGanttGroup("기획", planRows, range, ticks)}
      ${renderGanttGroup("플밍", devRows, range, ticks)}
    </div>
  `;
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

function ganttRange(rows) {
  const starts = rows.map((row) => row.start.getTime()).filter(Boolean);
  const ends = rows.map((row) => row.end.getTime()).filter(Boolean);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = new Date(Math.min(...starts, ...ends, today.getTime()));
  const max = new Date(Math.max(...starts, ...ends, today.getTime()));
  if (sameDate(min, max)) {
    max.setDate(max.getDate() + 1);
  }
  min.setHours(0, 0, 0, 0);
  max.setHours(23, 59, 59, 999);
  return {
    min,
    max,
    days: Math.max(1, Math.ceil((max - min) / 86400000)),
    label: `${dateKey(min)} ~ ${dateKey(max)}`
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
  return `
    <section class="gantt-group">
      <h3>${escapeHtml(title)}</h3>
      <div class="gantt-table">
        <div class="gantt-row gantt-header">
          <span>작업구분</span>
          <span>작업자</span>
          <span>작업</span>
          <div class="gantt-timeline gantt-ticks">
            ${ticks.map((tick) => `<span class="${sameDate(tick, new Date()) ? "is-today" : ""}">${escapeHtml(formatMonthDay(tick))}</span>`).join("")}
          </div>
        </div>
        ${rows.length ? rows.map((row) => renderGanttRow(row, range)).join("") : `<div class="task-summary-empty">등록된 작업 없음</div>`}
      </div>
    </section>
  `;
}

function renderGanttRow(row, range) {
  const left = Math.max(0, Math.min(100, ((row.start - range.min) / (range.max - range.min)) * 100));
  const width = Math.max(4, Math.min(100 - left, ((row.end - row.start) / (range.max - range.min)) * 100 || 4));
  return `
    <div class="gantt-row ${row.hasDeadline ? "" : "is-unscheduled"} ${row.isDueToday ? "is-due-today" : ""}">
      <span><b>${escapeHtml(row.part)}</b></span>
      <span>${escapeHtml(row.student)}</span>
      <span title="${escapeHtml(row.task.title)}">${escapeHtml(row.task.title)}</span>
      <div class="gantt-timeline">
        <div class="gantt-bar ${row.part === "플밍" ? "is-dev" : ""} ${row.hasDeadline ? "" : "is-unscheduled"} ${row.isDueToday ? "is-due-today" : ""}" style="${row.hasDeadline ? `--bar-left:${left.toFixed(2)}%;--bar-width:${width.toFixed(2)}%;` : ""}">
          <span>${escapeHtml(formatDeadline(row.task.deadline, row.task.deadlineText))}</span>
        </div>
      </div>
    </div>
  `;
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

function renderTeamEntry(entry) {
    const previous = findPreviousEntry(entry);
    const tasks = entry.tasks.length ? entry.tasks.map((task) => renderTask(task)).join("") : renderEmptyTask("오늘 작업 없음");
    const previousTasks = previous?.tasks?.length ? previous.tasks.map((task) => renderTask(task, true)).join("") : renderEmptyTask("지난 작업 없음", true);
    const role = getRole(entry);
    return `
      <article class="entry-card">
        <div class="entry-head">
          <div>
            <h2 class="entry-title">
              <button class="student-link" type="button" data-team="${escapeHtml(entry.team)}" data-student="${escapeHtml(entry.student)}">${escapeHtml(entry.student)}</button>
              ${role !== "팀원" ? `<span class="role-tag">${escapeHtml(role)}</span>` : ""}
            </h2>
          </div>
          <span class="badge">${escapeHtml(entry.statusComparedToPrevious || "상태 미지정")}</span>
        </div>
        <section class="work-current">
          <div class="task-list">${tasks}</div>
        </section>
        <details class="previous-work-dropdown">
          <summary>${escapeHtml(previous?.date || "지난 작업 없음")}</summary>
          <div class="task-list">${previousTasks}</div>
        </details>
        <p class="personal-note">개인 특이사항: ${escapeHtml(entry.specialNote || "없음")}</p>
      </article>
    `;
}

function renderTask(task, muted = false, includeComment = false, entry = null) {
  const overdue = isOverdue(task.deadline);
  const note = meaningfulNote(task.note);
  const commentKey = entry
    ? `task-comment:${entry.team}:${entry.date}:${entry.student}:${task.title}`
    : "";
  const savedComment = commentKey ? localStorage.getItem(commentKey) || "" : "";
  return `
    <div class="task-card ${muted ? "is-muted" : ""}">
      <div class="task-card-head">
        <div class="task-name">${escapeHtml(task.title)}</div>
        <div class="task-deadline ${overdue ? "danger" : ""}">${escapeHtml(formatDeadline(task.deadline, task.deadlineText))}</div>
      </div>
      ${note ? `<p class="task-note">특이사항: ${escapeHtml(note)}</p>` : ""}
      ${includeComment ? `
        <label class="task-comment">
          코멘트
          <textarea class="task-comment-input" data-comment-key="${escapeHtml(commentKey)}" placeholder="간단한 코멘트">${escapeHtml(savedComment)}</textarea>
        </label>
      ` : ""}
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
    ${state.studentMode === "overview" ? renderOverviewPanel(selected, chronological) : renderChroniclePanel(selected, history)}
  `;

  if (state.studentMode === "overview") {
    document.querySelector("#historyPrev")?.addEventListener("click", () => {
      state.historyIndex = Math.max(0, state.historyIndex - 1);
      renderStudentHistory();
    });

    document.querySelector("#historyNext")?.addEventListener("click", () => {
      state.historyIndex = Math.min(chronological.length - 1, state.historyIndex + 1);
      renderStudentHistory();
    });

    bindHistorySwipe(chronological.length);

    document.querySelectorAll(".task-comment-input").forEach((input) => {
      input.addEventListener("input", () => {
        localStorage.setItem(input.dataset.commentKey, input.value);
      });
    });
  }
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
    els.historyTeamFilter.value = team;
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
      <table>
        <thead>
          <tr>
            <th>이름</th>
            <th>역할</th>
          </tr>
        </thead>
        <tbody>
          ${students.map((student) => {
            const role = getRosterRole(team, part, student);
            return `
              <tr class="role-${roleClass(role)} ${student === state.selectedStudent ? "is-selected" : ""}">
                <td><button class="roster-student" type="button" data-student="${escapeHtml(student)}">${escapeHtml(student)}</button></td>
                <td><span class="role-label">${escapeHtml(role)}</span></td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function firstStudentInTeam(team) {
  return teamRoster[team]?.["기획"]?.[0]
    || teamRoster[team]?.["플밍"]?.[0]
    || "";
}

function renderOverviewPanel(selected, history) {
  const rows = ganttRows(history);
  const range = rows.length ? ganttRange(rows) : null;
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
        ${entry.specialNote ? `<p class="special-note">특이사항: ${escapeHtml(entry.specialNote)}</p>` : ""}
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
      ${renderHistoryItem(entry, mode === "active")}
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

function renderHistoryItem(entry, includeTaskComments = false) {
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
        ${entry.tasks.length ? entry.tasks.map((task) => renderTask(task, false, includeTaskComments, entry)).join("") : `<div class="task-row"><span class="task-name">등록된 작업 없음</span></div>`}
      </div>
      ${entry.specialNote ? `<p class="special-note">특이사항: ${escapeHtml(entry.specialNote)}</p>` : ""}
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

function meaningfulNote(value) {
  const note = clean(value);
  if (!note || note === "없음" || note === "X" || note === "-") return "";
  return note;
}

function slug(value) {
  return clean(value).replace(/[^a-zA-Z0-9가-힣_-]+/g, "-");
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
  const authModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");
  const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
  return {
    ...appModule,
    ...authModule,
    ...firestoreModule
  };
}

const savedTheme = localStorage.getItem("scrum-theme");
if (savedTheme) {
  document.documentElement.dataset.theme = savedTheme;
}
