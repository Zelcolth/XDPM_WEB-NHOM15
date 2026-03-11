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
      <h1>Quản lý Người dùng (CRUD)</h1>
      
      {/* NÚT BẤM DẪN SANG SWAGGER ĐỂ THẦY CHẤM ĐIỂM */}
      <div style={{ marginBottom: '20px' }}>
        <a 
          href="https://xdpm-web-nhom15.onrender.com/users" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            display: 'inline-block', 
            padding: '10px 15px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px',
            fontWeight: 'bold'
          }}
        >
          Kiểm tra CRUD trên Swagger
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn BASE_FE/users */}
        <Route path="/" element={<UsersList />} />
        <Route path="/users" element={<UsersList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;