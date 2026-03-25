import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OrderItem from './pages/OrderItem';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Account from './pages/Account';
import { setAuthToken } from './api/axiosClient';
function App() {
  // ensure axios default Authorization header is set from localStorage on startup
  const token = localStorage.getItem('token');
  setAuthToken(token);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} /> //Để tạm thời, sau này sẽ đổi thành trang chủ
        <Route path="/checkout" element={<Checkout />} /> 
        <Route path="/order" element={<OrderItem />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;