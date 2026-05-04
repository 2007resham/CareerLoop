
const $ = (sel) => document.querySelector(sel);
const chatFab = $("#chatbotFab");
const chatPanel = $("#chatbotPanel");
const chatClose = $("#chatbotClose");
const chatSend = $("#chatbotSend");
const chatInput = $("#chatbotInput");
const chatMessages = $("#chatbotMessages");

const sidebar = $("#mobileSidebar");
const sidebarOverlay = $("#sidebarOverlay");
const openSidebarBtn = $("#openSidebar");
const closeSidebarBtn = $("#closeSidebar");

const authModal = $("#authModal");
const openSigninBtn = $("#openSignin");
const closeAuth = $("#closeAuth");
const closeAuthLogin = $("#closeAuthLogin");

const signupBox = $("#signupBox");
const loginBox = $("#loginBox");
const showLogin = $("#showLogin");
const showSignup = $("#showSignup");

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");



async function updateUserActivity(type, value = 1) {
  const userId = localStorage.getItem("currentUserId");

  if (!userId) return;

  try {
    await fetch("/api/update-dashboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        type,
        value
      })
    });
  } catch (error) {
    console.log("Dashboard activity update failed:", error);
  }
}

function toggleChat(show) {
  if (!chatPanel) return;
  chatPanel.classList.toggle("hidden", !show);
}
if (chatFab) chatFab.addEventListener("click", () => toggleChat(true));
if (chatClose) chatClose.addEventListener("click", () => toggleChat(false));

function appendChatMessage(role, text) {
  const div = document.createElement("div");
  div.className = role === "user" ? "user-msg" : "bot-msg";
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function askAI(message) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const raw = await response.text();
    throw new Error(raw || "Server did not return JSON.");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "AI request failed.");
  }
  await updateUserActivity("ai");
  return data.reply || "No reply received.";
}

async function handleChatSend() {
  const message = chatInput.value.trim();
  if (!message) return;
  appendChatMessage("user", message);
  chatInput.value = "";
  appendChatMessage("bot", "Thinking...");
  const thinkingNode = chatMessages.lastElementChild;

  try {
    const reply = await askAI(message);
    thinkingNode.textContent = reply;
  } catch (error) {
    thinkingNode.textContent = `Error: ${error.message}`;
  }
}

if (chatSend) chatSend.addEventListener("click", handleChatSend);
if (chatInput) {
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleChatSend();
  });
}

function openSidebar() {
  if (!sidebar) return;
  sidebar.classList.add("open");
  sidebarOverlay?.classList.add("show");
}
function closeSidebar() {
  sidebar?.classList.remove("open");
  sidebarOverlay?.classList.remove("show");
}
openSidebarBtn?.addEventListener("click", openSidebar);
closeSidebarBtn?.addEventListener("click", closeSidebar);
sidebarOverlay?.addEventListener("click", closeSidebar);

function openSignup() {
  authModal?.classList.remove("hidden");
  signupBox?.classList.remove("hidden");
  loginBox?.classList.add("hidden");
}

function openLogin() {
  authModal?.classList.remove("hidden");
  loginBox?.classList.remove("hidden");
  signupBox?.classList.add("hidden");
}

function closeAuthModal() {
  authModal?.classList.add("hidden");
}


closeAuth?.addEventListener("click", closeAuthModal);
closeAuthLogin?.addEventListener("click", closeAuthModal);

showLogin?.addEventListener("click", openLogin);
showSignup?.addEventListener("click", openSignup);

authModal?.addEventListener("click", (e) => {
  if (e.target === authModal) closeAuthModal();
});

document.querySelectorAll(".buy-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const userId = localStorage.getItem("currentUserId");

    if (userId) {
      window.location.href = "dashboard.html";
    } else {
      openSignup();
    }
  });
});

// Community
const communityForm = $("#communityForm");
const communityFeed = $("#communityFeed");
const defaultPosts = [
  { name: "Aarav", topic: "Data Structures", text: "Can someone share clean notes for trees and graphs?" },
  { name: "Simran", topic: "DBMS", text: "I made a quick SQL cheat sheet. Happy to post it here." },
];
function renderCommunityPosts(posts) {
  if (!communityFeed) return;
  communityFeed.innerHTML = posts.map(post => `
    <div class="feed-item">
      <small>${post.name} • ${post.topic}</small>
      <div>${post.text}</div>
    </div>
  `).join("");
}
renderCommunityPosts(defaultPosts);

communityForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#communityName").value.trim() || "Anonymous";
  const topic = $("#communityTopic").value.trim() || "General";
  const text = $("#communityPost").value.trim();
  if (!text) return;
  defaultPosts.unshift({ name, topic, text });
  renderCommunityPosts(defaultPosts);
  communityForm.reset();
  updateUserActivity("community");
});

// Attendance
$("#attendanceForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const attended = Number($("#attendedClasses").value);
  const total = Number($("#totalClasses").value);
  const required = Number($("#requiredAttendance").value) || 75;
  const resultBox = $("#attendanceResult");

  if (!Number.isFinite(attended) || !Number.isFinite(total) || total <= 0 || attended < 0 || attended > total) {
    resultBox.textContent = "Please enter valid attendance values.";
    return;
  }

  const percent = (attended / total) * 100;
  updateUserActivity("attendance", percent.toFixed(2));
  if (percent >= required) {
    const bunkable = Math.floor((attended * 100 / required) - total);
    resultBox.textContent =
      `Current attendance: ${percent.toFixed(2)}%\nYou are above the required ${required}% mark.\nYou can miss approximately ${Math.max(0, bunkable)} more class(es) and still stay at or above the requirement.`;
  } else {
    let needed = 0;
    while (((attended + needed) / (total + needed)) * 100 < required) needed++;
    resultBox.textContent =
      `Current attendance: ${percent.toFixed(2)}%\nYou are below the required ${required}% mark.\nYou need to attend approximately ${needed} consecutive class(es) to recover to ${required}% or above.`;
  }
});

// SkillSwap
const skillSwapForm = $("#skillSwapForm");
const skillSwapList = $("#skillSwapList");
const sessions = [
  { title: "Python Basics", mentor: "Riya", price: "₹149", description: "Beginner-friendly session on loops, functions, and mini projects." },
  { title: "UI Design Review", mentor: "Kabir", price: "Free", description: "Feedback on portfolio and landing page design decisions." },
];
function renderSessions() {
  if (!skillSwapList) return;
  skillSwapList.innerHTML = sessions.map(s => `
    <div class="session-item">
      <small>${s.mentor} • ${s.price}</small>
      <strong>${s.title}</strong>
      <div style="margin-top:8px;color:var(--muted)">${s.description}</div>
    </div>
  `).join("");
}
renderSessions();

skillSwapForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = $("#skillTitle").value.trim();
  const mentor = $("#skillMentor").value.trim() || "Anonymous";
  const price = $("#skillPrice").value.trim() || "Free";
  const description = $("#skillDescription").value.trim();
  if (!title || !description) return;
  sessions.unshift({ title, mentor, price, description });
  renderSessions();
  skillSwapForm.reset();
  updateUserActivity("skillswap");
});

// AI Forms
async function handleAIForm({ formId, resultId, buildPrompt }) {
  const form = $(formId);
  const resultBox = $(resultId);
  if (!form || !resultBox) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    resultBox.textContent = "Thinking...";
    try {
      const reply = await askAI(buildPrompt());
      resultBox.textContent = reply;
      if (formId === "#resumeForm") {
        const match = reply.match(/Score:\s*(\d+(\.\d+)?)\/10/i);

        if (match) {
          const score = parseFloat(match[1]);

          updateUserActivity("resume", score);
        }
      }

      if (formId === "#interviewForm") {
        updateUserActivity("interview");
      }

      if (formId === "#syllabusForm") {
        updateUserActivity("ai");
      }
      
    } catch (error) {
      resultBox.textContent = `Error: ${error.message}`;
    }
  });
}

handleAIForm({
  formId: "#resumeForm",
  resultId: "#resumeResult",
  buildPrompt: () => {
    const role = $("#resumeRole").value.trim() || "student internship role";
    const resume = $("#resumeText").value.trim();

    return `You are ResuvoAI.

IMPORTANT: Start your response EXACTLY like this:
Score: X/10

Then continue with:
1) Strengths
2) Weaknesses
3) Missing skills
4) Improvements
5) Final action plan

Resume:
${resume}

Target role:
${role}`;
  }
});

handleAIForm({
  formId: "#syllabusForm",
  resultId: "#syllabusResult",
  buildPrompt: () => {
    const subject = $("#syllabusSubject").value.trim() || "the subject";
    const syllabus = $("#syllabusText").value.trim();

    return `You are SylloAI. Summarize this syllabus for ${subject}.

Give:
1) Short overview
2) Unit-wise breakdown
3) Most important topics
4) Study order
5) One-week revision plan

Syllabus:
${syllabus}`;
  }
});

handleAIForm({
  formId: "#interviewForm",
  resultId: "#interviewResult",
  buildPrompt: () => {
    const role = $("#interviewRole").value.trim() || "student internship";
    const answer = $("#interviewAnswer").value.trim();
    return `You are IntervoAI. Help a student prepare for a ${role} interview. If the text below is an answer, review it for clarity, confidence, structure, and role fit. If it is a request, respond with useful mock questions and model answers.\n\nInput:\n${answer}`;
  }
});

signupForm?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userData = {
    username: document.getElementById("signupUsername").value.trim(),
    email: document.getElementById("signupEmail").value.trim(),
    phone: document.getElementById("signupPhone").value.trim(),
    password: document.getElementById("signupPassword").value.trim(),
    confirmPassword: document.getElementById("confirmPassword").value.trim()
  };

  try {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error);
      return;
    }

    localStorage.setItem("currentUserId", data.user.id);
    window.location.href = "dashboard.html";

  } catch (error) {
    alert("Signup failed. Server problem.");
  }
});

loginForm?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const loginData = {
    username: document.getElementById("loginUsername").value.trim(),
    password: document.getElementById("loginPassword").value.trim()
  };

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error);
      return;
    }

    localStorage.setItem("currentUserId", data.user.id);
    window.location.href = "dashboard.html";

  } catch (error) {
    alert("Login failed. Server problem.");
  }
});

function refreshAuthUI() {
  const userId = localStorage.getItem("currentUserId");
  const signInBtn = document.getElementById("openSignin");

  if (!signInBtn) return;

  if (userId) {
    signInBtn.textContent = "Logout";

    signInBtn.onclick = function () {
      localStorage.removeItem("currentUserId");
      window.location.href = "index.html";
    };
  } else {
    signInBtn.textContent = "Sign In";

    signInBtn.onclick = function () {
      openSignup();
    };
  }
}

refreshAuthUI();

localStorage.setItem("currentUserId", data.user.id);
refreshAuthUI();
window.location.href = "dashboard.html";