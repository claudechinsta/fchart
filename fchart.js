/**
 * Created by heyli on 2015/1/26.
 */
function fchart(opt) {
    this.data = opt.data;                               // data
    this.canvas = opt.wrapper;                         // canvas
    this.ctx = opt.wrapper.getContext('2d');           // canvas context
    this.cx = opt.cx || 100;                            // piechart x coordinate
    this.cy = opt.cy || 100;                            // piechart y coordinate
    this.r = opt.r || 100;                              // piechart radius
    this.img = new Image();                             // icon image
    var self = this;

    self.getWrapperSize();
    self.sortData();
    self.init();
}

// initialization
fchart.prototype.init = function() {
    this.dataInfo = {};
    this.dataRectangle = {};
    this.index = 0;
    this.changedDeg = 10;
    this.getTotal();
    this.getPercentage();
    this.draw();
    // this.drawTotalNumber();
    // this.drawLabel();
};

// sortData from small to big
fchart.prototype.sortData = function() {

    var sortTable = [];
    for (key in this.data) {
        sortTable.push([key, this.data[key].figure]);
    }
    sortTable.sort(function(a, b) {return b[1] - a[1]});
    for (key in sortTable) {
        // var key = sortTable[index][0];
        // dataSourceSorted[key] = {};
        // dataSourceSorted[key]['figure'] = sortTable[index][1];
        // dataSourceSorted[key]['color'] = dataSource[key].color;
    }

};

// get wrapper size and set canvas size
fchart.prototype.getWrapperSize = function() {
    this.canvas.width = this.canvas.parentNode.clientWidth * 2;
    this.canvas.height = this.canvas.parentNode.clientHeight * 2;
    this.canvas.style.cssText = '-webkit-transform: translateX(-' + (this.canvas.width / 4) + 'px) scale(0.5);-webkit-transform-origin: 50% 50%';
    this.cx = this.canvas.clientWidth / 2;
    this.cy = this.canvas.clientHeight / 2 - 150;
};

// get total number
fchart.prototype.getTotal = function() {
    this.total = 0;
    for (key in this.data) {
        this.total += this.data[key].figure;
    }
};

// get percentage
fchart.prototype.getPercentage = function() {
    this.dataPercentage = {};
    for (key in this.data) {
        this.dataPercentage[key] = this.data[key].figure / this.total;
    }
};

// draw canvas
fchart.prototype.draw = function() {
    this.drawPieChart();
};

// draw piechart
fchart.prototype.drawPieChart = function(){
    var ctx = this.ctx;

    var startDeg = -90;      // top degree is -90 degree
    var deg = 0;             // start degree
    var endDeg = 0;          // end degree
    var startRadius = 0;     // start radius
    var endRadius = 0;       // end radius
    var startPos = {'x': this.cx, 'y': this.r - this.y};    // start drawing position
    var endPos = {'x': 0, 'y': 0};                              // end line position
    this.currentDeg = 0;   //accumulated degrees for drawing icon

    for (key in this.dataPercentage) {
        this.dataInfo[key] = {};
        deg = this.dataPercentage[key] * 360;
        if (deg === 0) {
            continue;
        }
        endDeg = startDeg + deg;
        startRadius = this.getRadius(startDeg);
        endRadius = this.getRadius(endDeg);
        //store info
        this.dataInfo[key].deg = deg;
        this.dataInfo[key].startDeg = startDeg;
        this.dataInfo[key].endDeg = endDeg;
        this.dataInfo[key].startRadius = startRadius;
        this.dataInfo[key].endRadius = endRadius;

        // drawing pichart
        ctx.beginPath();
        ctx.moveTo(this.cx, this.cy);
        ctx.lineTo(startPos.x, startPos.y);
        ctx.arc(this.cx, this.cy, this.r, startRadius, endRadius, 0, 0);
        this.getPos(endDeg, endPos, this.r);
        ctx.fillStyle = this.data[key].color;
        ctx.fill();
        ctx.closePath();


        // drawing white border
        ctx.beginPath();
        ctx.moveTo(this.cx, this.cy);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.closePath();

        // next sector data
        startDeg = endDeg;
        startPos.x = endPos.x;
        startPos.y = endPos.y;

    }
};

fchart.prototype.drawLabel = function() {
    var ctx = this.ctx;
    var posStore = {};

    // this.data['male'].figure = 250;
    // this.data['female'].figure = 190;
    // this.data['unknown'].figure = 5;
    // this.dataPercentage['male'] = 0.65;
    // this.dataPercentage['female'] = 0.30;
    // this.dataPercentage['unknown'] = 0.05;

    var totalBits = 0;
    var multiplier = 0;
    var i = 0;
    // draw absolute number
    for (key in this.data) {
        var bts = this.getBits(this.data[key].figure);
        switch (i) {
            case 0:
                multiplier += (bts > 2) ? 3 : 2; 
                multiplier += (bts === 4) ? 1 : 2; 
            break;
            case 1:
                 multiplier += 4;  
            break;
            case 2: 
                multiplier += (bts > 2) ? 3 : 2; 
                multiplier += (bts === 4) ? 1 : 2; 
            break;
        }
        totalBits = totalBits + bts; 
        i++;
    }

    // console.log(multiplier);
    var numFontSize = 72;
    ctx.font = numFontSize + 'px sans-serif';
    var numWidth = ctx.measureText(1).width;
    
    var percentFontSize = 28;
    ctx.font = percentFontSize + 'px sans-serif';
    var percentWidth = ctx.measureText(1).width;

    
    var prePosX = 0;
    var prePosY = 0;
    var index = 0;

    for (key in this.data) {
        if (index === 0) {
            var bits0 = this.getBits(this.data[key].figure);
            
            // console.log(numWidth);
            var numTotalWidth = numWidth * multiplier;
            posStore[key] = {};
            posStore[key].xPos = this.cx - numTotalWidth / 2;
            posStore[key].yPos = this.cy + 300;
            posStore[key].bits = bits0;
        }
        else if (index === 1) {
            var bits1 = this.getBits(this.data[key].figure);
            var gap1 = (bits1 > 3) ? 1 : 2;
            posStore[key] = {};
            posStore[key].xPos = prePosX + (bits0 + gap1) * numWidth + (4 - bits1) * numWidth / 2;
            posStore[key].yPos = prePosY;
            posStore[key].bits = bits1;
        }
        else if (index === 2) {
            var bits2 = this.getBits(this.data[key].figure);
            var gap2 = (bits2 > 3) ? 1 : 2;
            posStore[key] = {};
            posStore[key].xPos = prePosX + (4 + gap2) * numWidth;
            posStore[key].yPos = prePosY;
            posStore[key].bits = bits2;
        }

        ctx.font = numFontSize + "px -apple-system-font, \"Helvetica Neue\", Helvetica, STHeiTi, sans-serif";
        ctx.fillStyle = '#666666';
        ctx.fillText(this.data[key].figure, posStore[key].xPos, posStore[key].yPos);
        var percentNum = Math.ceil(this.dataPercentage[key] * 100);
        var percentBits = this.getBits(percentNum) + 1;
        ctx.font = percentFontSize + "px -apple-system-font, \"Helvetica Neue\", Helvetica, STHeiTi, sans-serif";
        ctx.fillStyle = '#999999';
        ctx.fillText(percentNum + '%', posStore[key].xPos + (posStore[key].bits * numWidth - percentBits * percentWidth) / 2, 
                     posStore[key].yPos + 65);

        var icon = this.data[key].icon;
        ctx.drawImage(this.img, icon.x, icon.y, icon.w, icon.h, posStore[key].xPos + (posStore[key].bits * numWidth - icon.sw) / 2, 
                      posStore[key].yPos + 100, icon.sw, icon.sh)

        prePosX = posStore[key].xPos;
        prePosY = posStore[key].yPos;
        index++
    }
};

fchart.prototype.drawNumber = function(key, degHalf, endPos, xDelta, yDelta, iconLen) {
    // var ctx = this.ctx;
    // var percentage = Math.round(this.dataPercentage[key] * 100);
    // var bits = this.getBits(this.data[key].figure);
    // var fontSize = (this.canvas.width > 320) ? 44 : 32;
    // var marginHorizontal = 10;
    // var marginVertical = 20;
    // var numMargin = 0;
    // var percentMargin = 0;
    // ctx.font = fontSize + 'px sans-serif';
    // var numWidth = ctx.measureText(this.data[key].figure).width;
    // ctx.font = "30px sans-serif";
    // var percentWidth = ctx.measureText(percentage + '%').width;

    // if (degHalf <= 180){
    //     iconLen *= 1;
    //     marginHorizontal *= 1;
    //     numMargin += (xDelta + iconLen + marginHorizontal);
    //     percentMargin += (xDelta + iconLen + marginHorizontal);
    // }
    // else {
    //     iconLen *= -1;
    //     marginHorizontal *= -1;
    //     numWidth *= -1;
    //     numMargin += (xDelta + numWidth + marginHorizontal * 1.5);
    //     percentWidth *= -1;
    //     percentMargin += (xDelta +  percentWidth + marginHorizontal * 1.5);
    // }
    // var numX = endPos.x + numMargin;
    // var numY = endPos.y + yDelta +  marginVertical;
    // var percentX = endPos.x + percentMargin;
    // var percentY =endPos.y + yDelta + fontSize +  marginVertical;

    // var avoidCollisionDeg = degHalf;
    // var result = this.checkCollision(key, degHalf, numWidth, fontSize, percentWidth, 30, numX, numY, iconLen, marginHorizontal);
    // if (result) {
    //     avoidCollisionDeg += this.changedDeg;
    //     avoidCollisionDeg = (avoidCollisionDeg - 360 >= 0) ? (avoidCollisionDeg - 360): avoidCollisionDeg;
    //     this.changedDeg += 10;
    //     this.drawLabel(key, 0, avoidCollisionDeg);
    //    return false;
    // }
    // this.changedDeg = 10;

    // ctx.font = fontSize + "px -apple-system-font, \"Helvetica Neue\", Helvetica, STHeiTi, sans-serif";
    // ctx.fillStyle = this.data[key].color;
    // ctx.fillText(this.data[key].figure, numX, numY);

    // ctx.font = "30px -apple-system-font, \"Helvetica Neue\", Helvetica, STHeiTi, sans-serif";
    // ctx.fillText(percentage + '%', percentX, percentY);
    // return true;
};

fchart.prototype.drawTotalNumber = function() {
    var ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.r - 40, 0, Math.PI*2, true);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.closePath();

    var bits = this.getBits(this.total);
    var fontSize = (bits <= 3) ? 120 : 100;
    ctx.fillStyle = '#666666';
    ctx.font = fontSize + "px -apple-system-font, \"Helvetica Neue\", Helvetica, STHeiTi, sans-serif";
    var textWidth = ctx.measureText(this.total).width;
    ctx.fillText(this.total, this.cx - textWidth / 2 + 4, this.cy);

    var tag = '报名人数';
    ctx.fillStyle = '#666666';
    ctx.font = "48px -apple-system-font, \"Helvetica Neue\", Helvetica, STHeiTi, sans-serif";
    textWidth = ctx.measureText(tag).width;
    ctx.fillText(tag, this.cx - textWidth / 2 + 4, this.cy + 80);

};

fchart.prototype.getBits = function(num) {
    var bits = 0;
    while (true) {
        num /= 10;
        bits++;
        if (num < 1) {
            break;
        }

    }
    return bits;
};

//convert degree to radius
fchart.prototype.getRadius = function(deg) {
    return deg / 180 * Math.PI;
};

// get end line of sector position
fchart.prototype.getPos = function(currentDeg, lineToPos, r) {
    var radius = 0;
    var deg = 0;
    currentDeg += 90;

    if (currentDeg <= 90) {
        deg = 90 - currentDeg;
        radius = this.getRadius(deg);
        lineToPos.x = this.cx + Math.cos(radius) * r;
        lineToPos.y = this.cy - Math.sin(radius) * r;
    }
    else if (currentDeg <= 180) {
        deg = currentDeg - 90;
        radius = this.getRadius(deg);
        lineToPos.x = this.cx + Math.cos(radius) * r;
        lineToPos.y = this.cy + Math.sin(radius) * r;
    }
    else if (currentDeg <= 270) {
        deg = 270 - currentDeg;
        radius = this.getRadius(deg);
        lineToPos.x = this.cx - Math.cos(radius) * r;
        lineToPos.y = this.cy + Math.sin(radius) * r;
    }
    else if (currentDeg <= 360) {
        deg = currentDeg - 270;
        radius = this.getRadius(deg);
        lineToPos.x = this.cx - Math.cos(radius) * r;
        lineToPos.y = this.cy - Math.sin(radius) * r;
    }
}