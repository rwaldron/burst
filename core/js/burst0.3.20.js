/*
    Burst Engine 0.3.20 - http://hyper-metrix.com/#burst        
    Copyright (c) 2009 Alistair MacDonald        
    
    MIT License
    
    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:
    
    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
*/

// (function(){this.burst = function burst() {})(); //make global later

//////// C O R E - F U N C T I O N S ///////////////////////////////////////////
function hexRGBA(hex){  
  var RGBA = toNumbers(hex);
  function toNumbers(str){
    var ret=[];
    str.replace(/(..)/g,function(str){
      ret.push(parseInt(str,16));
    });      
    return ret;
  }
  return RGBA;
}

function radians(aAngle){
  return (aAngle/180)*Math.PI;
};

// From http://eJohn.org
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

////////////////////////////////////////////////////////////////////////////////

//////// M A S T E R - C O N T R O L E R ///////////////////////////////////////
function burst(name,width,height){
  this.name=name;
  this.urlIndex=[];
  this.ajaxMem=[];
  this.timelines=[];
  this.buffer=[];
  this.debug=false;
  this.tl="";
  this.mspf = 20; // 60fps approx.
  this.frame = 0;
  this.width=width;
  this.height=height;
  this.paused=false;
  }
  
  burst.prototype.name;
  burst.prototype.urlIndex;
  burst.prototype.ajaxMem;
  burst.prototype.timelines;
  burst.prototype.buffer;
  burst.prototype.debug;
  burst.prototype.tl;
  burst.prototype.mspf;
  burst.prototype.frame;
  burst.prototype.width;
  burst.prototype.height;  
  
    
  burst.prototype.is=function(){
    return "YES!";
  }
  
  burst.prototype.start=function(tl,cb){
    buffer=[];
    for(var i=0;i<tl.length;i++){
      if(typeof tl[i]=="string"){
        for (var j=0;j<this.timelines.length;j++){         
          this.timelines[j].name==tl[i]?this.load(this.timelines[j],cb):0;
        }
      } else {
        load(tl[i],cb);
      }
    }
    this.play();
  }
  
  burst.prototype.chain=function(tlchain,cb){
    var thisBurstInstance=this;
    var nextcb;
    buffer=[];        
    // Detect & remove extra ';' at the end of chain
    if(tlchain[tlchain.length-1]==";"){ 
      tlchain=tlchain.substr(0,tlchain.length-1)
    };
    var splitPos=tlchain.indexOf(";");
    if(splitPos>-1){
      tl=tlchain.slice(0,splitPos);
      tlchain=tlchain.slice(tlchain.indexOf(";")+1);
      nextcb=function(){thisBurstInstance.chain(tlchain,cb)};
    }else{
      tl=tlchain;
      nextcb=cb;
    }        
    for(var j=0;j<this.timelines.length;j++ ){         
      if(this.timelines[j].name==tl){      
        this.load(this.timelines[j],nextcb);
        break;
      }
    }        
  }    

  burst.prototype.pause=function(){
      return this.paused?this.paused=false:this.paused=true;
    }

  burst.prototype.pauseAt=function(tl,onFrame){
    for (var i=0; i<tl.length; i++){
      if(typeof tl[i] == "string") {
        for (var j=0; j < this.timelines.length; j++ ) {
          this.timelines[j].name==tl[i]?this.timelines[j].pause(onFrame) :0; 
        }
      }else{
        tl[i].pause(onFrame);
      }
    }
  }
    
  burst.prototype.load=function(tl,cb){
    tl.playSpeed>=0?tl.frame=0:tl.frame=tl.lastFrame;
    tl.callbackfired=false;              
    this.buffer[this.buffer.length]=[tl,cb];                              
  }      

  // AJAX function based on http://www.hunlock.com/blogs/Snippets:_Synchronous_AJAX
  burst.prototype.get=function(url){
    if(window.XMLHttpRequest){AJAX=new XMLHttpRequest();}
    else{AJAX=new ActiveXObject("Microsoft.XMLHTTP");}
    if(AJAX){
       AJAX.open("GET",url,false);
       AJAX.send(null);
       return AJAX.responseText;
    }else{return false;}
  }
  
  burst.prototype.split=function(stringToSplit,divider1,divider2,divider3,divider4){
    var i,j,k;
    if(!divider2){return stringToSplit.split(divider1);}
    else if(!divider3){
        var multiArray=stringToSplit.split(divider1);          
        for(i=0;i<multiArray.length;i++){
          var level2=multiArray[i].split(divider2);                            
          multiArray[i]=new Array(level2.length);                        
          for(j=0;j<level2.length;j++){multiArray[i][j]=level2[j];}               
        }
        return multiArray;
    }else{
      var multiArray=stringToSplit.split(divider1);          
      for(i=0;i<multiArray.length;i++){            
        var level2=multiArray[i].split(divider2);                            
        multiArray[i]=new Array(level2.length);                        
        for(j=0;j<level2.length;j++){                      
          multiArray[i][j]=level2[j];
          var level3=multiArray[i][j].split(divider3);                            
          multiArray[i][j]=new Array(level3.length);                        
          for(k=0;k<level3.length;k++){multiArray[i][j][k]=level3[k];}                        
        }
      }
      return multiArray;
    }
  }
  
  burst.prototype.loadOFF=function(url){
    var points = this.get(url).split("\n");
    points.remove(0,1);
    points.remove(points.length-1);
    var i,j;
    for (var i=0;i<points.length;i++){
      var vertex=points[i].split(" ");
      points[i]=new Array(vertex.length);
      for (var j=0;j<vertex.length;j++){                   
        points[i][j]=vertex[j];
      }
    }    
    //console.log(points);
    return points;
  }
  
  
  
  burst.prototype.loadRAW=function(url){}
  
  // Load and pass an SVG file...
  burst.prototype.loadSVG=function(url){
    thisBurstInstance=this;
    function parseXML(){      
      try{xmlDoc=new ActiveXObject("Microsoft.XMLDOM");}
      catch(e){try{xmlDoc=document.implementation.createDocument("","",null);}
      catch(e){alert(e.message);return;}}
      xmlDoc.async=false;      
      xmlDoc.load(url);
      var svg = xmlDoc.getElementsByTagName("svg")[0];
      var docWidth=parseFloat(svg.getAttribute("width"));
      var docHeight=parseFloat(svg.getAttribute("height"));
                        
      thisBurstInstance.XMLflow(svg);
    }                
    parseXML();
  }
  
  burst.prototype.XMLflow=function(node, cb){
    var Processing = true;
    var x, y, x1, y1, x2, y2;
    ctx.scale(.7,.7);
    
    for(var i=0;i<node.childNodes.length;i++){
      curNode = node.childNodes[i];
      curTagName = node.childNodes[i].tagName;
      switch(curTagName){
      case "g": // Group <g></g>
          
          ctx.save();
          console.log("------transform--------");
          var p = curNode.getAttribute("transform");
          console.log(p);
          var rg=new RegExp("[0-9]+.[0-9]+", "g");
          var t=0;var c=[];
          while(coord=rg.exec(p)){c[t]=coord;t++;}
          //ctx.transform(c[0],c[1],c[2],c[3],c[4],c[5]);          
          
        this.XMLflow(curNode, function(){ctx.restore();} );
        break;
      case "path": // <path />
          var id = curNode.getAttribute("id");
          console.log(id);
          var p = curNode.getAttribute("transform");          
          console.log(p);          
          var rg=new RegExp("[0-9]+.[0-9]+", "g");
          x=parseFloat(rg.exec(p));y=parseFloat(rg.exec(p));
          !x?x=0:0;!y?y=0:0;
          
          
          ctx.save();
          ctx.translate(x,y);
          
          var pData = curNode.getAttribute("d");
          var regex=new RegExp("[mzlhvcqtaMZLHVCQTA][^mzlhvcqtaMZLHVCQTA]+", "g");
          while(command=regex.exec(pData)){
            switch(command[0][0]){
              case "M": // moveTo() --absolute                
                var rgx=new RegExp("[0-9][^,]+", "g");
                x = parseFloat(rgx.exec(command[0]));
                y = parseFloat(rgx.exec(command[0]));
                ctx.moveTo(x,y);
                break;
              case "C": // curveTo() --absolute
                var rgx=new RegExp("[0-9][^,|^ ]+", "g");                
                var t=0;var c=[];
                while(coord=rgx.exec(command[0])){c[t] = parseFloat(coord);t++;}
                ctx.bezierCurveTo(c[0],c[1],c[2],c[3],c[4],c[5]);
                //console.log(c[0],c[1],c[2],c[3],c[4],c[5]);
                break;
            }
          }
          //ctx.closePath();
          //ctx.fill();    
          ctx.lineWidth=3;
          ctx.stroke();
          ctx.restore();
        break;                
      }
    }
    cb?cb():0;
  }
  
     
  burst.prototype.drawNextFrame=function(){
    if(!this.paused){
      ctx.clearRect(0,0,this.width,this.height);
      this.frame++;
      for(var i=0;i<this.buffer.length;i++){
        this.buffer[i][0].play(this.buffer[i][1]);
      }
    }
  }
  
  burst.prototype.play=function(){
    var thisBurstInstance=this;
    window.setInterval(function(){thisBurstInstance.drawNextFrame();},this.mspf);
  }
  
  burst.prototype.timeline=function(name,frameOffset,lastFrame,playSpeed,loop){        
    for(var i=0; i<this.timelines.length; i++){
      if(this.timelines[i].name==name){
        return this.timelines[i];
      }
    }
    this.timelines[this.timelines.length] = new timelineobject(name, frameOffset, lastFrame, playSpeed, loop, this);
    return this.timelines[this.timelines.length-1]; 
  }
////////////////////////////////////////////////////////////////////////////////

//////// T I M E L I N E ///////////////////////////////////////////////////////                                                            
function timelineobject(name,frameOffset,lastFrame,playSpeed,loop,isParent){
  this.name=name;
  this.width=0;
  this.width=0;
  this.type="timeline";
  this.frameOffset=frameOffset;
  this.lastFrame=lastFrame;
  this.playSpeed=playSpeed;
  this.loop=loop
  this.paused=false;
  this.shapes=[];
  this.timelines=[];
  this.frame=0;
  this.callbackfired=false;    
  this.randomCount=0;
  this.playMode="";
  this.tracks=[];
  this.effects=[];    
  this.scl=1.0;
  this.sclX=1.0;
  this.sclY=1.0; 
  this.left=0;
  this.top=0;
  this.rot=0.0;
  this.width=width;
  this.height=height;
  this.strokeW=0;
  this.strokeHex="00000000";
  this.strokeRGBA=hexRGBA(this.strokeHex);
  this.strokeR=this.strokeRGBA[0];
  this.strokeG=this.strokeRGBA[1];
  this.strokeB=this.strokeRGBA[2];
  this.strokeA=this.strokeRGBA[3];
  this.fillHex="aaaaaaff";
  this.fillRGBA=hexRGBA(this.fillHex);
  this.fillR=this.fillRGBA[0];
  this.fillG=this.fillRGBA[1];
  this.fillB=this.fillRGBA[2];
  this.fillA=this.fillRGBA[3];        
  this.opac=1.0;
  this.centerX=width/2;
  this.centerY=height/2;
  this.isParent=isParent;
  }
  
  timelineobject.prototype.name;
  timelineobject.prototype.type;
  timelineobject.prototype.frameOffset;
  timelineobject.prototype.lastFrame;
  timelineobject.prototype.playSpeed;
  timelineobject.prototype.paused;
  timelineobject.prototype.loop;
  timelineobject.prototype.shapes;
  timelineobject.prototype.timelines;
  timelineobject.prototype.frame;
  timelineobject.prototype.callbackfired;    
  timelineobject.prototype.randomCount;
  timelineobject.prototype.playMode;
  timelineobject.prototype.tracks;
  timelineobject.prototype.effects;    
  timelineobject.prototype.scl; 
  timelineobject.prototype.left;
  timelineobject.prototype.top;
  timelineobject.prototype.rot;
  timelineobject.prototype.width;
  timelineobject.prototype.height;
  timelineobject.prototype.strokeW;
  timelineobject.prototype.strokeHex;
  timelineobject.prototype.strokeRGBA;
  timelineobject.prototype.strokeR;
  timelineobject.prototype.strokeG;
  timelineobject.prototype.strokeB;
  timelineobject.prototype.strokeA;        
  timelineobject.prototype.fillHex;            
  timelineobject.prototype.fillRGBA;
  timelineobject.prototype.fillR;
  timelineobject.prototype.fillG;
  timelineobject.prototype.fillB;
  timelineobject.prototype.fillA;        
  timelineobject.prototype.opac;
  timelineobject.prototype.centerX;
  timelineobject.prototype.centerY;
  timelineobject.prototype.isParent;
    
  timelineobject.prototype.inherit=function(tl){
    for(var i=0;i<Burst.timelines.length;i++){
      if(Burst.timelines[i].name==tl){
        this.timelines[this.timelines.length]=Burst.timelines[i];
          //return Burst.timelines[i];
        return this; 
      }
    }
  }       
  
  // Clone this timeline to..
  timelineobject.prototype.clone=function(newName){   
    //aClone = new timelineobject(String newName);
    //aClone.shapes = this.shapes;
    //timelines[timelines.length] = aClone;
    //return aClone;
  }
    
  // Return Shape
  timelineobject.prototype.shape=function(name,url,mode,left,top,scl,rot,strokeW,strokeHex,fillHex,zIndex,opac,isParent){                
        for(var i=0; i < this.shapes.length; i++){
            if (this.shapes[i].name==name){ 
              return this.shapes[i];
            }
        }
        this.shapes[this.shapes.length] = new shapeobject(name,url,mode,left,top,scl,rot,strokeW,strokeHex,fillHex,zIndex,opac,this);
        return this.shapes[this.shapes.length-1];
    }
    
  // Pause on frame..
  timelineobject.prototype.pause=function(onFrame){
    if(onFrame){
      this.frame=onFrame;
      this.paused=true;
    }else{
      this.paused=true;
    }      
  }
    
  // Plat child-timelines
  timelineobject.prototype.playChildren=function(){
    for(var i=0;i<this.timelines.length;i++){
      this.timelines[i].frame+=this.playSpeed;
      this.timelines[i].play();
    }
  }
    
  // Callback Exceution
  timelineobject.prototype.callback=function(cb){
    if(cb!=undefined&&this.callbackfired==false){
      this.callbackfired=true;
      cb();
    }
  }

  // Return Track
  timelineobject.prototype.track=function(property){
    for(var i=0;i<this.tracks.length;i++){
      if(this.tracks[i].property==property){
        return this.tracks[i];
      }
    }
    this.tracks[this.tracks.length]=new trackprop(property,this);
    return this.tracks[this.tracks.length-1];
  }

  // Plat Timeline
  timelineobject.prototype.play=function(cb){
    this.playSpeed<0?playMode="backward":playMode="forward";        
        
    if(this.paused==false){
      switch(playMode){
      case "forward":
        this.frame<this.lastFrame?this.frame=this.frame+this.playSpeed:this.loop==true?this.frame=0:(cb)?this.callback(cb):0;
        this.playChildren();
        break;
      case "backward":
        this.frame>=1-this.playSpeed?this.frame=this.frame+this.playSpeed:this.loop==true?this.frame=this.lastFrame:(cb)?this.callback(cb):0;                        
        this.playChildren();
        break;
      case "random":
        this.frame=random(this.lastFrame);
        if(randomCount<this.lastFrame){randomCount++;}else{if(loop){(cb)?this.callback(cb):0;}}
        this.playChildren();
        break;
      }
    }
    
    // Timeline style & matrix        
    ctx.save();
    ctx.translate(this.left+this.centerX,this.top+this.centerY);
    ctx.rotate(radians(this.rot));    
    this.sclX!=this.sclY?ctx.scale(this.sclX, this.sclY):ctx.scale(this.scl,this.scl);
    ctx.translate(-this.centerX,-this.centerY);
    ctx.doFill=true;
    ctx.fillStyle="rgba("+this.fillR+","+this.fillG+","+this.fillB+","+this.fillA+")";  
    ctx.strokeStyle="rgba("+this.strokeR+","+this.strokeG+","+this.strokeB+","+this.strokeA+")";
    
    ctx.lineWidth=this.strokeW;
    ctx.globalAlpha=this.opac;    
    ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(this.width,0);
      ctx.lineTo(this.width,this.height);
      ctx.lineTo(0,this.height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
                        
    // Timeline animator                  
    for(var i=0;i<this.tracks.length;i++){
      for(var j=0;j<this.tracks[i].keys.length;j++){
        var curTrack=this.tracks[i];
          var curProp=this.tracks[i].property;
          var curKey=this.tracks[i].keys[j];
          if(j<curTrack.keys.length-1){var nextKey=curTrack.keys[j+1];}else{var nextKey=curTrack.keys[j];}
          if(this.frame>=curKey.frame&&this.frame<nextKey.frame){
            var e=curKey.easing;
            var x=0;
            var t=this.frame-curKey.frame;
            var b=curKey.value;
            var c=nextKey.value-curKey.value;
            var d=nextKey.frame-curKey.frame;
            switch(curProp){
              case "left":this.left=ease(e,x,t,b,c,d);break;
              case "top":this.top=ease(e,x,t,b,c,d);break;
              case "cenX":this.centerX=ease(e,x,t,b,c,d);break;
              case "cenY":this.centerY=ease(e,x,t,b,c,d);break;
              case "scl":this.scl=ease(e,x,t,b,c,d);break;
              case "rot":this.rot=ease(e,x,t,b,c,d);break;
              case "strokeWeight":this.strokeW=ease(e,x,t,b,c,d);break;
              case "stroke":
                var c1=hexRGBA(curKey.value);
                var c2=hexRGBA(nextKey.value);
                this.strokeR=parseInt(ease(e,x,t,c1[0],c2[0]-c1[0],d));
                this.strokeG=parseInt(ease(e,x,t,c1[1],c2[1]-c1[1],d));
                this.strokeB=parseInt(ease(e,x,t,c1[2],c2[2]-c1[2],d));
                this.strokeA=1/255*ease(e,x,t,c1[3],c2[3]-c1[3],d);
                break;
              case "fill":
                var c1=hexRGBA(curKey.value);
                var c2=hexRGBA(nextKey.value);
                this.fillR=parseInt(ease(e,x,t,c1[0],c2[0]-c1[0],d));
                this.fillG=parseInt(ease(e,x,t,c1[1],c2[1]-c1[1],d));
                this.fillB=parseInt(ease(e,x,t,c1[2],c2[2]-c1[2],d));
                this.fillA=1/255*ease(e,x,t,c1[3],c2[3]-c1[3],d);
                break;
              case "opac":this.opac=ease(e,x,t,b,c,d);break;
            }
        }else if(this.frame>=nextKey.frame||this.frame==0){         
          switch(curProp){
          case "left":this.left=curKey.value;break;
          case "top":this.top=curKey.value;break;
          case "cenX":this.centerX=curKey.value;break;
          case "cenY":this.centerY=curKey.value;break;
          case "scl":this.scl=curKey.value;break;
          case "rot":this.rot=curKey.value;break;
          case "strokeWeight":this.strokeW=curKey.value;break;
          case "stroke":
            var c=hexRGBA(curKey.value);            
            this.strokeR=c[0];
            this.strokeG=c[1];
            this.strokeB=c[2];
            this.strokeA=1/255*c[3]            
            break;
          case "fill":            
            var c=hexRGBA(curKey.value);
            this.fillR=c[0];
            this.fillG=c[1];
            this.fillB=c[2];
            this.fillA=1/255*c[3];
            break;
          case "opac":this.opac=curKey.value;break;
          }
        }
      }
    }

    //console.log(this.name, this.frame, this.strokeA);

    // Shape animator
    for(var i=0;i<this.shapes.length;i++){  
      for(var j=0;j<this.shapes[i].tracks.length;j++){
        for(var k=0;k<this.shapes[i].tracks[j].keys.length;k++){                
          var curShape=this.shapes[i];
          var curTrack=this.shapes[i].tracks[j];
          var curProp=this.shapes[i].tracks[j].property;
          var curKey=this.shapes[i].tracks[j].keys[k];
          if(k<curTrack.keys.length-1){var nextKey=curTrack.keys[k+1];}else{var nextKey=curTrack.keys[k]; }
          if(this.frame>=curKey.frame&&this.frame<nextKey.frame){              
              var e=curKey.easing;
              var x=0;
              var t=this.frame-curKey.frame;
              var b=curKey.value;
              var c=nextKey.value-curKey.value;
              var d = nextKey.frame-curKey.frame;
              switch(curProp){
                case "left":curShape.left=ease(e,x,t,b,c,d); break;
                case "top":curShape.top=ease(e,x,t,b,c,d);break;
                case "scl":curShape.scl=ease(e,x,t,b,c,d);break;
                case "cenX":curShape.centerX=ease(e,x,t,b,c,d);break;
                case "cenY":curShape.centerY=ease(e,x,t,b,c,d);break;
                case "rot":curShape.rot=ease(e,x,t,b,c,d);break;
                case "strokeWidth":curShape.strokeW=ease(e,x,t,b,c,d);break;
                case "stroke":
                  var c1=hexRGBA(curKey.value);
                  var c2=hexRGBA(nextKey.value);
                  curShape.strokeR=parseInt(ease(e,x,t,c1[0],c2[0]-c1[0],d));
                  curShape.strokeG=parseInt(ease(e,x,t,c1[1],c2[1]-c1[1],d));
                  curShape.strokeB=parseInt(ease(e,x,t,c1[2],c2[2]-c1[2],d));
                  curShape.strokeA=1/255*ease(e,x,t,c1[3],c2[3]-c1[3],d);
                  break;
                case "fill":
                  var c1=hexRGBA(curKey.value);
                  var c2=hexRGBA(nextKey.value);
                  curShape.fillR=parseInt(ease(e,x,t,c1[0],c2[0]-c1[0],d));
                  curShape.fillG=parseInt(ease(e,x,t,c1[1],c2[1]-c1[1],d));
                  curShape.fillB=parseInt(ease(e,x,t,c1[2],c2[2]-c1[2],d));
                  curShape.fillA=1/255*ease(e,x,t,c1[3],c2[3]-c1[3],d);
                  break;
                case "opac":curShape.opac=ease(e,x,t,b,c,d);break;
              }
          // Apply final keyframe values to shape when reaching last key
          }else if (this.frame>=nextKey.frame||this.frame==0){
              switch(curProp){
              case "left":curShape.left=curKey.value;break;
              case "top":curShape.top=curKey.value;break;
              case "cenX":curShape.centerX=curKey.value;break;
              case "cenY":curShape.centerY=curKey.value;break;
              case "scl":curShape.scl=curKey.value;break;
              case "rot":curShape.rot=curKey.value;break;
              case "strokeWidth":curShape.strokeW=curKey.value;break;
              case "stroke":
                var c=hexRGBA(curKey.value);
                curShape.strokeR=c[0];
                curShape.strokeG=c[1];
                curShape.strokeB=c[2];
                curShape.strokeA=c[3];
                break;
              case "fill":
                var c=hexRGBA(curKey.value);
                curShape.strokeR=c[0];
                curShape.strokeG=c[1];
                curShape.strokeB=c[2];
                curShape.strokeA=c[3];
                break;
              case "opac":curShape.opac=curKey.value;break;
              }
          }
        }
      }
    }

    this.draw(this.frame);
    ctx.restore();
  }
    
  timelineobject.prototype.draw=function(){
    for(var i=0;i<this.shapes.length;i++){
      this.shapes[i].draw(this.frame);
    }
  }
////////////////////////////////////////////////////////////////////////////////

//////// S H A P E /////////////////////////////////////////////////////////////
function shapeobject(name,url,mode,left,top,scl,rot,strokeW,strokeHex,fillHex,zIndex,opac,isParent){
  this.name=name;
  this.url=url;
  this.obj=[];
  this.isParent=isParent;
  this.checkMemory(this.isParent);
  !mode?this.mode=mode:this.mode="edge";
  !left?this.left=burst.width/2:this.left=left;
  !top?this.top=burst.height/2:this.top=top;
  !scl?this.scl=1:this.scl=scl;
  !rot?this.rot=0:this.rot=rot;
  !strokeW?this.strokeW=1:this.strokeW=strokeW;
  !strokeHex?this.strokeHex="000000ff":this.strokeHex=strokeHex;
  this.strokeRGBA=hexRGBA(this.strokeHex);
  this.strokeR=this.strokeRGBA[0];
  this.strokeG=this.strokeRGBA[1];
  this.strokeB=this.strokeRGBA[2];
  this.strokeA=this.strokeRGBA[3];
  !fillHex?this.fillHex="888888ff":this.fillHex=fillHex;         
  this.fillRGBA=hexRGBA(this.fillHex);
  this.fillR=this.fillRGBA[0];
  this.fillG=this.fillRGBA[1];
  this.fillB=this.fillRGBA[2];
  this.fillA=this.fillRGBA[3];
  this.opac=1.0;
  this.zIndex=1;
  this.centerX=0;
  this.centerY=0;
  this.winding=1;
  this.type="shape";
  this.tracks=[];
  this.effects=[];
  this.shapes=[];
  //this.fx=[][];
  }
  
  shapeobject.prototype.name;
  shapeobject.prototype.url;
  shapeobject.prototype.obj;  
  shapeobject.prototype.mode;
  shapeobject.prototype.left;
  shapeobject.prototype.top;
  shapeobject.prototype.scl;
  shapeobject.prototype.rot;
  shapeobject.prototype.strokeW;
  shapeobject.prototype.strokeHex;
  shapeobject.prototype.strokeRGBA;
  shapeobject.prototype.strokeR;
  shapeobject.prototype.strokeG;
  shapeobject.prototype.strokeB;
  shapeobject.prototype.strokeA;
  shapeobject.prototype.fillHex;                
  shapeobject.prototype.fillRGBA;
  shapeobject.prototype.fillR;
  shapeobject.prototype.fillG;
  shapeobject.prototype.fillB;
  shapeobject.prototype.fillA;        
  shapeobject.prototype.opac;
  shapeobject.prototype.zIndex;        
  shapeobject.prototype.centerX;
  shapeobject.prototype.centerY;
  shapeobject.prototype.winding;
  shapeobject.prototype.type;
  shapeobject.prototype.tracks;
  shapeobject.prototype.effects;
  shapeobject.prototype.shapes;
  shapeobject.prototype.fx;  
  shapeobject.prototype.isParent;  

  // Inherit
  shapeobject.prototype.inherit=function(name,url,mode,left,top,scl,rot,strokeWeight,strokeHex,fillHex,zIndex,opac){
    var isParent = this.isParent;
    for(var i=0;i<this.shapes.length;i++){
      if(this.shapes[i].name==name){return this.shapes[i];}
    }
    this.shapes[this.shapes.length] = new shapeobject(name,url,mode,left,top,scl,rot,strokeWeight,strokeHex,fillHex,zIndex,opac,isParent);
    this.shapes[this.shapes.length-1].type="subpath";
    return this.shapes[this.shapes.length-1];
  }
    
  // Draw Children
  shapeobject.prototype.drawChildren=function(){
    for(var i=0;i<this.shapes.length;i++){
      this.shapes[i].draw();
    }
  }
  
  // Parent
  shapeobject.prototype.parent=function(){
    return this.isParent;
  }
     
  // Check Memory & Load
  shapeobject.prototype.checkMemory=function(){
    burstInstance = this.isParent.isParent;
    //console.log(burstInstance);
    if(burstInstance.urlIndex.length>0){
      urlMatch=false;
      for(var i=0;i<burstInstance.urlIndex.length;i++){
        if(burstInstance.urlIndex[i]==this.url){
          this.obj=burstInstance.ajaxMem[i+1];
          urlMatch=true;
          break;
        }
      }
      if(urlMatch==false){
        burstInstance.urlIndex[burstInstance.urlIndex.length]=this.url;
        burstInstance.ajaxMem[burstInstance.urlIndex.length]=burstInstance.loadOFF(this.url);
        this.obj=burstInstance.ajaxMem[burstInstance.urlIndex.length];
      }
    }else{
      burstInstance.urlIndex[burstInstance.urlIndex.length]=this.url;
      burstInstance.ajaxMem[burstInstance.urlIndex.length]=burstInstance.loadOFF(this.url);
      this.obj=burstInstance.ajaxMem[burstInstance.urlIndex.length];
    }
    
  }
 
  // Draw Shape
  shapeobject.prototype.draw=function(frame){    
    
    ctx.fillStyle="rgba("+this.fillR+","+this.fillG+","+this.fillB+","+this.fillA+")";             
    ctx.strokeStyle="rgba("+this.strokeR+","+this.strokeG+","+this.strokeB+","+this.strokeA+")";
    ctx.lineWidth = this.strokeW;
      
    ctx.translate(-this.centerX,-this.centerY);
    if(this.mode=="edge"||this.mode=="curve"&&this.draw==true){
      if(this.type=="shape"){
        ctx.save();
        ctx.translate(this.left+this.centerX,this.top+this.centerY); 
        ctx.rotate(radians(this.rot+90));
        ctx.beginPath();
      }else{       
        ctx.moveTo(-(this.obj[0][1]*this.scl), this.obj[0][0]*this.scl);
      }
    };        
    
    for(var i=0;i<this.obj.length;i++){
      if(this.mode=="edge"){
        ctx.lineTo(-(this.obj[i][1]*this.scl),this.obj[i][0]*this.scl);
      }
    }
    ctx.lineTo(-(this.obj[0][1]*this.scl), this.obj[0][0]*this.scl);
    
    if(this.shapes.length>0){
      this.drawChildren(); 
    }
    
    if (this.mode=="edge"||this.mode=="curve"){
      if (this.type=="shape"){
        ctx.lineWidth=this.strokeW;
        ctx.globalAlpha=1;
        ctx.lineTo(-(this.obj[0][1]*this.scl),this.obj[0][0]*this.scl);        
        ctx.closePath();        
        ctx.doFill=true;
        ctx.restore();
        ctx.stroke();
        ctx.fill();
      }
    }
  }

  // Return Track
  shapeobject.prototype.track=function(property){
    for(var i=0;i<this.tracks.length;i++){
      if(this.tracks[i].property==property){
        return this.tracks[i];
      }
    }
    this.tracks[this.tracks.length]=new trackprop(property,this);
    return this.tracks[this.tracks.length-1];
  }
 
  //Return Shape
  shapeobject.prototype.shape=function(name,url,mode,left,top,scl,rot,strokeWeight,strokeHex,fillHex,zIndex,opac,isParent){
    return this.isParent.shape(name,url,mode,left,top,scl,rot,strokeWeight,strokeHex,fillHex,zIndex,opac,isParent);
  }
////////////////////////////////////////////////////////////////////////////////

//////// T R A C K /////////////////////////////////////////////////////////////
function trackprop(property,isParent){
  this.property=property;
  this.keys=[];
  this.isParent=isParent;
  }
  
  trackprop.prototype.property;
  trackprop.prototype.keys;
  trackprop.prototype.isParent;
  
  // Sort Number
  trackprop.prototype.sortNumber=function(a,b){
    return a-b;
  }
    
  // Return Track
  trackprop.prototype.track=function(aTrack){
    return this.isParent.track(aTrack);
  }
    
  trackprop.prototype.shape=function(name,url,mode,left,top,scl,rot,strokeW,strokeHex,fillHex,zIndex,opac,isParent){
    return this.isParent.shape(name,url,mode,left,top,scl,rot,strokeW,strokeHex,fillHex,zIndex,opac,isParent);
  }    

  // Add key
  trackprop.prototype.key=function(frame,value,easing){    
    !easing?easing="easeOutQuad":0;
    this.keys[this.keys.length]=new keyframe(frame,value,easing);
    var keyIndex=[];
    for(var i=0;i<this.keys.length;i++){
      keyIndex[i]=this.keys[i].frame;
    }
    keyIndex.sort(this.sortNumber);
    var keyStack=[];
    for(var i=0;i<this.keys.length;i++){
      for(var j=0;j<this.keys.length;j++){
        if(keyIndex[i]==this.keys[j].frame){
          keyStack[i]=this.keys[j];
        }
      }
    }
    this.keys=keyStack;
    return this;
  }
  
  // Return keyframe
  trackprop.prototype.frame=function(frame){
    for(var i=0;i<keys.length;i++){             
      if(keys[i].frame==frame){
          return keys[i];               
      }
    }
  }
////////////////////////////////////////////////////////////////////////////////

//////// K E Y F R A M E ///////////////////////////////////////////////////////
function keyframe(frame,value,easing){
  this.frame=frame;
  this.value=value;
  this.easing=easing;
  }
  
  trackprop.prototype.frame;
  trackprop.prototype.value;
  trackprop.prototype.easing;

  keyframe.prototype.val=function(v){
    if(v){this.value=v;}else{return this.value;}        
  }
    
  keyframe.prototype.ease=function(e){
    if(e){this.easing=e;}else{return this.easing;}        
  }
////////////////////////////////////////////////////////////////////////////////

//////// E A S I N G ///////////////////////////////////////////////////////////
function ease(e,x,t,b,c,d){
  switch(e){
    case "linear": return c*t/d + b; break;
    case "easeInQuad": return c*(t/=d)*t + b; break;
    case "easeOutQuad": return -c *(t/=d)*(t-2) + b; break;
    case "easeInOutQuad": if ((t/=d/2) < 1) return c/2*t*t + b; return -c/2 * ((--t)*(t-2) - 1) + b; break;
    case "easeInCubic": return c*(t/=d)*t*t + b; break;
    case "easeOutCubic": return c*((t=t/d-1)*t*t + 1) + b; break;
    case "easeInOutCubic": if ((t/=d/2) < 1) return c/2*t*t*t + b; return c/2*((t-=2)*t*t + 2) + b; break;
    case "easeInQuart": return c*(t/=d)*t*t*t + b; break;
    case "easeOutQuart": return -c * ((t=t/d-1)*t*t*t - 1) + b; break;
    case "easeInOutQuart": if ((t/=d/2) < 1) return c/2*t*t*t*t + b; return -c/2 * ((t-=2)*t*t*t - 2) + b; break;
    case "easeInQuint": return c*(t/=d)*t*t*t*t + b; break;
    case "easeOutQuint": return c*((t=t/d-1)*t*t*t*t + 1) + b; break;
    case "easeInOutQuint": if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b; return c/2*((t-=2)*t*t*t*t + 2) + b; break;
    case "easeInSine": return -c * Math.cos(t/d * (Math.PI/2)) + c + b; break;
    case "easeOutSine": return c * Math.sin(t/d * (Math.PI/2)) + b; break;
    case "easeInOutSine":  return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b; break;
    case "easeInExpo": return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b; break;
    case "easeOutExpo": return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b; break;
    case "easeInOutExpo": if (t==0) return b; if (t==d) return b+c; if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b; return c/2 * (-Math.pow(2, -10 * --t) + 2) + b; break;
    case "easeInCirc": return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b; break;
    case "easeOutCirc": return c * Math.sqrt(1 - (t=t/d-1)*t) + b; break;
    case "easeInOutCirc": if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b; return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b; break;
    case "easeInElastic": var s=1.70158;var p=0;var a=c; if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3; if (a < Math.abs(c)) { a=c; var s=p/4; } else var s = p/(2*Math.PI) * Math.asin (c/a); return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b; break;
    case "easeOutElastic": var s=1.70158;var p=0;var a=c; if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3; if (a < Math.abs(c)) { a=c; var s=p/4; } else var s = p/(2*Math.PI) * Math.asin (c/a); return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b; break;
    case "easeInOutElastic": var s=1.70158;var p=0;var a=c; if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5); if (a < Math.abs(c)) { a=c; var s=p/4; } else var s = p/(2*Math.PI) * Math.asin (c/a); if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b; return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b; break;
    case "easeInBack": if (s == undefined) s = 1.70158; return c*(t/=d)*t*((s+1)*t - s) + b; break;
    case "easeOutBack": if (s == undefined) s = 1.70158; return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b; break;
    case "easeInOutBack": if (s == undefined) s = 1.70158;  if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b; return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b; break;
    case "easeInBounce": return c - ease("easeOutBounce", x, d-t, 0, c, d) + b; break;
    case "easeOutBounce": if ((t/=d) < (1/2.75)) { return c*(7.5625*t*t) + b; } else if (t < (2/2.75)) { return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b; } else if (t < (2.5/2.75)) { return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b; } else { return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b; } break;
    case "easeInOutBounce": if (t < d/2) return ease("easeInBounce",x, t*2, 0, c, d) * .5 + b; return ease("easeOutBounce",x, t*2-d, 0, c, d) * .5 + c*.5 + b; break;
  }
}
////////////////////////////////////////////////////////////////////////////////









//////// E N V  - V A R S //////////////////////////////////////////////////////
width = 640;
height = 480;

////////////////////////////////////////////////////////////////////////////////




//////// I N I T - M A S T E R /////////////////////////////////////////////////
//var Burst = new Burst("name",640,480);

function newBurst(canvasId,BurstScript){
  if(window.addEventListener){
    window.addEventListener("load",function(){
      var canvas=document.getElementById(canvasId);
      var cWidth=canvas.clientWidth;
      var cHeight=canvas.clientHeight;
      if (!canvas.getContext){
        //console.log("This browser does not support the Canvas object.");
      }else{
        ctx=canvas.getContext('2d');
        var Burst=new burst("be",cWidth,cHeight);
        BurstScript(Burst);
      }
    },false);
  }
} 

/*
if(window.addEventListener){
  window.addEventListener("load",function(){
  var canvas = document.getElementById('burstCanvas');
    if (!canvas.getContext){
      console.log('This browser does not support the Canvas object.');
    }else{
      ctx = canvas.getContext('2d');
      var Burst=new burst("test");      
    }
  },false);
}
*/
//window.HBurst = Burst;
//window.HBurst = Burst;

////////////////////////////////////////////////////////////////////////////////


