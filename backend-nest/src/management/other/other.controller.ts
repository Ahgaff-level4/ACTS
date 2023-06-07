import { BadRequestException, Controller, Get, Inject, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectDataSource } from '@nestjs/typeorm';
import { Mutex } from 'async-mutex';
import { Response } from 'express';
import { createReadStream, unlink } from 'fs';
import mysqldump from 'mysqldump';
import { createInterface } from 'readline/promises';
import { Roles } from 'src/auth/Role.guard';
import { UserMust } from 'src/utility.service';
import { NotificationGateway } from 'src/websocket/notification.gateway';
import { Readable } from 'stream';
import { DataSource } from 'typeorm';
import { createGunzip, createGzip } from 'zlib';
import { User } from '../../../../interfaces';


@Controller('api')
export class OtherController {
	// Create a mutex instance to lock the flow. So that backup/recovery process will be async
	private mutex = new Mutex();

	constructor(@InjectDataSource() private dataSource: DataSource, private notify: NotificationGateway) { }

	@Get('backup')
	@Roles('Admin')
	async backup(@Res() res: Response,@UserMust() user:User) {
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
				dump: {
					tables: ['person_entity', 'account_entity', 'role_entity',
						'account_entity_roles_entities_role_entity', 'program_entity', 'field_entity',
						'child_entity', 'account_entity_teaches_child_entity',
						'activity_entity', 'goal_entity', 'evaluation_entity',
						'typeorm_metadata'],
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
			this.notify.emitNewNotification({
				by: user,
				controller: 'backup',
				datetime: new Date(),
				method: null,
				payloadId: -1,//segregation design pattern :/
				payload: undefined,//segregation design pattern :/
			});
		} catch (e) {
			console.error(e);
			throw e;
		} finally {
			// Release the lock
			release();
		}
	}

	@Post('restore')
	@Roles('Admin')
	@UseInterceptors(FileInterceptor('backup'))
	async restore(@UploadedFile() file: Express.Multer.File,@UserMust() user:User) {
		// Acquire the lock
		const release = await this.mutex.acquire();
		return await new Promise(async (res, rej) => {
			try {
				//Diagram flow of restore process:
				// client send backup file >> server's buffer >> read stream from buffer >> uncompressing stream (gunzip) >> read line by line from gunzip >> store lines into variable until a line ends with `;`(sql statement) >> execute the sql statement
				if (file.buffer.length < 1024 * 3) {
					throw new BadRequestException('File size is very small!')
				} else if (!file.originalname.endsWith('.sql.gz')) {
					throw new BadRequestException('File extension is invalid! Expected `.sql.gz`');
				}
				const readStream = Readable.from(file.buffer);
				const gunzip = createGunzip();
				readStream.pipe(gunzip);

				//! Recreate the Database
				const dbName = this.dataSource.options.database.toString();
				this.dataSource.transaction(async (manager)=>{
					const queryRunner = manager.queryRunner;
					await queryRunner.dropDatabase(dbName, true);
					await queryRunner.createDatabase(dbName, true);
					await queryRunner.query('USE ' + dbName);
					
					// create a readline interface to read the stream line by line
					const readline = createInterface({
						input: gunzip,
						crlfDelay: Infinity
					});
					
					let buffer = '';
					for await (const line of readline) {
						// if line is empty or sql comment ignore it.
						if (line.trim().length == 0 || line.substring(0, 2) == '/*' || line.substring(0, 2) == '# ')
						continue;
						
						buffer += line;
						// check if the buffer ends with a semicolon, indicating a complete statement
						if (buffer.trimEnd().endsWith(';')) {
							// execute the statement
							console.log('execute chunk:', buffer);
							await queryRunner.query(buffer);
							// clear the buffer
							buffer = '';
						} else buffer += '\n';
					}
					
					//Reconnect to the database; because database was dropped
					await this.dataSource.destroy();
					await this.dataSource.initialize();
					this.notify.emitNewNotification({
						by: user,
						controller: 'restore',
						datetime: new Date(),
						method: null,
						payloadId: -1,//segregation design pattern :/
						payload: undefined,//segregation design pattern :/
					});
					res({ success: true });
				});
			} catch (e) {
				console.error(e);
				rej(e);
			}
			// Release the lock
		}).finally(() => release());

	}

}
