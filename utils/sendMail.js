const mailjet = require ('node-mailjet');

const transporter = mailjet.connect(
    '7b4abcf477976482d9027d1872981b31', 
    '777951cbde2ade5d0a4561cc00d6f2b2'
);


module.exports = function (email, title, body, html, callback) {
    const request = transporter.post('send').request({
        FromEmail: 'vishwaszadte@gmail.com',
        FromName: "Ecommerce App",
        Subject: title,
        'Text-part':
            body,
        'Html-part':
            html,
        Recipients: [{ Email: email}],
    })
    request
    .then(result => {
        callback();
    })
    .catch(err => {
        callback("error occured");
    })
}