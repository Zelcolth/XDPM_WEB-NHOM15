import { useState, useEffect } from 'react';
import './App.css'; // Gọi file CSS vào đây!

function App() {
  const [users, setUsers] = useState([]); 
  const [newName, setNewName] = useState(''); 
  const [editingId, setEditingId] = useState(null); 
  const [editName, setEditName] = useState(''); 

  // URL Backend
  const apiUrl = 'https://xdpm-web-nhom15.onrender.com/users';

  const fetchUsers = async () => {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Lỗi dữ liệu:", error);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return alert("Vui lòng nhập tên!");
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    });
    setNewName('');
    fetchUsers();
  };

  const handleUpdate = async () => {
    await fetch(`${apiUrl}/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName })
    });
    setEditingId(null);
    setEditName('');
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa người dùng này?")) return;
    await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  return (
    <div className="app-container">
      <h1 className="page-title">Quản lý Người dùng</h1>
      
      <div className="header-actions">
        <a href="https://xdpm-web-nhom15.onrender.com/api/documentation" target="_blank" rel="noopener noreferrer" className="btn-swagger">
          🚀 Xem API trên Swagger
        </a>
      </div>

      <section className="form-card">
        <h2 className="form-title">Thêm Người dùng mới</h2>
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Nhập tên người dùng mới..." 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)}
            className="input-modern"
          />
          <button onClick={handleAdd} className="btn-add">Thêm Mới</button>
        </div>
      </section>

      <section className="table-card">
        <table className="user-table">
          <thead>
            <tr>
              <th className="th-id">ID</th>
              <th>Tên User</th>
              <th className="th-actions">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="td-center">{user.id}</td>
                <td>
                  {editingId === user.id ? (
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      className="input-edit"
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  <div className="action-btn-group">
                    {editingId === user.id ? (
                      <>
                        <button onClick={handleUpdate} className="btn-save">Lưu</button>
                        <button onClick={() => setEditingId(null)} className="btn-cancel">Hủy</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditingId(user.id); setEditName(user.name); }} className="btn-edit">Sửa</button>
                        <button onClick={() => handleDelete(user.id)} className="btn-delete">Xóa</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;