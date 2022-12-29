/** @type {HTMLCanvasElement} */
let canvas = document.getElementById('eef');
let canvas_ctx = canvas.getContext('2d');
/** @type {HTMLCanvasElement} */
let image = document.createElement('canvas');
let image_ctx = image.getContext('2d');
let width  = 400;
let height = 400;
let wscale = 1;
let hscale = 1;
image.width = width * wscale;
image.height = height * hscale;

image_ctx.fillStyle = 'black';
image_ctx.fillRect(0, 0, width * wscale, height * hscale);

canvas.width = width * wscale;
canvas.height = height * hscale;

canvas_ctx.fillStyle = 'black';
canvas_ctx.fillRect(0, 0, width * wscale, height * hscale);

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

//#region Projection
// From https://xem.github.io/articles/projection.html

// Camera positions
let cx=0,
    cy=0,
    cz=0;
// Camera rotations
let yaw  =0,
    pitch=0,
    roll =0;

let perspective2=250;
let w=canvas.width/2,
    h=canvas.height/2;
let realSize=100;

let rotate = (a, b, angle) => [
    Math.cos(angle) * a - Math.sin(angle) * b,
    Math.sin(angle) * a + Math.cos(angle) * b
];  
function project(x,y,z) {
    // Perform rotations
    [x,z] = rotate(x,z,yaw);
    [y,z] = rotate(y,z,pitch);
    [x,y] = rotate(x,y,roll);

    // Add camera offsets
    x -= cx;
    y -= cy;
    z -= cz;

    let size = realSize / z * perspective2;

    if(z > 0){
        x = w + x / z * perspective2;
        y = h + y / z * perspective2;

        return {x,y,size}
    }

    return {x:0,y:0,size:0}
}

//#endregion


let fps=0,ms=0;

function render() {
    let locked=false;
    // let ray=false;
    canvas.addEventListener('mousemove',function(ev){
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
        } else if (ev.code === "KeyR") {
            ev.preventDefault()
            // ray=!ray;
            // this.ray=!this.ray
            let data=pixData(this.x,this.y);

            if (data.extra.dir) {
                console.dir(data)
                let p1_3d={ ...data.hit.hit_point };
                let p2_3d={ ...(data.extra.new_hit || {hit_point:{x:0,y:0,z:0}}).hit_point };
                let p1=project(p1_3d.x,-p1_3d.y,p1_3d.z);
                let p2=project(p2_3d.x,-p2_3d.y,p2_3d.z);

                canvas_ctx.drawImage(image,0,0)

                // const gradient = canvas_ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                // gradient.addColorStop(0,p1_3d.z>p2_3d.z ? "red":"blue");
                // gradient.addColorStop(1,p1_3d.z<p2_3d.z ? "red":"blue");
                // canvas_ctx.lineWidth="5";
                // canvas_ctx.strokeStyle=gradient;
                // canvas_ctx.beginPath();
                // canvas_ctx.moveTo(p1.x,p1.y);
                // canvas_ctx.lineTo(p2.x,p2.y);
                // canvas_ctx.stroke();
                for (let i=0;i<=30;i++) {
                    let x=lerp(i/30,p1.x,p2.x);
                    let y=lerp(i/30,p1.y,p2.y);
                    let s=lerp(i/30,p1.size,p2.size)*.08-30;
                    s=Math.max(s,1)
                    // s=10
                    canvas_ctx.fillStyle=`hsl(${map(
                        lerp(i/10,p1_3d.z,p2_3d.z),
                        0,100,
                        0,360
                    )}deg,100%,50%)`;
                    canvas_ctx.beginPath();
                    canvas_ctx.arc(x, y, s, 0, 2 * Math.PI);
                    canvas_ctx.fill();
                }
            }
        }
        // console.dir(ev.code)
    }.bind(this),true)
    function loop() {
        let color = pixColor(currentX, currentY);
        image_ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
        image_ctx.fillRect(currentX * wscale, currentY * hscale, wscale, hscale);

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
    canvas_ctx.drawImage(image,0,0);
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
                    // ray: false,
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

start()

