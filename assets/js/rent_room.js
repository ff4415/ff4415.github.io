$(function () {
    var map = new AMap.Map('container',{resizeEnable: true,
        zoomEnable: true,
        zoom:4
    });
centerMarker= new AMap.Marker({
        map: map,
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
        cursor: 'move',
        draggable: true,
        raiseOnDrag: true,
        title: "workingHouse"
    });
    map.plugin('AMap.Geolocation', function() {
        geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,//是否使用高精度定位，默认:true
            timeout: 10000,          //超过10秒后停止定位，默认：无穷大
            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            zoomToAccuracy: true,      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
            buttonPosition:'RB',
            showMarker: false
        });
        map.addControl(geolocation);
        geolocation.getCurrentPosition(function(status,result){
            centerMarker.setPosition(result.position);
        });
    });
    var transOptions = {
        map: map,
        city: '北京市',
        panel: 'panel',
        hideMarkers: true,
        policy: AMap.TransferPolicy.LEAST_TIME
    };
    var transfer = new AMap.Transfer(transOptions);

    var arrivalRange = new AMap.ArrivalRange();
    var polygonArray=[];



    var infoWindow = new AMap.InfoWindow({
        offset: new AMap.Pixel(0, -30),
        autoMove: false,
    });

    $.getJSON("/assets/data/rent_room/58-600-1000.json", function(data) {
        var markers = [];

        $.each(data, function() {
            marker = new AMap.Marker({
                icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
                position: [this.lon,this.lat],
                map: map
            });

            marker.content = "<div style=\"padding:0px 0px 0px 4px;font-size: 12px;\">" + this.title + "<br>" + this.price + "<br>" + "<a href=" + this.link + ">details</a>" + "</div>";
            // AMap.event.addListener(marker,"click",function() {
            marker.on("click",function() {
                infoWindow.setContent(this.content);
                infoWindow.open(map, this.getPosition());
                // if(transfer) {
                // transfer.clear();
                // }
                // transfer.search(centerMarker.getPosition(), this.getPosition());
            });
            marker.on("dblclick",function() {
                if (transfer) {
                    transfer.clear();
                }
                transfer.search(centerMarker.getPosition(), this.getPosition());
            });
            marker.emit('click', {target: marker});
            markers.push(marker);
        });
        if (infoWindow.getIsOpen()) {
            infoWindow.close();
        }
        /*
        markers.forEach(function(marker) {
        mk = new AMap.Marker({
        map: map,
        position: [marker.lon, marker.lat],
    });
    mk.on("click", function() {
    transfer.search(centerMarker.getPosition(), this.getPosition());
});
});
*/
});

centerMarker.on("click",function(){
    loadWorkRange(centerMarker.getPosition(),60,"#3f67a5", "SUBWAY,BUS");
});

centerMarker.on("dragstart",function() {
    delPolygon();
});

function delPolygon(){
    map.remove(polygonArray);
    polygonArray=[];
}

function loadWorkRange(lngLat, t, color, v) {
    arrivalRange.search(lngLat, t, function(status, result) {
        delPolygon();
        if (result.bounds) {
            for (var i = 0; i < result.bounds.length; i++) {
                var polygon = new AMap.Polygon({
                    map: map,
                    fillColor: color,
                    fillOpacity: "0.4",
                    strokeColor: color,
                    strokeOpacity: "0.8",
                    strokeWeight: 1
                });
                polygon.setPath(result.bounds[i]);
                polygonArray.push(polygon);
            }
        }
    }, {
        policy: v
    });
}

map.on("click", function() {
    if (transfer) {
        transfer.clear();
    }
});

map.setFeatures(["bg","road","point","building"]);
map.setFitView();
});
