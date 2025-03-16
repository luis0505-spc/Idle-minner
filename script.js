// 1. canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 2. cargar sprites
const sprites = {
  miner_idle: new Image(),
  miner_walk_1: new Image(),
  miner_walk_2: new Image(),
  miner_walk_reverse_1: new Image(),
  miner_walk_reverse_2: new Image(),
  miner_elevador_0: new Image(),
  miner_elevador_1: new Image(),
  miner_elevador_2: new Image(),
  miner_tolva_1: new Image(),
  miner_tolva_2: new Image(),
  miner_tolva_reverse_1: new Image(),
  miner_tolva_reverse_2: new Image(),
  miner_tolva_reverse_3: new Image(),
  miner_tolva_reverse_4: new Image(),
  miner_mine: new Image(),
  tolva_miner_0: new Image(),
  tolva_miner_1: new Image(),
  tolva_miner_2: new Image(),
  tolva_miner_3: new Image()
};

// asignar las rutas de los sprites
sprites.miner_idle.src = "Sprites/miner_idle.png";
sprites.miner_walk_1.src = "Sprites/miner_walk_1.png";
sprites.miner_walk_2.src = "Sprites/miner_walk_2.png";
sprites.miner_walk_reverse_1.src = "Sprites/miner_walk_reverse_1.png";
sprites.miner_walk_reverse_2.src = "Sprites/miner_walk_reverse_2.png";
sprites.miner_elevador_0.src = "Sprites/miner_elevador_0.png";
sprites.miner_elevador_1.src = "Sprites/miner_elevador_1.png";
sprites.miner_elevador_2.src = "Sprites/miner_elevador_2.png";
sprites.miner_tolva_1.src = "Sprites/miner_tolva_1.png";
sprites.miner_tolva_2.src = "Sprites/miner_tolva_2.png";
sprites.miner_tolva_reverse_1.src = "Sprites/miner_tolva_reverse_1.png";
sprites.miner_tolva_reverse_2.src = "Sprites/miner_tolva_reverse_2.png";
sprites.miner_tolva_reverse_3.src = "Sprites/miner_tolva_reverse_3.png";
sprites.miner_tolva_reverse_4.src = "Sprites/miner_tolva_reverse_4.png";
sprites.miner_mine.src = "Sprites/miner_mine.png";
sprites.tolva_miner_0.src = "Sprites/tolva_miner_0.png";
sprites.tolva_miner_1.src = "Sprites/tolva_miner_1.png";
sprites.tolva_miner_2.src = "Sprites/tolva_miner_2.png";
sprites.tolva_miner_3.src = "Sprites/tolva_miner_3.png";

// 3. inicializar el fondo
const backgroundImage = new Image();
backgroundImage.src = "fondo.png";

// 4. inicializar los objetos del juego
const miner = {
  x: 240,
  y: 400,
  width: 45,
  height: 45,
  material: 0,
  isMining: false,
  miningAmount: 18
};

const elevator = {
  x: 70,
  y: 220,
  width: 45,
  height: 45,
  carrying: 0,
  isMoving: false,
  direction: 1,
  state: "idle",
  maxCapacity: 130
};

const storage = {
  x: 600,
  y: 220,
  width: 45,
  height: 45,
  carrying: 0,
  isCollecting: false,
  state: "idle",
  currentSprite: null,
  initialX: 600,
  maxCapacity: 100,
  collectionTime: 500
};

// 5. inicializar los estados de los objetos
const minerBox = { 
  x: 150, 
  y: 400, 
  width: 77, 
  height: 77, 
  material: 0 
};

const elevatorBox = { 
  x: 65, 
  y: 180, 
  width: 1, 
  height: 1, 
  material: 0 
};

const minerState = { 
  isWaiting: false, 
  miningTimeout: null,
  miningTime: 5000
};

const elevatorState = {
  isWaiting: false,
  elevatorTimeout: null
};

const storageState = {
  isWaiting: false,
  storageTimeout: null
};

const ui = { 
  cash: 0 
};

// 6. inicializar las mejoras del sistema
const upgrades = {
  miner: {
    level: 0,
    maxLevel: 10,
    baseCost: 1800,
    baseTime: 5000,
    baseMining: 18,
    costMultiplier: 2.2,
    
    getCurrentCost() {
      return Math.floor(this.baseCost * Math.pow(this.costMultiplier, this.level + 0));
    },
    
    getTimeReduction() {
      return this.level * 0.2;
    },
    
    getMiningIncrease() {
      return this.level * 5;
    }
  },
  
  elevator: {
    level: 0,
    maxLevel: 10,
    baseCost: 2500,
    baseSpeed: 2,
    baseCapacity: 130,
    costMultiplier: 1.9,
    
    getCurrentCost() {
      return Math.floor(this.baseCost * Math.pow(this.costMultiplier, this.level + 0));
    },
    
    getSpeedIncrease() {
      return this.level * 0.5;
    },
    
    getCapacityIncrease() {
      return this.level * 20;
    }
  },
  
  storage: {
    level: 0,
    maxLevel: 10,
    baseCost: 2800,
    baseCapacity: 100,
    baseCollectionTime: 500,
    costMultiplier: 1.9,
    
    getCurrentCost() {
      return Math.floor(this.baseCost * Math.pow(this.costMultiplier, this.level + 0));
    },
    
    getCapacityIncrease() {
      return this.level * 25;
    },
    
    getTimeReduction() {
      return Math.min(this.level * 0.05, 0.5);
    }
  }
};

// 7. inicializar las minas
let mines = [];

// Funciones de dibujo del juego
// 8. Dibujar el fondo
function drawBackground() {
  if (backgroundImage.complete) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  } else {
    backgroundImage.onload = () => {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    };
  }
}

// 9. Dibujar la interfaz del juego
function drawUI() {
  const uiText = `Cash: $${ui.cash}`;
  ctx.font = "20px Arial";
  ctx.textAlign = "center"; // Centra el texto horizontalmente
  ctx.textBaseline = "middle"; // Centra el texto verticalmente

  // Calcula la posición del texto en el centro del canvas
  const centerX = canvas.width / 2;
  const centerY = 40; // Ajusta esto según la posición que prefieras en el eje Y

  // Calcula el tamaño del fondo del rectángulo
  const paddingX = 20;
  const paddingY = 10;
  const textWidth = ctx.measureText(uiText).width;
  const boxWidth = textWidth + paddingX * 2;
  const boxHeight = 40;

  // Dibuja un rectángulo redondeado como fondo
  ctx.fillStyle = "#333"; // Color de fondo oscuro para el rectángulo
  ctx.strokeStyle = "#FFD700"; // Color dorado para el borde
  ctx.lineWidth = 2;

  // Dibuja el fondo con bordes redondeados
  ctx.beginPath();
  ctx.moveTo(centerX - boxWidth / 2 + 10, centerY - boxHeight / 2); // Esquina superior izquierda
  ctx.arcTo(
    centerX + boxWidth / 2,
    centerY - boxHeight / 2,
    centerX + boxWidth / 2,
    centerY + boxHeight / 2,
    10
  ); // Lado derecho
  ctx.arcTo(
    centerX + boxWidth / 2,
    centerY + boxHeight / 2,
    centerX - boxWidth / 2,
    centerY + boxHeight / 2,
    10
  ); // Esquina inferior derecha
  ctx.arcTo(
    centerX - boxWidth / 2,
    centerY + boxHeight / 2,
    centerX - boxWidth / 2,
    centerY - boxHeight / 2,
    10
  ); // Lado izquierdo
  ctx.arcTo(
    centerX - boxWidth / 2,
    centerY - boxHeight / 2,
    centerX + boxWidth / 2,
    centerY - boxHeight / 2,
    10
  ); // Esquina superior izquierda
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Dibuja el texto en el centro
  ctx.fillStyle = "#FFF";
  ctx.fillText(uiText, centerX, centerY);
}

// 10. Función para dibujar los botones de mejora
function drawUpgradeButtons() {
  const buttonWidth = 150;
  const buttonHeight = 40;
  const padding = 10;

  // Estilo común para los botones
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Botón de mejora del minero
  const minerButtonY = 380;
  const minerButtonX = 620;
  ctx.fillStyle = upgrades.miner.level >= upgrades.miner.maxLevel ? "#666" : "#4CAF50";
  drawRoundedButton(minerButtonX, minerButtonY, buttonWidth, buttonHeight);
  ctx.fillStyle = "#FFF";
  const minerCost = upgrades.miner.getCurrentCost();
  const minerText = upgrades.miner.level >= upgrades.miner.maxLevel 
    ? "Minero Max" 
    : `Mejorar Minero $${minerCost}`;
  ctx.fillText(minerText, minerButtonX + buttonWidth/2, minerButtonY + buttonHeight/2);
  ctx.fillText(`Nivel: ${upgrades.miner.level}`, minerButtonX + buttonWidth/2, minerButtonY + buttonHeight + 5);

  // Botón de mejora del elevador
  const elevatorButtonY = 50;
  const elevatorButtonX = 20;
  ctx.fillStyle = upgrades.elevator.level >= upgrades.elevator.maxLevel ? "#666" : "#2196F3";
  drawRoundedButton(elevatorButtonX, elevatorButtonY, buttonWidth, buttonHeight);
  ctx.fillStyle = "#FFF";
  const elevatorCost = upgrades.elevator.getCurrentCost();
  const elevatorText = upgrades.elevator.level >= upgrades.elevator.maxLevel 
    ? "Elevador Max" 
    : `Mejorar Elevador $${elevatorCost}`;
  ctx.fillText(elevatorText, elevatorButtonX + buttonWidth/2, elevatorButtonY + buttonHeight/2);
  ctx.fillText(`Nivel: ${upgrades.elevator.level}`, elevatorButtonX + buttonWidth/2, elevatorButtonY + buttonHeight + 5);

  // Botón de mejora del almacenamiento
  const storageButtonY = 50
  const storageButtonX = 600
  ctx.fillStyle = upgrades.storage.level >= upgrades.storage.maxLevel ? "#666" : "#FF9800";
  drawRoundedButton(storageButtonX, storageButtonY, buttonWidth, buttonHeight);
  ctx.fillStyle = "#FFF";
  const storageCost = upgrades.storage.getCurrentCost();
  const storageText = upgrades.storage.level >= upgrades.storage.maxLevel 
    ? "Storage Max" 
    : `Mejorar Storage $${storageCost}`;
  ctx.fillText(storageText, storageButtonX + buttonWidth/2, storageButtonY + buttonHeight/2);
  ctx.fillText(`Nivel: ${upgrades.storage.level}`, storageButtonX + buttonWidth/2, storageButtonY + buttonHeight + 5);
}

// Función auxiliar para dibujar botones redondeados
function drawRoundedButton(x, y, width, height) {
  const radius = 5;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

// 11. Dibujar las cajas
function drawBoxes() {
  // Seleccionar el sprite de la tolva del minero en función de la cantidad de oro
  let tolvaSprite;
  const oro = minerBox.material * 10; // Convierte el material a su equivalencia en oro

  if (oro >= 0 && oro <= 900) {
    tolvaSprite = sprites.tolva_miner_0;
  } else if (oro >= 900 && oro <= 2100) {
    tolvaSprite = sprites.tolva_miner_1;
  } else if (oro >= 2100 && oro <= 5000) {
    tolvaSprite = sprites.tolva_miner_2;
  } else {
    tolvaSprite = sprites.tolva_miner_3;
  }

  // Configuración de la caja del minero con bordes redondeados y estilo profesional
  const minerText = `Oro: ${minerBox.material}`;
  const minerTextWidth = ctx.measureText(minerText).width;
  const minerBoxWidth = minerTextWidth + 20; // Ajusta el ancho de la caja según el texto
  const minerBoxHeight = 30;
  const minerBoxX = minerBox.x;
  const minerBoxY = minerBox.y - 40;

  // Dibuja el fondo redondeado para la caja del minero
  ctx.fillStyle = "#8B4513"; // Color marrón
  ctx.strokeStyle = "#5E3200"; // Borde marrón oscuro
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(minerBoxX + 10, minerBoxY); // Esquina superior izquierda
  ctx.arcTo(
    minerBoxX + minerBoxWidth,
    minerBoxY,
    minerBoxX + minerBoxWidth,
    minerBoxY + minerBoxHeight,
    10
  ); // Lado derecho
  ctx.arcTo(
    minerBoxX + minerBoxWidth,
    minerBoxY + minerBoxHeight,
    minerBoxX,
    minerBoxY + minerBoxHeight,
    10
  ); // Esquina inferior derecha
  ctx.arcTo(minerBoxX, minerBoxY + minerBoxHeight, minerBoxX, minerBoxY, 10); // Lado izquierdo
  ctx.arcTo(minerBoxX, minerBoxY, minerBoxX + minerBoxWidth, minerBoxY, 10); // Esquina superior izquierda
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Dibuja el sprite de la tolva del minero encima del fondo redondeado
  ctx.drawImage(
    tolvaSprite,
    minerBox.x,
    minerBox.y,
    minerBox.width,
    minerBox.height
  );

  // Dibuja el texto de oro en la caja del minero
  ctx.fillStyle = "#FFF";
  ctx.textAlign = "center";
  ctx.font = "14px Arial";
  ctx.fillText(
    minerText,
    minerBoxX + minerBoxWidth / 2,
    minerBoxY + minerBoxHeight / 2 + 5
  );

  // Configuración de la caja del elevador con el mismo estilo de bordes redondeados
  const elevatorText = `Oro: ${elevatorBox.material}`;
  const elevatorTextWidth = ctx.measureText(elevatorText).width;
  const elevatorBoxWidth = elevatorTextWidth + 20;
  const elevatorBoxHeight = 30;
  const elevatorBoxX = elevatorBox.x;
  const elevatorBoxY = elevatorBox.y - 40;

  // Dibuja el fondo redondeado para la caja del elevador
  ctx.fillStyle = "#696969"; // Color gris para el elevador
  ctx.strokeStyle = "#4B4B4B"; // Borde gris oscuro
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(elevatorBoxX + 10, elevatorBoxY);
  ctx.arcTo(
    elevatorBoxX + elevatorBoxWidth,
    elevatorBoxY,
    elevatorBoxX + elevatorBoxWidth,
    elevatorBoxY + elevatorBoxHeight,
    10
  );
  ctx.arcTo(
    elevatorBoxX + elevatorBoxWidth,
    elevatorBoxY + elevatorBoxHeight,
    elevatorBoxX,
    elevatorBoxY + elevatorBoxHeight,
    10
  );
  ctx.arcTo(
    elevatorBoxX,
    elevatorBoxY + elevatorBoxHeight,
    elevatorBoxX,
    elevatorBoxY,
    10
  );
  ctx.arcTo(
    elevatorBoxX,
    elevatorBoxY,
    elevatorBoxX + elevatorBoxWidth,
    elevatorBoxY,
    10
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Dibuja el texto de oro en la caja del elevador
  ctx.fillStyle = "#FFF";
  ctx.fillText(
    elevatorText,
    elevatorBoxX + elevatorBoxWidth / 2,
    elevatorBoxY + elevatorBoxHeight / 2 + 5
  );
}

function drawMiner() {
  let spriteToDraw;
  let scale = 1.8;

  if (miner.isMining) {
    if (Math.floor(Date.now() / 200) % 2 === 0) {
      spriteToDraw = sprites.miner_walk_1;
    } else {
      spriteToDraw = sprites.miner_walk_2;
    }
  } else if (miner.x !== 240) {
    if (Math.floor(Date.now() / 200) % 2 === 0) {
      spriteToDraw = sprites.miner_walk_reverse_1;
    } else {
      spriteToDraw = sprites.miner_walk_reverse_2;
    }
  } else {
    spriteToDraw = sprites.miner_idle;
  }

  ctx.drawImage(
    spriteToDraw,
    miner.x - (miner.width * (scale - 1)) / 2,
    miner.y - (miner.height * (scale - 1)) / 2,
    miner.width * scale,
    miner.height * scale
  );
}

function drawElevator() {
  let spriteToDraw;
  let scale = 1.8;

  switch (elevator.state) {
    case "down":
      spriteToDraw = sprites.miner_elevador_1;
      break;
    case "up":
      spriteToDraw = sprites.miner_elevador_2;
      break;
    default:
      spriteToDraw = sprites.miner_elevador_0;
  }

  ctx.drawImage(
    spriteToDraw,
    elevator.x - (miner.width * (scale - 1)) / 2,
    elevator.y - (miner.height * (scale - 1)) / 2,
    elevator.width * scale,
    elevator.height * scale
  );
}

// Actualizar la función drawStorage para usar el sprite actual
function drawStorage() {
  const scale = 1.8;

  // Si no hay un sprite actual, usar el predeterminado
  if (!storage.currentSprite) {
    storage.currentSprite = sprites.miner_tolva_1;
  }

  ctx.drawImage(
    storage.currentSprite,
    storage.x - (miner.width * (scale - 1)) / 2,
    storage.y - (miner.height * (scale - 1)) / 2,
    storage.width * scale,
    storage.height * scale
  );

  // Dibujar información del material transportado
  if (storage.carrying > 0) {
    ctx.fillStyle = "#FFF";
    ctx.font = "14px Arial";
    ctx.fillText(`Oro: ${storage.carrying}`, storage.x + 10, storage.y - 5);
  }
}

// Dibujar todas las minas y el minero en cada mina
function drawMines() {
  mines.forEach((mine) => {
    ctx.fillStyle = "#8B45";
    ctx.fillRect(mine.x, mine.y, mine.width, mine.height);
    ctx.fillStyle = "#FFF";
    ctx.fillText(`Oro: ${mine.material}`, mine.x, mine.y - 5);
    drawMinerInMine(mine);
  });
}

// Dibujar el minero en una mina específica
function drawMinerInMine(mine) {
  let scale = 1.5;
  ctx.drawImage(
    sprites.miner_idle,
    mine.minero.x - (miner.width * (scale - 1)) / 2,
    mine.minero.y - (miner.height * (scale - 1)) / 2,
    miner.width * scale,
    miner.height * scale
  );
}

function moveMiner() {
  if (miner.isMining && miner.x < 580) {
    miner.x += 2;
  } else if (miner.x >= 580 && !minerState.isWaiting) {
    minerState.isWaiting = true;

    minerState.miningTimeout = setTimeout(() => {
      miner.material += miner.miningAmount;
      miner.isMining = false;
      minerState.isWaiting = false;
    }, minerState.miningTime);
  } else if (!miner.isMining && miner.x > 240) {
    miner.x -= 2;
    if (miner.x === 240) {
      minerBox.material += miner.material;
      miner.material = 0;
    }
  }
}

// Modificar la función moveElevator para usar la capacidad máxima
function moveElevator() {
  if (elevator.isMoving) {
    if (elevator.direction === 1) {
      elevator.state = "down";
      if (elevator.y < minerBox.y && !elevatorState.isWaiting) {
        elevator.y += elevatorSpeed;
      } else if (elevator.y >= minerBox.y && !elevatorState.isWaiting) {
        const materialToTake = Math.min(minerBox.material, elevator.maxCapacity);
        const waitTime = materialToTake * (1000 / elevator.maxCapacity);
        elevatorState.isWaiting = true;

        elevatorState.elevatorTimeout = setTimeout(() => {
          elevator.carrying = materialToTake;
          minerBox.material -= materialToTake;
          elevator.direction = -1;
          elevator.state = "up";
          elevatorState.isWaiting = false;
        }, waitTime);
      }
    } else {
      elevator.y -= elevatorSpeed;
      if (elevator.y <= 220) {
        elevator.isMoving = false;
        elevator.direction = 1;
        elevator.state = "idle";
        elevatorBox.material += elevator.carrying;
        elevator.carrying = 0;
      }
    }
  }
}

// Modificar la función moveStorage para usar las nuevas propiedades
function moveStorage() {
  if (storage.isCollecting) {
    if (storage.state === "idle") {
      storage.state = "moving";
    }

    if (storage.state === "moving") {
      if (storage.x > 170) {
        storage.x -= 2;
        storage.currentSprite = Math.floor(Date.now() / 200) % 2 === 0
          ? sprites.miner_tolva_1
          : sprites.miner_tolva_2;
      } else if (!storageState.isWaiting) {
        if (elevatorBox.material > 0) {
          const materialToCollect = Math.min(elevatorBox.material, storage.maxCapacity);
          const waitTime = materialToCollect * storage.collectionTime / storage.maxCapacity;
          storageState.isWaiting = true;

          storageState.storageTimeout = setTimeout(() => {
            storage.carrying = materialToCollect;
            elevatorBox.material -= materialToCollect;
            storage.state = "returning_full";
            storageState.isWaiting = false;
          }, waitTime);
        } else {
          storage.state = "returning_empty";
        }
      }
    }
  }

  if (storage.state === "returning_full") {
    if (storage.x < storage.initialX) {
      storage.x += 2;
      storage.currentSprite = Math.floor(Date.now() / 200) % 2 === 0
        ? sprites.miner_tolva_reverse_1
        : sprites.miner_tolva_reverse_2;
    } else {
      if (storage.carrying > 0) {
        ui.cash += storage.carrying * 10;
        storage.carrying = 0;
      }
      storage.state = "idle";
      storage.isCollecting = false;
      storage.currentSprite = sprites.miner_tolva_1;
    }
  }

  if (storage.state === "returning_empty") {
    if (storage.x < storage.initialX) {
      storage.x += 2;
      storage.currentSprite = Math.floor(Date.now() / 200) % 2 === 0
        ? sprites.miner_tolva_reverse_3
        : sprites.miner_tolva_reverse_4;
    } else {
      storage.state = "idle";
      storage.isCollecting = false;
      storage.currentSprite = sprites.miner_tolva_1;
    }
  }
}

// Función para limpiar todos los timeouts si es necesario
function cleanupAll() {
  if (minerState.miningTimeout) {
    clearTimeout(minerState.miningTimeout);
    minerState.miningTimeout = null;
  }
  if (elevatorState.elevatorTimeout) {
    clearTimeout(elevatorState.elevatorTimeout);
    elevatorState.elevatorTimeout = null;
  }
  if (storageState.storageTimeout) {
    clearTimeout(storageState.storageTimeout);
    storageState.storageTimeout = null;
  }
  minerState.isWaiting = false;
  elevatorState.isWaiting = false;
  storageState.isWaiting = false;
}

// Funciones para intentar realizar las mejoras
function tryUpgradeMiner() {
  const cost = upgrades.miner.getCurrentCost();
  if (ui.cash >= cost && upgrades.miner.level < upgrades.miner.maxLevel) {
    ui.cash -= cost;
    upgrades.miner.level++;
    updateMinerStats();
  }
}

function tryUpgradeElevator() {
  const cost = upgrades.elevator.getCurrentCost();
  if (ui.cash >= cost && upgrades.elevator.level < upgrades.elevator.maxLevel) {
    ui.cash -= cost;
    upgrades.elevator.level++;
    updateElevatorStats();
  }
}

function tryUpgradeStorage() {
  const cost = upgrades.storage.getCurrentCost();
  if (ui.cash >= cost && upgrades.storage.level < upgrades.storage.maxLevel) {
    ui.cash -= cost;
    upgrades.storage.level++;
    updateStorageStats();
  }
}

// Funciones para actualizar las estadísticas
function updateMinerStats() {
  const timeReduction = upgrades.miner.getTimeReduction();
  const miningIncrease = upgrades.miner.getMiningIncrease();
  
  // Actualizar el tiempo de minado y la cantidad
  minerState.miningTime = upgrades.miner.baseTime - (timeReduction * 1000);
  miner.miningAmount = upgrades.miner.baseMining + miningIncrease;
}

function updateElevatorStats() {
  const capacityIncrease = upgrades.elevator.getCapacityIncrease();
  const speedIncrease = upgrades.elevator.getSpeedIncrease();
  
  // Actualizar la velocidad y capacidad del elevador
  elevatorSpeed = upgrades.elevator.baseSpeed + speedIncrease;
  elevator.maxCapacity = upgrades.elevator.baseCapacity + capacityIncrease;
}

function updateStorageStats() {
  const capacityIncrease = upgrades.storage.getCapacityIncrease();
  const timeReduction = upgrades.storage.getTimeReduction();
  
  // Actualizar la capacidad y tiempo de recolección del almacenamiento
  storage.maxCapacity = upgrades.storage.baseCapacity + capacityIncrease;
  storage.collectionTime = upgrades.storage.baseCollectionTime * (1 - timeReduction);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  drawBackground();
  drawBoxes();
  drawUI();
  drawMines();
  drawMiner();
  drawElevator();
  drawStorage();
  drawUpgradeButtons(); // Agregar esta línea
  
  moveMiner();
  moveElevator();
  moveStorage();
  updateMinerStats();
  updateElevatorStats();
  updateStorageStats();
  
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener("click", function(event) {
  const x = event.offsetX;
  const y = event.offsetY;
  
  // Verificar clics en los botones de mejora
  const buttonWidth = 150;
  const buttonHeight = 40;
  
  // Botón de mejora del minero
  const minerButtonY = 380;
  const minerButtonX = 620;
  if (x >= minerButtonX && x <= minerButtonX + buttonWidth &&
      y >= minerButtonY && y <= minerButtonY + buttonHeight) {
    tryUpgradeMiner();
  }
  
  // Botón de mejora del elevador
  const elevatorButtonX = 20;
  const elevatorButtonY = 50;
  if (x >= elevatorButtonX && x <= elevatorButtonX + buttonWidth &&
      y >= elevatorButtonY && y <= elevatorButtonY + buttonHeight) {
    tryUpgradeElevator();
  }
  
  // Botón de mejora del almacenamiento
  const storageButtonX = 600;
  const storageButtonY = 50;
  if (x >= storageButtonX && x <= storageButtonX + buttonWidth &&
      y >= storageButtonY && y <= storageButtonY + buttonHeight) {
    tryUpgradeStorage();
  }
  
  // Mantener la lógica existente de los clicks
  if (x >= miner.x && x <= miner.x + miner.width && 
      y >= miner.y && y <= miner.y + miner.height) {
    miner.isMining = true;
  }
  
  if (x >= elevator.x && x <= elevator.x + elevator.width && 
      y >= elevator.y && y <= elevator.y + elevator.height) {
    elevator.isMoving = true;
  }
  
  if (x >= storage.x && x <= storage.x + storage.width && 
      y >= storage.y && y <= storage.y + storage.height) {
    storage.isCollecting = true;
  }
});


gameLoop();
