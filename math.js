function lerp (i,a,b){
    return (1-i)*a+i*b;
}
function map(i,in_min, in_max, out_min, out_max) {
    return (i - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}