// const $app = document.getElementById('app';)
// class Starship{
//     constructor(){
//         this.color= 'black';
//         window.addEventListener('load',()=>{
//             setTimeout((){
//                 $app.innerHTML='<h5>${this.color}</5>';
//             }

//         )})
//     }
// // }

// const fruits=['blackberry','apple'];
// fruits.splice(0,0,'mango')
// console.log(fruits)

window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 500;
  canvas.height = 500;

  class InputHandler {
    constructor(game) {
      this.game = game;
      window.addEventListener("keydown", (e) => {
        if (
          (e.key == "ArrowUp" || e.key == "ArrowDown") &&
          this.game.keys.indexOf(e.key) === -1
        ) {
          this.game.keys.push(e.key);
        } else if (e.key === " ") {
          this.game.player.shootTop();
        }
        console.log(this.game.keys);
      });

      window.addEventListener("keyup", (e) => {
        if (this.game.keys.indexOf(e.key) > -1) {
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
        }
        console.log(this.game.keys);
      });
    }
  }

  class Projectile {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 10;
      this.height = 3;
      this.speed = 3;
      this.markedForDeletion = false;
    }
    update() {
      this.x += this.speed;
      if (this.x > this.game.width * 0.8) {
        this.markedForDeletion = true;
      }
    }

    draw(context) {
      context.fillStyle = "yellow";
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  class Player {
    constructor(game) {
      this.game = game;
      this.width = 120;
      this.height = 190;
      this.x = 20;
      this.y = 100;
      this.speedY = 0; // pasos que va dando
      // this.black = true
      this.maxSpeed = 1;
      this.projectiles = [];
    }
    update() {
      if (this.game.keys.includes("ArrowUp")) {
        this.speedY = -this.maxSpeed;
      } else if (this.game.keys.includes("ArrowDown")) {
        this.speedY = this.maxSpeed;
      } else {
        this.speedY = 0;
      }
      this.y += this.speedY;
      this.projectiles.forEach((projectile) => {
        projectile.update();
      });
      this.projectiles = this.projectiles.filter(
        (projectile) => !projectile.markedForDeletion
      );
    }
    draw(context) {
      // this.black = this.black ? false : true
      // context.fillStyle = this.black ? 'black' : 'white'
      context.fillStyle = "#333";
      context.fillRect(this.x, this.y, this.width, this.height);
      this.projectiles.forEach((projectile) => {
        projectile.draw(context);
      });
    }
    shootTop() {
        if(this.game.ammo > 0){
            this.projectiles.push(new Projectile(this.game, this.x, this.y));
            this.game.ammo--;

        }
    }
  }

  class Enemy {
    constructor(game) {
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -1.5 - 0.5;
      this.markedForDeletion = false;
      this.lives = 5;
      this.score = this.lives;
    }
    update() {
      this.x += this.speedX;
      if (this.x + this.width < 0) {
        this.markedForDeletion = true;
      }
    }
    draw(context) {
      context.fillStyle = "red";
      this.fillRect(this.x, this.y, this.width, this.height);
      context.fillStyle = "black";
      context.font = "20px Helvetica";
      context.fillText(this.lives, this.x, this.y);
    }
  }

  class Angler1 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 228 * 0.2;
      this.height = 169 * 0.2;
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
    }
  }

  class UI {
    constructor(game) {
      this.game = game;
      this.fontsize = 25;
      this.fontFamily = "Helvetica";
      this.color = "white";
    }
    draw(context) {
      context.save();
      context.fillStyle = this.color;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = "black";
      context.font = this.fontsize + "px " + this.fontFamily;
      context.fillText("Score : " + this.game.score, 10, 40);
      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(20 + 5 * i, 50, 3, 20);
      }
      const formattedTime = (this.game.gameTime*0.001).toFixed(1) 
      context.fillText('Timer: '+ formattedTime, 20, 100)
      if(this.game.gameOver){
        this.textAlign = 'center';
        let message1;
        let message2;
        if(this.game.score > this.game.winningScore){
            message1 = 'you win';
            message2 = 'you lose';
        }else{
            message1 = 'you lose';
            message2 = 'you lose';

        }
        context.font = '50px ' + this.fontFamily;
        context.fillText(message1,
            this.game.width*0.5,
            this.game,height*0.5-20);

            context.font= '25' + this.fontFamily
            context.fillText(message2, this.game.width*0.5, this.game.height*0.5+20);

      }
      context.restore();
    }
  }

  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this);
      this.keys = [];
      this.ammo = 20;
      this.ammoTimer = 0;
      this.ammoIntervalo = 600;
      this.maxAmmo = 50;
      this.enemies = [];
      this.enemyTimer = 0;
      this.enemyInterval = 1000;
      this.gameOver = false;
      this.score = 0;
      this.winningScore = 10;
      this.gameTime = 0;
      this.timeLimit = 5000;
    }

    update(deltaTime) {

        if(!this.gameOver)this.gameTime += deltaTime
        if(this.gameTime > this.timeLimit) this.gameOver = true
      this.player.update();

      if (this.ammoTimer > this.ammoIntervalo) {
        if (this.ammo < this.maxAmmo) {
          this.ammo++;
          this.ammoTimer = 0;
        }
      } else {
        this.ammoTimer += deltaTime;
      }

      this.enemies.forEach((enemy) => {
        enemy.update();
        if (this.checkCollision(this.player, enemy)) {
          enemy.markedForDeletion = true;
        }
        this.player.projectile.forEach((projectile) => {
          if (this.checkCollision(projectile, enemy)) {
            enemy.lives--;
            projectile.markedForDeletion = true;
            if (enemy.lives <= 0) {
              enemy.markedForDeletion = true;
              this.score += enemy.score;

              if (this.score > this.winningScore) this.gameOver = true;
            }
          }
        });
      });

      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);

      if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
        this.addEnemy();
        this.ammoTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
    }

    draw(context) {
      this.player.draw(context);
      this.ui.draw(context);
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
    }

    addEnemy() {
      this.enemies.push(new Angler1(this));
    }

    checkCollision(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y
      );
    }
  }

  const game = new Game(canvas.width, canvas.height);
  function animate(timeStamp) {
    const deltaTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update();
    game.draw(ctx);
    requestAnimationFrame(animate);
  }

  animate();
});
