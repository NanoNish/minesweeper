// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-analytics.js";

// const firebaseConfig = {
//     apiKey: "AIzaSyDI-aSy0UNnCG9aPjsKYXY3MWyIrz4QsNE",
//     authDomain: "minesweeper-assgn.firebaseapp.com",
//     databaseURL: "https://minesweeper-assgn-default-rtdb.firebaseio.com",
//     projectId: "minesweeper-assgn",
//     storageBucket: "minesweeper-assgn.appspot.com",
//     messagingSenderId: "757878023047",
//     appId: "1:757878023047:web:cce4f76801b13a04f06922",
//     measurementId: "G-47E8QVZF44"
// };

// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const db = getFirestore(app);

var rows = 0, columns = 0, board = [], minesCount = 0, minesLocation = [], cellsClicked = 0, minesBoard = [], gameOver = false, then, now, elapsed, count = 0;

window.onload = function() {
    document.getElementById("easy-button").addEventListener("click", setEasy);
    document.getElementById("hard-button").addEventListener("click", setHard);
}

function setEasy() {
    rows = 8;
    columns = 8;
    minesCount = 10;
    document.getElementById("board").style.width = '400px';
    document.getElementById("board").style.height = '400px';
    startGame();
}

function setHard() {
    rows = 12;
    columns = 12;
    minesCount = 25;
    document.getElementById("board").style.width = '600px';
    document.getElementById("board").style.height = '600px';
    startGame();
}

function startGame() {
    document.getElementById("mines-count").innerText = minesCount;
    then = Date.now();
    
    timer();
    for (let i = 0; i < rows; i++){
        for (let j = 0; j < columns; j++){
            minesBoard[i] = [];
        }
    }
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            minesBoard[i][j] = 0;
        }
    }
    console.log(minesBoard);
    setMines();
    setBoard();
    scanBoard();
}

function setMines() {
    minesLocation.splice(0, minesLocation.length);
    for (let i = 0; i < minesCount; i++) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        let id = r.toString() + "+" + c.toString();
        if (minesLocation.includes(id)) {
            i--;
        }
        else {
            minesLocation.push(id);
            minesBoard[r][c] = -1;
        }
    }
    console.log(minesLocation);
    console.log(minesBoard);
}

function setBoard() {
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let cell = document.createElement("div");
            cell.id = r.toString() + "+" + c.toString();
            cell.addEventListener("click", clickedCell);
            document.getElementById("board").append(cell);
            row.push(cell);
        }
        board.push(row);
    }
    console.log(board);
}

function scanBoard() {
    for (let r = 0; r < rows; r++){
        for (let c = 0; c < columns; c++){
            if (minesBoard[r][c] != -1) {
                minesBoard[r][c] = checkMine(r - 1, c - 1) + checkMine(r - 1, c) + checkMine(r - 1, c + 1)
                    + checkMine(r, c - 1) + checkMine(r, c) + checkMine(r, c + 1)
                    + checkMine(r + 1, c - 1) + checkMine(r + 1, c) + checkMine(r + 1, c + 1);
            }    
        }
    }
    console.log(minesBoard);
}

function checkMine(r, c) {
    if ((r >= 0 && r < rows) && (c >= 0 && c < columns) && (minesBoard[r][c] == -1)) return 1;
    else return 0;
}

function clickedCell() {
    if (gameOver || this.classList.contains("clicked")) {
        return;
    }
    let cell = this;
    if (minesLocation.includes(cell.id)) {
        gameOver = true;
        revealMines();
        return;
    }

    let coords = cell.id.split("+");
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);
    checkCell(r, c);

}

function revealMines() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let cell = board[r][c];
            if (minesLocation.includes(cell.id)) {
                cell.innerText = "boom";
                cell.style.backgroundColor = "red";
            }
        }
    }
}

function checkCell(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns || board[r][c].classList.contains("clicked")) {
        return;
    }
    board[r][c].classList.add("clicked");
    cellsClicked += 1;

    let minesFound = minesBoard[r][c];
    if (minesFound > 0) {
        board[r][c].innerText = minesFound;
    }
    else {
        checkCell(r - 1, c - 1);
        checkCell(r - 1, c);    
        checkCell(r - 1, c + 1);
        checkCell(r, c - 1);    
        checkCell(r, c + 1);    
        checkCell(r + 1, c - 1);
        checkCell(r + 1, c);    
        checkCell(r + 1, c + 1);
    }
    if (cellsClicked == rows * columns - minesCount) {
        document.getElementById("mines-count").innerText = "Cleared";
        gameOver = true;
        db.collection('High-Scores').add({
            score: count
        });
    }
}

function timer() {
    let requestID = requestAnimationFrame(timer);
    now = Date.now();
    elapsed = now - then;
    if (elapsed > 1000) {
        then = now;
        document.getElementById("timer").innerText = count;
        count++;
        if (!gameOver) {
            timer();
        }
        else {
            cancelAnimationFrame(requestID);
        }
    }
}

const scores = document.querySelector('#high-scores');

function displayScores(doc) {
    let li = document.createElement('li');
    let score = document.createElement('span');
    li.setAttribute('data-id', doc.id);
    score.textContent = doc.data().score;
    li.appendChild(score);
    scores.appendChild(li);
}

db.collection('High-Scores').orderBy('score').get().then(snapshot => {
    snapshot.docs.forEach(doc => {
        displayScores(doc);
    });
});