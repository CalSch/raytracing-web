let xleft =-5;
let xright=5;
let yleft =-5;
let yright=5;
let s=new CCT.Sphere(new CCT.Vector3(1,1,2),2);

function ortho(x,y) {
    return new CCT.Vector3(
        map(x,0,width, xleft,xright),
        map(y,0,height,yleft,yright)
    );
}

function perspective(x,y) {
    return new CCT.Vector3(
        map(x,0,width, xleft,xright),
        map(y,0,height,yleft,yright)
    )
}

function pix(x,y) {
    let ray=new CCT.Ray(perspective(x,y));
    let dir=new CCT.Vector3(0,0,1);
    let hit=CCT.cast(ray,dir,s);

    if (hit!==null) {
        let light=2-hit.distance;
        let color=[50,40,230];
        return [color[0]*light,color[1]*light,color[2]*light];
    }
    return [0,0,0]
}