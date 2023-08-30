var colorBackground = "#87ceeb";                         
var colorGround = "#9b7653";                               
var colorPosition = "#000000";                            
var colorVelocity = "#000000";                            
var colorAcceleration = "#000000";                         
var colorForce = "#000000";                                
var colorAngle = "#000000";                                
colorClock1 = "#ffffff";                                   
colorClock2 = "#ffffff";                                   
colorClock3 = "#000000";                                   



var PI2 = 2*Math.PI;                                       
var DEG = Math.PI/180;                                     
var FONT1 = "normal normal bold 12px sans-serif";          
var FONT2 = "normal normal bold 16px monospace";           
var xU = 50, yU = 270;                                     

// Attribute:

var canvas, ctx;                                           
var width, height;                                         
var bu1, bu2;                                              
var cbSlow;                                                
var ipH, ipV, ipW, ipM, ipG;                               
var rbY, rbV, rbA, rbF, rbE;                               
var on;                                                    
var slow;                                                  
var t0;                                                    
var t;                                                     
var timer;                                                 

var g;                                                     
var h0;                                                    
var v0, v0x, v0y;                                          
var alpha0;                                                
var m;                                                     
var x, y;                                                  
var x0, y0;                                                
var pix;                                                   
var tW;                                                    
var w;                                                     
var hMax;                                                  
var vyMax;                                                 
var e;                                                     
var nrSize;                                                
var pos1, pos2;                                               




function getElement (id, text) {
  var e = document.getElementById(id);                     
  if (text) e.innerHTML = text;                            
  return e;                                                
  } 
  
// Start:

function start () {
  canvas = getElement("cv");                               
  width = canvas.width; height = canvas.height;            
  ctx = canvas.getContext("2d");                           
  bu1 = getElement("bu1",text01);                          
  bu2 = getElement("bu2",text02[0]);                       
  bu2.state = 0;                                           
  cbSlow = getElement("cbSlow");                           
  cbSlow.checked = false;                                  
  getElement("lbSlow",text03);                             
  getElement("ipHa",text04);                               
  ipH = getElement("ipHb");                                
  getElement("ipHc",meter);                                
  getElement("ipVa",text05);                               
  ipV = getElement("ipVb");                                
  getElement("ipVc",meterPerSecond);                       
  getElement("ipWa",text06);                               
  ipW = getElement("ipWb");                                
  getElement("ipWc",degree);                               
  getElement("ipMa",text07);                               
  ipM = getElement("ipMb");                                
  getElement("ipMc",kilogram);                             
  getElement("ipGa",text08);                               
  ipG = getElement("ipGb");                                
  getElement("ipGc",meterPerSecond2);                      
  rbY = getElement("rbY");                                 
  getElement("lbY",text09);                                
  rbV = getElement("rbV");                                 
  getElement("lbV",text10);                                
  rbA = getElement("rbA");                                 
  getElement("lbA",text11);                                
  rbF = getElement("rbF");                                 
  getElement("lbF",text12);                                
  rbE = getElement("rbE");                                 
  getElement("lbE",text13);                                
  rbY.checked = true; nrSize = 1;                          
  getElement("author",author);                             
    
  on = slow = false;                                       
  h0 = 5; v0 = 5; alpha0 = 45*DEG; m = 1; g = 9.81;        
  updateInput();                                            
  enableInput(true);                                       
  t = 0;                                                     
  calculation();                                           
  calcPos12();                                             
  paint();                                                     
  bu1.onclick = reactionReset;                             
  bu2.onclick = reactionStart;                             
  cbSlow.onclick = reactionSlow;                           
  ipH.onkeydown = reactionEnter;                           
  ipV.onkeydown = reactionEnter;                           
  ipW.onkeydown = reactionEnter;                           
  ipM.onkeydown = reactionEnter;                           
  ipG.onkeydown = reactionEnter;                           
  rbY.onclick = reactionRadioButton;                       
  rbV.onclick = reactionRadioButton;                       
  rbA.onclick = reactionRadioButton;                       
  rbF.onclick = reactionRadioButton;                       
  rbE.onclick = reactionRadioButton;                       

  }  // Start/Pause/Writer:
  
function setButton2State (st) {
  bu2.state = st;                                          
  bu2.innerHTML = text02[st];                              
  }
  
// Start/Pause/Writer:
  
function switchButton2 () {
  var st = bu2.state;                                      
  if (st == 0) st = 1;                                     
  else st = 3-st;                                          
  setButton2State(st);                                     
  }
  



function enableInput (p) {
  ipH.readOnly = !p;
  ipV.readOnly = !p;
  ipW.readOnly = !p;
  ipM.readOnly = !p;
  ipG.readOnly = !p; 
  }
  

   
function reactionReset () {
  setButton2State(0);                                      
  enableInput(true);                                       
  stopAnimation();                                         
  t = 0;                                                   
  reaction();                                              
  paint();                                                 
  }
  

function reactionStart () {
  switchButton2();                                         
  enableInput(false);                                      
  if (bu2.state == 1) startAnimation();                    
  else stopAnimation();                                    
  reaction();                                              
  }
  



function reactionSlow () {
  slow = cbSlow.checked;                                   
  }
  



function reaction () {
  input();                                                 
  calculation();                                           
  }
  

  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    
  || e.keyCode == 13)                                      
    reaction();                                                                      
  paint();                                                 
  }



function reactionRadioButton () {
  if (rbY.checked) nrSize = 1;                             
  else if (rbV.checked) nrSize = 2;                        
  else if (rbA.checked) nrSize = 3;                        
  else if (rbF.checked) nrSize = 4;                        
  else nrSize = 5;                                         
  if (!on) paint();                                        
  }
  


function startAnimation () {
  on = true;                                               
  timer = setInterval(paint,40);                           
  t0 = new Date();                                          
  }
  



function stopAnimation () {
  on = false;                                              
  clearInterval(timer);                                    
  }

//-------------------------------------------------------------------------------------------------




function calcPos12 () {
  ctx.font = FONT1;                                        
  pos1 = ctx.measureText(text18).width;                     
  pos1 = Math.max(pos1,ctx.measureText(text19).width);     
  pos1 = Math.max(pos1,ctx.measureText(text20).width);     
  pos1 += 260;                                             
  pos2 = ctx.measureText(text26).width;                    
  pos2 = Math.max(pos2,ctx.measureText(text27).width);     
  pos2 = Math.max(pos2,ctx.measureText(text28).width);     
  pos2 += 260;                                             
  }





  
function getFactor (maxReal, maxPixel) {
  var q = maxPixel/maxReal; 
  var f = maxPixel;
  while (true) {
    f /= 2; if (f < q) break;
    f /= 2.5; if (f < q) break;
    f /= 2; if (f < q) break;
    }
  return f;
  }
  

    
function getStep1 () {
  var limit = 5, step1 = 1;
  while (true) {
    if (pix >= limit) return step1;
    limit /= 10; step1 *= 10;
    }
  }
  

  
function getStep2 () {
  var limit = 50, step1 = 1;
  while (true) {
    if (pix >= limit) return step1;
    limit /= 2; step1 *= 2;
    if (pix >= limit) return step1;
    limit /= 2.5; step1 = 5*step1/2;
    if (pix >= limit) return step1;
    limit /= 2; step1 *= 2;
    }
  }



function calculation () {
  v0x = v0*Math.cos(alpha0);                               
  v0y = v0*Math.sin(alpha0);                               
  if (Math.cos(alpha0) < 1e-10) v0x = 0;                   
  tW = (v0y+Math.sqrt(v0y*v0y+2*g*h0))/g;                  
  w = v0x*tW;                                              
  if (v0y > 0) {                                           
    var t = v0y/g;                                         
    hMax = h0+v0y*t-g*t*t/2;                               
    }
  else hMax = h0;                                          
  vyMax = Math.abs(v0y-g*tW);                              
  e = m*v0*v0/2+m*g*h0;                                    
  pix = getFactor(Math.max(w,hMax),300);                   
  if (pix*hMax > 220) pix /= 2;                            
  }
  



function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         
  return s.replace(".",decimalSeparator);                  
  }
  

  
function inputNumber (ef, d, fix, min, max) {
  var s = ef.value;                                        
  s = s.replace(",",".");                                  
  var n = Number(s);                                       
  if (isNaN(n)) n = 0;                                      
  if (n < min) n = min;                                    
  if (n > max) n = max;                                    
  ef.value = ToString(n,d,fix);                            
  return n;                                                
  }
   



function input () {
  h0 = inputNumber(ipH,3,true,0,100);                      
  v0 = inputNumber(ipV,3,true,0,100);                       
  alpha0 = inputNumber(ipW,3,true,-90,90)*DEG;             
  m = inputNumber(ipM,3,true,0.1,10);                      
  g = inputNumber(ipG,3,true,1,100);                       
  }
  


function updateInput () {
  ipH.value = ToString(h0,3,true);                         
  ipV.value = ToString(v0,3,true);                         
  ipW.value = ToString(alpha0/DEG,3,true);                 
  ipM.value = ToString(m,3,true);                          
  ipG.value = ToString(g,3,true);                          
  }
   
//-------------------------------------------------------------------------------------------------



function newPath () {
  ctx.beginPath();                                         
  ctx.strokeStyle = "#000000";                             
  ctx.lineWidth = 1;                                       
  }
  



function line (x1, y1, x2, y2, c, w) {
  newPath();                                               
  if (c) ctx.strokeStyle = c;                              
  if (w) ctx.lineWidth = w;                                
  ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);                    
  ctx.stroke();                                            
  }
  



function rectangle (x, y, w, h, c) {
  if (c) ctx.fillStyle = c;                                
  newPath();                                               
  ctx.fillRect(x,y,w,h);                                   
  ctx.strokeRect(x,y,w,h);                                 
  }




function circle (x, y, r, c) {
  if (c) ctx.fillStyle = c;                                
  newPath();                                               
  ctx.arc(x,y,r,0,PI2,true);                               
  if (c) ctx.fill();                                       
  ctx.stroke();                                            
  }
  



function arrow (x1, y1, x2, y2, w) {
  if (!w) w = 1;                                                                     
  var dx = x2-x1, dy = y2-y1;                              
  var length = Math.sqrt(dx*dx+dy*dy);                     
  if (length == 0) return;                                 
  dx /= length; dy /= length;                              
  var s = 2.5*w+7.5;                                        
  var xSp = x2-s*dx, ySp = y2-s*dy;                                 
  var h = 0.5*w+3.5;                                       
  var xSp1 = xSp-h*dy, ySp1 = ySp+h*dx;                    
  var xSp2 = xSp+h*dy, ySp2 = ySp-h*dx;                    
  xSp = x2-0.6*s*dx; ySp = y2-0.6*s*dy;                    
  ctx.beginPath();                                         
  ctx.lineWidth = w;                                       
  ctx.moveTo(x1,y1);                                       
  if (length < 5) ctx.lineTo(x2,y2);                       
  else ctx.lineTo(xSp,ySp);                                
  ctx.stroke();                                            
  if (length < 5) return;                                  
  ctx.beginPath();                                         
  ctx.fillStyle = ctx.strokeStyle;                         
  ctx.moveTo(xSp,ySp);                                     
  ctx.lineTo(xSp1,ySp1);                                   
  ctx.lineTo(x2,y2);                                       
  ctx.lineTo(xSp2,ySp2);                                   
  ctx.closePath();                                         
  ctx.fill();                                               
  }
    


function clock () {
  var x = 140, y = 30;                                     
  rectangle(x-60,y-15,120,30,colorClock1);                 
  rectangle(x-50,y-10,100,20,colorClock2);                 
  ctx.font = FONT2;                                        
  ctx.fillStyle = colorClock3;                                             
  var s = ToString(t,3,true) + " "+secondUnicode;          
  ctx.textAlign = "center";                                
  ctx.fillText(s,x,y+5);                                   
  ctx.font = FONT1;                                        
  }    
  


function ball () {
  x = v0x*t; y = h0+v0y*t-g*t*t/2;                         
  if (y < 0) y = 0;                                        
  x0 = xU+pix*x; y0 = yU-pix*y;                            
  circle(x0,y0,7,"#ff0000");                             
  }
  


function axes () {
  newPath();                                               
  arrow(xU-10,yU,xU+355,yU);                               
  arrow(xU,yU+10,xU,yU-255);                               
  var step1 = getStep1();                                   
  var step2 = getStep2();                                  
  ctx.textAlign = "center";                                
  ctx.fillStyle = "#000000";                               
  for (var i=1; i<=330/pix; i++) {                          
    var x = xU+i*pix;                                      
    var d = (i%step2==0 ? 5 : 2);                          
    if (i%step1 == 0) line(x,yU-d,x,yU+d);                 
    if (i%step2 == 0) ctx.fillText(""+i,x,yU+18);              
    }
  ctx.textAlign = "right";                                 
  for (var i=1; i<=220/pix; i++) {                          
    var y = yU-i*pix;                                      
    var d = (i%step2==0 ? 5 : 2);                          
    if (i%step1 == 0) line(xU-d,y,xU+d,y);                 
    if (i%step2 == 0) ctx.fillText(""+i,xU-7,y+4);         
    }
  ctx.textAlign = "center";                                
  ctx.fillText(symbolX,xU+350,yU+18);                      
  ctx.fillText(text14,xU+350,yU+30);                       
  ctx.fillText(symbolY,xU-20,yU-245);                      
  ctx.fillText(text14,xU-20,yU-230);                       
  }
      


function orbit () {
  newPath();                                               
  ctx.strokeStyle = colorPosition;                         
  if (v0x < 1e-10) {                                       
    line(xU,yU,xU,yU-hMax*pix); return;                    
    }
  var gH = g/2;                                            
  var xx = xU, yy = yU-h0*pix;                             
  ctx.moveTo(xx,yy);                                       
  var t = 0;                                               
  while (t < tW) {                                         
    xx++;                                                  
    var x = (xx-xU)/pix;                                   
    t = x/v0x;                                             
    var y = h0+t*(v0y-gH*t);                               
    yy = yU-y*pix;                                         
    ctx.lineTo(xx,yy);                                     
    }
  ctx.stroke();                                            
  }
  


  
function writeValue (beg, val, end, x, y) {
  var s = beg+ToString(val,3,false)+end;
  ctx.fillText(s,x,y);
  }
  


function position () {
  newPath();                                               
  ctx.fillStyle = colorPosition;                           
  var x1 = 220, x2 = 240, x3 = 320;                        
  ctx.fillText(text15,x1,25);                              
  writeValue(symbolX+" = ",x," "+meterUnicode,x2,40);      
  ctx.fillText(text16,x3,40);                              
  writeValue(symbolY+" = ",y," "+meterUnicode,x2,55);      
  ctx.fillText(text17,x3,55);                              
  ctx.fillText(text18,x1,80);                              
  writeValue("",w," "+meterUnicode,pos1,80);                                     
  ctx.fillText(text19,x1,95);                              
  writeValue("",hMax," "+meterUnicode,pos1,95);            
  ctx.fillText(text20,x1,120);                             
  writeValue("",tW," "+secondUnicode,pos1,120);            
  line(x0,yU-5,x0,yU+5,colorPosition);                     
  line(xU-5,y0,xU+5,y0,colorPosition);                     
  }
      

 

function angle (x, y, a) {
  var r = 20;                                              
  newPath();                                               
  ctx.fillStyle = colorAngle;                              
  ctx.moveTo(x,y);                                         
  ctx.lineTo(x+r,y);                                       
  ctx.arc(x,y,r,0,-a,a>0);                                 
  ctx.closePath();                                         
  ctx.fill(); ctx.stroke();                                
  }
    


function velocity () {
  var vy = v0y-g*t;                                        
  var alpha = Math.atan(vy/v0x);                           
  angle(x0,y0,alpha);                                      
  orbit();                                                 
  var l = vyMax*10;                                        
  var f = (l>120 ? l/120 : 1);                             
  var dxPix = v0x*10/f;                                    
  var dyPix = vy*10/f;                                      
  ctx.strokeStyle = colorVelocity;                         
  arrow(x0,y0,x0+dxPix,y0-dyPix,3);                        
  arrow(x0,y0,x0+dxPix,y0);                                
  arrow(x0,y0,x0,y0-dyPix);                                
  ctx.fillText(text21,220,25);                             
  var w1 = ctx.measureText(symbolVelocity).width;                               
  var w2 = 2*w1+ctx.measureText("  ").width;               
  var mps = " "+meterPerSecondUnicode;                     
  ctx.fillText(symbolVelocity,240,40);                     
  ctx.fillText(symbolX,240+w1,45);                         
  writeValue("= ",v0x,mps,240+w2,40);                      
  ctx.fillText(text16,330,40);                                 
  ctx.fillText(symbolVelocity,240,55);                     
  ctx.fillText(symbolY,240+w1,60);                         
  writeValue("= ",vy,mps,240+w2,55);                       
  ctx.fillText(text17,330,55);                             
  ctx.fillText(text22,220,80);                             
  var v = Math.sqrt(v0x*v0x+vy*vy);                        
  writeValue("",v,mps,240,95);                             
  ctx.fillText(text23,220,120);                            
  writeValue("",alpha/DEG,degreeUnicode,350,120);          
  ctx.strokeStyle = "#000000";                             
  line(x0+dxPix,y0,x0+dxPix,y0-dyPix);                     
  line(x0,y0-dyPix,x0+dxPix,y0-dyPix);                     
  }
  


function acceleration () {
  var len = (g<30 ? g*4 : 120);                            
  ctx.strokeStyle = colorAcceleration;                     
  arrow(x0,y0,x0,y0+len,3);                                
  ctx.fillText(text24,220,25);                             
  writeValue("",g," "+meterPerSecond2Unicode,330,25);      
  }
  


function force () {
  var len = (g<30/m ? g*4*m : 120);                        
  ctx.strokeStyle = colorForce;                            
  arrow(x0,y0,x0,y0+len,3);                                
  ctx.fillText(text25,220,25);                             
  writeValue("",m*g," "+newtonUnicode,330,25);             
  }
    


function energy () {
  var ePot = m*g*y;                                        
  var j = " "+jouleUnicode;                                
  ctx.fillStyle = colorVelocity;                           
  ctx.fillText(text26,220,25);                             
  writeValue("",e-ePot,j,pos2,25);                         
  ctx.fillStyle = colorPosition;                           
  ctx.fillText(text27,220,40);                             
  writeValue("",ePot,j,pos2,40);                           
  ctx.fillStyle = "#000000";                               
  ctx.fillText(text28,220,65);                             
  writeValue("",e,j,pos2,65);                              
  }
  

  
function paint () {
  ctx.fillStyle = colorBackground;                         
  ctx.fillRect(0,0,width,height);                          
  if (on) {                                                
    var t1 = new Date();                                   
    var dt = (t1-t0)/1000;                                 
    if (slow) dt /= 10;                                    
    t += dt;                                               
    t0 = t1;                                               
    if (t > tW) t = tW;                                    
    }
  ctx.font = FONT1;                                        
  var vv = yU+3;                                           
  rectangle(0,vv,width,height-vv,colorGround);             
  ball();                                                  
  axes();                                                  
  clock();                                                 
  if (nrSize != 2) orbit();                                
  ctx.textAlign = "left";                                  
  switch (nrSize) {                                        
    case 1: position(); break;                             
    case 2: velocity(); break;                             
    case 3: acceleration(); break;                         
    case 4: force(); break;                                
    case 5: energy(); break;                               
    }
  }
  
document.addEventListener("DOMContentLoaded",start,false); 




