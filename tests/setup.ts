// 测试环境设置
process.env.NODE_ENV = 'test';

// 模拟 console 方法以避免测试输出
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};
