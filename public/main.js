const problemTypes = [
  ["graffiti", "Graffiti"],
  ["rubbish", "Rubbish"],
  ["pothole", "Pothole"],
  ["broken_street_furniture", "Broken furniture"],
  ["other", "Other"]
];

const mockPhotos = [
  "assets/demo-graffiti.svg",
  "assets/demo-rubbish.svg",
  "assets/demo-pothole.svg"
];

const resolvedPhoto = "assets/demo-resolved.svg";

const demoMode = new URLSearchParams(window.location.search).has("demo");
let nickname = demoMode ? "StudentDemo" : "";
let currentScreen = demoMode ? "home" : "login";
let selectedReportId = "1";
let reports = [
  {
    id: "1",
    city: "Palermo",
    problemType: "graffiti",
    description: "Graffiti on a wall near the bus stop.",
    photoUri: mockPhotos[0],
    latitude: 38.1157,
    longitude: 13.3615,
    areaName: "Central Palermo",
    createdAt: "2026-05-04T09:20:00.000Z",
    createdByNickname: "SunnyPalermo",
    votes: 8,
    comments: [
      {
        id: "c1",
        nickname: "ViaRoma",
        text: "I saw this yesterday too.",
        createdAt: "2026-05-04T11:10:00.000Z"
      }
    ],
    status: "open"
  },
  {
    id: "2",
    city: "Palermo",
    problemType: "rubbish",
    description: "Rubbish bags left beside a small square.",
    photoUri: mockPhotos[1],
    latitude: 38.118,
    longitude: 13.37,
    areaName: "Central Palermo",
    createdAt: "2026-05-03T15:40:00.000Z",
    createdByNickname: "SeaWalk",
    votes: 13,
    comments: [],
    status: "open"
  }
];

const screen = document.querySelector("#screen");
const tabs = document.querySelector("#tabs");
const profileButton = document.querySelector("#profileButton");

function applyPrivacyBlur(photoUri) {
  return {
    photoUri,
    message: "Privacy blur applied"
  };
}

function go(nextScreen) {
  currentScreen = nextScreen;
  render();
}

function openReport(reportId) {
  selectedReportId = reportId;
  go("detail");
}

function readableProblemType(value) {
  const found = problemTypes.find(([key]) => key === value);
  return found ? found[1] : "Other";
}

function formatDateTime(value) {
  const date = new Date(value);
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
}

function badge(status) {
  return `<span class="badge ${status === "resolved" ? "resolved" : ""}">${status}</span>`;
}

function getUserReports() {
  return reports.filter((report) => report.createdByNickname === nickname);
}

function getUserVotes() {
  return getUserReports().reduce((total, report) => total + report.votes, 0);
}

function reportCard(report) {
  const latestComment = report.comments.at(-1);

  return `
    <article class="card" onclick="openReport('${report.id}')">
      <img src="${report.photoUri}" alt="${readableProblemType(report.problemType)} report photo" />
      <div class="card-body">
        <div class="top-line">
          <strong>${readableProblemType(report.problemType)}</strong>
          ${badge(report.status)}
        </div>
        <p>${report.description}</p>
        <span class="meta">${report.areaName} · ${formatDateTime(report.createdAt)}</span>
        <span class="meta">Votes: ${report.votes} · Comments: ${report.comments.length}</span>
        ${
          latestComment
            ? `<div class="mini-comment">Latest: “${latestComment.text}”</div>`
            : `<div class="mini-comment empty">No comments yet</div>`
        }
      </div>
    </article>
  `;
}

function renderLogin() {
  screen.innerHTML = `
    <div class="stack">
      <h2>Welcome</h2>
      <p>Use a nickname only. Login methods are mocked for this school demo.</p>
      <input id="nicknameInput" placeholder="Nickname" value="${nickname}" />
      <div class="grid">
        <button class="secondary" type="button">Email</button>
        <button class="secondary" type="button">Phone</button>
        <button class="secondary" type="button">Google</button>
        <button class="secondary" type="button">Apple</button>
      </div>
      <button class="primary" id="loginButton" type="button">Enter demo app</button>
    </div>
  `;

  document.querySelector("#loginButton").addEventListener("click", () => {
    const value = document.querySelector("#nicknameInput").value.trim();
    if (value.length < 2) {
      alert("Please enter a nickname.");
      return;
    }
    nickname = value;
    go("home");
  });
}

function renderHome() {
  const open = reports.filter((report) => report.status === "open").length;
  const resolved = reports.filter((report) => report.status === "resolved").length;

  screen.innerHTML = `
    <div class="stack">
      <h2>Hi, ${nickname}</h2>
      <p>Report visible public issues in Palermo and help show what needs attention.</p>
      <div class="stats">
        <div class="stat"><strong>${reports.length}</strong><span>Reports</span></div>
        <div class="stat"><strong>${open}</strong><span>Open</span></div>
        <div class="stat"><strong>${resolved}</strong><span>Resolved</span></div>
      </div>
      <button class="primary" onclick="go('create')">Create a report</button>
      <h3>Latest reports</h3>
      ${reports.slice(0, 3).map(reportCard).join("")}
    </div>
  `;
}

function renderCreate() {
  screen.innerHTML = `
    <form id="reportForm" class="stack">
      <h2>Create report</h2>
      <p>Mock location: Central Palermo. Photo selection is simulated.</p>
      <img id="photoPreview" class="preview" src="${mockPhotos[0]}" alt="Selected report preview" />
      <div class="row">
        <button class="secondary" type="button" data-photo="0">Take photo</button>
        <button class="secondary" type="button" data-photo="1">Rubbish photo</button>
        <button class="secondary" type="button" data-photo="2">Pothole photo</button>
      </div>
      <p id="privacyMessage" class="success"></p>
      <label for="problemType">Problem type</label>
      <select id="problemType">
        ${problemTypes.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}
      </select>
      <label for="description">Short description</label>
      <textarea id="description" placeholder="What can people see here?"></textarea>
      <button class="primary" type="submit">Submit report</button>
    </form>
  `;

  let photoUri = mockPhotos[0];
  document.querySelectorAll("[data-photo]").forEach((button) => {
    button.addEventListener("click", () => {
      const result = applyPrivacyBlur(mockPhotos[Number(button.dataset.photo)]);
      photoUri = result.photoUri;
      document.querySelector("#photoPreview").src = photoUri;
      document.querySelector("#privacyMessage").textContent = result.message;
    });
  });

  document.querySelector("#reportForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const now = new Date();
    const report = {
      id: String(now.getTime()),
      city: "Palermo",
      problemType: document.querySelector("#problemType").value,
      description:
        document.querySelector("#description").value.trim() || "No description added.",
      photoUri,
      latitude: 38.1157,
      longitude: 13.3615,
      areaName: "Central Palermo",
      createdAt: now.toISOString(),
      createdByNickname: nickname,
      votes: 1,
      comments: [],
      status: "open"
    };
    reports = [report, ...reports];
    openReport(report.id);
  });
}

function renderReports() {
  screen.innerHTML = `
    <div class="stack">
      <h2>Palermo reports</h2>
      <div class="map">
        <strong>Simple demo map</strong>
        <p>Markers are shown as report cards below.</p>
        ${reports
          .map(
            (report, index) => `
            <button class="marker ${report.status === "resolved" ? "resolved" : ""}"
              style="left:${10 + (index * 23) % 70}%; top:${28 + (index * 17) % 54}%"
              onclick="openReport('${report.id}')">${index + 1}</button>
          `
          )
          .join("")}
      </div>
      ${reports.map(reportCard).join("")}
    </div>
  `;
}

function renderDetail() {
  const report = reports.find((item) => item.id === selectedReportId);

  screen.innerHTML = `
    <div class="stack detail-layout">
      <h2>${readableProblemType(report.problemType)}</h2>
      <img class="large-photo" src="${report.photoUri}" alt="Report photo" />
      ${badge(report.status)}
      <p>${report.description}</p>
      <p class="meta">${report.city} · ${report.areaName}</p>
      <p class="meta">Location: ${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}</p>
      <p class="meta">Created by ${report.createdByNickname} · ${formatDateTime(report.createdAt)}</p>
      <div class="row">
        <button class="secondary" onclick="vote()">Vote (${report.votes})</button>
        ${
          report.status === "open"
            ? `<button class="primary" onclick="markResolved()">Mark resolved</button>`
            : `<button class="primary" onclick="go('resolved')">View resolved</button>`
        }
      </div>
      <section class="comments-panel">
        <div class="top-line">
          <h3>Report discussion</h3>
          <span class="comment-count">${report.comments.length} comments</span>
        </div>
        <p class="meta">Each report has its own comment section so citizens can confirm details.</p>
        <div class="comment-list">
          ${
            report.comments.length
              ? report.comments
                  .map(
                    (comment) => `
            <div class="comment">
              <div class="avatar">${comment.nickname.slice(0, 2).toUpperCase()}</div>
              <div>
                <strong>${comment.nickname}</strong>
                <p>${comment.text}</p>
                <span class="meta">${formatDateTime(comment.createdAt)}</span>
              </div>
            </div>
          `
                  )
                  .join("")
              : `<div class="empty-state">No comments yet. Add the first update for this report.</div>`
          }
        </div>
        <div class="comment-form">
          <input id="commentText" placeholder="Add a short comment to this report" />
          <button class="secondary" onclick="addComment()">Add comment</button>
        </div>
      </section>
    </div>
  `;
}

function renderResolved() {
  const report = reports.find((item) => item.id === selectedReportId);

  screen.innerHTML = `
    <div class="stack">
      <h2>Resolved report</h2>
      ${badge(report.status)}
      <p>The demo adds a second photo when a problem is marked as resolved.</p>
      <label>Original photo</label>
      <img class="large-photo" src="${report.photoUri}" alt="Original report photo" />
      <label>Resolved photo</label>
      <img class="large-photo" src="${report.resolvedPhotoUri || resolvedPhoto}" alt="Resolved report photo" />
      <button class="secondary" onclick="openReport('${report.id}')">Back to details</button>
    </div>
  `;
}

function renderSummary() {
  const total = reports.length;
  const open = reports.filter((report) => report.status === "open").length;
  const resolved = reports.filter((report) => report.status === "resolved").length;
  const commonProblem = mostCommon(reports.map((report) => readableProblemType(report.problemType)));
  const busiestArea = mostCommon(reports.map((report) => report.areaName));

  screen.innerHTML = `
    <div class="stack">
      <h2>AI-style summary</h2>
      <p>This uses simple JavaScript counts, not real AI.</p>
      <div class="stats">
        <div class="stat"><strong>${total}</strong><span>Total</span></div>
        <div class="stat"><strong>${open}</strong><span>Open</span></div>
        <div class="stat"><strong>${resolved}</strong><span>Resolved</span></div>
      </div>
      <div class="summary-box">
        Most reports this week are about ${commonProblem.toLowerCase()}. The highest number of reports is in ${busiestArea}. Authorities appear to be resolving some issues, but several reports remain open.
      </div>
      <label>Most common problem</label>
      <p>${commonProblem}</p>
      <label>Area with most reports</label>
      <p>${busiestArea}</p>
    </div>
  `;
}

function renderProfile() {
  const userReports = getUserReports();
  const userOpen = userReports.filter((report) => report.status === "open").length;
  const userResolved = userReports.filter((report) => report.status === "resolved").length;
  const userComments = reports.reduce(
    (total, report) =>
      total + report.comments.filter((comment) => comment.nickname === nickname).length,
    0
  );
  const initials = nickname.slice(0, 2).toUpperCase();

  screen.innerHTML = `
    <div class="stack">
      <section class="profile-hero">
        <div class="profile-avatar">${initials}</div>
        <div>
          <h2>${nickname}</h2>
          <p>Palermo demo citizen</p>
        </div>
      </section>
      <div class="stats">
        <div class="stat"><strong>${userReports.length}</strong><span>My reports</span></div>
        <div class="stat"><strong>${getUserVotes()}</strong><span>Votes received</span></div>
        <div class="stat"><strong>${userComments}</strong><span>Comments added</span></div>
      </div>
      <div class="profile-grid">
        <div class="summary-box">
          <label>Privacy</label>
          <p>Only a nickname is shown. Real names are not used in this prototype.</p>
        </div>
        <div class="summary-box">
          <label>City</label>
          <p>Palermo</p>
        </div>
        <div class="summary-box">
          <label>Open reports</label>
          <p>${userOpen}</p>
        </div>
        <div class="summary-box">
          <label>Resolved reports</label>
          <p>${userResolved}</p>
        </div>
      </div>
      <h3>My recent reports</h3>
      ${
        userReports.length
          ? userReports.map(reportCard).join("")
          : `<div class="empty-state">Create a report and it will appear here.</div>`
      }
      <div class="summary-box">
        This profile is still mocked for the school demo, but it shows how a real account page could summarize activity.
      </div>
    </div>
  `;
}

function vote() {
  reports = reports.map((report) =>
    report.id === selectedReportId ? { ...report, votes: report.votes + 1 } : report
  );
  renderDetail();
}

function addComment() {
  const input = document.querySelector("#commentText");
  if (!input.value.trim()) {
    return;
  }

  reports = reports.map((report) =>
    report.id === selectedReportId
      ? {
          ...report,
          comments: [
            ...report.comments,
            {
              id: String(Date.now()),
              nickname,
              text: input.value.trim(),
              createdAt: new Date().toISOString()
            }
          ]
        }
      : report
  );
  renderDetail();
}

function markResolved() {
  reports = reports.map((report) =>
    report.id === selectedReportId
      ? { ...report, status: "resolved", resolvedPhotoUri: resolvedPhoto }
      : report
  );
  go("resolved");
}

function mostCommon(values) {
  if (!values.length) {
    return "No reports yet";
  }

  const counts = values.reduce((result, value) => {
    result[value] = (result[value] || 0) + 1;
    return result;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function render() {
  profileButton.classList.toggle("hidden", currentScreen === "login");
  tabs.classList.toggle("hidden", currentScreen === "login");
  profileButton.textContent = nickname || "Profile";

  document.querySelectorAll(".tabs button").forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === currentScreen);
  });

  if (currentScreen === "login") renderLogin();
  if (currentScreen === "home") renderHome();
  if (currentScreen === "create") renderCreate();
  if (currentScreen === "reports") renderReports();
  if (currentScreen === "detail") renderDetail();
  if (currentScreen === "resolved") renderResolved();
  if (currentScreen === "summary") renderSummary();
  if (currentScreen === "profile") renderProfile();
}

tabs.addEventListener("click", (event) => {
  if (event.target.matches("button")) {
    go(event.target.dataset.screen);
  }
});

profileButton.addEventListener("click", () => go("profile"));

window.go = go;
window.openReport = openReport;
window.vote = vote;
window.addComment = addComment;
window.markResolved = markResolved;

render();
