import React, { useState } from 'react';
import logo from './assets/logo.png'; 

const OpheleiaComponent = () => {
  const [product, setProduct] = useState('');
  const [demographic, setDemographic] = useState('');
  const [goal, setGoal] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [showOutput, setShowOutput] = useState(false);

  const generateSpecification = async () => {
    if (!product.trim() || !demographic.trim() || !goal.trim()) return alert("Please fill all fields");

    setShowOutput(true);
    setMarkdown("ÓPHELEIA IS THINKING...");

    try{
      const response = await fetch('http://localhost:3001/api/generate-specification', {
        method: 'POST', 
        headers:{
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: product,
          demograhic: demographic,
          goal: goal
        })
      });

      const data = await response.json();
      setMarkdown(data.markdown);
    }catch(error){
      setMarkdown("Error: Could not generate specification. Make sure your backend server is running.")
      console.error(error);
    }

    /*const p = product.toUpperCase();
    const d = demographic.toUpperCase();
    const g = goal.toUpperCase();

    setTimeout(() => {
      setMarkdown(mdContent);
    }, 800);*/
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

  return (
    <div className="viewport">
      <header className="v-header">
        <div className="brand">
          <div className="logo-container">
            <img src={logo} alt="logo" className="logo-img" />
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
            <div className ="field-header">Project Name</div> 
            <input 
              type="text" 
              className="main-input" 
              placeholder="Enter product name" 
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              autoComplete="off" 
            />
          </div>

          <div className="input-wrap">
            <span className="num">02</span>
            <div className ="field-header">Demographic Focus</div> 
            <input 
              type="text" 
              className="main-input" 
              placeholder="Enter potential demograhic" 
              value={demographic}
              onChange={(e) => setDemographic(e.target.value)}
              autoComplete="off" 
            />
          </div>

          <div className="input-wrap">
            <span className="num">03</span>
            <div className ="field-header">Primary Goal</div> 
            <input 
              type="text" 
              className="main-input" 
              placeholder="Enter goal" 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              autoComplete="off" 
            />
          </div>

          <div className="button-row">
            <button onClick={generateSpecification} className="cta-btn">
              GENERATE SPECIFICATION
            </button>
          </div>
        </div> 

        {showOutput && (
          <section className="output-section">
            <div className="output-card">
              <div className="output-nav">
                <span>SYSTEM_OUTPUT.MD</span>
                <button onClick={downloadFile} className="download-btn-style">DOWNLOAD FILE</button>
              </div>
              <div className="output-body">
                <pre>{markdown}</pre>
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
            --v-gray-border: #E5E5E5;
            --v-text-soft: #888888;
            --v-placeholder-dark: #222222;
        }

        .viewport { max-width: none; margin: 0; padding: 40px 80px; font-family: 'Inter', sans-serif; background: #fff; min-height: 100vh; }
        .v-header { display: flex; margin-bottom: 100px; }
        .brand { display: flex; align-items: center; gap: 15px; }
        .logo-container { width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; }
        .logo-img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .tagline { font-weight: 700; font-size: 11px; letter-spacing: 3px; color: var(--v-black); }
        .title-block { margin-bottom: 100px; }
        .title-block h1 { font-size: 85px; font-weight: 700; letter-spacing: -4px; line-height: 0.9; color: var(--v-black); }
        .thin { font-weight: 300; color: var(--v-purple-dark); }
        .form-slender { display: grid; grid-template-columns: repeat(3, 1fr); gap: 60px; }
        .input-wrap { border-top: 1.5px solid var(--v-black); padding-top: 20px; }
        .num { font-size: 11px; font-weight: 700; color: var(--v-accent); margin-bottom: 15px; display: block; }
        .editable-label { display: block; width: 100%; border: none; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--v-text-soft); margin-bottom: 30px; background: transparent; outline: none; }
        .main-input { width: 100%; border: none; font-size: 24px; font-weight: 400; outline: none; background: transparent; color: var(--v-black); }
        .main-input::placeholder { color: var(--v-placeholder-dark); opacity: 1; }
        .button-row { margin-top: 80px; display: flex; justify-content: center; }
        .cta-btn { width: 100%; background: var(--v-black); color: white; border: none; padding: 28px; font-size: 13px; font-weight: 700; letter-spacing: 4px; cursor: pointer; transition: 0.3s; }
        .cta-btn:hover { background: var(--v-purple-dark); }
        .output-card { border: 1px solid var(--v-gray-border); padding: 40px; margin-top: 60px; background: #fff; border-radius: 2px; }
        .output-nav { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; margin-bottom: 30px; color: var(--v-text-soft); }
        .download-btn-style { background: none; border: none; font-weight: 700; color: var(--v-purple-dark); cursor: pointer; text-decoration: underline; font-size: 10px; letter-spacing: 1px; }
        .output-body pre { white-space: pre-wrap; font-size: 14px; line-height: 1.7; color: #111; font-family: 'Inter', sans-serif; background: #fcfcfc; padding: 30px; border: 1px solid #eee; }
        
        @media (max-width: 900px) {
            .form-slender { grid-template-columns: 1fr; }
            .title-block h1 { font-size: 55px; }
        }
      `}</style>
    </div>
  );
};

export default OpheleiaComponent;