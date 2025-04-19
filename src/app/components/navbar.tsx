"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div>
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <a
            className="btn btn-ghost text-xl cursor-pointer"
            onClick={() => handleNavigation('/')}
          >
            daisyUI
          </a>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            <li onClick={() => handleNavigation('/home')} className="cursor-pointer">
              <a>Analysis</a>
            </li>
            <li onClick={() => handleNavigation('/home/trading')} className="cursor-pointer">
              <a>Trading</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;