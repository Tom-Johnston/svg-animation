function animate(string, nodes,y,hideNodes){
  var svg = document.getElementById('svg');
  if (typeof y === 'undefined'){
    y = 100;
  }
  if(!nodes){
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
    nodes = [];
    for(var i =0; i < chosenNodes.length; i++){
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
    (new PathElement(nodes[i])).animateTo(paths[i].translatePath(xValues[i] + +leftMargin, y));
    //(new PathElement(nodes[i])).animateTo(paths[i]);
  }
  if(typeof hideNodes === 'undefined' || hideNodes === true){
    for(var i =2; i < svg.childNodes.length; i++){
      if(nodes.indexOf(svg.childNodes[i]) == -1){
        svg.childNodes[i].style.transition = "opacity 1s";
        svg.childNodes[i].style.opacity = "0";
      }
    }
  }
}

window.onload = onLoad;

function onLoad(){
  if(getParameterByName('HappyNewYear') == 'true'){
    console.log('Happy New Year!');
    var happyNodes = [svg.childNodes[9],svg.childNodes[12],svg.childNodes[10],svg.childNodes[11],svg.childNodes[8]];
    animate('Happy',happyNodes,20,false);
    var newNodes = [svg.childNodes[6],svg.childNodes[5],svg.childNodes[4]];
    animate('New',newNodes,150,false);
    var yearNodes = [svg.childNodes[14],svg.childNodes[15],svg.childNodes[16],svg.childNodes[17]];
    animate('Year',yearNodes,280,false);
    var nodes = happyNodes.concat(newNodes.concat(yearNodes));
    for(var i =2; i < svg.childNodes.length; i++){
      if(nodes.indexOf(svg.childNodes[i]) == -1){
        svg.childNodes[i].style.transition = "opacity 1s";
        svg.childNodes[i].style.opacity = "0";
      }
    }
  }else{
    var string = getParameterByName('string');
    if(string.length > 0){
      animate(string);
    }
  }
}


function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
