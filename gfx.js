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

// let s=new CCT.Sphere(new CCT.Vector3(0,0,5),2);
let s=new CCT.Plane(new CCT.Vector3(0,-10,0),new CCT.Vector3(0,1,0));

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
    let dx=dir.x,
        dy=dir.y,
        dz=dir.z;
    return {dir:new CCT.Vector3(
        dx,dy,dz
    ),lat,lon};
}

/**
 * 
 * @param {*} x 
 * @param {*} y 
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
 *  color: Number[]
 * }}
 */
function pixData(x,y) {
    let ray=new CCT.Ray(new CCT.Vector3(0,0,0));
    // let dir=new CCT.Vector3(0,0,1);
    let projection=perspective(x,y);
    let hit=CCT.cast(ray,projection.dir,s);

    let color=[0,0,0];

    if (hit!==null) {
        let light=5-hit.distance;
        let objColor=[50,40,230];
        color = [objColor[0]*light,objColor[1]*light,objColor[2]*light];
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
    };
}

function pixColor(x,y) {
    return pixData(x,y).color;
}