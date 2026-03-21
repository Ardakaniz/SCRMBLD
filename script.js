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

let textRef = content[paraphNum][phraseNum];
let wordsRef = textRef.split(" "); // La phrase de référence
let words = wordsRef.map(shuffleWord); // La phrase shuffled

let numRightAnswers = 0; // Nombre de mots bons / phrase
let numWords = words.length; // Nom de mots dans la phrase


let ref = document.getElementById("ref");
let scrambled = document.getElementById("scrambled");

let reversed = false;

function spanClicked(e) {
    e.preventDefault();

    let target = e.target;

    if (target.classList.contains("begin-letter"))
        target = target.parentElement;

    let word = target.innerText;

    if (wordsRef[target.id.slice(10)] === word) {
        return;
    }

    // Clic gauche
    if (e.button === 0) {
        word = word[1] + word[0] + word.slice(2);
    }

    // Clic droit
    else if (e.button === 2) {
        //word = word[word.length-1] + word.slice(0, -1);

        // DEBUG : clic droit pour transformer le mot en mot bon
        word = wordsRef[target.id.slice(10)];

    }

    target.innerHTML = "<span class='begin-letter'>" + word.slice(0, 2) + "</span>" + word.slice(2);

    // Mot bon
    if (wordsRef[target.id.slice(10)] === word) {
        target.classList.add("rightanswer");
        numRightAnswers++;
    }

    // Phrase bonne 
    if (numRightAnswers === numWords) {
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
            .then(t => {
                let bg = document.createElement("pre");
                bg.id = `bg-${paraph}-${phrase}`;
                bg.classList.add("bg");
                bg.innerText = t;
                document.getElementById("bgs").appendChild(bg);
            })
            .catch(console.error("Erreur fecth ASCII"));
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

initPhrase(words);
fetchASCII(paraphNum, phraseNum);

var myFont = new FontFace('myFont', 'url(fonts/BlueScreen.ttf)');

myFont.load().then(() => {
    document.fonts.add(myFont);
    const myCanvas = document.getElementById("card");
    const ctx = myCanvas.getContext("2d");
        ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 400, 250);
	ctx.font = "20px myFont"; // set font
    ctx.fillStyle = "#000000"; 
    ctx.font = "16px myFont"; // set font
    ctx.fillText("+++++++++++++++++++++++++++++++++++++",10,30);
    ctx.fillText("SCRMBLD",70,70);
    
    ctx.font = "16px Arial"; // set font
    ctx.fillText("00:00:23",70,100);
    ctx.fillText("123 <->",80,120);

})


