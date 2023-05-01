import { Controller, Get, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { } from '@nestjs/platform-express/';
import { InjectDataSource } from '@nestjs/typeorm';
import { Mutex } from 'async-mutex';
import { Response } from 'express';
import { ReadStream, createReadStream, createWriteStream, unlink } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import mysqldump from 'mysqldump';
import { join } from 'path';
import { Roles } from 'src/auth/Role.guard';
import { Readable } from 'stream';
import { DataSource } from 'typeorm';
import { createGunzip, createGzip } from 'zlib';
@Controller('api')
export class OtherController {
	// Create a mutex instance to lock the flow. So that backup/recovery process will be async
	private mutex = new Mutex();

	constructor(@InjectDataSource() private dataSource: DataSource) { }

	@Get('backup')
	@Roles('Admin')
	async backup(@Res() res: Response) {
		// Acquire the lock
		const release = await this.mutex.acquire();
		try {
			const fileName = 'ACTS backup ' + new Date().toISOString().replace(/[:.]/g, '_') + '.sql.gz';
			await mysqldump({
				connection: {
					database: this.dataSource.options.database.toString(),
					user: this.dataSource.options['username'],
					password: this.dataSource.options['password'],
					host: this.dataSource.options['host'],
					port: this.dataSource.options['port'],
				},
				// compressFile: true, needs `gzib` to be installed in the computer!
				dumpToFile: fileName
			});

			const gzipStream = createGzip();
			const stream = createReadStream(fileName);
			stream.pipe(gzipStream);

			res.setHeader('Content-Type', 'application/force-download');
			res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
			gzipStream.pipe(res);
			stream.on('end', () => {
				unlink(fileName, (e) => {
					if (e) { console.log(e); throw e; }
				})
			});
		} catch (e) {
			console.error(e);
			// throw e;
		} finally {
			// Release the lock
			release();
		}
	}

	@Post('restore')
	@Roles('Admin')
	@UseInterceptors(FileInterceptor('backup'))
	async restore(@UploadedFile() file: Express.Multer.File) {
		// Acquire the lock
		const release = await this.mutex.acquire();
		try {
			//Diagram flow of file stream:
			// client >> server's buffer >> read from buffer >> uncompressing (gunzip) >> write stream into server's disk
			const readStream = Readable.from(file.buffer);
			const gunzip = createGunzip();
			const writeStream = createWriteStream(join('backups', Date.now() + '-' + file.originalname.substring(0,file.originalname.length-3)));
			readStream.pipe(gunzip);
			gunzip.pipe(writeStream);
			
			
			//todo execute the file code in sql then delete the file
			return await new Promise((res,rej)=>{
				writeStream.on('error', (e) => {
					throw e;
				});
				writeStream.on('finish', () => res({ success: true }));
			});
		} catch (e) {
			console.error(e);
			throw e;
		} finally {
			// Release the lock
			release();
		}
	}

}
