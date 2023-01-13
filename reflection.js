/**
 * @typedef {{origin:CCT.Vector3,hit_point:CCT.Vector3,hit_normal:CCT.Vector3,distance:Number}} Hit
 * @typedef {{name: string, shape, color: (Hit)=>Number[]}} Shape
 * @typedef {{pos: CCT.Vector3, dir: CCT.Vector3, lat:Number,lon:Number}} Ray
 */

/**
 * @param {Hit} hit 
 * @param {Ray} ray 
 */
function reflection(hit,ray) {
    let pos=hit.hit_point;
    // let dir=hit.hit_normal;
    let dir=new CCT.Vector3(pos.x,pos.y,pos.z);
    let s=new Vec3(ray.pos).sub(new Vec3(ray.dir));
    let p=new Point(s.x,s.y,s.z);
    let axis={
        x: hit.hit_normal.x,
        y: hit.hit_normal.y,
        z: hit.hit_normal.z,
    }
    p.rotate(new Rotation(Math.PI/1,axis.x,axis.y,axis.z));
    dir.x=p.i;
    dir.y=p.j;
    dir.z=p.k;
    let [lon,lat]=cartesianToPolar(dir);
    let {x,y,z}=polarToCartesian(lon,lat,1);
    dir.x=x;
    dir.y=y;
    dir.z=z;
    /**@type {Ray} */
    let newRay={dir,lat,lon,pos}
    let rayHit=castRay(new CCT.Ray(pos),dir,["sphere"]);
    let shape=rayHit.shape;
    let new_hit=rayHit.hit;
    // if (new_hit) return lerp( 1 , [0,0,0], getColor(shape,new_hit));
    // else return [255,0,255];
    let colorData=getColor(shape,new_hit,ray)
    return {
        color:lerpArray(colorData.light/6,[0,0,0],colorData.color),

        extra:{
            dir,
            new_hit,
            shape:(shape||{}).name,
            axis,
        }
    }
}