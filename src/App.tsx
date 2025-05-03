import React, { useEffect, useState } from 'react';
import './App.css';
import './components/gradientAnimation.css';
import CustomCursor from './components/customCursor';
import GradientBackground from './components/GradientBackground';

type ThemeType = 'bunny' | 'water';

const themes = {
  bunny: {
    "--color-text": "rgb(112, 22, 153)",
    "--color-text-secondary": "rgba(249, 240, 251, 1)",
    "--color-accent-primary": "rgba(223, 30, 155, 1)",
    "--button-bg": "rgba(223, 30, 155, 0.8)",
    "--button-bg-light": "rgba(223, 30, 155, 0.2)",
    "--button-text": "rgba(249, 240, 251, 1)",
    "--border-color": "rgba(223, 30, 155, 1)",
    "--outer-bg": "#a892e7",
    "--cursor-color": "rgba(223, 30, 155, 0.7)",
    "--cursor-glow": "0 0 8px rgba(223, 30, 155, 0.6)",
    "--cursor-hover-color": "rgba(223, 30, 155, 0.6)",
    "--cursor-hover-glow": "0 0 12px rgba(223, 30, 155, 0.6)",
  },
  water: {
    "--color-text": "rgb(191, 229, 249)",
    "--color-accent-primary": "rgb(134, 196, 240)",
    "--button-bg": "rgba(214, 235, 251, 0.8)",
    "--button-bg-light": "rgba(214, 220, 251, 0.2)",
    "--button-text": "rgb(46, 80, 192)",
    "--border-color": "rgba(8, 34, 163, 1)",
    "--outer-bg": "#1d0298",
    "--cursor-color": "rgba(230, 214, 251, 0.7)",
    "--cursor-glow": "0 0 8px rgba(230, 214, 251, 0.6)",
    "--cursor-hover-color": "rgba(230, 214, 251, 0.6)",
    "--cursor-hover-glow": "0 0 12px rgba(230, 214, 251, 0.6)",
  }
};

const ThemeToggle = ({ currentTheme, toggleTheme }: { currentTheme: ThemeType, toggleTheme: () => void }) => {
  const moonIcon = "☾";
  const sunIcon  = "☼";
  return (
    <button
      onClick={toggleTheme}
      style={{
        width: 40, height: 40, borderRadius: '50%',
        background: currentTheme === 'bunny'
          ? themes.bunny["--button-bg-light"]
          : themes.water["--button-bg-light"],
        color: currentTheme === 'bunny'
          ? themes.bunny["--color-text"]
          : themes.water["--color-text"],
        border: 'none', outline: 'none', cursor: 'pointer',
        fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      {currentTheme === 'bunny' ? moonIcon : sunIcon}
    </button>
  );
};

const NavButton = ({
  label, isActive, theme, onClick
}: {
  label: string, isActive: boolean, theme: ThemeType, onClick: () => void
}) => (
  <button
    onClick={onClick}
    style={{
      padding: '10px 16px', fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold',
      textTransform: 'uppercase', letterSpacing: '0.1em',
      backgroundColor: isActive
        ? (theme === 'bunny' ? themes.bunny["--button-bg"] : themes.water["--button-bg"])
        : (theme === 'bunny' ? themes.bunny["--button-bg-light"] : themes.water["--button-bg-light"]),
      color: isActive
        ? (theme === 'bunny' ? themes.bunny["--button-text"] : themes.water["--button-text"])
        : (theme === 'bunny' ? themes.bunny["--color-text"] : themes.water["--color-text"]),
      border: 'none', outline: 'none', borderRadius: 20,
      cursor: 'pointer', margin: '0 5px'
    }}
  >
    {label}
  </button>
);

const CustomCursorWrapper = ({ theme }: { theme: ThemeType }) => {
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--cursor-border-color',
      theme === 'bunny' ? themes.bunny["--cursor-color"] : themes.water["--cursor-color"]
    );
    document.documentElement.style.setProperty(
      '--cursor-box-shadow',
      theme === 'bunny' ? themes.bunny["--cursor-glow"] : themes.water["--cursor-glow"]
    );
    document.documentElement.style.setProperty(
      '--cursor-hover-border-color',
      theme === 'bunny' ? themes.bunny["--cursor-hover-color"] : themes.water["--cursor-hover-color"]
    );
    document.documentElement.style.setProperty(
      '--cursor-hover-box-shadow',
      theme === 'bunny' ? themes.bunny["--cursor-hover-glow"] : themes.water["--cursor-hover-glow"]
    );
  }, [theme]);
  return <CustomCursor />;
};

/* ------------------------------------------------------------------ */
/* ✦Scramble helper + minimal fade‑in CSS                      */
/* ------------------------------------------------------------------ */

const scrambleSets = {
  japanese: "プロダクトデザイナーノーコードエンジニア",
  binary:   "01",
  symbols:  "!<>-_\\/[]{}—=+*^?#",
  matrix:   "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ",
  code:     "{([/\\])}@#$%^&*<>+=",
};

function scramble(
  target: string, 
  set: keyof typeof scrambleSets, 
  steps = 15, 
  updateFn: (text: string) => void
): Promise<string> {
  return new Promise(res => {
    let frame = 0;
    const chars = scrambleSets[set];
    let out = Array.from(target);
    
    const tick = () => {
      out = out.map((c, i) =>
        frame >= steps
          ? target[i]
          : Math.random() < frame / steps
            ? target[i]
            : chars[Math.floor(Math.random() * chars.length)]
      );
      
      // Update the state with the current scrambled text
      updateFn(out.join(''));
      
      frame++;
      if (frame <= steps) requestAnimationFrame(tick);
      else res(target);
    };
    
    tick();
  });
}

const fadeCSS = `
.fade { opacity: 0; transition: opacity .8s ease; }
.fade.show { opacity: 1; }
`;
if (!document.getElementById('fade-css')) {
  const style = document.createElement('style');
  style.id = 'fade-css';
  style.innerHTML = fadeCSS;
  document.head.appendChild(style);
}

/* ------------------------------------------------------------------ */
/* ✦  APP COMPONENT                                                   */
/* ------------------------------------------------------------------ */

function App() {
  /* theme + nav */
  const [theme, setTheme]    = useState<ThemeType>('water');
  const [activeTab, setTab]  = useState('HOME');

  /* phased reveal: 0‑3 */
  const [phase, setPhase]    = useState(0);

  /* dynamic role text */
  const [roleTop, setTop]    = useState("SOFTWARE ENGINEER");
  const [roleBot, setBot]    = useState("PRODUCT DESIGNER");

  /* save original text values for re-scrambling */
  const [originalTop] = useState("SOFTWARE ENGINEER");
  const [originalBot] = useState("PRODUCT DESIGNER");

  /* theme side‑effects */
  useEffect(() => {
    const cur = themes[theme];
    Object.entries(cur).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v as string)
    );
    /* outer bg tint = border‑color */
    document.body.style.background = cur["--border-color"];
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
  }, [theme]);

  /* drive the timeline on mount */
  useEffect(() => {
    /* 1: container */
    setPhase(1);

    /* 2: greeting */
    const t1 = setTimeout(() => setPhase(2), 600);

    /* 3: scramble roles */
    const t2 = setTimeout(() => {
      scramble(originalTop, "code", 45, setTop).then(() => {});
      scramble(originalBot, "japanese", 45, setBot).then(() => {});
      setPhase(3);
    }, 1200);

    /* 4: nav buttons */
    const t3 = setTimeout(() => setPhase(4), 2450);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [originalTop, originalBot]);

  /* toggle with scramble effect */
  const toggleTheme = () => {
    // Toggle the theme
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'bunny' ? 'water' : 'bunny';
      
      // Create a scramble effect based on the new theme
      const topSet = newTheme === 'bunny' ? "code" : "matrix";
      const botSet = newTheme === 'bunny' ? "japanese" : "symbols";
      
      // Apply scramble effect to role texts
      scramble(originalTop, topSet, 30, setTop).then(() => {});
      scramble(originalBot, botSet, 30, setBot).then(() => {});
      
      return newTheme;
    });
  };

  /* ---------------------------------------------------------------- */
  /* RENDER                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <>
      <CustomCursorWrapper theme={theme} />
      <div
        className={`fade ${phase >= 1 ? 'show' : ''}`}
        style={{
          width: '100vw', height: '100vh',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
        }}
      >
        <div
          className="App"
          style={{
            width: 'calc(100vw - 30px)',
            height: 'calc(100vh - 30px)',
            position: 'relative',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <GradientBackground theme={theme}>
            {/* NAV BAR */}
            <div
              className={`fade ${phase >= 4 ? 'show' : ''}`}
              style={{
                width: '100%', display: 'flex', justifyContent: 'center',
                alignItems: 'center', padding: '20px 0', position: 'relative',
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {['HOME', 'PORTFOLIO', 'PLAY'].map(lbl => (
                  <NavButton
                    key={lbl}
                    label={lbl}
                    isActive={activeTab === lbl}
                    theme={theme}
                    onClick={() => setTab(lbl)}
                  />
                ))}
                <div style={{ width: 20 }} />
                <ThemeToggle currentTheme={theme} toggleTheme={toggleTheme} />
              </div>
            </div>

            {/* MAIN COPY */}
            <div
              style={{
                width: '100%', height: 'calc(100% - 100px)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <p
                className={`fade ${phase >= 3 ? 'show' : ''}`}
                style={{
                  fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold',
                  color: theme === 'bunny'
                    ? themes.bunny["--color-text"]
                    : themes.water["--color-text"],
                  margin: '10px 0',
                }}
              >
                {roleTop}
              </p>

              <h1
                className={`fade ${phase >= 2 ? 'show' : ''}`}
                style={{
                  fontFamily: 'monospace', fontSize: 32, fontWeight: 'bold',
                  color: theme === 'bunny'
                    ? themes.bunny["--color-accent-primary"]
                    : themes.water["--color-accent-primary"],
                  margin: '20px 0',
                }}
              >
                Hi, I'm Ximing!
              </h1>

              <p
                className={`fade ${phase >= 3 ? 'show' : ''}`}
                style={{
                  fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold',
                  color: theme === 'bunny'
                    ? themes.bunny["--color-text"]
                    : themes.water["--color-text"],
                  margin: '10px 0',
                }}
              >
                {roleBot}
              </p>
            </div>
          </GradientBackground>
        </div>
      </div>
    </>
  );
}

export default App;