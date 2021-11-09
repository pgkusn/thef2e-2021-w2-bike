<template>
    <div id="app">
        <div id="map" class="z-10" />
        <div v-if="showCities.length" class="fixed z-20 p-5 w-52 bg-white rounded-lg shadow-md top-[10px] left-14">
            <p class="text-2xl font-bold leading-none">
                站牌搜尋
            </p>
            <select v-model="selectedCity" class="border border-[#C8C8C8] rounded p-2 my-4 w-full">
                <option value="">
                    選擇縣市
                </option>
                <option v-for="city in showCities" :key="city.City" :value="city.City">
                    {{ city.CityName }}
                </option>
            </select>
            <button class="block w-full bg-[#0D706D] text-white rounded py-2 leading-none disabled:opacity-50 disabled:cursor-default" :disabled="!selectedCity" @click="search">
                搜尋
            </button>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import L from 'leaflet';

export default {
    setup () {
        const store = useStore();
        const currentPosition = computed(() => store.state.currentPosition);

        // 初始化地圖
        let map = null;
        const initMap = () => {
            const { latitude, longitude } = currentPosition.value;
            map = L.map('map').setView([latitude, longitude], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        };

        // 取得popup資料
        const getPopupData = async city => {
            const data = await Promise.all([
                store.dispatch('getStationData', city),
                store.dispatch('getAvailableData', city)
            ]);
            const finalData = data[0].map((stationItem) => {
                const { AvailableRentBikes, AvailableReturnBikes } = data[1].find(availableItem => availableItem.stationUID === stationItem.stationUID);
                return {
                    stationPosition: stationItem.StationPosition,
                    stationName: stationItem.StationName.Zh_tw,
                    stationAddr: stationItem.StationAddress.Zh_tw,
                    availableRentBikes: AvailableRentBikes,
                    availableReturnBikes: AvailableReturnBikes
                };
            });
            return finalData;
        };

        // 設置標記及popup
        const setMarkerAndPopup = popupData => {
            for (const item of popupData) {
                const { PositionLat, PositionLon } = item.stationPosition;
                L.marker([PositionLat, PositionLon]).addTo(map).bindPopup(`
                    <h5 class="text-xl font-bold">${item.stationName}</h5>
                    <h4 class="my-2 text-base">${item.stationAddr}</h4>
                    <p class="!my-0 text-base">可借車輛：${item.availableRentBikes}</p>
                    <p class="!my-0 text-base">可停空位：${item.availableReturnBikes}</p>
                `);
            }
        };

        // 站牌搜尋
        const showCities = ref([]);
        const selectedCity = ref('');
        const search = async () => {
            // 移除標記
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            // 設置標記及popup
            const popupData = await getPopupData(selectedCity.value);
            setMarkerAndPopup(popupData);

            // 移動view
            const { PositionLat, PositionLon } = popupData[0].stationPosition;
            map.flyTo([PositionLat, PositionLon], 11);
        };

        onMounted(async () => {
            try {
                await store.dispatch('getCurrentPosition');
            }
            catch (error) {
                console.log('無法定位，地圖初始位置為行天宮');
            }

            initMap();

            const data = await Promise.all([
                store.dispatch('getCities'),
                getPopupData()
            ]);
            showCities.value = data[0].filter(value => {
                const availableCities = ['Taichung', 'Hsinchu', 'MiaoliCounty', 'NewTaipei', 'PingtungCounty', 'KinmenCounty', 'Taoyuan', 'Taipei', 'Kaohsiung', 'Tainan', 'Chiayi'];
                return availableCities.includes(value.City);
            });
            setMarkerAndPopup(data[1]);
        });

        return {
            showCities,
            selectedCity,
            search
        };
    }
};
</script>

<style lang="scss" scoped>
#map {
    height: 100vh;
}
</style>