import { useNavigate } from 'react-router-dom';

export default function MainFooter({ onScrollTop, onScrollAbout, onScrollMenu }) {
  const navigate = useNavigate();

  const handleHome = () => {
    if (typeof onScrollTop === 'function') {
      onScrollTop();
      return;
    }
    navigate('/');
  };

  const handleAbout = () => {
    if (typeof onScrollAbout === 'function') {
      onScrollAbout();
      return;
    }
    navigate('/#home-about');
  };

  const handleMenu = () => {
    if (typeof onScrollMenu === 'function') {
      onScrollMenu();
      return;
    }
    navigate('/#home-menu');
  };

  return (
    <footer className="bg-[#111827] mt-12 py-12 px-4 md:px-10 text-slate-200">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <h3 className="text-xl font-bold text-white mb-4">VèoFood</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Tinh hoa ẩm thực Việt Nam với nguyên liệu tươi ngon và trải nghiệm đặt món tiện lợi.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-white">LIÊN KẾT</h4>
          <ul className="text-sm text-slate-300 space-y-2">
            <li><button onClick={handleHome} className="hover:text-orange-300">Trang Chủ</button></li>
            <li><button onClick={handleAbout} className="hover:text-orange-300">Giới Thiệu</button></li>
            <li><button onClick={handleMenu} className="hover:text-orange-300">Thực Đơn</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-white">LIÊN HỆ</h4>
          <ul className="text-sm text-slate-300 space-y-2">
            <li>67 Trần Thị Nơi, P.4, Q.8, TP.HCM</li>
            <li>024 1234 5678</li>
            <li>info@veofood.com</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-white">GIỜ MỞ CỬA</h4>
          <p className="text-sm text-slate-300">Thứ 2 - Chủ Nhật</p>
          <p className="text-lg font-semibold text-orange-300">10:00 - 22:00</p>
        </div>
      </div>
    </footer>
  );
}