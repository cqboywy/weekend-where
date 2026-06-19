// Hi-res app icon: 1024×1024 editorial "W" masthead
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const S = 1024;

function crc32(b) {
  let c=0xFFFFFFFF;
  for(let i=0;i<b.length;i++){c^=b[i];for(let j=0;j<8;j++)c=(c>>>1)^(c&1?0xEDB88320:0);}
  return(c^0xFFFFFFFF)>>>0;
}
function chunk(t,d){
  const l=Buffer.alloc(4);l.writeUInt32BE(d.length);
  const tb=Buffer.from(t,'ascii');
  const cr=Buffer.alloc(4);cr.writeUInt32BE(crc32(Buffer.concat([tb,d])));
  return Buffer.concat([l,tb,d,cr]);
}
function png(buf){
  const rl=1+S*4;const raw=Buffer.alloc(S*rl);
  for(let y=0;y<S;y++){raw[y*rl]=0;buf.copy(raw,y*rl+1,y*S*4,(y+1)*S*4);}
  const h=Buffer.alloc(13);h.writeUInt32BE(S,0);h.writeUInt32BE(S,4);h[8]=8;h[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',h),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}

function fresh(){return Buffer.alloc(S*S*4);}

function draw(buf,x1,y1,x2,y2,thick,r,g,b){
  const steps=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)));
  const hw=thick/2,dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
  for(let s=0;s<=steps;s++){
    const cx=x1+dx*s/steps,cy=y1+dy*s/steps;
    for(let t=-hw;t<=hw;t+=0.6){
      const px=Math.round(cx+nx*t),py=Math.round(cy+ny*t);
      if(px>=0&&px<S&&py>=0&&py<S){const i=(py*S+px)*4;buf[i]=r;buf[i+1]=g;buf[i+2]=b;buf[i+3]=255;}
    }
  }
}

function fill(buf,r,g,b){
  for(let i=0;i<S*S*4;i+=4){buf[i]=r;buf[i+1]=g;buf[i+2]=b;buf[i+3]=255;}
}

function dot(buf,cx,cy,rad,r2,g2,b2,a){
  for(let dy=-rad;dy<=rad;dy++)for(let dx=-rad;dx<=rad;dx++)
    if(dx*dx+dy*dy<=rad*rad){
      const px=cx+dx,py=cy+dy;
      if(px>=0&&px<S&&py>=0&&py<S){
        const i=(py*S+px)*4;
        buf[i]=r2;buf[i+1]=g2;buf[i+2]=b2;buf[i+3]=a;
      }
    }
}

// ——— Icon ———
const buf = fresh();
const bgR=0xF3,bgG=0xEF,bgB=0xEA;
const inkR=0xC2,inkG=0x67,inkB=0x4A;

fill(buf, bgR, bgG, bgB);

const mg = 180; // margin scaled up
const cx = S/2, cy = 440, ww = 280, wh = 360;
const t = 36; // line thickness scaled up
const thin = 7;

// Top rule
draw(buf, mg, 180, S-mg, 180, thin, inkR, inkG, inkB);

// Large W
draw(buf, cx-ww, cy-wh, cx-ww+110, cy+wh, t, inkR, inkG, inkB);
draw(buf, cx-ww+110, cy+wh, cx, cy-80, t, inkR, inkG, inkB);
draw(buf, cx, cy-80, cx+ww-110, cy+wh, t, inkR, inkG, inkB);
draw(buf, cx+ww-110, cy+wh, cx+ww, cy-wh, t, inkR, inkG, inkB);

// Subtitle line
const subY = 720;
draw(buf, mg+80, subY, S-mg-80, subY, thin*0.6, inkR, inkG, inkB);
dot(cx-240, subY, 10, inkR, inkG, inkB, 255);
dot(cx, subY, 10, inkR, inkG, inkB, 255);
dot(cx+240, subY, 10, inkR, inkG, inkB, 255);

// Bottom rule
draw(buf, mg, 820, S-mg, 820, thin, inkR, inkG, inkB);

const out = path.join(__dirname, '..', 'miniprogram', 'images', 'app-icon.png');
fs.writeFileSync(out, png(buf));
console.log('App icon:', out, `(${S}×${S}px)`);
