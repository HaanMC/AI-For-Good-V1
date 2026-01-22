import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Bảng điều khiển', to: '/' },
  { label: 'Trợ lý', to: '/chat' },
  { label: 'Nhập vai', to: '/roleplay' },
  { label: 'Luyện thi', to: '/exam' },
  { label: 'Viết', to: '/writing' },
  { label: 'Từ điển', to: '/dictionary' },
  { label: 'Flashcards', to: '/flashcards' },
  { label: 'Mindmap', to: '/mindmap' },
  { label: 'Kế hoạch học', to: '/study-plan' },
  { label: 'Cài đặt', to: '/settings' },
];

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 rounded-full text-sm font-medium transition ${
    isActive ? 'bg-accent text-white shadow' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
  }`;

const TopNav: React.FC = () => {
  return (
    <nav className="w-full border-b border-stone-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClassName} end={item.to === '/'}>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default TopNav;
