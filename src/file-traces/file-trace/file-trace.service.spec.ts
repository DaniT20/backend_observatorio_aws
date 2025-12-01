import { Test, TestingModule } from '@nestjs/testing';
import { FileTraceService } from './file-trace.service';

describe('FileTraceService', () => {
  let service: FileTraceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileTraceService],
    }).compile();

    service = module.get<FileTraceService>(FileTraceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
