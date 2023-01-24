import { createStore } from 'vuex';
import axios from 'axios';

const GetAuthorizationHeader = () => {
    const AppID = import.meta.env.VITE_TDX_APP_ID;
    const AppKey = import.meta.env.VITE_TDX_APP_KEY;

    const GMTString = new Date().toGMTString();
    const ShaObj = new jsSHA('SHA-1', 'TEXT');
    ShaObj.setHMACKey(AppKey, 'TEXT');
    ShaObj.update('x-date: ' + GMTString);
    const HMAC = ShaObj.getHMAC('B64');
    const Authorization =
    'hmac username="' +
    AppID +
    '", algorithm="hmac-sha1", headers="x-date", signature="' +
    HMAC +
    '"';

    return {
        Authorization: Authorization,
        'X-Date': GMTString /*, 'Accept-Encoding': 'gzip' */
    }; // 如果要將js運行在伺服器，可額外加入 'Accept-Encoding': 'gzip'，要求壓縮以減少網路傳輸資料量
};

const mainAPI = axios.create({
    method: 'get',
    baseURL: 'https://ptx.transportdata.tw/MOTC/v2/Bike/',
    headers: GetAuthorizationHeader()
});

export default createStore({
    state: {
        currentPosition: {
            latitude: 25.0657976,
            longitude: 121.5352149
        }
    },
    mutations: {
        setCurrentPosition (state, pos) {
            state.currentPosition = pos;
        }
    },
    actions: {
    // 取得當前位置
        getCurrentPosition ({ commit }) {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(pos => {
                    commit('setCurrentPosition', pos.coords);
                    resolve(pos.coords);
                }, reject);
            });
        },
        // 取得自行車租借站位資料
        async getStationData ({ state }, city) {
            let url = '';
            if (city) {
                url = `Station/City/${city}?$top=30`;
            }
            else {
                const { latitude, longitude } = state.currentPosition;
                url = `Station/NearBy?$spatialFilter=nearby(${latitude},${longitude},500)`;
            }

            try {
                const { data } = await mainAPI(url);
                return data;
            }
            catch (error) {
                console.error(error.message);
            }
        },
        // 取得即時車位資料
        async getAvailableData ({ state }, city) {
            let url = '';
            if (city) {
                url = `Availability/City/${city}?$top=30`;
            }
            else {
                const { latitude, longitude } = state.currentPosition;
                url = `Availability/NearBy?$spatialFilter=nearby(${latitude},${longitude},500)`;
            }

            try {
                const { data } = await mainAPI(url);
                return data;
            }
            catch (error) {
                console.error(error.message);
            }
        },
        async getCities () {
            // try {
            //     const { data } = await axios({
            //         method: 'get',
            //         headers: {
            //             Authorization:
            //   'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJER2lKNFE5bFg4WldFajlNNEE2amFVNm9JOGJVQ3RYWGV6OFdZVzh3ZkhrIn0.eyJleHAiOjE2NzM3OTE3MDIsImlhdCI6MTY3MzcwNTMwMiwianRpIjoiZTY0ZmJhM2MtNmM3NC00ZDQ3LTkyMTQtNTJiNmZmZmUyMjY0IiwiaXNzIjoiaHR0cHM6Ly90ZHgudHJhbnNwb3J0ZGF0YS50dy9hdXRoL3JlYWxtcy9URFhDb25uZWN0Iiwic3ViIjoiMWM5YWQ1NzYtNzkxNi00Mjg4LTg5ZjUtMWJjNmY3YTkxNWNiIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoicGdrdXNuLTRhMTQ0OWEyLTcyYTMtNGMxYSIsImFjciI6IjEiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsic3RhdGlzdGljIiwicHJlbWl1bSIsIm1hYXMiLCJhZHZhbmNlZCIsImhpc3RvcmljYWwiLCJiYXNpYyJdfSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwidXNlciI6IjU5OTkzNjE0In0.g8qnb3zFS4Ux6RKtf461sy8wEUGM5PZ_shO0cAVWTIG8d2A1K-hc29Ckkg7bPhsC3Scjaac4XI1_4ilpTW-KGkrQrxz3n41VI-F6FKtL5WGq8ML1wI0I5X2XwqwI2SLUxr0toLmhmmcxtz_JpCEbNzQx-jIcRQrFvMmyWAtp1CXH6i9Ty0FRnJSo3eRs3gKEOaCEfCGfKNKa3jGc9ziXXPkaIhGd2CuiWifZZU-JxG2y7Jy-ECbdgey2_oERa29Vpip1KKwdfFpog9WaYx-8rdATVIhwhaIKAbAu-NiZcoUigo_wga7f5FyjU4FhiLKCO3rvRiB_TmoNmKuH1LfoMA'
            //         },
            //         url: 'https://tdx.transportdata.tw/api/basic/v2/Basic/City'
            //     });
            //     return data;
            // }
            // catch (error) {
            //     console.error(error.message);
            //     return [];
            // }
            return [
                {
                    CityID: 'A',
                    CityName: '臺北市',
                    CityCode: 'TPE',
                    City: 'Taipei',
                    CountyID: 'A',
                    Version: '22.09.1'
                },
                {
                    CityID: 'B',
                    CityName: '臺中市',
                    CityCode: 'TXG',
                    City: 'Taichung',
                    CountyID: 'B',
                    Version: '22.09.1'
                },
                {
                    CityID: 'C',
                    CityName: '基隆市',
                    CityCode: 'KEE',
                    City: 'Keelung',
                    CountyID: 'C',
                    Version: '22.09.1'
                },
                {
                    CityID: 'D',
                    CityName: '臺南市',
                    CityCode: 'TNN',
                    City: 'Tainan',
                    CountyID: 'D',
                    Version: '22.09.1'
                },
                {
                    CityID: 'E',
                    CityName: '高雄市',
                    CityCode: 'KHH',
                    City: 'Kaohsiung',
                    CountyID: 'E',
                    Version: '22.09.1'
                },
                {
                    CityID: 'F',
                    CityName: '新北市',
                    CityCode: 'NWT',
                    City: 'NewTaipei',
                    CountyID: 'F',
                    Version: '22.09.1'
                },
                {
                    CityID: 'G',
                    CityName: '宜蘭縣',
                    CityCode: 'ILA',
                    City: 'YilanCounty',
                    CountyID: 'G',
                    Version: '22.09.1'
                },
                {
                    CityID: 'H',
                    CityName: '桃園市',
                    CityCode: 'TAO',
                    City: 'Taoyuan',
                    CountyID: 'H',
                    Version: '22.09.1'
                },
                {
                    CityID: 'I',
                    CityName: '嘉義市',
                    CityCode: 'CYI',
                    City: 'Chiayi',
                    CountyID: 'I',
                    Version: '22.09.1'
                },
                {
                    CityID: 'J',
                    CityName: '新竹縣',
                    CityCode: 'HSQ',
                    City: 'HsinchuCounty',
                    CountyID: 'J',
                    Version: '22.09.1'
                },
                {
                    CityID: 'K',
                    CityName: '苗栗縣',
                    CityCode: 'MIA',
                    City: 'MiaoliCounty',
                    CountyID: 'K',
                    Version: '22.09.1'
                },
                {
                    CityID: 'M',
                    CityName: '南投縣',
                    CityCode: 'NAN',
                    City: 'NantouCounty',
                    CountyID: 'M',
                    Version: '22.09.1'
                },
                {
                    CityID: 'N',
                    CityName: '彰化縣',
                    CityCode: 'CHA',
                    City: 'ChanghuaCounty',
                    CountyID: 'N',
                    Version: '22.09.1'
                },
                {
                    CityID: 'O',
                    CityName: '新竹市',
                    CityCode: 'HSZ',
                    City: 'Hsinchu',
                    CountyID: 'O',
                    Version: '22.09.1'
                },
                {
                    CityID: 'P',
                    CityName: '雲林縣',
                    CityCode: 'YUN',
                    City: 'YunlinCounty',
                    CountyID: 'P',
                    Version: '22.09.1'
                },
                {
                    CityID: 'Q',
                    CityName: '嘉義縣',
                    CityCode: 'CYQ',
                    City: 'ChiayiCounty',
                    CountyID: 'Q',
                    Version: '22.09.1'
                },
                {
                    CityID: 'T',
                    CityName: '屏東縣',
                    CityCode: 'PIF',
                    City: 'PingtungCounty',
                    CountyID: 'T',
                    Version: '22.09.1'
                },
                {
                    CityID: 'U',
                    CityName: '花蓮縣',
                    CityCode: 'HUA',
                    City: 'HualienCounty',
                    CountyID: 'U',
                    Version: '22.09.1'
                },
                {
                    CityID: 'V',
                    CityName: '臺東縣',
                    CityCode: 'TTT',
                    City: 'TaitungCounty',
                    CountyID: 'V',
                    Version: '22.09.1'
                },
                {
                    CityID: 'W',
                    CityName: '金門縣',
                    CityCode: 'KIN',
                    City: 'KinmenCounty',
                    CountyID: 'W',
                    Version: '22.09.1'
                },
                {
                    CityID: 'X',
                    CityName: '澎湖縣',
                    CityCode: 'PEN',
                    City: 'PenghuCounty',
                    CountyID: 'X',
                    Version: '22.09.1'
                },
                {
                    CityID: 'Z',
                    CityName: '連江縣',
                    CityCode: 'LIE',
                    City: 'LienchiangCounty',
                    CountyID: 'Z',
                    Version: '22.09.1'
                }
            ];
        }
    }
});
