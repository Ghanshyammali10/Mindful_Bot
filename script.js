document.addEventListener("DOMContentLoaded", function () {
  // Theme toggle functionality
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;
  const appContainer = document.querySelector(".app-container");

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark-theme");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    themeToggle.classList.add("active");
  }

  // Theme toggle event listener
  themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-theme");
    const isDark = body.classList.contains("dark-theme");
    
    // Add transition class for smooth theme change
    appContainer.classList.add("theme-transition");
    
    // Update icon and save preference
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    themeToggle.classList.toggle("active");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    
    // Remove transition class after animation
    setTimeout(() => {
      appContainer.classList.remove("theme-transition");
    }, 300);
  });

  // View toggle functionality
  const toggleViewBtn = document.getElementById("toggleViewBtn");
  const sidePanel = document.querySelector(".side-panel");
  const container = document.querySelector(".container");

  // Check for saved view preference
  const savedView = localStorage.getItem("view");
  if (savedView === "full-chat") {
    appContainer.classList.add("full-chat-view");
    toggleViewBtn.innerHTML = '<i class="fas fa-compress"></i>';
  } else if (savedView === "full-helpline") {
    appContainer.classList.add("full-helpline-view");
    toggleViewBtn.innerHTML = '<i class="fas fa-compress"></i>';
  }

  // View toggle event listener
  toggleViewBtn.addEventListener("click", () => {
    if (appContainer.classList.contains("full-chat-view")) {
      // Switch to full helpline view
      appContainer.classList.remove("full-chat-view");
      appContainer.classList.add("full-helpline-view");
      toggleViewBtn.innerHTML = '<i class="fas fa-compress"></i>';
      localStorage.setItem("view", "full-helpline");
    } else if (appContainer.classList.contains("full-helpline-view")) {
      // Switch back to default view
      appContainer.classList.remove("full-helpline-view");
      toggleViewBtn.innerHTML = '<i class="fas fa-expand"></i>';
      localStorage.setItem("view", "default");
    } else {
      // Switch to full chat view
      appContainer.classList.add("full-chat-view");
      toggleViewBtn.innerHTML = '<i class="fas fa-compress"></i>';
      localStorage.setItem("view", "full-chat");
    }
  });

  // DOM Elements
  const chatBox = document.getElementById("chatBox");
  const userInput = document.getElementById("userInput");
  const sendButton = document.getElementById("sendButton");
  const typingIndicator = document.getElementById("typingIndicator");

  // Mental health scores
  let scores = {
    depression: 0,
    anxiety: 0,
    stress: 0,
  };

  // Keywords for scoring
  const keywords = {
    depression: [
      "sad",
      "hopeless",
      "tired",
      "exhausted",
      "empty",
      "lonely",
      "unmotivated",
      "worthless",
      "negative",
      "down",
      "depressed",
      "unhappy",
      "miserable",
      "crying",
      "tearful",
      "numb",
      "isolated",
      "helpless",
      "guilty",
      "ashamed",
      "suicidal",
      "meaningless",
      "apathetic",
      "withdrawn",
      "fatigued",
      "insomnia",
      "oversleeping",
      "appetite loss",
      "weight changes",
      "self-hatred",
      "difficulty concentrating",
    ],
    anxiety: [
      "worried",
      "anxious",
      "nervous",
      "panic",
      "fear",
      "scared",
      "restless",
      "tense",
      "overthinking",
      "racing",
      "stress",
      "afraid",
      "uneasy",
      "dread",
      "apprehensive",
      "jittery",
      "on edge",
      "hypervigilant",
      "sweating",
      "trembling",
      "heart racing",
      "chest tight",
      "breathing fast",
      "dizzy",
      "nauseous",
      "avoiding",
      "catastrophizing",
      "paranoid",
      "perfectionist",
      "compulsive",
    ],
    stress: [
      "overwhelmed",
      "pressure",
      "burden",
      "strain",
      "tension",
      "overload",
      "busy",
      "rushed",
      "deadline",
      "workload",
      "exhausted",
      "burnout",
      "frustrated",
      "irritated",
    ],
  };

  // Recommendations based on highest score
  const recommendations = {
    depression: [
      "Try to go for a short walk outside daily, even just for 10 minutes",
      "Keep a journal to track your thoughts and feelings",
      "Reach out to a friend or family member you trust",
      "Consider speaking with a mental health professional",
      "Set small, achievable goals each day",
    ],
    anxiety: [
      "Practice deep breathing exercises (4-7-8 technique)",
      "Try meditation or mindfulness apps",
      "Reduce caffeine and alcohol consumption",
      "Create a worry journal to externalize your thoughts",
      "Consider limiting social media and news consumption",
    ],
    stress: [
      "Practice time management and prioritization",
      "Ensure you're getting enough sleep (7-8 hours)",
      "Take short breaks throughout your day",
      "Try progressive muscle relaxation techniques",
      "Engage in physical activity or exercise regularly",
    ],
  };

  // Questions for the conversation flow
  const questions = [
    "Hi there! I'm MindfulBot, your mental wellness companion. I'd like to understand how you're feeling. Could you tell me what brings you here today?",
    "I understand. How has your sleep been lately? Are you having trouble falling asleep, staying asleep, or sleeping too much?",
    "Thank you for sharing. Have you noticed any changes in your appetite or daily routines recently?",
    "How would you describe your energy levels and motivation throughout the day? Do you find it hard to get started or complete tasks?",
    "I'd like to understand your emotional state better. How would you describe your mood most days? Do you experience frequent mood swings?",
    "Have you been feeling overwhelmed or under pressure lately? What situations trigger these feelings?",
    "How do these feelings affect your daily activities, work, or relationships?",
    "When you're feeling this way, what coping strategies do you usually use?",
    "Have you noticed any physical symptoms like headaches, muscle tension, or changes in breathing when you're stressed?",
    "Thank you for being so open. One last question: Have you talked to anyone else about how you're feeling?",
  ];

  let currentQuestion = 0;
  let conversationEnded = false;

  // Add event listeners
  sendButton.addEventListener("click", handleUserInput);
  userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      handleUserInput();
    }
  });

  // Start the conversation
  setTimeout(() => {
    addBotMessage(questions[currentQuestion]);
    currentQuestion++;
  }, 1000);

  let isAskingForMoreDetails = false;
  let previousQuestion = "";

  // Handle user input
  function handleUserInput() {
    const message = userInput.value.trim();
    if (message === "") return;

    // Add user message to chat
    addUserMessage(message);
    userInput.value = "";

    // Check for concerning keywords
    const concerningKeywords = [
      "suicide",
      "kill",
      "die",
      "end it",
      "give up",
      "worthless",
    ];
    const hasConcerningContent = concerningKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword)
    );

    if (hasConcerningContent) {
      showTypingIndicator();
      setTimeout(() => {
        hideTypingIndicator();
        addBotMessage(
          "I notice you've mentioned some concerning thoughts. Please remember that you're not alone. " +
            "If you're having thoughts of self-harm, please reach out to a mental health professional or contact a crisis helpline immediately. " +
            "Would you like me to provide some crisis helpline numbers?"
        );
      }, getRandomDelay());
      return;
    }

    // Check for numeric or very short inputs
    const isNumeric = /^\d+$/.test(message.replace(/\s/g, ""));
    const words = message.split(/\s+/).filter((word) => word.length > 0);

    if ((isNumeric || words.length < 2) && !isAskingForMoreDetails) {
      isAskingForMoreDetails = true;
      previousQuestion = questions[currentQuestion - 1];
      showTypingIndicator();
      setTimeout(() => {
        hideTypingIndicator();
        addBotMessage(
          "I notice your response is quite brief. Could you tell me more about how you're feeling? " +
            "The more details you share, the better I can understand and support you."
        );
      }, getRandomDelay());
      return;
    } else if ((isNumeric || words.length < 2) && isAskingForMoreDetails) {
      showTypingIndicator();
      setTimeout(() => {
        hideTypingIndicator();
        addBotMessage(previousQuestion);
      }, getRandomDelay());
      return;
    }

    // Reset the flag since we got a detailed response
    isAskingForMoreDetails = false;
    previousQuestion = "";

    // Analyze message for keywords
    analyzeMessage(message);

    // Check if conversation should end
    if (currentQuestion >= questions.length) {
      if (!conversationEnded) {
        showTypingIndicator();
        setTimeout(() => {
          hideTypingIndicator();
          endConversation();
        }, getRandomDelay());
      }
    } else {
      // Continue with next question
      showTypingIndicator();
      setTimeout(() => {
        hideTypingIndicator();
        addBotMessage(questions[currentQuestion]);
        currentQuestion++;
      }, getRandomDelay());
    }
  }

  // Analyze user message for keywords
  function analyzeMessage(message) {
    const lowerMessage = message.toLowerCase();

    // Check if input is mostly numeric
    if (/^\d+$/.test(message.replace(/\s/g, ""))) {
      return; // Skip scoring for numeric inputs
    }

    // Minimum word count check
    const words = lowerMessage.split(/\s+/).filter((word) => word.length > 0);
    if (words.length < 2) {
      return; // Skip scoring for very short responses
    }

    // Enhanced keyword matching with word boundary and intensity check
    const matchKeyword = (text, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      if (regex.test(text)) {
        // Check for intensity modifiers
        const intensifiers = [
          "very",
          "extremely",
          "severely",
          "deeply",
          "constantly",
          "always",
        ];
        const diminishers = [
          "slightly",
          "somewhat",
          "occasionally",
          "sometimes",
          "a bit",
        ];

        let score = 1; // Base score

        // Check for intensifiers
        intensifiers.forEach((intensifier) => {
          if (
            new RegExp(`\\b${intensifier}\\s+${keyword}\\b`, "i").test(text)
          ) {
            score = 2; // Double score for intense expressions
          }
        });

        // Check for diminishers
        diminishers.forEach((diminisher) => {
          if (new RegExp(`\\b${diminisher}\\s+${keyword}\\b`, "i").test(text)) {
            score = 0.5; // Half score for mild expressions
          }
        });

        return score;
      }
      return 0;
    };

    // Check for depression keywords with intensity scoring
    keywords.depression.forEach((keyword) => {
      const score = matchKeyword(lowerMessage, keyword);
      scores.depression += score;
    });

    // Check for anxiety keywords with intensity scoring
    keywords.anxiety.forEach((keyword) => {
      const score = matchKeyword(lowerMessage, keyword);
      scores.anxiety += score;
    });

    // Check for stress keywords with intensity scoring
    keywords.stress.forEach((keyword) => {
      const score = matchKeyword(lowerMessage, keyword);
      scores.stress += score;
    });

    // Context analysis for compound expressions
    const negators = [
      "not",
      "don't",
      "doesn't",
      "haven't",
      "hasn't",
      "wouldn't",
      "couldn't",
      "shouldn't",
    ];
    negators.forEach((negator) => {
      const regex = new RegExp(
        `\\b${negator}\\s+.*?\\b(${Object.values(keywords)
          .flat()
          .join("|")})\\b`,
        "i"
      );
      if (regex.test(lowerMessage)) {
        // Reduce scores for negated expressions
        scores.depression *= 0.5;
        scores.anxiety *= 0.5;
        scores.stress *= 0.5;
      }
    });
  }

  // End conversation and show results
  function endConversation() {
    conversationEnded = true;

    // Calculate total score
    const totalScore = scores.depression + scores.anxiety + scores.stress;

    // If no scores, set default values
    if (totalScore === 0) {
      scores.depression = 1;
      scores.anxiety = 1;
      scores.stress = 1;
    }

    // Calculate percentages
    const total = scores.depression + scores.anxiety + scores.stress;
    const depressionPercent = Math.round((scores.depression / total) * 100);
    const anxietyPercent = Math.round((scores.anxiety / total) * 100);
    const stressPercent = Math.round((scores.stress / total) * 100);

    // Determine highest score
    let highestCategory = "depression";
    if (scores.anxiety > scores.depression && scores.anxiety > scores.stress) {
      highestCategory = "anxiety";
    } else if (
      scores.stress > scores.depression &&
      scores.stress > scores.anxiety
    ) {
      highestCategory = "stress";
    }

    // Get 3 random recommendations for the highest category
    const shuffledRecommendations = [...recommendations[highestCategory]].sort(
      () => 0.5 - Math.random()
    );
    const selectedRecommendations = shuffledRecommendations.slice(0, 3);

    // Create assessment result HTML
    let resultHTML = `
            <div class="assessment-result">
                <h3>🧠 Assessment Result:</h3>
                
                <div class="score-label">
                    <span>Depression</span>
                    <span>${depressionPercent}%</span>
                </div>
                <div class="score-bar">
                    <div class="score-fill depression-fill" style="width: ${depressionPercent}%"></div>
                </div>
                
                <div class="score-label">
                    <span>Anxiety</span>
                    <span>${anxietyPercent}%</span>
                </div>
                <div class="score-bar">
                    <div class="score-fill anxiety-fill" style="width: ${anxietyPercent}%"></div>
                </div>
                
                <div class="score-label">
                    <span>Stress</span>
                    <span>${stressPercent}%</span>
                </div>
                <div class="score-bar">
                    <div class="score-fill stress-fill" style="width: ${stressPercent}%"></div>
                </div>
                
                <div class="recommendations">
                    <h4>✅ Personalized Tips:</h4>
                    <ul>
                        ${selectedRecommendations
                          .map((rec) => `<li>${rec}</li>`)
                          .join("")}
                    </ul>
                </div>
                
                <p style="margin-top: 15px; font-size: 0.8rem; color: #666;">
                    Note: This is a simulated assessment and not a professional diagnosis. 
                    If you're experiencing mental health concerns, please consult with a healthcare professional.
                </p>
            </div>
        `;

    // Add assessment result to chat
    addBotMessage(
      `Based on our conversation, I've prepared a brief assessment of your current mental wellness. Remember, this is not a professional diagnosis, just a reflection of our chat.`
    );

    setTimeout(() => {
      showTypingIndicator();
      setTimeout(() => {
        hideTypingIndicator();
        const messageDiv = document.createElement("div");
        messageDiv.className = "message bot-message";
        const contentDiv = document.createElement("div");
        contentDiv.className = "message-content";
        contentDiv.innerHTML = resultHTML;
        messageDiv.appendChild(contentDiv);
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        // Add final message
        setTimeout(() => {
          showTypingIndicator();
          setTimeout(() => {
            hideTypingIndicator();
            addBotMessage(
              "Thank you for chatting with me today. Remember, it's important to take care of your mental health. If you'd like to chat again, just refresh the page."
            );
          }, getRandomDelay());
        }, 1000);
      }, getRandomDelay());
    }, 1000);
  }

  // Add bot message to chat
  function addBotMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message bot-message";
    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    contentDiv.textContent = message;
    messageDiv.appendChild(contentDiv);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Add user message to chat
  function addUserMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message user-message";
    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    contentDiv.textContent = message;
    messageDiv.appendChild(contentDiv);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Show typing indicator
  function showTypingIndicator() {
    typingIndicator.style.display = "flex";
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Hide typing indicator
  function hideTypingIndicator() {
    typingIndicator.style.display = "none";
  }

  // Get random delay between 800ms and 1500ms
  function getRandomDelay() {
    return Math.floor(Math.random() * 700) + 800;
  }

  // Voice Recognition
  const micButton = document.getElementById('micButton');
  let recognition = null;

  // Check if browser supports speech recognition
  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      micButton.classList.add('active', 'recording');
      userInput.placeholder = 'Listening...';
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      userInput.value = transcript;
      userInput.placeholder = 'Type your response here...';
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      micButton.classList.remove('active', 'recording');
      userInput.placeholder = 'Type your response here...';
    };

    recognition.onend = () => {
      micButton.classList.remove('active', 'recording');
      userInput.placeholder = 'Type your response here...';
    };

    micButton.addEventListener('click', () => {
      if (micButton.classList.contains('active')) {
        recognition.stop();
      } else {
        recognition.start();
      }
    });
  } else {
    // Hide mic button if speech recognition is not supported
    micButton.style.display = 'none';
  }
});
