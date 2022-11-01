/**
 * @typedef {{hit_point:CCT.Vector3,hit_normal:CCT.Vector3,distance:Number}} Hit
 * @typedef {{name: string, shape, color: (Hit)=>Number[]}} Shape
 * @typedef {{pos: CCT.Vector3, dir: CCT.Vector3, lat:Number,lon:Number}} Ray
 */

// Orthographic settings
// let xleft =-5;
// let xright=5;
// let yleft =-5;
// let yright=5;

// Perspective settings
let xleft =180- -45;
let xright=180-  45;
let yleft =     -45;
let yright=      45;

/** @type {Shape[]} */
let shapes=[
    {
        name: "plane",
        shape: new CCT.Plane(new CCT.Vector3(0,-10,0),new CCT.Vector3(0,1,0)),
        color(hit) {
            return (Math.round(hit.hit_point.x/10)+Math.round(hit.hit_point.z/10))%2==0 ? [230,40,50] : [0,230,230];
        }
    },
    {
        name: "sphere",
        shape: new CCT.Sphere(new CCT.Vector3(0,-4,60),6),
        /**
         * 
         * @param {Hit} hit 
         */
        color(hit) {
            let pos=hit.hit_point;
            pos.y-=0.1
            // let dir=hit.hit_normal;
            let dir=new CCT.Vector3(0,-1,0);
            let [lon,lat]=cartesianToPolar(dir);
            let {x,y,z}=polarToCartesian(lon,lat,1);
            dir.x=x;
            dir.y=y;
            dir.z=z;
            /**@type {Ray} */
            let ray={dir,lat,lon,pos}
            let rayHit=castRay(new CCT.Ray(pos),dir);
            let shape=rayHit.shape;
            let new_hit=rayHit.hit;
            // if (new_hit) return lerp( 1 , [0,0,0], getColor(shape,new_hit));
            // else return [255,0,255];
            return lerpArray(0.6,[30,30,30],getColor(shape,new_hit,ray).color)
        }
    },
]

function ortho(x,y) {
    return new CCT.Vector3(
        map(x,0,width, xleft,xright),
        map(y,0,height,yleft,yright),
        0
    );
}

function perspective(x,y) {
    let lat=map(x,0,width, xleft,xright);
    let lon=map(y,0,height,yleft,yright);
    let dir = polarToCartesian(lon,lat,1);
    let dx=dir.y,
        dy=dir.x,
        dz=dir.z;
    return {dir:new CCT.Vector3(
        dx,dy,dz
    ),lat,lon};
}

/**
 * 
 * @param {CCT.Ray} pos 
 * @param {CCT.Vector3} dir 
 * @returns {{shape: Shape,hit: Hit}}
 */
function castRay(pos,dir) {
    let closestShape;
    let closestHit;

    shapes.forEach((item)=>{
        let a=CCT.cast(pos,dir,item.shape);
        if (a==null) return;
        if (!closestShape || closestHit.distance>=a.distance) {
            closestShape=item;
            closestHit=a;
        }
    });

    return {
        shape: closestShape,
        hit: closestHit,
    }
}

/**
 * 
 * @param {Shape} shape 
 * @param {Hit} hit 
 * @param {Ray} ray 
 * @returns {{light: Number,color: Number[]}}
 */
function getColor(shape,hit,ray) {
    if (!hit) {
        return {light:1,color:lerpArray( -ray.lon/30, [0,0,255] , [120,150,255] )}
    }
    // let light=1;
    // let light=map(hit.distance,0,100,2,0.5);
    let light=map( dist3( new CCT.Vector3(20,-5,50) , hit.hit_point) ,0,30,2,0.5);
    light=Math.max(0,light);

    
    
    let objColor=shape.color(hit);
    let color = [objColor[0]*light,objColor[1]*light,objColor[2]*light];

    return {light,color};
}

/**
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @returns {{
 *  ray: {
 *      pos: CCT.Vector3,
 *      dir: CCT.Vector3
 *      lat: Number,
 *      lon: Number,
 *  },
 *  hit: {
 *      hit_point: CCT.Vector3,
 *      hit_normal: CCT.Vector3,
 *      distance: Number,
 *  },
 *  color: Number[],
 *  light: Number,
 * }}
 */
function pixData(x,y) {
    let pos=new CCT.Ray(new CCT.Vector3(0,0,0));
    // let dir=new CCT.Vector3(0,0,1);
    let projection=perspective(x,y);

    let {shape,hit}=castRay(pos,projection.dir);    

    hit = hit || null;

    /** @type {Ray} */
    let ray={
        pos,
        dir:projection.dir,
        lat:projection.lat,
        lon:projection.lon,
    }

    let color=[0,0,0];
    let light=0;

    ({light,color}=getColor(shape,hit,ray));
    
    return {
        ray: {
            pos,
            dir:projection.dir,
            lat:projection.lat,
            lat:projection.lon,
        },
        hit,
        color,
        light,
    };
}

function pixColor(x,y) {
    // post process
    let c=pixData(x,y).color;
    for (let i=0; i<3;i++) {
        if (c[i]<0) {
            c[(i-1)%3]+=Math.abs(c[i])/2;
            c[(i+1)%3]+=Math.abs(c[i])/2;
        }
        if (c[i]>255) {
            c[(i-1)%3]+=(c[i]-255)/2;
            c[(i+1)%3]+=(c[i]-255)/2;
        }
    }
    return c;
}