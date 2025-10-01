import { Game } from "./core/game.js"
import { variables } from "./core/variables.js"
import { Enemies } from "./core/enemies.js"

window.changePage = changePage;

let game
let lastTime = 0;
var a = null;
function animate(timestamp) {
    let deltatime = timestamp - lastTime;
    lastTime = timestamp;
    const blur = document.getElementById('blur-wrapper')
    const pauseEl = document.getElementById('pause');
    let constinue = document.getElementById('pause-button');
    const jj = document.getElementById('win');
    const gameOver = document.getElementById('game-over');


    if (game.pause) {
        pauseEl.style.display = 'block';
        blur.style.filter = 'blur(10px)';
    } else if (game.gameOver) {

        if (game.enemies.length !== 0) {
            gameOver.style.display = 'block';
            pauseEl.style.display = 'block';
            blur.style.filter = 'blur(10px)';
            constinue.style.display = 'none';
        }
        if (jj) {
            pauseEl.style.display = 'block';
            blur.style.filter = 'blur(10px)';
            jj.style.display = 'block';
            constinue.style.display = 'none';
            scoreBoard(jj)
        }

    } else {
        if (pauseEl) {
            pauseEl.style.display = 'none';
            blur.style.filter = 'none'
        }
        game.draw(deltatime);
    }

    game.update(deltatime);
    if (variables.restart) {
        jj.style.display = 'none';
        gameOver.style.display = 'none';
        constinue.style.display = 'block';
        pauseEl.style.display = 'none';
        blur.style.filter = 'blur(10px)';
        clearInterval(a)
        startGame();
        variables.restart = false;
    } else {
        requestAnimationFrame(animate);

    }
}
function scoreBoard(form) {
    if (document.getElementById('scoreboard')) {
        return;
    }

    const div = document.createElement('div');
    div.id = 'scoreboard';

    div.innerHTML = `
      <div class="score-header">SCORE: ${variables.Score}, Time: ${variables.time}</div>
      <h1>Win</h1>
      <input type="text" name="name" placeholder="Your name" required />
      <input type="hidden" name="score" value="${variables.Score}">
      <input type="hidden" name="time" value="${variables.time}">
      <button type="submit">Submit Name</button>
    `;

    form.innerHTML = '';
    form.appendChild(div);
    form.addEventListener('submit', (e) => {
        loadScores();
    });
}

export function startGame() {
    game = new Game();
    const en = document.querySelectorAll('.enemy');
    en.forEach(enemy => {
        enemy.remove();
    })
    const overlay = document.createElement('div');
    const item = document.querySelectorAll('#ui h1');
    overlay.id = 'difficulty-card';
    overlay.innerHTML = `
    <div style="margin-bottom: 24px;">Choose Difficulty</div>
    <button class="diff-btn" data-diff="easy">Easy</button>
    <button class="diff-btn" data-diff="medium">Medium</button>
    <button class="diff-btn" data-diff="hard">Hard</button>
    <div id="scoreboard"></div>
    `;
    document.body.appendChild(overlay);
    let blur = document.getElementById('blur-wrapper')
    Array.from(overlay.querySelectorAll('button')).forEach(btn => {
        btn.style = `
        background: #1c1c22;
        color: #ffb300;
        border: 2px solid #ffb300;
        border-radius: 8px;
        font-size: 1.2rem;
        padding: 10px 24px;
        margin: 0 8px;
        cursor: pointer;
        font-family: 'Bitcount Grid Single', monospace;
        `;
        btn.onmouseover = () => { btn.style.background = '#ffb300'; btn.style.color = '#1c1c22'; };
        btn.onmouseout = () => { btn.style.background = '#1c1c22'; btn.style.color = '#ffb300'; };
        btn.onclick = (e) => {
            overlay.remove();
            if (e.target.dataset.diff === 'easy') {
                document.getElementById('ui').style.display = 'flex';
                game.maxEnemies = 1;
                blur.style.filter = 'none'
                game.startDraw = true

            } else if (e.target.dataset.diff === 'medium') {
                document.getElementById('ui').style.display = 'flex';
                blur.style.filter = 'none'
                game.maxEnemies = 8;
                console.log(1);
                game.startDraw = true
                game.player.maxLives = 4
                for (let i = 0; i < item.length; i++) {
                    item[i].style.display = 'block';
                }

            } else if (e.target.dataset.diff === 'hard') {
                game.startDraw = true
                document.getElementById('ui').style.display = 'flex';
                blur.style.filter = 'none'
                game.player.maxLives = 3
                a = setInterval(() => {
                    game.maxEnemies = 30;
                    if ((game.enemies.length >= game.maxEnemies)) {
                        clearInterval(a)
                    }
                    let place = game.emptySpaces[Math.floor(Math.random() * game.emptySpaces.length)]
                    game.enemies.push(new Enemies(place.y * variables.GRID_CELL_SIZE, (place.x) * variables.GRID_CELL_SIZE, game.map, variables.GRID_CELL_SIZE, variables.initialSpeed));
                    console.log(game.enemies.length);

                }, 3000)
                for (let i = 0; i < item.length; i++) {
                    item[i].style.display = 'block';
                }
            }
            variables.start = false;
            animate(0);
        };

    });

    const pauseEl = document.getElementById('pause');

    pauseEl.addEventListener('click', () => {
        game.pause = false
        blur.style.filter = 'none'
    })
}
startGame();
let currentPage = 1;
let scores = [];

async function loadScores() {
    try {
        const response = await fetch("/scores.json");
        scores = await response.json();


        generateTablePage(currentPage);

    } catch (err) {
        console.error("Failed to load scores:", err);
    }
}
const container = document.getElementById("scoreboard");
const rowsPerPage = 5;

function generateTablePage(page) {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageData = scores.slice(startIndex, endIndex);

    const tableHTML = `
                <h2>Scoreboard</h2>
                <table border="1" cellpadding="8" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Name</th>
                            <th>Score</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pageData.map(player => `
                            <tr>
                                <td>${player.Rank}</td>
                                <td>${player.name}</td>
                                <td>${player.Score}</td>
                                <td>${player.time}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
                <div class="pagination">
                    <button ${page === 1 ? "disabled" : ""} onclick="changePage(${page - 1})">Previous</button>
                    <button ${page === Math.ceil(scores.length / rowsPerPage) ? "disabled" : ""} onclick="changePage(${page + 1})">Next</button>
                </div>
            `;
    container.innerHTML = tableHTML;
}

function changePage(page) {
    const rowsPerPage = 5;
    if (page >= 1 && page <= Math.ceil(scores.length / rowsPerPage)) {
        currentPage = page;
        generateTablePage(currentPage);
    }
}

window.onload = loadScores;


