const express = require("express");
const cors = require("cors");
require("dotenv").config();


const fetchFn =
  global.fetch ||
  ((...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args)));

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.post("/api/generate-specification", async (req, res) => {
  try {
    const { product, demographic, goal } = req.body;

    if (!product || !demographic || !goal) {
      return res.status(400).json({
        success: false,
        error: "Missing product, demographic, or goal in request body",
      });
    }

    const prompt = `You are a product expert. Create a structured markdown document with the following sections EXACTLY in this order:

# Executive Summary
(Short 5-8 sentence summary of the product strategy)

# Competitor Analysis
## Competitor 1: [Name]
### Successes
- ...
### Flaws
- ...

## Competitor 2: [Name]
### Successes
- ...
### Flaws
- ...

## Competitor 3: [Name]
### Successes
- ...
### Flaws
- ...

# Market Trends
...

# User Stories
1. ...
2. ...

# Success Metrics
- ...

# Roadmap
- 3 Months:
- 6 Months:
- 12 Months:

Product: ${product}
Target Users: ${demographic}
Goal: ${goal}
`;


    const response = await fetchFn("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({
        success: false,
        error: `Anthropic API error: ${response.status} ${errText}`,
      });
    }

    const data = await response.json();
    const markdown = data?.content?.[0]?.text || "";

    return res.json({ success: true, markdown });
  } catch (err) {
    console.error("generate-specification ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/json", async (req, res) => {
  try {
    const { markdown, title = "product-dashboard", product, demographic, goal } = req.body;

    if (!markdown) return res.status(400).send("No markdown provided");

    const payload = {
      meta: {
        title,
        generatedAt: new Date().toISOString(),
        product: product || null,
        demographic: demographic || null,
        goal: goal || null,
      },
      markdown,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${title}.json"`);
    return res.send(JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error("JSON ERROR:", err);
    return res.status(500).send("JSON generation failed: " + err.message);
  }
});

app.post("/api/csv", async (req, res) => {
  try {
    const { markdown, title = "product-dashboard", product, demographic, goal } = req.body;

    if (!markdown) return res.status(400).send("No markdown provided :(");
    
    let csv = "Task,Product,Target Audience,Business Goal,Status,Priority\n";
    
    const tasks = [];
    
    const checkboxes = markdown.match(/^[\s]*-[\s]*\[[\s]*\][\s]*.+$/gm) || [];
    tasks.push(...checkboxes.map(t => t.replace(/^[\s]*-[\s]*\[[\s]*\][\s]*/, '').trim()));
    
    const userStorySection = markdown.match(/##\s+User Stories[\s\S]*?(?=##|$)/i);
    if (userStorySection) {
      const numbered = userStorySection[0].match(/^\d+\.\s+.+$/gm) || [];
      tasks.push(...numbered.map(t => t.replace(/^\d+\.\s+/, '').trim()));
    }
    
    const sections = markdown.match(/##\s+(Success Metrics|Roadmap)[\s\S]*?(?=##|$)/gi) || [];
    sections.forEach(section => {
      const bullets = section.match(/^[\s]*-[\s]+(?!\[)(.+)$/gm) || [];
      tasks.push(...bullets.map(t => t.replace(/^[\s]*-[\s]+/, '').trim()));
    });
    
    if (tasks.length === 0) {
      return res.status(400).send("No tasks found in markdown. Try adding bullet points, numbered lists, or checkboxes.");
    }
    
    // Remove duplicates and filter section headers and timeline months
    const uniqueTasks = [...new Set(tasks)].filter(task => 
      task.length > 0 && 
      !task.startsWith('#') &&
      !task.match(/^Month\s+\d+/i) &&
      !task.match(/^\d+-\d+\s+months?/i)
    );
    
    uniqueTasks.forEach((task, index) => {
      const taskName = task.replace(/"/g, '""');
      
      const total = uniqueTasks.length;
      let priority;
      if (index < Math.ceil(total * 0.3)) {
        priority = "High";
      } else if (index < Math.ceil(total * 0.7)) {
        priority = "Medium";
      } else {
        priority = "Low";
      }
     //distributtteeeeeeeeeeeeee 
      csv += `"${taskName}","${product || 'N/A'}","${demographic || 'N/A'}","${goal || 'N/A'}","To Do","${priority}"\n`;
    });
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${title}.csv"`);
    return res.send(csv);
  } catch (err) {
    console.error("CSV ERROR:", err);
    return res.status(500).send("CSV generation failed: " + err.message);
  }
});
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});