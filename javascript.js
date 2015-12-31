function animate(string){
  var svg = document.getElementById('svg');

  var suitableNodes = [3,4,5,6,7,8,9,10,11,12,14,15,16,17];

  if(string.length > suitableNodes.length){
    throw 'String is too long. Not enough suitable paths to transform.';
  }

  //Choose the nodes to transform;
  var chosenNodes = [];
  var theChosenOne;
  while(chosenNodes.length < string.length){
    theChosenOne = Math.floor(Math.random()*suitableNodes.length);
    chosenNodes.push(svg.childNodes[suitableNodes.splice(theChosenOne,1)[0]]);
  }

  //Order them from left to right based on the midpoint.
  var midPoints = [];
  for( var i =0; i< chosenNodes.length; i++){
    midPoints[i] = ((new Path(chosenNodes[i].getAttribute('d'))).getMidPoint()[0]);
  }

  var sortedMidPoints = midPoints.slice().sort();
  var sortedChosenNodes = [];
  for(var i =0; i < chosenNodes.length; i++){
    theChosenOne = midPoints.indexOf(sortedMidPoints[i]);
    sortedChosenNodes[i] = chosenNodes[theChosenOne];
    midPoints[theChosenOne] = null;
  }

  var viewBox = svg.getAttribute('viewBox').split(/[ ,]+/);
  var paths = [];
  var padding = 20;
  var xValues = [];

  var boundingBox;
  for(var i=0; i< string.length; i++){
    if(helvetica[string.charAt(i)]){
      paths.push(new Path(helvetica[string.charAt(i)]));
      if(i == 0){
        xValues.push(0);
      }else{
        xValues.push(xValues[i-1] + paths[i-1].getBBox()[1] + padding);
      }
    }else{
      throw 'Invalid String';
    }
  }
  var width = +xValues[xValues.length -1] + +paths[paths.length -1].getBBox()[1];
  if(width > viewBox[2]){
    throw 'String is too long. I might implement multiple lines later.';
  }
  var leftMargin = (viewBox[2] - width)/2 + +viewBox[0];
  for(var i =0; i < string.length; i++){
    (new PathElement(sortedChosenNodes[i])).animateTo(paths[i].translatePath(xValues[i] + +leftMargin, 100));
    //(new PathElement(sortedChosenNodes[i])).animateTo(paths[i]);
  }
  for(var i =2; i < svg.childNodes.length; i++){
    if(sortedChosenNodes.indexOf(svg.childNodes[i]) == -1){
      svg.childNodes[i].style.transition = "opacity 1s";
      svg.childNodes[i].style.opacity = "0";
    }

  }
}

window.onload = onLoad;

function onLoad(){
  var string = getParameterByName('string');
  if(string.length > 0){
    animate(string);
  }
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
