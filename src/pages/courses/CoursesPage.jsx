import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, BookOpen, Users, Eye, Trash2 } from "lucide-react";
import {
  getAllCourses,
  getCoursesByTeacher,
  createCourse,
  deleteCourse,
  enrollStudent,
} from "../../api/courseApi";
import { getAllTeachers } from "../../api/teacherApi";
import { getAllStudents } from "../../api/studentApi";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const EMPTY = {
  name: "",
  courseCode: "",
  description: "",
  department: "",
  semester: "",
};

export default function CoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(null);
  const [delId, setDelId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [selStudent, setSelStudent] = useState("");

  const load = () => {
    setLoading(true);

    if (user?.role === "ADMIN") {
      Promise.all([getAllCourses(), getAllStudents(), getAllTeachers()])
        .then(([c, s, t]) => {
          setCourses(c.data);
          setStudents(s.data);
          setTeachers(t.data);
        })
        .finally(() => setLoading(false));
    } else {
      Promise.all([getCoursesByTeacher(user.id), getAllStudents()])
        .then(([c, s]) => {
          setCourses(c.data);
          setStudents(s.data);

          // Teacher ला Teacher List ची गरज नाही
          setTeachers([]);
        })
        .finally(() => setLoading(false));
    }
  };


  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.courseCode)
      return toast.error("Name and course code required");
    try {
      setSaving(true);
      if (!selectedTeacher) {
        return toast.error("Please select a teacher");
      }

      await createCourse(
        {
          ...form,
          semester: Number(form.semester),
        },
        selectedTeacher,
      );
      toast.success("Course created!");
      setAddOpen(false);
      setForm(EMPTY);
      setSelectedTeacher("");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEnroll = async () => {
    if (!selStudent) return toast.error("Select a student");
    try {
      await enrollStudent(enrollOpen, selStudent);
      toast.success("Student enrolled!");
      setEnrollOpen(null);
      setSelStudent("");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Enrollment failed");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Courses</h2>
          <p className="text-gray-500 text-sm">{courses.length} courses</p>
        </div>
        {user?.role === "ADMIN" && (
          <button
            onClick={() => setAddOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            New Course
          </button>
        )}
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Courses"
          message="Create your first course."
          action={
            user?.role === "ADMIN" ? (
              <button onClick={() => setAddOpen(true)} className="btn-primary">
                Create Course
              </button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((c) => (
            <div key={c.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-blue-50 p-2.5 rounded-lg">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                <span className="badge-blue text-xs">{c.courseCode}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{c.name}</h3>

              <p className="text-sm text-blue-600 mb-1">
                {" "}
                👨‍🏫 {c.teacher?.name || "Teacher Not Assigned"}
              </p>

              <p className="text-gray-400 text-xs mb-3">
                {" "}
                {c.department} · Sem {c.semester}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Users size={13} /> {c.students?.length || 0} students
                &nbsp;·&nbsp; {c.totalClasses} classes held
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/courses/${c.id}`)}
                  className="btn-outline flex items-center gap-1 text-xs flex-1"
                >
                  <Eye size={13} /> View
                </button>
                {user?.role === "ADMIN" && (
                  <button
                    onClick={() => setEnrollOpen(c.id)}
                    className="btn-primary flex items-center gap-1 text-xs flex-1"
                  >
                    <Users size={13} />
                    Enroll
                  </button>
                )}
                {user?.role === "ADMIN" && (
                  <button
                    onClick={() => setDelId(c.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Course Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Create New Course"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Course Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Course Name *
              </label>
              <input
                className="input"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>

            {/* Course Code */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Course Code *
              </label>
              <input
                className="input"
                value={form.courseCode}
                onChange={(e) =>
                  setForm((p) => ({ ...p, courseCode: e.target.value }))
                }
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Department
              </label>
              <input
                className="input"
                value={form.department}
                onChange={(e) =>
                  setForm((p) => ({ ...p, department: e.target.value }))
                }
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium mb-1">Semester</label>
              <input
                className="input"
                type="number"
                min="1"
                max="8"
                value={form.semester}
                onChange={(e) =>
                  setForm((p) => ({ ...p, semester: e.target.value }))
                }
              />
            </div>

            {/* Assign Teacher */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Assign Teacher *
              </label>

              <select
                className="input"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="">-- Select Teacher --</option>

                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.employeeId})
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                className="input h-20 resize-none"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="btn-outline"
            >
              Cancel
            </button>

            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Enroll Modal */}
      <Modal
        open={!!enrollOpen}
        onClose={() => setEnrollOpen(null)}
        title="Enroll Student"
        size="sm"
      >
        <div className="space-y-4">
          <select
            className="input"
            value={selStudent}
            onChange={(e) => setSelStudent(e.target.value)}
          >
            <option value="">-- Select Student --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.rollNumber} — {s.name}
              </option>
            ))}
          </select>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setEnrollOpen(null)} className="btn-outline">
              Cancel
            </button>
            <button onClick={handleEnroll} className="btn-primary">
              Enroll
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!delId}
        title="Delete Course"
        danger
        message="This will deactivate the course permanently."
        onConfirm={async () => {
          await deleteCourse(delId);
          toast.success("Deleted");
          setDelId(null);
          load();
        }}
        onCancel={() => setDelId(null)}
      />
    </div>
  );
}
