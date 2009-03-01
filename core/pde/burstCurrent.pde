/*
    Burst Engine 0.2.18 - http://hyper-metrix.com/#burst        
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

burst Burst = new burst();

//////// M A S T E R - C O N T R O L E R ///////////////////////////////////////
class burst{ burst(){
    this.version="burst0.2.18.pde";
    window.Processing.data.burstVersion = this.version;
    this.urlIndex = new Object[];
    this.ajaxMem = new Object[];
    this.timelines = new Object[];
    this.buffer = new Object[];
    this.debug = false;
    this.tl = "";
    }
    
    void start(Object tl, cb){
        buffer = [];
        for (int i=0; i<tl.length; i++ ){
            if(typeof tl[i] == "string"){                
              for (int j=0; j < timelines.length; j++ ){         
                timelines[j].name == tl[i] ? load( timelines[j], cb ) : 0;
              }
            } else {
              load(tl[i], cb);
            }
        }
    }
      
    void chain(tlchain, cb){
        var nextcb;
        buffer = [];        
        if(tlchain[tlchain.length-1]==";"){tlchain = tlchain.substr(0,tlchain.length-1)};  // Detect & remove extra ';' at the end of chain         
        int splitPos = tlchain.indexOf(";");
        if(splitPos > -1){
            tl = tlchain.slice(0,  splitPos);
            tlchain = tlchain.slice(tlchain.indexOf(";")+1);
            nextcb = function(){chain(tlchain, cb)};
        } else {
            tl = tlchain;
            nextcb = cb;
        }        
        for (int j=0; j < timelines.length; j++ ) {         
          if (timelines[j].name == tl){            
            load( timelines[j], nextcb );
            break;
          }
        }        
    }    
        
    void pause(Object tl, int onFrame){
        for (int i=0; i<tl.length; i++ ){
            if(typeof tl[i] == "string") {
                for (int j=0; j < timelines.length; j++ ) {         
                  timelines[j].name == tl[i] ? timelines[j].pause(onFrame) : 0; 
                }
            } else {
              tl[i].pause(onFrame);
            }
        }
    }
    
    void load(Object tl, cb){
        tl.playSpeed >= 0 ? tl.frame=0 : tl.frame=tl.lastFrame;
        tl.callbackfired = false;              
        buffer[buffer.length] = [tl, cb];                              
    }
    
    void unload(){
        // make unloader?                              
    }
        
    void play(){
        for (int i=0; i < buffer.length; i++ ){
          buffer[i][0].play(buffer[i][1]);
        }
    }

    void timeline(String name, int frameOffset, int lastFrame, float playSpeed, boolean loop){
        for(int i=0; i<timelines.length; i++){
            if(timelines[i].name==name){
                return timelines[i];
            }
        }         
        timelines[timelines.length] = new timelineobject(name, frameOffset, lastFrame, playSpeed, loop);
        return timelines[timelines.length-1];
    }
    
}
////////////////////////////////////////////////////////////////////////////////


//////// T I M E L I N E ///////////////////////////////////////////////////////                                                            

class timelineobject{ timelineobject(String name, int frameOffset, int lastFrame, float playSpeed, boolean loop){    
    this.name=name;
    this.frameOffset = frameOffset;
    this.lastFrame = lastFrame;
    this.playSpeed = playSpeed;
    this.paused = false;
    this.shapes = new Object[];
    this.timelines = new Object[];
    this.frame = 0;
    this.callbackfired = false;    
    this.randomCount=0;
    this.playMode = "";
    }        
    
    void include(Object tl){
        timelines[timelines.length] = tl;
    }
    
    void clone(String newName){        
        //aClone = new timelineobject(String newName);
        //for ()
        //aClone.shapes = this.shapes;
        //timelines[timelines.length] = aClone;
        //return aClone;
    }    
    
    void shape(String name, String url, String mode, float left, float top, float scl, float rot, float strokeW, String strokeHex, String fillHex, int zIndex, float opac, Object isParent){        
        for(int i=0; i < shapes.length; i++){
            if (shapes[i].name==name){ return shapes[i];
            }
        }
        shapes[shapes.length] = new shapeobject(String name, String url, String mode, float left, float top, float scl, float rot, float strokeW, String strokeHex, String fillHex, int zIndex, float opac, Object this);
        return shapes[shapes.length-1];
    }
    
    void pause(int onFrame){
        if(onFrame){
          this.frame = onFrame;
          this.paused = true;
        } else {
          this.paused = true;
        }      
    }
    
    void playChildren(){
        for(int i=0; i < timelines.length; i++){
            timelines[i].frame += playSpeed;
            timelines[i].play();
        }    
    }    
    
    void callback(cb){
        if(cb!=undefined && callbackfired==false){
          callbackfired=true;
          cb();
        }
    }

    void play(cb){
        Burst.debug == true ? console.log(this.name, frame) : 0 ; 
        
        //console.log(playMode, frame);
                
        if(playSpeed < 0){ playMode = "backward"; } else { playMode = "forward"; }        
        
        // Frame handler
        if (paused == false){
        switch(playMode){
        case "forward":
            frame <= lastFrame ? frame = frame + playSpeed : loop == true ? frame = 0 : (cb)?callback(cb):0; ;
            playChildren();
            break;
        case "backward":
            frame >= 1-playSpeed ? frame = frame + playSpeed : loop == true ? frame = lastFrame : (cb)?callback(cb):0; ;                        
            playChildren();
            break;
        case "random":
            frame = random(lastFrame);
            if(randomCount < lastFrame){ randomCount++; }else{ if(loop){ (cb)?callback(cb):0; } }
            playChildren();
            break;
        }
        }
                
        
        for(int i=0; i < shapes.length; i++){  
          for(int j=0; j < shapes[i].tracks.length; j++){
            for(int k=0; k < shapes[i].tracks[j].keys.length; k++){                
                  // Select branch from OO tree 
                  Object curShape = shapes[i];
                  Object curTrack = shapes[i].tracks[j];
                  String  curProp = shapes[i].tracks[j].property;
                  Object curKey = shapes[i].tracks[j].keys[k];
                  // Define next keyframe. Engine will calulate be'tween' key values 
                  if (k < curTrack.keys.length - 1) { int nextKey = curTrack.keys[k+1]; } else { int nextKey = curTrack.keys[k]; }
                  // If the current frame is between the selected keyframe and the next keyframe...
                  if (frame >= curKey.frame && frame < nextKey.frame){              
                      String e = curKey.easing;
                      float  x = 0;
                      float  t = frame - curKey.frame;
                      float  b = curKey.value;
                      float  c = nextKey.value - curKey.value;
                      float  d = nextKey.frame - curKey.frame;
                      // Calculate and update the property values of the shape between keyframes 
                      switch(curProp){
                      case "left": curShape.left = ease(e, x, t, b, c, d); break;
                      case "top": curShape.top = ease(e, x, t, b, c, d); break;
                      case "scl": curShape.scl = ease(e, x, t, b, c, d); break;
                      case "rot": curShape.rot = ease(e, x, t, b, c, d); break;
                      case "strokeWidth": curShape.strokeW = ease(e, x, t, b, c, d); break;
                      case "stroke": int[] c1 = hexRGBA(curKey.value); int[] c2 = hexRGBA(nextKey.value); curShape.strokeR = int( ease(e, x, t, c1[0], c2[0]-c1[0], d) ); curShape.strokeG = int( ease(e, x, t, c1[1], c2[1]-c1[1], d) ); curShape.strokeB = int( ease(e, x, t, c1[2], c2[2]-c1[2], d) ); curShape.strokeA = int( ease(e, x, t, c1[3], c2[3]-c1[3], d) ); break;
                      case "fill": int[] c1 = hexRGBA(curKey.value); int[] c2 = hexRGBA(nextKey.value); curShape.fillR = int( ease(e, x, t, c1[0], c2[0]-c1[0], d) ); curShape.fillG = int( ease(e, x, t, c1[1], c2[1]-c1[1], d) ); curShape.fillB = int( ease(e, x, t, c1[2], c2[2]-c1[2], d) ); curShape.fillA = int( ease(e, x, t, c1[3], c2[3]-c1[3], d) ); break;
                      case "opac": curShape.opac = ease(e, x, t, b, c, d); break;
                      }
                  // Apply final keyframe values to shape when reaching last key
                  } else if (frame >= nextKey.frame || frame == 0){         
                      switch(curProp){
                      case "left": curShape.left = curKey.value; break;
                      case "top": curShape.top = curKey.value; break;
                      case "scl": curShape.scl = curKey.value; break;
                      case "rot": curShape.rot = curKey.value; break;
                      case "strokeWidth": curShape.strokeW = curKey.value; break;
                      case "stroke": int[] c = hexRGBA(curKey.value); curShape.strokeR = c[0]; curShape.strokeG = c[0]; curShape.strokeB = c[0]; curShape.strokeA = c[0]; break;
                      case "fill": int[] c = hexRGBA(curKey.value); curShape.strokeR = c[0]; curShape.strokeG = c[0]; curShape.strokeB = c[0]; curShape.strokeA = c[0]; break;
                      case "opac": curShape.opac = curKey.value; break;
                      }
                  }
            }
          }
        }
        draw(frame);
    }
    
    void draw(){
        for(int i=0; i < shapes.length; i++){
            shapes[i].draw(frame);
        }
    }

}
////////////////////////////////////////////////////////////////////////////////

//////// S H A P E /////////////////////////////////////////////////////////////
class shapeobject{ shapeobject(String name, String url, String mode, float left, float top, float scl, float rot, float strokeW, String strokeHex, String fillHex, int zIndex, float opac, Object isParent){
        this.name=name;
        this.url=url;            
        !mode ? this.mode = mode : this.mode = "edge";        
        !left ? this.left = width / 2 : this.left = left;        
        !top ? this.top = height / 2 : this.top = top;        
        !scl ? this.scl = 1 : this.scl = scl;
        !rot ? this.rot = 0 : this.rot = rot;
        !strokeW ? this.strokeW = 0 : this.strokeW = strokeW;        
        !strokeHex ? this.strokeHex = "000000ff" : this.strokeHex = strokeHex;
            this.strokeRGBA = hexRGBA(strokeHex);
            this.strokeR = this.strokeRGBA[0];
            this.strokeG = this.strokeRGBA[1];
            this.strokeB = this.strokeRGBA[2];
            this.strokeA = this.strokeRGBA[3];
            
        !fillHex ? this.fillHex = "000000ff" : this.fillHex = fillHex;                
            this.fillRGBA = hexRGBA(fillHex);
            this.fillR = this.fillRGBA[0];
            this.fillG = this.fillRGBA[1];
            this.fillB = this.fillRGBA[2];
            this.fillA = this.fillRGBA[3];        
        opac ? this.opac = opac : this.opac = 1.0;
        !zIndex ? this.zIndex = zIndex : this.zIndex = 1;        
        
        checkMemory();
        //this.i = 0;
        this.tracks = new Object[];
        this.effects = new Object[];
        //this.fx = new Object[];
        float[][] fx = new float[obj.length][2];
        this. fxFrame = 0;
        this.rampIn = 0;
        this.isParent = isParent;
    }
      
    void checkMemory(){ // Store or re-use AJAX data to save Kbs in DL.
        float[][] obj;
        if(Burst.urlIndex.length>0){
            boolean urlMatch = false;
            for(int i=0; i<Burst.urlIndex.length; i++){
                if (Burst.urlIndex[i]==url){
                    this.obj = Burst.ajaxMem[i+1];
                    urlMatch = true;
                    break;
                }
            }
            if (urlMatch==false){
                Burst.urlIndex[Burst.urlIndex.length]= url;
                Burst.ajaxMem [Burst.urlIndex.length] = loadOff(url);
                this.obj = Burst.ajaxMem[Burst.urlIndex.length];
            }
        } else {
            Burst.urlIndex[Burst.urlIndex.length]=url;
            Burst.ajaxMem[Burst.urlIndex.length] = loadOff(url);
            this.obj = Burst.ajaxMem[Burst.urlIndex.length];
        }
    }
    
    void addeffect(String name, String type, Object vars){
        effects[effects.length] = new effect(String name, String type, Object vars);
    }
    
    void draw(frame){
        fxFrame++;     
        for(int i=0; i < effects.length; i++ ){
            rampIn < 20 ? rampIn=rampIn+.03 :0;
            
            switch (effects[i]){
            case "wave":
                for (int i=0; i < obj.length; i++){                    
                    fx[i][0]=(sin((i+fxFrame/16))*2);
                    fx[i][1]=(cos((i+fxFrame/8))*2);
                }
                break;
            case "":
                for (int i=0; i < obj.length; i++){                    
                    fx[i][0]=0;
                    fx[i][1]=0;
                }
                break;
            }
        }
                
        strokeWeight(strokeW);
        stroke(strokeR, strokeG, strokeB, sqrt(fillA*(255*opac)) );        
        fill(fillR, fillG, fillB, sqrt(fillA*(255*opac)) );
        
        pushMatrix();
        translate(this.left, this.top);
        rotate(radians(rot+90));
        if (mode == "edge" || mode == "curve" && draw == true){beginShape()};        
        
        for (i=0; i < obj.length; i++){          
          if (mode=="edge"){
              if (obj[i][0] == "|"){
                  endShape();
                  beginShape();
              } else {
                  //float X = -(obj[i][1]*scl)+fx[i][0]; //float Y = obj[i][0]*scl+fx[i][1];
                  vertex(-(obj[i][1]*scl)+fx[i][0], obj[i][0]*scl+fx[i][1]);
              }
          } else if (mode=="points"){
              point(-(obj[i][0]*scl)+fx[i][0], obj[i][1]*scl+fx[i][1]);
          } else if (mode=="curve"){
              curveVertex(-(obj[i][1]*scl)+fx[i][0], obj[i][0]*scl+fx[i][1]);
          }
        } if (mode=="edge"||mode=="curve"){
            endShape();
        };
        //vertex(-(obj[obj.length][1]*scl)+fx[obj.length][0], obj[obj.length][0]*scl+fx[obj.length][1]);
        popMatrix();
    }

    void track(String property){
      for(int i=0; i < tracks.length; i++){
          if(tracks[i].property==property){
            return tracks[i];
          }
      }
      tracks[tracks.length] = new trackprop(String property, Object this);
      return tracks[tracks.length-1];
    }
    
    void shape(String name, String url, String mode, float left, float top, float scl, float rot, float strokeWeight, String strokeHex, String fillHex, int zIndex, float opac){
        return this.isParent.shape(String name, String url, String mode, float left, float top, float scl, float rot, float strokeWeight, String strokeHex, String fillHex, int zIndex, float opac)
    }    

}
////////////////////////////////////////////////////////////////////////////////

//////// T R A C K /////////////////////////////////////////////////////////////
class trackprop{ trackprop(String property, Object isParent){
  this.property = property;
  this.keys = new Object[];
  this.isParent = isParent;
  }
  
  void sortNumber(a, b){
      return a - b;
  }
    
  void track(String aTrack){
      return this.isParent.track(aTrack);
  }

  void shape(String name, String url, String mode, float left, float top, float scl, float rot, float strokeW, String strokeHex, String fillHex, int zIndex, float opac){      
      return this.isParent.shape(String name, String url, String mode, float left, float top, float scl, float rot, float strokeW, String strokeHex, String fillHex, int zIndex, float opac);
  }

  void key(int frame, String value, String easing){
      //console.log( this );
      if(!easing){easing="easeOutQuad"};      
      // Add new Key to keyframe array
      keys[keys.length] = new keyframe(frame, value, easing);
      // Sort associative index for keyframe array
      int[] keyIndex = new int[];       
      for(int i=0; i < keys.length; i++){                         
          keyIndex[i] = keys[i].frame;
      }
      keyIndex.sort(sortNumber);
      // Re-order keyframe array by frame
      int[] keyStack = new int[];
      for(int i=0; i < keys.length; i++){
          for(int j=0; j < keys.length; j++){                                   
              //console.log( keyIndex[i] );
              if (keyIndex[i] == keys[j].frame){
                keyStack[i] = keys[j];
              }
          }
      }
      keys = keyStack;
      return this;
  }
  
  void frame(int frame){
      for(int i=0; i < keys.length; i++){             
            if(keys[i].frame==frame){
                return keys[i];                
            }
      }
  }
  
}
////////////////////////////////////////////////////////////////////////////////

//////// K E Y F R A M E ///////////////////////////////////////////////////////
class keyframe { keyframe(int frame, String value, String easing){
    this.frame = frame;
    this.value = value;
    this.easing = easing;
    }
    
    void val(String v){
       if(v){this.value = v;} else {return this.value;}        
    }
    
    void ease(String e){
       if(e){this.easing = e;} else {return this.easing;}        
    }

}
////////////////////////////////////////////////////////////////////////////////

//////// E A S I N G ///////////////////////////////////////////////////////////
ease = function ease(e, x, t, b, c, d){
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
      case "easeInBounce": return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b; break;
      case "easeOutBounce": if ((t/=d) < (1/2.75)) { return c*(7.5625*t*t) + b; } else if (t < (2/2.75)) { return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b; } else if (t < (2.5/2.75)) { return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b; } else { return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b; } break;
      case "easeInOutBounce": if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b; return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b; break;
    }
}

////////////////////////////////////////////////////////////////////////////////
/* ----- S O U R C E S --------------------------------------------------------- 
EASING MATH:
    Copyright © 2008 George McGinley Smith
    http://gsgd.co.uk/sandbox/jquery/easing/
    Copyright © 2002 Robert Penner
    http://www.robertpenner.com/easing/


///////////////////////////////////////////////////////////////////////////////*/

