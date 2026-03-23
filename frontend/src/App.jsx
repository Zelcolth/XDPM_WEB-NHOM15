import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OrderItem from './pages/OrderItem';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OrderItem />} /> //Để tạm thời, sau này sẽ đổi thành trang chủ
        <Route path="/checkout" element={<Checkout />} /> 
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;