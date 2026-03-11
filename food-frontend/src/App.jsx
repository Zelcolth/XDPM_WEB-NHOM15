import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

function UsersList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Gọi API từ Backend Laravel (nhớ đảm bảo Laravel đang chạy ở một terminal khác nhé)
    axios.get('http://127.0.0.1:8000/users')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error("Lỗi khi gọi API:", error);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Danh sách Người dùng (Frontend)</h1>
      <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '300px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>ID</th>
            <th>Tên Người Dùng</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ textAlign: 'center' }}>
              <td>{user.id}</td>
              <td>{user.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn BASE_FE/users mà thầy yêu cầu */}
        <Route path="/users" element={<UsersList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;