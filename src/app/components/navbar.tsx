"use client";

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const ticker = searchParams.get("ticker");
  const company = searchParams.get("company");
  const style = searchParams.get("style");

  const handleNavigation = (path: string) => {
    if (path === "/home/trading" && ticker && company && style) {
      console.log("🛰️ Navigating to trading with params:", {
        ticker,
        company,
        style,
      });
  
      router.push(`${path}?ticker=${ticker}&company=${company}&style=${style}`);
    } else {
      router.push(path);
    }
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
            <li
              onClick={() => handleNavigation('/home/trading')}
              className={`cursor-pointer ${!ticker ? "tooltip tooltip-bottom" : ""}`}
              data-tip={!ticker ? "Load a company first" : ""}
            >
              <a>Trading</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;