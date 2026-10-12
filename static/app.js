const $ = id => document.getElementById(id);
const chat = $("chat"), input = $("message"), send = $("send"), mode = $("mode");
let history = [], entries = 1, selectedFolder = "", recognition = null, listening = false;
let toastTimer;

function toast(message) {
  const el = $("toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 4200);
}
function syncMode() {
  const online = mode.value === "online";
  $("mode-readout").textContent = online ? "ONLINE" : "LOCAL";
}
mode.addEventListener("change", syncMode); syncMode();

function addMessage(role, text, tag = "") {
  const article = document.createElement("article"); article.className = `message ${role}`;
  const avatar = document.createElement("div"); avatar.className = "avatar"; avatar.textContent = role === "assistant" ? "J" : "U";
  const bubble = document.createElement("div"); bubble.className = "bubble";
  const speaker = document.createElement("div"); speaker.className = "speaker";
  speaker.textContent = role === "assistant" ? `J.A.R.V.I.S. • ${tag || "ASSISTANT"}` : "YOU • USER";
  const p = document.createElement("p"); p.textContent = text;
  bubble.append(speaker, p); article.append(avatar, bubble); chat.append(article); chat.scrollTop = chat.scrollHeight;
  entries++; $("message-count").textContent = `${String(entries).padStart(2,"0")} ENTRIES`; return p;
}
function speak(text) {
  if (!$("speak").checked || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.slice(0,4000));
  utterance.rate = 1; utterance.pitch = 0.95; utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}
async function api(url, options = {}) {
  const response = await fetch(url, {headers: {"Content-Type":"application/json"}, ...options});
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || `Request failed (${response.status})`);
  return data;
}
async function transmit(textOverride = null) {
  const message = (textOverride ?? input.value).trim();
  if (!message || send.disabled) return;
  const selectedMode = mode.value;
  addMessage("user", message); input.value = ""; input.style.height = "auto";
  send.disabled = true; send.querySelector("span").textContent = "PROCESSING";
  const pending = addMessage("assistant", "Processing request…", selectedMode.toUpperCase());
  try {
    const data = await api("/api/chat", {method:"POST", body:JSON.stringify({message,mode:selectedMode,history})});
    pending.textContent = data.reply;
    history.push({role:"user",content:message},{role:"assistant",content:data.reply}); history = history.slice(-12);
    $("link-readout").textContent = selectedMode === "local" ? "OLLAMA LINK OK" : "API LINK OK";
    speak(data.reply);
  } catch (e) { pending.textContent = `Connection notice: ${e.message}`; pending.style.color = "#ffabb6"; $("link-readout").textContent = "CHECK CONNECTION"; }
  finally { send.disabled = false; send.querySelector("span").textContent = "TRANSMIT"; input.focus(); chat.scrollTop = chat.scrollHeight; }
}
send.addEventListener("click", () => transmit());
input.addEventListener("keydown", e => {if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();transmit();}});
input.addEventListener("input", () => {input.style.height="auto";input.style.height=`${Math.min(input.scrollHeight,150)}px`;});

// Browser speech recognition + browser-native speech synthesis. Recognition availability varies.
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition(); recognition.lang = "en-US"; recognition.interimResults = true; recognition.continuous = false;
  recognition.onstart = () => {listening=true;$("voice-status").textContent="LISTENING…";$("voice").textContent="◉ STOP VOICE";document.querySelector(".orb-wrap").classList.add("listening");};
  recognition.onresult = event => {
    let finalText = "";
    for (let i=event.resultIndex;i<event.results.length;i++) if(event.results[i].isFinal) finalText += event.results[i][0].transcript;
    if(finalText.trim()){ $("voice-status").textContent="PROCESSING SPEECH"; transmit(finalText.trim()); }
  };
  recognition.onerror = event => { $("voice-status").textContent=`VOICE: ${event.error.toUpperCase()}`; toast(`Voice input issue: ${event.error}. You can type instead.`); };
  recognition.onend = () => {listening=false;$("voice").textContent="◉ START VOICE";$("voice-status").textContent="VOICE STANDBY";document.querySelector(".orb-wrap").classList.remove("listening");};
} else {
  $("voice-status").textContent="VOICE INPUT NOT SUPPORTED";
  $("voice").title="Try the latest desktop version of Edge or Chrome.";
}
$("voice").addEventListener("click", () => {
  if(!recognition){toast("Speech recognition is not available in this browser. Try current Microsoft Edge or Google Chrome.");return;}
  if(listening) recognition.stop();
  else {try{window.speechSynthesis?.cancel();recognition.start();}catch(e){toast("Could not start the microphone. Check browser permissions.");}}
});

// App launching is allowlisted server-side and requires explicit confirmation here.
document.querySelectorAll("[data-app]").forEach(button => button.addEventListener("click", async () => {
  const appId = button.dataset.app, label = button.textContent;
  if(!confirm(`Allow J.A.R.V.I.S. to launch ${label} on this PC?`)) return;
  try {const result=await api("/api/launch",{method:"POST",body:JSON.stringify({app_id:appId})});toast(result.message);}
  catch(e){toast(e.message);}
}));

async function loadMemories() {
  try {
    const memories = await api("/api/memories"); $("memory-readout").textContent=`${memories.length} SAVED`;
    const box=$("memories"); box.replaceChildren();
    if(!memories.length){box.textContent="No saved memories.";return;}
    memories.forEach(m=>{
      const item=document.createElement("div");item.className="memory-item";
      const content=document.createElement("div");content.textContent=m.content;
      const del=document.createElement("button");del.className="tool-btn";del.textContent="DELETE MEMORY";
      del.addEventListener("click",async()=>{if(!confirm("Delete this saved memory?"))return;try{await api(`/api/memories/${m.id}`,{method:"DELETE"});loadMemories();toast("Memory deleted.");}catch(e){toast(e.message);}});
      item.append(content,del);box.append(item);
    });
  } catch(e){toast(e.message);}
}
$("save-memory").addEventListener("click", async()=>{
  const content=$("memory-input").value.trim();if(!content){toast("Type the fact or preference you want to save first.");return;}
  if(!confirm("Save this text as a persistent J.A.R.V.I.S. memory on this PC? Avoid passwords, API keys, or sensitive information."))return;
  try{await api("/api/memories",{method:"POST",body:JSON.stringify({content})});$("memory-input").value="";await loadMemories();toast("Memory saved on this PC.");}
  catch(e){toast(e.message);}
});

async function refreshStatus() {
  try {
    const s=await api("/api/status");$("link-readout").textContent=s.online_configured?"API READY":"API OPTIONAL";
    selectedFolder=s.selected_folder||"";renderFolder();
  } catch(e){$("link-readout").textContent="SERVER OFFLINE";}
}
function renderFolder(){ $("folder-label").innerHTML="";const p=document.createElement("div");p.className="folder-path";p.textContent=selectedFolder||"No folder selected. Choose one before searching."; $("folder-label").append(p); }
$("pick-folder").addEventListener("click",async()=>{
  try{const result=await api("/api/pick-folder",{method:"POST",body:"{}"});if(!result.cancelled){selectedFolder=result.path;renderFolder();toast("Folder selected. Search is limited to this folder.");}}
  catch(e){toast(e.message);}
});
$("search-files").addEventListener("click",async()=>{
  const query=$("file-query").value.trim();if(!query){toast("Enter a search term first.");return;}
  const box=$("file-results");box.textContent="Searching selected folder…";
  try{
    const result=await api("/api/files/search",{method:"POST",body:JSON.stringify({query})});box.replaceChildren();
    if(!result.matches.length){box.textContent="No matches found.";return;}
    result.matches.forEach(file=>{
      const item=document.createElement("div");item.className="file-item";
      const name=document.createElement("div");name.className="file-name";name.textContent=file.name;
      const preview=document.createElement("p");preview.textContent=file.preview||"(No preview)";
      const summary=document.createElement("button");summary.className="tool-btn";summary.textContent="SUMMARIZE";
      summary.addEventListener("click",async()=>{
        if(!confirm(`Send the text contents of "${file.name}" to the selected ${mode.value} AI for a summary?`))return;
        summary.disabled=true;summary.textContent="SUMMARIZING…";
        try{const r=await api("/api/files/summarize",{method:"POST",body:JSON.stringify({path:file.path,mode:mode.value})});addMessage("assistant",`${file.name}\n\n${r.summary}`,"FILE SUMMARY");}
        catch(e){toast(e.message);}finally{summary.disabled=false;summary.textContent="SUMMARIZE";}
      });
      item.append(name,preview,summary);box.append(item);
    });
    if(result.truncated)toast("Search scan limit reached; narrow your search term or choose a smaller folder.");
  }catch(e){box.textContent=e.message;}
});

// Browser screen picker requires the user to choose a tab/window/screen. We capture one still frame only.
$("screenshot").addEventListener("click",async()=>{
  if(!confirm("J.A.R.V.I.S. will ask you to choose a screen or window. If you continue, one still screenshot will be sent to the online AI for analysis. Continue?"))return;
  if(!navigator.mediaDevices?.getDisplayMedia){toast("Screen sharing is not supported in this browser.");return;}
  let stream;
  try{
    stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:1},audio:false});
    const track=stream.getVideoTracks()[0];const settings=track.getSettings();
    const video=document.createElement("video");video.srcObject=stream;video.muted=true;video.playsInline=true;
    await video.play();await new Promise(resolve=>setTimeout(resolve,350));
    const canvas=document.createElement("canvas");canvas.width=Math.min(video.videoWidth||1280,1600);
    canvas.height=Math.round(canvas.width*(video.videoHeight||720)/(video.videoWidth||1280));
    canvas.getContext("2d").drawImage(video,0,0,canvas.width,canvas.height);
    const imageData=canvas.toDataURL("image/jpeg",0.78);stream.getTracks().forEach(t=>t.stop());stream=null;
    const question=$("screen-question").value.trim()||"Describe what is visible and help me with it.";
    const answer=await api("/api/screenshot/analyze",{method:"POST",body:JSON.stringify({image_data_url:imageData,question})});
    addMessage("assistant",answer.reply,"SCREEN ANALYSIS");speak(answer.reply);
  }catch(e){toast(`Screenshot analysis: ${e.message}`);}
  finally{if(stream)stream.getTracks().forEach(t=>t.stop());}
});

loadMemories();refreshStatus();
