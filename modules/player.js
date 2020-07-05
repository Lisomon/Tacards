class Player {
    get length() {
        return this._hand.length;
    }
    get position() {
        return this._position;
    }

    set position(value) {
        this._position = value;
    }
    get receivingCard() {
        return this._receivingCard;
    }

    set receivingCard(value) {
        this._receivingCard = value;
    }
    get hand() {
        return this._hand;
    }

    set hand(value) {
        this._hand = value;
    }
    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }
    constructor(pName, pPosition) {
        this._name = pName;
        this._hand = [];
        //Karte die man durch das Tauschen erhalten wird, sobald jeder eine gewählt hat
        this._receivingCard = "";
        this._position = pPosition;
    }

    spliceCard(pCard){
        for (let i = 0; i < this.length; i++) {
            if (pCard === this._hand[i]){
                return this._hand.splice(i,1)[0];
            }
        }
    }

    addToHand(card){
        this._hand.push(card)
    }

    addReceivingCard(){
        this.addToHand(this.receivingCard);
        this._receivingCard = "";
    }

    hasReceivingCard(){
        return this.receivingCard !== "";
    }

    bComesout(){
        for (let i = 0; i < this._hand.length; i++) {
            if (this._hand[i] === "1" || this._hand[i] === "13"){
                return true;
            }
        }
        return false;
    }
}

module.exports = Player;
