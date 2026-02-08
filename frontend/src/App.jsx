import React, { useState, useRef, useEffect } from 'react';

const OpheleiaComponent = () => {
  const [product, setProduct] = useState('');
  const [demographic, setDemographic] = useState('');
  const [goal, setGoal] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [showOutput, setShowOutput] = useState(false);

  const outputSectionRef = useRef(null);

  useEffect(() => {
    if (showOutput && outputSectionRef.current){
      outputSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [showOutput])

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
          demographic: demographic,
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

  const downloadJSON = async () => {
    try {
      const title = `${product.replace(/\s+/g, "_") || "opheleia"}_spec`;

      const response = await fetch("http://localhost:3001/api/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: markdown,
          title: title,
          product: product,
          demographic: demographic,
          goal: goal
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "JSON generation failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.json`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Could not download JSON. Make sure your backend server is running.");
    }
  };
//csv time baby --sophie
//took code from json and lowkey cobbled it together for csv so lets hope it doesnt blow up
const downloadCSV = async () => {
  try {
    const title = `${product.replace(/\s+/g, "_") || "opheleia"}_spec`;

    const response = await fetch("http://localhost:3001/api/csv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        markdown: markdown,
        title: title,
        product: product,
        demographic: demographic,
        goal: goal
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || "CSV generation failed");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert("Could not download CSV. Make sure your backend server is running.");
  }
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
            <input 
              type="text" 
              className="main-input" 
              placeholder="(i.e., coffee)" 
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
              placeholder="(i.e., college students)" 
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
              placeholder="(i.e., increase sales...)" 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              autoComplete="off" 
            />
          </div>
        </div> 
          <div className="button-row">
            <button onClick={generateSpecification} className="cta-btn">
              GENERATE SPECIFICATION
            </button>
          </div>
  

          {showOutput && (
  <section className="output-section" ref={outputSectionRef}>
    <div className="output-card">
      <div className="output-nav">
        <span>SYSTEM_OUTPUT.MD</span>

        <div>
          <button onClick={downloadFile} className="download-btn-style">
            DOWNLOAD MKD
          </button>

          <button
            onClick={downloadJSON}
            className="download-btn-style"
            style={{ marginLeft: "14px" }}
          >
            DOWNLOAD JSON
          </button>
          
          <button
            onClick={downloadCSV}
            className="download-btn-style"
            style={{ marginLeft: "14px" }}
          >
            DOWNLOAD CSV
          </button>
        </div>
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
        .title-block h1 { font-size: 100px; font-weight: 700; letter-spacing: -4px; line-height: 0.9; color: var(--v-black); }
        .thin { font-weight: 300; color: var(--v-purple-dark); font-style: italic;  }
        .form-slender { display: grid; grid-template-columns: repeat(3, 1fr); gap: 150px; position: relative;}
        .input-wrap { border-top: 1.5px solid var(--v-black); padding-top: 20px; }
        .num { font-size: 11px; font-weight: 700; color: var(--v-accent); margin-bottom: 15px; display: block; }
        .editable-label { display: block; width: 100%; border: none; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--v-black); margin-bottom: 30px; background: transparent; outline: none; }
        .main-input { width: 100%; border: none; font-size: 20px; font-weight: 400; outline: none; background: transparent; color: var(--v-text-soft); }
        .main-input::placeholder { color: var(--v-text-soft); opacity: 1; }
        .button-row { margin-top: 80px; text-align: center;}
        .cta-btn { width: 1000px; display: inline-block; background: var(--v-black); color: white; border: none; padding: 28px; font-size: 13px; font-weight: 700; letter-spacing: 4px; cursor: pointer; transition: 0.3s; }
        .cta-btn:hover { background: var(--v-purple-dark); }
        .output-card { border: 1px solid var(--v-purple-dark); padding: 40px; margin-top: 60px; background: #c49fe0ff; border-radius: 2px; }
        .output-nav { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; margin-bottom: 30px; color: var(--v-purple-dark); }
        .download-btn-style { background: none; border: none; font-weight: 700; color: var(--v-purple-dark); cursor: pointer; text-decoration: underline; font-size: 10px; letter-spacing: 1px; }
        .output-body pre { white-space: pre-wrap; font-size: 14px; line-height: 1.7; color: #111; font-family: 'Inter', sans-serif; background: #fcfcfc; padding: 30px; border: 1px solid #eee; }
        .field-header { font-size: 20px; font-weight: 600; text-transform: uppercase; color: var(--v-placeholder-dark); margin-bottom: 10px; }
        @media (max-width: 900px) {
            .form-slender { grid-template-columns: 1fr; }
            .title-block h1 { font-size: 55px; }
        }
      `}</style>
    </div>
  );
};

export default OpheleiaComponent;