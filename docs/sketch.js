// 定义粒子类
class Particle {
    constructor(x, y, targetX, targetY) {
        this.pos = createVector(x, y); // 当前位置
        this.vel = createVector();     // 速度
        this.acc = createVector();     // 加速度
        this.target = createVector(targetX, targetY); // 目标位置
        this.color = color(255, 120, 180); // 初始颜色改为粉色
        this.alpha = 255; // 透明度
        this.isMoving = false; // 是否开始向目标移动
    }

    // 每一帧更新粒子状态
    update() {
        if (this.isMoving) {
            // 计算朝向目标的力
            const steer = p5.Vector.sub(this.target, this.pos);
            steer.limit(0.3); // 限制力的大小
            this.acc.add(steer);
            
            // 随机干扰，增加艺术感
            this.acc.add(p5.Vector.random2D().mult(0.1));
            
            this.vel.add(this.acc);
            this.vel.limit(2); // 限制速度
            this.pos.add(this.vel);
            this.acc.mult(0); // 重置加速度
        } else {
            // 在第一阶段，粒子随机移动
            // 增加一个缓慢的、受噪波控制的移动，使其更像飘浮的光点
            const noiseFactor = 0.02;
            const noiseX = noise(this.pos.x * noiseFactor, this.pos.y * noiseFactor);
            const noiseY = noise(this.pos.y * noiseFactor, this.pos.x * noiseFactor);
            this.pos.x += map(noiseX, 0, 1, -1, 1);
            this.pos.y += map(noiseY, 0, 1, -1, 1);
        }
        
        // 缓慢改变颜色，从冷色到暖色
        let targetColor = color(255, 120, 180); // 粉色
        this.color = lerpColor(this.color, targetColor, 0.005);
    }
    
    // 绘制粒子
    show() {
        stroke(this.color, this.alpha);
        strokeWeight(2);
        point(this.pos.x, this.pos.y);
    }
}

// 全局变量
let particles = [];
let targetPoints = [];
let img;
let stage = 0; // 0: 无序, 1: 过渡, 2: 告白
let confessionText;
let fontLoaded = false;

// 在p5.js加载时执行一次
function setup() {
    // 创建一个占满窗口的画布
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container'); // 将画布放入指定的div
    background(0); // 黑色背景
    
    // ---- 重点修改：直接通过代码生成爱心图案的坐标点 ----
    // 这段代码不再依赖外部图片，确保在离线状态下也能正常运行
    // 调整 scale 参数，将爱心缩小
    const heartPoints = generateHeartPoints(40);
    for (let p of heartPoints) {
        // 将爱心坐标点转换为粒子目标点
        targetPoints.push({
            x: p.x + (width / 2),
            y: p.y + (height / 2) - 50 // 微调位置
        });
    }

    // 初始化粒子
    for (let i = 0; i < 500; i++) {
        let p = new Particle(random(width), random(height), 0, 0);
        particles.push(p);
    }

    // 将目标点随机分配给粒子
    for (let i = 0; i < particles.length; i++) {
        const target = targetPoints[i % targetPoints.length];
        particles[i].target.set(target.x, target.y);
    }
    
    // 获取告白文字元素
    confessionText = document.getElementById('confession-text');

    // 将你的“种子”数据作为随机数种子
    // 例如，相识日期 '20230825' 的哈希值，或者一个你们俩都懂的数字
    // 这里的种子只是一个示例
    randomSeed(12345);
}

// 主绘制循环，每帧执行一次
function draw() {
    // 绘制背景，带有轻微的透明度，制造拖尾效果
    background(0, 10);

    // 只有在 particles 数组不为空时才绘制
    if (particles.length > 0) {
        for (let p of particles) {
            p.update();
            p.show();
        }
    }
    
    // 根据帧数控制叙事阶段
    const frameLimit1 = 600; // 第一阶段持续时间
    const frameLimit2 = 1200; // 第二阶段持续时间
    
    if (stage === 0 && frameCount > frameLimit1) {
        stage = 1; // 进入过渡阶段
    } else if (stage === 1 && frameCount > frameLimit2) {
        stage = 2; // 进入告白阶段
        // 淡入告白文字
        confessionText.classList.add('visible');
    }
    
    // 在不同阶段控制粒子的行为
    if (stage === 1) {
        // 开始向目标点移动
        for (let p of particles) {
            p.isMoving = true;
        }
    } else if (stage === 2) {
        // 在告白阶段，粒子会固定在目标位置附近
        for (let p of particles) {
            // 轻轻颤动，制造呼吸感
            p.pos.x += random(-0.2, 0.2);
            p.pos.y += random(-0.2, 0.2);
            p.vel.mult(0.95); // 减慢速度
        }
    }
}

// 窗口大小改变时，重新调整画布大小
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// 新增函数：通过数学公式生成爱心图案的点
function generateHeartPoints(scale) {
    const points = [];
    const numPoints = 200; // 调整点的数量以改变精度
    
    for (let i = 0; i < numPoints; i++) {
        const t = map(i, 0, numPoints, 0, TWO_PI);
        const x = scale * 16 * pow(sin(t), 3);
        const y = -scale * (13 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t));
        points.push({ x: x, y: y });
    }
    
    return points;
}
