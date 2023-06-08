import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response, Request } from "express";
import { resolve } from "path";

const allowedExt = [
	'.js',
	'.ico',
	'.css',
	'.png',
	'.jpg',
	'.woff2',
	'.woff',
	'.ttf',
	'.svg',
	'.mp4'
];

const resolvePath = (file: string) => resolve(`./dist-angular/${file}`);

@Injectable()
export class AngularMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		if (req.url.indexOf('/api') !== -1) {
			next();
		} else if (allowedExt.filter(ext => req.url.indexOf(ext) > 0).length > 0) {
			res.sendFile(resolvePath(req.url));
		} else {
			res.sendFile(resolvePath('index.html'));
		}

	}
}

