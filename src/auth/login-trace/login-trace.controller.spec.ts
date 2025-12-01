import { Test, TestingModule } from '@nestjs/testing';
import { LoginTraceController } from './login-trace.controller';

describe('LoginTraceController', () => {
  let controller: LoginTraceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginTraceController],
    }).compile();

    controller = module.get<LoginTraceController>(LoginTraceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
