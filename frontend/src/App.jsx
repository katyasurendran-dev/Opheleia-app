import React, { useState, useRef, useEffect } from 'react';

const OpheleiaComponent = () => {
  const [product, setProduct] = useState('');
  const [demographic, setDemographic] = useState('');
  const [goal, setGoal] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [showOutput, setShowOutput] = useState(false);

  const outputSectionRef = useRef(null);

  // --- PARSER LOGIC ---
  const parseDashboardData = (markdown) => {
    if (!markdown || markdown === "ÓPHELEIA IS THINKING...") return null;

    const summaryMatch = markdown.match(/# Executive Summary([\s\S]*?)(?=#|$)/i);
    const competitorSection = markdown.match(/# Competitor Analysis([\s\S]*?)(?=# Market Trends|$)/i);
    const trendsMatch = markdown.match(/# Market Trends([\s\S]*?)(?=# User Stories|$)/i);
    const storiesMatch = markdown.match(/# User Stories([\s\S]*?)(?=# Success Metrics|$)/i);
    const metricsMatch = markdown.match(/# Success Metrics([\s\S]*?)(?=# Roadmap|$)/i);
    const roadmapSection = markdown.match(/# Roadmap([\s\S]*?)$/i);

    const splitBullets = (text) => {
      if (!text) return [];
      return text
        .split(/\n(?=[-*•]|\d+\.)/) 
        .map(item => item.replace(/^([-*•]|\d+\.)\s+/, '').trim())
        .filter(item => item.length > 0);
    };

    const competitors = [];
    if (competitorSection) {
      const competitorMatches = competitorSection[1].matchAll(/## Competitor \d+:\s*(.+?)\n([\s\S]*?)(?=## Competitor|$)/g);
      for (const match of competitorMatches) {
        const name = match[1].trim();
        const body = match[2];
        const successesBlock = body.match(/### Successes([\s\S]*?)(?=###|$)/i)?.[1] || "";
        const flawsBlock = body.match(/### Flaws([\s\S]*?)(?=###|$)/i)?.[1] || "";
        competitors.push({ 
          name, 
          successes: splitBullets(successesBlock),
          flaws: splitBullets(flawsBlock)
        });
      }
    }

    // UPDATED ROADMAP LOGIC
    const roadmap = [];
    if (roadmapSection) {
      const rawText = roadmapSection[1];
      const blocks = Array.from(rawText.matchAll(/-\s*\*\*([\s\S]*?):\*\*([\s\S]*?)(?=-\s*\*\*|$)/g));
      
      if (blocks.length > 0) {
        // Format A: Bolded phases
        blocks.forEach(match => {
          roadmap.push({ time: match[1].trim(), items: splitBullets(match[2]) });
        });
      } else {
        // Format B: Just a list of bullets (The "Wall of Text" fix)
        roadmap.push({ time: "Strategic Steps", items: splitBullets(rawText) });
      }
    }

    return {
      summary: summaryMatch ? summaryMatch[1].trim() : "",
      competitors,
      trends: trendsMatch ? trendsMatch[1].trim() : "",
      stories: storiesMatch ? splitBullets(storiesMatch[1]) : [],
      metrics: metricsMatch ? splitBullets(metricsMatch[1]) : [],
      roadmap
    };
  };

  const dashboardData = parseDashboardData(markdown);

  // --- ACTIONS ---
  useEffect(() => {
    if (showOutput && outputSectionRef.current) {
      outputSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showOutput]);

  const generateSpecification = async () => {
    if (!product.trim() || !demographic.trim() || !goal.trim()) return alert("Please fill all fields");
    setShowOutput(true);
    setMarkdown("ÓPHELEIA IS THINKING...");
    try {
      const response = await fetch('http://localhost:3001/api/generate-specification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, demographic, goal })
      });
      const data = await response.json();
      setMarkdown(data.markdown);
    } catch (error) {
      setMarkdown("Error: Could not generate specification.");
    }
  };

  const downloadFile = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${product.replace(/\s+/g, '_') || 'opheleia'}_spec.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = async () => {
    try {
      const title = `${product.replace(/\s+/g, "_") || "opheleia"}_spec`;
      const response = await fetch("http://localhost:3001/api/json", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown, title, product, demographic, goal }),
      });
      const blob = await response.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${title}.json`;
      a.click();
    } catch (error) { alert("JSON generation failed."); }
  };

  const downloadCSV = async () => {
    try {
      const title = `${product.replace(/\s+/g, "_") || "opheleia"}_spec`;
      const response = await fetch("http://localhost:3001/api/csv", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown, title, product, demographic, goal }),
      });
      const blob = await response.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${title}.csv`;
      a.click();
    } catch (error) { alert("CSV generation failed."); }
  };

  return (
    <div className="viewport">
      <header className="v-header">
        <div className="brand">
          <div className="logo-container">
            <img src="/logo.png" alt="logo" className="logo-img" />
          </div>
          <div className="tagline">ÓPHELEIA</div>
        </div>
      </header>

      <main className="v-main">
        <div className="title-block">
          <h1>ÓPHELEIA<br /><span className="thin">Your Advantage</span></h1>
        </div>

        <div className="form-slender">
          <div className="input-wrap">
            <span className="num">01</span>
            <div className ="field-header">Product Type</div> 
            <input type="text" className="main-input" placeholder="(i.e., coffee)" value={product} onChange={(e) => setProduct(e.target.value)} autoComplete="off" />
          </div>
          <div className="input-wrap">
            <span className="num">02</span>
            <div className ="field-header">Demographic Focus</div> 
            <input type="text" className="main-input" placeholder="(i.e., college students)" value={demographic} onChange={(e) => setDemographic(e.target.value)} autoComplete="off" />
          </div>
          <div className="input-wrap">
            <span className="num">03</span>
            <div className ="field-header">Primary Goal</div> 
            <input type="text" className="main-input" placeholder="(i.e., increase sales...)" value={goal} onChange={(e) => setGoal(e.target.value)} autoComplete="off" />
          </div>
        </div> 

        <div className="button-row">
          <button onClick={generateSpecification} className="cta-btn">GENERATE SPECIFICATION</button>
        </div>

        {showOutput && (
          <section className="output-section" ref={outputSectionRef}>
            <div className="output-card">
              <div className="output-nav">
                <span>SYSTEM_OUTPUT_DASHBOARD</span>
                <div className="btn-group">
                  <button onClick={downloadFile} className="download-btn-style">MKD</button>
                  <button onClick={downloadJSON} className="download-btn-style">JSON</button>
                  <button onClick={downloadCSV} className="download-btn-style">CSV</button>
                </div>
              </div>

              <div className="output-body">
                {dashboardData && (
                  <div className="dashboard-container">
                    <div className="summary-hero-card">
                      <div className="card-badge">Strategic Analysis</div>
                      <h3>Executive Summary</h3>
                      <p>{dashboardData.summary}</p>
                    </div>

                    <div className="dashboard-grid">
                      {dashboardData.competitors.map((comp, index) => (
                        <div key={index} className="competitor-card">
                          <div className="comp-header">
                            <span className="accent-num">0{index + 1}</span>
                            <h4>{comp.name}</h4>
                          </div>
                          <div className="status-tag success">▲ STRENGTHS</div>
                          <ul className="dashboard-list">
                            {comp.successes.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                          <div className="status-tag flaw">▼ WEAKNESSES</div>
                          <ul className="dashboard-list">
                            {comp.flaws.map((f, i) => <li key={i}>{f}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="dashboard-grid">
                      <div className="competitor-card">
                        <div className="card-badge">Market Intelligence</div>
                        <h4>Current Trends</h4>
                        <p className="card-p">{dashboardData.trends}</p>
                      </div>
                      <div className="competitor-card">
                        <div className="card-badge">User Journey</div>
                        <h4>Target User Stories</h4>
                        <ul className="dashboard-list">
                          {dashboardData.stories.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="metrics-row">
                      {dashboardData.metrics.map((m, i) => (
                        <div key={i} className="metric-pill">● {m}</div>
                      ))}
                    </div>

                    <div className="roadmap-container">
                      <div className="card-badge">Execution Roadmap</div>
                      <div className="timeline-v2">
                        {dashboardData.roadmap.map((phase, i) => (
                          <div key={i} className="timeline-block">
                            <h5>{phase.time}</h5>
                            <ul className="dashboard-list">
                              {phase.items.map((item, j) => <li key={j}>{item}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div className="raw-markdown-container">
                  <div className="card-badge" style={{ color: 'white', opacity: 0.9, marginTop: '40px' }}>Full Markdown Stream</div>
                  <pre>{markdown}</pre>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <style>{`
        :root {
            --v-purple-light: #DCD7FF; 
            --v-purple-dark: #6D28D9;
            --v-accent: #A78BFA;
            --v-black: #000000;
            --v-brand-purple: #c49fe0ff;
        }

        .viewport { max-width: none; margin: 0; padding: 40px 80px; font-family: 'Inter', sans-serif; background: #fff; min-height: 100vh; }
        .v-header { display: flex; margin-bottom: 100px; }
        .brand { display: flex; align-items: center; gap: 15px; }
        .logo-container { width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; }
        .logo-img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .tagline { font-weight: 700; font-size: 11px; letter-spacing: 3px; color: var(--v-black); }

        .title-block { margin-bottom: 100px; }
        .title-block h1 { font-size: 100px; font-weight: 700; letter-spacing: -4px; line-height: 0.9; color: var(--v-black); }
        .thin { font-weight: 300; color: var(--v-purple-dark); font-style: italic;  }

        .form-slender { display: grid; grid-template-columns: repeat(3, 1fr); gap: 150px; position: relative;}
        .input-wrap { border-top: 1.5px solid var(--v-black); padding-top: 20px; }
        .num { font-size: 11px; font-weight: 700; color: var(--v-accent); margin-bottom: 15px; display: block; }
        .field-header { font-size: 20px; font-weight: 600; text-transform: uppercase; color: #222; margin-bottom: 10px; }
        .main-input { width: 100%; border: none; font-size: 20px; font-weight: 400; outline: none; background: transparent; color: #888; }

        .button-row { margin-top: 80px; text-align: center;}
        .cta-btn { width: 1000px; max-width: 90%; display: inline-block; background: var(--v-black); color: white; border: none; padding: 28px; font-size: 13px; font-weight: 700; letter-spacing: 4px; cursor: pointer; transition: 0.3s; }
        .cta-btn:hover { background: var(--v-purple-dark); }

        .output-card { border: 1px solid var(--v-purple-dark); padding: 40px; margin-top: 60px; background: var(--v-brand-purple); border-radius: 4px; }
        .output-nav { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; margin-bottom: 30px; color: white; }
        .btn-group { display: flex; gap: 14px; }
        .download-btn-style { background: none; border: none; font-weight: 700; color: white; cursor: pointer; text-decoration: underline; font-size: 10px; }
        
        .dashboard-container { display: flex; flex-direction: column; gap: 24px; }
        .summary-hero-card, .competitor-card, .roadmap-container { background: white; padding: 32px; border-radius: 2px; border: 1px solid var(--v-purple-light); }
        .card-badge { font-size: 10px; font-weight: 800; color: var(--v-purple-dark); text-transform: uppercase; margin-bottom: 12px; }
        
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
        .accent-num { font-weight: 800; color: var(--v-accent); margin-right: 8px; }
        .status-tag { font-size: 9px; font-weight: 900; padding: 4px 8px; border-radius: 2px; display: inline-block; margin-top: 15px; margin-bottom: 8px; }
        .status-tag.success { background: #E1FBEF; color: #059669; }
        .status-tag.flaw { background: #FFF1F2; color: #E11D48; }
        
        .card-p { font-size: 14px; color: #111; line-height: 1.7; }
        .dashboard-list { list-style: none; padding: 0; margin: 0; }
        .dashboard-list li { position: relative; padding-left: 20px; margin-bottom: 10px; font-size: 14px; color: #111; line-height: 1.5; border-bottom: 1px solid #f0f0f0; padding-bottom: 5px; }
        .dashboard-list li::before { content: "→"; position: absolute; left: 0; color: var(--v-accent); font-weight: bold; }

        .metrics-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
        .metric-pill { background: white; border: 1px solid var(--v-purple-light); padding: 10px 20px; border-radius: 2px; font-size: 12px; font-weight: 700; color: var(--v-purple-dark); }

        .timeline-v2 { display: flex; flex-direction: column; gap: 20px; margin-top: 15px; }
        .timeline-block h5 { color: var(--v-purple-dark); font-weight: 800; text-transform: uppercase; margin-bottom: 12px; border-left: 4px solid var(--v-accent); padding-left: 10px; }

        .output-body pre { white-space: pre-wrap; font-size: 14px; line-height: 1.7; color: #111; font-family: 'Inter', sans-serif; background: #fcfcfc; padding: 30px; border: 1px solid #eee; margin-top: 10px; }

        @media (max-width: 900px) {
            .form-slender { grid-template-columns: 1fr; gap: 40px; }
            .title-block h1 { font-size: 60px; }
            .cta-btn { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default OpheleiaComponent;