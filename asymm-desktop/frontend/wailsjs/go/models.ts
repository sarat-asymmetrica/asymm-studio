export namespace main {
	
	export class Particle {
	    x: number;
	    y: number;
	    velX: number;
	    velY: number;
	    color: string;
	
	    static createFrom(source: any = {}) {
	        return new Particle(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.x = source["x"];
	        this.y = source["y"];
	        this.velX = source["velX"];
	        this.velY = source["velY"];
	        this.color = source["color"];
	    }
	}
	export class Quaternion {
	    W: number;
	    X: number;
	    Y: number;
	    Z: number;
	
	    static createFrom(source: any = {}) {
	        return new Quaternion(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.W = source["W"];
	        this.X = source["X"];
	        this.Y = source["Y"];
	        this.Z = source["Z"];
	    }
	}
	export class Theme {
	    background: string;
	    text: string;
	    accent: string;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new Theme(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.background = source["background"];
	        this.text = source["text"];
	        this.accent = source["accent"];
	        this.name = source["name"];
	    }
	}

}

