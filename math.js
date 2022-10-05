function lerp (i,a,b){
    return (1-i)*a+i*b;
}
function map(i,in_min, in_max, out_min, out_max) {
    return (i - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function dist3(v1,v2) {
    return Math.sqrt(
        (v2.x-v1.x)**2 +
        (v2.y-v1.y)**2 +
        (v2.z-v1.z)**2
    )
}