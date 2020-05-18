'use strict';
const svgCaptcha = require('svg-captcha');
const fse = require('fs-extra');
const path = require('path');
const BaseController = require('./base');


class UtilController extends BaseController {
  async captcha() {
    const { ctx } = this;
    const captcha = svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 40,
      noise: 3,
    });
    console.log(captcha.text);

    ctx.session.captcha = captcha.text;
    ctx.response.type = 'image/svg+xml';
    ctx.body = captcha.data;
  }

  async sendcode() {
    const { ctx } = this;
    const email = ctx.query.email;
    const code = Math.random()
      .toString()
      .slice(2, 6);

    console.log('邮箱' + email + '验证码：' + code);

    ctx.session.emailcode = code;

    const subject = '测试邮箱验证码';
    const text = '';
    const html = `<h2>小开社区</h2><a href="https://codelayman.top"><span>${code}</span></a>`;

    const hasSend = await this.service.tools.sendEmail(
      email,
      subject,
      text,
      html
    );
    if (hasSend) {
      this.message('发送成功');
    } else {
      this.error('发送失败');
    }
  }

  async uploadfile() {
    const { ctx } = this;
    const file = ctx.request.files[0];
    const { hash, name } = ctx.request.body;

    const chunkPath = path.resolve(this.config.UPLOAD_DIR, hash);
    if (!fse.existsSync(chunkPath)) {
      await fse.mkdir(chunkPath);
    }

    console.log(file, name);

    // await fse.move(file.filepath, this.config.UPLOAD_DIR + "/" + file.filename);
    await fse.move(file.filepath, `${chunkPath}/${name}`);

    // this.success({
    //   url: `/public/${file.filename}`
    // });
    this.message('切片上传成功');
  }

  async mergefile() {
    const { ext, size, hash } = this.ctx.request.body;
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`);
    await this.ctx.service.tools.mergeFile(filePath, hash, size);
    this.success({
      url: `/public/${hash}.${ext}`,
    });
  }
  // 检查文件是否上传过
  async checkfile() {
    const { ctx } = this;
    const { ext, hash } = ctx.request.body;
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`);

    let uploaded = false;
    let uploadedList = [];

    if (fse.existsSync(filePath)) {
      uploaded = true;
    } else {
      uploadedList = await this.getUploadedList(path.resolve(this.config.UPLOAD_DIR, hash));
    }

    this.success({
      uploaded,
      uploadedList,
    });
  }

  async getUploadedList(dirPath) {
    console.log('dirPath', dirPath);
    return fse.existsSync(dirPath) ? (await fse.readdir(dirPath)).filter(name => name[0] !== '.') : [];
  }
}

module.exports = UtilController;
