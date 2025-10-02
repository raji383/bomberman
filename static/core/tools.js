import { variables } from "./variables.js"


export class KeyboardListner {
    constructor(game) {
        this.game = game;
        this.keys = [];

        const validKeys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', ' ', 'p'];


        window.addEventListener('keydown', e => {
            if (validKeys.includes(e.key) && !e.repeat) {
                if (!this.keys.includes(e.key)) {
                    this.keys.push(e.key);
                }
            }
        });

        window.addEventListener('keyup', e => {
            const index = this.keys.indexOf(e.key);
            if (index > -1) {
                this.keys.splice(index, 1);
            }
        });


        document.querySelectorAll('.control').forEach(botn => {
            botn.addEventListener('mousedown', (e) => {
                const key = this.mapValueToKey(e.target.value);
                if (key && !this.keys.includes(key)) {
                    this.keys.push(key);
                }
            });

            botn.addEventListener('mouseup', (e) => {
                const key = this.mapValueToKey(e.target.value);
                const index = this.keys.indexOf(key);
                if (index > -1) {
                    this.keys.splice(index, 1);
                }
            });


            botn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const key = this.mapValueToKey(e.target.value);
                if (key && !this.keys.includes(key)) {
                    this.keys.push(key);
                }
            }, { passive: false });

            botn.addEventListener('touchend', (e) => {
                e.preventDefault();
                const key = this.mapValueToKey(e.target.value);
                const index = this.keys.indexOf(key);
                if (index > -1) {
                    this.keys.splice(index, 1);
                }
            }, { passive: false });
        });
    }


    mapValueToKey(value) {
        switch (value) {
            case 'l': return 'ArrowLeft';
            case 'r': return 'ArrowRight';
            case 'u': return 'ArrowUp';
            case 'd': return 'ArrowDown';
            case 'bom': return ' ';
            case 'p': return 'p';
            default: return null;
        }
    }
}



export class Ui {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.timeS = 0; //seconds
        this.timeM = 0; //minutes
        this.elapsed = 0;
        this.gameOver = null;
        this.go = false;
        this.interval = null;

        [this.pauseButton, this.restartButton] = [document.getElementById('pause-button'), document.getElementById('restart')];
    }

    draw() {

        if (this.go) {
            this.go = false
            this.interval = setInterval(() => {
                if (this.timeS === 59) { 
                    this.timeS = 0;
                    this.timeM += 1;                 
                } else {
                    this.timeS += 1;
                }
            }, 1000);
        }

        const timeEl = document.getElementById('time');
        if (timeEl) {
            timeEl.textContent = `time: ${this.timeM.toString().padStart(2, '0')}:${this.timeS.toString().padStart(2, '0')}`;
        }
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('bombs').textContent = `Bombs: ${this.game.player.maxBombs - this.game.player.bombs.length}`;
        document.getElementById('speed').textContent = `Speed: ${this.game.player.speed}`;
        document.getElementById('enemy').textContent = `Enemies: ${this.game.enemies.length}`;
        const gameover = document.getElementById('game-over');
        if (!gameover) {
            this.gameOver = document.createElement('div');
            this.gameOver.id = 'game-over';
            this.gameOver.textContent = `Game Over! Score: ${this.score}`;
            document.body.append(this.gameOver);
        }
        [this.pauseButton, this.restartButton].forEach(button => {
            button.addEventListener('click', () => {
                if (button.id === 'pause-button') {
                    this.game.pause = !this.game.pause;
                } else if (button.id === 'restart') {
                    variables.restart = true;
                }
            });
        })

    }
}
