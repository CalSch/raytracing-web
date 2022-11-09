/** @type {HTMLCanvasElement} */
let c = document.getElementById('eef');
let ctx = c.getContext('2d');
let width =200;
let height=200;
let wscale = 2;
let hscale = 2;
c.width = width * wscale;
c.height = height * hscale;

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, width * wscale, height * hscale);

let paused = false;
let currentX = 0;
let currentY = 0;

// let renderInt=setInterval(()=>{
//     if (paused) return;
//     let color=pix(currentX,currentY);
//     ctx.fillStyle=`rgb(${color[0]},${color[1]},${color[2]})`;
//     ctx.fillRect(currentX*wscale,currentY*hscale,wscale,hscale);

//     currentX++;
//     if (currentX>width) {
//         currentX=0;
//         currentY++;
//     }
//     if (currentY>height) {
//         clearInterval(renderInt);
//     }
// },0);

let fps=0,ms=0;

function render() {
    let locked=false;
    c.addEventListener('mousemove',function(ev){
        // this.locked=locked;
        if (locked)return;
        this.x=Math.floor(ev.offsetX/wscale);
        this.y=Math.floor(ev.offsetY/hscale);
        // let color=ctx.getImageData(this.x*wscale,this.y*hscale,1,1).data;
        let data=pixData(this.x,this.y);
        let color=data.color;
        this.r=color[0].toFixed(2);
        this.g=color[1].toFixed(2);
        this.b=color[2].toFixed(2);

        let angle=perspective(this.x,this.y);
        this.lat=angle.lat .toFixed(2);
        this.lon=angle.lon .toFixed(2);
        this.dx=angle.dir.x.toFixed(2);
        this.dy=angle.dir.y.toFixed(2);
        this.dz=angle.dir.z.toFixed(2);

        this.light=data.light;

        this.data=data;
    }.bind(this),true);
    window.addEventListener('keydown',function(ev){
        if (ev.code === "Space") {
            ev.preventDefault()
            locked=!locked;
            this.locked=locked;
        }
        // console.dir(ev.code)
    }.bind(this),true)
    function loop() {
        let color = pixColor(currentX, currentY);
        ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
        ctx.fillRect(currentX * wscale, currentY * hscale, wscale, hscale);

        currentX++;
        if (currentX > width) {
            currentX = 0;
            currentY++;
        }
        if (currentY > height) {
            paused=true;
            return false;
        }
        // loop.bind(this)();

        return true;
    }

    // loop.bind(this)();
    let start=Date.now();
    while (loop());
    let end=Date.now();
    this.elapsed=end-start;
}

const useVue=true;
let oldApp;

function start() {
    width  = parseInt(document.getElementById('ix').value);
    height = parseInt(document.getElementById('iy').value);
    wscale = 400/width;
    hscale = 400/height;
    if (useVue) {
        // VueJs
        const { createApp } = Vue;

        // if (oldApp) oldApp.unmount()
        
        oldApp=createApp({
            data() {
                return {
                    x:0,y:0,
                    r:0,g:0,b:0,
                    lat:0,lon:0,
                    dx:0,dy:0,dz:0,
        
                    hit: {},
                    data: {},
        
                    elapsed:0,
    
                    locked: false,
                }
            },
            mounted() {
                render.bind(this)()
            }
        })
        oldApp.mount('#data')
    } else {
        render()
    }
}

