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

window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 1000;
  canvas.height = 500;

  class InputHandler {
    constructor(game) {
      this.game = game;
      //se capturar la teclas  que realiza el usuario
      window.addEventListener("keydown", (e) => {
        //Al precionar flecha arriba se mueve nuetr juagar hacia arriba
        if (
          (e.key === "ArrowUp" || e.key === "ArrowDown") &&
          this.game.keys.indexOf(e.key) === -1
        ) {
          this.game.keys.push(e.key);
          //el boton de espacio nos permite disparar
        } else if (e.key === " ") {
          this.game.player.shootTop();
        }
        console.log(this.game.keys);
      });
      //al precionar tecla hacia abajo nuestro personas se mueve a la parte inferior
      window.addEventListener("keyup", (e) => {
        if (this.game.keys.indexOf(e.key) > -1) {
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
          //la tecla 'd' nso permite el activar o desacativar el modo debug
        } else if (e.key === "d") {
          //Nos permite marcar algunas cosas durante el desarrollo
          this.game.debug = !this.game.debug;
        }
        console.log(this.game.keys);
      });
    }
  }
  //se definen los parametros de los proyectiles lanzados por el jugador
  class Projectile {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 10;
      this.height = 4;
      this.speed = 8; // velocidad de los proyectiles
      this.markedForDeletion = false; //si esto desaparecen
      this.image = document.getElementById("projectile");
    }

    update() {
      //movimiento de las balas
      this.x += this.speed;
      if (this.x > this.game.width * 0.8) {
        this.markedForDeletion = true;
      }
    }
    //dibujamos en pantalla nuestros proyectiles
    draw(context) {
      context.drawImage(this.image, this.x, this.y);
    }
  }
  class Particles {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.image = document.getElementById("gears");
      this.frameX = Math.floor(Math.random() * 3);
      this.frameY = Math.floor(Math.random() * 3);
      this.spriteSize = 50;
      this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
      this.size = this.spriteSize * this.sizeModifier;
      this.speedX = Math.random() * 6 - 3;
      this.speedY = Math.random() * -15;
      this.gravity = 0.5;
      this.markedForDeletion = false;
      this.angle = 0;
      this.va = Math.random() * 0.2 - 0.1;
      this.bounced = 0;
      this.bottonBounceBoundary = Math.random() * 80 + 60;
    }

    update() {
      this.angle += this.va;
      this.speedY = this.gravity;
      this.x -= this.speedX + this.game.speed;
      this.y += this.speedY;
      if (this.y > this.game.height + this.size || this.x < 0 - this.size) {
        this.markedForDeletion = true;
      }
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteSize,
        this.frameY * this.spriteSize,
        this.spriteSize,
        this.spriteSize,
        this.x,
        this.y,
        this.size,
        this.size
      );
    }
  }
  //definimos los parametros de nuestro jugador
  class Player {
    constructor(game) {
      this.game = game;
      this.width = 120; //ancho
      this.height = 190; //alto
      this.x = 20;
      this.y = 100;
      this.speedY = 0;
      this.maxSpeed = 3; //velocidad maxima del jugador
      this.projectiles = [];
      this.image = document.getElementById("player");
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37; //frames de la imagen de nuestro jugador
      this.powerUp = false;
      this.powerUpTimer = 0;
      this.powerUpLimit = 10000;
    }

    update(deltaTime) {
      //movimientos de los jugadores
      if (this.game.keys.includes("ArrowUp")) {
        this.speedY = -this.maxSpeed;
      } else if (this.game.keys.includes("ArrowDown")) {
        this.speedY = this.maxSpeed;
      } else {
        this.speedY = 0;
      }
      this.y += this.speedY;
      if (this.y > this.game.height - this.height * 0.5) {
        this.t = this.game.height - this.height * 0.5;
      } else if (this.y < -this.height * 0.5) {
        this.y = -this.height * 0.5;
      }
      this.projectiles.forEach((projectile) => {
        projectile.update();
      }); //impresion de los proyectiles
      this.projectiles = this.projectiles.filter(
        (projectile) => !projectile.markedForDeletion
      );
      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }

      if (this.powerUp) {
        if (this.powerUpTimer > this.powerUpLimit) {
          this.powerUpTimer = 0;
          this.powerUp = false;
          this.frameY = 0;
        } else {
          this.powerUpTimer += deltaTime;
          this.frameY = 1;
          this.game.ammo += 0.1;
        }
      }
    }

    draw(context) {
      this.projectiles.forEach((projectile) => {
        projectile.draw(context);
      });
      //imprimimos nuestro juagor en la pantalla
      if (this.game.debug)
        context.strokeRect(this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
      //imprime las balas
    }

    shootTop() {
      //marcamos de donde saldran los proyectile y retiramos restamos una velocidad
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projectile(this.game, this.x + 80, this.y + 30)
        );
        this.game.ammo--;
      }
      if (this.powerUp) this.shootBotton();
    }

    shootBotton() {
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projectile(this.game, this.x + 80, this.y + 175)
        );
      }
    }

    enterPowerUp() {
      this.powerUpTimer = 0;
      this.powerUp = true;
      this.game.ammo = this.game.maxAmmo;
    }
  }

  class Enemy {
    //constructor de los enemigos
    constructor(game) {
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -1.5 - 0.5; //velocidad de los enemigos
      this.markedForDeletion = false;
      this.lives = 2; //vidas por defecto de los enemigos
      this.score = this.lives; //puntaje que nos da al matar al enemigo
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
    }

    update() {
      //damos el tamano y la velocidad de los enemigos asi como darle como imprimirlo en pantalla
      (this.x += this.speedX), this.game.speed;
      if (this.x + this.width < 0) {
        this.markedForDeletion = true;
      }
      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
    }

    draw(context) {
      //imprimimos los a los enemigos con las imagenes
      if (this.game.debug) {
        context.strokeRect(this.x, this.y, this.width, this.height);
        context.font = "20px Helvetica";
        //imprime la vida de los enemigos
        context.fillText(this.lives, this.x, this.y);
      }
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
  //paremetros de Angler1
  class Angler1 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 228;
      this.height = 169;
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
      this.image = document.getElementById("angler1");
      this.frameY = Math.floor(Math.random() * 3);
      this.lives = 3; //vida de angler1
    }
  }
  //parametros de angler2
  class Angler2 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 213;
      this.height = 165;
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
      this.image = document.getElementById("angler2");
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 4; //vidas angler2
    }
  }
  //Parametros de lucky
  class Lucky extends Enemy {
    constructor(game) {
      super(game);
      this.width = 99;
      this.height = 95;
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
      this.image = document.getElementById("lucky");
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 2; //vidas de lucky
      this.score = 0;
      this.type = "lucky";
    }
  }
  //Paneles de imagenes que muetran en pantalla
  class Layer {
    constructor(game, image, speedModifier) {
      this.game = game;
      this.image = image;
      this.speedModifier = speedModifier;
      this.width = 1768;
      this.height = 500;
      this.x = 0;
      this.y = 0;
    }

    update() {
      if (this.x <= -this.width) this.x = 0;
      this.x -= this.game.speed * this.speedModifier;
    }

    draw(context) {
      context.drawImage(this.image, this.x, this.y);
      context.drawImage(this.image, this.x + this.width, this.y);
    }
  }
  //imagenes del entorno
  class Background {
    constructor(game) {
      this.game = game;
      this.image1 = document.getElementById("layer1");
      this.image2 = document.getElementById("layer2");
      this.image3 = document.getElementById("layer3");
      this.image4 = document.getElementById("layer4");
      this.layer1 = new Layer(this.game, this.image1, 0.2);
      this.layer2 = new Layer(this.game, this.image2, 0.4);
      this.layer3 = new Layer(this.game, this.image3, 1.2);
      this.layer4 = new Layer(this.game, this.image4, 1.7);
      this.layers = [this.layer1, this.layer2, this.layer3];
    }

    update() {
      this.layers.forEach((layer) => layer.update());
    }

    draw(context) {
      this.layers.forEach((layer) => layer.draw(context));
    }
  }
  //inteface donde podemos ver la balas
  class UI {
    constructor(game) {
      this.game = game;
      this.fontSize = 25;
      this.fontFamily = "Bangers";
      this.color = "white";
    }
    //
    draw(context) {
      context.save();
      context.fillStyle = this.color;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = "black";
      //parametros del nuestra puntacion
      context.font = this.fontSize + "px " + this.fontFamily;
      context.fillText("Score: " + this.game.score, 20, 40);
      //timer de la partida

      //le damos un formato a los numeros
      const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
      context.fillText("Timer: " + formattedTime, 20, 100);
      if (this.game.gameOver) {
        context.textAlign = "center";
        let message1;
        let message2;
        //si ganas muestra este mensaje
        if (this.game.score > this.game.winningScore) {
          message1 = "You Win!";
          message2 = "Wel Done";
          //si pierdes muestra este elemento
        } else {
          message1 = "You Lose";
          message2 = "Try Again";
        } //tamano de los mensansaje
        context.font = "100px " + this.fontFamily;
        context.fillText(
          message1,
          this.game.width * 0.5,
          this.game.height * 0.5 - 30
        );
        context.font = "75px " + this.fontFamily;
        context.fillText(
          message2,
          this.game.width * 0.5,
          this.game.height * 0.5 + 30
        );
      }
      if (this.game.player.powerUp) {
        context.fillStyle = "yellow";
      }
      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(20 + 5 * i, 50, 3, 20);
      }
      context.restore();
    }
  }
  //parametros del juego
  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this);
      this.background = new Background(this);
      this.keys = [];
      this.ammo = 20;
      this.ammoTimer = 0;
      this.ammoInterval = 600;
      this.maxAmmo = 50;
      this.enemies = [];
      this.enemyTimer = 0;
      this.enemyInterval = 1000;
      this.gameOver = false;
      this.score = 0;
      this.winningScore = 100;
      this.gameTime = 0;
      this.timeLimit = 300000;
      this.speed = 1;
      this.debug = false;
      this.particles = [];
    }
    //paramentros del juego
    update(deltaTime) {
      if (!this.gameOver) this.gameTime += deltaTime;
      if (this.gameTime > this.timeLimit) this.gameOver = true;
      this.background.update();
      this.background.layer4.update();

      this.player.update(deltaTime);
      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) {
          this.ammo++;
          this.ammoTimer = 0;
        }
      } else {
        this.ammoTimer += deltaTime;
      }

      this.particles.forEach((particles) => particles.update());
      this.particles = this.particles.filter(
        (particles) => !particles.markedForDeletion
      );

      this.enemies.forEach((enemy) => {
        enemy.update();
        //nos muestra si los enemigos nos chocan
        if (this.checkCollision(this.player, enemy)) {
          enemy.markedForDeletion = true;
          if (enemy.type === "lucky") {
            this.player.enterPowerUp();
          } else {
            this.score--;
          }
        } //nos revisa si impactamo a los enemigos
        this.player.projectiles.forEach((projectile) => {
          if (this.checkCollision(projectile, enemy)) {
            enemy.lives--;
            projectile.markedForDeletion = true;
            if (enemy.lives <= 0) {
              enemy.markedForDeletion = true;

              this.particles.push(
                new Particles(
                  this,
                  enemy.x + enemy.width * 0.5,
                  enemy.y + enemy.height * 0.5
                )
              );
              //nos suma puntos nuestro puntajje segun el juego
              if (!this.gameOver) this.score += enemy.score;
              //si llegamos al puntaje ganador ganamos
              if (this.score > this.winningScore) this.gameOver = true;
            }
          }
        });
      });

      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
      //intevalo de los enemigos
      if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
    }

    draw(context) {
      this.background.draw(context);
      this.player.draw(context);
      this.ui.draw(context);
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
      this.ui.draw(context);
      this.particles.forEach((particles) => particles.draw(context));
      this.background.layer4.draw(context);
    }

    addEnemy() {
      const randomize = Math.random();
      if (randomize < 0.3) this.enemies.push(new Angler1(this));
      else if (randomize < 0.6) this.enemies.push(new Angler2(this));
      else this.enemies.push(new Lucky(this));
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
  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime);
    game.draw(ctx);

    requestAnimationFrame(animate);
  }
  animate(0);
});
