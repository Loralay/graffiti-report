const problemTypes = [
  ["graffiti", "Graffiti"],
  ["rubbish", "Rubbish"],
  ["pothole", "Pothole"],
  ["broken_street_furniture", "Broken furniture"],
  ["other", "Other"]
];

const STATUS_MARKER_THEME = {
  scheduled: {
    label: "We will begin",
    outer: "#F6B833",
    inner: "#FFF28A"
  },
  in_progress: {
    label: "Still working on it",
    outer: "#D96A00",
    inner: "#F3B47A"
  },
  resolved: {
    label: "Did it",
    outer: "#9ED3EA",
    inner: "#5B8FC9"
  }
};

const mockPhotos = [
  "assets/demo-graffiti.svg",
  "assets/demo-rubbish.svg",
  "assets/demo-pothole.svg"
];

const resolvedPhoto = "assets/demo-resolved.svg";

const urlParams = new URLSearchParams(window.location.search);
const demoMode = urlParams.has("demo");
const requestedScreen = urlParams.get("screen");
const initialDemoScreen = ["home", "create", "reports", "summary", "profile"].includes(
  requestedScreen
)
  ? requestedScreen
  : "home";
let nickname = demoMode ? "StudentDemo" : "";
let currentScreen = demoMode ? initialDemoScreen : "login";
let selectedReportId = "1";
let reportFilters = {
  status: "all",
  type: "all",
  query: "",
  sort: "newest"
};

const palermoBounds = {
  north: 38.151,
  south: 38.082,
  west: 13.292,
  east: 13.432
};

const palermoAreas = [
  { areaName: "Centro Storico", latitude: 38.1157, longitude: 13.3615 },
  { areaName: "Kalsa", latitude: 38.1121, longitude: 13.3698 },
  { areaName: "Politeama", latitude: 38.1257, longitude: 13.3563 },
  { areaName: "Ballaro", latitude: 38.1113, longitude: 13.3607 },
  { areaName: "Mondello Road", latitude: 38.1492, longitude: 13.3336 },
  { areaName: "Oreto", latitude: 38.1037, longitude: 13.3649 },
  { areaName: "Notarbartolo", latitude: 38.1366, longitude: 13.3427 }
];

let reports = [
  {
    id: "1",
    city: "Palermo",
    problemType: "graffiti",
    description: "Graffiti on a wall near the bus stop.",
    photoUri: mockPhotos[0],
    latitude: 38.1157,
    longitude: 13.3615,
    areaName: "Centro Storico",
    createdAt: "2026-05-04T09:20:00.000Z",
    createdByNickname: "SunnyPalermo",
    votes: 8,
    priority: "medium",
    comments: [
      {
        id: "c1",
        nickname: "ViaRoma",
        text: "I saw this yesterday too.",
        createdAt: "2026-05-04T11:10:00.000Z"
      }
    ],
    status: "scheduled"
  },
  {
    id: "2",
    city: "Palermo",
    problemType: "rubbish",
    description: "Rubbish bags left beside a small square.",
    photoUri: mockPhotos[1],
    latitude: 38.1121,
    longitude: 13.3698,
    areaName: "Kalsa",
    createdAt: "2026-05-03T15:40:00.000Z",
    createdByNickname: "SeaWalk",
    votes: 13,
    priority: "high",
    comments: [],
    status: "in_progress"
  },
  {
    id: "3",
    city: "Palermo",
    problemType: "pothole",
    description: "Small pothole on a side road near a school entrance.",
    photoUri: mockPhotos[2],
    latitude: 38.1366,
    longitude: 13.3427,
    areaName: "Notarbartolo",
    createdAt: "2026-05-02T12:15:00.000Z",
    createdByNickname: "QuietStreet",
    votes: 6,
    priority: "medium",
    comments: [
      {
        id: "c2",
        nickname: "BikePalermo",
        text: "This is difficult for bikes.",
        createdAt: "2026-05-02T16:05:00.000Z"
      }
    ],
    status: "scheduled"
  },
  {
    id: "4",
    city: "Palermo",
    problemType: "broken_street_furniture",
    description: "A bench needs repair near a busy walking route.",
    photoUri: mockPhotos[0],
    latitude: 38.1257,
    longitude: 13.3563,
    areaName: "Politeama",
    createdAt: "2026-05-01T18:30:00.000Z",
    createdByNickname: "CityWalker",
    votes: 10,
    priority: "low",
    comments: [],
    status: "resolved",
    resolvedPhotoUri: resolvedPhoto
  }
];

const storedReports = localStorage.getItem("graffitiReportReports");
if (storedReports) {
  try {
    reports = JSON.parse(storedReports);
    reports = reports.map((report, index) => ({
      ...report,
      status:
        report.status === "open"
          ? index % 2 === 0
            ? "scheduled"
            : "in_progress"
          : report.status
    }));
  } catch {
    localStorage.removeItem("graffitiReportReports");
  }
}

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

function saveReports() {
  localStorage.setItem("graffitiReportReports", JSON.stringify(reports));
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

function statusLabel(status) {
  return STATUS_MARKER_THEME[status]?.label ?? status;
}

function badge(status) {
  const theme = STATUS_MARKER_THEME[status] ?? STATUS_MARKER_THEME.scheduled;
  return `<span class="badge" style="--badge-bg:${theme.inner}; --badge-color:${status === "resolved" ? theme.outer : "#765400"}">${theme.label}</span>`;
}

function priorityBadge(priority = "medium") {
  return `<span class="priority priority-${priority}">${priority} priority</span>`;
}

function seededNumber(seed) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(Math.sin(hash) * 10000) % 1;
}

function randomPalermoLocation(seed) {
  const base = palermoAreas[Math.floor(seededNumber(seed) * palermoAreas.length)];
  const latOffset = (seededNumber(`${seed}-lat`) - 0.5) * 0.009;
  const lonOffset = (seededNumber(`${seed}-lon`) - 0.5) * 0.012;

  return {
    areaName: base.areaName,
    latitude: Number((base.latitude + latOffset).toFixed(5)),
    longitude: Number((base.longitude + lonOffset).toFixed(5))
  };
}

function mapPosition(report) {
  const left =
    ((report.longitude - palermoBounds.west) /
      (palermoBounds.east - palermoBounds.west)) *
    100;
  const top =
    ((palermoBounds.north - report.latitude) /
      (palermoBounds.north - palermoBounds.south)) *
    100;

  return {
    left: Math.max(4, Math.min(92, left)),
    top: Math.max(12, Math.min(86, top))
  };
}

function palermoMapTiles() {
  const tiles = [];
  for (let y = 3155; y <= 3157; y += 1) {
    for (let x = 4398; x <= 4401; x += 1) {
      tiles.push(`<img src="https://tile.openstreetmap.org/13/${x}/${y}.png" alt="" />`);
    }
  }
  return tiles.join("");
}

function statusMarkerSvg(status, options = {}) {
  const theme = STATUS_MARKER_THEME[status] ?? STATUS_MARKER_THEME.scheduled;
  const count = options.count ? String(options.count) : "";
  const stroke = options.selected ? "#173635" : "#ffffff";
  const strokeWidth = options.selected ? 4 : 2.5;

  return `
    <svg class="status-marker-svg" viewBox="0 0 64 80" aria-hidden="true">
      <path d="M32 76C32 76 9 49.9 9 28C9 14.7 19.3 4 32 4s23 10.7 23 24c0 21.9-23 48-23 48Z"
        fill="${theme.outer}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>
      <circle cx="32" cy="28" r="12" fill="${theme.inner}"/>
      ${
        count
          ? `<text x="32" y="32" text-anchor="middle" dominant-baseline="middle" class="status-marker-count">${count}</text>`
          : ""
      }
    </svg>
  `;
}

function statusMarkerLegend() {
  return Object.entries(STATUS_MARKER_THEME)
    .map(
      ([status, theme]) => `
        <span class="marker-legend-item">
          ${statusMarkerSvg(status)}
          <span>${theme.label}</span>
        </span>
      `
    )
    .join("");
}

function getUserReports() {
  return reports.filter((report) => report.createdByNickname === nickname);
}

function getUserVotes() {
  return getUserReports().reduce((total, report) => total + report.votes, 0);
}

function filteredReports() {
  const query = reportFilters.query.trim().toLowerCase();

  return reports
    .filter((report) => {
      const matchesStatus =
        reportFilters.status === "all" || report.status === reportFilters.status;
      const matchesType =
        reportFilters.type === "all" || report.problemType === reportFilters.type;
      const matchesQuery =
        !query ||
        report.description.toLowerCase().includes(query) ||
        report.areaName.toLowerCase().includes(query) ||
        readableProblemType(report.problemType).toLowerCase().includes(query);

      return matchesStatus && matchesType && matchesQuery;
    })
    .sort((a, b) => {
      if (reportFilters.sort === "votes") {
        return b.votes - a.votes;
      }
      if (reportFilters.sort === "priority") {
        const weights = { high: 3, medium: 2, low: 1 };
        return (weights[b.priority] ?? 2) - (weights[a.priority] ?? 2);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

function latestActivity() {
  return [...reports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
}

function reportCard(report) {
  const latestComment = report.comments.at(-1);

  return `
    <article class="card report-card" onclick="openReport('${report.id}')">
      <img src="${report.photoUri}" alt="${readableProblemType(report.problemType)} report photo" />
      <div class="card-body">
        <div class="top-line">
          <strong>${readableProblemType(report.problemType)}</strong>
          ${badge(report.status)}
        </div>
        ${priorityBadge(report.priority)}
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
  const scheduled = reports.filter((report) => report.status === "scheduled").length;
  const inProgress = reports.filter((report) => report.status === "in_progress").length;
  const resolved = reports.filter((report) => report.status === "resolved").length;
  const highPriority = reports.filter((report) => report.priority === "high").length;

  screen.innerHTML = `
    <div class="stack">
      <section class="hero-panel">
        <span class="eyebrow">Palermo civic prototype</span>
        <h2>Hi, ${nickname}</h2>
        <p>Report visible public issues, confirm what neighbors see, and track city improvements.</p>
      </section>
      <div class="stats">
        <div class="stat"><strong>${scheduled}</strong><span>We will begin</span></div>
        <div class="stat"><strong>${inProgress}</strong><span>Still working on it</span></div>
        <div class="stat"><strong>${resolved}</strong><span>Did it</span></div>
      </div>
      <div class="action-grid">
        <button class="primary" onclick="go('create')">Create a report</button>
        <button class="secondary" onclick="go('reports')">Open map</button>
      </div>
      <section class="summary-box">
        <label>Today’s attention</label>
        <p>${highPriority} high-priority issue${highPriority === 1 ? "" : "s"} need review.</p>
      </section>
      <h3>Activity feed</h3>
      <div class="activity-list">
        ${latestActivity()
          .map(
            (report) => `
          <button class="activity-item" onclick="openReport('${report.id}')">
            <span>${readableProblemType(report.problemType)}</span>
            <strong>${report.areaName}</strong>
            <small>${statusLabel(report.status)} · ${report.votes} votes</small>
          </button>
        `
          )
          .join("")}
      </div>
      <h3>Latest reports</h3>
      ${reports.slice(0, 3).map(reportCard).join("")}
    </div>
  `;
}

function renderCreate() {
  screen.innerHTML = `
    <form id="reportForm" class="stack">
      <h2>Create report</h2>
      <p>Take a camera photo or use a demo photo. The location is randomized around Palermo for the demo.</p>
      <img id="photoPreview" class="preview" src="${mockPhotos[0]}" alt="Selected report preview" />
      <input id="cameraInput" class="camera-input" type="file" accept="image/*" capture="environment" />
      <div class="row">
        <button class="secondary camera-button" type="button" id="cameraButton">Take a photo</button>
        <button class="secondary" type="button" data-photo="0">Graffiti photo</button>
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
      <label for="priority">Priority</label>
      <select id="priority">
        <option value="low">Low</option>
        <option value="medium" selected>Medium</option>
        <option value="high">High</option>
      </select>
      <button class="secondary" type="button" id="locationButton">Use Palermo geolocator</button>
      <p id="locationPreview" class="success"></p>
      <button class="primary" type="submit">Submit report</button>
    </form>
  `;

  let photoUri = mockPhotos[0];
  let selectedLocation = null;
  const cameraInput = document.querySelector("#cameraInput");
  document.querySelector("#cameraButton").addEventListener("click", () => {
    cameraInput.click();
  });
  cameraInput.addEventListener("change", () => {
    const [file] = cameraInput.files;
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      photoUri = String(reader.result);
      document.querySelector("#photoPreview").src = photoUri;
      document.querySelector("#privacyMessage").textContent = "Camera photo added. Privacy blur applied";
    });
    reader.readAsDataURL(file);
  });
  document.querySelectorAll("[data-photo]").forEach((button) => {
    button.addEventListener("click", () => {
      const result = applyPrivacyBlur(mockPhotos[Number(button.dataset.photo)]);
      photoUri = result.photoUri;
      document.querySelector("#photoPreview").src = photoUri;
      document.querySelector("#privacyMessage").textContent = result.message;
    });
  });

  document.querySelector("#locationButton").addEventListener("click", () => {
    selectedLocation = randomPalermoLocation(`manual-${Date.now()}`);
    document.querySelector(
      "#locationPreview"
    ).textContent = `Location selected: ${selectedLocation.areaName}`;
  });

  document.querySelector("#reportForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const now = new Date();
    const problemType = document.querySelector("#problemType").value;
    const priority = document.querySelector("#priority").value;
    const location = selectedLocation ?? randomPalermoLocation(`${now.getTime()}-${problemType}`);
    const report = {
      id: String(now.getTime()),
      city: "Palermo",
      problemType,
      description:
        document.querySelector("#description").value.trim() || "No description added.",
      photoUri,
      latitude: location.latitude,
      longitude: location.longitude,
      areaName: location.areaName,
      createdAt: now.toISOString(),
      createdByNickname: nickname,
      votes: 1,
      priority,
      comments: [],
      status: "scheduled"
    };
    reports = [report, ...reports];
    saveReports();
    openReport(report.id);
  });
}

function renderReports() {
  const visibleReports = filteredReports();

  screen.innerHTML = `
    <div class="stack">
      <section class="hero-panel compact">
        <span class="eyebrow">Live geolocator demo</span>
        <h2>Palermo reports</h2>
        <p>Reports are placed around real Palermo coordinates on an OpenStreetMap view.</p>
      </section>
      <section class="filter-panel">
        <input id="reportSearch" placeholder="Search area, type, or description" value="${reportFilters.query}" />
        <div class="chip-row">
          ${["all", "scheduled", "in_progress", "resolved"]
            .map(
              (status) => `
            <button class="filter-chip ${reportFilters.status === status ? "active" : ""}"
              onclick="setStatusFilter('${status}')">${status === "all" ? "All" : statusLabel(status)}</button>
          `
            )
            .join("")}
        </div>
        <div class="row">
          <select id="typeFilter">
            <option value="all">All problem types</option>
            ${problemTypes
              .map(
                ([value, label]) =>
                  `<option value="${value}" ${reportFilters.type === value ? "selected" : ""}>${label}</option>`
              )
              .join("")}
          </select>
          <select id="sortFilter">
            <option value="newest" ${reportFilters.sort === "newest" ? "selected" : ""}>Newest</option>
            <option value="votes" ${reportFilters.sort === "votes" ? "selected" : ""}>Most votes</option>
            <option value="priority" ${reportFilters.sort === "priority" ? "selected" : ""}>Priority</option>
          </select>
        </div>
      </section>
      <div class="map real-map">
        <div class="map-tile-grid">${palermoMapTiles()}</div>
        <div class="map-shade"></div>
        <div class="map-label">
          <strong>Palermo geolocator</strong>
          <span>${visibleReports.length} visible report markers</span>
        </div>
        <div class="marker-legend">${statusMarkerLegend()}</div>
        ${visibleReports
          .map(
            (report, index) => {
              const position = mapPosition(report);
              return `
            <button class="marker"
              title="${readableProblemType(report.problemType)} in ${report.areaName}"
              aria-label="${statusLabel(report.status)}: ${readableProblemType(report.problemType)} in ${report.areaName}"
              style="left:${position.left}%; top:${position.top}%"
              onclick="openReport('${report.id}')">
              ${statusMarkerSvg(report.status, { count: index + 1 })}
            </button>
          `;
            }
          )
          .join("")}
      </div>
      ${
        visibleReports.length
          ? visibleReports.map(reportCard).join("")
          : `<div class="empty-state">No reports match these filters.</div>`
      }
    </div>
  `;

  document.querySelector("#reportSearch").addEventListener("input", (event) => {
    reportFilters.query = event.target.value;
    renderReports();
  });
  document.querySelector("#typeFilter").addEventListener("change", (event) => {
    reportFilters.type = event.target.value;
    renderReports();
  });
  document.querySelector("#sortFilter").addEventListener("change", (event) => {
    reportFilters.sort = event.target.value;
    renderReports();
  });
}

function renderDetail() {
  const report = reports.find((item) => item.id === selectedReportId);

  screen.innerHTML = `
    <div class="stack detail-layout">
      <h2>${readableProblemType(report.problemType)}</h2>
      <img class="large-photo" src="${report.photoUri}" alt="Report photo" />
      ${badge(report.status)}
      ${priorityBadge(report.priority)}
      <p>${report.description}</p>
      <p class="meta">${report.city} · ${report.areaName}</p>
      <p class="meta">Location: ${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}</p>
      <p class="meta">Created by ${report.createdByNickname} · ${formatDateTime(report.createdAt)}</p>
      <div class="row">
        <button class="secondary" onclick="vote()">Vote (${report.votes})</button>
        ${
          report.status !== "resolved"
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
  const inProgress = reports.filter((report) => report.status === "in_progress").length;
  const resolved = reports.filter((report) => report.status === "resolved").length;
  const commonProblem = mostCommon(reports.map((report) => readableProblemType(report.problemType)));
  const busiestArea = mostCommon(reports.map((report) => report.areaName));

  screen.innerHTML = `
    <div class="stack">
      <h2>AI-style summary</h2>
      <p>This uses simple JavaScript counts, not real AI.</p>
      <div class="stats">
        <div class="stat"><strong>${total}</strong><span>Total</span></div>
        <div class="stat"><strong>${inProgress}</strong><span>Still working on it</span></div>
        <div class="stat"><strong>${resolved}</strong><span>Did it</span></div>
      </div>
      <div class="summary-box">
        Most reports this week are about ${commonProblem.toLowerCase()}. The highest number of reports is in ${busiestArea}. Workflows now show what will begin, what is still being worked on, and what is done.
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
  const userActive = userReports.filter((report) => report.status !== "resolved").length;
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
          <label>Active reports</label>
          <p>${userActive}</p>
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
      <button class="secondary" onclick="resetDemoData()">Reset demo data</button>
    </div>
  `;
}

function vote() {
  reports = reports.map((report) =>
    report.id === selectedReportId ? { ...report, votes: report.votes + 1 } : report
  );
  saveReports();
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
  saveReports();
  renderDetail();
}

function markResolved() {
  reports = reports.map((report) =>
    report.id === selectedReportId
      ? { ...report, status: "resolved", resolvedPhotoUri: resolvedPhoto }
      : report
  );
  saveReports();
  go("resolved");
}

function setStatusFilter(status) {
  reportFilters.status = status;
  renderReports();
}

function resetDemoData() {
  localStorage.removeItem("graffitiReportReports");
  window.location.reload();
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
window.setStatusFilter = setStatusFilter;
window.resetDemoData = resetDemoData;

render();
