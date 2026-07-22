import { useEffect, useState } from "react";

const EMPTY = {
  name: "",
  email: "",
  password: "",
  employeeId: "",
  department: "",
  phoneNumber: "",
  role: "TEACHER",
};

export default function TeacherForm({ editing, onSave }) {

  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (editing) {
      setForm({
        ...editing,
        password: "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [editing]);

  const update = (key) => (e) =>
    setForm({
      ...form,
      [key]: e.target.value,
    });

  const submit = (e) => {
    e.preventDefault();
    onSave(form);
    setForm(EMPTY);
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-xl shadow p-5 mb-5 grid grid-cols-2 gap-4"
    >

      <input
        placeholder="Name"
        value={form.name}
        onChange={update("name")}
        className="input"
      />

      <input
        placeholder="Email"
        value={form.email}
        onChange={update("email")}
        className="input"
      />

      <input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={update("password")}
        className="input"
      />

      <input
        placeholder="Employee ID"
        value={form.employeeId}
        onChange={update("employeeId")}
        className="input"
      />

      <input
        placeholder="Department"
        value={form.department}
        onChange={update("department")}
        className="input"
      />

      <input
        placeholder="Phone Number"
        value={form.phoneNumber}
        onChange={update("phoneNumber")}
        className="input"
      />

      <select
        value={form.role}
        onChange={update("role")}
        className="input"
      >
        <option value="TEACHER">Teacher</option>
      </select>

      <button className="btn-primary">
        {editing ? "Update Teacher" : "Add Teacher"}
      </button>

    </form>
  );
}