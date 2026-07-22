import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Download,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import {
    getAllCourses,
    getCoursesByTeacher
} from "../../api/courseApi";
import {
  getCourseReport,
  downloadExcel,
  downloadPDF,
} from "../../api/reportApi";
import Loader from "../../components/common/Loader";
import { format, subMonths } from "date-fns";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function ReportsPage() {
  const [courses, setCourses] = useState([]);
  const [selCourse, setSelCourse] = useState("");
  const [startDate, setStartDate] = useState(
    format(subMonths(new Date(), 1), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dlBusy, setDlBusy] = useState("");

  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      getAllCourses().then((r) => setCourses(r.data));
    } else {
      getCoursesByTeacher(user.id).then((r) => setCourses(r.data));
    }
  }, [user, isAdmin]);

  const handleGenerate = async () => {
    if (!selCourse) return toast.error("Select a course");
    try {
      setLoading(true);
      const res = await getCourseReport(selCourse, startDate, endDate);
      setReport(res.data);
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type) => {
    try {
      setDlBusy(type);
      if (type === "excel") await downloadExcel(selCourse, startDate, endDate);
      else await downloadPDF(selCourse, startDate, endDate);
      toast.success(`${type.toUpperCase()} downloaded!`);
    } catch {
      toast.error("Download failed");
    } finally {
      setDlBusy("");
    }
  };

  const chartData =
    report?.studentSummaries?.map((s) => ({
      name: s.rollNumber,
      pct: s.attendancePercentage,
      risk: s.isAtRisk,
    })) || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-600" /> Generate Attendance
          Report
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Course</label>
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
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              className="input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              className="input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4 flex-wrap">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              "Generating..."
            ) : (
              <>
                <BarChart3 size={15} /> Generate Report
              </>
            )}
          </button>
          {report && (
            <>
              <button
                onClick={() => handleDownload("excel")}
                disabled={!!dlBusy}
                className="btn-outline flex items-center gap-2"
              >
                {dlBusy === "excel" ? (
                  "..."
                ) : (
                  <>
                    <FileSpreadsheet size={15} className="text-green-600" />{" "}
                    Excel
                  </>
                )}
              </button>
              <button
                onClick={() => handleDownload("pdf")}
                disabled={!!dlBusy}
                className="btn-outline flex items-center gap-2"
              >
                {dlBusy === "pdf" ? (
                  "..."
                ) : (
                  <>
                    <FileText size={15} className="text-red-600" /> PDF
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {loading && <Loader />}

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Course", val: report.courseCode },
              { label: "Sessions", val: report.totalSessions },
              { label: "Students", val: report.totalStudents },
              { label: "Avg Attendance", val: `${report.averageAttendance}%` },
            ].map(({ label, val }) => (
              <div key={label} className="card text-center">
                <p className="text-gray-500 text-xs">{label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{val}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-4">Student Attendance Chart</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ left: -20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(v) => [`${v}%`, "Attendance"]} />
                  <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.risk ? "#ef4444" : "#1565c0"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-center text-gray-400 mt-1">
                <span className="inline-block w-3 h-3 bg-blue-700 rounded-sm mr-1" />
                Safe &nbsp;&nbsp;
                <span className="inline-block w-3 h-3 bg-red-500 rounded-sm mr-1" />
                At Risk (&lt;{report.minimumRequiredPercentage}%)
              </p>
            </div>
          )}

          {/* At Risk Alert */}
          {report.studentsAtRisk?.length > 0 && (
            <div className="card border-l-4 border-orange-500 bg-orange-50">
              <h3 className="font-semibold flex items-center gap-2 text-orange-700 mb-3">
                <AlertTriangle size={17} /> Students at Risk (
                {report.studentsAtRisk.length})
              </h3>
              <div className="space-y-2">
                {report.studentsAtRisk.map((s) => (
                  <div
                    key={s.studentId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium">
                      {s.studentName}{" "}
                      <span className="text-gray-400">({s.rollNumber})</span>
                    </span>
                    <span className="text-red-600 font-bold">
                      {s.attendancePercentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Table */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h3 className="font-semibold">Student-wise Attendance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Roll No.",
                      "Name",
                      "Present",
                      "Total",
                      "Percentage",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-4 text-gray-500 font-medium"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.studentSummaries?.map((s) => (
                    <tr
                      key={s.studentId}
                      className={`border-b ${s.isAtRisk ? "bg-red-50" : "hover:bg-gray-50"}`}
                    >
                      <td className="py-3 px-4 font-mono text-blue-700">
                        {s.rollNumber}
                      </td>
                      <td className="py-3 px-4 font-medium">{s.studentName}</td>
                      <td className="py-3 px-4 text-center">
                        {s.classesAttended}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {s.totalClasses}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${s.isAtRisk ? "bg-red-500" : "bg-blue-600"}`}
                              style={{ width: `${s.attendancePercentage}%` }}
                            />
                          </div>
                          <span className="font-semibold w-12 text-right">
                            {s.attendancePercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {s.isAtRisk ? (
                          <span className="badge-red">⚠ At Risk</span>
                        ) : (
                          <span className="badge-green">✓ Safe</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
