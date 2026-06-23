import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { validateEmail, validatePassword, getValidationErrors } from "../utils/validation.js";
import toast from "react-hot-toast";

const Login = ({ onSignIn, onSignUp }) => {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const schema = {
      email: { required: true, email: true },
      password: { required: true, password: true },
    };
    const newErrors = getValidationErrors({ email, password }, schema);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error("Проверьте введённые данные");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        await onSignIn(email, password);
      } else {
        await onSignUp(email, password);
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login">
        <div className="login-logo">SR</div>
        <div className="login-title">Кокпит</div>
        <div className="login-sub">Stas Royce · ASO / iGaming</div>
        
        <div className="tabs2">
          <button
            className={`tab2 ${mode === "signin" ? "on" : ""}`}
            onClick={() => { setMode("signin"); setErrors({}); }}
          >
            Войти
          </button>
          <button
            className={`tab2 ${mode === "signup" ? "on" : ""}`}
            onClick={() => { setMode("signup"); setErrors({}); }}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            className="inp lf"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
          />
          {errors.email && <div className="error-msg">{errors.email}</div>}
          
          <input
            className="inp lf"
            type="password"
            placeholder="пароль (мин. 6)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
          />
          {errors.password && <div className="error-msg">{errors.password}</div>}
          
          <button className="btn full" type="submit" disabled={busy}>
            {busy ? <Loader2 className="spin" size={16} /> : mode === "signin" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
      </div>

      <style>{`
        .login-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F5F6F8;
          padding: 24px;
        }
        .login {
          width: 100%;
          max-width: 360px;
          background: #FFF;
          border: 1px solid #E8EBEF;
          border-radius: 18px;
          padding: 26px 24px;
          box-shadow: 0 8px 40px -12px rgba(16,24,40,.12);
        }
        .login-logo {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #4F46E5;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
        }
        .login-title {
          font-size: 23px;
          font-weight: 700;
          margin-top: 16px;
        }
        .login-sub {
          font-size: 13px;
          color: #5C6675;
          margin: 2px 0 18px;
        }
        .tabs2 {
          display: flex;
          gap: 6px;
          background: #F0F1F4;
          border-radius: 11px;
          padding: 4px;
          margin-bottom: 16px;
        }
        .tab2 {
          flex: 1;
          padding: 8px 0;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: #5C6675;
          cursor: pointer;
          border: none;
          background: none;
        }
        .tab2.on {
          background: #fff;
          color: #101522;
          box-shadow: 0 1px 2px rgba(16,24,40,.06);
        }
        .lf {
          margin-bottom: 10px;
        }
        .error-msg {
          font-size: 12px;
          color: #DC2626;
          margin-top: 4px;
          margin-bottom: 8px;
        }
        .btn.full {
          width: 100%;
          justify-content: center;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 15px;
          border-radius: 11px;
          background: #4F46E5;
          color: #fff;
          font-size: 13.5px;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }
        .btn.full:hover {
          background: #4338CA;
        }
        .btn.full:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
