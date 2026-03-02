// ============================================================
// ESCAPE FROM PEPSTEIN ISLAND
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
const ENEMY_RESPAWN_TIME = 15000; // 15 seconds

// Crybaby lines — the entitled elite of Pepstein Island
const CRYBABY_LINES = [
  "Do you have ANY idea who my father IS?!",
  "I literally went to the RIGHT schools.",
  "37 INCHES OF MOZZ AND YOU STILL DISRESPECT ME?!",
  "MY LAWYERS WILL-- *gets hit* --MY LAWYERS WILL--",
];

// Pepperoni Guy lines
const PEPPERONI_LINES = [
  "You think you can handle THE STICK?!",
  "I didn't come here to LOSE.",
  "My pepperoni is PREMIUM GRADE.",
  "You don't even know what REAL toppings are!",
];

// Trumplethinpen lines when hit
const TRUMP_LINES = [
  "You're FIRED. I'm signing it RIGHT NOW.",
  "Nobody has a bigger pen than me. Nobody.",
  "This is a TOTAL WITCH HUNT.",
  "Sad! Very sad. Possibly the saddest thing I've ever seen.",
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
    const title = this.add.text(cx, cy - 120, 'ESCAPE FROM\nPEPSTEIN ISLAND', {
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
    this.add.text(cx, cy - 10, 'A princess. A knife. A grease-soaked hellscape.', {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: '#cc8844',
    }).setOrigin(0.5);

    // Controls overlay
    const controlsY = cy + 30;
    this.add.text(cx, controlsY, '— CONTROLS —', {
      fontSize: '14px',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold',
      color: '#aa8855',
    }).setOrigin(0.5);

    const controlLines = [
      'WASD / Arrows .... Move & Jump',
      'Space ............ Attack',
      '1 / 2 / 3 ....... Reality States',
    ];
    controlLines.forEach((line, i) => {
      this.add.text(cx, controlsY + 22 + i * 18, line, {
        fontSize: '12px',
        fontFamily: 'Courier New, monospace',
        color: '#887755',
      }).setOrigin(0.5);
    });

    // Blinking "PRESS ENTER" text
    const prompt = this.add.text(cx, cy + 120, 'PRESS ENTER TO PLAY', {
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
// DEATH SCENE — Throother has fallen
// ============================================================
class DeathScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DeathScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#0a0000');

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Ominous red vignette
    const gfx = this.add.graphics();
    gfx.fillStyle(0x330000, 0.6);
    gfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add.text(cx, cy - 60, 'THROOTHER HAS FALLEN.', {
      fontSize: '38px',
      fontFamily: 'Impact, sans-serif',
      fontStyle: 'bold',
      color: '#ff2222',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, cy, 'The grease claims another.', {
      fontSize: '20px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: '#cc6644',
    }).setOrigin(0.5);

    // Restart button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x882222, 1);
    btnBg.fillRoundedRect(cx - 100, cy + 50, 200, 50, 10);
    btnBg.lineStyle(2, 0xff4444, 1);
    btnBg.strokeRoundedRect(cx - 100, cy + 50, 200, 50, 10);

    const btnText = this.add.text(cx, cy + 75, 'TRY AGAIN', {
      fontSize: '22px',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Make button interactive
    const btnZone = this.add.zone(cx, cy + 75, 200, 50).setInteractive();
    btnZone.on('pointerover', () => btnText.setColor('#ffdd00'));
    btnZone.on('pointerout', () => btnText.setColor('#ffffff'));
    btnZone.on('pointerdown', () => this.scene.start('GameScene'));

    // Also restart on ENTER
    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('GameScene');
    });
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
    this.physics.world.gravity.y = GRAVITY;

    // Reality state: 1=Physical, 2=Inverse, 3=Coin
    this.realityState = 1;
    this.playerHP = 3;
    this.geraldTimer = GERALD_TIME;
    this.geraldSaved = false;
    this.isAttacking = false;
    this.attackCooldown = 0;
    this.invincibleTimer = 0;

    // Boss state
    this.bossActive = false;
    this.bossDefeated = false;
    this.bossHP = 10;
    this.bossAttackTimer = 0;
    this.bossLineIndex = 0;
    this.executiveOrders = this.add.group();

    // Enemy respawn tracking
    this.deadEnemyData = [];

    // -- Draw the background scenery --
    this.drawBackground();

    // -- Platforms --
    this.platforms = this.physics.add.staticGroup();
    this.platformGraphics = []; // track platform gfx for coin-state hiding
    this.createPlatforms();

    // -- Grease trails (visual only) --
    this.greaseTrails = this.add.group();

    // -- Player --
    this.createPlayer();

    // -- Gerald --
    this.createGerald();

    // -- Enemies --
    this.enemies = this.add.group();
    this.createEnemies();

    // -- Boss (Trumplethinpen) --
    this.createBoss();

    // -- Speech bubbles container --
    this.speechBubbles = this.add.group();

    // -- Camera follows player --
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 2400, GAME_HEIGHT);

    // -- Collisions --
    this.platformCollider = this.physics.add.collider(this.player, this.platforms);

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

    // -- Enemy respawn timer --
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.checkRespawns(),
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

    // -- State transition flash overlay --
    this.stateFlash = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0
    ).setScrollFactor(0).setDepth(99);
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
    // Ground spans the full level (index 0 — never hidden)
    this.addPlatform(0, 530, 2400, 70, true);

    // Elevated platforms for jumping around
    this.addPlatform(150, 430, 180, 16, false);
    this.addPlatform(400, 370, 150, 16, false);
    this.addPlatform(620, 320, 130, 16, false);
    this.addPlatform(830, 400, 160, 16, false);
    this.addPlatform(1000, 340, 140, 16, false);
    this.addPlatform(1250, 300, 120, 16, false);
    this.addPlatform(1450, 420, 180, 16, false);
    this.addPlatform(1650, 360, 140, 16, false);
    this.addPlatform(1850, 300, 160, 16, false);
    this.addPlatform(2050, 400, 130, 16, false);
    this.addPlatform(2200, 340, 150, 16, false);
  }

  addPlatform(x, y, w, h, isGround) {
    // Draw platform graphic
    const gfx = this.add.graphics();
    gfx.fillStyle(0x8B5E3C, 1);
    gfx.fillRect(x, y, w, h);
    gfx.lineStyle(2, 0x5C3A1E, 1);
    gfx.strokeRect(x, y, w, h);

    // Physics body
    const zone = this.add.zone(x + w / 2, y + h / 2, w, h);
    this.physics.add.existing(zone, true);
    zone.isGround = isGround;
    this.platforms.add(zone);

    if (!isGround) {
      this.platformGraphics.push({ gfx, zone });
    }
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
    const flipY = this.realityState === 2 ? -1 : 1;

    // Body (white rectangle)
    g.fillStyle(0xffffff, alpha);
    g.fillRect(-10, -8 * flipY, 20, 30 * flipY);

    // Head (white circle)
    g.fillStyle(0xffffff, alpha);
    g.fillCircle(0, -18 * flipY, 12);

    // Eyes
    g.fillStyle(0x000000, alpha);
    g.fillCircle(-4, -20 * flipY, 2);
    g.fillCircle(4, -20 * flipY, 2);

    // Knife (small line extending from body)
    const knifeDir = this.playerFacing;
    g.lineStyle(3, 0xcccccc, alpha);
    g.lineBetween(knifeDir * 10, 0, knifeDir * 28, -5 * flipY);
    // Knife handle
    g.lineStyle(4, 0x884422, alpha);
    g.lineBetween(knifeDir * 8, 2 * flipY, knifeDir * 14, -1 * flipY);

    // Attack slash visual
    if (this.isAttacking) {
      g.lineStyle(2, 0xffff00, 0.8);
      g.beginPath();
      g.arc(knifeDir * 20, -5 * flipY, 25, -0.8 * knifeDir, 0.8 * knifeDir, false);
      g.strokePath();
    }
  }

  // ---- GERALD CREATION ----
  createGerald() {
    this.gerald = this.add.container(1950, 500);

    const gfx = this.add.graphics();
    // Green pizza body
    gfx.fillStyle(0x44cc44, 1);
    gfx.fillCircle(0, 0, 20);
    gfx.lineStyle(3, 0x228822, 1);
    gfx.strokeCircle(0, 0, 20);
    // Happy eyes
    gfx.fillStyle(0xffffff, 1);
    gfx.fillCircle(-6, -5, 5);
    gfx.fillCircle(6, -5, 5);
    gfx.fillStyle(0x000000, 1);
    gfx.fillCircle(-5, -4, 2);
    gfx.fillCircle(7, -4, 2);
    // Smile
    gfx.lineStyle(2, 0x116611, 1);
    gfx.beginPath();
    gfx.arc(0, 2, 8, 0, Math.PI, false);
    gfx.strokePath();
    // Little arms waving
    gfx.lineStyle(2, 0x44cc44, 1);
    gfx.lineBetween(-20, 0, -30, -12);
    gfx.lineBetween(20, 0, 30, -12);

    this.gerald.add(gfx);
    this.gerald.geraldGfx = gfx;

    // GERALD label
    this.geraldLabel = this.add.text(1950, 470, 'GERALD', {
      fontSize: '14px',
      fontFamily: 'Courier New, monospace',
      fontStyle: 'bold',
      color: '#44ff44',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.gerald.setVisible(true);
    this.geraldLabel.setVisible(true);
  }

  // ---- GERALD SAVE CHECK ----
  checkGeraldRescue() {
    if (this.geraldSaved || this.geraldTimer <= 0) return;
    if (!this.gerald.visible) return;

    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, this.gerald.x, this.gerald.y
    );

    if (dist < 50) {
      this.saveGerald();
    }
  }

  saveGerald() {
    this.geraldSaved = true;

    // Gerald jump animation
    this.tweens.add({
      targets: this.gerald,
      y: this.gerald.y - 80,
      duration: 300,
      yoyo: true,
      ease: 'Power2',
      repeat: 2,
    });

    // Success text
    const saveText = this.add.text(this.gerald.x, this.gerald.y - 60, 'GERALD SAVED! \uD83C\uDF89', {
      fontSize: '28px',
      fontFamily: 'Impact, sans-serif',
      fontStyle: 'bold',
      color: '#44ff44',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(80);

    this.tweens.add({
      targets: saveText,
      y: saveText.y - 60,
      alpha: 0,
      duration: 2500,
      ease: 'Power1',
      onComplete: () => saveText.destroy(),
    });

    // Camera celebration
    this.cameras.main.flash(500, 68, 255, 68, true);

    // Reset timer and Gerald after delay — he reappears for next cycle
    this.time.delayedCall(3000, () => {
      this.geraldTimer = GERALD_TIME;
      this.hudGeraldText.setColor('#ff8844');
      this.geraldSaved = false;
    });
  }

  // ---- ENEMY CREATION ----
  createEnemies() {
    // Cheese Pizza Guys (tier 1)
    const cheesePositions = [
      { x: 500, y: 500, patrolLeft: 400, patrolRight: 650 },
      { x: 850, y: 500, patrolLeft: 750, patrolRight: 1000 },
      { x: 1600, y: 500, patrolLeft: 1500, patrolRight: 1750 },
      { x: 650, y: 290, patrolLeft: 620, patrolRight: 750 },
      { x: 1700, y: 330, patrolLeft: 1650, patrolRight: 1790 },
    ];

    cheesePositions.forEach((pos, idx) => {
      this.createEnemy(pos.x, pos.y, pos.patrolLeft, pos.patrolRight, idx, 'cheese');
    });

    // Pepperoni Guys (tier 2) — faster, tougher
    const pepPositions = [
      { x: 1200, y: 500, patrolLeft: 1100, patrolRight: 1350 },
      { x: 2000, y: 500, patrolLeft: 1900, patrolRight: 2150 },
      { x: 1050, y: 310, patrolLeft: 1000, patrolRight: 1140 },
    ];

    pepPositions.forEach((pos, idx) => {
      this.createEnemy(pos.x, pos.y, pos.patrolLeft, pos.patrolRight, 100 + idx, 'pepperoni');
    });

    // Grande Margherita (mini-boss) — large, slow, shockwave
    this.createEnemy(1450, 490, 1380, 1550, 200, 'margherita');
  }

  createEnemy(x, y, patrolLeft, patrolRight, id, type) {
    const container = this.add.container(x, y);
    this.physics.world.enable(container);

    const isMargherita = type === 'margherita';
    const bodySize = isMargherita ? 56 : 36;
    container.body.setSize(bodySize, bodySize);
    container.body.setOffset(-bodySize / 2, -bodySize / 2);
    container.body.setCollideWorldBounds(true);

    const gfx = this.add.graphics();
    container.add(gfx);

    const hp = type === 'cheese' ? 3 : type === 'pepperoni' ? 5 : 12;
    const speed = type === 'cheese' ? 60 : type === 'pepperoni' ? 100 : 35;

    // Enemy data
    container.enemyData = {
      id: id,
      type: type,
      hp: hp,
      maxHP: hp,
      patrolLeft: patrolLeft,
      patrolRight: patrolRight,
      speed: speed,
      direction: 1,
      alerted: false,
      alive: true,
      greaseCooldown: 0,
      speechTimer: 0,
      crybabyIndex: 0,
      gfx: gfx,
      spawnX: x,
      spawnY: y,
      // Margherita shockwave
      shockwaveCooldown: 0,
      isJumping: false,
    };

    this.physics.add.collider(container, this.platforms);
    this.enemies.add(container);
  }

  drawEnemy(container) {
    const g = container.enemyData.gfx;
    const data = container.enemyData;
    g.clear();

    if (!data.alive) return;

    if (data.type === 'cheese') {
      this.drawCheeseEnemy(g, data);
    } else if (data.type === 'pepperoni') {
      this.drawPepperoniEnemy(g, data);
    } else if (data.type === 'margherita') {
      this.drawMargheritaEnemy(g, data);
    }
  }

  drawCheeseEnemy(g, data) {
    // Pizza body — glorious orange circle
    g.fillStyle(0xff8800, 1);
    g.fillCircle(0, 0, 18);
    g.lineStyle(3, 0xcc6600, 1);
    g.strokeCircle(0, 0, 18);

    // Toppings — small red circles
    g.fillStyle(0xcc2200, 1);
    g.fillCircle(-6, -5, 4);
    g.fillCircle(5, 3, 3);
    g.fillCircle(-2, 8, 3);
    g.fillCircle(8, -7, 3);

    // Evil eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-5, -3, 4);
    g.fillCircle(5, -3, 4);
    g.fillStyle(0x000000, 1);
    g.fillCircle(-4, -2, 2);
    g.fillCircle(6, -2, 2);

    if (data.alerted) {
      this.drawEnemyLimbs(g, 0xcc6600);
      // Angry mouth
      g.lineStyle(2, 0x880000, 1);
      g.beginPath();
      g.arc(0, 5, 6, Math.PI, 0, false);
      g.strokePath();
    }
  }

  drawPepperoniEnemy(g, data) {
    // Darker orange/red pizza body
    g.fillStyle(0xcc4400, 1);
    g.fillCircle(0, 0, 18);
    g.lineStyle(3, 0x992200, 1);
    g.strokeCircle(0, 0, 18);

    // Pepperoni toppings — larger, more prominent
    g.fillStyle(0x881100, 1);
    g.fillCircle(-7, -5, 5);
    g.fillCircle(6, 4, 5);
    g.fillCircle(-3, 8, 4);
    g.fillCircle(9, -6, 4);
    g.fillCircle(0, -9, 3);

    // Meaner eyes
    g.fillStyle(0xffff00, 1);
    g.fillCircle(-5, -3, 4);
    g.fillCircle(5, -3, 4);
    g.fillStyle(0x000000, 1);
    g.fillCircle(-4, -2, 2);
    g.fillCircle(6, -2, 2);

    if (data.alerted) {
      this.drawEnemyLimbs(g, 0x992200);
      // The Stick — pepperoni rod weapon extending from arm
      const dir = data.direction;
      g.lineStyle(5, 0x661100, 1);
      g.lineBetween(dir * 30, -10, dir * 55, -20);
      g.fillStyle(0x881100, 1);
      g.fillCircle(dir * 55, -20, 4);
      // Angry mouth with teeth
      g.lineStyle(2, 0xff0000, 1);
      g.beginPath();
      g.arc(0, 5, 6, Math.PI, 0, false);
      g.strokePath();
      g.fillStyle(0xffffff, 1);
      g.fillRect(-4, 5, 3, 3);
      g.fillRect(2, 5, 3, 3);
    }
  }

  drawMargheritaEnemy(g, data) {
    // Much larger pizza circle
    g.fillStyle(0xff9944, 1);
    g.fillCircle(0, 0, 28);
    g.lineStyle(4, 0xcc7722, 1);
    g.strokeCircle(0, 0, 28);

    // Basil leaves (green spots)
    g.fillStyle(0x44aa22, 1);
    g.fillCircle(-10, -8, 5);
    g.fillCircle(8, 6, 5);
    g.fillCircle(-5, 12, 4);
    g.fillCircle(12, -10, 4);

    // Mozzarella blobs
    g.fillStyle(0xffffcc, 0.7);
    g.fillCircle(-12, 4, 6);
    g.fillCircle(5, -12, 5);
    g.fillCircle(10, 10, 5);

    // Eyes — bigger, expressive
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-8, -5, 6);
    g.fillCircle(8, -5, 6);
    g.fillStyle(0x000000, 1);
    g.fillCircle(-7, -4, 3);
    g.fillCircle(9, -4, 3);
    // Eyelashes
    g.lineStyle(1, 0x000000, 1);
    g.lineBetween(-12, -10, -8, -8);
    g.lineBetween(-7, -11, -6, -8);
    g.lineBetween(5, -11, 6, -8);
    g.lineBetween(10, -10, 12, -8);

    // Lipstick mouth
    g.fillStyle(0xcc2255, 1);
    g.beginPath();
    g.arc(0, 6, 7, 0, Math.PI, false);
    g.fillPath();

    if (data.alerted) {
      this.drawEnemyLimbs(g, 0xcc7722, true);
    }
  }

  drawEnemyLimbs(g, color, large) {
    const scale = large ? 1.4 : 1;
    g.lineStyle(2, color, 1);
    // Arms
    g.lineBetween(-18 * scale, 0, -30 * scale, -10 * scale);
    g.lineBetween(18 * scale, 0, 30 * scale, -10 * scale);
    g.fillStyle(color, 1);
    g.fillCircle(-30 * scale, -10 * scale, 3 * scale);
    g.fillCircle(30 * scale, -10 * scale, 3 * scale);
    // Legs
    g.lineBetween(-8 * scale, 18 * scale, -14 * scale, 35 * scale);
    g.lineBetween(8 * scale, 18 * scale, 14 * scale, 35 * scale);
    g.fillCircle(-14 * scale, 35 * scale, 3 * scale);
    g.fillCircle(14 * scale, 35 * scale, 3 * scale);
  }

  // ---- BOSS: TRUMPLETHINPEN ----
  createBoss() {
    this.boss = this.add.container(1225, 480);
    this.boss.setVisible(false);

    const gfx = this.add.graphics();
    this.boss.add(gfx);
    this.boss.bossGfx = gfx;

    this.physics.world.enable(this.boss);
    this.boss.body.setSize(50, 60);
    this.boss.body.setOffset(-25, -30);
    this.boss.body.setCollideWorldBounds(true);
    this.boss.body.setImmovable(true);

    this.physics.add.collider(this.boss, this.platforms);
    this.drawBoss();
  }

  drawBoss() {
    const g = this.boss.bossGfx;
    g.clear();

    if (this.bossDefeated) return;

    // Large green troll blob body
    g.fillStyle(0x44aa44, 1);
    g.fillEllipse(0, 10, 50, 60);
    g.lineStyle(2, 0x228822, 1);
    g.strokeEllipse(0, 10, 50, 60);

    // Head (slightly smaller green circle on top)
    g.fillStyle(0x55bb55, 1);
    g.fillCircle(0, -22, 20);

    // Blonde hair — yellow scribble on top
    g.lineStyle(3, 0xffdd44, 1);
    g.beginPath();
    g.moveTo(-15, -35);
    g.cubicBezierTo(-8, -48, 0, -42, 5, -48);
    g.strokePath();
    g.beginPath();
    g.moveTo(-10, -38);
    g.cubicBezierTo(-3, -50, 5, -44, 12, -48);
    g.strokePath();
    g.beginPath();
    g.moveTo(-5, -36);
    g.cubicBezierTo(2, -52, 8, -46, 15, -42);
    g.strokePath();
    // Extra swoosh
    g.lineStyle(4, 0xeebb22, 1);
    g.beginPath();
    g.moveTo(5, -40);
    g.cubicBezierTo(12, -50, 18, -44, 22, -36);
    g.strokePath();

    // Eyes — squinty
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(-7, -24, 8, 5);
    g.fillEllipse(7, -24, 8, 5);
    g.fillStyle(0x2244aa, 1);
    g.fillCircle(-7, -24, 2);
    g.fillCircle(7, -24, 2);

    // Mouth — frowning/scowling
    g.lineStyle(2, 0x226622, 1);
    g.beginPath();
    g.arc(0, -14, 8, 0.2, Math.PI - 0.2, true);
    g.strokePath();

    // Tiny pen in right hand
    g.lineStyle(1, 0x222222, 1);
    g.lineBetween(25, 5, 35, -8);
    g.fillStyle(0x1111aa, 1);
    g.fillRect(33, -10, 4, 8);
    // Pen tip
    g.fillStyle(0x888888, 1);
    g.fillTriangle(34, -10, 36, -10, 35, -14);

    // Arms
    g.lineStyle(3, 0x44aa44, 1);
    g.lineBetween(-25, 5, -35, -5);
    g.lineBetween(25, 5, 33, -2);

    // HP bar above
    if (this.bossActive) {
      const barW = 60;
      const barH = 6;
      const hpFrac = this.bossHP / 10;
      g.fillStyle(0x333333, 1);
      g.fillRect(-barW / 2, -50, barW, barH);
      g.fillStyle(0xff2222, 1);
      g.fillRect(-barW / 2, -50, barW * hpFrac, barH);
      g.lineStyle(1, 0xffffff, 0.5);
      g.strokeRect(-barW / 2, -50, barW, barH);
    }
  }

  updateBoss(delta) {
    if (this.bossDefeated) return;

    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, 1225, this.boss.y
    );

    // Activate boss when player approaches bridge
    if (!this.bossActive && dist < 250) {
      this.bossActive = true;
      this.boss.setVisible(true);
      // Boss entrance — rise up
      this.tweens.add({
        targets: this.boss,
        y: 480,
        duration: 500,
        ease: 'Power2',
      });
      // Show name
      const nameText = this.add.text(1225, 420, 'TRUMPLETHINPEN', {
        fontSize: '16px',
        fontFamily: 'Impact, sans-serif',
        color: '#ffdd44',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(60);
      this.tweens.add({
        targets: nameText,
        alpha: 0,
        y: 400,
        duration: 3000,
        onComplete: () => nameText.destroy(),
      });
    }

    if (!this.bossActive) return;

    // Boss faces player
    const faceDir = this.player.x > this.boss.x ? 1 : -1;

    // Attack: throw executive orders periodically
    this.bossAttackTimer -= delta;
    if (this.bossAttackTimer <= 0) {
      this.bossAttackTimer = 2000; // every 2 seconds
      this.throwExecutiveOrder();
    }

    // Damage player on contact
    const contactDist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, this.boss.x, this.boss.y
    );
    if (contactDist < 40) {
      this.damagePlayer();
    }

    this.drawBoss();
  }

  throwExecutiveOrder() {
    if (this.bossDefeated) return;

    const order = this.add.container(this.boss.x, this.boss.y - 30);
    this.physics.world.enable(order);

    const gfx = this.add.graphics();
    // White rectangle — executive order paper
    gfx.fillStyle(0xffffff, 0.95);
    gfx.fillRect(-15, -10, 30, 20);
    gfx.lineStyle(1, 0x888888, 1);
    gfx.strokeRect(-15, -10, 30, 20);
    // Lines of "text"
    gfx.fillStyle(0x222222, 0.5);
    gfx.fillRect(-11, -6, 22, 2);
    gfx.fillRect(-11, -1, 18, 2);
    gfx.fillRect(-11, 4, 20, 2);
    // Signature scrawl
    gfx.lineStyle(1, 0x1111aa, 1);
    gfx.beginPath();
    gfx.moveTo(-5, 8);
    gfx.lineTo(0, 6);
    gfx.lineTo(5, 9);
    gfx.lineTo(10, 7);
    gfx.strokePath();

    order.add(gfx);

    // Float toward player slowly
    const angle = Phaser.Math.Angle.Between(
      this.boss.x, this.boss.y, this.player.x, this.player.y
    );
    order.body.setVelocity(
      Math.cos(angle) * 80,
      Math.sin(angle) * 40 + 30 // float downward bias
    );
    order.body.setAllowGravity(false);

    order.orderData = { alive: true };
    this.executiveOrders.add(order);

    // Auto-destroy after 5 seconds
    this.time.delayedCall(5000, () => {
      if (order && order.scene) order.destroy();
    });
  }

  checkExecutiveOrders() {
    this.executiveOrders.getChildren().forEach(order => {
      if (!order.orderData || !order.orderData.alive) return;

      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, order.x, order.y
      );

      if (dist < 25) {
        this.damagePlayer();
        order.orderData.alive = false;
        // Paper crumple effect
        this.tweens.add({
          targets: order,
          scaleX: 0,
          scaleY: 0,
          alpha: 0,
          duration: 200,
          onComplete: () => order.destroy(),
        });
      }
    });
  }

  hitBoss() {
    if (this.bossDefeated || !this.bossActive) return;

    this.bossHP--;

    // Speech bubble
    this.showBossSpeechBubble(TRUMP_LINES[this.bossLineIndex % TRUMP_LINES.length]);
    this.bossLineIndex++;

    // Knockback boss slightly
    this.cameras.main.shake(100, 0.008);

    if (this.bossHP <= 0) {
      this.defeatBoss();
    }

    this.drawBoss();
  }

  showBossSpeechBubble(text) {
    const bx = this.boss.x;
    const by = this.boss.y - 70;

    const bubbleWidth = Math.min(text.length * 7 + 20, 350);
    const bubble = this.add.graphics();
    bubble.fillStyle(0xffffff, 0.95);
    bubble.fillRoundedRect(bx - bubbleWidth / 2, by - 16, bubbleWidth, 28, 8);
    bubble.fillTriangle(bx - 5, by + 12, bx + 5, by + 12, bx, by + 20);

    const bubbleText = this.add.text(bx, by, text, {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      color: '#222222',
      wordWrap: { width: bubbleWidth - 10 },
    }).setOrigin(0.5);

    this.time.delayedCall(2500, () => {
      bubble.destroy();
      bubbleText.destroy();
    });
  }

  defeatBoss() {
    this.bossDefeated = true;
    this.bossActive = false;

    // Pen falls animation
    const penFall = this.add.graphics();
    penFall.fillStyle(0x1111aa, 1);
    penFall.fillRect(-2, -4, 4, 8);
    penFall.fillStyle(0x888888, 1);
    penFall.fillTriangle(-1, -4, 1, -4, 0, -7);
    penFall.x = this.boss.x + 35;
    penFall.y = this.boss.y - 8;

    this.tweens.add({
      targets: penFall,
      y: penFall.y + 100,
      angle: 180,
      duration: 800,
      onComplete: () => {
        this.time.delayedCall(2000, () => penFall.destroy());
      },
    });

    // Boss shrinks
    this.tweens.add({
      targets: this.boss,
      scaleX: 0.1,
      scaleY: 0.1,
      alpha: 0.3,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        this.boss.setVisible(false);
      },
    });

    // Victory text
    const victoryText = this.add.text(1225, 400, 'EXECUTIVE ORDER REVOKED', {
      fontSize: '24px',
      fontFamily: 'Impact, sans-serif',
      fontStyle: 'bold',
      color: '#ffdd44',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(80);

    this.tweens.add({
      targets: victoryText,
      y: 350,
      alpha: 0,
      duration: 4000,
      ease: 'Power1',
      onComplete: () => victoryText.destroy(),
    });

    // Destroy all executive orders
    this.executiveOrders.clear(true, true);
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
        this.hudHearts.fillStyle(0xff2244, 1);
      } else {
        this.hudHearts.fillStyle(0x442222, 1);
      }
      this.hudHearts.fillCircle(hx - 5, hy - 3, 7);
      this.hudHearts.fillCircle(hx + 5, hy - 3, 7);
      this.hudHearts.fillTriangle(hx - 12, hy, hx + 12, hy, hx, hy + 12);
    }
  }

  // ---- GERALD COUNTDOWN ----
  tickGerald() {
    if (this.geraldTimer <= 0 || this.geraldSaved) return;

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
    // Hide Gerald
    this.gerald.setVisible(false);
    this.geraldLabel.setVisible(false);

    // Red flash
    this.failOverlay.setAlpha(0.6);
    this.failText.setVisible(true);

    // Pause 3 seconds then reset
    this.time.delayedCall(3000, () => {
      this.failOverlay.setAlpha(0);
      this.failText.setVisible(false);
      this.geraldTimer = GERALD_TIME;
      this.hudGeraldText.setColor('#ff8844');
      this.gerald.setVisible(true);
      this.geraldLabel.setVisible(true);
    });
  }

  // ---- REALITY STATE SWITCHING ----
  switchRealityState(state) {
    if (this.realityState === state) return;
    const prevState = this.realityState;
    this.realityState = state;

    const names = { 1: 'PHYSICAL', 2: 'INVERSE', 3: 'COIN STATE' };
    const colors = { 1: '#ff4444', 2: '#4488ff', 3: '#ffdd00' };
    const flashColors = { 1: 0xff4444, 2: 0x4488ff, 3: 0xffdd00 };

    this.hudStateText.setText(names[state]);
    this.hudStateText.setColor(colors[state]);
    this.drawStateDot();

    // Visual flash transition
    this.stateFlash.setFillStyle(flashColors[state], 0.5);
    this.tweens.add({
      targets: this.stateFlash,
      alpha: { from: 0.5, to: 0 },
      duration: 300,
      ease: 'Power2',
    });

    // Apply gravity changes
    if (state === 1) {
      this.physics.world.gravity.y = GRAVITY;
    } else if (state === 2) {
      // Instant snap — set gravity and give an initial velocity kick
      this.physics.world.gravity.y = -GRAVITY;
      // Snap to ceiling direction instantly
      this.player.body.setVelocityY(-300);
    } else if (state === 3) {
      this.physics.world.gravity.y = GRAVITY * 0.3; // floaty in coin state
    }

    // Coin state: disable ALL platform collision (player walks through everything)
    if (state === 3) {
      this.platformCollider.active = false;
      // Make platforms semi-transparent
      this.platformGraphics.forEach(p => p.gfx.setAlpha(0.3));
    } else {
      this.platformCollider.active = true;
      this.platformGraphics.forEach(p => p.gfx.setAlpha(1));
    }

    // Redraw player for transparency / flip change
    this.drawPlayer();
  }

  // ---- ATTACK ----
  performAttack() {
    if (this.attackCooldown > 0) return;
    this.isAttacking = true;
    this.attackCooldown = 300; // ms

    // Check enemies in range
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy.enemyData || !enemy.enemyData.alive) return;
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, enemy.x, enemy.y
      );
      const range = enemy.enemyData.type === 'margherita' ? ATTACK_RANGE + 15 : ATTACK_RANGE;
      if (dist < range) {
        this.hitEnemy(enemy);
      }
    });

    // Check boss in range
    if (this.bossActive && !this.bossDefeated) {
      const bossDist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.boss.x, this.boss.y
      );
      if (bossDist < ATTACK_RANGE + 10) {
        this.hitBoss();
      }
    }

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

    // Show speech bubble based on type
    const lines = data.type === 'pepperoni' ? PEPPERONI_LINES : CRYBABY_LINES;
    this.showSpeechBubble(enemy, lines[data.crybabyIndex % lines.length]);
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

    // Store respawn data
    this.deadEnemyData.push({
      x: data.spawnX,
      y: data.spawnY,
      patrolLeft: data.patrolLeft,
      patrolRight: data.patrolRight,
      id: data.id,
      type: data.type,
      timer: ENEMY_RESPAWN_TIME,
    });

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

    // Margherita defeat line
    if (data.type === 'margherita') {
      const defeatText = this.add.text(enemy.x, enemy.y - 30, '"I was just doing a bit."', {
        fontSize: '14px',
        fontFamily: 'Georgia, serif',
        fontStyle: 'italic',
        color: '#ffaacc',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);
      this.tweens.add({
        targets: defeatText,
        y: defeatText.y - 50,
        alpha: 0,
        duration: 3000,
        onComplete: () => defeatText.destroy(),
      });
    }

    // Remove enemy
    enemy.destroy();
  }

  // ---- ENEMY RESPAWNING ----
  checkRespawns() {
    for (let i = this.deadEnemyData.length - 1; i >= 0; i--) {
      const data = this.deadEnemyData[i];
      data.timer -= 1000;
      if (data.timer <= 0) {
        // Respawn this enemy
        this.createEnemy(data.x, data.y, data.patrolLeft, data.patrolRight, data.id, data.type);
        this.deadEnemyData.splice(i, 1);
      }
    }
  }

  // ---- MARGHERITA SHOCKWAVE ----
  margheritaShockwave(enemy) {
    const data = enemy.enemyData;
    if (data.shockwaveCooldown > 0) return;
    data.shockwaveCooldown = 4000; // 4 second cooldown

    // Jump up
    enemy.body.setVelocityY(-250);
    data.isJumping = true;

    // After landing, create shockwave
    this.time.delayedCall(800, () => {
      if (!data.alive) return;
      data.isJumping = false;

      // Shockwave visual — expanding ring
      const wave = this.add.graphics();
      let radius = 10;
      const maxRadius = 120;

      const waveTimer = this.time.addEvent({
        delay: 16,
        loop: true,
        callback: () => {
          wave.clear();
          radius += 4;
          const alpha = 1 - (radius / maxRadius);
          wave.lineStyle(3, 0xff6622, alpha);
          wave.strokeCircle(enemy.x, enemy.y + 20, radius);

          // Damage player if in range
          const dist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y, enemy.x, enemy.y
          );
          if (dist < radius + 10 && dist > radius - 20 && alpha > 0.2) {
            this.damagePlayer();
          }

          if (radius >= maxRadius) {
            waveTimer.remove();
            wave.destroy();
          }
        },
      });

      // Camera shake for impact
      this.cameras.main.shake(200, 0.01);
    });
  }

  // ---- GREASE TRAIL ----
  leaveGreaseTrail(enemy) {
    const data = enemy.enemyData;
    if (data.greaseCooldown > 0) return;
    data.greaseCooldown = 200;

    const grease = this.add.graphics();
    const color = data.type === 'pepperoni' ? 0xcc6600 :
                  data.type === 'margherita' ? 0xffbb44 : 0xffdd00;
    grease.fillStyle(color, 0.25);
    grease.fillEllipse(enemy.x, enemy.y + 18, 16, 6);
    this.greaseTrails.add(grease);

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
      // Death — go to death screen
      this.time.delayedCall(800, () => {
        this.scene.start('DeathScene');
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

    // -- Gerald rescue check --
    this.checkGeraldRescue();

    // -- Gerald label follows Gerald --
    if (this.gerald && this.gerald.visible && this.geraldLabel) {
      this.geraldLabel.setPosition(this.gerald.x, this.gerald.y - 30);
    }

    // -- Boss update --
    this.updateBoss(delta);
    this.checkExecutiveOrders();

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
      const detectRange = data.type === 'pepperoni' ? ENEMY_DETECT_RANGE * 1.3 :
                          data.type === 'margherita' ? ENEMY_DETECT_RANGE * 1.5 :
                          ENEMY_DETECT_RANGE;
      data.alerted = dist < detectRange;

      // Redraw if alert state changed
      if (data.alerted !== wasAlerted) {
        this.drawEnemy(enemy);
      }

      // Movement: patrol or chase
      if (data.alerted) {
        // Chase player
        const chaseDir = this.player.x > enemy.x ? 1 : -1;
        data.direction = chaseDir;
        enemy.body.setVelocityX(chaseDir * data.speed * 1.5);

        // Margherita shockwave when close
        if (data.type === 'margherita' && dist < 100) {
          data.shockwaveCooldown -= delta;
          if (data.shockwaveCooldown <= 0) {
            this.margheritaShockwave(enemy);
          }
        }
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
      const contactRange = data.type === 'margherita' ? 40 :
                           data.type === 'pepperoni' ? 35 : 30;
      if (dist < contactRange) {
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
  scene: [MenuScene, IntroScene, GameScene, DeathScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// Let the grease flow
const game = new Phaser.Game(config);
