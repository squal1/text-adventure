var main = function () {
    "use strict";

    //Takes an array of coordinate room name pairs and creates the map with html elements (assumes a div called map exists in main)
    var createMap = function (dungeonRooms) {
        //Create base grid layout
        var $newDiv;
        var $square;
        //Y coordinate (row number)
        for(var y=0; y<9; y++) {
            $newDiv = $("<div class='row'>");
            //X coordinate (column number)
            for(var x=0; x<9; x++) {
                $square = $("<span class='r" + x + y + "'>");
                $newDiv.append($square);
            }

            $(".map").append($newDiv);
        }

        //Add names to rooms
        for(var i=0; i<dungeonRooms.length; i++) {
            var arr = dungeonRooms[i];
            $("." + arr[0]).append("<p>" + arr[1] + "</p>");
        }
    }

    //Updates the map to reveal discovered rooms
    var updateMap = function (discoveredRooms, currentRoom) {

        //Make all rooms invisible
        $(".map .row span").addClass("hidden");

        //Make all discovered rooms visible
        for(var i=0; i<discoveredRooms.length; i++) {
            $("." + discoveredRooms[i]).removeClass("hidden");
            $("." + discoveredRooms[i]).addClass("active");
        }

        //Mark current room on map
        $("." + currentRoom).addClass("current");
    }

    //The map is a 9x9 grid. This variable stores the rooms that the player has
    //already entered in coordinate form rxy, where x and y are numbers ranging
    //from 0-8, spanning left to right and top to bottom. r40 is the starting room.
    var discoveredRooms = ["r40","r41","r42","r51","r61","r43","r44","r34","r24","r45","r55","r65","r46","r47"];
    //The room the player currently resides in
    var currentRoom = "r40";

    //Array of room name to coordinates pairs (format: [[rxy,roomName],[rxy,roomName],...] where xy is the coordinates and roomName is the name of the room)
    var dungeonRooms = [["r40","Entrance"],["r41","Cave"],["r42","Dark Room"],["r51","Cave-In Room"],["r61","Cave Clearing"],["r43","Door Room"],["r24","Tomb"],["r34","Catacombs"],["r44","Well"],["r45","Leaky Passage"],["r55","Puzzle Door Room"],["r65","Treasure Stash"],["r46","Boss Room"],["r47","Exit"]];

    createMap(dungeonRooms);
    updateMap(discoveredRooms, currentRoom);
}

$(document).ready(main);