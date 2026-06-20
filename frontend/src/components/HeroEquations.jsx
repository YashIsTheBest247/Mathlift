import { useEffect, useRef } from "react";
import katex from "katex";

const EQUATIONS = [
  { tex: "\\int_0^1 x^2\\,dx", top: 20, left: 9, size: 30, rot: -6, dur: 16, delay: 0 },
  { tex: "\\sum_{n=1}^{\\infty}\\frac{1}{n^2}", top: 64, left: 15, size: 32, rot: 5, dur: 21, delay: 2 },
  { tex: "\\frac{d}{dx}e^{x}=e^{x}", top: 38, left: 44, size: 27, rot: -3, dur: 18, delay: 1 },
  { tex: "a^2+b^2=c^2", top: 84, left: 40, size: 26, rot: 4, dur: 23, delay: 3 },
  { tex: "\\nabla\\cdot\\vec{E}=\\frac{\\rho}{\\varepsilon_0}", top: 13, left: 56, size: 24, rot: 6, dur: 17, delay: 1.5 },
  { tex: "e^{i\\pi}+1=0", top: 72, left: 62, size: 30, rot: -5, dur: 19, delay: 2.5 },
  { tex: "\\lim_{x\\to0}\\frac{\\sin x}{x}=1", top: 50, left: 26, size: 25, rot: 3, dur: 20, delay: 0.8 },
  { tex: "\\binom{n}{k}=\\frac{n!}{k!(n-k)!}", top: 8, left: 22, size: 23, rot: -4, dur: 22, delay: 1.2 },
  { tex: "\\oint_C \\vec{F}\\cdot d\\vec{r}", top: 30, left: 70, size: 26, rot: 4, dur: 18, delay: 0.4 },
  { tex: "\\theta=\\tan^{-1}\\frac{y}{x}", top: 90, left: 60, size: 24, rot: -3, dur: 24, delay: 2.2 },
  { tex: "\\frac{\\partial^2 u}{\\partial t^2}=c^2\\nabla^2 u", top: 56, left: 50, size: 22, rot: 5, dur: 20, delay: 1.8 },
  { tex: "\\det(A-\\lambda I)=0", top: 78, left: 28, size: 25, rot: -5, dur: 21, delay: 0.6 },
  { tex: "\\sqrt{b^2-4ac}", top: 44, left: 12, size: 27, rot: 4, dur: 19, delay: 2.8 },
  { tex: "P(A\\mid B)=\\frac{P(B\\mid A)P(A)}{P(B)}", top: 24, left: 36, size: 21, rot: -2, dur: 23, delay: 1.4 },
];

function Equation({ tex }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = katex.renderToString(tex, {
        throwOnError: false,
        displayMode: false,
      });
    }
  }, [tex]);
  return <span ref={ref} />;
}

export default function HeroEquations() {
  return (
    <div className="hero-eqs" aria-hidden="true">
      {EQUATIONS.map((eq, index) => (
        <span
          key={index}
          className="hero-eq"
          style={{ top: `${eq.top}%`, left: `${eq.left}%`, fontSize: `${eq.size}px`, transform: `translate(-50%, -50%) rotate(${eq.rot}deg)` }}
        >
          <span
            className="hero-eq-inner"
            style={{ animationDuration: `${eq.dur}s`, animationDelay: `${eq.delay}s` }}
          >
            <Equation tex={eq.tex} />
          </span>
        </span>
      ))}
    </div>
  );
}
