import React from "react";
import { LogOut } from "lucide-react";
import { SECTIONS } from "../constants/navigation.js";

const Layout = ({ children, section, onNavigate, onSignOut, user, userProfile, userRole, visibleSections }) => {
  const curSection = SECTIONS.find((s) => s.key === section) || SECTIONS[0];

  return (
    <div className="app">
      <div className="topbar">
        <div className="tb-in">
          <div className="brand">
            <span className="logo">SR</span>
            <div>
              <div className="brand-n">Кокпит</div>
              <div className="brand-s">Stas Royce</div>
            </div>
          </div>
          <button className="me" onClick={onSignOut}>
            <span className="me-av">
              {(userProfile?.name || user?.email || "?").slice(0, 1).toUpperCase()}
            </span>
            <div className="me-i">
              <b>{userProfile?.name || user?.email}</b>
              <span>{userRole?.name || "—"}</span>
            </div>
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {children}

      <nav className="bnav">
        <div className="bnav-in">
          {visibleSections.map((s) => (
            <button
              key={s.key}
              className={`bn ${section === s.key ? "on" : ""}`}
              onClick={() => onNavigate(s.key)}
            >
              <s.Icon size={21} strokeWidth={2} />
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <style>{`
        .app {
          background: #F5F6F8;
          min-height: 100vh;
          padding-bottom: 74px;
          -webkit-font-smoothing: antialiased;
        }
        .topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(245,246,248,.88);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #E8EBEF;
        }
        .tb-in {
          max-width: 680px;
          margin: 0 auto;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
        }
        .logo {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #4F46E5;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
        }
        .brand-n {
          font-weight: 700;
          font-size: 15px;
          line-height: 1.1;
        }
        .brand-s {
          font-size: 11px;
          color: #5C6675;
        }
        .me {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 10px 5px 5px;
          border: 1px solid #DCE0E6;
          border-radius: 99px;
          cursor: pointer;
        }
        .me:hover {
          border-color: #4F46E5;
        }
        .me-av {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #EEEEFE;
          color: #4F46E5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 12px;
        }
        .me-i b {
          font-size: 12.5px;
          display: block;
          line-height: 1.1;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .me-i span {
          font-size: 10.5px;
          color: #5C6675;
        }
        .me svg {
          color: #98A1AE;
        }
        .bnav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 30;
          background: rgba(255,255,255,.93);
          backdrop-filter: blur(12px);
          border-top: 1px solid #E8EBEF;
        }
        .bnav-in {
          max-width: 680px;
          margin: 0 auto;
          display: flex;
          padding: 6px 6px calc(6px + env(safe-area-inset-bottom));
        }
        .bn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 7px 2px;
          border-radius: 12px;
          color: #98A1AE;
          font-size: 10.5px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: none;
        }
        .bn.on {
          color: #4F46E5;
        }
      `}</style>
    </div>
  );
};

export default Layout;
