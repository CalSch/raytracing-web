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

let s=new CCT.Sphere(new CCT.Vector3(0,0,5),2);
// let f=new CCT.Plane(new CCT.Vector3(),new CCT.Vector3());

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

function pix(x,y) {
    let ray=new CCT.Ray(new CCT.Vector3(0,0,0));
    // let dir=new CCT.Vector3(0,0,1);
    let dir=perspective(x,y).dir;
    let hit=CCT.cast(ray,dir,s);

    if (hit!==null) {
        let light=5-hit.distance;
        let color=[50,40,230];
        return [color[0]*light,color[1]*light,color[2]*light];
    }
    return [0,0,0]
}