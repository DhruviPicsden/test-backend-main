function formatDate(date) {
    let day = date.getDate();
    let month = date.getMonth();
    let monthName = getMonthName(month);
  
    return `${day} ${monthName}`;
  }
  
  function getMonthName(month) {
    let shortMonths = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return shortMonths[month];
}


function stringifyWeek(week) {
    let parts = week.split("-W");
    let year = parseInt(parts[0]);
    let weekNum = parseInt(parts[1]);
  
    let date = new Date(year, 0, 1 + (weekNum) * 7);
    let weekStart = new Date(date.setDate(date.getDate() - (date.getDay() + 6) % 7));
    let weekEnd = new Date(date.setDate(date.getDate() + 6));
  
    let start = formatDate(weekStart);
    let end = formatDate(weekEnd);
  
    return `${start} - ${end}`;
  }
  

exports.stringifyWeek = stringifyWeek;
