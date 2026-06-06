import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User, MessagesSquare } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'threads', label: 'Threads', icon: MessagesSquare, path: '/threads' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 lg:hidden safe-area-pb"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16 max-w-xl mx-auto px-2">
        {navItems.map(({ id, label, icon: Icon, path }) => {
          const isActive =
            path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <button
              key={id}
              id={`bottom-nav-${id}`}
              onClick={() => navigate(path)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'flex flex-col items-center gap-0.5 flex-1 py-1 cursor-pointer',
                'transition-colors duration-150',
                isActive ? 'text-[#118451]' : 'text-gray-400 hover:text-gray-600',
              ].join(' ')}
            >
              <span className={[
                'flex items-center justify-center w-8 h-8 rounded-[2rem] transition-all duration-150',
                isActive ? 'bg-[#e8f5f0]' : '',
              ].join(' ')}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
              </span>
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
