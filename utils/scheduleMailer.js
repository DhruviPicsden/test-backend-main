const { stringifyWeek } = require("./stringifyWeek");
const { transporter } = require("./transporter");


function formatISOToDesiredFormat(isoDate) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
    const getDayOfMonthSuffix = (day) => {
      if (day >= 11 && day <= 13) {
        return 'th';
      }
      switch (day % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };
  
    const date = new Date(isoDate);
    const dayOfWeek = daysOfWeek[date.getUTCDay()];
    const dayOfMonth = date.getUTCDate();
    const month = months[date.getUTCMonth()];
  
    const formattedDate = `${dayOfWeek}, ${dayOfMonth}${getDayOfMonthSuffix(dayOfMonth)} ${month}`;
    return formattedDate;
  }
  

const amPm = (time) => {
    //18:00 to 6:00 PM
    let timeArray = time.split(':');
    let hour = timeArray[0];
    let min = timeArray[1];
    let ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    let timeString = `${hour}:${min} ${ampm}`;
    return timeString;
}


exports.mailer = async (mailID, employeeName, shiftTable, week, branchName, companyName) => {
 let weekString = stringifyWeek(week);
 const mailOptions = {
    from : 'scheduling@dsigma.com.au',
    to : mailID,
    subject : `📆 Your Sceduled Work for ${weekString}`,
    html : `
        <html>
        <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;" >
        <div style="margin:50px auto; border: 3px solid rgb(23, 27, 87); border-radius: 25px 25px 15px 15px; width: fit-content;">
        <table style="background-color: #fff; border-collapse: collapse; border-radius: 15px; ">
        <thead style="height: 70px;">
            <tr style="text-align: center; background-color: rgb(23, 27, 87);">
                <td style="border-radius: 15px 15px 0 0;">
                    <img style="background-color: aliceblue; padding: 5px; border-radius: 3px;" src="https://www.dsigma.com.au/assets/images/dsigma-logo.png"
                        alt="dsigma-logo" width="125px" height="40px" />
                </td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="padding: 20px 0 0 20px;">
                    <span style="font-size: 1.5rem; font-weight: 600; color: rgb(0, 0, 0);">
                        Hi, ${employeeName} 👋,
                    </span>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px;">
                    <span style="font-size: 1.2rem; font-weight: 500; color: rgb(0, 0, 0);">
                        Your shift at ${companyName} - ${branchName} has been Published.
                    </span>
                    <br>
                    <span style="font-size: 1.2rem; font-weight: 600; color: rgb(0, 0, 0);">
                        ${weekString}
                    </span>
                </td>
            </tr>
            <tr>
                <td style="padding:0 0 0 20px;">
                    <span style="font-size: 1.3rem; font-weight: 600; color: rgb(0, 0, 0);">
                        Shift Details:
                    </span>
                </td>
            </tr>
            <tr>
                <td style="padding: 0 0 0 20px; ">
                    <table style="border-collapse: separate;  border-spacing: 5px 7px;">
                        <tbody>
                            ${shiftTable.map((shift) => {
                                return `
                                    <tr>
                                        <td
                                            style="background-color:  rgb(208, 242, 255); border-radius: 10px; padding: 5px 30px 5px 5px;">
                                            <span style="font-size: 1rem; font-weight: 500; color: rgb(0, 0, 0);">
                                                ${formatISOToDesiredFormat(shift.date)}
                                            </span>
                                            <br>
                                            <span style="font-size: 1rem; font-weight: 600; color: rgb(0, 0, 0);">
                                                ${amPm(shift.startTime)} - ${amPm(shift.endTime)}
                                            </span>
                                        </td>
                                    </tr>
                                `
                            }).join('')}
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="padding: 30px 0 0 0; text-align: center;">
                    <span style="font-size: 1.2rem; font-weight: 600; color: rgb(0, 0, 0);">
                        ${companyName}
                    </span>
                </td>
            </tr>
            <tr>
                <td style="padding: 5px 0 15px 0;">
                    <table style="margin: auto;  max-width: 250px;" align-content="start">
                        <tbody>
                            <tr>
                                <td style="vertical-align: top;">
                                    <span>
                                        <img src="https://i.postimg.cc/dQ6JnsgD/location.png" alt="location" width="25px" height="25px" />
                                    </span>
                                </td>
                                <td>
                                    <span style="font-size: 1rem; font-weight: 500; color: rgb(0, 0, 0);">
                                        ${branchName}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
    </div>
</body>
        </html>
    `
 };
 await transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
        console.log(err);
    } else {
        console.log(info);
    }



});
}