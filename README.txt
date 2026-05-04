🚀 CareerLoop

CareerLoop is an all-in-one student productivity and career development platform that combines AI tools, analytics, and peer learning to help students grow smarter and faster.

🌟 Features
🧑‍🤝‍🧑 Community
Share doubts, notes, and ideas
Learn from peers
Build a collaborative environment
📊 Classlytics
Track attendance percentage
Know how many classes to attend or skip
Avoid attendance shortage
🤖 ResuvoAI
AI-powered resume analyzer
Provides:
Resume score (out of 10)
Strengths & weaknesses
Missing skills
Improvement suggestions
📚 SylloAI
Converts syllabus into structured summary
Provides:
Unit-wise breakdown
Important topics
Study plan
🎤 IntervoAI
AI interview trainer
Reviews answers
Suggests improvements
Generates mock questions
🔄 SkillSwap
Peer-to-peer learning platform
Teach or learn skills
Free or paid sessions
📈 Dashboard
Tracks:
Attendance %
Resume score
Interview practice count
AI usage
Community activity
Updates automatically based on user actions
🔐 Authentication System
Signup with:
Username
Email
Phone
Password
Login with username/password
Passwords secured using bcryptjs
User session stored locally
Each user has:
Separate dashboard
Separate analytics
Persistent data
🧠 AI Integration
Powered by Groq API
Used in:
Chatbot (CareerBot)
Resume analysis
Interview practice
Syllabus summarization
🛠 Tech Stack
Frontend
HTML
CSS
JavaScript
Backend
Node.js
Express.js
Database (Local)
JSON file (database.json)
Security
bcryptjs (password hashing)
AI
Groq API (LLaMA models)
📁 Project Structure
careerloop/
│
├── public/
│   ├── index.html
│   ├── dashboard.html
│   ├── community.html
│   ├── classlytics.html
│   ├── resuvoai.html
│   ├── sylloai.html
│   ├── intervoai.html
│   ├── skillswap.html
│   ├── styles.css
│   ├── app.js
│
├── server.js
├── package.json
├── package-lock.json
├── database.json
├── .env
└── README.md
⚙️ Installation & Setup
1. Clone the repository
git clone https://github.com/YOUR_USERNAME/careerloop.git
cd careerloop
2. Install dependencies
npm install
3. Add your API key

Create a .env file:

GROQ_API_KEY=your_api_key_here
4. Run the server
npm start
5. Open in browser
http://localhost:3000
🔄 How It Works
User action → Frontend (app.js)
           → API call (/api/...)
           → server.js
           → database.json / AI
           → response
           → UI update
📊 Automatic Analytics

User activity automatically updates dashboard:

Action	Update
AI usage	AI Sessions +1
Resume analysis	Resume score updated
Interview practice	Count increases
Community post	Activity increases
SkillSwap session	Session count increases
Attendance input	Attendance updated
🔒 Security Notes
Passwords are hashed using bcryptjs
API keys are stored in .env
.env is excluded using .gitignore
⚠️ Important
Do NOT open files using file://
Always use:
http://localhost:3000
🚀 Future Improvements
MongoDB / PostgreSQL database
Real authentication (JWT / sessions)
Charts & analytics graphs
Payment integration
Real-time chat system
Deployment (Vercel / Render)
👨‍💻 Author

Resham Singh

💡 Vision

CareerLoop aims to become a complete ecosystem where students can:

Learn → Practice → Track → Improve → Succeed