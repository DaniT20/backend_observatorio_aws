import { Test, TestingModule } from '@nestjs/testing';
import { FileTraceController } from './file-trace.controller';

describe('FileTraceController', () => {
  let controller: FileTraceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileTraceController],
    }).compile();

    controller = module.get<FileTraceController>(FileTraceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
