 const chatbox = document.getElementById('chatbox');
    const spinner = document.getElementById('spinner');
    const synth = window.speechSynthesis;
    const username = localStorage.getItem('bee_username');
    const chatHistory = JSON.parse(localStorage.getItem('bee_chat') || "[]");

    function speak(text) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      synth.speak(utter);
    }

    function playAudio(src) {
      const audio = new Audio(src);
      audio.play();
    }

    function addMessage(sender, message, save = true) {
      const msg = document.createElement('div');
      msg.className = 'chat ' + sender;
      const name = sender === 'user' ? localStorage.getItem('bee_username') || "You" : "Bot";
      msg.innerText = name + ": " + message;
      chatbox.appendChild(msg);
      chatbox.scrollTop = chatbox.scrollHeight;

      if (save) {
        chatHistory.push({ sender, message });
        localStorage.setItem('bee_chat', JSON.stringify(chatHistory));
      }
    }

    function showSpinner(show) {
      spinner.style.display = show ? "block" : "none";
    }

    function typeMessage(text, callback) {
      playAudio("sounds/buzz.mp3");
      showSpinner(true);
      const msg = document.createElement('div');
      msg.className = 'chat bot';
      chatbox.appendChild(msg);
      let i = 0;
      const typing = setInterval(() => {
        if (i < text.length) {
          msg.innerText = "Bot: " + text.substring(0, i + 1);
          chatbox.scrollTop = chatbox.scrollHeight;
          i++;
        } else {
          clearInterval(typing);
          showSpinner(false);
          chatHistory.push({ sender: 'bot', message: text });
          localStorage.setItem('bee_chat', JSON.stringify(chatHistory));
          if (callback) callback();
        }
      }, 50);
    }

    function botResponse(input) {
      let response = "I didn't understand that.";
      let audioSrc = "";

      if (/time/i.test(input)) {
        const now = new Date();
        response = "The current time is " + now.toLocaleTimeString();
        audioSrc = "sounds/time.mp3";
      } else if (/joke/i.test(input)) {
        response = "Why did the bee get married? Because he found his honey!";
        audioSrc = "sounds/joke.mp3";
      } else if (/name/i.test(input)) {
        response = "I'm Bumble Bee Assistant, buzzing to help you!";
        audioSrc = "sounds/name.mp3";
      } else if (/google/i.test(input)) {
        response = "Opening Google...";
        audioSrc = "sounds/google.mp3";
        playAudio(audioSrc);
        speak(response);
        typeMessage(response);
        setTimeout(() => window.open("https://google.com", "_blank"), 1500);
        return;
      }

      playAudio(audioSrc);
      typeMessage(response, () => speak(response));
    }

    function sendMessage() {
      const input = document.getElementById('userInput');
      const text = input.value.trim();
      if (!text) return;
      addMessage("user", text);
      botResponse(text);
      input.value = '';
    }

    function quickCommand(text) {
      document.getElementById('userInput').value = text;
      sendMessage();
    }

    function startListening() {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'en-US';
      recognition.start();
      recognition.onresult = (event) => {
        const voiceText = event.results[0][0].transcript;
        document.getElementById('userInput').value = voiceText;
        sendMessage();
      };
    }

    function exportChatPDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      let y = 10;
      doc.setFontSize(12);
      chatHistory.forEach((el) => {
        const name = el.sender === "user" ? localStorage.getItem('bee_username') || "You" : "Bot";
        doc.text(`${name}: ${el.message}`, 10, y);
        y += 10;
        if (y > 280) {
          doc.addPage(); y = 10;
        }
      });
      doc.save("BumbleBee_Chat.pdf");
      showPopup("✅ Chat history downloaded successfully!");
    }

    function clearChat() {
      chatbox.innerHTML = '<img src="https://i.postimg.cc/SsV4Bphh/spinner-bee.gif" class="spinner" id="spinner" style="display:none">';
      localStorage.setItem('bee_chat', "[]");
    }

    function resetAssistant() {
      clearChat();
      localStorage.removeItem('bee_chat');
      localStorage.removeItem('bee_username');
      location.reload();
    }

    function showPopup(message) {
      const popup = document.getElementById("popupMsg");
      popup.innerText = message;
      popup.style.display = "block";
      setTimeout(() => {
        popup.style.display = "none";
      }, 2500);
    }

    function toggleTheme() {
      const isDark = document.body.style.background === 'black';
      if (!isDark) {
        document.body.style.background = 'black';
        document.body.style.color = 'white';
        document.querySelector('.chatbox').style.background = '#222';
        document.querySelector('.chatbox').style.color = '#fff';
        document.querySelector('.theme-toggle').innerText = '🌚';
      } else {
        document.body.style.background = '#fdf6e3';
        document.body.style.color = '#333';
        document.querySelector('.chatbox').style.background = '#fffbe6';
        document.querySelector('.chatbox').style.color = '#000';
        document.querySelector('.theme-toggle').innerText = '🌞';
      }
    }

    function startAssistant() {
      const name = document.getElementById('usernameInput').value.trim();
      if (!name) return alert("Please enter your name");
      localStorage.setItem('bee_username', name);
      document.getElementById('displayName').innerText = name;
      document.getElementById('namePopup').style.display = 'none';
      document.getElementById('assistantContainer').style.display = 'block';
      chatHistory.forEach(msg => addMessage(msg.sender, msg.message, false));
    }

    // Auto-start if username exists
    window.onload = () => {
      if (username) {
        document.getElementById('displayName').innerText = username;
        document.getElementById('namePopup').style.display = 'none';
        document.getElementById('assistantContainer').style.display = 'block';
        chatHistory.forEach(msg => addMessage(msg.sender, msg.message, false));
      }
    };