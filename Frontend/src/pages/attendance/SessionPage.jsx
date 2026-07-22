import { useEffect, useState } from "react";
import {
  Play,
  StopCircle,
  Users,
  ClipboardCheck,
  Camera,
  RefreshCw,
} from "lucide-react";
import { getAllCourses, getCoursesByTeacher } from "../../api/courseApi";
import {
  startSession,
  closeSession,
  getSessionRecords,
  getActiveSession,
} from "../../api/attendanceApi";
import Loader from "../../components/common/Loader";
import QRDisplay from "../../components/qr/QRDisplay";
import { useNotifications } from "../../context/NotificationContext";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function SessionPage() {
  const { addNotification } = useNotifications();

  const [courses, setCourses] = useState([]);
  const [selCourse, setSelCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [room, setRoom] = useState("");
  const [mode, setMode] = useState("QR_CODE");
  const [session, setSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, isAdmin } = useAuth();

  const loadCourses = async () => {
    try {
      setLoading(true);

      let res;

      if (isAdmin) {
        res = await getAllCourses();
      } else {
        res = await getCoursesByTeacher(user.id);
      }

      setCourses(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();

    getActiveSession()
      .then((res) => {
        if (res.status === 200) {
          setSession(res.data);

          pollRecords(res.data.id);
        }
      })
      .catch(() => {});
  }, [user, isAdmin]);

  const pollRecords = (sid) => {
    getSessionRecords(sid).then((r) => setRecords(r.data));
  };

  const handleStart = async () => {
    if (!selCourse) return toast.error("Select a course");
    if (!topic) return toast.error("Enter topic");
    try {
      setLoading(true);
      const res = await startSession(selCourse, topic, room, mode);
      setSession(res.data);
      pollRecords(res.data.id);
      toast.success("Session started!");

      // Notification — session started
      addNotification(
        "success",
        `Session Started — ${res.data.courseCode}`,
        `Topic: ${topic} · Mode: ${mode.replace("_", " ")} · ${res.data.totalStudents} students enrolled`,
        "/attendance",
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to start session");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    try {
      const res = await closeSession(session.id);
      toast.success("Session closed! Absent students auto-marked.");

      // Notification — session closed with stats
      addNotification(
        "info",
        `Session Closed — ${session.courseCode}`,
        `Present: ${res.data.presentCount}/${res.data.totalStudents} · ${res.data.attendancePercentage}% attendance`,
        "/reports",
      );

      setSession(null);
      setRecords([]);
    } catch {
      toast.error("Failed to close session");
    }
  };

  const handleQRRefresh = (newQrData) => {
    setSession((prev) => ({
      ...prev,
      qrToken: newQrData.qrToken,
      qrImageBase64: newQrData.qrImageBase64,
      qrExpiresInSeconds: newQrData.qrExpiresInSeconds,
    }));
    // Notification — QR refreshed
    addNotification(
      "info",
      "QR Code Refreshed",
      `New QR generated for ${session?.courseCode} — valid for 10 minutes`,
      "/attendance",
    );
  };

  const handleQRExpiring = () => {
    addNotification(
      "warning",
      "QR Code Expiring Soon!",
      `QR code for ${session?.courseCode} expires in 2 minutes. Refresh if needed.`,
      "/attendance",
    );
  };

  return (
    <div className="space-y-6">
      {!session ? (
        <div className="max-w-lg mx-auto">
          <div className="card space-y-5">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ClipboardCheck size={20} className="text-blue-600" /> Start
              Attendance Session
            </h2>

            <div>
              <label className="block text-sm font-medium mb-1">Course *</label>
              <select
                className="input"
                value={selCourse}
                onChange={(e) => setSelCourse(e.target.value)}
              >
                <option value="">-- Select Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.courseCode} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Topic *</label>
              <input
                className="input"
                placeholder="e.g. Linked Lists"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Class Room
              </label>
              <input
                className="input"
                placeholder="e.g. Lab-3"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Attendance Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["QR_CODE", "FACE_DETECTION", "HYBRID"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all
                      ${
                        mode === m
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 text-gray-600 hover:border-blue-400"
                      }`}
                  >
                    {m.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
            >
              {loading ? (
                "Starting..."
              ) : (
                <>
                  <Play size={16} /> Start Session
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{session.courseCode}</h3>
                <p className="text-gray-500 text-sm">{session.topic}</p>
              </div>
              <span className="badge-green px-3 py-1 text-sm">● ACTIVE</span>
            </div>

            {(session.attendanceMode === "QR_CODE" ||
              session.attendanceMode === "HYBRID") && (
              <QRDisplay
                sessionId={session.id}
                qrToken={session.qrToken}
                qrImageBase64={session.qrImageBase64}
                expiresInSeconds={session.qrExpiresInSeconds}
                onRefresh={handleQRRefresh}
                onExpiring={handleQRExpiring}
              />
            )}

            {(session.attendanceMode === "FACE_DETECTION" ||
              session.attendanceMode === "HYBRID") && (
              <div className="py-4 text-center border-t border-gray-100">
                <Camera size={36} className="mx-auto text-blue-400 mb-2" />
                <p className="text-gray-600 font-medium text-sm">
                  Face Detection Active
                </p>
                <a
                  href={`/face-scan?sessionId=${session.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary mt-3 inline-flex items-center gap-2 text-sm"
                >
                  <Camera size={14} /> Open Face Scan Page
                </a>
              </div>
            )}

            <button
              onClick={handleClose}
              className="btn-danger flex items-center gap-2 mx-auto"
            >
              <StopCircle size={16} /> Close Session
            </button>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users size={17} className="text-blue-600" /> Live Attendance
              </h3>
              <div className="text-sm">
                <span className="font-bold text-green-600">
                  {
                    records.filter(
                      (r) => r.status === "PRESENT" || r.status === "LATE",
                    ).length
                  }
                </span>
                <span className="text-gray-400">
                  {" "}
                  / {session.totalStudents} present
                </span>
              </div>
            </div>

            {records.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">
                Waiting for students to scan...
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {records.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium">{r.studentName}</p>
                      <p className="text-xs text-gray-400">{r.rollNumber}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={
                          r.status === "PRESENT"
                            ? "badge-green"
                            : r.status === "LATE"
                              ? "badge-orange"
                              : "badge-red"
                        }
                      >
                        {r.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {r.markedVia?.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => pollRecords(session.id)}
              className="btn-outline w-full mt-3 text-sm flex items-center justify-center gap-1"
            >
              <RefreshCw size={13} /> Refresh Records
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
