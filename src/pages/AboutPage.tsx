const AboutPage = () => {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
      <h1>About FarmGuru</h1>
      <p>FarmGuru provides AI-powered agricultural assistance with a focus on safety, usability, and transparency. It supports English and Hindi, works offline for recent queries, and integrates with public data sources.</p>

      <p className="text-sm text-muted-foreground">For a demo walkthrough, see the README’s Demo Script section.</p>

      <h2 id="sources">Data & Sources</h2>
      <ul>
        <li><a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer">India Meteorological Department</a> – weather forecasts and advisories</li>
        <li><a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer">PM-KISAN</a> and <a href="https://pmfby.gov.in" target="_blank" rel="noopener noreferrer">PMFBY</a> – government schemes</li>
        <li>Market data – state mandi feeds where available, with 7-day aggregates</li>
      </ul>

      <h2>Accessibility</h2>
      <ul>
        <li>All interactive elements are keyboard focusable with visible focus styles.</li>
        <li>Results and status updates are announced via <code>aria-live</code> regions.</li>
        <li>Images include alt text or titles; SVGs include <code>title</code> tags.</li>
      </ul>

      <h2>Limitations</h2>
      <ul>
        <li>AI responses may be incomplete or uncertain; confidence is shown when available.</li>
        <li>Diagnostics is guidance only. Always consult local experts for chemical treatments.</li>
      </ul>

      <h2>Ethics & Safety</h2>
      <ul>
        <li>Prioritize Integrated Pest Management (IPM) and non-chemical methods.</li>
        <li>No medical or harmful advice; community content is moderated.</li>
        <li>We avoid storing sensitive data; see README for details.</li>
      </ul>
    </div>
  );
};

export default AboutPage;