function getTimeInSeconds(input) {
    let t;

    if (typeof input === 'string') {
        if (input.length !== 8) {
            // Input is a date string, parse it into a Date object
            input = new Date(input);
        } else {
            // Input is a string in the format 'hh:mm:ss' or 'hhmmss'
            const timeParts = input.includes(':') ? input.split(':') : [input.slice(0, 2), input.slice(2, 4), input.slice(4)];
            const curr_time = timeParts.map(part => parseInt(part, 10));

            if (curr_time.length !== 3 || curr_time.some(isNaN)) {
                throw new Error('Invalid time format. Use HH:MM:SS or HHMMSS.');
            }

            t = curr_time[0] * 3600 + curr_time[1] * 60 + curr_time[2];
            return t;
        }
    }

    if (input instanceof Date) {
        // Input is a Date object
        t = input.getHours() * 3600 + input.getMinutes() * 60 + input.getSeconds();
        return t;
    }

    throw new Error('Invalid input type. Use a string in the format HH:MM:SS or HHMMSS or a Date object.');
}


function convertSecToTime(t) {
    const hours = Math.floor(t / 3600);
    const hh = hours < 10 ? '0' + hours : hours;

    const minutes = Math.floor((t % 3600) / 60);
    const mm = minutes < 10 ? '0' + minutes : minutes;

    const seconds = t % 60;
    const ss = seconds < 10 ? '0' + seconds : seconds;

    return `${hh}:${mm}:${ss}`;
}
function timeGap(st, et) {
    const t1 = getTimeInSeconds(st);
    const t2 = getTimeInSeconds(et);

    const time_diff = Math.abs(t1 - t2);  // Calculate absolute difference
    return time_diff;
}


function totalBreakTime(breaks) {
    let sum = 0;

    for (const breakItem of breaks) {
        const start = breakItem.start;
        const end = breakItem.end;

        try {
            const diff = timeGap(start, end);
            sum += diff;
        } catch (error) {
            console.error('Error calculating break time:', error.message);
        }
    }

    const total = convertSecToTime(sum);
    return total;
}


function totalShiftTime(st, et) {

    let t1 = getTimeInSeconds(st);
    let t2 = getTimeInSeconds(et);

    let time_diff = (t1 - t2 < 0) ? t2 - t1 : t1 - t2;
    // let time_diff = (t1)

    return convertSecToTime(time_diff);
    return time_diff;
}

function breakTimeCalculator(st, et) {
    const t1 = getTimeInSeconds(st);
    const t2 = getTimeInSeconds(et);

    const time_diff = t2 - t1;  // Calculate signed difference
    return convertSecToTime(Math.abs(time_diff));  // Convert to HH:MM:SS format
}

function addTimes(time1, time2) {
    var time1 = time1.split(':');
         var time2 = time2.split(':');
         var hours = Number(time1[0]) + Number(time2[0]);
         var minutes = Number(time1[1]) + Number(time2[1]);
         var seconds = Number(time1[2]) + Number(time2[2]);
         if (seconds >= 60) {
      minutes += Math.floor(seconds / 60);
      seconds = seconds % 60;
         }
         if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes = minutes % 60;
         }
         return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }

module.exports = {
    totalBreakTime,
    timeGap,
    convertSecToTime,
    getTimeInSeconds,
    totalShiftTime,
    breakTimeCalculator,
    addTimes
}