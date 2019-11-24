import Paddle from "/src/paddle";
import InputHandler from "/src/input";
import Ball from "/src/ball";

import { buildLevel, level1, level2 } from "/src/levels";

const GAMESTATE = {
  PAUSED: 0,
  RUNNING: 1,
  MENU: 2,
  GAMEOVER: 3,
  NEWLEVEL: 4
};

export default class Game {
  constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.gameObjects = [];
    this.bricks = [];
    this.levels = [level1, level2];
    this.currentLevel = 0;
    this.score = 0;
    this.lives = 3;
    this.scoreText = document.getElementById("score");
    this.livesText = document.getElementById("lives");
    this.gamestate = GAMESTATE.MENU;
    this.paddle = new Paddle(this);
    this.ball = new Ball(this);
    new InputHandler(this.paddle, this);
  }
  start() {
    //Check if running prevent double starts
    if (
      this.gamestate !== GAMESTATE.MENU &&
      this.gamestate !== GAMESTATE.NEWLEVEL
    )
      return;

    this.bricks = buildLevel(this, this.levels[this.currentLevel]);
    this.ball.reset();
    this.gameObjects = [this.ball, this.paddle];
    //Change Gamestate to "RUNNING"
    this.gamestate = GAMESTATE.RUNNING;
    //Reset Score
    this.score = 0;
  }
  update(deltaTime) {
    //If lives = 0 gamestate = GAMEOVER
    if (this.lives === 0) this.gamestate = GAMESTATE.GAMEOVER;

    //If Paused or Menu or GameOver return empty
    if (
      this.gamestate === GAMESTATE.PAUSED ||
      this.gamestate === GAMESTATE.MENU ||
      this.gamestate === GAMESTATE.GAMEOVER
    )
      return;

    //If bricks cleared
    if (this.bricks.length === 0) {
      this.currentLevel++;
      this.gamestate = GAMESTATE.NEWLEVEL;
      this.start();
    }

    [...this.gameObjects, ...this.bricks].forEach(object =>
      object.update(deltaTime)
    );
    this.scoreText.innerHTML = this.score;
    this.livesText.innerHTML = this.lives;

    this.bricks = this.bricks.filter(brick => !brick.markedForDeletion);
  }
  draw(ctx) {
    [...this.gameObjects, ...this.bricks].forEach(object => object.draw(ctx));

    //Pause Screen
    if (this.gamestate === GAMESTATE.PAUSED) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fill();

      ctx.font = "30px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("Pause", this.gameWidth / 2, this.gameHeight / 2);
    }
    //Menu Screen
    if (this.gamestate === GAMESTATE.MENU) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();

      ctx.font = "30px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(
        "Drücke LEERTASTE zum Starten!",
        this.gameWidth / 2,
        this.gameHeight / 2
      );
    }
    //Game Over Screen
    if (this.gamestate === GAMESTATE.GAMEOVER) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();

      ctx.font = "30px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER!", this.gameWidth / 2, this.gameHeight / 2);
    }
  }
  togglePause() {
    if (this.gamestate === GAMESTATE.PAUSED) {
      this.gamestate = GAMESTATE.RUNNING;
    } else {
      this.gamestate = GAMESTATE.PAUSED;
    }
  }
}
