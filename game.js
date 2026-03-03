// ============================================================
// ESCAPE FROM PEPSTEIN ISLAND
// A princess. A knife. A grease-soaked hellscape.
// Phaser 3 — Canvas mode — clean rebuild
// ============================================================

const W = 1024, H = 600;
const GRAVITY = 600;
const PSPEED = 200;
const JUMP_V = -420;

// ---- MENU SCENE ----
class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    const cx = W / 2, cy = H / 2;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a0a00);
    bg.fillRect(0, 0, W, H);

    // Floating pizza decorations
    this.pizzas = [];
    for (let i = 0; i < 8; i++) {
      const g = this.add.graphics();
      const x = Phaser.Math.Between(50, W - 50);
      const y = Phaser.Math.Between(50, H - 50);
      g.fillStyle(0xcc5500, 0.5);
      g.fillCircle(0, 0, 20);
      g.fillStyle(0xaa2200, 0.6);
      g.fillCircle(-6, -5, 5);
      g.fillCircle(5, 4, 4);
      g.x = x; g.y = y;
      this.pizzas.push({ g, speed: Phaser.Math.FloatBetween(15, 40), angle: Phaser.Math.FloatBetween(0, Math.PI * 2) });
    }

    // Title
    this.add.text(cx, cy - 100, 'ESCAPE FROM\nPEPSTEIN ISLAND', {
      fontSize: '52px', fontFamily: 'Impact, sans-serif',
      color: '#ff8800', stroke: '#000', strokeThickness: 6, align: 'center'
    }).setOrigin(0.5);

    this.add.text(cx, cy + 20, 'A princess. A knife. A grease-soaked hellscape.', {
      fontSize: '18px', fontFamily: 'Georgia, serif',
      color: '#cc6600', fontStyle: 'italic'
    }).setOrigin(0.5);

    this.add.text(cx, cy + 70, '— CONTROLS —\nWASD / Arrows: Move & Jump     Space: Attack\n1 / 2 / 3: Reality States', {
      fontSize: '13px', fontFamily: 'Courier New, monospace',
      color: '#886644', align: 'center'
    }).setOrigin(0.5);

    // Blinking prompt
    this.prompt = this.add.text(cx, cy + 155, 'PRESS ENTER TO PLAY', {
      fontSize: '20px', fontFamily: 'Courier New, monospace',
      fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    this.time.addEvent({ delay: 500, loop: true, callback: () => {
      this.prompt.setVisible(!this.prompt.visible);
    }});

    // Input
    this.input.keyboard.on('keydown-ENTER', () => this.scene.start('IntroScene'));
    this.input.keyboard.on('keydown-SPACE', () => this.scene.start('IntroScene'));
  }

  update(time) {
    this.pizzas.forEach(p => {
      p.angle += 0.01;
      p.g.x += Math.cos(p.angle) * p.speed * 0.016;
      p.g.y += Math.sin(p.angle) * p.speed * 0.016;
      if (p.g.x < 0) p.g.x = W;
      if (p.g.x > W) p.g.x = 0;
      if (p.g.y < 0) p.g.y = H;
      if (p.g.y > H) p.g.y = 0;
    });
  }
}

// ---- INTRO SCENE ----
class IntroScene extends Phaser.Scene {
  constructor() { super({ key: 'IntroScene' }); }

  create() {
    this.cameras.main.setBackgroundColor('#000000');
    const cards = [
      'Throother finds the kitchen.',
      'There is a pizza knife.',
      'There is flour everywhere.',
      "Let's f***ing go."
    ];
    let idx = 0;
    const txt = this.add.text(W / 2, H / 2, '', {
      fontSize: '32px', fontFamily: 'Georgia, serif', color: '#ffffff', align: 'center'
    }).setOrigin(0.5).setAlpha(0);

    const next = () => {
      if (idx >= cards.length) { this.scene.start('GameScene'); return; }
      txt.setText(cards[idx++]).setAlpha(0);
      this.tweens.add({
        targets: txt, alpha: 1, duration: 400,
        onComplete: () => {
          this.time.delayedCall(1600, () => {
            this.tweens.add({
              targets: txt, alpha: 0, duration: 400,
              onComplete: next
            });
          });
        }
      });
    };
    next();
  }
}

// ---- GAME SCENE ----
class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  create() {
    this.cameras.main.setBackgroundColor('#2a1a0a');
    this.physics.world.setBounds(0, 0, 2400, H);

    // State
    this.state = 1; // 1=Physical, 2=Inverse, 3=Coin
    this.hp = 3;
    this.geraldTimer = 300;
    this.iFrames = 0;
    this.facing = 1;
    this.atkTimer = 0;
    this.isAtk = false;

    // Draw world
    this.bgGfx = this.add.graphics().setDepth(0);
    this.drawBG();

    // Platforms
    this.platforms = this.physics.add.staticGroup();
    this.platGfx = this.add.graphics().setDepth(1);
    this.makePlatforms();

    // Player physics body (invisible rect, drive rendering manually)
    this.pBody = this.physics.add.image(100, 450, '__DEFAULT').setVisible(false);
    this.pBody.body.setSize(24, 48);
    this.pBody.body.setCollideWorldBounds(true);
    this.pBody.body.setBounce(0.05);
    this.physics.add.collider(this.pBody, this.platforms);

    // Player visual graphics
    this.pGfx = this.add.graphics().setDepth(5);
    this.atkGfx = this.add.graphics().setDepth(6);

    // Gerald
    this.geraldBody = this.physics.add.image(1950, 490, '__DEFAULT').setVisible(false);
    this.geraldBody.body.setSize(40, 40);
    this.geraldBody.body.setImmovable(true);
    this.physics.add.collider(this.geraldBody, this.platforms);
    this.geraldGfx = this.add.graphics().setDepth(4);
    this.geraldLabel = this.add.text(1950, 460, 'GERALD', {
      fontSize: '13px', fontFamily: 'Courier New, monospace', fontStyle: 'bold',
      color: '#44ff44', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(5);
    this.drawGerald();

    // Enemies
    this.enemies = [];
    this.makeEnemies();

    // Camera
    this.cameras.main.startFollow(this.pBody, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 2400, H);

    // HUD (fixed to camera)
    this.hudState = this.add.text(16, 16, 'PHYSICAL', {
      fontSize: '18px', fontFamily: 'Courier New, monospace', fontStyle: 'bold',
      color: '#ff4444'
    }).setScrollFactor(0).setDepth(20);

    this.hudGerald = this.add.text(W - 16, 16, '🦈 GERALD: 5:00', {
      fontSize: '18px', fontFamily: 'Courier New, monospace', fontStyle: 'bold',
      color: '#ff8844'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(20);

    this.hudHP = this.add.graphics().setScrollFactor(0).setDepth(20);
    this.drawHP();

    // HUD border
    this.hudBorder = this.add.graphics().setScrollFactor(0).setDepth(19);
    this.drawBorder();

    // Fail overlay
    this.failBg = this.add.rectangle(W / 2, H / 2, W, H, 0xff0000, 0).setScrollFactor(0).setDepth(50);
    this.failTxt = this.add.text(W / 2, H / 2, 'GERALD HAS BEEN FED TO THE SHARKS.\nYOU FAILED HIM.', {
      fontSize: '28px', fontFamily: 'Impact, sans-serif', color: '#fff',
      stroke: '#000', strokeThickness: 4, align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51).setVisible(false);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    // Gerald countdown timer
    this.time.addEvent({ delay: 1000, loop: true, callback: this.tickGerald, callbackScope: this });

    // Grease trail (single shared graphics, redrawn periodically)
    this.greaseGfx = this.add.graphics().setDepth(2);
    this.greasePts = [];
    this.time.addEvent({ delay: 300, loop: true, callback: this.redrawGrease, callbackScope: this });
  }

  drawBG() {
    const g = this.bgGfx;
    g.clear();
    // Sky/ground fill
    g.fillStyle(0x1a0a00); g.fillRect(0, 0, 2400, H);
    // Hills
    g.fillStyle(0x2a1500);
    for (let i = 0; i < 6; i++) {
      const hx = i * 450 + 100;
      g.fillTriangle(hx - 180, 400, hx, 160 + i * 20, hx + 180, 400);
    }
    // Yacht
    g.fillStyle(0xffffff, 0.9); g.fillRect(1860, 360, 230, 55);
    g.fillStyle(0xdddddd, 0.9); g.fillRect(1910, 320, 110, 40);
    g.fillStyle(0x4488cc); g.fillRect(1920, 328, 18, 14); g.fillRect(1948, 328, 18, 14); g.fillRect(1976, 328, 18, 14);
    g.lineStyle(3, 0xaaaaaa); g.lineBetween(1965, 320, 1965, 230);
    g.fillStyle(0xff0000, 0.8); g.fillTriangle(1965, 230, 1965, 250, 1988, 240);
    // Bridge
    g.fillStyle(0x886644); g.fillRect(1100, 385, 250, 14);
    g.fillStyle(0x664422); g.fillRect(1112, 399, 14, 80); g.fillRect(1330, 399, 14, 80);
    g.lineStyle(2, 0x888888, 0.7);
    g.lineBetween(1119, 325, 1119, 385); g.lineBetween(1337, 325, 1337, 385);
    g.lineBetween(1119, 325, 1337, 325);
    // Bridge sign
    g.fillStyle(0x335522, 0.9); g.fillRect(1155, 345, 190, 28);
    this.add.text(1250, 359, 'TRUMPLETHINPEN BRIDGE', {
      fontSize: '10px', fontFamily: 'Arial', fontStyle: 'bold', color: '#fff'
    }).setOrigin(0.5).setDepth(1);
    // Troll blob under bridge
    g.fillStyle(0x44aa44, 0.8);
    g.fillEllipse(1220, 465, 50, 38);
    g.fillStyle(0x55bb55, 0.8); g.fillCircle(1220, 444, 16);
    g.lineStyle(3, 0xffdd44); g.lineBetween(1210, 432, 1205, 420); g.lineBetween(1218, 432, 1228, 420);
    // Pop sign
    g.fillStyle(0x664422); g.fillRect(384, 385, 7, 78);
    g.fillStyle(0xddccaa, 0.9); g.fillRect(344, 365, 115, 28);
    g.lineStyle(2, 0x443322); g.strokeRect(344, 365, 115, 28);
    this.add.text(401, 379, 'POPULATION:\nTOO MANY PIZZA FACES', {
      fontSize: '7px', fontFamily: 'Arial', fontStyle: 'bold', color: '#442200', align: 'center'
    }).setOrigin(0.5).setDepth(1);
  }

  makePlatforms() {
    const defs = [
      [0, 530, 2400, 70],      // ground
      [150, 430, 180, 16], [400, 370, 150, 16], [620, 320, 130, 16],
      [830, 400, 160, 16], [1000, 340, 140, 16], [1250, 300, 120, 16],
      [1450, 420, 180, 16], [1650, 360, 140, 16], [1850, 300, 160, 16],
      [2050, 400, 130, 16], [2200, 340, 150, 16]
    ];
    const g = this.platGfx;
    defs.forEach(([x, y, w, h]) => {
      const zone = this.add.zone(x + w / 2, y + h / 2, w, h);
      this.physics.add.existing(zone, true);
      this.platforms.add(zone);
      g.fillStyle(0x8B5E3C); g.fillRect(x, y, w, h);
      g.lineStyle(2, 0x5C3A1E); g.strokeRect(x, y, w, h);
    });
  }

  drawPlayer() {
    const g = this.pGfx;
    g.clear();
    const px = this.pBody.x, py = this.pBody.y;
    const alpha = this.state === 3 ? 0.45 : 1;
    const fi = this.facing;

    // Body
    g.fillStyle(0xffffff, alpha); g.fillRect(px - 10, py - 24, 20, 30);
    // Head
    g.fillStyle(0xffffff, alpha); g.fillCircle(px, py - 32, 12);
    // Eyes
    g.fillStyle(0x000000, alpha);
    g.fillCircle(px - 4, py - 34, 2); g.fillCircle(px + 4, py - 34, 2);
    // Knife
    g.lineStyle(3, 0xcccccc, alpha);
    g.lineBetween(px + fi * 10, py - 6, px + fi * 28, py - 11);
    g.lineStyle(4, 0x884422, alpha);
    g.lineBetween(px + fi * 8, py - 4, px + fi * 14, py - 7);

    // Attack arc
    if (this.isAtk) {
      g.lineStyle(2, 0xffff00, 0.85);
      g.beginPath();
      g.arc(px + fi * 20, py - 10, 28, fi > 0 ? -0.8 : Math.PI - 0.8, fi > 0 ? 0.8 : Math.PI + 0.8);
      g.strokePath();
    }
  }

  drawGerald() {
    const g = this.geraldGfx;
    g.clear();
    if (!this.geraldBody.active) return;
    const gx = this.geraldBody.x, gy = this.geraldBody.y;
    g.fillStyle(0x44cc44); g.fillCircle(gx, gy, 20);
    g.lineStyle(3, 0x228822); g.strokeCircle(gx, gy, 20);
    g.fillStyle(0xffffff); g.fillCircle(gx - 6, gy - 5, 5); g.fillCircle(gx + 6, gy - 5, 5);
    g.fillStyle(0x000000); g.fillCircle(gx - 5, gy - 4, 2); g.fillCircle(gx + 7, gy - 4, 2);
    g.lineStyle(2, 0x116611);
    g.beginPath(); g.arc(gx, gy + 2, 8, 0, Math.PI); g.strokePath();
    g.lineStyle(2, 0x44cc44);
    g.lineBetween(gx - 20, gy, gx - 30, gy - 12);
    g.lineBetween(gx + 20, gy, gx + 30, gy - 12);
    this.geraldLabel.setPosition(gx, gy - 32);
  }

  makeEnemies() {
    const defs = [
      { x: 500, y: 500, l: 380, r: 650, type: 'cheese' },
      { x: 850, y: 500, l: 720, r: 1000, type: 'cheese' },
      { x: 1600, y: 500, l: 1480, r: 1750, type: 'cheese' },
      { x: 650, y: 300, l: 620, r: 750, type: 'cheese' },
      { x: 1200, y: 500, l: 1080, r: 1360, type: 'pepperoni' },
      { x: 2000, y: 500, l: 1880, r: 2150, type: 'pepperoni' },
      { x: 1450, y: 490, l: 1380, r: 1550, type: 'margherita' }
    ];

    const LINES = {
      cheese: [
        "Do you have ANY idea who my father IS?!",
        "I literally went to the RIGHT schools.",
        "37 INCHES OF MOZZ AND YOU STILL DISRESPECT ME?!",
        "MY LAWYERS WILL— *gets hit* —MY LAWYERS WILL—",
        "I'm calling Trumplethinpen RIGHT NOW."
      ],
      pepperoni: [
        "You think you can handle THE STICK?!",
        "I didn't come here to LOSE.",
        "The Stick is uncut. The Stick is ETERNAL.",
        "HOW DARE YOU TOUCH THE ROD."
      ],
      margherita: [
        "I didn't HAVE to be here. I CHOSE this.",
        "You're fighting the wrong person.",
        "I was just trying to help...",
        '"I was just doing a bit." — last words'
      ]
    };

    defs.forEach((d, i) => {
      const size = d.type === 'margherita' ? 52 : 34;
      const body = this.physics.add.image(d.x, d.y, '__DEFAULT').setVisible(false);
      body.body.setSize(size, size);
      body.body.setCollideWorldBounds(true);
      this.physics.add.collider(body, this.platforms);

      const gfx = this.add.graphics().setDepth(4);
      const bubble = this.add.text(d.x, d.y - 50, '', {
        fontSize: '11px', fontFamily: 'Arial', color: '#222',
        backgroundColor: '#ffffffee', padding: { x: 6, y: 4 },
        wordWrap: { width: 220 }
      }).setOrigin(0.5).setDepth(7).setVisible(false);

      const hp = d.type === 'cheese' ? 3 : d.type === 'pepperoni' ? 5 : 12;
      const speed = d.type === 'cheese' ? 55 : d.type === 'pepperoni' ? 90 : 30;

      this.enemies.push({
        body, gfx, bubble,
        hp, maxHP: hp, speed,
        type: d.type,
        lines: LINES[d.type],
        lineIdx: 0,
        dir: 1,
        patrolL: d.l, patrolR: d.r,
        alerted: false,
        alive: true,
        hitTimer: 0,
        bubbleTimer: 0,
        grease: { cooldown: 0 }
      });

      this.drawEnemy(this.enemies[this.enemies.length - 1]);
    });
  }

  drawEnemy(e) {
    const g = e.gfx;
    g.clear();
    if (!e.alive) return;
    const ex = e.body.x, ey = e.body.y;
    const r = e.type === 'margherita' ? 26 : 18;

    // Colors by type
    const col = e.type === 'pepperoni' ? 0xcc3300 : e.type === 'margherita' ? 0xff9900 : 0xff7700;
    const border = e.type === 'pepperoni' ? 0x991100 : e.type === 'margherita' ? 0xcc7700 : 0xcc5500;

    g.fillStyle(col); g.fillCircle(ex, ey, r);
    g.lineStyle(3, border); g.strokeCircle(ex, ey, r);

    // Toppings
    g.fillStyle(0xaa1100);
    if (e.type === 'pepperoni') {
      g.fillCircle(ex - 6, ey - 5, 5); g.fillCircle(ex + 5, ey + 4, 4); g.fillCircle(ex - 2, ey + 7, 4);
      // The Stick
      g.lineStyle(4, 0xcc4400);
      g.lineBetween(ex + r, ey, ex + r + 22, ey - 8);
    } else if (e.type === 'margherita') {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        g.fillCircle(ex + Math.cos(a) * 14, ey + Math.sin(a) * 14, 5);
      }
    } else {
      g.fillCircle(ex - 6, ey - 5, 4); g.fillCircle(ex + 5, ey + 3, 3); g.fillCircle(ex - 2, ey + 8, 3);
    }

    // Eyes
    g.fillStyle(0xffffff); g.fillCircle(ex - 5, ey - 3, 4); g.fillCircle(ex + 5, ey - 3, 4);
    g.fillStyle(0x000000); g.fillCircle(ex - 4, ey - 2, 2); g.fillCircle(ex + 6, ey - 2, 2);

    // Arms/legs when alerted
    if (e.alerted) {
      g.lineStyle(3, border);
      g.lineBetween(ex - r, ey - 2, ex - r - 14, ey - 10);
      g.lineBetween(ex + r, ey - 2, ex + r + 14, ey - 10);
      g.lineBetween(ex - 8, ey + r, ex - 14, ey + r + 18);
      g.lineBetween(ex + 8, ey + r, ex + 14, ey + r + 18);
    }

    // HP bar (multi-hit enemies)
    if (e.maxHP > 3) {
      const bw = r * 2 + 10;
      g.fillStyle(0x333333); g.fillRect(ex - bw / 2, ey - r - 10, bw, 5);
      g.fillStyle(0xff2222); g.fillRect(ex - bw / 2, ey - r - 10, bw * (e.hp / e.maxHP), 5);
    }
  }

  redrawGrease() {
    const now = this.time.now;
    this.greasePts = this.greasePts.filter(p => now - p.t < 5000);
    const g = this.greaseGfx;
    g.clear();
    this.greasePts.forEach(p => {
      const age = now - p.t;
      const alpha = 0.22 * (1 - age / 5000);
      if (alpha > 0.01) {
        g.fillStyle(p.color, alpha);
        g.fillEllipse(p.x, p.y, 18, 7);
      }
    });
  }

  tickGerald() {
    if (this.geraldTimer <= 0) return;
    this.geraldTimer--;
    const m = Math.floor(this.geraldTimer / 60);
    const s = this.geraldTimer % 60;
    const ts = `🦈 GERALD: ${m}:${s.toString().padStart(2, '0')}`;
    this.hudGerald.setText(ts);
    if (this.geraldTimer <= 30) this.hudGerald.setColor('#ff0000');
    else if (this.geraldTimer <= 60) this.hudGerald.setColor('#ff4400');

    if (this.geraldTimer === 0) {
      this.geraldBody.setActive(false);
      this.geraldGfx.clear();
      this.geraldLabel.setVisible(false);
      this.failBg.setAlpha(0.6);
      this.failTxt.setVisible(true);
      this.time.delayedCall(3000, () => {
        this.failBg.setAlpha(0);
        this.failTxt.setVisible(false);
        this.geraldTimer = 300;
        this.geraldBody.setActive(true).setPosition(1950, 490);
        this.hudGerald.setColor('#ff8844');
        this.geraldLabel.setVisible(true);
        this.drawGerald();
      });
    }
  }

  checkGerald() {
    if (!this.geraldBody.active) return;
    const dx = Math.abs(this.pBody.x - this.geraldBody.x);
    const dy = Math.abs(this.pBody.y - this.geraldBody.y);
    if (dx < 50 && dy < 50) {
      this.geraldBody.setActive(false);
      this.geraldGfx.clear();
      this.geraldLabel.setVisible(false);
      const saveTxt = this.add.text(1950, 450, 'GERALD SAVED! 🎉', {
        fontSize: '28px', fontFamily: 'Impact, sans-serif', color: '#44ff44',
        stroke: '#000', strokeThickness: 4
      }).setOrigin(0.5).setDepth(10);
      this.tweens.add({
        targets: saveTxt, y: saveTxt.y - 70, alpha: 0, duration: 2500,
        onComplete: () => saveTxt.destroy()
      });
      this.cameras.main.flash(400, 68, 255, 68);
      this.time.delayedCall(4000, () => {
        this.geraldTimer = 300;
        this.geraldBody.setActive(true).setPosition(1950, 490);
        this.hudGerald.setColor('#ff8844');
        this.geraldLabel.setVisible(true);
      });
    }
  }

  drawHP() {
    const g = this.hudHP;
    g.clear();
    for (let i = 0; i < 3; i++) {
      const hx = W / 2 - 50 + i * 40;
      const hy = H - 44;
      g.fillStyle(i < this.hp ? 0xff2244 : 0x442222);
      g.fillCircle(hx - 5, hy - 3, 7);
      g.fillCircle(hx + 5, hy - 3, 7);
      g.fillTriangle(hx - 12, hy, hx + 12, hy, hx, hy + 12);
    }
  }

  drawBorder() {
    const g = this.hudBorder;
    g.clear();
    const colors = { 1: 0xff4444, 2: 0x4488ff, 3: 0xffdd00 };
    g.lineStyle(3, colors[this.state], 0.6);
    g.strokeRect(3, 3, W - 6, H - 6);
  }

  switchState(n) {
    if (n === this.state) return;
    this.state = n;
    const names = { 1: 'PHYSICAL', 2: 'INVERSE', 3: 'COIN STATE' };
    const colors = { 1: '#ff4444', 2: '#4488ff', 3: '#ffdd00' };
    this.hudState.setText(names[n]).setColor(colors[n]);
    this.drawBorder();

    if (n === 2) {
      this.physics.world.gravity.y = -GRAVITY;
    } else {
      this.physics.world.gravity.y = GRAVITY;
    }

    // Coin state: disable platform collider
    if (n === 3) {
      this.physics.world.removeCollider(this.pPlatCollider);
    } else if (!this.pPlatCollider?.active) {
      this.pPlatCollider = this.physics.add.collider(this.pBody, this.platforms);
    }

    this.cameras.main.flash(120, 255, 255, 255);
  }

  doAttack() {
    if (this.atkTimer > 0) return;
    this.isAtk = true;
    this.atkTimer = 350;
    this.time.delayedCall(300, () => { this.isAtk = false; });

    const px = this.pBody.x, py = this.pBody.y;
    this.enemies.forEach(e => {
      if (!e.alive) return;
      const dist = Phaser.Math.Distance.Between(px, py, e.body.x, e.body.y);
      const inRange = dist < 70 && Math.sign(e.body.x - px) === this.facing;
      if (!inRange) return;

      e.hp--;
      e.hitTimer = 200;
      const line = e.lines[e.lineIdx % e.lines.length];
      e.lineIdx++;
      e.bubble.setText(line).setPosition(e.body.x, e.body.y - 55).setVisible(true);
      e.bubbleTimer = 2200;

      if (e.hp <= 0) this.killEnemy(e);
      else this.drawEnemy(e);
    });
  }

  killEnemy(e) {
    e.alive = false;
    e.gfx.clear();
    e.body.setActive(false).setVisible(false);
    e.bubble.setVisible(false);

    for (let i = 0; i < 14; i++) {
      const p = this.add.graphics().setDepth(8);
      const sz = Phaser.Math.Between(3, 9);
      p.fillStyle(0xffffff, 0.9); p.fillCircle(0, 0, sz);
      p.x = e.body.x; p.y = e.body.y;
      this.tweens.add({
        targets: p,
        x: e.body.x + Phaser.Math.Between(-90, 90),
        y: e.body.y + Phaser.Math.Between(-90, 90),
        alpha: 0, duration: 600, ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }

    // Respawn after 12s
    this.time.delayedCall(12000, () => {
      e.alive = true;
      e.hp = e.maxHP;
      e.body.setActive(true).setPosition(e.patrolL + (e.patrolR - e.patrolL) / 2, 490);
      this.drawEnemy(e);
    });
  }

  damagePlayer() {
    if (this.iFrames > 0 || this.state === 3) return;
    this.hp--;
    this.iFrames = 1200;
    this.drawHP();
    this.cameras.main.shake(180, 0.012);
    if (this.hp <= 0) {
      this.time.delayedCall(600, () => this.scene.start('DeathScene'));
    }
  }

  update(time, delta) {
    const body = this.pBody.body;
    if (!body) return;

    // Timers
    if (this.atkTimer > 0) this.atkTimer -= delta;
    if (this.iFrames > 0) {
      this.iFrames -= delta;
      this.pBody.setAlpha(Math.sin(time * 0.02) > 0 ? 1 : 0.3);
    } else {
      this.pBody.setAlpha(1);
    }

    // Reality state switch
    if (Phaser.Input.Keyboard.JustDown(this.key1)) this.switchState(1);
    if (Phaser.Input.Keyboard.JustDown(this.key2)) this.switchState(2);
    if (Phaser.Input.Keyboard.JustDown(this.key3)) this.switchState(3);

    // Movement
    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const jump = this.cursors.up.isDown || this.wasd.up.isDown;

    if (left) { body.setVelocityX(-PSPEED); this.facing = -1; }
    else if (right) { body.setVelocityX(PSPEED); this.facing = 1; }
    else body.setVelocityX(0);

    const onGround = this.state === 2 ? body.blocked.up : body.blocked.down;
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasd.up)) {
      if (onGround) body.setVelocityY(this.state === 2 ? -JUMP_V : JUMP_V);
    }

    // Attack
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.doAttack();

    // Draw player
    this.drawPlayer();

    // Gerald
    this.drawGerald();
    this.checkGerald();

    // Enemies
    this.enemies.forEach(e => {
      if (!e.alive) return;

      // Grease trail
      e.grease.cooldown -= delta;
      if (e.grease.cooldown <= 0) {
        e.grease.cooldown = 200 + Math.random() * 100;
        const col = e.type === 'pepperoni' ? 0xcc6600 : e.type === 'margherita' ? 0xffbb44 : 0xffdd00;
        this.greasePts.push({ x: e.body.x, y: e.body.y + 18, color: col, t: time });
      }

      // Distance to player
      const dist = Phaser.Math.Distance.Between(this.pBody.x, this.pBody.y, e.body.x, e.body.y);
      const wasAlerted = e.alerted;
      const detect = e.type === 'margherita' ? 220 : e.type === 'pepperoni' ? 180 : 150;
      e.alerted = dist < detect;

      // Move
      if (e.alerted) {
        const dir = this.pBody.x > e.body.x ? 1 : -1;
        e.body.setVelocityX(dir * e.speed * 1.4);
        e.dir = dir;
      } else {
        e.body.setVelocityX(e.dir * e.speed);
        if (e.body.x <= e.patrolL) e.dir = 1;
        if (e.body.x >= e.patrolR) e.dir = -1;
      }

      // Redraw on state change
      if (e.alerted !== wasAlerted) this.drawEnemy(e);

      // Speech bubble positioning + timeout
      if (e.bubbleTimer > 0) {
        e.bubbleTimer -= delta;
        e.bubble.setPosition(e.body.x, e.body.y - 55);
        if (e.bubbleTimer <= 0) e.bubble.setVisible(false);
      }

      // Damage player on contact
      if (dist < (e.type === 'margherita' ? 40 : 30) && this.state !== 3) {
        this.damagePlayer();
      }
    });

    // Init platform collider on first frame
    if (!this.pPlatCollider) {
      this.pPlatCollider = this.physics.add.collider(this.pBody, this.platforms);
    }
  }
}

// ---- DEATH SCENE ----
class DeathScene extends Phaser.Scene {
  constructor() { super({ key: 'DeathScene' }); }

  create() {
    this.cameras.main.setBackgroundColor('#0a0000');
    const cx = W / 2, cy = H / 2;

    const g = this.add.graphics();
    g.fillStyle(0x330000, 0.6); g.fillRect(0, 0, W, H);

    this.add.text(cx, cy - 70, 'THROOTHER HAS FALLEN.', {
      fontSize: '38px', fontFamily: 'Impact, sans-serif', fontStyle: 'bold',
      color: '#ff2222', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(cx, cy - 15, 'The grease claims another.', {
      fontSize: '20px', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#cc6644'
    }).setOrigin(0.5);

    const btn = this.add.graphics();
    btn.fillStyle(0x882222); btn.fillRoundedRect(cx - 100, cy + 45, 200, 50, 10);
    btn.lineStyle(2, 0xff4444); btn.strokeRoundedRect(cx - 100, cy + 45, 200, 50, 10);

    const btnTxt = this.add.text(cx, cy + 70, 'TRY AGAIN', {
      fontSize: '22px', fontFamily: 'Courier New, monospace', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);

    const zone = this.add.zone(cx, cy + 70, 200, 50).setInteractive();
    zone.on('pointerover', () => btnTxt.setColor('#ffdd00'));
    zone.on('pointerout', () => btnTxt.setColor('#ffffff'));
    zone.on('pointerdown', () => this.scene.start('GameScene'));
    this.input.keyboard.on('keydown-ENTER', () => this.scene.start('GameScene'));
  }
}

// ---- CONFIG ----
const game = new Phaser.Game({
  type: Phaser.CANVAS,
  width: W,
  height: H,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: GRAVITY }, debug: false }
  },
  scene: [MenuScene, IntroScene, GameScene, DeathScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
});
