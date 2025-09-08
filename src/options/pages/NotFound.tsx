import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import "../styles/NotFound.css";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="nf-page">
      <div className="nf-card">
        <h1 className="nf-title">404</h1>
        <p className="nf-subtitle">Oops! Page not found</p>
        <a href="/" className="nf-link">Return to Home</a>
      </div>
    </div>
  );
};

export default NotFound;
