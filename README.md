
# ⚡ JS-Visualizer

### "Stop guessing. Start visualizing."

Ever wondered why that `setTimeout` ran *after* your `Promise`? Most developers guess. **JS-Loop-Master** shows you. This isn't just an editor; it's a window into the "hidden" heartbeat of the browser.


## 🧐 What is this?
A high-fidelity **JavaScript Execution Simulator**. It takes your code, rips it apart into an Abstract Syntax Tree (AST), and rebuilds it as a physical data flow. 

* **The Brain:** Powered by `Acorn` & `Zustand`.
* **The Look:** Styled with `Ant Design` for that sleek "Dev Console" vibe.
* **The Feel:** Built on `Monaco`—if you can code in VS Code, you can code here.


## 🛠️ The "Big Three" Features

#### 1. The Time Machine (Manual Stepping)
Don't just hit "Run" and hope for the best. Use the **Step Forward** button to advance the Event Loop one tick at a time. Watch a Microtask skip the line while the Macrotask waits its turn.

#### 2. The Logic Map (Diagram UI)
We didn't just build a list. We built a **Schematic**.
* **Blue:** Synchronous "Right Now" code.
* **Green:** High-priority Microtasks (Promises).
* **Amber:** The Callback Queue (setTimeout).

#### 3. Pro-Grade Editor
A full-blown Monaco integration. Syntax highlighting, error detection, and smooth performance.


## 🏗️ Under the Hood

| Part | Tech | Role |
| :--- | :--- | :--- |
| **Parsing** | `Acorn.js` | Turns text into actionable "Task Objects." |
| **State** | `Zustand` | The ultra-fast memory bank for our queues. |
| **Motion** | `Framer Motion` | Makes data "fly" across the screen. |
| **UI** | `Ant Design` | Provides the professional "Industry Standard" structure. |


## 🚦 Quick Start

1.  **Clone it:** `git clone ...`
2.  **Ignite it:** `npm install && npm run dev`
3.  **Break it:** Paste some gnarly nested `Promises` and `setTimeouts` to see who wins.
4.  **Visit it:** Check out the live demo at https://jsvisualizerv2.netlify.app/

## 💡 The Philosophy
This tool was built to bridge the gap between **writing code** and **understanding execution**. Perfect for interview prep, teaching, or just satisfying your curiosity about why JS works the way it does.



### 📬 Let's Connect
Got a feature idea? Found a bug in my "Tick" logic? Open an Issue or a PR. Let's build the best JS learning tool on the web.
