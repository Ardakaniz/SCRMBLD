let audioStruct = {
    ctx: null,
    listener: null,

    swapSound: null,
    rollSound: null,
    musicBackgrounds: [],
    musicLayers: [],
}


function initSound(id) {
    const soundEl = document.getElementById(id);
    const src = audioStruct.ctx.createMediaElementSource(soundEl);
    const pan = audioStruct.ctx.createStereoPanner();
    src.connect(pan);
    pan.connect(audioStruct.ctx.destination);
    return { el: soundEl, src: src, pan: pan.pan };
}

function initMusic(id) {
    const ctx = audioStruct.ctx;
    const src = ctx.createBufferSource();
    const lpfilter = ctx.createBiquadFilter();
    const pan = audioStruct.ctx.createStereoPanner();
    const gain = ctx.createGain();
    src.connect(lpfilter);
    lpfilter.connect(pan);
    pan.connect(gain);
    gain.connect(ctx.destination);

    lpfilter.type = "lowpass";
    lpfilter.frequency.setValueAtTime(20000, ctx.currentTime);

    let music = { el: null, src: src, gain: gain.gain, pan: pan.pan, lpfilter: lpfilter };

    music.gain.value = 0;
    music.src.loop = true;

    if (id < 0)
        audioStruct.musicBackgrounds.push(music);
    else
        audioStruct.musicLayers.push(music);

    fetch(`assets/music/${id}.mp3`)
        .then(r => r.arrayBuffer())
        .then(buf => audioStruct.ctx.decodeAudioData(buf))
        .then(buf => {
            if (id < 0)
                audioStruct.musicBackgrounds[Math.abs(id)-1].src.buffer = buf;
            else
                audioStruct.musicLayers[id].src.buffer = buf; 
        })
        .then(_ => {
            // console.log(`Loaded music ${id}`);
            const music = id < 0 ? audioStruct.musicBackgrounds[Math.abs(id)-1] : audioStruct.musicLayers[id];
            music.src.start();
            music.gain.setValueAtTime(0, audioStruct.ctx.currentTime);

            if (id === -2)
                music.pan.setValueAtTime(0.8, audioStruct.ctx.currentTime);
            else
                music.pan.setValueAtTime(0., audioStruct.ctx.currentTime);
        });
}

function initAudio() {
    audioStruct.ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioStruct.listener = audioStruct.ctx.listener;

    audioStruct.swapSound = initSound("swapSound", true);
    audioStruct.swapSound.pan.setValueAtTime(-0.75, audioStruct.ctx.currentTime);

    audioStruct.rollSound = initSound("rollSound", true);
    audioStruct.rollSound.pan.setValueAtTime(+0.75, audioStruct.ctx.currentTime);

    for (let i = -2; i <= 8; i++)
        initMusic(i);

    const arps = audioStruct.musicBackgrounds[1];
    arps.lpfilter.frequency.setValueAtTime(0, audioStruct.ctx.currentTime);
    setInterval(_ => {
        const music = audioStruct.musicBackgrounds[1]; 
        const newTarget = (music.pan.value < 0 ? +0.8 : -0.8);
        music.pan.setTargetAtTime(newTarget, audioStruct.ctx.currentTime + 5, 2);
    }, 6000);
}

function startMusics() {
    if (phraseNum !== 0 && paraphNum !== 0)
        return;
    audioStruct.musicLayers[0].gain.setTargetAtTime(1.75, audioStruct.ctx.currentTime + 0.5, 0.5);
    audioStruct.musicBackgrounds[0].gain.setTargetAtTime(1.75, audioStruct.ctx.currentTime + 0.5, 0.5);
    audioStruct.musicBackgrounds[1].gain.setTargetAtTime(0.25, audioStruct.ctx.currentTime + 0.5, 0.5);
}

// paraph[phrase]
let content = 
    [["hey?",
    "hello?",
    "can you hear me?"],

    ["i went there",
    "tried to sleep",
    "devil sang",
    "can you fix me?"],

    ["not sure if i was awake",
    "dizzy or",
    "SCRAMBLED",],

    ["could my brain",
    "be wired",
    "the other way around?"],

    ["no devil lived on",
    "lived on decaf",
    "faced no devil"],

    ["was it a cat I saw?",
    "pspspsps but it",
    "ran away",
    "won't lovers revolt now?"],

    ["well",
    "at least i can",
    "move on"]]

let paraphNum = 0
let phraseNum = 0;
let prevMusicLayerNum = null;

let textRef = content[paraphNum][phraseNum];
let wordsRef = textRef.split(" "); // La phrase de référence
let words = wordsRef.map(shuffleWord); // La phrase shuffled

let numRightAnswers = 0; // Nombre de mots bons / phrase
let numWords = words.length; // Nom de mots dans la phrase

let nbClick = 0;
let nbSwap = 0;
let nbRoll = 0;

let totalTime = 0;

let ref = document.getElementById("ref");
let scrambled = document.getElementById("scrambled");

let reversed = false;
let codeSwap = 0;
let codeRoll = 2;


function spanClicked(e) {
    e.preventDefault();
    nbClick ++;

    if (nbClick == 1) {
        timer();
    }

    let target = e.target;

    if (target.classList.contains("begin-letter"))
        target = target.parentElement;

    let word = target.innerText;

    if (wordsRef[target.id.slice(10)] === word) {
        return;
    }

    // Clic gauche
    if (e.button === codeSwap) {
        startMusics();

        audioStruct.swapSound.el.play();
        word = word[1] + word[0] + word.slice(2);
        nbSwap++;
    }

    // Clic droit
    else if (e.button === codeRoll) {
        startMusics();

        audioStruct.rollSound.el.play();
        word = word[word.length-1] + word.slice(0, -1);

        // DEBUG : clic droit pour transformer le mot en mot bon
        // word = wordsRef[target.id.slice(10)];
        nbRoll++;
    }

    target.innerHTML = "<span class='begin-letter'>" + word.slice(0, 2) + "</span>" + word.slice(2);

    // Mot bon
    if (wordsRef[target.id.slice(10)] === word) {
        target.classList.add("rightanswer");
        numRightAnswers++;
    }

    // Phrase bonne 
    if (numRightAnswers === numWords) {
        // FIN
        if(paraphNum == content.length-1 && phraseNum == content[paraphNum].length-1) {
            ref.style.display = "none";
            document.querySelector("body").style.animation = "none";
            document.querySelector(".download").style.display = "block";
            clearInterval(interval);
        }

        // MUSIC CROSS FADE
        if (prevMusicLayerNum)
            audioStruct.musicLayers[prevMusicLayerNum].gain.setTargetAtTime(0, audioStruct.ctx.currentTime + 1.5, 0.5);
        audioStruct.musicLayers[paraphNum+phraseNum].gain.setTargetAtTime(1.8, audioStruct.ctx.currentTime + 1.5, 0.5);
        prevMusicLayerNum = paraphNum+phraseNum;

        setTimeout(()=>{nextPhrase()}, 1000);
    }
}

function nextPhrase() {

    
    phraseNum ++;
    vanishBG(paraphNum, phraseNum);
    
    
    // Dernière phrase du paraph -> paraph suivant
    if (phraseNum  == content[paraphNum].length) {
        phraseNum = 0;
        emptyPreviousParaphBg(paraphNum);
        if (paraphNum + 1 < content.length) paraphNum ++;
        else return;
    }

    // Bring arp via opening lowpass
    if (paraphNum >= 3) {
        const paraphDelta = paraphNum - 3 + 1;
        const music = audioStruct.musicBackgrounds[1];
        music.lpfilter.frequency.setTargetAtTime(paraphDelta*300, audioStruct.ctx.currentTime + 5, 5);
    }
    
    fetchASCII(paraphNum, phraseNum);
    textRef = content[paraphNum][phraseNum];
    wordsRef = textRef.split(" ");
    numRightAnswers = 0;
    words = wordsRef.map(shuffleWord);
    numWords = words.length;
    
    initPhrase(words);

    if (paraphNum == 2 && phraseNum == 2) {
        ref.style.display = "none";
        document.querySelector("body").style.animation = "shake 0.5s infinite"
    }

    else if (paraphNum == 6) {
        ref.style.display = "none";
        document.querySelector("body").style.animation = "none"
    }
    else if (paraphNum == 3 && phraseNum == 2) {
        ref.style.display = "block";
        document.querySelector("body").style.animation = "none";

        // INVERSION COMMANDES
        codeSwap = 2;
        codeRoll = 0;
        audioStruct.swapSound.pan.setValueAtTime(+0.75, audioStruct.ctx.currentTime);
        audioStruct.rollSound.pan.setValueAtTime(-0.75, audioStruct.ctx.currentTime);
    }

    else {
        ref.style.display = "block";
        document.querySelector("body").style.animation = "none"
    }


}

function shuffleWord(w) {
    const shuffled = [...w].map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value).join("")

    if (w == shuffled) {
        if (w.length > 3) return shuffleWord(w);
        else { numRightAnswers++ };
        }

    //TODO : empêcher boucle infinie

    return shuffled;
}

// Fetch ASCII art pour la phrase courante (= les ASCII d'avant + le ASCII courant)
function fetchASCII(paraph, phrase) {
        fetch(`assets/ascii/${paraph}/${phrase}.txt`)
            .then(x => {
                if (!x.ok) {
                    throw new Error("Tricheur !!");
                }
                return x.text()
            })
            .then(time => {
                let bg = document.createElement("pre");
                bg.id = `bg-${paraph}-${phrase}`;
                bg.classList.add("bg");
                bg.innerText = time;
                document.getElementById("bgs").appendChild(bg);
            })
            .catch();
}

function vanishBG(paraphNum, phraseNum) {
    for (let i = 0; i < phraseNum; i++) {
        let oldBg = document.getElementById(`bg-${paraphNum}-${i}`)
        oldBg.style.animation = "none";
        oldBg.style.opacity =  0.2/(phraseNum-i+1);
    }
}

function emptyPreviousParaphBg(paraphNum) {
    for (let i = 0; i < content[paraphNum].length ; i++) {
        let oldBg = document.getElementById(`bg-${paraphNum}-${i}`)
        oldBg.style.animation = "none";
        oldBg.style.opacity =  0;
    }
}


function initPhrase(words) {

    ref.innerHTML = "";
    scrambled.innerHTML = "";

    for (let i in words) {
        let span = document.createElement("span");
        span.innerHTML = "<span class='begin-letter'>" + words[i].slice(0, 2) + "</span>" + words[i].slice(2);
        span.id = "scrambled-" + i;
        span.classList.add("word");
        if (wordsRef[i] === words[i]) {
            span.classList.add("rightanswer");
        }
        span.addEventListener("click", spanClicked);
        span.addEventListener("contextmenu", spanClicked);
        scrambled.appendChild(span);

        let refSpan = document.createElement("span");
        refSpan.innerText = wordsRef[i];
        refSpan.classList.add("word");
        ref.appendChild(refSpan);

        let spacespan = document.createElement("span");
        spacespan.innerText = " ";
        scrambled.appendChild(spacespan);
        let spacespanRef = document.createElement("span");
        spacespanRef.innerText = " ";
        ref.appendChild(spacespanRef);
    }
}

// Enable audio whenever user clicked
document.getElementsByTagName("body")[0].addEventListener("click", _ => {
    if (!audioStruct.ctx)
        initAudio();
})

initPhrase(words);
fetchASCII(paraphNum, phraseNum);

var BlueScreen = new FontFace('BlueScreen', 'url(fonts/BlueScreen.ttf)');
var PixelTwist = new FontFace('PixelTwist', 'url(fonts/PixelTwist.ttf)');

const myCanvas = document.getElementById("card");
const ctx = myCanvas.getContext("2d");


PixelTwist.load().then(() => {
    document.fonts.add(BlueScreen);
    document.fonts.add(PixelTwist);
})


// Timer du jeu

var time = 0;
var tString = "00:00:00";

let interval;

function tick() {
    time++;
}

function add() {
    tick();
    document.querySelector(".timer").innerHTML = time;

    let s = time%60;
    let m = Math.floor(time/60)%60;
    let h = Math.floor(time/60/60);
    s = s < 10 ? '0'+s : s ;
    m = m < 10 ? '0'+m : m ;
    h = h < 10 ? '0'+h : h ;
    tString = String(h + ":" + m + ":" +s)
    document.querySelector(".timer-string").innerHTML = tString;
}

function timer() {
    interval = setInterval(add, 1000);
}


function downloadCard() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 400, 250);
	ctx.font = "50px BlueScreen";
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)"; 

    let l1 = shuffleWord("CRMBLDSCRMDSCRMBLD")
    let l2 = shuffleWord("CRMBLDSCRMDSCRMBLD")
    let l3 = shuffleWord("CRMBLDSCRMDSCRMBLD")

    ctx.fillText(`${l1}`,0,80);
    ctx.fillText(`${l2}`,0,145);
    ctx.fillText(`${l3}`,0,210);

    ctx.fillStyle = "#ffffff"; 

    ctx.font = "50px PixelTwist";
    ctx.fillText(`${tString}`,70,100);

    ctx.font = "30px PixelTwist";
    ctx.fillText(`${nbSwap}`,100,150);
    ctx.fillText(`${nbRoll}`,100,200);
    
    ctx.font = "30px Arial";
    ctx.fillText("↔",60,150);
    ctx.fillText("→",60,200);
    
    ctx.fillText("+-+-+-+-+-+-+-++-+-+-++-+-+-+",0,30);
    ctx.fillText("--+-+-+-+-+-+-+-+-+-+-+-++-+-+-+",0,240);

    const dataURL = myCanvas.toDataURL("image/jpg");
    const link = document.createElement("a");
    link.href = dataURL;

    const today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    let s = today.getSeconds();
    let day = today.getDate();
    let month = today.getMonth() + 1;

    h = (h < 10 ? "0" : "") + h;
    m = (m < 10 ? "0" : "") + m;
    s = (s < 10 ? "0" : "") + s;
    day = (day < 10 ? "0" : "") + day;
    month = (month < 10 ? "0" : "") + month;

    let year = today.getFullYear();
    
    let formattedDate =  year+"-"+month+"-"+day+"--"+h+"-"+m+"-"+s;
  
  
    link.download = `SCRMBLD-${formattedDate}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}