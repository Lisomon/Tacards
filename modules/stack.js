const Utils = require("./utils");
const UTILS = new Utils();

class Stack {
    get stack() {
        return this._currentStack;
    }

    get length() {
        return this._currentStack.length;
    }

    set stack(value) {
        this._currentStack = value;
    }
    get hardCardStack() {
        return this._hardCardStack;
    }

    set hardCardStack(value) {
        this._hardCardStack = value;
    }

    constructor() {
        this._hardCardStack = ["1","1","1","1","1","1","1","1","1","2","3","4","5","6","2","3","4","5","6","2","3","4","5","6","2","3","4","5","6","2","3","4","5","6","2","3","4","5","6","2","3","4","5","6","7","7","7","7","7","7","7","7","8","9","10","12","8","9","10","12","8","9","10","12","8","9","10","12","8","9","10","12","8","9","10","12","8","9","10","12","13","13","13","13","13","13","13","13","13","TAC","TAC","TAC","TAC","Trickser","Trickser","Trickser","Trickser","Trickser","Trickser","Trickser","Narr","Teufel","Engel","Krieger"];
        //Debug-Kartensets
        //this.hardCardStack = ["8","9","10","12","8","9","10","12","Narr","Narr","Narr","12","13","13","13","13","13","13","13","13","13","TAC","TAC","TAC","TAC","Trickser","Trickser","Trickser","Teufel","Teufel","Teufel","Teufel","Teufel","Teufel","Engel","Krieger"];
        //this.hardCardStack = ["1","1","1","1","1","1","1","1","1","2","3","4","5","6","2","3","4","5","6","2","3","4","5","6","2","3","4","5","6","2","3","4","5","6","2","3","4","5","6","2","3","13","13","13","13","13","13","13","13","13","TAC","TAC","TAC","TAC","Trickser","Trickser","Trickser","Trickser","Trickser","Trickser","Trickser","Narr","Teufel","Engel","Krieger"];

        this._currentStack = [];
        this.reset();
    }

    getCard(){
        let random = (Math.random() * (this.length - 1)) + 1;
        return this.stack.splice(random - 1,1)[0];
    }

    shuffle(){
        this.stack = UTILS.shuffleArray(this.stack);
    }

    reset(){
        this.stack = this._hardCardStack.concat();
        this.shuffle();
    }

    isStackNew(){
        return this._hardCardStack.length === this._currentStack.length;
    }

}


module.exports = Stack;




