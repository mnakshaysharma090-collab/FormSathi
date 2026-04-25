let step = 0;

const questions = [
  "Which document do you want to fill? (PAN / Driving License / Passport)",
  "What is your full name?",
  "What is your date of birth? (DD/MM/YYYY)",
  "Enter your mobile number (10 digits only)",
  "What is your email address?",
  "What is your full address?",
];

const keys = ["document", "fullName", "dob", "mobile", "email", "address"];
const formData = {};

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const generateBtn = document.getElementById("generateBtn");
const resultBox = document.getElementById("result");

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = sender + " msg";
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function botReply(message) {
  const typing = document.createElement("div");
  typing.className = "bot msg typing";
  typing.innerText = "Typing...";
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;

  setTimeout(() => {
    typing.remove();
    addMessage(message, "bot");
  }, 500);
}

botReply(questions[step]);

sendBtn.addEventListener("click", sendAnswer);

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendAnswer();
  }
});

generateBtn.addEventListener("click", function (e) {
  e.preventDefault();
  generateForm();
});

function sendAnswer() {
  const answer = input.value.trim();

  if (!answer) return;

  addMessage(answer, "user");

  if (step === 2) {
    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    if (!dobRegex.test(answer)) {
      input.value = "";
      botReply("❌ DOB must be in DD/MM/YYYY format.");
      return;
    }
  }

  if (step === 3) {
    if (!/^\d{10}$/.test(answer)) {
      input.value = "";
      botReply("❌ Mobile number must be exactly 10 digits.");
      return;
    }
  }

  // EMAIL VALIDATION
  if (step === 4) {
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(answer)) {
      input.value = "";
      botReply("❌ Email must be a valid Gmail address (example@gmail.com)");
      return;
    }
  }

  // ADDRESS VALIDATION
  if (step === 5) {
    // must contain at least 2 words
    if (answer.split(" ").length < 2) {
      input.value = "";
      botReply("❌ Address must contain meaningful words (e.g. street + city)");
      return;
    }

    // should not be random letters like "abc"
    if (!/[a-zA-Z]{3,}/.test(answer)) {
      input.value = "";
      botReply("❌ Enter a proper address");
      return;
    }
  }

  formData[keys[step]] = answer;
  input.value = "";
  step++;

  if (step < questions.length) {
    botReply(questions[step]);
  } else {
    botReply("✅ All details collected. Click Generate Form.");
  }
}

async function generateForm() {
  if (step < questions.length) {
    botReply("❌ Please answer all questions first.");
    return;
  }

  resultBox.innerHTML = "";
  botReply("Generating PDF...");

  try {
    const res = await fetch("http://localhost:5000/api/form/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.success) {
      resultBox.innerHTML = `
        <a class="download-btn" href="${data.downloadUrl}" target="_blank">
          Download PDF
        </a>
      `;
      botReply("✅ PDF ready. Click Download PDF.");
    } else {
      botReply("❌ PDF generation failed.");
    }
  } catch (error) {
    console.log(error);
    botReply("❌ Backend not connected. Start backend using node server.js");
  }
}
