/**
 * Created by heyli on 2015/1/26.
 */
var utils = {

    sort: function(raw, sorted) {
        var sortTable = [];
        for (key in raw) {
            sortTable.push([key, raw[key].figure]);
        }
        sortTable.sort(function(a, b) {return b[1] - a[1]});

        // resume other data field value
        for (key in sortTable) {
            var index = sortTable[key][0];
            sorted[index] = {};
            for (k in raw[index]) {
                sorted[index][k] = raw[index][k];
            }
        }
    },

    getTotal: function(raw) {
        var total = 0;
        for (key in raw) {
            total += raw[key].figure;
        }
        return total;
    },

    getPercentage: function(sorted, percentage, total) {
        for (key in sorted) {
            percentage[key] = sorted[key].figure / total;
        }
    },

    getRadius: function(deg) {
        return deg / 180 * Math.PI;
    },

};

/**
 * BarChart
 */
function BarChart(opt, fc) {
    this.ctx = fc.ctx;
    this.canvas = fc.canvas; 
    this.data = fc.data;
}

BarChart.prototype.draw = function() {
    var ctx = this.ctx;
    this._drawAxis(ctx);
    this._drawBar();
    // this._animateDraw(this._drawBar);
};

BarChart.prototype._animateDraw = function(drawFunc) {
    drawFunc.call(self);
    // var self = this;
    // var startH = 0;
    // var incre = 5;

    // var dr = setInterval(function() {
    //     ctx.save();
        
    //     ctx.clearRect(0,0,600,600);
    //     drawFunc.call(self, startH);
    //     startH += incre;

    //     if (startDeg >= 300) {
    //         clearInterval(dr);
    //         // TODO draw
    //     }
        
    //     ctx.restore();
    // }, 30);
};

BarChart.prototype._drawAxisYLabel = function(x, y, figure) {
    var ctx = this.ctx;
    ctx.font = "30px -apple-system-font, \"Helvetica Neue\", Helvetica, STHeiTi, sans-serif";
    var txt = figure;
    ctx.fillStyle = "#000000";
    ctx.fillText(figure, x - ctx.measureText(txt).width - 10, y + 15);
}

BarChart.prototype._drawBar = function() {
    var ctx = this.ctx;
    // x轴上放bar的允许长度
    var barAxisW = this.axisXLen * 0.8;
    var barW = barAxisW / this.arrLen * 0.7;
    var gap = barAxisW / this.arrLen * 0.3;
    var x = this.axisZeroPointX - (this.axisYLen - barAxisW) / 2
    
    for (key in this.data.raw) {
        ctx.beginPath();
        var barH = this.data.raw[key].figure / this.accu * this.axisYPerLen;
        var y = this.axisZeroPointY - barH;
        ctx.fillStyle = this.data.raw[key].color;
        ctx.fillRect(x, y, barW, barH);
        x += (barW + gap);
        ctx.closePath();
    }
};

BarChart.prototype._drawAxis = function(ctx) {
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;

    // 80%的画布长宽作为坐标轴
    this.axisXLen = this.canvas.width * 0.8;
    this.axisYLen = this.canvas.height * 0.8;

    this.axisZeroPointX = this.centerX - this.axisXLen / 2;
    this.axisZeroPointY = this.centerY + this.axisYLen / 2;

    this.axisDesPointX = this.axisZeroPointX + this.axisXLen;
    this.axisDesPointY = this.axisZeroPointY - this.axisYLen;

    // 画坐标轴
    ctx.beginPath();
    // 回到原点
    ctx.moveTo(this.axisZeroPointX, this.axisZeroPointY);
    // 
    ctx.lineTo(this.axisDesPointX, this.axisZeroPointY);
    ctx.moveTo(this.axisZeroPointX, this.axisZeroPointY);
    ctx.lineTo(this.axisZeroPointX, this.axisDesPointY);
    ctx.lineWidth = 1;
    ctx.closePath();
    ctx.stroke();
    
    // Y轴数值每节高度
    this.axisYPerLen = this.axisYLen / 4;

    // 找最大值
    var max = 0;
    this.arrLen = 0;
    for (key in this.data.raw) {
        if (this.data.raw[key].figure > max) {
            max = this.data.raw[key].figure;
        }
        this.arrLen++;
    }

    // Y轴数值
    this.yValue = Math.ceil(max / 4);
    var bitArr = [];
    
    // 计算端值
    this.accu = 0;
    for (var i = 5; i > 0 ; i =i + 5) {
        this.accu = i * 4;
        if (this.accu > this.yValue) {
            break;
        }
    }

    // 画Y坐标轴端点及数值
    ctx.beginPath();

    for (var i = 0; i <= 4; i++) {
        var x = this.axisZeroPointX - 5;
        var y = this.axisZeroPointY - i * this.axisYPerLen - 5;
        this._drawAxisYLabel(x, y, this.accu * i);
        ctx.fillRect(x, y, 10, 10);
    }

    ctx.closePath();

};


/**
 * PieChart
 */
function PieChart(opt, fc) {
    this.ctx = fc.ctx;
    this.canvas = fc.canvas; 
    this.data = fc.data;
    this.cx = opt.cx || 100;                            // piechart x coordinate
    this.cy = opt.cy || 100;                            // piechart y coordinate
    this.r = opt.r || 100;                              
    this.lineWidth = opt.lineWidth || 50;  
    this.align = opt.align || 'center';
}

PieChart.prototype.draw = function() {
    this._align();
    this._animateDraw(this._drawPieChart);
};

PieChart.prototype._animateDraw = function(drawFunc) {
    var ctx = this.ctx;
    var startDeg = -90;
    var incre = 30;
    var self = this;

    var dr = setInterval(function() {
        ctx.save();
        
        ctx.clearRect(0,0,600,600);
        drawFunc.call(self, startDeg);
        startDeg += incre;

        if (startDeg >= 300) {
            clearInterval(dr);
            PieChart.prototype._drawLabel.call(self);
        }
        
        ctx.restore();
    }, 30);
};

// draw piechart
PieChart.prototype._drawPieChart = function(startDeg){
    var ctx = this.ctx;

    // var startDeg = -90;      // top degree is -90 degree
    var deg = 0;             // start degree
    var endDeg = 0;          // end degree
    var startRadius = 0;     // start radius
    var endRadius = 0;       // end radius
    var startPos = {'x': this.cx, 'y': this.r - this.y};    // start drawing position
    var endPos = {'x': 0, 'y': 0};                              // end line position
    this.currentDeg = 0;   //accumulated degrees for drawing icon

    for (key in this.data.percentage) {
        this.data.info[key] = {};
        deg = this.data.percentage[key] * 360;
        if (deg === 0) {
            continue;
        }
        endDeg = startDeg + deg;
        startRadius = utils.getRadius(startDeg);
        endRadius = utils.getRadius(endDeg);
        //store info
        this.data.info[key].deg = deg;
        this.data.info[key].startDeg = startDeg;
        this.data.info[key].endDeg = endDeg;
        this.data.info[key].startRadius = startRadius;
        this.data.info[key].endRadius = endRadius;

        // drawing pichart
        ctx.beginPath();
        ctx.moveTo(this.cx, this.cy);
        ctx.lineTo(startPos.x, startPos.y);
        ctx.arc(this.cx, this.cy, this.r, startRadius, endRadius, 0, 0);
        this._getPos(endDeg, endPos, this.r);
        ctx.fillStyle = this.data.sorted[key].color;
        ctx.fill();
        ctx.closePath();


        // next sector data
        startDeg = endDeg;
        startPos.x = endPos.x;
        startPos.y = endPos.y;

    }
};

// get end line of sector position
PieChart.prototype._getPos = function(currentDeg, lineToPos, r) {
    var radius = 0;
    var deg = 0;
    currentDeg += 90;

    if (currentDeg > 360) {
        currentDeg -= 360;
    }

    if (currentDeg <= 90) {
        deg = 90 - currentDeg;
        radius = utils.getRadius(deg);
        lineToPos.x = this.cx + Math.cos(radius) * r;
        lineToPos.y = this.cy - Math.sin(radius) * r;
    }
    else if (currentDeg <= 180) {
        deg = currentDeg - 90;
        radius = utils.getRadius(deg);
        lineToPos.x = this.cx + Math.cos(radius) * r;
        lineToPos.y = this.cy + Math.sin(radius) * r;
    }
    else if (currentDeg <= 270) {
        deg = 270 - currentDeg;
        radius = utils.getRadius(deg);
        lineToPos.x = this.cx - Math.cos(radius) * r;
        lineToPos.y = this.cy + Math.sin(radius) * r;
    }
    else if (currentDeg <= 360) {
        deg = currentDeg - 270;
        radius = utils.getRadius(deg);
        lineToPos.x = this.cx - Math.cos(radius) * r;
        lineToPos.y = this.cy - Math.sin(radius) * r;
    }
};

PieChart.prototype._align = function() {
    switch(this.align){
        case 'left':
            this.cx = this.r + this.lineWidth;
            break;
        case 'right':
            this.cx = this.canvas.clientWidth - this.r - this.lineWidth;
            break;
        default:
            this.cx = this.canvas.clientWidth / 2;
            break;
    }

    this.cy = this.canvas.clientHeight / 2;
};

// draw label and data
PieChart.prototype._drawLabel = function() {
    var ctx = this.ctx;
    switch(this.align){
        case 'left':
            var x = this.cx + this.r + 60;
            break;
        case 'right':
            var x = 60;
            break;
        default:
            return;
            break;
    }
    
    var y = this.cy - this.r;

    for (key in this.data.sorted) {
        ctx.fillStyle = this.data.sorted[key].color;
        ctx.fillRect(x, y, 30, 30);
        PieChart.prototype._drawText.call(this, x, y, key);
        y += 60;
    }
};

PieChart.prototype._drawText = function(x, y, key) {
    var ctx = this.ctx;
    ctx.font = "30px -apple-system-font, \"Helvetica Neue\", Helvetica, STHeiTi, sans-serif";
    ctx.fillStyle = "#000000";
    var showFigure = Math.round(this.data.percentage[key] * 10000) / 100;
    ctx.fillText(key + ' ' + showFigure + '%', x + 40, y + 25);
};

/**
 * RingChart
 */
function RingChart(opt, fc) {
    this.ctx = fc.ctx;
    this.canvas = fc.canvas; 
    this.data = fc.data;
    this.cx = opt.cx || 100;                            // piechart x coordinate
    this.cy = opt.cy || 100;                            // piechart y coordinate
    this.r = opt.r || 100;                              
    this.lineWidth = opt.lineWidth || 50;               // piechart radius
    this.align = opt.align || 'center';
}

RingChart.prototype.draw = function() {
    PieChart.prototype._align.call(this);
    PieChart.prototype._animateDraw.call(this, this._drawRingChart);
};

RingChart.prototype._drawRingChart = function(startDeg) {
    var ctx = this.ctx;
    // var startDeg = -90;
    var deg = 0;
    var endDeg = 0;
    var startRadius = 0;
    var endRadius = 0;
    var startPos = {'x': this.cx, 'y': this.r - this.y};    // start drawing position
    var endPos = {'x': 0, 'y': 0};                              // end line position
    this.currentDeg = 0;   //accumulated degrees for drawing icon

    for (key in this.data.percentage) {
        this.data.info[key] = {};
        deg = this.data.percentage[key] * 360;
        if (deg === 0) {
            continue;
        }
        endDeg = startDeg + deg;
        startRadius = utils.getRadius(startDeg);
        endRadius = utils.getRadius(endDeg);
        //store info
        this.data.info[key].deg = deg;
        this.data.info[key].startDeg = startDeg;
        this.data.info[key].endDeg = endDeg;
        this.data.info[key].startRadius = startRadius;
        this.data.info[key].endRadius = endRadius;

        // drawing pichart
        ctx.beginPath();
        ctx.strokeStyle = this.data.sorted[key].color;
        ctx.arc(this.cx, this.cy, this.r, startRadius, endRadius, 0);
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
        ctx.closePath();

        // next sector data
        startDeg = endDeg;
        startPos.x = endPos.x;
        startPos.y = endPos.y;

    }

};

function fdata(data) {
    this.raw = data;
    this.sorted = {};
    this.info = {};
    this.total = 0;
    this.percentage = {};
}

function fchart(opt) {
    this.canvas = opt.wrapper;                         // canvas
    this.ctx = opt.wrapper.getContext('2d');           // canvas context
    this.type = opt.type || 'piechart';

    this.data = new fdata(opt.data);
    this.data.total = utils.getTotal(this.data.raw);
    utils.sort(this.data.raw, this.data.sorted);
    utils.getPercentage(this.data.sorted, this.data.percentage, this.data.total);
    
    this.getWrapperSize();
    this.draw(opt);
}

// get wrapper size and set canvas size
fchart.prototype.getWrapperSize = function() {
    this.canvas.width = this.canvas.parentNode.clientWidth * 2;
    this.canvas.height = this.canvas.parentNode.clientHeight * 2;
    this.canvas.style.cssText = '-webkit-transform: translateX(-' + (this.canvas.width / 4) + 'px) scale(0.5);-webkit-transform-origin: 50% 0';
};

// draw canvas
fchart.prototype.draw = function(opt) {
    var obj;
    switch(this.type){
        case 'ringchart':
            obj = new RingChart(opt, this);
            break;
        case 'barchart':
            obj = new BarChart(opt, this);
            break;
        default:
            obj = new PieChart(opt, this);
            break;
    }

    obj.draw();
};

// fchart.prototype.monitorEvent = function() {

//     this.canvas.addEventListener('mousemove', function(e) {
//         console.log(e.clientX, e.clientY);
//     }, false);
// };