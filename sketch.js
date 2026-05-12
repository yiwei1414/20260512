let capture;
let faceMesh;
let handPose;
let faces = [];
let hands = [];
let earringImgs = [];
let currentEarring = null;

function preload() {
  // 載入最新版 ml5 faceMesh 模型
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: false });
  // 載入最新版 ml5 handPose 模型
  handPose = ml5.handPose({ flipped: false });
  
  // 載入 5 款耳環圖片
  let fileNames = ['acc1_ring.png', 'acc2_pearl.png', 'acc3_tassel.png', 'acc4_jade.png', 'acc5_phoenix.png'];
  for (let name of fileNames) {
    earringImgs.push(loadImage(`pic/acc/${name}`));
  }
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
  // 開始偵測手勢
  handPose.detectStart(capture, results => { hands = results; });
}

function draw() {
  background('#e7c6ff');

  // 在全螢幕畫布的上方中央加上文字
  fill(0); // 設定文字顏色為黑色
  textSize(32); // 設定文字大小
  textAlign(CENTER, TOP); // 設定文字水平置中，垂直對齊頂部
  text("411136541", width / 2, 20); // 在畫布寬度的一半、距離頂部 20 像素的位置繪製第一行文字
  text("作品為影像辨識_耳環臉譜", width / 2, 60); // 在畫布寬度的一半、距離頂部 60 像素的位置繪製第二行文字

  // 計算手指數量並切換耳環
  let count = getFingerCount();
  if (count >= 1 && count <= 5) {
    currentEarring = earringImgs[count - 1];
  } else if (!currentEarring) {
    currentEarring = earringImgs[0]; // 預設顯示第一款
  }

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

    // 分別繪製左右耳，傳入布林值區分方向以便「往外」偏移
    drawEarring(leftLobe, vW, vH, true); 
    drawEarring(rightLobe, vW, vH, false);
  }
  pop();
}

// 計算伸出的手指數量邏輯
function getFingerCount() {
  if (hands.length === 0) return 0;
  let hand = hands[0];
  let count = 0;
  
  // 偵測食指、中指、無名指、小指 (檢查指尖是否高於第二關節)
  let tips = [8, 12, 16, 20];
  let joints = [6, 10, 14, 18];
  for (let i = 0; i < 4; i++) {
    if (hand.keypoints[tips[i]].y < hand.keypoints[joints[i]].y) count++;
  }
  
  // 偵測大拇指 (檢查指尖與手腕距離是否大於大拇指根部與手腕距離)
  let thumbTip = hand.keypoints[4];
  let thumbBase = hand.keypoints[2];
  let wrist = hand.keypoints[0];
  if (dist(thumbTip.x, thumbTip.y, wrist.x, wrist.y) > dist(thumbBase.x, thumbBase.y, wrist.x, wrist.y)) {
    count++;
  }
  
  return count;
}

function drawEarring(pt, vW, vH, isLeft) {
  if (!pt || !currentEarring) return;

  // 將偵測到的座標映射到畫布上的縮放比例
  let x = map(pt.x, 0, capture.width, -vW / 2, vW / 2);
  let y = map(pt.y, 0, capture.height, -vH / 2, vH / 2);

  // 設定耳環寬度為顯示影像寬度的 8%，並依比例計算高度
  let imgW = vW * 0.08;
  let imgH = currentEarring.height * (imgW / currentEarring.width);

  // 比率式移動：往外移動顯示寬度的 1%，往上移動顯示高度的 1%
  let offsetX = vW * 0.01;
  let offsetY = vH * 0.01;

  // 如果是左耳(172)，往外是 X 減小；如果是右耳(397)，往外是 X 增大
  let finalX = isLeft ? x - offsetX : x + offsetX;
  let finalY = y - offsetY;

  // 繪製圖片，將圖片頂部對準計算後的座標
  image(currentEarring, finalX, finalY + imgH / 2, imgW, imgH);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
