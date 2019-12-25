

/**
 *
 *节流，减少触发次数
 * a_b_c_d_e_f_g
 * 1____1____1
 *触发a、c、f、g
 * callback需要执行参数解析
 * */
rap.debounce = function (callback, time, uuid, params) {

	if(!uuid){
		console.log("请提供唯一的标识");
	}

	time = time || 10000;

    rap.debounce[uuid] = rap.debounce[uuid]||{params:[]};

	var control =  rap.debounce[uuid];

    //control.params的length表示10s内调用的次数
    control.params.push(params);

	//锁定10s
	if (!control.lock) {

        callback(control.params,uuid);

        control.params = [];

		setTimeout(function () {

            control.lock = false;
            //如果length不为0，表示lock期间有调用
            if( control.params.length ){
                callback(control.params,uuid);
                control.params = [];
            }

		}, time);

        control.lock = true;

	}



};


/**
 *
 *按周期来
 *
 * */
rap.interval = function (callback, time) {

	setTimeout(function () {

		callback();

		rap.interval(callback, time);

	}, time);

};


/**
 *
 * 获取下一个的值
 *
 * */
function getNextValue(arr, curVal) {

	var nextValue;
    var newArr = Object.create(arr);
    newArr.sort(function (a, b) {

		return (a - b > 0) ? -1 : 1;

	});

    newArr.forEach(function (val) {

		if (curVal < val) {

			nextValue = val;

		}

	});

	return nextValue;
}


/**
 *
 * 按照时钟去timeout
 *
 * */
rap.intervalByHour = function (callback, hours, name) {

	var curHour = new Date().getHours();

	var nextHour = getNextValue(hours, curHour);

	var nextDate = new Date();

	if (typeof nextHour == "undefined") {

		nextDate = new Date(+new Date() + 24 * 60 * 60 * 1000);

		nextDate.setHours(hours[0]);

	} else {

		nextDate.setHours(nextHour);

	}

	nextDate.setSeconds(0);

	nextDate.setMinutes(0);

	var timeoutTime = nextDate.getTime() - new Date().getTime();

    // console.log("[intervalByHour]", name || "", "下一次启动将在", Math.round(timeoutTime / 1000 / 60 / 6) / 10, "小时后");

	setTimeout(function () {

		callback();

		rap.intervalByHour(callback, hours);

	}, timeoutTime)

};


/**
 *
 * 按照星期点去timeout
 *
 * */
rap.intervalByWeek = function (callback, weeks, name) {

	var curweek = new Date().getDay();
    //如果当前在设置时间之后，就返回undefined
	var nextweek = getNextValue(weeks, curweek);

	//超过了
	var d, nextDate;

	if (typeof nextweek == "undefined") {

		d = weeks[0] - curweek + 7;
        //+1需要设置当天从凌晨开始
        nextDate = new Date(+new Date() + 24 * 60 * 60 * 1000 * (d+1));
	} else {

		d = nextweek - curweek;
        nextDate = new Date(+new Date() + 24 * 60 * 60 * 1000 * d);
	}

	// console.log("[intervalByWeek]", name || "", "下一次启动将在", d, "天后");


	nextDate.setHours(0);

	nextDate.setSeconds(0);

	nextDate.setMinutes(0);

	var timeoutTime = nextDate - new Date();

	setTimeout(function () {

		callback();

		rap.intervalByWeek(callback, weeks);

	}, timeoutTime)


};
