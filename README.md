# ai-self-assessment
## Which type of AI engineer are you?

[cite_start]This framework shifts the focus from "what can you define" to "what can you decide"[cite: 5, 40]. [cite_start]To classify talent into the **Prototyper**, **Builder**, and **Scaler** archetypes, we will evaluate "Technical Taste"—the ability to reason through tradeoffs[cite: 16, 18, 22].

The following 12-question quiz is designed to be the logic layer for your stateless website.

---

## The AI Archetype Quiz: Technical Taste Assessment

Each question requires a single choice. Internally, these map to **[P]** Prototyper, **[B]** Builder, or **[S]** Scaler.

1.  **A stakeholder asks for a "magical" new AI feature that hasn't been tested. Your first move is:**
    * A) Build a quick Streamlit UI with a mocked backend to see if the value is there. **[P]**
    * B) Map out the data pipelines and API schema required to make it production-ready. **[B]**
    * C) Evaluate the potential token costs and latency impact against existing SLAs. **[S]**

2.  **When choosing between a complex Agentic workflow and a simple RAG setup for a standard query task, you prioritize:**
    * A) The Agentic workflow—it’s more flexible for discovering edge cases. **[P]**
    * B) The RAG setup—it’s easier to integrate into the current application stack. **[B]**
    * C) The RAG setup—it offers more predictable costs and lower hallucination risks. **[S]**

3.  **Your preferred development environment for a new AI project is:**
    * A) A Jupyter Notebook or Google Colab for rapid iteration and visualization. **[P]**
    * B) A local IDE with a robust CI/CD pipeline and containerization. **[B]**
    * C) A managed platform with built-in experiment tracking and drift monitoring. **[S]**

4.  **What does "Technical Taste" mean to you in an AI context?**
    * [cite_start]A) Sensing which experimental ideas will actually move the needle for the user[cite: 13]. **[P]**
    * [cite_start]B) Choosing the right architecture to ensure the system doesn't break at launch[cite: 16]. **[B]**
    * [cite_start]C) Balancing performance, cost, and risk to maintain a sustainable system[cite: 18]. **[S]**

5.  **You discover a high hallucination rate in a prototype. You solve it by:**
    * A) Prompt engineering and trying three different alternative models immediately. **[P]**
    * B) Refining the data chunking strategy and improving the retrieval metadata. **[B]**
    * C) Implementing a secondary "Guardrail" LLM to validate all outputs before they reach the user. **[S]**

6.  **Which metric is most important for a successful AI deployment?**
    * A) Time to Value (how fast we proved the concept). **[P]**
    * B) System uptime and API response reliability. **[B]**
    * C) Cost-per-query vs. business ROI. **[S]**

7.  **Regarding data privacy and PII (Personally Identifiable Information):**
    * A) It’s a hurdle to be addressed once the core value proposition is proven. **[P]**
    * [cite_start]B) It’s a requirement handled through secure data pipelines and access controls[cite: 15]. **[B]**
    * C) It’s a primary constraint that determines which models and regions we are allowed to use. **[S]**

8.  **The project is falling behind schedule. To catch up, you would:**
    * A) Reduce the scope to a "lo-fi" version to get it in front of users faster. **[P]**
    * B) Automate the testing suite to find and fix architectural bugs more quickly. **[B]**
    * C) Optimize the most expensive/slowest model calls to improve immediate performance. **[S]**

9.  **Your team is debating a move to a new open-source model. You argue based on:**
    * A) The potential for higher "vibe" quality and creative output. **[P]**
    * B) The ease of self-hosting and integration into existing Kubernetes clusters. **[B]**
    * C) The long-term reduction in vendor lock-in and inference costs. **[S]**

10. **A "Builder" archetype is most valuable when:**
    * [cite_start]A) A company is in the "zero to one" phase of product discovery[cite: 11]. **[P]**
    * [cite_start]B) A validated idea needs to be turned into a scalable, end-to-end production system[cite: 14]. **[B]**
    * [cite_start]C) A system is already live but suffers from high latency and governance gaps[cite: 17]. **[S]**

11. **How do you handle "Model Drift"?**
    * A) I re-run my best prompts to see if the "vibe" still feels right. **[P]**
    * B) I update the underlying data index and re-verify the integration points. **[B]**
    * [cite_start]C) I set up automated observability alerts and a versioned model fallback strategy[cite: 17]. **[S]**

12. **In terms of seniority, when working under high ambiguity, you:**
    * A) Iterate faster to "fail forward" and find clarity through action. **[P]**
    * B) Design modular systems that can be easily refactored as requirements change. **[B]**
    * [cite_start]C) Establish a rigorous governance framework to mitigate risks while the path is unclear[cite: 18]. **[S]**

---

## The Classification Rubric

The final Archetype is determined by the frequency of choices. [cite_start]Since the framework notes that these are not rigid and "blend in practice," we calculate the percentage of alignment[cite: 10, 39].

### Scoring Logic
Let $n_p, n_b, n_s$ be the number of choices for Prototyper, Builder, and Scaler respectively.

$$Primary Archetype = \max(n_p, n_b, n_s)$$

* **Prototyper:** $n_p \ge 6$ (or highest count). [cite_start]Focuses on rapid experimentation and sensing value[cite: 11, 13].
* **Builder:** $n_b \ge 6$ (or highest count). [cite_start]Focuses on architecting workflows and shipping production systems[cite: 14, 15].
* **Scaler:** $n_s \ge 6$ (or highest count). [cite_start]Focuses on reliability, governance, and operational tradeoffs[cite: 17, 18].

**Seniority Modifier:**
* If the candidate consistently chooses the most "complex tradeoff" options (Questions 4, 7, 12), they are tagged as **Senior/Lead**.

---

## Technical Implementation: Stateless Permalink

To make the website stateless, you will encode the user's answers into the URL.

### 1. Query String Format
Assign each question a key (`q1` through `q12`) and each choice a value (`a`, `b`, or `c`).
* **Example Permalink:** `https://ai-self-assessment.aipoc.site/result?q1=a&q2=c&q3=b&q4=a...`

### 2. QR Code Generation
The website should use a client-side library (like `qrcode.js`) to take the current `window.location.href` and render it as a QR code on the results page. This allows the candidate to save or share their "Tag" without a database.

### 3. Data-Only Encoding (Optional)
For a shorter URL, you can compress the 12 answers into a single string:
* **Example:** `https://ande.la/style?v=abcabcabcabc` (where each character index corresponds to a question).

---

### Result Output Display
The website should present the result as:
> **Your AI Archetype: [Archetype Name]**
> *Technical Taste Profile:* You excel at **[Reasoning from Framework]**.
> Permalink: [QR Code] | [Copy Link Button]