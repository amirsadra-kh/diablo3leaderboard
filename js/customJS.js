//Top 10 modal function
$(document).ready(function(){
  $("#top100TableHTML").hide();
  $("#currentChartContainer").hide();
  $("#previousChartContainer").hide();
  buildTimeline();
});

function achievementTableModal(){
  $("#achievementTableModal").modal();
  constructAchievementTable();
}

function top100TableModal(){
  $("#top100TableModal").modal();
}

function seasonStatsModal(){
  $("#seasonStatsModal").modal();
}

function seasonTimelineModal(){
  $("#seasonTimelineModal").modal();
}

//A function to convert MS to days/hours/minutes
function convertTime(timeInMs){
  var diff = new moment.duration(timeInMs);
  var result = '';
  var days = diff.asDays();     
  var hours = diff.asHours();    
  var mins = diff.asMinutes();
  result = days + ' days and ' + hours + ' hours and ' + mins + ' minutes';
  return result;
}

function dhm(t){
  var cd = 24 * 60 * 60 * 1000,
      ch = 60 * 60 * 1000,
      d = Math.floor(t / cd),
      h = Math.floor( (t - d * cd) / ch),
      m = Math.round( (t - d * cd - h * ch) / 60000),
      pad = function(n){ return n < 10 ? '0' + n : n; };
if( m === 60 ){
  h++;
  m = 0;
}
if( h === 24 ){
  d++;
  h = 0;
}
return [d, pad(h), pad(m)].join(':');
}

function getToken(){
  return $.ajax({
    type: "GET",
    url: url,
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    success: function (data) {
        myData = data.row;
     }
});
}

//Achievement data table
function constructAchievementTable(){
  var token = "";
  $.get('https://frontendhelperbeeye.azurewebsites.net/Tokens.asmx/GetToken', function(accessToken){
    token = accessToken.access_token;
    var url = "https://us.api.battle.net/data/d3/season/12/leaderboard/achievement-points?access_token="+token
    $.ajax({
      type: "GET",
      url: url,
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      success: function (data) {
          var myData = data.row;
          $('#achievementTable').DataTable({
              "data": myData,
              "columns": [
                      { "data": "order" },
                      { "data": "player[0].data.0.string" },
                      { "data": "data.1.number",
                      "defaultContent": "<i>Not set</i>",},
                      { "data": "player[0].data.5.number" },
                      { "data": "player[0].data.2.string" },
                      { "data": "data.2.timestamp",
                        "render": function ( data, type, row, meta ) {
                          return moment(data, "x").format("DD MMM YYYY hh:mm a");
                        }
                      }
               ]
            });
       }
  });
  });
}

//Top 100 data table
function constructTop100Table(){
  var token = "";
  var riftClass = $("#classSelect").val();
  if (riftClass == "all")
    top100all();
  else{
    $.get('https://frontendhelperbeeye.azurewebsites.net/Tokens.asmx/GetToken', function(accessToken){
    token = accessToken.access_token;
    var url = "https://us.api.battle.net/data/d3/season/12/leaderboard/"+riftClass+"?access_token="+token
    $.ajax({
      type: "GET",
      url: url,
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      success: function (data) {
          var myData = data.row;
          $("#top100TableHTML").fadeIn(500);
          $('#top100Table').DataTable({
              "data": myData,
              destroy: true,
              processing: true,
              pageLength: 100,
              "columns": [
                      { "data": "order" },
                      { "data": "player[0].data.0.string" },
                      { "data": "player[0].data.2.string" },
                      { "data": "data.1.number",
                      "defaultContent": "<i>Not set</i>",},
                      { "data": "data.2.timestamp",
                        "render": function ( data, type, row, meta ) {
                          return moment(data, "x").format("mm:ss");
                        }
                      },
                      { "data": "data.3.timestamp",
                        "render": function ( data, type, row, meta ) {
                          return moment(data, "x").format("DD MMM YYYY hh:mm a");
                        }
                      }
               ]
            });
       }
  });
  });
  }
}

//Showing Season status
function showSeasonStats(){
  var token = "";
  var currSeason = "";
  var prevSeason = "";
  var currSeasData = "";
  var prevSeasData = "";

  var riftClass = $("#classSelect_season").val();
    $.get('https://frontendhelperbeeye.azurewebsites.net/Tokens.asmx/GetToken', function(accessToken){
      token = accessToken.access_token;
      $.get('https://us.api.battle.net/data/d3/season/?access_token='+token+'', function(currentSeason){
        currSeason = currentSeason.current_season;
        prevSeason = currSeason-1;
        var currSeason_url = "https://us.api.battle.net/data/d3/season/"+currSeason+"/leaderboard/achievement-points?access_token="+token;
        var prevSeason_url = "https://us.api.battle.net/data/d3/season/"+prevSeason+"/leaderboard/achievement-points?access_token="+token;

        $.when( $.ajax( {
          type: "GET",
          url: currSeason_url,
          dataType: "json",
          contentType: "application/json; charset=utf-8",
        } ) ).then(function( data, textStatus, jqXHR ) {
          currSeasData = data.row;
          $.get(prevSeason_url, function (data){

            $("#currentChartContainer").fadeIn(1000);
            $("#previousChartContainer").fadeIn(1000);

            var prevData = data.row;

            var currBarb = 0;
            var prevBarb = 0;
            
            var currCrus = 0;
            var prevCrus = 0;

            var currDH = 0;
            var prevDH = 0;
            
            var currMonk = 0;
            var prevMonk = 0;
            
            var currWD = 0;
            var prevWD = 0;
            
            var currWiz = 0;
            var prevWiz = 0;
            
            var currNec = 0;
            var prevNec = 0;

            var rifts = ["barbarian", "crusader", "demon hunter", "monk", "witch doctor", "wizard", "necromancer"];

            for (i = 0; i < 100; i++){
              if (currSeasData[i].player[0].data[2].string == "barbarian")
                currBarb++;
              else if (currSeasData[i].player[0].data[2].string == "crusader")
                currCrus++;
              else if (currSeasData[i].player[0].data[2].string == "demon hunter")
                currDH++;
              else if (currSeasData[i].player[0].data[2].string == "monk")
                currMonk++;
              else if (currSeasData[i].player[0].data[2].string == "witch doctor")
                currWD++;
              else if (currSeasData[i].player[0].data[2].string == "wizard")
                currWiz++;
              else if (currSeasData[i].player[0].data[2].string == "necromancer")
                currNec++;

              if (prevData[i].player[0].data[2].string == "barbarian")
                prevBarb++;
              else if (prevData[i].player[0].data[2].string == "crusader")
                prevCrus++;
              else if (prevData[i].player[0].data[2].string == "demon hunter")
                prevDH++;
              else if (prevData[i].player[0].data[2].string == "monk")
                prevMonk++;
              else if (prevData[i].player[0].data[2].string == "witch doctor")
                prevWD++;
              else if (prevData[i].player[0].data[2].string == "wizard")
                prevWiz++;
              else if (prevData[i].player[0].data[2].string == "necromancer")
                prevNec++;
            }
            
            var currentOptions = {
              title: {
                text: "Chart for Season "+currSeason+""
              },
              subtitles: [{
                text: "Current Season"
              }],
              animationEnabled: true,
              data: [{
                type: "pie",
                startAngle: 40,
                toolTipContent: "<b>{label}</b>: {y}%",
                showInLegend: "true",
                legendText: "{label}",
                indexLabelFontSize: 12,
                indexLabel: "{label} - {y}%",
                dataPoints: [
                  { y: currBarb, label: "Barbarians" },
                  { y: currCrus, label: "Crusaders" },
                  { y: currDH, label: "Demon Hunters" },
                  { y: currMonk, label: "Monks" },
                  { y: currWD, label: "Witch Doctors" },
                  { y: currWiz, label: "Wizards" },
                  { y: currNec, label: "Necromancers" }
                ]
              }]
            };
            $("#currentChartContainer").CanvasJSChart(currentOptions);

            var prevOptions = {
              title: {
                text: "Chart for Season "+prevSeason+""
              },
              subtitles: [{
                text: "Previous Season"
              }],
              animationEnabled: true,
              data: [{
                type: "pie",
                startAngle: 40,
                toolTipContent: "<b>{label}</b>: {y}%",
                showInLegend: "true",
                legendText: "{label}",
                indexLabelFontSize: 12,
                indexLabel: "{label} - {y}%",
                dataPoints: [
                  { y: prevBarb, label: "Barbarians" },
                  { y: prevCrus, label: "Crusaders" },
                  { y: prevDH, label: "Demon Hunters" },
                  { y: prevMonk, label: "Monks" },
                  { y: prevWD, label: "Witch Doctors" },
                  { y: prevWiz, label: "Wizards" },
                  { y: prevNec, label: "Necromancers" }
                ]
              }]
            };
            $("#previousChartContainer").CanvasJSChart(prevOptions);

          });
        });
      });
    });
}

//Season timeline builder
function buildTimeline(){
  var currSeason = "";

  var barbData = [];
  var crusData = [];
  var dhData = [];
  var monkData = [];
  var wdData = [];
  var wizData = [];
  var necData = [];

  var token = $.get('https://frontendhelperbeeye.azurewebsites.net/Tokens.asmx/GetToken', function(accessToken){
    token = accessToken.access_token;
    return token;
  });
  token.done(function (){
    var url = "";
    var timeLine = $.get('https://us.api.battle.net/data/d3/season/?access_token='+token+'', function(currentSeason){
          currSeason = currentSeason.current_season;
          for (i=1; i<=currSeason; i++){
            $.ajax({
              url: "https://us.api.battle.net/data/d3/season/"+i+"/leaderboard/rift-barbarian?access_token="+token+"",
            }).done(function(maximum){
              barbData.push(maximum.row[0].data[1].number);
            });
            $.ajax({
              url: "https://us.api.battle.net/data/d3/season/"+i+"/leaderboard/rift-crusader?access_token="+token+"",
            }).done(function(maximum){
              crusData.push(maximum.row[0].data[1].number);
            });
            $.ajax({
              url: "https://us.api.battle.net/data/d3/season/"+i+"/leaderboard/rift-dh?access_token="+token+"",
            }).done(function(maximum){
              dhData.push(maximum.row[0].data[1].number);
            });
            $.ajax({
              url: "https://us.api.battle.net/data/d3/season/"+i+"/leaderboard/rift-monk?access_token="+token+"",
            }).done(function(maximum){
              monkData.push(maximum.row[0].data[1].number);
            });
            $.ajax({
              url: "https://us.api.battle.net/data/d3/season/"+i+"/leaderboard/rift-wd?access_token="+token+"",
            }).done(function(maximum){
              wdData.push(maximum.row[0].data[1].number);
            });
            $.ajax({
              url: "https://us.api.battle.net/data/d3/season/"+i+"/leaderboard/rift-wizard?access_token="+token+"",
            }).done(function(maximum){
              wizData.push(maximum.row[0].data[1].number);
            });
            $.ajax({
              url: "https://us.api.battle.net/data/d3/season/"+i+"/leaderboard/rift-necromancer?access_token="+token+"",
            }).done(function(maximum){
              necData.push(maximum.row[0].data[1].number);
            });   
          }

          setTimeout(function(){
            var timelineChart = new CanvasJS.Chart("seasonTimelineChart", {
              zoomEnabled : true,
              title: {
                text: "Maximum Tier based on classes over time"
              },
              axisX: {
              },
              axisY2: {
                title: "Maximum Tier",
                prefix: "Tier ",
              },
              toolTip: {
                shared: true
              },
              legend: {
                cursor: "pointer",
                verticalAlign: "top",
                horizontalAlign: "center",
                dockInsidePlotArea: true,
                itemclick: toogleDataSeries
              },
              data: [{
                type:"line",
                axisYType: "secondary",
                name: "Barbarian",
                showInLegend: true,
                markerSize: 0,
                yValueFormatString: "Tier #",
                dataPoints: [		
                  { x: 1, y: barbData[0] },
                  { x: 2, y: barbData[1] },
                  { x: 3, y: barbData[2] },
                  { x: 4, y: barbData[3] },
                  { x: 5, y: barbData[4] },
                  { x: 6, y: barbData[5] },
                  { x: 7, y: barbData[6] },
                  { x: 8, y: barbData[7] },
                  { x: 9, y: barbData[8] },
                  { x: 10, y: barbData[9] },
                  { x: 11, y: barbData[10] },
                  { x: 12, y: barbData[11] }
                ]
              },
              {
                type:"line",
                axisYType: "secondary",
                name: "Crusader",
                showInLegend: true,
                markerSize: 0,
                yValueFormatString: "Tier #",
                dataPoints: [		
                  { x: 1, y: crusData[0] },
                  { x: 2, y: crusData[1] },
                  { x: 3, y: crusData[2] },
                  { x: 4, y: crusData[3] },
                  { x: 5, y: crusData[4] },
                  { x: 6, y: crusData[5] },
                  { x: 7, y: crusData[6] },
                  { x: 8, y: crusData[7] },
                  { x: 9, y: crusData[8] },
                  { x: 10, y: crusData[9] },
                  { x: 11, y: crusData[10] },
                  { x: 12, y: crusData[11] }
                ]
              },
              {
                type:"line",
                axisYType: "secondary",
                name: "Demon Hunter",
                showInLegend: true,
                markerSize: 0,
                yValueFormatString: "Tier #",
                dataPoints: [		
                  { x: 1, y: dhData[0] },
                  { x: 2, y: dhData[1] },
                  { x: 3, y: dhData[2] },
                  { x: 4, y: dhData[3] },
                  { x: 5, y: dhData[4] },
                  { x: 6, y: dhData[5] },
                  { x: 7, y: dhData[6] },
                  { x: 8, y: dhData[7] },
                  { x: 9, y: dhData[8] },
                  { x: 10, y: dhData[9] },
                  { x: 11, y: dhData[10] },
                  { x: 12, y: dhData[11] }
                ]
              },
              {
                type:"line",
                axisYType: "secondary",
                name: "Monk",
                showInLegend: true,
                markerSize: 0,
                yValueFormatString: "Tier #",
                dataPoints: [		
                  { x: 1, y: monkData[0] },
                  { x: 2, y: monkData[1] },
                  { x: 3, y: monkData[2] },
                  { x: 4, y: monkData[3] },
                  { x: 5, y: monkData[4] },
                  { x: 6, y: monkData[5] },
                  { x: 7, y: monkData[6] },
                  { x: 8, y: monkData[7] },
                  { x: 9, y: monkData[8] },
                  { x: 10, y: monkData[9] },
                  { x: 11, y: monkData[10] },
                  { x: 12, y: monkData[11] }
                ]
              },
              {
                type:"line",
                axisYType: "secondary",
                name: "Witch Doctor",
                showInLegend: true,
                markerSize: 0,
                yValueFormatString: "Tier #",
                dataPoints: [		
                  { x: 1, y: wdData[0] },
                  { x: 2, y: wdData[1] },
                  { x: 3, y: wdData[2] },
                  { x: 4, y: wdData[3] },
                  { x: 5, y: wdData[4] },
                  { x: 6, y: wdData[5] },
                  { x: 7, y: wdData[6] },
                  { x: 8, y: wdData[7] },
                  { x: 9, y: wdData[8] },
                  { x: 10, y: wdData[9] },
                  { x: 11, y: wdData[10] },
                  { x: 12, y: wdData[11] }
                ]
              },
              {
                type:"line",
                axisYType: "secondary",
                name: "Wizard",
                showInLegend: true,
                markerSize: 0,
                yValueFormatString: "Tier #",
                dataPoints: [		
                  { x: 1, y: wizData[0] },
                  { x: 2, y: wizData[1] },
                  { x: 3, y: wizData[2] },
                  { x: 4, y: wizData[3] },
                  { x: 5, y: wizData[4] },
                  { x: 6, y: wizData[5] },
                  { x: 7, y: wizData[6] },
                  { x: 8, y: wizData[7] },
                  { x: 9, y: wizData[8] },
                  { x: 10, y: wizData[9] },
                  { x: 11, y: wizData[10] },
                  { x: 12, y: wizData[11] }
                ]
              },
              {
                type:"line",
                axisYType: "secondary",
                name: "Necromancer",
                showInLegend: true,
                markerSize: 0,
                yValueFormatString: "Tier #",
                dataPoints: [		
                  { x: 1, y: necData[0] },
                  { x: 2, y: necData[1] },
                  { x: 3, y: necData[2] },
                  { x: 4, y: necData[3] },
                  { x: 5, y: necData[4] },
                  { x: 6, y: necData[5] },
                  { x: 7, y: necData[6] },
                  { x: 8, y: necData[7] },
                  { x: 9, y: necData[8] },
                  { x: 10, y: necData[9] },
                  { x: 11, y: necData[10] },
                  { x: 12, y: necData[11] }
                ]
              },
              ]
            });
            timelineChart.render();

            function toogleDataSeries(e){
              if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
              } else{
                e.dataSeries.visible = true;
              }
              timelineChart.render();
            }

          },10000);

        });
    });
}
