const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const fs = require("fs");


let dispo = JSON.parse(fs.readFileSync("./dispo.json", "utf8"));
let points = JSON.parse(fs.readFileSync("./points.json", "utf8"));
let roleList = {"MT" : "Main Tank", "FT": "Flex Tank", "MD": "Main DPS", "FD": "Flex DPS", "MH": "Main Heal", "FH": "Flex Heal"};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


client.on('message', (receivedMessage) => {
    if (receivedMessage.author == client.user) { // Prevent bot from responding to its own messages
        return
    }
    
    if (receivedMessage.content.startsWith("!")) {
        processCommand(receivedMessage)
    }
    
    
})

function processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substr(1) // Remove the leading exclamation mark
    let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
    let primaryCommand = splitCommand[0] // The first word directly after the exclamation is the command
    let arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command
    let sender = receivedMessage.author
    
    console.log("Command received: " + primaryCommand)
    console.log("Arguments: " + arguments) // There may not be any arguments

    if (primaryCommand == "help") {
        helpCommand(sender, receivedMessage)
    } else if (primaryCommand == "join") {
        joinCommand(sender, arguments, receivedMessage)
    } else if (primaryCommand == "unjoin") {
        unjoinCommand(sender, receivedMessage)
    } else if (primaryCommand == "start") {
        startCommand(sender, arguments, receivedMessage)
    } else if (primaryCommand == "list") {
        listCommand(sender, arguments, receivedMessage)
    } else {
        receivedMessage.channel.send("Commande inconnue. Tape `!help`")
    }
}

function getLength(json) {
    let length = 0;
    for(var k in json) if(json.hasOwnProperty(k)) length++;
    return length
}

function contains(json, key, value) {
    let i = 0
    if(getLength(json) < 1){
        return -1
    }
    while (i<getLength(json)) {
        if (json[i][key] == value)
            return i
        i++
    }
    return -1
}

function isInList(item, list) {
    for ( ind in list ) {
        if (item == list[ind]) 
            return true
    }
    return false
}

function roleAffichageJolie(listrole) {
    let tampon = []
    for (item in listrole) {
        tampon.push(roleList[listrole[item].toUpperCase()])
    }
    return tampon
}

function arrayRemove(arr, value) {

   return arr.filter(function(ele){
       return ele != value;
   });

}

function helpCommand(sender, receivedMessage) {
    receivedMessage.channel.send("<@"+sender.id+">\n"+
    "liste des roles : `[MT : Main Tank, FT : Flex Tank, MD : Main DPS, FD : Flex DPS, MH : Main Heal, FH : Flex Heal]`\n\n "+
    "Pour rejoindre un créneau de pug `!join role bloc exemple : !join MT 1` \n\n"+
    "Les blocs des pugs sont des créneaux d'une heure `bloc 1 : 00h00 à 01h00, bloc 2 : 01h00 à 02h00, etc.`\n\n"+
    "Pour se retirer d'un créneau de pug `!unjoin` \n\n"+
    "Pour lancer un pug `!start nbBloc exemple : !start 1(ou all)`\n\n"+
    "Pour regarder les joueurs inscrits sur quel bloc et quel role `!list numeroBloc(ou all)`\n\n"
    )
}

function joinCommand(sender, arguments, receivedMessage) {
    let length = getLength(dispo)
    if (arguments.length != 2 || !(arguments[0].toUpperCase() in roleList)) {
        helpCommand(sender, receivedMessage)
        return
    }

    if (!(arguments[1] == "1" || arguments[1] == "2")) {
        receivedMessage.channel.send("<@"+sender.id+"> Les blocs disponibles sont les blocs 1 et 2 veuillez réessayez en choisissant l'un de ces deux blocs")
        return
    }
    index = contains(dispo, "userID", sender.id)
    console.log(index)
    if (index == -1) {
        dispo[length] = {
            userID : sender.id,
            roles: [arguments[0]],
            blocs : [arguments[1]],
        }
    }
    if (index != -1 && length > 0){
        if(!(dispo[index]["roles"].includes(arguments[0].toUpperCase()))){
            dispo[index]["roles"].push(arguments[0].toUpperCase())
        }
        if(!(dispo[index]["blocs"].includes(arguments[1]))){
            dispo[index]["blocs"].push(arguments[1])
        }
    }
    if (index == -1)
        index = length
    fs.writeFile('./dispo.json', JSON.stringify(dispo), (err) => {
        if (err) console.error(err);
    });

    if (!points[sender.id]) points[sender.id] = {
            participation:0
    }
    fs.writeFile('./points.json', JSON.stringify(points), (err) => {
        if (err) console.error(err);
    });
    receivedMessage.channel.send("<@"+sender.id+"> vous êtes inscrit pour le(s) role(s) **" + roleAffichageJolie(dispo[index]["roles"]) + "** pour le(s) bloc(s) **" + dispo[index]["blocs"].sort() + "**")
    
}

function unjoinCommand(sender, receivedMessage){
    
    i = 0
    while (i < getLength(dispo)) {
        if(dispo[i].userID == sender.id) {
            dispo[i]["blocs"] = []
            if(!(sender.id === "202076845615611904" || sender.id === "265816057183338497"))
                dispo[i]["roles"] = []
            break
        }
        
        i++
    }
    fs.writeFile('./dispo.json', JSON.stringify(dispo), (err) => {
        if (err) console.error(err);
    });
    receivedMessage.channel.send("<@"+sender.id+"> vous êtes désinscris de tout les blocs pour tout les roles") 
}

function startCommand(sender, arguments, receivedMessage) {
    if (arguments.length != 1) {
        helpCommand(sender, receivedMessage)
        return
    }

    if(!(sender.id === "202076845615611904" || sender.id === "265816057183338497" || sender.id === "182206706292359168")) {
        receivedMessage.channel.send("<@"+sender.id+"> vous n'avez pas les droits pour lancer un pug") 
        return
    }
    if (arguments[0] == "all") {
        teamCombination(sender, "1", receivedMessage)
        teamCombination(sender, "2", receivedMessage)
    } else {
        teamCombination(sender, String(arguments[0]), receivedMessage)  
    } 
    stop()
}

function stop() {
    let x = getLength(dispo)
    console.log("length : " + getLength(dispo))
    while (x > -1) {
        console.log(x)
        if (x < 3) 
            dispo[x]["blocs"] = []
        else
            delete dispo[x] 
        x-=1
    }
    fs.writeFile('./dispo.json', JSON.stringify(dispo), (err) => {
        if (err) console.error(err);
    });
}

function teamCombination(sender, bloc, receivedMessage) {
    let listPlayers = []
    let listRole = []
    let listBloc = []
    let i=0
    while (i < getLength(dispo)) {
        listPlayers.push(dispo[i]["userID"])
        listRole.push(dispo[i]["roles"])
        listBloc.push(dispo[i]["blocs"])
        i++
    }
    console.log(listPlayers)
    console.log(listRole)
    console.log(listBloc)
    //trier tableau par role par rapport au nombre de participation
    let nbPlayers = 6
    let deuxTeams = {"players": [], "roles": []}
    let presentPlayers = []
    let presentRoles = []
    
    
    while ( nbPlayers > 3){ 
    console.log(deuxTeams)
    console.log(deuxTeams.length)
        if (deuxTeams["players"] != []) {
            presentPlayers = [].concat.apply([], deuxTeams["players"]);
            console.log(presentPlayers);
            presentRoles = [].concat.apply([], deuxTeams["roles"]);
            console.log(presentRoles);
        }
        
        if( deuxTeams["players"].length == 2)
            break
        
        Team = Backtracking(listPlayers, listRole, listBloc, {"players":[], "roles":[]}, bloc, nbPlayers, presentPlayers)
        if (Team != {}) {
            deuxTeams["players"].push(Team["players"])
            deuxTeams["roles"].push(isRoleMatchWithTeam(Team["roles"]))
        } else {
            nbPlayers--
        }
        
    }
    console.log(deuxTeams)
    let nbTotalPlayers = 0
    for ( var j = 0; j < deuxTeams["players"].length; j++) {
        if( !(deuxTeams["roles"][j] == undefined) || deuxTeams["roles"][j] != []) {
            nbTotalPlayers += deuxTeams["roles"][j].length
        }
    }
    let returnTxtpug = "Les convoqués pour le bloc "+ bloc +" sont : \n\n"
    if (nbTotalPlayers > 9 ){ 
        for (var x = 0; x < presentRoles.length; x++){
            returnTxtpug += "<@"+presentPlayers[x] + "> pour le role de " + presentRoles[x] + "\n"
        }
        returnTxtpug += "Nombre de joueurs appelées : " + nbTotalPlayers + "\n"
        client.user.setActivity("Pugs lancé !")
        receivedMessage.channel.send(returnTxtpug)
        
    } else {
        receivedMessage.channel.send("@everyone Pugs annulés pour le bloc " + bloc + " par manque de joueurs") 
        
    }
    console.log(nbTotalPlayers)
    console.log("Deleting people playing this bloc")
}
function canPlayBloc(bloc, playerBlocs) {
    if ( playerBlocs.indexOf(bloc) == -1 )
        return false
    return true
}

var getCombinations = function(allOptionsArray, combination) {
    if(allOptionsArray.length > 0) {
        for(var i=0; i < allOptionsArray[0].length; i++) {
            var tmp = allOptionsArray.slice(0);
            combination.codes[combination.counter] = allOptionsArray[0][i];
            tmp.shift();
            combination.counter++;
            getCombinations(tmp, combination);
        }
    } else {
        var combi = combination.codes.slice(0);
        combination.result.push(combi);
    }
    combination.counter--;
}

const unique = (value, index, self) => {
  return self.indexOf(value) === index
}

function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

function isRoleMatchWithTeam(roleEquipe) {
    // Si j'ai déjà une combinaison de role de l'équipe et que le joueur n'apporte aucun role nouveau je le vire
    if (roleEquipe == undefined)
        return []
    let combination = {codes : [], result : [], counter : 0}
    getCombinations(roleEquipe, combination)
    for(let i=0; i < combination.result.length; i++) {
        if(combination.result[i].filter(unique).length == roleEquipe.length)
            return combination.result[i]
    }
    return []
}

function teamComplete(equipe, maxPlayers){
    //Est-ce que avec cette équipe, j'ai bien maxPlayers role differents
    if (equipe["players"] == undefined || equipe["roles"] == undefined)
        return false
    
    if (equipe["players"].length == maxPlayers){
        let combination = {codes : [], result : [], counter : 0};
        getCombinations(equipe["roles"], combination)
        for(let i=0; i < combination.result.length; i++) {
            if(combination.result[i].filter(unique).length == equipe["players"].length)
                return true
        }
    }     
    return false
}

function playerAlreadyPicked(player, playersPicked) {
    if (playersPicked == [])
        return false
    if(playersPicked.indexOf(player) == -1)
        return false
    return true
}

function Backtracking(listPlayers, listRoles, listBloc, equipe, bloc, maxPlayers, presentPlayers){
    if (equipe["players"].length == maxPlayers) {
        return equipe
    }
    
    let i = 0
    while (i < listPlayers.length) {
        equipe["players"].push(listPlayers[i])
        equipe["roles"].push(listRoles[i])
        solutionRole = isRoleMatchWithTeam(equipe["roles"])
        if ( !(playerAlreadyPicked(listPlayers[i],presentPlayers)) && canPlayBloc(bloc, listBloc[i]) && (solutionRole != [])) {
            console.log("can? : "  + canPlayBloc(bloc, listBloc[i]))
            newListPlayers = removeA([...listPlayers],listPlayers[i])
            newListRoles = removeA([...listRoles],listRoles[i])
            newLlistBloc = removeA([...listBloc],listBloc[i])
            equipeFinal = Backtracking(newListPlayers, newListRoles, newLlistBloc, equipe, bloc, maxPlayers, presentPlayers)
            if ( teamComplete(equipeFinal, maxPlayers) )
                return equipeFinal
        } 
        equipe["players"].pop()
        equipe["roles"].pop()
        i++
    }
    return {}
}

function addParticipation(listplayers){
    for ( player in  listplayers ) {
        points[player].participation++;
    }
    fs.writeFile('./points.json', JSON.stringify(points), (err) => {
        if (err) console.error(err);
    });
}

function listCommand(sender, arguments, receivedMessage) {
    if (arguments.length != 1) {
        helpCommand(sender, receivedMessage)
        return
    }
    
    i=0
    let tampon = "Pseudo         |  Roles                    |  Blocs \n"

    while ( i < getLength(dispo) ) {
        tampon += "-----------------------------------------------------\n"
        if ( arguments[0] == "all" )
            tampon += client.users.get(dispo[i]["userID"]).username + "  |  " + roleAffichageJolie(dispo[i]["roles"]).sort() + "  |  " +  dispo[i]["blocs"].sort() + "\n"
        else if ( isInList(arguments[0],dispo[i]["blocs"]) )
            tampon += client.users.get(dispo[i]["userID"]).username + "  |  " + roleAffichageJolie(dispo[i]["roles"]).sort() + "  |  " +  arguments[0] + "\n"
        i++
    }
    tampon += "-----------------------------------------------------\n"
    tampon += "Nombre de personnes inscrites : " + i
    receivedMessage.channel.send(tampon)
}

function chooseCaptain(){
    return
}

client.on('ready', () => {
    client.user.setActivity("Inscription aux pugs ouverte !")
})

client.login(auth.token);
