export default function TeacherTable({

  teachers,
  onEdit,
  onDelete,

}) {

  return (

    <div className="bg-white rounded-xl shadow">

      <table className="w-full">

        <thead>

          <tr className="bg-gray-100">

            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Employee ID</th>
            <th>Department</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {teachers.map((teacher) => (

            <tr
              key={teacher.id}
              className="text-center border-b"
            >

              <td>{teacher.id}</td>
              <td>{teacher.name}</td>
              <td>{teacher.email}</td>
              <td>{teacher.employeeId}</td>
              <td>{teacher.department}</td>
              <td>{teacher.phoneNumber}</td>
              <td>{teacher.role}</td>

              <td>
                {teacher.isActive ? "Active" : "Inactive"}
              </td>

              <td>

                <button
                  onClick={() => onEdit(teacher)}
                  className="text-blue-600 mr-3"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(teacher.id)}
                  className="text-red-600"
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}