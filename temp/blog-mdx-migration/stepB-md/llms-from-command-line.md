I recently had the pleasure of presenting at DevFest DC, where I demonstrated how to use Simon Willison's [LLM tool](https://llm.datasette.io/) to interact with large language models directly from the command line. The presentation was filmed by Agora Media and shared by OpenHub.

<div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;margin:1.5rem 0;">

<div class="iframe">

<div id="player">

</div>

<div class="player-unavailable">

# An error occurred.

<div class="submessage">

Unable to execute JavaScript.

</div>

</div>

</div>

</div>

## What is LLM?

Unlike agentic tools like Claude Code or Open Code that drive your terminal for you, LLM is a higher-touch tool that keeps you in the driver's seat. You make individual calls to LLMs to accomplish specific tasks while maintaining control of your workflow.

## Key Topics Covered

- **Installation with UV** - Using the modern Python package manager to install LLM in isolated environments, avoiding dependency conflicts
- **Model Plugins** - Installing plugins for different providers like DeepSeek and OpenRouter (which offers free model access)
- **Templates** - Creating reusable system prompts, like a Linux command-line copilot that provides context-aware help
- **Whole-Repository Q&A** - Using RepoMix to pack codebases into AI-ready formats for comprehensive codebase analysis
- **Progress Reporting** - Generating visual SVG reports from git logs for client updates
- **Structured Data Extraction** - Using curl and LLM to scrape websites and extract JSON data with defined schemas
- **Embeddings and Semantic Search** - Building RAG pipelines with just a few commands for fuzzy searching across text corpora

## Practical Applications

The presentation demonstrates chaining LLM with everyday command-line tools to accomplish tasks like:

- Getting Linux help directly in the terminal without web searches
- Extracting and embedding GitHub follower data for semantic search
- Processing legislation like the "Big Beautiful Bill" for policy analysis
- Generating visual progress reports from version control history

The power of LLM lies in its ability to integrate with whatever tools you're already using in the command line, making AI augmentation accessible without requiring complex setups or subscriptions.
