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

let s=new CCT.Plane(new CCT.Vector3(0,-10,0),new CCT.Vector3(0,1,0));
let s2=new CCT.Sphere(new CCT.Vector3(0,-10,400),1);
let shapes=[
    {
        name: "plane",
        shape: new CCT.Plane(new CCT.Vector3(0,-10,0),new CCT.Vector3(0,1,0)),
        color(hit) {
            return Math.round(hit.hit_point.x/10)%2==0 ? [230,40,50] : [50,40,230];
        }
    },
    {
        name: "sphere",
        shape: new CCT.Sphere(new CCT.Vector3(0,-4,60),6),
        color(hit) {
            let
            // return [0,255,0];
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
    let lon=map(y,0,width, yleft,yright);
    let radius=1;
    let dir = polarToCartesian(lon,lat,radius);
    let dx=dir.y,
        dy=dir.x,
        dz=dir.z;
    return {dir:new CCT.Vector3(
        dx,dy,dz
    ),lat,lon};
}

/**
 * 
 * @param {CCT.Vector3} pos 
 * @param {CCT.Vector3} dir 
 * @returns {shape,hit}
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
 * @param {*} shape 
 * @param {*} hit 
 * @returns {light,color}
 */
function getColor(shape,hit) {
    let light=map(hit.distance,0,100,2,0.5);
    // light=map( dist3( new CCT.Vector3(10,-5,20) , hit.hit_point) ,0,20,2,0.5);
    
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
    let ray=new CCT.Ray(new CCT.Vector3(0,0,0));
    // let dir=new CCT.Vector3(0,0,1);
    let projection=perspective(x,y);

    let {shape,hit}=castRay(ray,projection.dir);

    hit = hit || null;



    let color=[0,0,0];
    let light=0;

    if (hit!==null) {
        ({light,color}=getColor(shape,hit));
    }
    return {
        ray: {
            pos:ray,
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
    return pixData(x,y).color;
}