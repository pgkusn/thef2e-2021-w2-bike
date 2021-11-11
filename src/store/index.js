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
    const Authorization = 'hmac username="' + AppID + '", algorithm="hmac-sha1", headers="x-date", signature="' + HMAC + '"';

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
                navigator.geolocation.getCurrentPosition(
                    pos => {
                        commit('setCurrentPosition', pos.coords);
                        resolve(pos.coords);
                    },
                    reject
                );
            });
        },
        // 取得自行車租借站位資料
        async getStationData ({ state }, city) {
            let url = '';
            if (city) {
                url = `Station/${city}?$top=30`;
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
                url = `Availability/${city}?$top=30`;
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
            try {
                const { data } = await axios({
                    method: 'get',
                    url: 'https://gist.motc.gov.tw/gist_api/V3/Map/Basic/City'
                });
                return data;
            }
            catch (error) {
                console.error(error.message);
                return [];
            }
        }
    }
});