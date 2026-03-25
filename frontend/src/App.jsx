import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OrderItem from './pages/OrderItem';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Account from './pages/Account';
function App() {

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