import { Test, TestingModule } from '@nestjs/testing';
import { LoginTraceService } from './login-trace.service';

describe('LoginTraceService', () => {
  let service: LoginTraceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginTraceService],
    }).compile();

    service = module.get<LoginTraceService>(LoginTraceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
