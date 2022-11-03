

class Vec3 {
    /** @type {number} */x
    /** @type {number} */y
    /** @type {number} */z

    /**
     * @param {Vec3 | CCT.Vector3 | number | undefined} v1
     * @param {number | undefined} v2
     * @param {number | undefined} v3
     */
    constructor(v1, v2, v3) {
        if (v1 instanceof CCT.Vector3) {
            this.x = v1.x;
            this.y = v1.y;
            this.z = v1.z;
        } else if (v1 instanceof Vec3) {
            this.x = v1.x;
            this.y = v1.y;
            this.z = v1.z;
        } else if (v1 instanceof Number && v2 instanceof Number && v3 instanceof Number) {
            this.x = v1;
            this.y = v2;
            this.z = v3;
        } else {
            this.x = this.y = this.z = 0;
        }
    }

    /**
     * Adds 2 vectors together
     * @param {Vec3} v 
     * @returns Vec3
     */
    add(v) {
        return new Vec3(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z,
        )
    }
    /**
     * Subtracts 2 vectors
     * @param {Vec3} v 
     * @returns Vec3
     */
    sub(v) {
        return new Vec3(
            this.x - v.x,
            this.y - v.y,
            this.z - v.z,
        )
    }

    /**
     * Multiplies 2 vectors, or a vector and a number
     * @param {Vec3 | number} v
     * @returns Vec3
     */
    mul(v) {
        return new Vec3(
            this.x * (v.x ?? v),
            this.y * (v.y ?? v),
            this.z * (v.z ?? v),
        )
    }

    /**
     * Divides 2 vectors, or a vector and a number
     * @param {Vec3 | number} v
     * @returns Vec3
     */
    div(v) {
        return new Vec3(
            this.x / (v.x ?? v),
            this.y / (v.y ?? v),
            this.z / (v.z ?? v),
        )
    }
}