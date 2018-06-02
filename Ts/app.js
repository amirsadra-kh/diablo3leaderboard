/// <reference path="../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../node_modules/@types/jquery/index.d.ts" />
var BlizzData;
(function (BlizzData) {
    var Operation;
    (function (Operation) {
        Operation[Operation["FetchToken"] = 0] = "FetchToken";
        Operation[Operation["GetLeaderboardsList"] = 1] = "GetLeaderboardsList";
        Operation[Operation["GetLeaderboardDataByName"] = 2] = "GetLeaderboardDataByName";
    })(Operation || (Operation = {}));
    var App = /** @class */ (function () {
        function App() {
            var _this = this;
            this.origin = 'us';
            this.locale = 'en_US'; //not used
            this.token = '';
            this.laderBoardsList = [];
            this.LeaderBoardsTmp = ko.observableArray([]); //use of knockout is for example only. Feel free to use any framework(s)
            this.loadedSeason = 0;
            this.GetSeasonData = function (seasonDesc) {
                var className = 'rift-' + seasonDesc.hero_class_string;
                var url = _this.buildUrl(_this.origin, _this.locale, Operation.GetLeaderboardDataByName).replace("{season}", _this.loadedSeason.toString()).replace("{name}", className);
                if (_this.loadedSeason == 0) {
                    return;
                }
                $.get(url, {}, function (data) {
                    //Do simething with data
                    var maxRiftLvlPlayer = data.row[0].player[0].data[0].string;
                    var maxRiftLvl = data.row[0].data[1].number;
                    alert('Data loaded for ' + className + ' . First place ' + maxRiftLvlPlayer + " completed lvl : " + maxRiftLvl);
                });
            };
        }
        App.prototype.reload = function () {
            var v = parseInt($('#seasonNumber').val().toString());
            if (isNaN(v)) {
                return;
            }
            ;
            this.LeaderBoardsTmp([]); //clean list
            this.GetSeasonsLeaderboarsList(v);
        };
        App.prototype.GetSeasonsLeaderboarsList = function (season) {
            var _this = this;
            if (season === void 0) { season = 12; }
            if (this.token == '') {
                this.fetchToken(function () {
                    _this.GetSeasonsLeaderboarsList(season);
                });
                return;
            }
            var url = this.buildUrl(this.origin, this.locale, Operation.GetLeaderboardsList).replace("{season}", season.toString());
            $.get(url, {}, function (data) {
                console.log("Loaded " + data.leaderboard.length + "leaderboards");
                //filtering : Only "not hardcore" and only teamsize = 1 for this example
                var finalRes = [];
                for (var i = 0; i < data.leaderboard.length; i++) {
                    if ((!data.leaderboard[i].team_size) || (data.leaderboard[i].team_size != 1)) {
                        continue;
                    }
                    //if (data.leaderboard[i].hardcore) { //there is a small bug in APIs, some of "hardcore" ladders don't have this field
                    //    continue;
                    //}
                    //workaround
                    if (data.leaderboard[i].ladder.href.indexOf("-hardcore-") >= 0) {
                        continue;
                    }
                    finalRes.push(data.leaderboard[i]);
                }
                _this.LeaderBoardsTmp(finalRes);
                _this.loadedSeason = season;
            });
        };
        App.prototype.fetchToken = function (callBack) {
            var _this = this;
            if (callBack === void 0) { callBack = null; }
            var url = this.buildUrl();
            $.get(url, {}, function (data) {
                _this.token = data.access_token;
                $("#tokenInput").val(_this.token);
                if (callBack != null) {
                    callBack();
                }
            });
        };
        App.prototype.buildUrl = function (origin, locale, op) {
            if (origin === void 0) { origin = 'us'; }
            if (locale === void 0) { locale = 'en'; }
            if (op === void 0) { op = Operation.FetchToken; }
            var base = 'https://' + origin + '.api.battle.net/';
            switch (op) {
                case Operation.FetchToken:
                    //token helper for Auth 
                    base = 'https://frontendhelperbeeye.azurewebsites.net/Tokens.asmx/GetToken';
                    break;
                case Operation.GetLeaderboardsList:
                    base = base + 'data/d3/season/{season}?access_token=' + this.token;
                    break;
                case Operation.GetLeaderboardDataByName:
                    base = base + 'data/d3/season/{season}/leaderboard/{name}?access_token=' + this.token;
                    break;
                default:
            }
            return base;
        };
        return App;
    }());
    BlizzData.App = App;
})(BlizzData || (BlizzData = {}));
//# sourceMappingURL=app.js.map