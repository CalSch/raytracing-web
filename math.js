function lerp (i,a,b){
    return (1-i)*a+i*b;
}
function lerpArray(i,a,b) {
    let r=[];
    a.forEach((item,index)=>{
        r.push(lerp(i,item,b[index]))
    })
    return r;
}

function map(i,in_min, in_max, out_min, out_max) {
    return (i - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
function mapArray(i,in_min, in_max, out_min, out_max) {
    let r=[];
    i.forEach((item)=>{
        r.push(map(item,in_min,in_max,out_min,out_max));
    })
    return r;
}

function dist2(x1,y1,x2,y2) {
    return Math.sqrt(
        (x2-x1)**2 +
        (y2-y1)**2
    )
}

function dist3(v1,v2) {
    return Math.sqrt(
        (v2.x-v1.x)**2 +
        (v2.y-v1.y)**2 +
        (v2.z-v1.z)**2
    )
}

function clamp(x,min,max) {
    return Math.max(Math.min(x,max),min)
}

function clampArray(x,min,max) {
    let a=[]
    x.forEach(i=>{
        a.push(clamp(i,min,max))
    })
    return a
}

class Quaternion {
	constructor(r, i, j, k) {
		this.r = r;
		this.i = i;
		this.k = k;
		this.j = j;
	}
	static mult(q1, q2) {
		var r = q1.r * q2.r - q1.i * q2.i - q1.j * q2.j - q1.k * q2.k;
		var i = q1.r * q2.i + q1.i * q2.r + q1.j * q2.k - q1.k * q2.j;
		var j = q1.r * q2.j - q1.i * q2.k + q1.j * q2.r + q1.k * q2.i;
		var k = q1.r * q2.k + q1.i * q2.j - q1.j * q2.i + q1.k * q2.r;
		return new Quaternion(r, i, j, k);
	}
	static inv(q) {
		return new Quaternion(q.r, -q.i, -q.j, -q.k);
	}
}

class Point {
	constructor(xPos, yPos, zPos) {
		this.r = 0;
		this.i = xPos;
		this.j = yPos;
		this.k = zPos;
	}
	rotate(rotation) {
		var q = Quaternion.mult(Quaternion.mult(rotation, this), Quaternion.inv(rotation));
		this.i = q.i;
		this.j = q.j;
		this.k = q.k;
	}
}

const Rotation = function(angle, x, y, z) {
	const scaleFactor = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
	const c = Math.sin(angle / 2) / (scaleFactor || 1);
	return new Quaternion(Math.cos(angle / 2), c * x, c * y, c * z);
}