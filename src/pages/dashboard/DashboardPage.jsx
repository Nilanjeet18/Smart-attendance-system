import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Calendar,
  Clock,
} from "lucide-react";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/common/StatCard";
import { getAllStudents } from "../../api/studentApi";
import { getAllCourses, getCoursesByTeacher } from "../../api/courseApi";
import {
  getSessionsByDate,
  getMySessionsByDate,
} from "../../api/attendanceApi";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";
import { getAllTeachers } from "../../api/teacherApi";

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    sessions: 0,
    teachers: 0,
  });

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    setLoading(true);

    if (isAdmin) {
      Promise.all([
        getAllStudents(),
        getAllCourses(),
        getSessionsByDate(today),
        getAllTeachers(),
      ])
        .then(([s, c, ses, t]) => {
          const teachers = t.data.filter(
            (teacher) => teacher.role === "TEACHER",
          );

          setStats({
            students: s.data.length,
            courses: c.data.length,
            sessions: ses.data.length,
            teachers: teachers.length,
          });

          setSessions(ses.data);
        })
        .finally(() => setLoading(false));

    } else {
      Promise.all([
        getAllStudents(),
        getAllCourses(),
        getMySessionsByDate(today),
      ])
        .then(([s, c, ses]) => {
          const myCourses = c.data.filter(
            (course) => course.teacher?.id === user.id,
          );

          let myStudents = 0;

          myCourses.forEach((course) => {
            myStudents += course.students?.length || 0;
          });

          setStats({
            students: myStudents,
            courses: myCourses.length,
            sessions: ses.data.length,
            teachers: 0,
          });

          setSessions(ses.data);
        })
        .finally(() => setLoading(false));
    }
  }, [isAdmin, user, today]);

  if (loading) return <Loader />;

  const statusColor = {
    ACTIVE: "badge-green",
    CLOSED: "badge-blue",
    CANCELLED: "badge-red",
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#0d1b2a] to-[#1565c0] rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">
          Good {getGreeting()}, {user?.name?.split(" ")[0]}! 👋
        </h2>

        <p className="text-blue-200 mt-1">
          {format(new Date(), "EEEE, MMMM do yyyy")}
        </p>
      </div>

      {/* Stats */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          isAdmin ? "lg:grid-cols-3" : "lg:grid-cols-4"
        } gap-4`}
      >
        {isAdmin ? (
          <>
            <StatCard
              icon={Users}
              label="Total Students"
              value={stats.students}
              color="blue"
            />

            <StatCard
              icon={BookOpen}
              label="Total Courses"
              value={stats.courses}
              color="purple"
            />

            <StatCard
              icon={Users}
              label="Total Teachers"
              value={stats.teachers}
              color="orange"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={BookOpen}
              label="My Courses"
              value={stats.courses}
              color="purple"
            />

            <StatCard
              icon={ClipboardCheck}
              label="Today's Sessions"
              value={stats.sessions}
              color="green"
            />

            <StatCard
              icon={Users}
              label="My Students"
              value={stats.students}
              color="blue"
            />
          </>
        )}
      </div>

      {/* Today's Sessions - Teacher Only */}
      {!isAdmin && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              Today's Sessions
            </h2>

            <span className="text-sm text-gray-400">{today}</span>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Clock size={32} className="mx-auto mb-2 opacity-40" />

              <p className="text-sm">
                No sessions today. Start one from Attendance page.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="text-left py-2 px-3">Course</th>
                    <th className="text-left py-2 px-3">Topic</th>
                    <th className="text-left py-2 px-3">Mode</th>
                    <th className="text-left py-2 px-3">Status</th>
                    <th className="text-right py-2 px-3">Present / Total</th>
                  </tr>
                </thead>

                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium">{s.courseCode}</td>

                      <td className="py-3 px-3 text-gray-500">
                        {s.topic || "—"}
                      </td>

                      <td className="py-3 px-3">
                        <span className="badge-blue">{s.attendanceMode}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={statusColor[s.status] || "badge-blue"}>
                          {s.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-semibold">
                        {s.presentCount} / {s.totalStudents}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();

  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";

  return "Evening";
}
