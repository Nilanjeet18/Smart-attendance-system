import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Camera, UserCheck, Trash2, Eye } from 'lucide-react'
import { getAllStudents, createStudent, deleteStudent } from '../../api/studentApi'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import Modal from '../../components/common/Modal'
import ConfirmModal from '../../components/common/ConfirmModal'
import FaceRegister from '../../components/face/FaceRegister'
import toast from 'react-hot-toast'

const EMPTY = { name: '', rollNumber: '', email: '', phoneNumber: '', department: '', semester: '' }

export default function StudentsPage() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [addOpen,  setAddOpen]  = useState(false)
  const [delId,    setDelId]    = useState(null)
  const [faceStudent, setFaceStudent] = useState(null) // { id, name }
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)

  const load = () => {
    setLoading(true)
    getAllStudents().then(r => { setStudents(r.data); setFiltered(r.data) })
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      (s.department || '').toLowerCase().includes(q)
    ))
  }, [search, students])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.name || !form.rollNumber || !form.email) return toast.error('Fill required fields')
    try {
      setSaving(true)
      await createStudent({ ...form, semester: Number(form.semester) })
      toast.success('Student added!'); setAddOpen(false); setForm(EMPTY); load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add student')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    await deleteStudent(delId); toast.success('Student removed'); setDelId(null); load()
  }

  if (loading) return <Loader />

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Students</h2>
          <p className="text-gray-500 text-sm">{students.length} total students</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Student
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input pl-9" placeholder="      Search by name, roll number, department..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={UserCheck} title="No Students Found"
          message="Add your first student to get started."
          action={<button onClick={() => setAddOpen(true)} className="btn-primary">Add Student</button>} />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Roll No.', 'Name', 'Email', 'Dept', 'Sem', 'Face', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-blue-700">{s.rollNumber}</td>
                    <td className="py-3 px-4 font-medium">{s.name}</td>
                    <td className="py-3 px-4 text-gray-500">{s.email}</td>
                    <td className="py-3 px-4 text-gray-500">{s.department || '—'}</td>
                    <td className="py-3 px-4 text-center">{s.semester || '—'}</td>
                    <td className="py-3 px-4">
                      {s.hasFaceEncoding
                        ? <span className="badge-green">✓ Registered</span>
                        : <span className="badge-orange">Not set</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/students/${s.id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => setFaceStudent({ id: s.id, name: s.name })}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Register Face">
                          <Camera size={15} />
                        </button>
                        <button onClick={() => setDelId(s.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Student">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Full Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium mb-1">Roll Number *</label>
              <input className="input" value={form.rollNumber} onChange={e => setForm(p => ({ ...p, rollNumber: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium mb-1">Email *</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium mb-1">Phone</label>
              <input className="input" value={form.phoneNumber} onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium mb-1">Department</label>
              <input className="input" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium mb-1">Semester</label>
              <input className="input" type="number" min="1" max="8" value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setAddOpen(false)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Add Student'}</button>
          </div>
        </form>
      </Modal>

      {/* Face Register Modal — uses dedicated FaceRegister component */}
      <FaceRegister
        open={!!faceStudent}
        studentId={faceStudent?.id}
        studentName={faceStudent?.name}
        onClose={() => setFaceStudent(null)}
        onSuccess={load}
      />

      <ConfirmModal open={!!delId} title="Remove Student" danger
        message="This will deactivate the student. Are you sure?"
        onConfirm={handleDelete} onCancel={() => setDelId(null)} />
    </div>
  )
}
