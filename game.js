var Snake = (function () {
  const INITIAL_TAIL = 4;
  var fixedTail = true;
  var intervalID;
  var tileCount = 10;
  var gridSize = 400 / tileCount;

  const INITIAL_PLAYER = { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) };

  var velocity = { x: 0, y: 0 };
  var player = { x: INITIAL_PLAYER.x, y: INITIAL_PLAYER.y };

  var walls = false;
  var fruit = { x: 1, y: 1 };

  var trail = [];
  var tail = INITIAL_TAIL;

  var reward = 0;
  var points = 0;
  var pointsMax = 0;

  var ActionEnum = { 'none': 0, 'up': 1, 'down': 2, 'left': 3, 'right': 4 };
  Object.freeze(ActionEnum);
  var lastAction = ActionEnum.none;

  var fruitImage = new Image();
  fruitImage.src = 'logo.png';

  var timeLeft = 120; // 2 minutes in seconds

  function setup() {
    canv = document.getElementById('gc');
    ctx = canv.getContext('2d');
    game.reset();
    startTimer();
  }

  function startTimer() {
    var timerElement = document.getElementById('timer');
    var timerInterval = setInterval(function () {
      timeLeft--;
      var minutes = Math.floor(timeLeft / 60);
      var seconds = timeLeft % 60;
      timerElement.textContent = `Time: ${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);
  }

  function gameOver() {
    Snake.stop();
    alert('Game Over! Time is up.');
    saveScore(pointsMax);
  }

  var game = {
    reset: function () {
      ctx.fillStyle = 'grey';
      ctx.fillRect(0, 0, canv.width, canv.height);

      tail = INITIAL_TAIL;
      points = 0;
      velocity.x = 0;
      velocity.y = 0;
      player.x = INITIAL_PLAYER.x;
      player.y = INITIAL_PLAYER.y;
      reward = -1;
      lastAction = ActionEnum.none;
      trail = [];
      trail.push({ x: player.x, y: player.y });
      game.RandomFruit();
    },

    action: {
      up: function () {
        if (lastAction != ActionEnum.down) {
          velocity.x = 0;
          velocity.y = -1;
        }
      },
      down: function () {
        if (lastAction != ActionEnum.up) {
          velocity.x = 0;
          velocity.y = 1;
        }
      },
      left: function () {
        if (lastAction != ActionEnum.right) {
          velocity.x = -1;
          velocity.y = 0;
        }
      },
      right: function () {
        if (lastAction != ActionEnum.left) {
          velocity.x = 1;
          velocity.y = 0;
        }
      }
    },

    RandomFruit: function () {
      if (walls) {
        fruit.x = 1 + Math.floor(Math.random() * (tileCount - 2));
        fruit.y = 1 + Math.floor(Math.random() * (tileCount - 2));
      } else {
        fruit.x = Math.floor(Math.random() * tileCount);
        fruit.y = Math.floor(Math.random() * tileCount);
      }
    },

    loop: function () {
      reward = -0.1;

      function DontHitWall() {
        if (player.x < 0) player.x = tileCount - 1;
        if (player.x >= tileCount) player.x = 0;
        if (player.y < 0) player.y = tileCount - 1;
        if (player.y >= tileCount) player.y = 0;
      }

      function HitWall() {
        if (player.x < 1 || player.x > tileCount - 2 || player.y < 1 || player.y > tileCount - 2) {
          game.reset();
          saveScore(pointsMax);
        }

        ctx.fillStyle = 'grey';
        ctx.fillRect(0, 0, gridSize - 1, canv.height);
        ctx.fillRect(0, 0, canv.width, gridSize - 1);
        ctx.fillRect(canv.width - gridSize + 1, 0, gridSize, canv.height);
        ctx.fillRect(0, canv.height - gridSize + 1, canv.width, gridSize);
      }

      var stopped = velocity.x == 0 && velocity.y == 0;
      player.x += velocity.x;
      player.y += velocity.y;

      if (velocity.x == 0 && velocity.y == -1) lastAction = ActionEnum.up;
      if (velocity.x == 0 && velocity.y == 1) lastAction = ActionEnum.down;
      if (velocity.x == -1 && velocity.y == 0) lastAction = ActionEnum.left;
      if (velocity.x == 1 && velocity.y == 0) lastAction = ActionEnum.right;

      ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
      ctx.fillRect(0, 0, canv.width, canv.height);

      if (walls) HitWall();
      else DontHitWall();

      if (!stopped) {
        trail.push({ x: player.x, y: player.y });
        while (trail.length > tail) trail.shift();
      }

      if (!stopped) {
        ctx.fillStyle = 'rgba(200, 200, 200, 0.2)';
        ctx.font = "small-caps 14px Helvetica";
        ctx.fillText("(esc) reset", 24, 356);
        ctx.fillText("(space) pause", 24, 374);
      }

      ctx.fillStyle = 'green';
      for (var i = 0; i < trail.length - 1; i++) {
        ctx.fillRect(trail[i].x * gridSize + 1, trail[i].y * gridSize + 1, gridSize - 2, gridSize - 2);
        if (!stopped && trail[i].x == player.x && trail[i].y == player.y) {
          game.reset();
          saveScore(pointsMax);
        }
        ctx.fillStyle = 'lime';
      }
      ctx.fillRect(trail[trail.length - 1].x * gridSize + 1, trail[trail.length - 1].y * gridSize + 1, gridSize - 2, gridSize - 2);

      if (player.x == fruit.x && player.y == fruit.y) {
        if (!fixedTail) tail++;
        points++;
        if (points > pointsMax) pointsMax = points;
        reward = 1;
        game.RandomFruit();
        while ((function () {
          for (var i = 0; i < trail.length; i++) {
            if (trail[i].x == fruit.x && trail[i].y == fruit.y) {
              game.RandomFruit();
              return true;
            }
          }
          return false;
        })());
      }

      ctx.drawImage(fruitImage, fruit.x * gridSize + 1, fruit.y * gridSize + 1, gridSize - 2, gridSize - 2);

      if (stopped) {
        ctx.fillStyle = 'rgba(250, 250, 250, 0.8)';
        ctx.font = "small-caps bold 14px Helvetica";
        ctx.fillText("press ARROW KEYS to START...", 24, 374);
      }

      ctx.fillStyle = 'white';
      ctx.font = "bold small-caps 16px Helvetica";
      ctx.fillText("points: " + points, 288, 40);
      ctx.fillText("best: " + pointsMax, 292, 60);
      ctx.fillText(`time left: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`, 292, 80);

      return reward;
    }
  }

  function keyPush(evt) {
    switch (evt.keyCode) {
      case 37: //left
        game.action.left();
        evt.preventDefault();
        break;

      case 38: //up
        game.action.up();
        evt.preventDefault();
        break;

      case 39: //right
        game.action.right();
        evt.preventDefault();
        break;

      case 40: //down
        game.action.down();
        evt.preventDefault();
        break;

      case 32: //space
        Snake.pause();
        evt.preventDefault();
        break;

      case 27: //esc
        game.reset();
        evt.preventDefault();
        break;
    }
  }

  return {
    start: function (fps = 90) {
      window.onload = setup;
      intervalID = setInterval(game.loop, 1000 / fps);
    },

    loop: game.loop,

    reset: game.reset,

    stop: function () {
      clearInterval(intervalID);
    },

    setup: {
      keyboard: function (state) {
        if (state) {
          document.addEventListener('keydown', keyPush);
        } else {
          document.removeEventListener('keydown', keyPush);
        }
      },
      wall: function (state) {
        walls = state;
      },
      tileCount: function (size) {
        tileCount = size;
        gridSize = 400 / tileCount;
      },
      fixedTail: function (state) {
        fixedTail = state;
      }
    },

    action: function (act) {
      switch (act) {
        case 'left':
          game.action.left();
          break;

        case 'up':
          game.action.up();
          break;

        case 'right':
          game.action.right();
          break;

        case 'down':
          game.action.down();
          break;
      }
    },

    info: {
      tileCount: tileCount
    }
  };

})();

Snake.start(8);
Snake.setup.keyboard(true);
Snake.setup.fixedTail(false);

async function saveScore(score) {
  if (!metamaskConnected) return;

  try {
    const response = await fetch('https://zksync-snake.vercel.app/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: currentUserAddress, score }),
    });
    const data = await response.json();
    console.log('Leaderboard updated:', data);
  } catch (error) {
    console.error('Error saving score:', error);
  }
}

document.getElementById('leaderboardButton').onclick = async function () {
  const modal = document.getElementById('leaderboardModal');
  const span = document.getElementsByClassName('close')[0];
  const leaderboardList = document.getElementById('leaderboardList');

  modal.style.display = 'block';

  try {
    const response = await fetch('https://zksync-snake.vercel.app/leaderboard');
    const leaderboard = await response.json();
    leaderboardList.innerHTML = leaderboard.map(entry => {
      return `<li>${entry.address.substring(0, 4)}****${entry.address.substring(entry.address.length - 2)}: ${entry.score}</li>`;
    }).join('');
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  }

  span.onclick = function() {
    modal.style.display = 'none';
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
};

document.getElementById('connectButton').addEventListener('click', async () => {
  try {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    metamaskConnected = true;
    currentUserAddress = accounts[0];
    document.getElementById('connectButton').textContent = ` ${currentUserAddress.substring(0, 6)}****${currentUserAddress.substring(currentUserAddress.length - 4)}`;
    alert('Connected to Metamask!');
  } catch (error) {
    console.error(error);
    alert('Failed to connect to Metamask.');
  }
});

