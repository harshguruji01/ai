/**
 * ============================================================================
 * HarshGuruJi AI Loader Engine (@theutkarshmail / 21st.dev)
 * ============================================================================
 * Generates and injects the glowing circular AI Generating Orb in chat responses.
 * ============================================================================
 */
(function(window) {
  'use strict';

  function renderAiLoaderHtml(text, size, subtext) {
    text = text || 'Generating';
    size = size || 'compact';
    var subHtml = subtext ? '<div class="text-[11px] text-slate-400 font-medium mt-2 text-center">' + subtext + '</div>' : '';

    return (
      '<div class="ai-loader-container flex flex-col items-center justify-center my-2 select-none animate-fade-in">' +
        '<div class="ai-loader-sphere ' + size + '">' +
          '<div class="ai-loader-glow"></div>' +
          '<div class="ai-loader-crescent"></div>' +
          '<div class="ai-loader-shadow"></div>' +
          '<div class="ai-loader-rim"></div>' +
          '<span class="ai-loader-text">' + text + '</span>' +
        '</div>' +
        subHtml +
      '</div>'
    );
  }

  window.renderAiLoaderHtml = renderAiLoaderHtml;
})(typeof window !== 'undefined' ? window : this);
