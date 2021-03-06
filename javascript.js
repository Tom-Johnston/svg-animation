/* globals Path, helvetica,PathAnimation, console */

var animationDuration = 2000;

var pathAnimations = [];

function animate(string, nodes, y, hideNodes) {
  'use strict';
  var i;
  var svg = document.getElementById('svg');
  if (typeof y === 'undefined') {
    y = 100;
  }
  if (!nodes) {
    var suitableNodes = [3,4,5,6,7,8,9,10,11,12,14,15,16,17];

    if (string.length > suitableNodes.length) {
      throw 'String is too long. Not enough suitable paths to transform.';
    }

    //Choose the nodes to transform;
    var chosenNodes = [];
    var theChosenOne;
    while (chosenNodes.length < string.length) {
      theChosenOne = Math.floor(Math.random() * suitableNodes.length);
      chosenNodes.push(svg.childNodes[suitableNodes.splice(theChosenOne,1)[0]]);
    }

    //Order them from left to right based on the midpoint.
    var midPoints = [];
    for (i = 0; i < chosenNodes.length; i++) {
      midPoints[i] = ((new Path(chosenNodes[i].getAttribute('d'))).getMidPoint()[0]);
    }

    var sortedMidPoints = midPoints.slice().sort();
    nodes = [];
    for (i = 0; i < chosenNodes.length; i++) {
      theChosenOne = midPoints.indexOf(sortedMidPoints[i]);
      nodes[i] = chosenNodes[theChosenOne];
      midPoints[theChosenOne] = null;
    }
  }

  var viewBox = svg.getAttribute('viewBox').split(/[ ,]+/);
  var paths = [];
  var padding = 20;
  var xValues = [];

  var boundingBox;
  for (i = 0; i < string.length; i++) {
    if (helvetica[string.charAt(i)]) {
      paths.push(new Path(helvetica[string.charAt(i)]));
      if (i === 0) {
        xValues.push(0);
      }else {
        xValues.push(xValues[i - 1] + paths[i - 1].getBBox()[1] + padding);
      }
    }else {
      throw 'Invalid String';
    }
  }
  var width = +xValues[xValues.length - 1] + (+paths[paths.length - 1].getBBox()[1]);
  var maxWidth = viewBox[2] * 0.8;
  if (width > maxWidth) {
    xValues = [];
    for (i = 0; i < paths.length; i++) {
      paths[i].scalePath(maxWidth / width);
      if (i === 0) {
        xValues.push(0);
      }else {
        xValues.push(xValues[i - 1] + paths[i - 1].getBBox()[1] + padding * maxWidth / width);
      }
    }
    width = maxWidth;
  }
  var leftMargin = (viewBox[2] - width) / 2 + (+viewBox[0]);
  var pathAnimation;
  for (i = 0; i < string.length; i++) {
    pathAnimation = new PathAnimation(nodes[i], paths[i].translatePath(xValues[i] + (+leftMargin), y));
    pathAnimation.setBezierCurve(cx1,cy1,cx2,cy2);
    pathAnimation.animationDuration = animationDuration;
    pathAnimation.animationDelay = 500;
    if (animationLoop === true) {
      pathAnimation.animationIterationCount = -1;
    }else {
      pathAnimation.animationIterationCount = 1;
    }
    pathAnimation.start();
    pathAnimations.push(pathAnimation);
  }
  if (typeof hideNodes === 'undefined' || hideNodes === true) {
    for (i = 2; i < svg.childNodes.length; i++) {
      if (nodes.indexOf(svg.childNodes[i]) === -1) {
        svg.childNodes[i].style.transition = 'opacity 1s';
        svg.childNodes[i].style.opacity = '0.2';
      }
    }
  }
}

window.onload = onLoad;

function onLoad() {
  'use strict';
  changeDimensionsOfBezier(300,100);
  updateBezierGraph(0.25,0.1,0.25,1,widthG,heightG);
  updateRectangleBoundingBox();
  addListeners();
  var string = getParameterByName('string');
  if (string.length > 0) {
    animate(string);
  }
}

function changeDimensionsOfBezier(width, height) {
  'use strict';
  document.getElementById('bezier').setAttribute('viewBox', '0 0 ' + width + ' ' + height);

  document.getElementById('background').setAttribute('height',height);
  document.getElementById('background').setAttribute('width',width);

  document.getElementById('startPoint').setAttribute('cy',height);
  document.getElementById('endPoint').setAttribute('cx',width);

  widthG = width;
  heightG = height;
  updateBezierGraph(cx1, cy1, cx2, cy2, width ,height);
}

var cx1 = 0;
var cy1 = 0;
var cx2 = 0;
var cy2 = 0;

var widthG = 100;
var heightG = 100;

function updateBezierGraph(x1, y1, x2, y2, width, height) {
  'use strict';
  //Store the control points/
  cx1 = x1;
  cy1 = y1;
  cx2 = x2;
  cy2 = y2;
  //Update the curve
  var curvePath = ' m 0 ' + height + ' c ' + x1 * width + ' ' + -1 * y1 * height + ' ' + x2 * width + ' ' + -1 * y2 * height + ' ' + width + ' ' + -height;
  document.getElementById('curve').setAttribute('d',curvePath);
  //Update the control points
  document.getElementById('control1').setAttribute('cx', x1 * width);
  document.getElementById('control1').setAttribute('cy', height - 1 * y1 * height);

  document.getElementById('control2').setAttribute('cx', x2 * width);
  document.getElementById('control2').setAttribute('cy', height - 1 * y2 * height);

  //Update the lines to the control points
  var controlLinePath = ' m 0 ' + height + ' l ' + x1 * width + ' ' + -1 * y1 * height;
  document.getElementById('controlLine1').setAttribute('d',controlLinePath);
  controlLinePath = 'm ' + width + ' 0 l ' + (-width + x2 * width) + ' ' + (height - 1 * y2 * height);
  document.getElementById('controlLine2').setAttribute('d',controlLinePath);

}

var currentX;
var currentY;
var graphBoundingBox;

function addListeners() {
  'use strict';
  document.getElementById('control1').addEventListener('mousedown',onMouseDown);
  document.getElementById('control2').addEventListener('mousedown',onMouseDown);
  document.getElementById('minus-wrapper').addEventListener('click', onClickMinus);
  document.getElementById('plus-wrapper').addEventListener('click', onClickPlus);
  document.getElementById('loop').addEventListener('change', onLoopChanged);
  window.addEventListener('resize',updateRectangleBoundingBox);
}

function updateRectangleBoundingBox() {
  'use strict';
  graphBoundingBox = document.getElementById('background').getBoundingClientRect();
}

function onMouseDown(e) {
  'use strict';
  currentX = e.clientX;
  currentY = e.clientY;
  if (e.srcElement === document.getElementById('control1')) {
    window.addEventListener('mousemove',moveControlPoint1);
  }else {
    window.addEventListener('mousemove',moveControlPoint2);
  }
  window.addEventListener('mouseup',onMouseUp);
}

function onMouseUp(e) {
  'use strict';
  window.removeEventListener('mousemove',moveControlPoint1);
  window.removeEventListener('mousemove',moveControlPoint2);
}

function moveControlPoint1(e) {
  'use strict';
  var x = e.clientX;
  if (e.clientX < graphBoundingBox.left) {
    x = graphBoundingBox.left;
  }else if (e.clientX > graphBoundingBox.right) {
    x = graphBoundingBox.right;
  }
  var deltaX = (e.clientX - currentX) / graphBoundingBox.width;
  var deltaY = (e.clientY - currentY) / graphBoundingBox.height;
  currentX = x;
  currentY = e.clientY;
  if (cx1 + deltaX < 0) {
    updateBezierGraph(0, cy1 - deltaY, cx2 , cy2, widthG, heightG);
  }else if (cx1 + deltaX > 1) {
    updateBezierGraph(1, cy1 - deltaY, cx2 , cy2, widthG, heightG);
  }else {
    updateBezierGraph(cx1 + deltaX, cy1 - deltaY, cx2 , cy2, widthG, heightG);
  }
}

function moveControlPoint2(e) {
  'use strict';
  var x = e.clientX;
  if (e.clientX < graphBoundingBox.left) {
    x = graphBoundingBox.left;
  }else if (e.clientX > graphBoundingBox.right) {
    x = graphBoundingBox.right;
  }
  var deltaX = (e.clientX - currentX) / graphBoundingBox.width;
  var deltaY = (e.clientY - currentY) / graphBoundingBox.height;
  currentX = x;
  currentY = e.clientY;
  if (cx2 + deltaX < 0) {
    updateBezierGraph(cx1, cy1, 0 , cy2 - deltaY, widthG, heightG);
  }else if (cx2 + deltaX > 1) {
    updateBezierGraph(cx1, cy1, 1 , cy2  - deltaY, widthG, heightG);
  }else {
    updateBezierGraph(cx1, cy1, cx2  + deltaX , cy2  - deltaY, widthG, heightG);
  }
}

function getParameterByName(name) {
  'use strict';
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
  results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function reset() {
  'use strict';
  for (var i = 0; i < pathAnimations.length; i++) {
    pathAnimations[i].forwards = false;
    pathAnimations[i].animationDelay = 0;
    pathAnimations[i].start();
  }
  pathAnimations = [];
  setTimeout(makeEverythingVisible,2000);
}

function makeEverythingVisible() {
  'use strict';
  var svg = document.getElementById('svg');
  for (var i = 0; i < svg.childNodes.length; i++) {
    svg.childNodes[i].style.opacity = '1';
  }
}

var minusPlaying = false;
var plusPlaying = false;

function onClickMinus() {
  'use strict';
  if (minusPlaying === false) {
    minusPlaying = true;
    document.getElementById('minus').classList.add('one-eighty');
    setTimeout(function() {document.getElementById('minus').classList.remove('one-eighty'); minusPlaying = false;}, 500 );
  }
  animationDuration = animationDuration - 100;
  document.getElementById('duration').innerHTML = (animationDuration / 1000).toFixed(1) + 's';
}

function onClickPlus() {
  'use strict';
  if (plusPlaying === false) {
    plusPlaying = true;
    document.getElementById('plus').classList.add('one-eighty');
    setTimeout(function() {document.getElementById('plus').classList.remove('one-eighty'); plusPlaying = false;}, 500 );
  }
  animationDuration = animationDuration + 100;
  document.getElementById('duration').innerHTML = (animationDuration / 1000).toFixed(1) + 's';
}

var animationLoop = false;

function onLoopChanged(event) {
  'use strict';
  animationLoop = event.target.checked;
}
