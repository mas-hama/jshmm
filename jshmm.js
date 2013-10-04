/**
 * jshmm.js
 *
 * a Hidden Malkov Model program by JavaScript
 *
 * @version 0.0.1
 * @author Masafumi Hamamoto
 *
 */

/////////////////////// constructor ///////////////////////////
"use strict";

function HMM(option)
{
  var self = this instanceof HMM
           ? this
           : Object.create(HMM.prototype);
  option = option || {};

  self.labelList = {};
  self.labelNum = 0;
  self.learningDataSet = [];
  self.lastPredResult = {};

  self.countXY = {}; // x,y => count
  self.countAllX = {}; // y => sum of all x of countXY
  self.countYY = {}; // y(i-1), y(i) => count
  self.countAllY = {}; // y(i-1) => sum of all y(i) of countYY

  self.sepalator = ':';

  return self;
}

///////////////////////// prediction /////////////////////////////

/**
 * predict input sequence represented by string
 * input string must be separated by \n and each line is assumed as an observation
 */
HMM.prototype.predictLabels = function(input) {
  var lines = input.split(/\n+/);
  var line;
  var i;
  var data;
  var seqStr = "";
  var x = []; // observation
  
  for(i = 0; i < lines.length; i++) {
    line = lines[i];
    line = line.replace(/^\s+/, "");
    if(line == ""){
       continue;
    }else if(line == "EOS"){
       break;
    }
    x.push(line);
  }

  var estimatedSeq = this.predict(x);
  this.lastPredResult.xlength = x.length;
  this.lastPredResult.estimated = estimatedSeq;

  return estimatedSeq;
}

/**
 * predict sequence
 */
HMM.prototype.predict = function(x) {
  var bosNode, eosNode;
  var node;
  var estimatedSeq;
  
  // make lattice
  var latticeInfo = this.makeLattice(x);
  bosNode = latticeInfo.bosNode;
  eosNode = latticeInfo.eosNode;
  this.lastPredResult.bosNode = bosNode;
  this.lastPredResult.eosNode = eosNode;

  // viterbi
  this.viterbi(bosNode);
  
  // backtrack
  estimatedSeq = [];
  for(node = eosNode.maxLeftNode; node !== null && node !== bosNode; node = node.maxLeftNode){
    estimatedSeq.push(node.y);
  }
  estimatedSeq = estimatedSeq.reverse();
  
  return estimatedSeq;
}

/**
 * make lattice to estimate
 */
HMM.prototype.makeLattice = function(x) { 
  var i;
  var lastNode, newNode, leftNode;
  var bosNode = this.createBOSNode();
  var leftNode = bosNode;
  var label;
  var eosNode;
  
  for (i = 0; i < x.length; i++) {
    lastNode = null;
    for (label in this.labelList) {
      newNode = new HMMNode(x[i], label, leftNode);
      newNode.next = lastNode;
      lastNode = newNode;
    }
    leftNode = lastNode;
  }
  eosNode = this.createEOSNode(leftNode);
  
  return {bosNode: bosNode, eosNode: eosNode};
}


/**
 * do viterbi algorithm: connect from each node to the best left node
 */
HMM.prototype.viterbi = function(bosNode) {
  var baseNode, node, leftNode;
  var logprob, score, maxScore;
  var xy, yy;
  var constant = 0.000001;
  
  bosNode.score = 0;
  for (baseNode = bosNode.right; baseNode != null; baseNode = baseNode.right) { // move position
    for (node = baseNode; node != null; node = node.next) { // check each label at baseNode position
      maxScore = -100000000;
      
      for (leftNode = node.left; leftNode != null; leftNode = leftNode.next) { // check all left nodes' score
        
        xy = node.x + this.sepalator + node.y;
        yy = leftNode.y + this.sepalator + node.y;

        logprob = 0;

        if(this.countXY[xy]){ // 学習データにxが出現している場合のみ
          logprob += Math.log(this.countXY[xy]/this.countAllX[node.y]);
        }else{
          logprob += Math.log(constant);
        }
        
        if(this.countYY[yy]){ // 学習データにy(i-1)y(i)の組が出現している場合のみ
          logprob += Math.log(this.countYY[yy]/this.countAllY[leftNode.y]);
        }else{
          logprob += Math.log(constant);
        }

        score = logprob + leftNode.score;

        if(maxScore < score){
          maxScore = score;
          node.score = score;
          node.maxLeftNode = leftNode;
        }
      }
    }
  }
}


///////////////////////// DATA READING ////////////////////////////

/**
 * parse a string of training data
 */
HMM.prototype.setTrainingData = function(trainingStr) {
  var lines = trainingStr.split(/\n+/);
  var line;
  var x, y, xy, yy;
  var lastY;
  var tuple;
  var lineCount;

  var isBOS = true;
  for(lineCount = 0; lineCount < lines.length; lineCount++){
    line = lines[lineCount].replace(/^\s+/, "").replace(/\s+$/, "");
    
    if(line == ""){
      // skip
      
    } else if (line == "EOS") {
      if (isBOS) continue;

      x = '__EOS__';
      y = '__EOSLABEL__';
      xy = x + this.sepalator + y;
      yy = lastY + this.sepalator + y;

      if(this.countXY[xy]){
        this.countXY[xy]++;
      }else{
        this.countXY[xy] = 1;
      }

      if(this.countYY[yy]){
        this.countYY[yy]++;
      }else{
        this.countYY[yy] = 1;
      }

      if(this.countAllX[y]){
        this.countAllX[y]++;
      }else{
        this.countAllX[y] = 1;
      }
      
      if(this.countAllY[lastY]){
        this.countAllY[lastY]++;
      }else{
        this.countAllY[lastY] = 1;
      }

      isBOS = true;
      
    } else {
      if (isBOS){
        lastY = '__BOSLABEL__';
        isBOS = false;
      }
      
      tuple = line.split(/\s+/);
      x = tuple[0];
      y = tuple[1];

      xy = x + this.sepalator + y;
      yy = lastY + this.sepalator + y;

      if(this.countXY[xy]){
        this.countXY[xy]++;
      }else{
        this.countXY[xy] = 1;
      }

      if(this.countYY[yy]){
        this.countYY[yy]++;
      }else{
        this.countYY[yy] = 1;
      }

      if(this.countAllX[y]){
        this.countAllX[y]++;
      }else{
        this.countAllX[y] = 1;
      }
      
      if(this.countAllY[lastY]){
        this.countAllY[lastY]++;
      }else{
        this.countAllY[lastY] = 1;
      }

      lastY = y;
      
      if (!this.labelList[y]) {
        this.labelList[y] = 1;
        this.labelNum++;
      }
    }
  }
}

/////////////////////////// LEARNING ///////////////////////////////

/**
 * do learning: calcurate probabilities
 */
HMM.prototype.learning = function() {
  // no need to learn
}


/////////////////////// NODE FUNCTIONS ////////////////////////

/**
 * make a new node
 */
function HMMNode(x, y, leftNode) {
  var self = this instanceof HMMNode
           ? this
           : Object.create(HMMNode.prototype);
  
  self.x = x; // observed
  self.y = y; // label
  self.left = leftNode;
  self.right = null;
  self.alpha = 0;
  self.beta = 0;
  self.maxLeftNode = null;
  
  self.next = null; // pointer to a node whose x is same and y is not same
  if(typeof leftNode === "object" && leftNode !== null){
    leftNode.right = self;
  }

  return self;
}

HMMNode.prototype.isBOSNode = function(){
  if(this.x === "__BOS__" && this.y === "__BOSLABEL__" ){
    return true;
  }else{
    return false;
  }
}

HMMNode.prototype.isEOSNode = function(){
  if(this.x === "__EOS__" && this.y === "__EOSLABEL__"){
    return true;
  }else{
    return false;
  }
}

HMM.prototype.createBOSNode = function(){
  return new HMMNode("__BOS__", "__BOSLABEL__", null);
}

HMM.prototype.createEOSNode = function(left){
  return new HMMNode("__EOS__", "__EOSLABEL__", left);
}


///////////////////////// presentation //////////////////////////////

HMM.prototype.genProbTable = function() {
  var html;
  var xy, yy;
  var y, lastY;
  var prob;

  html = '<h3>p(x|y)</h3>';
  html += '<table class="prob-table" border="2">';
  html += '<tr><th>label</th><th>prob</th></tr>';
  for(xy in this.countXY){
    y = (xy.split(this.sepalator))[1];
    prob = this.countXY[xy]/this.countAllX[y];
    html += '<tr><td>'+xy+'</td><td>'+prob+'</td></tr>';
  }
  html += '</table>';

  html += '<h3>p(y(i)|y(i-1))</h3>';
  html += '<table class="prob-table" border="2">';
  html += '<tr><th>label</th><th>prob</th></tr>';
  for(yy in this.countYY){
    lastY = (yy.split(this.sepalator))[0];
    prob = this.countYY[yy]/this.countAllY[lastY];
    html += '<tr><td>'+yy+'</td><td>'+prob+'</td></tr>';
  }
  html += '</table>';

  return html;
}

/**
 * show viterbi algorithm result as a table
 */
HMM.prototype.genViterbiResultTable = function() {
  var html = '<table class="viterbi-table" border="2">';
  var node;
  var baseNode;

  // convert lattice to 2D array
  var colsArray = [];
  var colIdx = 0, nodeIdx = 0;

  for (baseNode = this.lastPredResult.bosNode; baseNode != null; baseNode = baseNode.right, colIdx++) {
    colsArray[colIdx] = [];
    for (node = baseNode; node != null; node = node.next) {
      colsArray[colIdx].push(node);
    }
  }

  // header
  html += "<tr>";
  for (colIdx = 0; colIdx < colsArray.length; colIdx++) {
    html += "<th>" + colsArray[colIdx][0].x + "</th>";
  }
  html += "</tr>";

  // value
  for (nodeIdx = this.labelNum-1; 0 <= nodeIdx; nodeIdx--) {
    html += "<tr>";
    if(nodeIdx == this.labelNum-1){
      node = colsArray[0][0];
      html += this.genNodeInfoTD(node, true);
    }
    for (colIdx = 1; colIdx < colsArray.length-1; colIdx++) {
      node = colsArray[colIdx][nodeIdx];
      html += this.genNodeInfoTD(node);
    }
    if(nodeIdx == this.labelNum-1){
      node = colsArray[colsArray.length-1][0];
      html += this.genNodeInfoTD(node, true);
    }
    html += "</tr>";
  }
  
  html += "</table>";
  
  return html;
}

HMM.prototype.genNodeInfoTD = function(node, doRowSpan) {
  var td;

  if(doRowSpan){
    td = '<td rowspan="' + this.labelNum + '">';
  }else{
    td = "<td>";
  }
  td += '<table border="1">';
  td += "<tr><td>label</td><td>" + node.y + "</td></tr>";
  td += "<tr><td>score</td><td>" + node.score + "</td></tr>";
  if(node.maxLeftNode){
    td += "<tr><td>BestLeftLabel</td><td>" + node.maxLeftNode.y + "</td></tr>";
  }
  
  td += "</table>";
  
  td += "</td>";
  return td;
}


