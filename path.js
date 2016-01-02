var types = ['m','l','c','z','h','v','s','q','t','a'];
var lengths = [2,2,6,0,1,1,4,4,2,7];
var allBreaks = ['m','l','c','z','h','v','s','q','t','a',',',' ','-','.'];

function Path(path){
  this.path = path;
}

Path.relativeSegmentToCurve = function(segment){
  var type = segment[0];
  if(type == 'm'){
    throw "Can't convert from m to c";
  }else if(type == 'l'){
    // We get a straight line when the control points lie on the line between the start and end points. Spacing them at 1/3 and 2/3 along the line preserves the spacing of t.
    return ["c", (+segment[1] / 3),( +segment[2] / 3),(+segment[1] * 2 / 3),(+segment[2] * 2 /3),segment[1],segment[2]];
  }else if(type == 'c'){
    return segment;
  }else if(type == 'z'){
    throw "Can't convert from z to c";
  }else if(type == 'h'){
    return ["c", (+segment[1] / 3),0,(+segment[1] * 2 / 3),0,segment[1],0];
  }else if(type == 'v'){
    return ["c", 0, (+segment[1] / 3),0,(+segment[1] * 2 / 3),0,segment[1]];
  }else if(type == 's' || type == 't'){
    throw "Not going to handle shorthand."
  }else if(type == 'q'){
    // I think this also preserves the spacing of t
    return ["c", (+segment[1] * 2 /3), (+segment[2] * 2 /3), (+segment[1] * 2 /3) + (+segment[3]* 1/3), (+segment[2] * 2 /3)  + (+segment[4]* 1/3), segment[1], segment[2]];
  }else if(type == 'a'){
    throw "Allow"
  }
}

Path.getBBoxOfRelativeSegment = function(segment){
  var type = segment[0];
  var minX = 0;
  var maxX = 0;
  var minY = 0;
  var maxY = 0;
  if(type == 'm' || type == 'l'){
    minX = Math.min(0,segment[1]);
    maxX = Math.max(0,segment[1]);
    minY = Math.min(0,segment[2]);
    maxY = Math.max(0,segment[2]);
  }else if(type == 'c'){
    //The derivative is a quadratic curve.
    // Bound on x
    var a =  9*segment[1] - 9*segment[3] + 3*segment[5];
    var b = -12 * segment[1] + 6 * segment[3];
    var c = 3 * segment[1];

    var extremum1 =0;
    var extremum2 =0;
    if(b*b - 4*a*c >= 0 && a != 0){
      extremum1 = (-b + Math.sqrt(b*b - 4*a*c))/( 2 * a);
      extremum2 = (-b - Math.sqrt(b*b - 4*a*c))/( 2 * a);
    }else if( a == 0 && b != 0){
      extremum1 = - c / b;
    }
    if(extremum1 < 0 || extremum1 > 1){
      extremum1 = 0;
    }
    if(extremum2 < 0 || extremum2 > 1){
      extremum2 = 0;
    }
    var pointsAtExtremum1 = Path.getPointOnRelativeCurveAt(segment,extremum1);
    var pointsAtExtremum2 = Path.getPointOnRelativeCurveAt(segment,extremum2);
    minX = Math.min(0,pointsAtExtremum1[0],pointsAtExtremum2[0],segment[5]);
    maxX = Math.max(0,pointsAtExtremum1[0],pointsAtExtremum2[0],segment[5]);
    // Bound on y
    a =  9*segment[2] - 9*segment[4] + 3*segment[6];
    b = -12 * segment[2] + 6 * segment[4];
    c = 3 * segment[2];
    extremum1 =0;
    extremum2 =0;
    if(b*b - 4*a*c >= 0 && a != 0){
      extremum1 = (-b + Math.sqrt(b*b - 4*a*c))/( 2 * a);
      extremum2 = (-b - Math.sqrt(b*b - 4*a*c))/( 2 * a);
    }else if( a == 0 && b != 0){
    extremum1 = - c / b;
    }
    if(extremum1 < 0 || extremum1 > 1){
      extremum1 = 0;
    }
    if(extremum2 < 0 || extremum2 > 1){
      extremum2 = 0;
    }
    pointsAtExtremum1 = Path.getPointOnRelativeCurveAt(segment,extremum1);
    pointsAtExtremum2 = Path.getPointOnRelativeCurveAt(segment,extremum2);
    minY = Math.min(0,pointsAtExtremum1[1],pointsAtExtremum2[1],segment[6]);
    maxY = Math.max(0,pointsAtExtremum1[1],pointsAtExtremum2[1],segment[6]);
  }else if(type == 'z' ){
    throw "Can't bound z";
  }else if(type == 'h'){
    minX = Math.min(0,segment[1]);
    maxX = Math.max(0,segment[1]);
  }else if(type == 'v'){
    minY = Math.min(0,segment[1]);
    maxY = Math.max(0,segment[1]);
  }else if(type == 's' || type == 't'){
    throw "Can't bound shorthand";
  }else if(type == 'q'){
    //Bound on x
    var t = segment[1] / ( 2 * segment[1] + +segment[3]);
    if(t < 0 || t > 1){
      t =0;
    }
    var valueAtT = 2*(1 - t)*t*segment[1] + +segment[3];
    minX = Math.min(0,valueAtT,segment[3]);
    maxX = Math.max(0,valueAtT,segment[3]);
    //Bound on y
    t = segment[2] / ( 2 * segment[2] + +segment[4]);
    if(t < 0 || t > 1){
      t =0;
    }
    valueAtT = 2*(1 - t)*t*segment[2] + +segment[4];
    minY = Math.min(0,valueAtT,segment[4]);
    maxY = Math.max(0,valueAtT,segment[4]);
  }else if(type == 'a'){
    throw "Allow";
  }
  return [minX, maxX, minY, maxY];
}

Path.addRelativeSegmentToAbsolutePosition = function(pathSectionStartX, pathSectionStartY, x, y, segment){
  type = segment[0];
  if(type == 'm'){
    x = +x +  +segment[1];
    y = +y +  +segment[2];
    pathSectionStartX = x;
    pathSectionStartY = y;
  }else if(type == 'l' || type == 't'){
    x = +x +  +segment[1];
    y = +y +  +segment[2];
  }else if(type == 'c'){
    x = +x +  +segment[5];
    y = +y +  +segment[6];
  }else if(type == 'z'){
    x = pathSectionStartX;
    y = pathSectionStartY;
  }else if(type == 'h'){
    x = +x +  +segment[1];
  }else if(type == 'v'){
    y = +y +  +segment[1]
  }else if(type == 's' || type == 'q'){
    x = +x +  +segment[3];
    y = +y +  +segment[4];
  }else if(type == 'a'){
    x = +x +  +segment[6];
    y = +y +  +segment[7];
  }
  return [pathSectionStartX, pathSectionStartY, x, y];
}

Path.getPointOnRelativeCurveAt = function(segment, t){
  var x = 3*(1 - +t)*(1 - +t)*t*segment[1] + 3*(1 - +t)*t*t*segment[3] + t*t*t*segment[5];
  var y = 3*(1 - +t)*(1 - +t)*t*segment[2] + 3*(1 - +t)*t*t*segment[4] + t*t*t*segment[6];
  return [x,y];
}

Path.findEndOfNumber = function(string,startOfNumber){
  var currentlyDecimal = false;
  if(string.charAt(startOfNumber)=='.'){
    currentlyDecimal = true;
  }else if(["0","1","2","3","4","5","6","7","8","9","-",'e'].indexOf(string.charAt(startOfNumber)) == -1){
    throw("Not a Number");
    return -1;
  }
  for( var j = startOfNumber+1; j<string.length; j++){
    char = string.charAt(j).toLowerCase();
    if(char == 'e'){
      currentlyDecimal = false;
      j++; //Skip the first number
    }if(char == '.' && currentlyDecimal == false){
      currentlyDecimal = true;
    }else if(allBreaks.indexOf(char)!=-1){
      return j-1;
    }
  }
  return string.length;
}

Path.convertArrayToString = function(arrayOfSegments){
  var string  = "";

  for( var i =0; i < arrayOfSegments.length; i++){
    for( var j=0; j < arrayOfSegments[i].length; j++){
      string += arrayOfSegments[i][j] + " ";
    }
  }
  return string;
}

Path.splitRelativeSegment = function(segment, t){
  if(t<0|| t>1){
    throw 'Invalid t';
  }

  var type = segment[0];
  var segment1 = [];
  var segment2 = [];

  if(type == 'm' || type == 'z'){
    throw "Unable to split";
  }else if(type == 's' || type == 't'){
    throw "Unable to split shorthand"
  }else if(type == 'a'){
    throw "Allow";
  }else if(type == 'l'){
    segment1 = ['l',t*segment[1],t*(segment[2])];
    segment2 = ['l',(1-t)*segment[1],(1-t)*segment[2]];
    return [segment1, segment2];
  }else if(type == 'v' || type == 'h'){
    segment1 = [type,t*segment[1]];
    segment2 = [type,(1-t)*segment[1]];
    return [segment1, segment2];
  }else if(type == 'c'){
    //Calculate the x co-ordinates first.
    var EX = t*segment[1];
    var FX = (1-t)*segment[1] + t*segment[3];
    var GX = (1-t)*segment[3] + t*segment[5];
    var HX = (1-t)*EX + t*FX;
    var JX = (1-t)*FX + t*GX;
    var KX = (1-t)*HX + t*JX;
    //Calculate the y co-ordinates.
    var EY = t*segment[2];
    var FY = (1-t)*segment[2] + t*segment[4];
    var GY = (1-t)*segment[4] + t*segment[6];
    var HY = (1-t)*EY + t*FY;
    var JY = (1-t)*FY + t*GY;
    var KY = (1-t)*HY + t*JY;

    segment1 = ['c',EX,EY,HX,HY,KX,KY];
    segment2 = ['c',JX-KX,JY-KY,GX-KX,GY-KY,segment[5]-KX,segment[6]-KY];

    return [segment1, segment2];
  }else if(type == 'q'){
    // Calculate the x coordinates first
    DX = t * segment[1];
    EX = (1-t)* segment[1] + t*segment[3];
    FX = (1-t)*DX + t*EX;
    //Calculate the y coordinates
    DY = t * segment[2];
    EY = (1-t)* segment[2] + t*segment[4];
    FY = (1-t)*DY + t*EY;

    segment1 = ['q',DX,DY,FX,FY];
    segment2 = ['q',EX-FX,EY-FY,CX-FX,CY-FY];

    return [segment1, segment2];
  }
}

Path.prototype.getBBox = function(){
  var segments = this.getRelativeArrayOfSegmentsWithoutShortHand();

// Start the box after the first move.
  var minX = segments[0][1];
  var maxX = segments[0][1];
  var minY = segments[0][2];
  var maxY = segments[0][2];

  var currentX = minX;
  var currentY = minY;
  var startX = minX;
  var startY = minY;

  var segmentBBox;
  var positionUpdate;
  for(var i =1; i < segments.length; i++){
    if(segments[i][0] !== 'z' ){
      segmentBBox = Path.getBBoxOfRelativeSegment(segments[i]);
      minX = Math.min(minX, segmentBBox[0]+ +currentX);
      maxX = Math.max(maxX, segmentBBox[1]+ +currentX);
      minY = Math.min(minY, segmentBBox[2]+ +currentY);
      maxY = Math.max(maxY, segmentBBox[3]+ +currentY);
    }
    positionUpdate = Path.addRelativeSegmentToAbsolutePosition(startX,startY,currentX,currentY,segments[i]);
    startX = positionUpdate[0];
    startY = positionUpdate[1];
    currentX = positionUpdate[2];
    currentY = positionUpdate[3];
  }
  return [minX, maxX, minY, maxY];
}

Path.prototype.getMidPoint = function(){
  var BBox = this.getBBox();
  return [(BBox[0] + +BBox[1])/2 , (BBox[2] + +BBox[3])/2];
}
Path.prototype.getArrayOfSegments = function(){
  // NOTE: This doesn't check that the path is valid.

  var arrayOfSegments = [];

  var currentSegment = [];
  var type = "";
  var length = "";
  var char = "";
  var endOfNumber;
  for (var i =0; i < this.path.length; i++){
    //Check if type has changed.
    char = this.path.charAt(i).toLowerCase();
    if(types.indexOf(char) != -1){
      type = this.path.charAt(i);
      length = lengths[types.indexOf(char)];
      currentSegment = [type];
      if(char == 'z'){
        arrayOfSegments.push(currentSegment);
      }
    }else if( char != ' ' && char != ','){
      //We are a number
      endOfNumber = Path.findEndOfNumber(this.path,i);
      currentSegment.push(this.path.substring(i,endOfNumber+1));
      i = endOfNumber;
      if(currentSegment.length == length +1){
        arrayOfSegments.push(currentSegment);
        currentSegment = [type];
      }
    }

  }
  return arrayOfSegments;
}

Path.prototype.getRelativeArrayOfSegments = function (){

  arrayOfSegments = this.getArrayOfSegments();

  var pathSectionStartX =0;
  var pathSectionStartY =0;
  var currentX = 0;
  var currentY = 0;

  var segment;
  var type;
  var newCoordinates;
  for( var i =0; i <arrayOfSegments.length; i++){
    segment = arrayOfSegments[i];
    if(types.indexOf(segment[0]) == -1){
      // The segment is absolute;
      type = segment[0].toLowerCase();
      segment[0] = type;
      if(type == 'm'||type == 'l' || type == 't'){
        segment[1] = segment[1] - +currentX;
        segment[2] = segment[2] - +currentY;
      }else if(type == 'c'){
        segment[1] = segment[1] - +currentX;
        segment[2] = segment[2] - +currentY;
        segment[3] = segment[3] - +currentX;
        segment[4] = segment[4] - +currentY;
        segment[5] = segment[5] - +currentX;
        segment[6] = segment[6] - +currentY;
      }else if(type == 'h'){
        segment[1] = segment[1] - +currentX;
      }else if(type == 'v'){
        segment[1] = segment[1] - +currentY;
      }else if(type == 's' || type == 'q'){
        segment[1] = segment[1] - +currentX;
        segment[2] = segment[2] - +currentY;
        segment[3] = segment[3] - +currentX;
        segment[4] = segment[4] - +currentY;
      }else if(type == 'a'){
        segment[6] = segment[6] - +currentX;
        segment[7] = segment[7] - +currentY;
      }
    }
    newCoordinates = Path.addRelativeSegmentToAbsolutePosition(pathSectionStartX,pathSectionStartY,currentX,currentY,segment);
    pathSectionStartX = newCoordinates[0];
    pathSectionStartY = newCoordinates[1];
    currentX = newCoordinates[2];
    currentY = newCoordinates[3];
  }
  return arrayOfSegments;
}

Path.prototype.getRelativeArrayOfSegmentsWithoutShortHand = function() {
  var relativeArrayOfSegments  = this.getRelativeArrayOfSegments();

  var type;
  var segment;
  var previousSegment;
  // A path has to start with a move so we can ignore the first segment.
  // We are removing the shorthand as we go so we don't need to worry about 'ss' or 'tt'
  for( var i = 1; i< relativeArrayOfSegments.length; i++){
    type = relativeArrayOfSegments[i][0];
    if(type == 's'){
      segment = relativeArrayOfSegments[i].slice(); //Deep copy.
      previousSegment = relativeArrayOfSegments[i-1];
      if(previousSegment[0] === 'c'){
        relativeArrayOfSegments[i] = ["c", previousSegment[5] - +previousSegment[3], previousSegment[6] - +previousSegment[4], segment[1], segment[2], segment[3], segment[4]];
      }else{
        relativeArrayOfSegments[i] = ["c", 0, 0, segment[1], segment[2], segment[3], segment[4]];
      }
    }else if(type == 't'){
      segment = relativeArrayOfSegments[i].slice(); //Deep copy.
      previousSegment = relativeArrayOfSegments[i-1];
      if(previousSegment[0] === 'q'){
        relativeArrayOfSegments[i] = ["c", previousSegment[3] - +previousSegment[1], previousSegment[4] - +previousSegment[2], segment[1], segment[2]];
      }else{
        relativeArrayOfSegments[i] = ["c", 0, 0, segment[1], segment[2]];
      }
    }
  }
  return relativeArrayOfSegments;
}

Path.prototype.getCanonicalForm = function (){
  var array = this.getRelativeArrayOfSegmentsWithoutShortHand();

  for( var i=0; i<array.length; i++){
    if(array[i][0] != 'm' && array[i][0] != 'z' ){
      array[i] = Path.relativeSegmentToCurve(array[i]);
    }
  }
  return array;
}

Path.prototype.getSubpaths = function(inCanonicalForm){
  var subpaths = [];
  var arrayOfSegments;
  if(inCanonicalForm === true){
    arrayOfSegments = this.getCanonicalForm();
  }else{
    arrayOfSegments = this.getArrayOfSegments();
  }
  var lastIndex = -1;
  for(var i=0; i < arrayOfSegments.length; i++ ){
    if(arrayOfSegments[i][0] === 'z'){
      subpaths.push(arrayOfSegments.slice(lastIndex+1,i+1));
      lastIndex = i;
    }else if(arrayOfSegments[i][0] === 'm' && i !== lastIndex + 1){
      subpaths.push(arrayOfSegments.slice(lastIndex+1,i+1));
      lastIndex = i;
    }
  }
  return subpaths;
}

Path.prototype.translatePath = function(x,y){
  var segments = this.getRelativeArrayOfSegments();
  segments[0][1] = +segments[0][1] + +x;
  segments[0][2] = +segments[0][2] + +y;
  this.path = Path.convertArrayToString(segments);
  return this;
}

Path.combineSubpaths = function(subpaths){
  var combined = [];
  for( var i=0; i < subpaths.length; i++){
    combined = combined.concat(subpaths[i]);
  }
  return combined;
}

Path.increaseCurvesOfSubPath = function(pathSegmentsInCanonicalForm, numberOfCurvesToHave){
  // Use a shorter name in the actual code. The longer name is just descriptive.
  var segments = pathSegmentsInCanonicalForm;

  //We will strip the segments we can't split (apart from a)
  var moveSegment = [];
  var closeSegment = [];

  if(segments[0][0] === 'm'){
    moveSegment = segments.splice(0,1);
  }
  if(segments[segments.length-1][0] === 'z'){
    closeSegment = segments.splice(segments.length-1,1);
  }

  //
  if(segments.length === 0){
    //We will add empty curves.
    for(var i=0; i < numberOfCurvesToHave; i++){
      segments.push(['c',0,0,0,0,0,0]);
    }
  }else{
    // TODO: I should probably split based on lengths or something but for now I will just split random segments in half.
    var splitPoint;
    var splitSegments;
    while(segments.length < numberOfCurvesToHave){
      splitPoint = Math.floor(Math.random()*segments.length);
      splitSegments = Path.splitRelativeSegment(segments[splitPoint],0.5);
      segments.splice(splitPoint,1,splitSegments[0],splitSegments[1]);
    }
  }
  return moveSegment.concat(segments.concat(closeSegment));
}

Path.countNumberOfCurvesInSubPath = function(arrayOfSegmentsInCanonicalForm){
  var segments = arrayOfSegmentsInCanonicalForm;
  var length = segments.length;
  if(segments[0][0] === 'm'){
    length--;
  }
  if(segments[segments.length-1][0] === 'z'){
    length--;
  }
  return length;
}


function PathElement(element){
  this.element = element;
  this.path = new Path(element.getAttribute('d'));
  this.initalPath = this.path;
}

PathElement.prototype.animateTo = function(animateToPath,x1,y1,x2,y2,duration,delay){
  //Store the curve values
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    this.animationDuration = duration;
  //Setup
  var initialSubPaths = this.path.getSubpaths(true);
  var targetSubPaths = animateToPath.getSubpaths(true);
  // Make sure we have enough initialSubPaths to morph
  while(targetSubPaths.length > initialSubPaths.length){
    initialSubPaths.push([["m",0,0],["z"]]);
  }
  while(targetSubPaths.length < initialSubPaths.length){
    targetSubPaths.push([["m",0,0],["z"]]);
  }
  // Make all the subpaths the same length.
  var targetLength;
  var initalLength;
  for(var i =0; i < targetSubPaths.length; i++){
    targetLength = Path.countNumberOfCurvesInSubPath(targetSubPaths[i]);
    initalLength = Path.countNumberOfCurvesInSubPath(initialSubPaths[i]);
    if(targetLength > initalLength){
      initialSubPaths[i] = Path.increaseCurvesOfSubPath(initialSubPaths[i],targetLength);
    }else if(targetLength < initalLength){
      targetSubPaths[i] = Path.increaseCurvesOfSubPath(targetSubPaths[i],initalLength);
    }
  }
  // TODO: Getting lazy...
  var initialPathArray = Path.combineSubpaths(initialSubPaths);
  var targetPathArray = Path.combineSubpaths(targetSubPaths);
  this.animationTime = 0;
  var that = this;
  setTimeout(PathElement.animationStep,delay,initialPathArray, targetPathArray,that);
}

PathElement.animationStep = function(initialPathArray,targetPathArray,that){
  var tol = 1e-6;

  var currentPathArray = [];
  for(var i=0; i <initialPathArray.length; i++){
    currentPathArray.push(initialPathArray[i].slice());
    for(var j =1; j < currentPathArray[i].length; j++){
      currentPathArray[i][j] = (+targetPathArray[i][j] - +initialPathArray[i][j]) * PathElement.getProgressAt(that.x1,that.y1,that.x2,that.y2,that.animationTime) + +initialPathArray[i][j];
      if(Math.abs(currentPathArray[i][j]) < tol){
          currentPathArray[i][j] = 0;
      }
    }
  }
  that.path = Path.convertArrayToString(currentPathArray)
  that.element.setAttribute('d', that.path );
  if(that.animationTime < 1){
    that.animationTime = that.animationTime + 20 /that.animationDuration;
    setTimeout(PathElement.animationStep,20, initialPathArray, targetPathArray,that);
  }
}

PathElement.getProgressAt = function(x1,y1,x2,y2,time){
  var tolerance = 1e-5;

  if(time ==0 || time == 1){
    return time;
  }

  var t0 = 0;
  var t1 = 1;
  var t2 = 0;

  var x = 0;

  while(Math.abs(x-time)>tolerance){
    t2 = (t0 + t1)/2;
    x = 3*(1 - +t2)*(1 - +t2)*t2*x1 + 3*(1 - +t2)*t2*t2*x2 + t2*t2*t2;
    if(x > time){
      t1 = t2;
    }else{
      t0 = t2;
    }
  }
  return 3*(1 - +t2)*(1 - +t2)*t2*y1 + 3*(1 - +t2)*t2*t2*y2 + t2*t2*t2;
}
