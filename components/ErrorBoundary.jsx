import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Что-то пошло не так</h2>
            <p>{this.state.error?.message || "Неизвестная ошибка"}</p>
            <button onClick={() => window.location.reload()}>
              Перезагрузить страницу
            </button>
          </div>
          <style>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #F5F6F8;
              font-family: 'Inter', -apple-system, sans-serif;
            }
            .error-content {
              text-align: center;
              padding: 40px;
              background: white;
              border-radius: 16px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            .error-content h2 {
              margin: 0 0 16px;
              color: #DC2626;
            }
            .error-content p {
              margin: 0 0 24px;
              color: #5C6675;
            }
            .error-content button {
              padding: 10px 20px;
              background: #4F46E5;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
            }
            .error-content button:hover {
              background: #4338CA;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
