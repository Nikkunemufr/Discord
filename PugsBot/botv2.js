const Discord = require('discord.js'),
    client = new Discord.Client({
        intents: ["GUILDS", "GUILD_MESSAGES",
            "GUILD_EMOJIS_AND_STICKERS",
            "GUILD_INTEGRATIONS",
            "GUILD_INVITES", "GUILD_VOICE_STATES",
            "GUILD_MESSAGE_REACTIONS"],
        fetchAllMembers: true,
        partials: ['MESSAGE', 'REACTION','CHANNEL']
    }),
    config = require('./config.json')

client.once('ready', () => {
    console.log('Ready!');
});

client.login(config.token)

client.on('message', (receivedMessage) => {
    if (receivedMessage.author == client.user) { // Prevent bot from responding to its own messages
        return
    }

    if (receivedMessage.content.startsWith("!")) {
        processCommand(receivedMessage)
    }

});

const rolesEmoji = {
    "MT":"🛡️",
    "OT":"🚀",
    "HS":"🔫",
    "FDPS":"⚔️",
    "MH":"💊",
    "FS":"🏥",
    "unjoin":"❌"};

let channel_id;
async function processCommand(receivedMessage) {
    channel_id = receivedMessage.channel.id;
    let fullCommand = receivedMessage.content.substr(1) // Remove the leading exclamation mark
    let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
    let primaryCommand = splitCommand[0] // The first word directly after the exclamation is the command
    let arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command
    let sender = receivedMessage.author

    console.log("Command received: " + primaryCommand)
    console.log("Arguments: " + arguments) // There may not be any arguments

    if (primaryCommand == "pugs") {
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Téki Pugs')
            .setAuthor('Nikkunēmu', "https://static-cdn.jtvnw.net/jtv_user_pictures/607e201c-2891-48ca-8208-c57336956dcc-profile_image-70x70.png")
            .setDescription('Choisissez votre role bande de salope \n'
                + rolesEmoji["MT"] + " pour Main Tank \n"
                + rolesEmoji["OT"] + " pour Off Tank \n"
                + rolesEmoji["HS"] + " pour Hitscan \n"
                + rolesEmoji["FDPS"] + " pour Flex DPS \n"
                + rolesEmoji["MH"] + " pour Main Heal \n"
                + rolesEmoji["FS"] + " pour Flex Heal \n"
                + "❌ pour te désinscrire \n")
            .setThumbnail('https://stockagehelloassoprod.blob.core.windows.net/images/logos/teki%20esport-9c35cdda328c4c8b9965e517ac642c11.png')
            .setTimestamp()
            .setFooter('Réalisé par Nikkunēmu', "https://static-cdn.jtvnw.net/jtv_user_pictures/607e201c-2891-48ca-8208-c57336956dcc-profile_image-70x70.png");

        let messageEmbed = await receivedMessage.channel.send({ embeds: [exampleEmbed] });
        messageEmbed.react(rolesEmoji["MT"]);
        messageEmbed.react(rolesEmoji["OT"]);
        messageEmbed.react(rolesEmoji["HS"]);
        messageEmbed.react(rolesEmoji["FDPS"]);
        messageEmbed.react(rolesEmoji["MH"]);
        messageEmbed.react(rolesEmoji["FS"]);
        messageEmbed.react("❌");

        client.on("messageReactionAdd", (reaction, user) => {
            const message = reaction.message;
            const member = message.guild.members.cache.get(user.id);
            const emoji = reaction.emoji.name;
            const channel = message.guild.channels.cache.find(c => c.id === channel_id);
            if (member.user.bot) return;
            console.log("pas de bot");
            console.log(user);
            if (Object.values(rolesEmoji).includes(emoji) && message.channel.id === channel.id) {
                switch (emoji) {
                    case rolesEmoji["MT"]:
                        joinCommand(user, ["MT","1"], receivedMessage);
                        break;
                    case rolesEmoji["OT"]:
                        joinCommand(user, ["OT","1"], receivedMessage);
                        break;
                    case rolesEmoji["HS"]:
                        joinCommand(user, ["HS","1"], receivedMessage);
                        break;
                    case rolesEmoji["FDPS"]:
                        joinCommand(user, ["FDPS","1"], receivedMessage);
                        break;
                    case rolesEmoji["MH"]:
                        joinCommand(user, ["MH","1"], receivedMessage);
                        break;
                    case rolesEmoji["FS"]:
                        joinCommand(user, ["FS","1"], receivedMessage);
                        break;
                    case rolesEmoji["unjoin"]:
                        unjoinCommand(user, receivedMessage);
                        break;
                }
            }
        });
    } else if (primaryCommand == "start") {
        startCommand(sender, receivedMessage)
    } else if (primaryCommand == "list") {
        listCommand(sender, receivedMessage)
    } else {
        helpCommand(sender, receivedMessage)
    }
}

const fs = require("fs");

let roleList = [];
for (var role in rolesEmoji) {
    if (rolesEmoji.hasOwnProperty(role)) {
        roleList.push(role);
    }
}
let dispo = JSON.parse(fs.readFileSync("./dispo.json", "utf8"));
let points = JSON.parse(fs.readFileSync("./points.json", "utf8"));

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

    let tampon = ""
    for (role in listrole) {
        tampon += rolesEmoji[listrole[role]]
    }
    console.log(tampon);
    return tampon
}

function arrayRemove(arr, value) {

    return arr.filter(function(ele){
        return ele != value;
    });

}

function helpCommand(sender, receivedMessage) {
    receivedMessage.channel.send("<@"+sender.id+">\n"+
        "Pour lancer un pug `!start` \n\n"+
        "Pour regarder les joueurs inscrits sur quel bloc et quel role `!list`\n\n"
    )
}

function joinCommand(sender, arguments, receivedMessage) {
    let length = getLength(dispo)

    index = contains(dispo, "userID", sender.id)
    console.log(index);
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
}

function unjoinCommand(sender, receivedMessage){

    i = 0
    while (i < getLength(dispo)) {
        if(dispo[i].userID == sender.id) {
            dispo[i]["blocs"] = []
            if(!(sender.id === "182206706292359168"))
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

function startCommand(sender, receivedMessage) {
    if(!(sender.id === "182206706292359168")) {
        receivedMessage.channel.send("<@"+sender.id+"> vous n'avez pas les droits pour lancer un pug")
        return
    }
    teamCombination(sender, "1", receivedMessage)
    stop()
}

function stop() {
    let x = getLength(dispo)
    console.log("length : " + getLength(dispo))
    while (x > -1) {
        delete dispo[x]
        x-=1
    }
    fs.writeFile('./dispo.json', JSON.stringify(dispo), (err) => {
        if (err) console.error(err);
    });
}

async function teamCombination(sender, bloc, receivedMessage) {
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

    let messageEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Répartition des roles pour le pug')
        .setAuthor('Nikkunēmu', "https://static-cdn.jtvnw.net/jtv_user_pictures/607e201c-2891-48ca-8208-c57336956dcc-profile_image-70x70.png")
        .setThumbnail('https://stockagehelloassoprod.blob.core.windows.net/images/logos/teki%20esport-9c35cdda328c4c8b9965e517ac642c11.png')
        .setTimestamp()
        .setFooter('Réalisé par Nikkunēmu', "https://static-cdn.jtvnw.net/jtv_user_pictures/607e201c-2891-48ca-8208-c57336956dcc-profile_image-70x70.png");

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
            //returnTxtpug += "<@"+presentPlayers[x] + "> pour le role de " + presentRoles[x] + "\n"
            let joueur = "<@"+presentPlayers[x] + ">";
            let role = String(rolesEmoji[presentRoles[x]]);
            messageEmbed.addField(name=joueur, value=role, inline=true)
        }
        //returnTxtpug += "Nombre de joueurs appelées : " + nbTotalPlayers + "\n"
        messageEmbed.setDescription(text="Nombre de joueurs appelées : " + nbTotalPlayers)
        client.user.setActivity("Pugs lancé !")
        //receivedMessage.channel.send(returnTxtpug)
        await receivedMessage.channel.send({ embeds: [messageEmbed] })

    } else {
        let returnTxtpug = "";
        for (var x = 0; x < listPlayers.length; x++){
            returnTxtpug += "<@"+listPlayers[x] + "> "
        }
        receivedMessage.channel.send(returnTxtpug + "Pugs annulés par manque de joueurs")

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


async function listCommand(sender, receivedMessage) {
    let i=0;
    let messageEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Joueurs inscrits au pug')
        .setAuthor('Nikkunēmu', "https://static-cdn.jtvnw.net/jtv_user_pictures/607e201c-2891-48ca-8208-c57336956dcc-profile_image-70x70.png")
        .setThumbnail('https://stockagehelloassoprod.blob.core.windows.net/images/logos/teki%20esport-9c35cdda328c4c8b9965e517ac642c11.png')
        .setTimestamp()
        .setFooter('Réalisé par Nikkunēmu', "https://static-cdn.jtvnw.net/jtv_user_pictures/607e201c-2891-48ca-8208-c57336956dcc-profile_image-70x70.png");
    while ( i < getLength(dispo) ) {
        let user = await client.users.fetch(dispo[i]["userID"]);
        let rolesUser = roleAffichageJolie(dispo[i]["roles"])
        messageEmbed.addField(name=user.username, value=rolesUser, inline=true)
        i++
    }
    messageEmbed.setDescription(text="Nombre de personnes inscrites : "+i)
    await receivedMessage.channel.send({ embeds: [messageEmbed] })
}


client.on('ready', () => {
    client.user.setActivity("Inscription aux pugs ouverte !")
})
