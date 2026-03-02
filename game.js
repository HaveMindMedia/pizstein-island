// ============================================================
// ESCAPE FROM PIZSTEIN ISLAND
// A princess. A knife. A grease-soaked hellscape.
// Built with Phaser 3 — zero image files, pure Graphics API
// This is satire at full volume. You have been warned.
// ============================================================

// ---- CONSTANTS ----
const GAME_WIDTH = 1024;
const GAME_HEIGHT = 600;
const GRAVITY = 800;
const PLAYER_SPEED = 220;
const JUMP_VELOCITY = -420;
const ATTACK_RANGE = 60;
const ENEMY_DETECT_RANGE = 150;
const GERALD_TIME = 300; // 5 minutes in seconds

// Crybaby lines — the entitled elite of Pizstein Island
const CRYBABY_LINES = [
  "Do you have ANY idea who my father IS?!",
  "I literally went to the RIGHT schools.",
  "37 INCHES OF MOZZ AND YOU STILL DISRESPECT ME?!",
  "MY LAWYERS WILL-- *gets hit* --MY LAWYERS WILL--",
];

// ============================================================
// MENU SCENE — The title screen of doom
// ============================================================
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Dark, ominous background
    this.cameras.main.setBackgroundColor('#1a0a00');

    // Dripping cheese title — big, bold, yellow-orange
    const title = this.add.text(cx, cy - 100, 'ESCAPE FROM\nPIZSTEIN ISLAND', {
      fontSize: '52px',
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontStyle: 'bold',
      color: '#ffaa00',
      stroke: '#cc4400',
      strokeThickness: 6,
      align: 'center',
      shadow: { offsetX: 3, offsetY: 3, color: '#662200', blur: 8, fill: true },
    }).setOrigin(0.5);

    // Subtitle — the mission statement
    this.add.text(cx, cy + 10, 'A princess. A knife. A grease-soaked hellscape.', {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: '#cc8844',
    }).setOrigin(0.5);

    // Blinking "PRESS ENTER" text
    const prompt = this.add.text(cx, cy + 80, 'PRESS ENTER TO PLAY', {
      fontSize: '24px',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Blink it like it's 1999
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => { prompt.visible = !prompt.visible; },
    });

    // Decorative pizza slices scattered around (Graphics circles)
    const gfx = this.add.graphics();
    for (let i = 0; i < 8; i++) {
      const px = Phaser.Math.Between(50, GAME_WIDTH - 50);
      const py = Phaser.Math.Between(50, GAME_HEIGHT - 50);
      gfx.fillStyle(0xff8800, 0.15);
      gfx.fillCircle(px, py, Phaser.Math.Between(15, 35));
      gfx.fillStyle(0xcc0000, 0.2);
      gfx.fillCircle(px + 5, py - 3, 4);
    }

    // Wait for ENTER
    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('IntroScene');
    });
  }
}

// ============================================================
// INTRO SCENE — Text cards before the carnage begins
// ============================================================
class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    const cards = [
      'Throother finds the kitchen.',
      'There is a pizza knife.',
      'There is flour everywhere.',
      "Lets f***ing go.",
    ];

    let cardIndex = 0;

    const cardText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, cards[0], {
      fontSize: '32px',
      fontFamily: 'Georgia, serif',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5).setAlpha(0);

    // Fade in each card, hold, fade out, next
    const showCard = () => {
      cardText.setText(cards[cardIndex]);
      cardText.setAlpha(0);

      this.tweens.add({
        targets: cardText,
        alpha: 1,
        duration: 400,
        hold: 1400,
        yoyo: true,
        onComplete: () => {
          cardIndex++;
          if (cardIndex < cards.length) {
            showCard();
          } else {
            this.scene.start('GameScene');
          }
        },
      });
    };

    showCard();
  }
}

// ============================================================
// GAME SCENE — Where the grease hits the fan
// ============================================================
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // -- World setup --
    this.cameras.main.setBackgroundColor('#2a1a0a');
    this.physics.world.setBounds(0, 0, 2400, GAME_HEIGHT);

    // Reality state: 1=Physical, 2=Inverse, 3=Coin
    this.realityState = 1;
    this.playerHP = 3;
    this.geraldTimer = GERALD_TIME;
    this.isAttacking = false;
    this.attackCooldown = 0;
    this.invincibleTimer = 0;

    // -- Draw the background scenery --
    this.drawBackground();

    // -- Platforms --
    this.platforms = this.physics.add.staticGroup();
    this.createPlatforms();

    // -- Grease trails (visual only) --
    this.greaseTrails = this.add.group();

    // -- Player --
    this.createPlayer();

    // -- Enemies --
    this.enemies = this.add.group();
    this.createEnemies();

    // -- Speech bubbles container --
    this.speechBubbles = this.add.group();

    // -- Camera follows player --
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 2400, GAME_HEIGHT);

    // -- Collisions --
    this.physics.add.collider(this.player, this.platforms);

    // -- Input --
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    // -- HUD (fixed to camera) --
    this.createHUD();

    // -- Gerald countdown --
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.tickGerald(),
    });

    // -- Failure overlay (hidden initially) --
    this.failOverlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xff0000, 0
    ).setScrollFactor(0).setDepth(100);

    this.failText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2,
      'GERALD HAS BEEN FED TO THE SHARKS.\nYOU FAILED HIM.', {
        fontSize: '28px',
        fontFamily: 'Impact, sans-serif',
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(101).setVisible(false);
  }

  // ---- BACKGROUND DRAWING ----
  drawBackground() {
    const bg = this.add.graphics();

    // Sky gradient feel — dark at top, slightly lighter ground area
    bg.fillStyle(0x1a0a00, 1);
    bg.fillRect(0, 0, 2400, GAME_HEIGHT);

    // Distant mountains / hills (very subtle)
    bg.fillStyle(0x2a1500, 1);
    for (let i = 0; i < 6; i++) {
      const hx = i * 450 + 100;
      bg.fillTriangle(hx - 200, 400, hx, 150 + i * 20, hx + 200, 400);
    }

    // -- YACHT (right side of level, ~1800-2100) --
    // Hull
    bg.fillStyle(0xffffff, 0.9);
    bg.fillRect(1850, 350, 250, 60);
    // Pointed bow
    bg.fillTriangle(2100, 350, 2150, 380, 2100, 410);
    // Cabin
    bg.fillStyle(0xdddddd, 0.9);
    bg.fillRect(1900, 310, 120, 40);
    // Windows
    bg.fillStyle(0x4488cc, 1);
    bg.fillRect(1910, 320, 20, 15);
    bg.fillRect(1940, 320, 20, 15);
    bg.fillRect(1970, 320, 20, 15);
    // Mast
    bg.lineStyle(3, 0xaaaaaa, 1);
    bg.lineBetween(1960, 310, 1960, 220);
    // Flag (tiny red triangle because why not)
    bg.fillStyle(0xff0000, 0.8);
    bg.fillTriangle(1960, 220, 1960, 240, 1985, 230);

    // -- TRUMPLETHINPEN BRIDGE (around x=1200) --
    // Bridge deck
    bg.fillStyle(0x886644, 1);
    bg.fillRect(1100, 380, 250, 15);
    // Supports
    bg.fillStyle(0x664422, 1);
    bg.fillRect(1110, 395, 15, 80);
    bg.fillRect(1330, 395, 15, 80);
    // Cables
    bg.lineStyle(2, 0x888888, 0.7);
    bg.lineBetween(1117, 320, 1117, 380);
    bg.lineBetween(1337, 320, 1337, 380);
    bg.lineBetween(1117, 320, 1337, 320);
    // Bridge sign
    bg.fillStyle(0x335522, 0.9);
    bg.fillRect(1150, 340, 200, 30);
    this.add.text(1250, 355, 'TRUMPLETHINPEN BRIDGE', {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Troll blob under the bridge
    bg.fillStyle(0x44aa44, 0.8);
    bg.fillCircle(1225, 450, 25);
    // Troll eyes
    bg.fillStyle(0xffffff, 1);
    bg.fillCircle(1218, 443, 5);
    bg.fillCircle(1232, 443, 5);
    bg.fillStyle(0x000000, 1);
    bg.fillCircle(1219, 444, 2);
    bg.fillCircle(1233, 444, 2);
    // Troll mouth
    bg.lineStyle(2, 0x226622, 1);
    bg.beginPath();
    bg.arc(1225, 452, 8, 0, Math.PI, false);
    bg.strokePath();

    // -- POPULATION SIGN (near start) --
    // Sign post
    bg.fillStyle(0x664422, 1);
    bg.fillRect(380, 380, 8, 80);
    // Sign board
    bg.fillStyle(0xddccaa, 0.9);
    bg.fillRect(340, 360, 120, 30);
    bg.lineStyle(2, 0x443322, 1);
    bg.strokeRect(340, 360, 120, 30);
    this.add.text(400, 375, 'POPULATION:\nTOO MANY PIZZA FACES', {
      fontSize: '7px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#442200',
      align: 'center',
    }).setOrigin(0.5);
  }

  // ---- PLATFORM CREATION ----
  createPlatforms() {
    // Ground spans the full level
    this.addPlatform(0, 530, 2400, 70);

    // Elevated platforms for jumping around
    this.addPlatform(150, 430, 180, 16);
    this.addPlatform(400, 370, 150, 16);
    this.addPlatform(620, 320, 130, 16);
    this.addPlatform(830, 400, 160, 16);
    this.addPlatform(1000, 340, 140, 16);
    this.addPlatform(1250, 300, 120, 16);
    this.addPlatform(1450, 420, 180, 16);
    this.addPlatform(1650, 360, 140, 16);
    this.addPlatform(1850, 300, 160, 16);
    this.addPlatform(2050, 400, 130, 16);
    this.addPlatform(2200, 340, 150, 16);
  }

  addPlatform(x, y, w, h) {
    // Draw platform graphic
    const gfx = this.add.graphics();
    gfx.fillStyle(0x8B5E3C, 1);
    gfx.fillRect(x, y, w, h);
    gfx.lineStyle(2, 0x5C3A1E, 1);
    gfx.strokeRect(x, y, w, h);

    // Physics body
    const zone = this.add.zone(x + w / 2, y + h / 2, w, h);
    this.physics.add.existing(zone, true);
    this.platforms.add(zone);
  }

  // ---- PLAYER CREATION ----
  createPlayer() {
    // Create a container for the player at starting position
    this.player = this.add.container(100, 450);
    this.physics.world.enable(this.player);
    this.player.body.setSize(28, 52);
    this.player.body.setOffset(-14, -26);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setBounce(0.1);

    // Draw Throother: circle head + rect body + knife
    this.playerGfx = this.add.graphics();
    this.player.add(this.playerGfx);
    this.drawPlayer();

    // Player facing direction
    this.playerFacing = 1; // 1 = right, -1 = left
  }

  drawPlayer() {
    const g = this.playerGfx;
    g.clear();

    const alpha = this.realityState === 3 ? 0.4 : 1; // semi-transparent in Coin State

    // Body (white rectangle)
    g.fillStyle(0xffffff, alpha);
    g.fillRect(-10, -8, 20, 30);

    // Head (white circle)
    g.fillStyle(0xffffff, alpha);
    g.fillCircle(0, -18, 12);

    // Eyes
    g.fillStyle(0x000000, alpha);
    g.fillCircle(-4, -20, 2);
    g.fillCircle(4, -20, 2);

    // Knife (small line extending from body)
    const knifeDir = this.playerFacing;
    g.lineStyle(3, 0xcccccc, alpha);
    g.lineBetween(knifeDir * 10, 0, knifeDir * 28, -5);
    // Knife handle
    g.lineStyle(4, 0x884422, alpha);
    g.lineBetween(knifeDir * 8, 2, knifeDir * 14, -1);

    // Attack slash visual
    if (this.isAttacking) {
      g.lineStyle(2, 0xffff00, 0.8);
      g.beginPath();
      g.arc(knifeDir * 20, -5, 25, -0.8 * knifeDir, 0.8 * knifeDir, false);
      g.strokePath();
    }
  }

  // ---- ENEMY CREATION ----
  createEnemies() {
    const positions = [
      { x: 500, y: 500, patrolLeft: 400, patrolRight: 650 },
      { x: 850, y: 500, patrolLeft: 750, patrolRight: 1000 },
      { x: 1200, y: 500, patrolLeft: 1100, patrolRight: 1350 },
      { x: 1600, y: 500, patrolLeft: 1500, patrolRight: 1750 },
      { x: 2000, y: 500, patrolLeft: 1900, patrolRight: 2150 },
      { x: 650, y: 290, patrolLeft: 620, patrolRight: 750 },
      { x: 1050, y: 310, patrolLeft: 1000, patrolRight: 1140 },
      { x: 1700, y: 330, patrolLeft: 1650, patrolRight: 1790 },
    ];

    positions.forEach((pos, idx) => {
      this.createEnemy(pos.x, pos.y, pos.patrolLeft, pos.patrolRight, idx);
    });
  }

  createEnemy(x, y, patrolLeft, patrolRight, id) {
    const container = this.add.container(x, y);
    this.physics.world.enable(container);
    container.body.setSize(36, 36);
    container.body.setOffset(-18, -18);
    container.body.setCollideWorldBounds(true);

    const gfx = this.add.graphics();
    container.add(gfx);

    // Enemy data
    container.enemyData = {
      id: id,
      hp: 3,
      patrolLeft: patrolLeft,
      patrolRight: patrolRight,
      speed: 60,
      direction: 1,
      alerted: false,
      alive: true,
      greaseCooldown: 0,
      speechTimer: 0,
      crybabyIndex: 0,
      gfx: gfx,
    };

    this.physics.add.collider(container, this.platforms);
    this.enemies.add(container);
  }

  drawEnemy(container) {
    const g = container.enemyData.gfx;
    const data = container.enemyData;
    g.clear();

    if (!data.alive) return;

    // Pizza body — glorious orange circle
    g.fillStyle(0xff8800, 1);
    g.fillCircle(0, 0, 18);

    // Crust edge
    g.lineStyle(3, 0xcc6600, 1);
    g.strokeCircle(0, 0, 18);

    // Toppings — small red circles (pepperoni, the food of tyrants)
    g.fillStyle(0xcc2200, 1);
    g.fillCircle(-6, -5, 4);
    g.fillCircle(5, 3, 3);
    g.fillCircle(-2, 8, 3);
    g.fillCircle(8, -7, 3);

    // Evil eyes (always watching)
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-5, -3, 4);
    g.fillCircle(5, -3, 4);
    g.fillStyle(0x000000, 1);
    g.fillCircle(-4, -2, 2);
    g.fillCircle(6, -2, 2);

    // When alerted: sprout stick-figure arms and legs — maximum menace
    if (data.alerted) {
      g.lineStyle(2, 0xcc6600, 1);
      // Arms
      g.lineBetween(-18, 0, -30, -10);
      g.lineBetween(18, 0, 30, -10);
      // Fists
      g.fillStyle(0xcc6600, 1);
      g.fillCircle(-30, -10, 3);
      g.fillCircle(30, -10, 3);
      // Legs
      g.lineBetween(-8, 18, -14, 35);
      g.lineBetween(8, 18, 14, 35);
      // Feet
      g.fillCircle(-14, 35, 3);
      g.fillCircle(14, 35, 3);

      // Angry mouth
      g.lineStyle(2, 0x880000, 1);
      g.beginPath();
      g.arc(0, 5, 6, Math.PI, 0, false);
      g.strokePath();
    }
  }

  // ---- HUD ----
  createHUD() {
    // Reality state indicator (top-left)
    this.hudStateText = this.add.text(16, 16, 'PHYSICAL', {
      fontSize: '20px',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold',
      color: '#ff4444',
    }).setScrollFactor(0).setDepth(50);

    // State indicator dot
    this.hudStateDot = this.add.graphics().setScrollFactor(0).setDepth(50);
    this.drawStateDot();

    // Gerald countdown (top-right)
    this.hudGeraldText = this.add.text(GAME_WIDTH - 16, 16, 'GERALD: 5:00', {
      fontSize: '20px',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold',
      color: '#ff8844',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(50);

    // Hearts (bottom center)
    this.hudHearts = this.add.graphics().setScrollFactor(0).setDepth(50);
    this.drawHearts();

    // Controls hint
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 16, 'WASD/Arrows: Move | Space: Attack | 1/2/3: Reality State', {
      fontSize: '11px',
      fontFamily: 'Courier New, monospace',
      color: '#666666',
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(50);
  }

  drawStateDot() {
    this.hudStateDot.clear();
    const colors = { 1: 0xff4444, 2: 0x4488ff, 3: 0xffdd00 };
    this.hudStateDot.fillStyle(colors[this.realityState], 1);
    this.hudStateDot.fillCircle(190, 26, 8);
  }

  drawHearts() {
    this.hudHearts.clear();
    for (let i = 0; i < 3; i++) {
      const hx = GAME_WIDTH / 2 - 50 + i * 40;
      const hy = GAME_HEIGHT - 45;
      if (i < this.playerHP) {
        // Full heart
        this.hudHearts.fillStyle(0xff2244, 1);
      } else {
        // Empty heart
        this.hudHearts.fillStyle(0x442222, 1);
      }
      // Heart shape (two circles + triangle)
      this.hudHearts.fillCircle(hx - 5, hy - 3, 7);
      this.hudHearts.fillCircle(hx + 5, hy - 3, 7);
      this.hudHearts.fillTriangle(hx - 12, hy, hx + 12, hy, hx, hy + 12);
    }
  }

  // ---- GERALD COUNTDOWN ----
  tickGerald() {
    if (this.geraldTimer <= 0) return;

    this.geraldTimer--;
    const mins = Math.floor(this.geraldTimer / 60);
    const secs = this.geraldTimer % 60;
    this.hudGeraldText.setText(`GERALD: ${mins}:${secs.toString().padStart(2, '0')}`);

    // Urgency coloring
    if (this.geraldTimer <= 30) {
      this.hudGeraldText.setColor('#ff0000');
    } else if (this.geraldTimer <= 60) {
      this.hudGeraldText.setColor('#ff4400');
    }

    // Gerald has met his fate
    if (this.geraldTimer <= 0) {
      this.geraldFailed();
    }
  }

  geraldFailed() {
    // Red flash
    this.failOverlay.setAlpha(0.6);
    this.failText.setVisible(true);

    // Pause 3 seconds then reset
    this.time.delayedCall(3000, () => {
      this.failOverlay.setAlpha(0);
      this.failText.setVisible(false);
      this.geraldTimer = GERALD_TIME;
      this.hudGeraldText.setColor('#ff8844');
    });
  }

  // ---- REALITY STATE SWITCHING ----
  switchRealityState(state) {
    if (this.realityState === state) return;
    this.realityState = state;

    const names = { 1: 'PHYSICAL', 2: 'INVERSE', 3: 'COIN STATE' };
    const colors = { 1: '#ff4444', 2: '#4488ff', 3: '#ffdd00' };

    this.hudStateText.setText(names[state]);
    this.hudStateText.setColor(colors[state]);
    this.drawStateDot();

    // Apply gravity changes
    if (state === 1) {
      this.player.body.setGravityY(0); // default world gravity applies
      this.physics.world.gravity.y = GRAVITY;
    } else if (state === 2) {
      this.physics.world.gravity.y = -GRAVITY; // reverse!
    } else if (state === 3) {
      this.physics.world.gravity.y = GRAVITY * 0.3; // floaty in coin state
    }

    // Redraw player for transparency change
    this.drawPlayer();

    // Camera flash for feedback
    this.cameras.main.flash(200,
      state === 1 ? 255 : 0,
      state === 2 ? 100 : 0,
      state === 3 ? 200 : 0,
      true
    );
  }

  // ---- ATTACK ----
  performAttack() {
    if (this.attackCooldown > 0) return;
    this.isAttacking = true;
    this.attackCooldown = 300; // ms

    // Check enemies in range
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy.enemyData.alive) return;
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, enemy.x, enemy.y
      );
      if (dist < ATTACK_RANGE) {
        this.hitEnemy(enemy);
      }
    });

    // Visual: brief attack animation
    this.drawPlayer();
    this.time.delayedCall(150, () => {
      this.isAttacking = false;
      this.drawPlayer();
    });
  }

  hitEnemy(enemy) {
    const data = enemy.enemyData;
    data.hp--;

    // Show speech bubble with crybaby line
    this.showSpeechBubble(enemy, CRYBABY_LINES[data.crybabyIndex % CRYBABY_LINES.length]);
    data.crybabyIndex++;

    // Knockback
    const kbDir = enemy.x > this.player.x ? 1 : -1;
    enemy.body.setVelocityX(kbDir * 200);

    // Flash red
    this.cameras.main.shake(100, 0.005);

    if (data.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  showSpeechBubble(enemy, text) {
    // Remove any existing bubble for this enemy
    this.speechBubbles.getChildren().forEach(b => {
      if (b.enemyId === enemy.enemyData.id) b.destroy();
    });

    // Bubble background
    const bubbleWidth = Math.min(text.length * 7 + 20, 320);
    const bx = enemy.x;
    const by = enemy.y - 45;

    const bubble = this.add.graphics();
    bubble.fillStyle(0xffffff, 0.9);
    bubble.fillRoundedRect(bx - bubbleWidth / 2, by - 16, bubbleWidth, 28, 8);
    // Little triangle pointer
    bubble.fillTriangle(bx - 5, by + 12, bx + 5, by + 12, bx, by + 20);
    bubble.enemyId = enemy.enemyData.id;
    this.speechBubbles.add(bubble);

    const bubbleText = this.add.text(bx, by, text, {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#222222',
      wordWrap: { width: bubbleWidth - 10 },
    }).setOrigin(0.5);
    bubbleText.enemyId = enemy.enemyData.id;
    this.speechBubbles.add(bubbleText);

    // Auto-remove after 2 seconds
    this.time.delayedCall(2000, () => {
      bubble.destroy();
      bubbleText.destroy();
    });
  }

  killEnemy(enemy) {
    const data = enemy.enemyData;
    data.alive = false;

    // Flour cloud particle burst — white circles exploding outward
    for (let i = 0; i < 15; i++) {
      const particle = this.add.graphics();
      const size = Phaser.Math.Between(3, 10);
      particle.fillStyle(0xffffff, 0.9);
      particle.fillCircle(0, 0, size);
      particle.x = enemy.x;
      particle.y = enemy.y;

      this.tweens.add({
        targets: particle,
        x: enemy.x + Phaser.Math.Between(-80, 80),
        y: enemy.y + Phaser.Math.Between(-80, 80),
        alpha: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }

    // Remove enemy
    enemy.destroy();
  }

  // ---- GREASE TRAIL ----
  leaveGreaseTrail(enemy) {
    const data = enemy.enemyData;
    if (data.greaseCooldown > 0) return;
    data.greaseCooldown = 200; // ms between grease drops

    const grease = this.add.graphics();
    grease.fillStyle(0xffdd00, 0.25);
    grease.fillEllipse(enemy.x, enemy.y + 18, 16, 6);
    this.greaseTrails.add(grease);

    // Fade out grease after a while
    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: grease,
        alpha: 0,
        duration: 1000,
        onComplete: () => grease.destroy(),
      });
    });
  }

  // ---- PLAYER DAMAGE ----
  damagePlayer() {
    if (this.invincibleTimer > 0) return;
    this.playerHP--;
    this.invincibleTimer = 1000; // 1 second invincibility
    this.drawHearts();
    this.cameras.main.shake(200, 0.01);

    if (this.playerHP <= 0) {
      // Reset to menu
      this.time.delayedCall(1000, () => {
        this.scene.start('MenuScene');
      });
    }
  }

  // ---- MAIN UPDATE LOOP ----
  update(time, delta) {
    if (!this.player || !this.player.body) return;

    // -- Cooldown timers --
    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= delta;
      // Blink player during invincibility
      this.player.setAlpha(Math.sin(time * 0.02) > 0 ? 1 : 0.3);
    } else {
      this.player.setAlpha(1);
    }

    // -- Reality state switching --
    if (Phaser.Input.Keyboard.JustDown(this.key1)) this.switchRealityState(1);
    if (Phaser.Input.Keyboard.JustDown(this.key2)) this.switchRealityState(2);
    if (Phaser.Input.Keyboard.JustDown(this.key3)) this.switchRealityState(3);

    // -- Player movement --
    const onGround = this.realityState === 2
      ? this.player.body.blocked.up
      : this.player.body.blocked.down;

    const moveLeft = this.cursors.left.isDown || this.wasd.left.isDown;
    const moveRight = this.cursors.right.isDown || this.wasd.right.isDown;
    const jumpKey = this.cursors.up.isDown || this.wasd.up.isDown;

    if (moveLeft) {
      this.player.body.setVelocityX(-PLAYER_SPEED);
      if (this.playerFacing !== -1) {
        this.playerFacing = -1;
        this.drawPlayer();
      }
    } else if (moveRight) {
      this.player.body.setVelocityX(PLAYER_SPEED);
      if (this.playerFacing !== 1) {
        this.playerFacing = 1;
        this.drawPlayer();
      }
    } else {
      this.player.body.setVelocityX(0);
    }

    // Jump (reversed in Inverse state)
    if (jumpKey && onGround) {
      if (this.realityState === 2) {
        this.player.body.setVelocityY(-JUMP_VELOCITY); // jump "down" (which is up in inverse)
      } else {
        this.player.body.setVelocityY(JUMP_VELOCITY);
      }
    }

    // Attack
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.performAttack();
    }

    // -- Coin State: disable platform collisions --
    if (this.realityState === 3) {
      // In coin state, player passes through platforms (except ground)
      this.player.body.checkCollision.down = false;
      this.player.body.checkCollision.up = false;
    } else {
      this.player.body.checkCollision.down = true;
      this.player.body.checkCollision.up = true;
    }

    // -- Enemy AI --
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy.enemyData || !enemy.enemyData.alive) return;
      const data = enemy.enemyData;

      // Distance to player
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, enemy.x, enemy.y
      );

      // Alert state
      const wasAlerted = data.alerted;
      data.alerted = dist < ENEMY_DETECT_RANGE;

      // Redraw if alert state changed
      if (data.alerted !== wasAlerted) {
        this.drawEnemy(enemy);
      }

      // Movement: patrol or chase
      if (data.alerted) {
        // Chase player
        const chaseDir = this.player.x > enemy.x ? 1 : -1;
        enemy.body.setVelocityX(chaseDir * data.speed * 1.5);
      } else {
        // Patrol
        enemy.body.setVelocityX(data.direction * data.speed);
        if (enemy.x <= data.patrolLeft) data.direction = 1;
        if (enemy.x >= data.patrolRight) data.direction = -1;
      }

      // Leave grease trail
      data.greaseCooldown -= delta;
      this.leaveGreaseTrail(enemy);

      // Draw enemy each frame (for alert visuals)
      this.drawEnemy(enemy);

      // Damage player on contact
      if (dist < 30) {
        this.damagePlayer();
      }
    });
  }
}

// ============================================================
// PHASER CONFIG — Fire it up
// ============================================================
const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GRAVITY },
      debug: false,
    },
  },
  scene: [MenuScene, IntroScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// Let the grease flow
const game = new Phaser.Game(config);
