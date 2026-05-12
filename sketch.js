let capture;
let faceMesh;
let faces = [];

function preload() {
  // 載入最新版 ml5 faceMesh 模型
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: false });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 加入攝影機錯誤回報
  capture = createCapture(VIDEO, (stream) => {
    console.log("攝影機已啟動");
  }, (err) => {
    console.error("攝影機啟動失敗: ", err);
  });
  // 隱藏預設的 video 標籤，我們要在畫布上繪製
  capture.hide();

  // 開始持續偵測臉部
  faceMesh.detectStart(capture, results => { faces = results; });
}

function draw() {
  background('#e7c6ff');

  // 在全螢幕畫布的上方中央加上文字
  fill(0); // 設定文字顏色為黑色
  textSize(32); // 設定文字大小
  textAlign(CENTER, TOP); // 設定文字水平置中，垂直對齊頂部
  text("411136541", width / 2, 20); // 在畫布寬度的一半、距離頂部 20 像素的位置繪製文字

  // 檢查攝影機是否準備好，避免畫出空畫面
  if (capture.width === 0 || capture.height === 0) return;

  // 計算顯示影像的尺寸 (50%)
  let vW = width * 0.5;
  let vH = height * 0.5;

  push();
  // 移動到畫布中心
  translate(width / 2, height / 2);
  // 左右顛倒 (鏡像)
  scale(-1, 1);
  imageMode(CENTER);
  // 繪製影像
  image(capture, 0, 0, vW, vH);
  
  // 如果偵測到臉部，繪製耳環
  if (faces.length > 0) {
    let face = faces[0];
    
    // MediaPipe FaceMesh 關鍵點：172 (左耳垂), 397 (右耳垂)
    let leftLobe = face.keypoints[172];
    let rightLobe = face.keypoints[397];

    drawEarring(leftLobe, vW, vH); 
    drawEarring(rightLobe, vW, vH);
  }
  pop();
}

function drawEarring(pt, vW, vH) {
  if (!pt) return;

  // 將偵測到的座標映射到畫布上的縮放比例
  let x = map(pt.x, 0, capture.width, -vW / 2, vW / 2);
  let y = map(pt.y, 0, capture.height, -vH / 2, vH / 2);

  noStroke();
  fill('#ffff00'); // 黃色
  for (let i = 0; i < 3; i++) {
    // 從耳垂位置往下顯示三個圓圈，間距 15 像素
    circle(x, y + (i * 15 + 10), 10); 
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
