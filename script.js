let sentences = 
[["hey?",
"hello?",
"can you hear me?"],

["i went there",
"tried to sleep",
"devil sang"],

["can you fix me?"],

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

["well at least",
"i can",
"move on"]]


// URL arguments format: BASE64(`lvlNum;textRef`)
// const nextURLArray = [
//     "?MTthY2Fi",
// ];

// let urlParams = window.location.search.slice(1);
// if (urlParams.length === 0)
//     window.location.search = "?MDtIZXkh";
// const lvlParams = window.atob(urlParams).split(";");
// const lvlNum = Number(lvlParams[0]);
// const textRef = lvlParams[1]; 
// const nextURL = nextURLArray[lvlNum];

const lvlNum = 0;
let textRef = sentences[0][lvlNum];

function spanClicked(e) {
    e.preventDefault();

    let target = e.target;
    if (target.classList.contains("begin-letter"))
        target = target.parentElement;

    let word = target.innerText;

    if (wordsRef[target.id.slice(10)] === word) {
        return;
    }

    if (e.button === 0) {
        word = word[1] + word[0] + word.slice(2);
    }
    else if (e.button === 2) {
        word = word[word.length-1] + word.slice(0, -1);
    }

    target.innerHTML = "<span class='begin-letter'>" + word.slice(0, 2) + "</span>" + word.slice(2);

    if (wordsRef[target.id.slice(10)] === word) {
        target.classList.add("rightanswer");
        numRightAnswers++;

        document.getElementById(`bg-${lvlNum}`).style.opacity = 0.35 * (numRightAnswers / numWords);
    }

    if (numRightAnswers === numWords) {
        // gangé
        //tmp 
        // window.location.search = nextURLArray[lvlNum];
    }
}

function shuffleWord(w) {
    const shuffled = [...w].map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value).join("");

    if (w.length > 3 && w == shuffled)
        return shuffleWord(w);
    return shuffled;
}


for (let i = 0; i <= lvlNum; i++) {
    fetch(`assets/ascii/${i}.txt`)
        .then(x => {
            if (!x.ok) {
                throw new Error("tricheur");
            }
            return x.text()
        })
        .then(t => {
            let bg = document.createElement("pre");
            bg.id = `bg-${i}`;
            bg.classList.add("bg");
            if (i != lvlNum) {
                bg.style.opacity = 0.35 * ((1+i) / (1+lvlNum));
            }
            else {
                bg.style.opacity = 0;
            }
            bg.innerText = t;
            document.getElementById("bgs").appendChild(bg);
        })
        .catch(_ => window.location.search = "?MDtIZXkh");
}

let wordsRef = textRef.split(" ");
let words = wordsRef.map(shuffleWord);

let numRightAnswers = 0;
let numWords = words.length;

let ref = document.getElementById("ref");

let scrambled = document.getElementById("scrambled");
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