// Global Error Handler - Add this to index.html or main.jsx for full app coverage
if (typeof window !== 'undefined') {
  window.onerror = function(msg, url, lineNo, colNo, error) {
    console.error("🔥 GLOBAL JS ERROR:", {
      message: msg,
      url: url,
      line: lineNo,
      col: colNo,
      error: error
    });
    alert("Global Error: " + msg);
    return true;
  };

  window.addEventListener('unhandledrejection', function(event) {
    console.error("🔥 UNHANDLED PROMISE REJECTION:", event.reason);
    alert("Promise Error: " + event.reason.message);
  });
}

console.log("🌟 Global error handler loaded - Ready to debug payment flow!");
