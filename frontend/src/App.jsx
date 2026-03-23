import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OrderItem from './pages/OrderItem';
import Checkout from './pages/Checkout';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OrderItem />} /> //Để tạm thời, sau này sẽ đổi thành trang chủ
        <Route path="/checkout" element={<Checkout />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;