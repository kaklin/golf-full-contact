export class Vec {
    constructor(x, y) {
        this.x = x,
        this.y = y
    }
}


export const magnitude = (vec) => {
    return Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2));
}

export const normalize = (vec) => {
    const mag = magnitude(vec);
    if (mag == 0) {
        return new Vec(0,0)
    }
    return new Vec(vec.x / mag, vec.y / mag);
}

export const scale = (vec, k) => {
    return new Vec(vec.x * k, vec.y * k);
}

export const capForce = (s, e, cap) => {
    let f = null;
    let d = distance(s, e);
    let norm = normalize(new Vec(s.x-e.x, s.y-e.y))
    let scaled = 0;
    if (d < 20) {
        scaled = scale(norm, 0);
    } else if (d < cap) {
        scaled = scale(norm, d);
    } else {
        scaled = scale(norm, cap);
    }

    f = {
        x: (scaled.x) * 0.0005, //* ball.mass,
        y: (scaled.y) * 0.0005 //* ball.mass
    }

    return f
}

export const distance = (a, b) => {
    let dx = a.x-b.x;
    let dy = a.y-b.y;
    return Math.sqrt((dx*dx)+(dy*dy));
}

