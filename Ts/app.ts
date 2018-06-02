/// <reference path="../node_modules/@types/knockout/index.d.ts" />
/// <reference path="../node_modules/@types/jquery/index.d.ts" />
module BlizzData {
    enum Operation {
        FetchToken,
        GetLeaderboardsList,
        GetLeaderboardDataByName
    }

    export class App {
        private origin = 'us';
        private locale = 'en_US'; //not used
        private token = '';
        private laderBoardsList: Array<any> = [];
        public LeaderBoardsTmp = ko.observableArray<any>([]); //use of knockout is for example only. Feel free to use any framework(s)
        private loadedSeason: number = 0;


        public constructor() {
        }

        public reload() {
            var v = parseInt($('#seasonNumber').val().toString());
            if (isNaN(v)) {
                return;
            };
            this.LeaderBoardsTmp([]); //clean list
            this.GetSeasonsLeaderboarsList(v);
        }

        public GetSeasonData = (seasonDesc: any) => {
            let className = 'rift-' + seasonDesc.hero_class_string;
            var url = this.buildUrl(this.origin, this.locale, Operation.GetLeaderboardDataByName).replace("{season}", this.loadedSeason.toString()).replace("{name}", className);
            if (this.loadedSeason == 0) {
                return;
            }

            $.get(url, {}, (data: any) => {
                //Do simething with data
                var maxRiftLvlPlayer = data.row[0].player[0].data[0].string;
                var maxRiftLvl = data.row[0].data[1].number;
                alert('Data loaded for ' + className + ' . First place ' + maxRiftLvlPlayer + " completed lvl : " + maxRiftLvl);
            });
        }

        public GetSeasonsLeaderboarsList(season: number = 12) {
            if (this.token == '') {
                this.fetchToken(() => {
                    this.GetSeasonsLeaderboarsList(season);
                });
                return;
            }
            let url = this.buildUrl(this.origin, this.locale, Operation.GetLeaderboardsList).replace("{season}", season.toString());
            $.get(url, {}, (data: any) => {
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
                this.LeaderBoardsTmp(finalRes);
                this.loadedSeason = season;
            });
        }

        private fetchToken(callBack: Function = null): void {
            var url = this.buildUrl();
            $.get(url, {}, (data: any) => {
                this.token = data.access_token;
                if (callBack != null) {
                    callBack();
                }
            });

        }

        private buildUrl(origin: string = 'us', locale: string = 'en', op: Operation = Operation.FetchToken) {
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
        }
    }
}