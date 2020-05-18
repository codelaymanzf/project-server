'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);

  // 验证码
  router.get('/captcha', controller.util.captcha);

  // 邮箱验证码
  router.get('/sendcode', controller.util.sendcode);

  // 上传文件
  router.post('/uploadfile', controller.util.uploadfile);

  // 文件合并
  router.post('/mergefile', controller.util.mergefile);

  router.post('/checkfile', controller.util.checkfile);

  router.group({ name: 'user', prefix: '/user' }, router => {
    const { info, register, login, verify } = controller.user;
    const jwt = app.middleware.jwt({ app });
    router.post('/register', register);
    router.post('/login', login);

    router.get('/info', jwt, info);

    router.get('/verify', verify);
  });
};
