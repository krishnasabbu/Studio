import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/themeSlice';
import { Moon, Sun, LogOut, User } from 'lucide-react';
import Button from '../ui/Button';

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { isDarkMode } = useAppSelector(state => state.theme);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-primary-700 dark:text-white">
            Notification Templates
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-primary-600" />
            )}
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-primary-50 dark:bg-gray-700 rounded-lg px-3 py-2">
              <User className="h-5 w-5 text-primary-600 dark:text-gray-400" />
              <div className="text-sm">
                <div className="text-primary-700 dark:text-gray-300 font-medium">
                  {user?.username}
                </div>
                <div className="text-xs text-primary-500 dark:text-gray-400">
                  {user?.role}
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2 border-primary-300 text-primary-600 hover:bg-primary-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;