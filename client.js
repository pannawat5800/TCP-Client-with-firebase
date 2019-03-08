
var admin = require('firebase-admin');
var serviceAccount = require('./serviceAccont/.....your sdk firebase admon ......');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "...your firebase url ......",
    //databaseAuthVariableOverride: null
});



var db = admin.database();
var ref = db.ref("/Location/FXJ000");



function clientSendMultipleData(client){
    client.connect(PORT, HOST, function(){
        console.log("connected");
        ref.orderByChild('floor').equalTo('floor1').once('value', function(snapshot){
            client.write('[')
            snapshot.forEach(function(data){
                var jsonForm = `{key:${data.key},name:${data.val().name},light:${data.val().light}}`;
                client.write(jsonForm+',');
            });
            client.write(']');
        });  
    })
}



function clientSendSingleData(client){
    ref.orderByChild('floor').equalTo('floor1').once('child_changed', function(snapshot){
        client.write('[')
        var jsonForm = `{key:${snapshot.key},name:${snapshot.val().name},light:${snapshot.val().light}}`;
        client.write(jsonForm);
        client.write(']');
    });
}


var net = require('net');
var client = net.Socket();
const HOST = '127.0.0.1';
const PORT = 1337;



client.connect(PORT, HOST, function(){
    console.log("connected");
});
ref.orderByChild('floor').equalTo('floor1').once('value', function(snapshot){
    
    var arrayList = new Array();
    snapshot.forEach(function(data){
        var json = {"key":data.key,"name":data.val().name,"light":data.val().light};
            //console.log(JSON.stringify(json));
        arrayList.push(JSON.stringify(json));
    });
    client.write('{"List":[');
    client.write(arrayList.toString());
    client.write(']}');
});  

ref.orderByChild("floor").equalTo("floor1").on("child_changed", function(snapshot){
    var json =  {"key":snapshot.key, "name": snapshot.val().name, "light": snapshot.val().light};
    client.connect(PORT, HOST, function(){
        client.write(JSON.stringify(json).toString());
    });
});
client.on('data', function(data){
    console.log("Data: " + data);
    client.destroy();
});

client.on('close', function(){
    console.log("Connection close");
});

