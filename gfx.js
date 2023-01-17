/**
 * @typedef {{origin:CCT.Vector3,hit_point:CCT.Vector3,hit_normal:CCT.Vector3,distance:Number}} Hit
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
        color(hit,ray) {
            let {x,y,z}=hit.hit_point || {x:0,y:0,z:0};
            // x+=10;
            // z+=10;
            // return [
            //     (x*10)+10,
            //     (z*1)+10,
            //     0
            // ];
            // return reflection(hit,ray);
            return {
                color:(Math.round(hit.hit_point.x/10)+Math.round(hit.hit_point.z/10))%2==0 ? [230,40,50] : [0,230,230]
            };
        }
    },
    {
        name: "small_sphere",
        shape: new CCT.Sphere(new CCT.Vector3(-13,-8,40),2),
        color(hit,ray) {
            return {color:[145,10,80]}
        }
    },
    {
        name: "sphere",
        shape: new CCT.Sphere(new CCT.Vector3(0,0,60),10),
        /**
         * 
         * @param {Hit} hit 
         * @param {Ray} ray 
         */
        color(hit,ray) {
            return reflection(hit,ray)
        }
    },
]

let lightPos=new Vec3(20,-10,50);

function ortho(x,y) {
    return new CCT.Vector3(
        map(x,0,width, xleft,xright),
        map(y,0,height,yleft,yright),
        0
    );
}

function perspective(x,y,jitter) {
    jitter=jitter??0;
    let lat=map(x,0,width, xleft,xright)+Math.random()*jitter;
    let lon=map(y,0,height,yleft,yright)+Math.random()*jitter;
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
 * @param {string[] | undefined} exclude
 * @returns {{shape: Shape,hit: Hit}}
 */
function castRay(pos,dir,exclude) {
    let closestShape;
    let closestHit;

    shapes.forEach((item)=>{
        let a=CCT.cast(pos,dir,item.shape);
        if (a==null || (exclude ? exclude.indexOf(item.name)!=-1 : false)) return;
        if (!closestShape || closestHit.distance>=a.distance) {
            closestShape=item;
            closestHit=a;
        }
    });

    return {
        shape: closestShape,
        hit: closestHit,
        origin: pos,
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
        let skyColor=lerpArray(-ray.lat/100,[255,0,0],[0,0,255])
        return {light:lerp(-ray.lon/30,1,2),
            color:lerpArray( -ray.lon/30, skyColor , [120,150,255] )
        }
    }
    let light=1;
    // let light=map(hit.distance,0,100,2,0.5);
    light=map( dist3( new CCT.Vector3(20,-5,50) , hit.hit_point) ,10,28,1.5,0.5);
    light=Math.max(0.05,light);

    {
        let shadow_dir=lightPos.sub(new Vec3(hit.hit_point)).toCCTVector()
        let shadow_cast=castRay(new CCT.Ray(hit.hit_point),shadow_dir,[shape.name])
        if (shadow_cast.hit && shadow_cast.hit.distance<dist3(shadow_cast.hit.hit_point,lightPos)) {
            // light=0;
        }
        let normal=new Vec3(hit.hit_normal)
        let light_norm=new Vec3(1,1,-1)
        light+=map(
            dist2(normal.lat,normal.lon,light_norm.lat,light_norm.lon),
            0,180,
            1,0
        )
    }
    
    let colorData=shape.color(hit,ray);
    let objColor=colorData.color
    let color = [objColor[0]*light,objColor[1]*light,objColor[2]*light];

    return {light,color,extra:colorData.extra};
}

let dataCache={};

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
 *  extra: any,
 * }}
 */
function pixData(x,y) {
    if (`${x},${y}` in dataCache) {
        return dataCache[`${x},${y}`];
    }
    let pos=new CCT.Ray(new CCT.Vector3(-10,-5,20));

    let color=[0,0,0];
    let light=0;
    let extra={};

    // let dir=new CCT.Vector3(0,0,1);
    let samples=5;
    for (let i=0;i<samples;i++) {
        let projection=perspective(x,y,1/6);
    
        let {shape,hit}=castRay(pos,projection.dir);
    
        hit = hit || null;
    
        /** @type {Ray} */
        let ray={
            pos,
            dir:projection.dir,
            lat:projection.lat,
            lon:projection.lon,
        }
    
        let newColor=[0,0,0];
        let newLight=0;
        ({light:newLight,color:newColor}=getColor(shape,hit,ray));

        newColor=newColor || [0,0,0];

        color[0]+=newColor[0];
        color[1]+=newColor[1];
        color[2]+=newColor[2];
        // color[1]+=100;
        
        light+=newLight;
        // light/=2;
    }

    color[0]/=samples;
    color[1]/=samples;
    color[2]/=samples;

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

    extra=getColor(shape,hit,ray).extra ?? {}

    if (!(`${x},${y}` in dataCache)) {
        dataCache[`${x},${y}`]={
            ray: {
                pos,
                dir:projection.dir,
                lat:projection.lat,
                lon:projection.lon,
            },
            hit,
            color,
            light,
            extra,
        }
    }

    return {
        ray: {
            pos,
            dir:projection.dir,
            lat:projection.lat,
            lon:projection.lon,
        },
        hit,
        color,
        light,
        extra,
    };
}

function pixDepth(x,y) {
    let data=pixData(x,y)
    let d=0;
    if (data.hit && data.hit.distance) {
        d=data.hit.distance;
    }

    return d;
}

function pixLight(x,y) {
    let data=pixData(x,y)
    let l=data.light*18;

    return l;
}

function pixNormal(x,y) {
    let data=pixData(x,y)
    let n=new CCT.Vector3(0,0,0);
    if (data.hit && data.hit.hit_normal) {
        n=data.hit.hit_normal;
    }
    return new Vec3(n)
}

function pixColor(x,y) {
    // let d=pixLight(x,y)
    // let c=[d,d,d]
    let c=pixData(x,y).color;
    // let n=pixNormal(x,y);
    // let c=[
    //     n.x*20,
    //     n.y*20,
    //     n.z*20
    // ];
    // for (let i=0; i<3;i++) {
    //     if (c[i]<0) {
    //         c[(i-1)%3]+=Math.abs(c[i])/2;
    //         c[(i+1)%3]+=Math.abs(c[i])/2;
    //     }
    //     if (c[i]>255) {
    //         c[(i-1)%3]+=(c[i]-255)/2;
    //         c[(i+1)%3]+=(c[i]-255)/2;
    //     }
    // }
    return c;
}
