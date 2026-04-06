import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OrderItem from './pages/OrderItem';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Account from './pages/Account';
import RequireAdmin from './admin/RequireAdmin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminCategories from './admin/pages/AdminCategories';
import AdminProducts from './admin/pages/AdminProducts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/order" element={<OrderItem />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/account" element={<Account />} />

        <Route path="/admin" element={<RequireAdmin />}>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<AdminProducts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;