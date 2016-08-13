function testAssert(condition: boolean, message:string) {
	if (!condition)
		throw new Error("Test failed: " + message)
}

function consoleLog(message: string) {
	console.log(message)
}

let QBnumber = 2
let QBstring = "OK"

function QFaddone(x:number) {
	return x + 1
}

class QCorder {
	grand: QCgrand
	constructor() {
		this.grand = new QCgrand("silver")
	}
}

class QCbase {
	num1:number
	str2:string

	add2(x:number) { return x + 2 }
}

class QCchild extends QCbase {
	num3:number
	str4:string
	constructor(ok:string) {
		super()
		this.num3 = 3
		this.str4 = ok
	}
	addNum(y:number) { this.num3 += y }

	static numStatic1: number = 60
	static numStatic2(q: number) {
		return 70 + q
	}
}

class QCgrand extends QCchild {
	addStr(y:string) { return this.str4 + y }
}

let QIchild = new QCchild("3")

let QAarray : QCbase[]

class QCgeneric<T> {
	x: T
}

let QIgeneric : QCgeneric<number>

class QCrecursive1 {
	a1: QCrecursive2
}

class QCrecursive2 {
	constructor(public a2 : QCrecursive1) {
		a2.a1 = this
	}
}

let QFvaraddten = (x:number) => x + 10

let QFvarcallback : (x: number, y: (z: number) => number) => number

QFvarcallback = (x, y) => y(x + 1) + 1

// TODO: Right now we erase mutually exclusive types, but pass through variables typed as one of the erased types 
// let XR = new XREC2(new XREC1())

// Ugly way to access global variable
let QFbackflow = () : number => (<any>this).QBbackflow

// A pattern lib.d.ts frequently follows.
interface QCproto {
	num5: number
	func6(v: number) : number
}

interface QCprototheconstructor {
	new (value: number): QCproto
	prototype: QCproto
	numStatic3: number
	numStatic4(q: number) : number
}

class QCimplforproto implements QCproto {
	constructor(public num5: number) {}
	func6(v:number) { return this.num5 + v }
	static numStatic3: number = 80
	static numStatic4(q: number) {
		return 90 + q
	}
}

var QCproto: QCprototheconstructor = QCimplforproto
