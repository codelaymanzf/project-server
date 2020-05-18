'use strict';
const { Service } = require('egg');
const nodemailer = require('nodemailer');
const fse = require('fs-extra');
const path = require('path');

const userEmail = 'zf_0719@126.com';
const transporter = nodemailer.createTransport({
  service: '126',
  //   serviceConnection: false,
  //   host: "smtp.126.com",
  secure: false,
  auth: {
    user: userEmail,
    pass: ''
  },
});

class ToolsService extends Service {
  async sendEmail(email, subject, text, html) {
    const mailOptions = {
      from: userEmail,
      to: email,
      cc: userEmail,
      subject,
      text,
      html,
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (err) {
      console.log('email error', err);
      return false;
    }
  }

  async mergeFile(filePath, fileHash, size) {
    const chunkDir = path.resolve(this.config.UPLOAD_DIR, fileHash); // 切片的文件夹
    let chunks = await fse.readdir(chunkDir);
    console.log('-------chunks-----', chunks);
    chunks.sort((a, b) => a.split('-')[1] - b.split('-')[1]);
    chunks = chunks.map(cp => path.resolve(chunkDir, cp));
    await this.mergeChunks(chunks, filePath, size);
  }

  async mergeChunks(files, dest, size) {
    const pipeStream = (filePath, writeStream) => new Promise(resolve => {
      const readStream = fse.createReadStream(filePath);
      readStream.on('end', () => {
        fse.unlinkSync(filePath);
        resolve();
      });
      readStream.pipe(writeStream);
    });

    await Promise.all(files.map((file, index) => {
      pipeStream(file, fse.createWriteStream(dest, {
        start: index + size,
        end: (index + 1) + size,
      }));
    }));
  }
}

module.exports = ToolsService;
