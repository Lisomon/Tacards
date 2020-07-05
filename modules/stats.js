class Stats {



    constructor(arrSpielerNamen) {
        this.data = {
            "playerData": [],
            "playerWasTact": this.standardPlayerStructure(arrSpielerNamen),
            "cardWasTact": this.standardCardStructure(),
            "wasPlayedByTeufel": this.standardCardStructure(),
            "playerComesOut": this.standardPlayerStructure(arrSpielerNamen),
            "played4": this.standardPlayerStructure(arrSpielerNamen),
            "playedTrickser": this.standardPlayerStructure(arrSpielerNamen),
            "playedMaster": this.standardPlayerStructure(arrSpielerNamen),
            "playedTac": this.standardPlayerStructure(arrSpielerNamen),
            "rounds": 0
        }
        this.generateDataStructure(arrSpielerNamen);
    }

    generateDataStructure(arrSpielerNamen){
        for (const arrSpielerName of arrSpielerNamen) {
            this.data.playerData.push({
                "name": arrSpielerName,
                "gotDealt": this.standardCardStructure(),
                "getExchanged":this.standardCardStructure(),
                "didExchange": this.standardCardStructure(),
                "played": this.standardCardStructure(),
                "lostByNarr": this.standardCardStructure(),
                "gotByNarr": this.standardCardStructure()
            });
        }
    }

    standardCardStructure(){
        return {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
            10: 0,
            12: 0,
            13: 0,
            "Trickser": 0,
            "Engel": 0,
            "Teufel": 0,
            "Narr": 0,
            "Krieger": 0,
            "TAC": 0
        };
    }

    standardPlayerStructure(arrSpielerNamen){
        let oRet = {};
        for (const sSpielerName of arrSpielerNamen) {
            oRet[sSpielerName] = 0;
        }
        return oRet;
    }

    savePlayerData(pName, category, content){

        if (category === "played"){
            switch (content) {
                case "4":
                case 4:
                    this.saveGameData("played4", pName);
                    break;
                case "Trickser":
                    this.saveGameData("playedTrickser", pName);
                    break;
                case "Narr":
                case "Teufel":
                case "Engel":
                case "Krieger":
                    this.saveGameData("playedMaster", pName);
                    break;
                case "TAC":
                    this.saveGameData("playedTac", pName);
                    break;
            }
        }

        if (category === "gotDealt"){
            if (content.includes("1") || content.includes("13")) {
                this.saveGameData("playerComesOut", pName);
            }
        }

        for (const playerData of this.data.playerData) {
            if (playerData.name === pName){
                content = [].concat(content); //egal ob einzelner String oder Array kommt, danach ist es ein Array
                for (let i = 0; i < content.length; i++) {
                    playerData[category][content[i]] += 1;
                }
                break;
            }
        }
    }

    saveGameData(category, content){
        if (category === "rounds") {
            this.data[category] += 1;
        }else{
            this.data[category][content] += 1;
        }
    }

    generateStats(username){
        let oRet = {};
        for (const playerData of this.data.playerData) {
            if (playerData.name === username){
                oRet.playerData = this.playerDataHighestValue(playerData, this.data.rounds);
                break;
            }
        }

        oRet.cardWasTact = this.getHighestKey(this.data["cardWasTact"]);
        oRet.wasPlayedByTeufel = this.getHighestKey(this.data["wasPlayedByTeufel"]);
        oRet.mostOftenTact = this.getHighestKey(this.data["playerWasTact"]);
        oRet.comesOutPercentages = this.getComesOutPercentages(this.data["playerComesOut"], this.data["rounds"]);
        oRet.mostPlayedTacs = this.getHighestKey(this.data["playedTac"]);
        oRet.mostPlayedTricksers = this.getHighestKey(this.data["playedTrickser"]);
        oRet.mostPlayedMasters = this.getHighestKey(this.data["playedMaster"]);
        oRet.mostPlayedFours = this.getHighestKey(this.data["played4"]); // hier wäre ein name witzig wie "der Rückwärtsgangfahrer"

        return oRet;
    }

    getHighestKey(oData){
        let counter = -1;
        let aRet = [];
        for (const oKey in oData) {
            if (oData[oKey] > counter && oData[oKey] !== 0){
                counter = oData[oKey];
                aRet = [counter,oKey];
            }else if(oData[oKey] === counter){
               aRet.push(oKey);
            }
        }
        return aRet;
    }

    playerDataHighestValue(oData){
        let oRet = {};
        for (const obj in oData) {
            if (obj === "name"){
                oRet[obj] = oData[obj];
            }else{
                oRet[obj] = this.getHighestKey(oData[obj]);
            }

        }
        return oRet;
    }

    getComesOutPercentages(oData, pRounds){
        let oRet = {};
        let rounds = 1;
        if(pRounds > rounds){
            rounds = pRounds;
        }
        for (const obj in oData) {
            oRet[obj] = Math.floor((100 * oData[obj] / rounds));
        }
        return oRet;
    }

}


module.exports = Stats;
