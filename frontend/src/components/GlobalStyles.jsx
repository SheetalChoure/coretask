import React from "react";
import { TOKENS, FONT_IMPORT_URL } from "../constants/tokens";

export default function GlobalStyles() {
  return (
    <style>{`
      @import url('${FONT_IMPORT_URL}');
      * { box-sizing: border-box; }
      ::selection { background: ${TOKENS.accentSoft}; color: ${TOKENS.accent}; }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-thumb { background: ${TOKENS.borderStrong}; border-radius: 999px; }
      ::-webkit-scrollbar-track { background: transparent; }
      button:focus-visible, input:focus-visible, select:focus-visible {
        outline: 2px solid ${TOKENS.accent}; outline-offset: 2px;
      }
      @media (prefers-reduced-motion: reduce) {
        * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
      }
    `}</style>
  );
}
