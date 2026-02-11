# ÓPHELEIA APP #

**Inspiration**

ÓPHELEIA was imagined from the pressure and fast-paced environment in the hackathon SheInnovates. Originally, our team planned to build a health community blog; however, as the competition started, we decided to solve a more technical, high-impact problem in the given categories. We pivoted to focus on the technical intricacies of Product Management, creating a tool that bridges the gap between raw data and actionable strategy.

**What it does**

Our website, ÓPHELEIA, serves as the middleman for product managers to access easily compiled data. By inputting a product, its demographic, and goal, an itemized markdown file or dashboard visual of the overview, market insights, component failure and success, user feedback, and risk mitigation is provided. Users can then export this intelligence into Markdown, JSON, or CSV formats to seamlessly integrate into their existing workflows in tools like Trello or Jira.

**How we built it**

Our project uses a full-stack architecture as follows:

- Frontend: React Native (Vite)
- Backend: Node.js
- Intelligence: Claude (Anthropic) API with custom prompt engineering
- Environment: Visual Studio Code 
- Language: JavaScript, HTML, and CSS
i.e., the questions input aid the prompt to assist with the Claude API to gather data and output that into a markdown file.
