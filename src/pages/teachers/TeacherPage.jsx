import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  getAllTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
} from "../../api/teacherApi";

import TeacherForm from "./TeacherForm";
import TeacherTable from "./TeacherTable";

export default function TeacherPage() {

  const [teachers, setTeachers] = useState([]);
  const [editing, setEditing] = useState(null);

  const loadTeachers = async () => {
    try {
      const res = await getAllTeachers();
      setTeachers(res.data);
    } catch (err) {
      toast.error("Unable to load teachers");
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const saveTeacher = async (teacher) => {
    try {

      if (editing) {
        await updateTeacher(editing.id, teacher);
        toast.success("Teacher Updated");
      } else {
        await addTeacher(teacher);
        toast.success("Teacher Added");
      }

      setEditing(null);
      loadTeachers();

    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation Failed");
    }
  };

  const editTeacher = (teacher) => {
    setEditing(teacher);
  };

  const removeTeacher = async (id) => {

    if (!window.confirm("Delete Teacher ?")) return;

    try {
      await deleteTeacher(id);
      toast.success("Teacher Deleted");
      loadTeachers();
    } catch {
      toast.error("Delete Failed");
    }

  };

  return (
    <div className="p-6">

      <TeacherForm
        editing={editing}
        onSave={saveTeacher}
      />

      <TeacherTable
        teachers={teachers}
        onEdit={editTeacher}
        onDelete={removeTeacher}
      />

    </div>
  );

}