import React from 'react';
import { useLocation } from 'react-router-dom';
import SupportButtons from './SupportButtons';

interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAdminOrSeller = location.pathname.startsWith('/admin') || location.pathname.startsWith('/seller');

  return (
    <>
      {!isAdminOrSeller && <SupportButtons />}
      {children}
    </>
  );
};

export default UserLayout;

