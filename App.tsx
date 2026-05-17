import React, { useMemo, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

type ProblemType =
  | "graffiti"
  | "rubbish"
  | "pothole"
  | "broken_street_furniture"
  | "other";

type ReportStatus = "scheduled" | "in_progress" | "resolved";

const FONT_FAMILIES = {
  title: "Archivo Black",
  body: "Montserrat",
  subtitle: "Roboto Serif"
};

const STATUS_MARKER_THEME: Record<
  ReportStatus,
  { label: string; outer: string; inner: string }
> = {
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

type Comment = {
  id: string;
  nickname: string;
  text: string;
  createdAt: string;
};

type Report = {
  id: string;
  city: string;
  problemType: ProblemType;
  description: string;
  photoUri: string;
  resolvedPhotoUri?: string;
  latitude: number;
  longitude: number;
  areaName: string;
  createdAt: string;
  createdByNickname: string;
  votes: number;
  comments: Comment[];
  status: ReportStatus;
};

type Screen =
  | "login"
  | "home"
  | "create"
  | "map"
  | "detail"
  | "resolved"
  | "summary"
  | "profile";

const problemTypes: { label: string; value: ProblemType }[] = [
  { label: "Graffiti", value: "graffiti" },
  { label: "Rubbish", value: "rubbish" },
  { label: "Pothole", value: "pothole" },
  { label: "Broken furniture", value: "broken_street_furniture" },
  { label: "Other", value: "other" }
];

const mockPhotos = [
  "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1563132337-f159f484226c?auto=format&fit=crop&w=900&q=80"
];

const resolvedPhoto =
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80";

const seedReports: Report[] = [
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
    status: "scheduled"
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
    status: "in_progress"
  }
];

function applyPrivacyBlur(photoUri: string) {
  return {
    photoUri,
    message: "Privacy blur applied"
  };
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
}

function readableProblemType(problemType: ProblemType) {
  return problemTypes.find((type) => type.value === problemType)?.label ?? "Other";
}

function markerSvgDataUri(status: ReportStatus, selected = false) {
  const theme = STATUS_MARKER_THEME[status];
  const stroke = selected ? "#173635" : "#ffffff";
  const strokeWidth = selected ? 4 : 2.5;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80">
      <path d="M32 76C32 76 9 49.9 9 28C9 14.7 19.3 4 32 4s23 10.7 23 24c0 21.9-23 48-23 48Z" fill="${theme.outer}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>
      <circle cx="32" cy="28" r="12" fill="${theme.inner}"/>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function statusLabel(status: ReportStatus) {
  return STATUS_MARKER_THEME[status].label;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [nickname, setNickname] = useState("");
  const [reports, setReports] = useState<Report[]>(seedReports);
  const [selectedReportId, setSelectedReportId] = useState(seedReports[0].id);

  const selectedReport = reports.find((report) => report.id === selectedReportId);

  function openReport(reportId: string) {
    setSelectedReportId(reportId);
    setScreen("detail");
  }

  function saveReport(report: Report) {
    setReports((currentReports) => [report, ...currentReports]);
    setSelectedReportId(report.id);
    setScreen("detail");
  }

  function updateReport(updatedReport: Report) {
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === updatedReport.id ? updatedReport : report
      )
    );
    setSelectedReportId(updatedReport.id);
  }

  if (screen === "login") {
    return (
      <AppShell screen={screen} setScreen={setScreen} nickname={nickname}>
        <LoginScreen
          nickname={nickname}
          setNickname={setNickname}
          onLogin={() => setScreen("home")}
        />
      </AppShell>
    );
  }

  return (
    <AppShell screen={screen} setScreen={setScreen} nickname={nickname}>
      {screen === "home" && (
        <HomeScreen
          nickname={nickname}
          reports={reports}
          setScreen={setScreen}
          openReport={openReport}
        />
      )}
      {screen === "create" && (
        <CreateReportScreen
          nickname={nickname}
          onSubmit={saveReport}
        />
      )}
      {screen === "map" && (
        <MapScreen reports={reports} openReport={openReport} />
      )}
      {screen === "detail" && selectedReport && (
        <ReportDetailScreen
          nickname={nickname}
          report={selectedReport}
          updateReport={updateReport}
          setScreen={setScreen}
        />
      )}
      {screen === "resolved" && selectedReport && (
        <ResolvedReportScreen report={selectedReport} openReport={openReport} />
      )}
      {screen === "summary" && <SummaryScreen reports={reports} />}
      {screen === "profile" && (
        <ProfileScreen nickname={nickname} reportCount={reports.length} />
      )}
    </AppShell>
  );
}

function AppShell({
  children,
  nickname,
  screen,
  setScreen
}: {
  children: React.ReactNode;
  nickname: string;
  screen: Screen;
  setScreen: (screen: Screen) => void;
}) {
  const isLoggedIn = screen !== "login";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.app}>
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>Graffiti Report</Text>
            <Text style={styles.cityLabel}>Palermo city prototype</Text>
          </View>
          {isLoggedIn && (
            <Pressable style={styles.smallButton} onPress={() => setScreen("profile")}>
              <Text style={styles.smallButtonText}>{nickname || "Profile"}</Text>
            </Pressable>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>

        {isLoggedIn && (
          <View style={styles.tabs}>
            <Tab label="Home" active={screen === "home"} onPress={() => setScreen("home")} />
            <Tab label="New" active={screen === "create"} onPress={() => setScreen("create")} />
            <Tab label="Reports" active={screen === "map"} onPress={() => setScreen("map")} />
            <Tab label="Summary" active={screen === "summary"} onPress={() => setScreen("summary")} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function Tab({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.tab, active && styles.activeTab]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text>
    </Pressable>
  );
}

function LoginScreen({
  nickname,
  setNickname,
  onLogin
}: {
  nickname: string;
  setNickname: (nickname: string) => void;
  onLogin: () => void;
}) {
  const canLogin = nickname.trim().length > 1;

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.text}>
        Use a nickname only. Login methods are mocked for this school demo.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nickname"
        value={nickname}
        onChangeText={setNickname}
      />

      <View style={styles.grid}>
        <MockLoginButton label="Email" />
        <MockLoginButton label="Phone" />
        <MockLoginButton label="Google" />
        <MockLoginButton label="Apple" />
      </View>

      <Pressable
        style={[styles.primaryButton, !canLogin && styles.disabledButton]}
        disabled={!canLogin}
        onPress={onLogin}
      >
        <Text style={styles.primaryButtonText}>Enter demo app</Text>
      </Pressable>
    </View>
  );
}

function MockLoginButton({ label }: { label: string }) {
  return (
    <View style={styles.mockLogin}>
      <Text style={styles.mockLoginText}>{label}</Text>
    </View>
  );
}

function HomeScreen({
  nickname,
  reports,
  setScreen,
  openReport
}: {
  nickname: string;
  reports: Report[];
  setScreen: (screen: Screen) => void;
  openReport: (reportId: string) => void;
}) {
  const scheduledIssues = reports.filter((report) => report.status === "scheduled").length;
  const inProgressIssues = reports.filter((report) => report.status === "in_progress").length;
  const resolvedIssues = reports.filter((report) => report.status === "resolved").length;

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Hi, {nickname}</Text>
      <Text style={styles.text}>
        Report visible public issues in Palermo and help show what needs attention.
      </Text>

      <View style={styles.statRow}>
        <Stat label="Will begin" value={scheduledIssues} />
        <Stat label="Working" value={inProgressIssues} />
        <Stat label="Did it" value={resolvedIssues} />
      </View>

      <Pressable style={styles.primaryButton} onPress={() => setScreen("create")}>
        <Text style={styles.primaryButtonText}>Create a report</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Latest reports</Text>
      {reports.slice(0, 3).map((report) => (
        <ReportCard key={report.id} report={report} onPress={() => openReport(report.id)} />
      ))}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function CreateReportScreen({
  nickname,
  onSubmit
}: {
  nickname: string;
  onSubmit: (report: Report) => void;
}) {
  const [problemType, setProblemType] = useState<ProblemType>("graffiti");
  const [description, setDescription] = useState("");
  const [photoUri, setPhotoUri] = useState(mockPhotos[0]);
  const [privacyMessage, setPrivacyMessage] = useState("");

  function choosePhoto(index: number) {
    const result = applyPrivacyBlur(mockPhotos[index]);
    setPhotoUri(result.photoUri);
    setPrivacyMessage(result.message);
  }

  function submitReport() {
    const now = new Date();
    onSubmit({
      id: String(now.getTime()),
      city: "Palermo",
      problemType,
      description: description.trim() || "No description added.",
      photoUri,
      latitude: 38.1157,
      longitude: 13.3615,
      areaName: "Central Palermo",
      createdAt: now.toISOString(),
      createdByNickname: nickname,
      votes: 1,
      comments: [],
      status: "scheduled"
    });
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Create report</Text>
      <Text style={styles.text}>
        Mock location: Central Palermo. Photo selection is simulated.
      </Text>

      <Image source={{ uri: photoUri }} style={styles.previewImage} />
      <View style={styles.row}>
        {mockPhotos.map((_, index) => (
          <Pressable
            key={index}
            style={styles.secondaryButton}
            onPress={() => choosePhoto(index)}
          >
            <Text style={styles.secondaryButtonText}>
              {index === 0 ? "Take a photo" : `Select ${index + 1}`}
            </Text>
          </Pressable>
        ))}
      </View>
      {!!privacyMessage && <Text style={styles.successText}>{privacyMessage}</Text>}

      <Text style={styles.label}>Problem type</Text>
      <View style={styles.chipRow}>
        {problemTypes.map((type) => (
          <Pressable
            key={type.value}
            style={[styles.chip, problemType === type.value && styles.activeChip]}
            onPress={() => setProblemType(type.value)}
          >
            <Text
              style={[
                styles.chipText,
                problemType === type.value && styles.activeChipText
              ]}
            >
              {type.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Short description</Text>
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="What can people see here?"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Pressable style={styles.primaryButton} onPress={submitReport}>
        <Text style={styles.primaryButtonText}>Submit report</Text>
      </Pressable>
    </View>
  );
}

function MapScreen({
  reports,
  openReport
}: {
  reports: Report[];
  openReport: (reportId: string) => void;
}) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Palermo reports</Text>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapTitle}>Simple demo map</Text>
        <Text style={styles.mapText}>Markers are shown as report cards below.</Text>
        <View style={styles.markerRow}>
          {reports.map((report, index) => (
            <Pressable
              key={report.id}
              style={[
                styles.mapMarkerButton,
                { left: `${10 + (index * 23) % 70}%`, top: `${18 + (index * 17) % 54}%` }
              ]}
              onPress={() => openReport(report.id)}
            >
              <StatusMapMarker status={report.status} size={44} count={index + 1} />
            </Pressable>
          ))}
        </View>
      </View>

      {reports.map((report) => (
        <ReportCard key={report.id} report={report} onPress={() => openReport(report.id)} />
      ))}
    </View>
  );
}

function StatusMapMarker({
  status,
  size = 40,
  selected = false,
  count
}: {
  status: ReportStatus;
  size?: number;
  selected?: boolean;
  count?: number | string;
}) {
  return (
    <View
      accessibilityLabel={`${statusLabel(status)} marker`}
      style={[
        styles.statusMarkerWrap,
        selected && styles.statusMarkerSelected,
        { width: size, height: size * 1.25 }
      ]}
    >
      <Image
        source={{ uri: markerSvgDataUri(status, selected) }}
        style={styles.statusMarkerImage}
      />
      {count !== undefined && (
        <Text style={[styles.statusMarkerCount, { top: size * 0.2 }]}>{count}</Text>
      )}
    </View>
  );
}

function ReportCard({
  report,
  onPress
}: {
  report: Report;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: report.photoUri }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <View style={styles.cardTopLine}>
          <Text style={styles.cardTitle}>{readableProblemType(report.problemType)}</Text>
          <StatusBadge status={report.status} />
        </View>
        <Text style={styles.cardText}>{report.description}</Text>
        <Text style={styles.metaText}>
          {report.areaName} · {formatDateTime(report.createdAt)}
        </Text>
        <Text style={styles.metaText}>
          Votes: {report.votes} · Comments: {report.comments.length}
        </Text>
      </View>
    </Pressable>
  );
}

function ReportDetailScreen({
  nickname,
  report,
  updateReport,
  setScreen
}: {
  nickname: string;
  report: Report;
  updateReport: (report: Report) => void;
  setScreen: (screen: Screen) => void;
}) {
  const [commentText, setCommentText] = useState("");

  function vote() {
    updateReport({ ...report, votes: report.votes + 1 });
  }

  function addComment() {
    if (!commentText.trim()) {
      return;
    }

    updateReport({
      ...report,
      comments: [
        ...report.comments,
        {
          id: String(Date.now()),
          nickname,
          text: commentText.trim(),
          createdAt: new Date().toISOString()
        }
      ]
    });
    setCommentText("");
  }

  function markResolved() {
    updateReport({
      ...report,
      status: "resolved",
      resolvedPhotoUri: resolvedPhoto
    });
    setScreen("resolved");
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{readableProblemType(report.problemType)}</Text>
      <Image source={{ uri: report.photoUri }} style={styles.largeImage} />
      <StatusBadge status={report.status} />
      <Text style={styles.text}>{report.description}</Text>
      <Text style={styles.metaText}>
        {report.city} · {report.areaName}
      </Text>
      <Text style={styles.metaText}>
        Location: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
      </Text>
      <Text style={styles.metaText}>
        Created by {report.createdByNickname} · {formatDateTime(report.createdAt)}
      </Text>

      <View style={styles.row}>
        <Pressable style={styles.secondaryButton} onPress={vote}>
          <Text style={styles.secondaryButtonText}>Vote ({report.votes})</Text>
        </Pressable>
        {report.status !== "resolved" ? (
          <Pressable style={styles.primaryButtonSmall} onPress={markResolved}>
            <Text style={styles.primaryButtonText}>Mark resolved</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.primaryButtonSmall} onPress={() => setScreen("resolved")}>
            <Text style={styles.primaryButtonText}>View resolved</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.sectionTitle}>Comments</Text>
      {report.comments.map((comment) => (
        <View key={comment.id} style={styles.comment}>
          <Text style={styles.commentName}>{comment.nickname}</Text>
          <Text style={styles.commentText}>{comment.text}</Text>
          <Text style={styles.metaText}>{formatDateTime(comment.createdAt)}</Text>
        </View>
      ))}
      {report.comments.length === 0 && (
        <Text style={styles.text}>No comments yet. Add the first one.</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Add a short comment"
        value={commentText}
        onChangeText={setCommentText}
      />
      <Pressable style={styles.secondaryButton} onPress={addComment}>
        <Text style={styles.secondaryButtonText}>Add comment</Text>
      </Pressable>
    </View>
  );
}

function ResolvedReportScreen({
  report,
  openReport
}: {
  report: Report;
  openReport: (reportId: string) => void;
}) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Resolved report</Text>
      <StatusBadge status={report.status} />
      <Text style={styles.text}>
        The demo adds a second photo when a problem is marked as resolved.
      </Text>

      <Text style={styles.label}>Original photo</Text>
      <Image source={{ uri: report.photoUri }} style={styles.largeImage} />

      <Text style={styles.label}>Resolved photo</Text>
      <Image
        source={{ uri: report.resolvedPhotoUri ?? resolvedPhoto }}
        style={styles.largeImage}
      />

      <Pressable style={styles.secondaryButton} onPress={() => openReport(report.id)}>
        <Text style={styles.secondaryButtonText}>Back to details</Text>
      </Pressable>
    </View>
  );
}

function SummaryScreen({ reports }: { reports: Report[] }) {
  const summary = useMemo(() => {
    const scheduled = reports.filter((report) => report.status === "scheduled").length;
    const inProgress = reports.filter((report) => report.status === "in_progress").length;
    const resolved = reports.filter((report) => report.status === "resolved").length;
    const mostCommonProblem = mostCommon(
      reports.map((report) => readableProblemType(report.problemType))
    );
    const busiestArea = mostCommon(reports.map((report) => report.areaName));

    return {
      scheduled,
      inProgress,
      resolved,
      mostCommonProblem,
      busiestArea,
      text: `Most reports this week are about ${mostCommonProblem.toLowerCase()}. The highest number of reports is in ${busiestArea}. Some issues are scheduled, some are being worked on, and completed work is marked did it.`
    };
  }, [reports]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>AI-style summary</Text>
      <Text style={styles.text}>
        This uses simple TypeScript counts, not real AI.
      </Text>

      <View style={styles.statRow}>
        <Stat label="Will begin" value={summary.scheduled} />
        <Stat label="Working" value={summary.inProgress} />
        <Stat label="Did it" value={summary.resolved} />
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>{summary.text}</Text>
      </View>

      <Text style={styles.label}>Most common problem</Text>
      <Text style={styles.text}>{summary.mostCommonProblem}</Text>
      <Text style={styles.label}>Area with most reports</Text>
      <Text style={styles.text}>{summary.busiestArea}</Text>
    </View>
  );
}

function ProfileScreen({
  nickname,
  reportCount
}: {
  nickname: string;
  reportCount: number;
}) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.label}>Nickname</Text>
      <Text style={styles.text}>{nickname}</Text>
      <Text style={styles.label}>City</Text>
      <Text style={styles.text}>Palermo</Text>
      <Text style={styles.label}>Demo reports visible</Text>
      <Text style={styles.text}>{reportCount}</Text>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>
          Real names are not used in this prototype. The demo account only stores a nickname.
        </Text>
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const theme = STATUS_MARKER_THEME[status];
  return (
    <View style={[styles.badge, { backgroundColor: theme.inner }]}>
      <Text
        style={[
          styles.badgeText,
          { color: status === "resolved" ? theme.outer : "#765400" }
        ]}
      >
        {theme.label}
      </Text>
    </View>
  );
}

function mostCommon(values: string[]) {
  if (values.length === 0) {
    return "No reports yet";
  }

  const counts = values.reduce<Record<string, number>>((result, value) => {
    result[value] = (result[value] ?? 0) + 1;
    return result;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eef4f2"
  },
  app: {
    flex: 1,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    backgroundColor: "#f8fbfa"
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#0b5d5e",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  appTitle: {
    color: "#ffffff",
    fontFamily: FONT_FAMILIES.title,
    fontSize: 24,
    fontWeight: "800"
  },
  cityLabel: {
    color: "#cbe7e2",
    fontFamily: FONT_FAMILIES.subtitle,
    fontSize: 13,
    marginTop: 3
  },
  content: {
    padding: 18,
    paddingBottom: 96
  },
  screen: {
    gap: 14
  },
  title: {
    fontFamily: FONT_FAMILIES.title,
    fontSize: 28,
    fontWeight: "800",
    color: "#173635"
  },
  sectionTitle: {
    fontFamily: FONT_FAMILIES.subtitle,
    fontSize: 19,
    fontWeight: "800",
    color: "#173635",
    marginTop: 6
  },
  text: {
    fontFamily: FONT_FAMILIES.body,
    color: "#35514f",
    fontSize: 16,
    lineHeight: 23
  },
  label: {
    fontFamily: FONT_FAMILIES.subtitle,
    color: "#173635",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4
  },
  input: {
    fontFamily: FONT_FAMILIES.body,
    borderWidth: 1,
    borderColor: "#c9d9d5",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ web: 12, default: 10 }),
    fontSize: 16,
    color: "#173635"
  },
  descriptionInput: {
    minHeight: 92,
    textAlignVertical: "top"
  },
  primaryButton: {
    backgroundColor: "#0b5d5e",
    borderRadius: 8,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  primaryButtonSmall: {
    backgroundColor: "#0b5d5e",
    borderRadius: 8,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    flex: 1
  },
  primaryButtonText: {
    color: "#ffffff",
    fontFamily: FONT_FAMILIES.body,
    fontWeight: "800",
    fontSize: 16
  },
  disabledButton: {
    backgroundColor: "#8aa5a1"
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#0b5d5e",
    borderRadius: 8,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    flexGrow: 1
  },
  secondaryButtonText: {
    color: "#0b5d5e",
    fontFamily: FONT_FAMILIES.body,
    fontWeight: "800"
  },
  smallButton: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  smallButtonText: {
    color: "#0b5d5e",
    fontFamily: FONT_FAMILIES.body,
    fontWeight: "800"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  mockLogin: {
    width: "47%",
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#c9d9d5",
    alignItems: "center",
    justifyContent: "center"
  },
  mockLoginText: {
    color: "#173635",
    fontFamily: FONT_FAMILIES.body,
    fontWeight: "700"
  },
  statRow: {
    flexDirection: "row",
    gap: 10
  },
  stat: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dce8e5",
    padding: 14
  },
  statValue: {
    color: "#0b5d5e",
    fontFamily: FONT_FAMILIES.title,
    fontSize: 25,
    fontWeight: "900"
  },
  statLabel: {
    color: "#52706c",
    fontFamily: FONT_FAMILIES.body,
    marginTop: 3
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    borderWidth: 1,
    borderColor: "#b8cbc7",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 9
  },
  activeChip: {
    backgroundColor: "#dff1ec",
    borderColor: "#0b5d5e"
  },
  chipText: {
    color: "#35514f",
    fontFamily: FONT_FAMILIES.body,
    fontWeight: "700"
  },
  activeChipText: {
    color: "#0b5d5e"
  },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 8,
    backgroundColor: "#dce8e5"
  },
  largeImage: {
    width: "100%",
    height: 260,
    borderRadius: 8,
    backgroundColor: "#dce8e5"
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dce8e5",
    overflow: "hidden"
  },
  cardImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#dce8e5"
  },
  cardBody: {
    padding: 14,
    gap: 6
  },
  cardTopLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "center"
  },
  cardTitle: {
    color: "#173635",
    fontFamily: FONT_FAMILIES.subtitle,
    fontSize: 18,
    fontWeight: "800",
    flex: 1
  },
  cardText: {
    color: "#35514f",
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    lineHeight: 21
  },
  metaText: {
    color: "#6b817e",
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
    lineHeight: 19
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: "#fff1cf",
    alignSelf: "flex-start"
  },
  badgeText: {
    color: "#765400",
    fontFamily: FONT_FAMILIES.body,
    fontWeight: "800",
    textTransform: "uppercase",
    fontSize: 12
  },
  mapPlaceholder: {
    height: 260,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#b8cbc7",
    backgroundColor: "#dce8e5",
    padding: 16
  },
  mapTitle: {
    color: "#173635",
    fontFamily: FONT_FAMILIES.subtitle,
    fontWeight: "900",
    fontSize: 20
  },
  mapText: {
    color: "#52706c",
    fontFamily: FONT_FAMILIES.body,
    marginTop: 4
  },
  markerRow: {
    position: "relative",
    flex: 1,
    marginTop: 8
  },
  mapMarkerButton: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center"
  },
  statusMarkerWrap: {
    alignItems: "center",
    justifyContent: "center"
  },
  statusMarkerSelected: {
    transform: [{ scale: 1.08 }]
  },
  statusMarkerImage: {
    width: "100%",
    height: "100%"
  },
  statusMarkerCount: {
    position: "absolute",
    color: "#173635",
    fontFamily: FONT_FAMILIES.title,
    fontSize: 11,
    fontWeight: "900"
  },
  comment: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dce8e5",
    padding: 12,
    gap: 4
  },
  commentName: {
    color: "#173635",
    fontFamily: FONT_FAMILIES.subtitle,
    fontWeight: "800"
  },
  commentText: {
    color: "#35514f",
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15
  },
  summaryBox: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dce8e5",
    padding: 16
  },
  summaryText: {
    color: "#173635",
    fontFamily: FONT_FAMILIES.body,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "700"
  },
  successText: {
    color: "#0b6b54",
    fontFamily: FONT_FAMILIES.body,
    fontWeight: "800"
  },
  tabs: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 6,
    padding: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#dce8e5"
  },
  tab: {
    flex: 1,
    minHeight: 46,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  activeTab: {
    backgroundColor: "#dff1ec"
  },
  tabText: {
    color: "#52706c",
    fontFamily: FONT_FAMILIES.body,
    fontWeight: "800",
    fontSize: 13
  },
  activeTabText: {
    color: "#0b5d5e"
  }
});
