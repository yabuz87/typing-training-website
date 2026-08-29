import TypingTest from '@/components/TypingTest';

export default function Home() {
  return <main>
    <nav className="nav shell" aria-label="Main navigation">
      <a className="brand" href="#top" aria-label="ElType home"><span className="brandMark">E</span> eltype</a>
      <div className="navLinks"><a href="#test">Test</a><a href="#insights">Insights</a><a href="#about">How it works</a></div>
      <a className="navCta" href="#test">Start typing <span>↗</span></a>
    </nav>
    <section className="hero shell" id="top">
      <div className="eyebrow"><span /> Free · Focused · Multilingual</div>
      <h1>Type faster.<br /><em>Know your progress.</em></h1>
      <p>Build speed and precision with a distraction-free typing test that turns every keystroke into useful feedback.</p>
      <div className="heroStats" aria-label="Features"><div><strong>2</strong><span>Languages</span></div><i /><div><strong>6</strong><span>Live metrics</span></div><i /><div><strong>100%</strong><span>Private</span></div></div>
    </section>
    <TypingTest />
    <section className="about shell" id="about">
      <div><span className="sectionNo">01 / HOW IT WORKS</span><h2>Practice with<br />purpose.</h2></div>
      <div className="steps">
        <article><b>01</b><h3>Choose your test</h3><p>Select English or Amharic and a duration that fits your session.</p></article>
        <article><b>02</b><h3>Type naturally</h3><p>We measure every keystroke without interrupting your rhythm.</p></article>
        <article><b>03</b><h3>Read the signals</h3><p>Review speed, accuracy, consistency, errors, and a clear next step.</p></article>
      </div>
    </section>
    <footer className="shell"><a className="brand" href="#top"><span className="brandMark">E</span> eltype</a><p>Built for better typing.</p><span>© {new Date().getFullYear()} ElType</span></footer>
  </main>;
}
