const SENDER_EMAIL = process.env.SENDER_EMAIL
 
 function inviteOutput(email){
    var data = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dsigma Email</title>
    </head>
    <body style="background-color: rgb(201, 201, 201);">
        <header>
            
        </header>
    
    <table style="margin: auto; background-color: white;">
        <tbody>
            <tr>
                <td id="logo" style="display:block; text-align: center;">
                    <img src="https://i.im.ge/2022/06/19/re2zMa.png" alt="Crinitis logo" width="150px">
                </td>
            </tr>
            <tr>
                <th style="font-size:20px; padding: 10px;">Hi ${email}</th>
            </tr>
            <tr>
                <td style="text-align:center;">You have been invited by <strong>Hardik Pokiya</strong> to join Criniti's</td>
            </tr>
    
            <tr style="text-align: center;">
                    <td>
                        <table style="text-align: center; margin: auto; border: 3px solid;">
                            <tr>
                            <th style="padding: 10px; font-size:20px" >
                                New to DSigma? 
                             </th>
                            </tr>
                            <tr>
                             <td style="text-align:center;">
                                 If you don't have an account please
                             </td>
                            </tr>
                            <tr>
                             <td style="text-align:center; padding: 10px;">
                            <a href="https://dsigma.net">
                             <button style="background-color:black; color:white; padding: 5px; border-radius: 5px;">Register Now</button>
                            </a> 
                            </td>
                            </tr>
                        </table>
                    </td>
            </tr>
    
            <tr>
                <td style="text-align:center; padding: 10px;">NEED HELP?</td>
            </tr>
            <tr>
                <td style="text-align:center; padding: 10px">Please click the <u>"Sign Up"</u>. tab to create your account once you click the register link provided.</td>
            </tr>
            <tr>
                <td style="text-align:center; padding: 10px">Having troubles creating an account or signing in, please contact the Dsigma<br>team by email, <u>support@dsigma.com.au</u>, our team will gladly assit you.</td>
            </tr>
            <tr>
                <td style="text-align:center; padding: 15px"><img src="https://dsigma.net/assets/images/dsigma-logo.png" alt="Dsigma logo" width="100px"></td>
            </tr>
            <tr>
                <td style="text-align:center;"><strong>DSigma PYT Ltd.</strong></td>
            </tr>
            <tr>
                <td style="text-align:center;">Restaurant & Business Management Software</td>
            </tr>    
            <tr>    
                <td style="text-align:center;">Learn how you can simplify and transform your business today!</td>
            </tr>
        </tbody>   
    </table>
    
    </body>
    </html>
`
    return JSON.stringify(data);
    
}

function onboardingOutput(details){
    const output = `
    <h1>New Entry</h1>
    <p>Details of the Invited employee</p>
    <br>
    <p>Title: ${details.title} </p>
    <p>Name: ${details.fname} </p>
    <p>Work Email: ${details.workEmail} </p>
    <p>Personal Email: ${details.personalEmail} </p>
    <p>Mobile No. : ${details.mobileNumber} </p>
    <p>D.O.B: ${details.DOB} </p>
    <p>Marital Status: ${details.maritalStatus} </p>
    <p>Gender: ${details.gender} </p>
    <p>medicare Number: ${details.medicareNumber} </p>
    <p>Drivers License: ${details.driversLicense} </p>
    <p>Passport Number: ${details.passportNumber} </p>
    <p>Bank Name: ${details.bankName} </p>
    <p>Account Number: ${details.accountNumber} </p>
    <p>Tax File Number: ${details.taxFileNumber} </p>
    <p>Working Rights: ${details.workingRights} </p>
    <p>LinkedIn: ${details.linkedIn} </p>
    <p>Facebook: ${details.facebook} </p>
    <p>address: ${details.address} </p>
    <p>Secondary Address: ${details.address2} </p>
    <p>City: ${details.city} </p>
    <p>State: ${details.state} </p>
    <p>Post Code: ${details.postCode} </p>
    <p>Country: ${details.country} </p>
    <p>Pin Code: ${details.pinCode} </p>
    `;
    return output
}

function activationOutput(pin, email, name, senderEmail){
    return {
        // from :  `${name} <${senderEmail}>`,
        from: `noreply@dsigma.com.au`,
        to: email,
        subject: `Activation Mail `,
        html: `
        <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DSigma Email Activation Notification</title>
</head>

<body style="background-color: rgb(216, 216, 216);">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f7f7f7">
        <tbody>
            <tr>
                <td valign="top" bgcolor="#f7f7f7" width="100%">
                    <table width="100%" role="content-container" align="center" cellpadding="0" cellspacing="0" border="0">
                        <tbody>
                            <tr>
                                <td width="100%">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                                        style="width:100%;max-width:600px" align="center">
                                                        <tbody>
                                                            <tr>
                                                                <td role="modules-container" style="padding:0px 0px 0px 0px;color:#111111;text-align:left" 
                                                                bgcolor="#FFFFFF" width="100%" align="left">
                                                                    <table 
                                                                        role="module" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="display:none!important;opacity:0;color:transparent;height:0;width:0">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td role="module-content">
                                                                                    <p>Your profile for Criniti's has
                                                                                        been activated on DSigma</p>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <table role="module" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="table-layout:fixed">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style="padding:0px 0px 20px 0px"
                                                                                    role="module-content"
                                                                                    bgcolor="#f7f7f7">
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <table role="module" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="table-layout:fixed">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td height="100%" valign="top"
                                                                                    role="module-content">
                                                                                    <table cellspacing="0"
                                                                                        cellpadding="0" align="center"
                                                                                        valign="middle"
                                                                                        style="width:100%;height:60px;background:#000000;margin:0px;padding:0px">
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <td height="60"
                                                                                                    align="center"
                                                                                                    valign="middle"
                                                                                                    style="width:60px;height:60px">
                                                                                                    <img width="60"
                                                                                                        height="60"
                                                                                                        style="display:block;border:0px;outline:none;height:100%;max-height:60px;width:100%;max-width:60px"
                                                                                                        src="https://i.ibb.co/92b6sFp/logo.png"
                                                                                                        >
                                                                                                </td>
                                                                                                <td height="60"
                                                                                                    align="center"
                                                                                                    valign="middle"
                                                                                                    style="line-height:100%">
                                                                                                    <h1
                                                                                                        style="vertical-align:middle;line-height:100%;text-align:center;font-family:helvetica,sans-serif;font-weight:bold;font-size:21px;color:#fff;margin:0px;padding:0px">
                                                                                                        Criniti's</h1>
                                                                                                </td>
                                                                                                <td height="60"
                                                                                                    align="center"
                                                                                                    valign="middle"
                                                                                                    style="width:60px;height:60px">
                                                                                                    
                                                                                                </td>
                                                                                            </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <table role="module" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="table-layout:fixed">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style="padding:18px 20px 10px 20px;line-height:40px;text-align:inherit"
                                                                                    height="100%" valign="top"
                                                                                    bgcolor="" role="module-content">
                                                                                    <div>
                                                                                        <h1
                                                                                            style="text-align:center;line-height:26px;margin-top:10px">
                                                                                            <span
                                                                                                style="color:#000000;line-height:28px;font-size:24px;font-family:helvetica,sans-serif">Your
                                                                                                profile has been
                                                                                                activated on DSigma
                                                                                                <img data-emoji="🤩"
                                                                                                    class="an1" alt="🤩"
                                                                                                    aria-label="🤩"
                                                                                                    src="https://fonts.gstatic.com/s/e/notoemoji/14.0/1f929/32.png"
                                                                                                    loading="lazy"></span>
                                                                                        </h1>
                                                                                        <div></div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <table role="module" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="table-layout:fixed">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style="padding:0px 50px 20px 50px;line-height:24px;text-align:inherit;background-color:#ffffff"
                                                                                    height="100%" valign="top"
                                                                                    bgcolor="#ffffff"
                                                                                    role="module-content">
                                                                                    <div>
                                                                                        <div
                                                                                            style="font-family:inherit;text-align:center">
                                                                                            <span
                                                                                                style="font-family:helvetica,sans-serif"><strong>Criniti's</strong></span><span
                                                                                                style="font-family:helvetica,sans-serif">
                                                                                                has </span><span
                                                                                                style="font-family:helvetica,sans-serif;color:#34a958"><strong>activated
                                                                                                </strong></span><span
                                                                                                style="font-family:helvetica,sans-serif">your
                                                                                                profile, you will now
                                                                                                receive your shifts
                                                                                                using DSigma.</span>
                                                                                        </div>
                                                                                        <div></div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <table role="module" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="table-layout:fixed">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style="padding:0px 15px 0px 15px;line-height:22px;text-align:inherit"
                                                                                    height="100%" valign="top"
                                                                                    bgcolor="" role="module-content">
                                                                                    <div>
                                                                                        <h1
                                                                                            style="text-align:center;font-family:inherit;font-weight:bold;margin-top:5px;margin-bottom:5px">
                                                                                            <span style="font-family:helvetica,sans-serif; font-size: 24px">
                                                                                                Clock In and Out on DSigma Kiosk</span></h1>
                                                                                        <div></div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <table role="module" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="table-layout:fixed">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style="padding:10px 50px 20px 50px;line-height:24px;text-align:inherit;background-color:#ffffff"
                                                                                    height="100%" valign="top"
                                                                                    bgcolor="#ffffff"
                                                                                    role="module-content">
                                                                                    <div>
                                                                                        <div
                                                                                            style="font-family:inherit;text-align:center">
                                                                                            <span
                                                                                                style="font-family:helvetica,sans-serif">If
                                                                                                your workplace uses the
                                                                                                DSigma Kiosk app, use
                                                                                                the PIN below to clock
                                                                                                in and out</span></div>
                                                                                        <div></div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <table role="module" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="table-layout:fixed">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td height="100%" valign="top"
                                                                                    role="module-content">
                                                                                    <div style="margin:20px 50px">
                                                                                        <table
                                                                                            style="font-family:helvetica,sans-serif;text-align:center;width:100%">
                                                                                            <tbody>
                                                                                                <tr
                                                                                                    style="background:#efefef">
                                                                                                    <td
                                                                                                        style="padding:20px;background:#eeeeee">
                                                                                                        <div
                                                                                                            style="font-family:inherit;text-align:center">
                                                                                                            <h3
                                                                                                                style="text-align:center">
                                                                                                                <img style="vertical-align:middle;margin-right:15px"
                                                                                                                    src="https://ci3.googleusercontent.com/proxy/WCQ0Ev1uf06swPOR8_PcFYFE9ZP7bF6eRw7XvTvPo-04DAQYbXBUKcZ4b7dNRKv6-pLvuocNqKMI51-2xV8GciYIfqp6qFWVpUAIadYXALI1qCINf3Bzowr4oSmKSZjg4e2KV6ZRzvHPmS3eQpyL6qyrnXigA5G2iP6QPM2B2ztDKTo=s0-d-e1-ft#http://cdn.mcauto-images-production.sendgrid.net/f9f5f46be8acedab/e57d63cd-adac-4311-bb56-1524ab99dc8d/32x32.png"
                                                                                                                    alt="lock"
                                                                                                                    height="20"
                                                                                                                    width="20">Your Kiosk PIN</h3>
                                                                                                        </div>
                                                                                                        <div style="font-family:inherit;text-align:center">
                                                                                                            <p style="color:#000000;letter-spacing:4px;margin-bottom:30px; font-weight: 600;font-size: 24px">
                                                                                                                <span style="background-color: #fff; padding: 10px 7px;margin: 1px;">${pin.substring(0,1)}</span>
                                                                                                                <span style="background-color: #fff; padding: 10px 7px;margin: 1px">${pin.substring(1,2)}</span>
                                                                                                                <span style="background-color: #fff; padding: 10px 7px;margin: 1px">${pin.substring(2,3)}</span>
                                                                                                                <span style="background-color: #fff; padding: 10px 7px;margin: 1px">${pin.substring(3,4)}</span>
                                                                                                                <span style="background-color: #fff; padding: 10px 7px;margin: 1px">${pin.substring(4,5)}</span>
                                                                                                            </p>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <table role="module" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="table-layout:fixed">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style="padding:10px 40px 20px 40px;line-height:24px;text-align:inherit;background-color:#ffffff"
                                                                                    height="100%" valign="top"
                                                                                    bgcolor="#ffffff"
                                                                                    role="module-content">
                                                                                    <div>
                                                                                        <div
                                                                                            style="font-family:inherit;text-align:center">
                                                                                            <span style="font-family:helvetica,sans-serif">
                                                                                                Your PIN is a unique code that is assigned to you,
                                                                                                please DO NOT share this pin with anyone. If you
                                                                                                are having trouble with your PIN please contact
                                                                                                your manager.
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <table role="module" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="table-layout:fixed">
                                                                        <tbody>
                                                                            
                                                                        </tbody>
                                                                    </table>
                                                                    <table role="module" border="0" cellpadding="0"
                                                                        cellspacing="0" width="100%"
                                                                        style="table-layout:fixed">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td height="100%" valign="top"
                                                                                    role="module-content">
                                                                                    <div
                                                                                        style="text-align:center;background:#f7f7f7;padding:20px">
                                                                                        <a href="https://app.dsigma.net"
                                                                                            title="DSigma App"
                                                                                            target="_blank"
                                                                                            data-saferedirecturl="https://app.dsigma.net"><img
                                                                                                height="30" width="auto"
                                                                                                style="max-height:30px;height:30px"
                                                                                                src="https://i.ibb.co/stpsdH3/dsigma-logo.png"
                                                                                                ></a>
                                                                                        <p
                                                                                            style="font-family:helvetica,sans-serif;text-align:center;line-height:16px;font-size:10px;font-weight:bold;margin-bottom:0px">
                                                                                            DSIGMA PTY LTD.
                                                                                        </p>
                                                                                        <p
                                                                                            style="font-family:helvetica,sans-serif;text-align:center;line-height:16px;font-size:10px;margin-bottom:0px">
                                                                                            Restaurant &amp; Business
                                                                                            Management Software</p>
                                                                                        <p
                                                                                            style="font-family:helvetica,sans-serif;text-align:center;line-height:16px;font-size:10px">
                                                                                            Learn how you can simplify
                                                                                            and transform your business
                                                                                            today!</p>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</body>

</html>
        `
    }
}
module.exports = {
    inviteOutput,
    onboardingOutput,
    activationOutput
}
