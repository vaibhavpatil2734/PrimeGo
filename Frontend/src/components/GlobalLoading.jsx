import React, { useState, useEffect } from "react";
import { useGlobalLoading } from "./GlobalLoadingContext";

// Reuse the loader animation from app/Loading.jsx
const Loader = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Add keyframes once
    if (!document.getElementById("global-loader-keyframes")) {
      const style = document.createElement("style");
      style.id = "global-loader-keyframes";
      style.textContent = `
        @keyframes squareSlide {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 256; }
        }
        @keyframes dotFollow {
          0% { cx: 8; cy: 40; }
          12.5% { cx: 8; cy: 72; }
          25% { cx: 40; cy: 72; }
          37.5% { cx: 72; cy: 72; }
          50% { cx: 72; cy: 40; }
          62.5% { cx: 72; cy: 8; }
          75% { cx: 40; cy: 8; }
          87.5% { cx: 8; cy: 8; }
          100% { cx: 8; cy: 40; }
        }
        @keyframes dotFollowMobile {
          0% { cx: 8; cy: 50; }
          12.5% { cx: 8; cy: 92; }
          25% { cx: 100; cy: 92; }
          37.5% { cx: 192; cy: 92; }
          50% { cx: 192; cy: 50; }
          62.5% { cx: 192; cy: 8; }
          75% { cx: 100; cy: 8; }
          87.5% { cx: 8; cy: 8; }
          100% { cx: 8; cy: 50; }
        }
      `;
      document.head.appendChild(style);
    }

    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const letters = "Made4UU".split("");

  const wrapperStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(255,255,255,0.25)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    zIndex: 99999,
  };

  const sliderStyle = {
    display: "flex",
    gap: "2vw",
  };

  const loaderStyle = {
    width: "6vw",
    height: "6vw",
    minWidth: "60px",
    minHeight: "60px",
    maxWidth: "80px",
    maxHeight: "80px",
  };

  const mobileLoaderStyle = {
    width: "240px",
    height: "110px",
  };

  const svgStyle = {
    width: "100%",
    height: "100%",
  };

  const squareStyle = {
    fill: "none",
    stroke: "#2f3545",
    strokeWidth: "9",
    strokeLinecap: "round",
    strokeDasharray: "192 64",
    animation: "squareSlide 4s linear infinite",
  };

  const dotStyle = {
    fill: "#FFCC33",
    animation: "dotFollow 4s linear infinite",
  };

  const mobileDotStyle = {
    fill: "#FFCC33",
    animation: "dotFollowMobile 4s linear infinite",
  };

  const letterStyle = {
    fill: "black",
    fontSize: "22px",
    fontWeight: "bold",
    fontFamily: "sans-serif",
  };

  const mobileTextStyle = {
    fill: "black",
    fontSize: "34px",
    fontWeight: "bold",
    fontFamily: "sans-serif",
  };

  return (
    <div style={wrapperStyle}>
      <div style={sliderStyle}>
        {isMobile ? (
          <div style={mobileLoaderStyle}>
            <svg viewBox="0 0 200 100" style={svgStyle}>
              <rect
                x="8"
                y="8"
                width="184"
                height="84"
                pathLength="256"
                style={squareStyle}
              />
              <circle
                r="6"
                cx="8"
                cy="50"
                style={mobileDotStyle}
              />
              <text
                x="100"
                y="52"
                textAnchor="middle"
                dominantBaseline="middle"
                style={mobileTextStyle}
              >
                Made4UU
              </text>
            </svg>
          </div>
        ) : (
          letters.map((letter, index) => (
            <div key={index} style={loaderStyle}>
              <svg viewBox="0 0 80 80" style={svgStyle}>
                <rect
                  x="8"
                  y="8"
                  width="64"
                  height="64"
                  pathLength="256"
                  style={squareStyle}
                />
                <circle r="5" cx="8" cy="40" style={dotStyle} />
                <text
                  x="40"
                  y="40"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={letterStyle}
                >
                  {letter}
                </text>
              </svg>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Global loading overlay component
const GlobalLoading = () => {
  const { loading } = useGlobalLoading();

  if (!loading) {
    return null;
  }

  return <Loader />;
};

export default GlobalLoading;

