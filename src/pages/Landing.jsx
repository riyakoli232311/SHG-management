import "./Landing.css";

export default function Landing() {
  return (
    <div className="landing">

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>Digital SHG Management Platform</h1>
          <p>
            Simplifying savings, loans, repayments and financial empowerment
            for rural women using technology.
          </p>

          <div className="hero-buttons">
            <button className="btn primary">Login</button>
            <button className="btn outline">Join Now</button>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about">
        <h2>Why Digital SHGs?</h2>
        <p>
          Traditional paper-based systems lead to errors, lack of transparency,
          and poor financial planning. Our platform digitizes SHG operations,
          making financial management simple, accurate, and accessible.
        </p>
      </section>

      {/* FEATURES */}
      <section className="features">
        <h2>Platform Features</h2>

        <div className="feature-grid">
          <div className="feature-card">💰 Smart Savings Tracking</div>
          <div className="feature-card">🏦 Loan & EMI Management</div>
          <div className="feature-card">📊 Transparent Reports</div>
          <div className="feature-card">🤖 AI Financial Assistant</div>
          <div className="feature-card">🔐 Secure Role Access</div>
          <div className="feature-card">📱 Mobile Friendly Design</div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="workflow">
        <h2>How It Works</h2>
        <div className="workflow-steps">
          <span>1️⃣ Create Members</span>
          <span>2️⃣ Add Savings</span>
          <span>3️⃣ Issue Loans</span>
          <span>4️⃣ Track Repayments</span>
          <span>5️⃣ View Growth</span>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="testimonial">
        <p>
          “Our SHG now maintains clear digital records and improved savings discipline.”
        </p>
        <strong>— SHG Leader</strong>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Start Managing Your SHG Digitally Today</h2>
        <button className="btn primary big">Get Started</button>
      </section>

      <footer>
        © 2026 SHG Digital Platform | Empowering Rural Women
      </footer>

    </div>
  );
}
