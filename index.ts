import readLineSync from "readline-sync";
import nodeMailer from "nodemailer";
import fs from "fs";

const username = readLineSync.questionEMail("Email: ");
const password = readLineSync.question("Password: ", { hideEchoBack: true });

const recipientName = readLineSync.question("Recipient name: ");
const recipientMail = readLineSync.question("Recipient mail: ");

const recipientAddress = readLineSync.question("Recipient address: ");
const recipientPostal = readLineSync.question("Recipient postalcode: ");
const recipientCity = readLineSync.question(
	"Recipient city (in regards to postal code): "
);

const fileNames = fs.readdirSync("./attachments");

let files: ({ content: string; filename: string } | { path: string })[] = [];

const now = new Date();
const date = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`;

fileNames.forEach((filename) => {
	files.push({
		content: fs
			.readFileSync("./attachments/" + filename)
			.toString()
			.replaceAll("RECIPIENT", recipientName)
			.replaceAll("DATE", date)
			.replaceAll("ADDRESS", recipientAddress)
			.replaceAll("POSTAL", recipientPostal)
			.replaceAll("CITY", recipientCity),
		filename,
	});
});

files.push(
	...fs.readdirSync("./static-attachments").map((staticFile) => {
		return { path: "./static-attachments/" + staticFile };
	})
);

const transporter = nodeMailer.createTransport({
	service: "gmail",
	auth: {
		user: username,
		pass: password,
	},
});
transporter.verify().then(console.log).catch(console.error);

const body = fs
	.readFileSync("./body.txt")
	.toString()
	.replaceAll("RECIPIENT", recipientName);

const readyToSend = readLineSync.keyInYNStrict("Are you ready to send?");

if (readyToSend) {
	transporter
		.sendMail({
			to: recipientMail,
			from: username,
			subject: "Søknad om praksisplass ved " + recipientName,
			attachments: files,
			text: body,
		})
		.then((info) => {
			console.log(info);
		});
}
