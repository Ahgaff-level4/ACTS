import { Module } from '@nestjs/common';
import { FileManagerController } from './file-manager.controller';

@Module({
  controllers: [FileManagerController],
})
export class FileManagerModule {}
