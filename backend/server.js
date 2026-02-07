const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/generate-specification', async (req,res) => {

    const { product, demographic, goal } = req.body;
    const prompt = `You are a product expert. Create a markdown document about: 
    Product: ${product}
    Target Users: ${demographic}
    Goal: ${goal}
    
    Include: 
    - Information from the product, demographic, and goal
    - Top 3 competitiors (flaws and successes)
    - Market trends and insights on the current competitors, the product itself and demographic needs
    - 10 user stories
    - Success metrics
    - Make a 3-6-12 month timeline`


    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            messages: [{role: 'user', content: prompt}]
        })
    });

    const data = await response.json();
    const markdown = data.content[0].text;

    res.json({success: true, markdown: markdown});
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});