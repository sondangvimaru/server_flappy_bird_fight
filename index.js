var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var fs = require("fs");

server.listen(process.env.PORT || 3000);
app.get("/", function(req, res){
	res.sendFile(__dirname + "/index.html");	
});
var userArray=[]
var arrfight=[]
var u1
var u2
io.sockets.on('connection',function(socket)
{

    socket.on("user-online",function(data){

       var res= data.split(" ");
    userArray.push(new user(res[0]+" ",res[1]+" ",res[2]+" ",socket));
    console.log("co nguoi ket noi:"+userArray[0]._name);


    });
   

    
    socket.on("tim-tran",function(data){


 var vitri=0;

for(i=0;i<userArray.length;i++)
{
   if(userArray[i]._id.trim()==data.trim()&& userArray[i].timtran==0)
   {
       userArray[i].timtran=1;
       u1=userArray[i];
       vitri=i;
       
       console.log(userArray[i]._name+":dang tim tran");
        break;
   } 


}


for(j=0;j<userArray.length;j++)
{
   if(userArray[j].timtran==1 && userArray[j].playing==0 && j!=vitri)
   {
   
    userArray[vitri].playing=1

    userArray[j].playing=1;
    userArray[vitri].timtran=0;

    userArray[j].timtran=0;

   
    
var id_sum=  Number(userArray[vitri]._id)+ Number(userArray[j]._id);
     

          arrfight.push(new fight( userArray[vitri], userArray[j],id_sum));
          userArray[vitri].socket.emit("server-send-room",{room:userArray[j]._id+" "+id_sum});
          userArray[j].socket.emit("server-send-room",{room:userArray[vitri]._id+" "+id_sum});

           
      
     console.log(userArray[vitri]._name+"dau voi "+userArray[j]._name);
     break;
   } 


}

// if(dem<2) 
// {
//     u1.socket.emit("server-send-room",{room:("0")});
//     u2.socket.emit("server-send-room",{room:("0")});
// }
});


socket.on("game-over",function(user)
{
  var arr= user.split(" ");
for(i-0;i<arrfight.length;i++)
{
    if(arrfight[i].room==Number(arr[0]))
    {



        if(arrfight[i].user1._id== Number(arr[1]))
        {
            console.log("user 1 thua");
            arrfight[i].user2.socket.emit("server-send-result",{result:"win"})
            arrfight[i].user1.socket.emit("server-send-result",{result:"lose"})

        }
        else if(arrfight[i].user2._id== Number(arr[1]))
        {
            arrfight[i].user1.socket.emit("server-send-result",{result:"win"})
            arrfight[i].user2.socket.emit("server-send-result",{result:"lose"})
        }
      
        arrfight[i].user1.playing=0;
        arrfight[i].user2.playing=0;
        arrfight[i].user1.timtran=0;
        arrfight[i].user2.timtran=0;
        arrfight.splice(i,1);
        break;
    }
}

}


);


socket.on("client-send-point",function(point)
{

    var arr= point.split(" ");
    for(i=0;i<arrfight.length;i++)
    {
        if(arrfight[i].room==Number(arr[0]))
        {

          
            if(arrfight[i].user1._id!=Number(arr[2]))
            {
                
                arrfight[i].user1.socket.emit("server-send-point",{source:Number(arr[1])});
            }else
            {
                arrfight[i].user2.socket.emit("server-send-point",{source:Number(arr[1])});
            }

            break;
        }
    }

});


socket.on("time-up",function(data)
{


    var arr_timeup= data.split(" ");
    for(i=0;i<arrfight.length;i++)
    {
        if(arrfight[i].room==Number(arr_timeup[1])&& arrfight[i].timeup==0)
        {

            if(Number(arr_timeup[0]>Number(arr_timeup[2])))
            {

                if(Number(arr_timeup[3])==arrfight[i].user1._id)
                {
                    arrfight[i].user1.socket.emit("server-send-time-up",{timeup:"win"})
                    arrfight[i].user2.socket.emit("server-send-time-up",{timeup:"lose"})
                } else  if(Number(arr_timeup[3])==arrfight[i].user2._id)
                {
                    arrfight[i].user2.socket.emit("server-send-time-up",{timeup:"win"})
                    arrfight[i].user1.socket.emit("server-send-time-up",{timeup:"lose"})
                }
            }
            else
            
            if(Number(arr_timeup[0]<Number(arr_timeup[2])))
            {

                if(Number(arr_timeup[3])==arrfight[i].user1._id)
                {
                    arrfight[i].user1.socket.emit("server-send-time-up",{timeup:"lose"})
                    arrfight[i].user2.socket.emit("server-send-time-up",{timeup:"win"})
                } else  if(Number(arr_timeup[3])==arrfight[i].user2._id)
                {
                    arrfight[i].user2.socket.emit("server-send-time-up",{timeup:"lose"})
                    arrfight[i].user1.socket.emit("server-send-time-up",{timeup:"win"})
                }
            }
            if(Number(arr_timeup[0]==Number(arr_timeup[2])))
            {
                arrfight[i].user1.socket.emit("server-send-time-up",{timeup:"mid"})
                arrfight[i].user2.socket.emit("server-send-time-up",{timeup:"mid"})
            }
            arrfight[i].timeup=1
            arrfight[i].user1.playing=0;
            arrfight[i].user2.playing=0;
            arrfight[i].user1.timtran=0;
            arrfight[i].user2.timtran=0;
            arrfight.splice(i,1);
            break;
        }
    }


});



socket.on("user-off",function(id)
{

    for(i=0;i<userArray.length;i++)
    {
        if(userArray[i]._id==Number(id))
        {

          
           userArray.splice(i,1);

            break;
        }
    }

});
socket.on("huy-tran",function(id)
{

  

});
}

);
 class fight
    {
        constructor(user1,user2,room)
        {
            this.user1=user1
            this.user2=user2
            this.room=room
            this.timeup=0
        }
    };
class user{
    constructor(id,name,gioitinh,socket) {
      this._id = id;
      this._name=name;
      this._gioitinh=gioitinh;
      this.losse=0
      this.timtran=0
      this.playing=0
      this.socket=socket
    };
   
   

  }
