import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  // Handle scroll animations
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        setIsVisible((prev) => ({
          ...prev,
          [entry.target.id]: entry.isIntersecting,
        }));
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    });

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [result]);

  // Call FastAPI backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      if (!response.ok) {
        throw new Error("Network error");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Failed to analyze symptoms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Background particles
  const particles = Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className="particle"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 20}s`,
        transform: `translateY(${scrollY * 0.1 * (i % 3 + 1)}px)`,
      }}
    />
  ));

  return (
    <div className="app">
      {/* Animated background */}
      <div className="background-wrapper">
        <div className="gradient-bg" />
        <div className="particles-container">{particles}</div>
        <div
          className="floating-shapes"
          style={{
            transform: `translateY(${scrollY * 0.05}px) rotate(${scrollY * 0.1}deg)`,
          }}
        >
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
      </div>

      <div className="container">
        {/* ✅ Fix: Apply isVisible.header */}
        <header
          className={`header animate-on-scroll ${
            isVisible.header ? "visible" : ""
          }`}
          id="header"
        >
          <div className="logo-container">
            <div className="logo-ring">
              <span className="medical-icon">🏥</span>
            </div>
          </div>
          <h1 className="main-title">
            <span className="title-part">AI</span>
            <span className="title-part">Symptom</span>
            <span className="title-part">Checker</span>
          </h1>
          <p className="subtitle">
            Advanced medical insights powered by artificial intelligence
          </p>
          <div className="header-accent" />
        </header>

        <div
          className={`symptom-form animate-on-scroll ${
            isVisible.form ? "visible" : ""
          }`}
          id="form"
        >
          <div className="form-container">
            <div className="form-group">
              <label htmlFor="symptoms" className="form-label">
                <span className="label-icon">📝</span>
                <span>Describe your symptoms in detail</span>
              </label>
              <div className="input-container">
                <textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={6}
                  placeholder="Example: I have been experiencing persistent headaches for the past 3 days, along with nausea and sensitivity to bright light..."
                  required
                  className="symptom-input"
                />
                <div className="input-glow" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !symptoms.trim()}
              className={`submit-btn ${loading ? "loading" : ""}`}
            >
              <div className="btn-bg" />
              {loading ? (
                <div className="loading-content">
                  <div className="loading-spinner">
                    <div className="spinner-ring" />
                    <div className="spinner-ring" />
                    <div className="spinner-ring" />
                  </div>
                  <span>Analyzing symptoms...</span>
                </div>
              ) : (
                <div className="btn-content">
                  <span className="btn-icon">🔍</span>
                  <span>Get AI Analysis</span>
                  <div className="btn-arrow">→</div>
                </div>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div
            className={`error-card animate-on-scroll ${
              isVisible.error ? "visible" : ""
            }`}
            id="error"
          >
            <div className="error-content">
              <div className="error-icon">⚠️</div>
              <p className="error-message">{error}</p>
            </div>
            <div className="error-pulse" />
          </div>
        )}

        {result && (
          <div className="results-container">
            <div
              className={`result-card diagnoses-card animate-on-scroll ${
                isVisible.diagnoses ? "visible" : ""
              }`}
              id="diagnoses"
            >
              <div className="card-header">
                <div className="card-icon-wrapper">
                  <span className="card-icon">🏥</span>
                </div>
                <div>
                  <h2>Possible Diagnoses</h2>
                  <p className="card-subtitle">
                    AI-analyzed potential conditions
                  </p>
                </div>
              </div>
              <div className="card-content">
                {Array.isArray(result.diagnoses) &&
                result.diagnoses.length > 0 ? (
                  <div className="diagnosis-list">
                    {result.diagnoses.map((diag, idx) => (
                      <div
                        key={idx}
                        className="diagnosis-item"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        <div className="item-indicator" />
                        <div className="item-content">
                          <span>{diag}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No specific diagnoses available</p>
                )}
              </div>
            </div>

            <div
              className={`result-card recommendations-card animate-on-scroll ${
                isVisible.recommendations ? "visible" : ""
              }`}
              id="recommendations"
            >
              <div className="card-header">
                <div className="card-icon-wrapper">
                  <span className="card-icon">💡</span>
                </div>
                <div>
                  <h2>Recommendations</h2>
                  <p className="card-subtitle">Suggested next steps</p>
                </div>
              </div>
              <div className="card-content">
                {Array.isArray(result.recommendations) &&
                result.recommendations.length > 0 ? (
                  <div className="recommendation-list">
                    {result.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="recommendation-item"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        <div className="item-indicator" />
                        <div className="item-content">
                          <span>{rec}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No recommendations available</p>
                )}
              </div>
            </div>

            <div
              className={`disclaimer animate-on-scroll ${
                isVisible.disclaimer ? "visible" : ""
              }`}
              id="disclaimer"
            >
              <div className="disclaimer-icon">⚠️</div>
              <div className="disclaimer-content">
                <strong>Medical Disclaimer:</strong> This AI analysis is for
                informational purposes only. Always consult with qualified
                healthcare professionals for proper medical diagnosis and
                treatment.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
