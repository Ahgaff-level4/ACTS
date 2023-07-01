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
	'.mp4',
	'.pdf',
	'.gif',
	'.jpeg',
	'.tiff',
	'.bmp'
];

const resolvePath = (file: string) => resolve(`./dist-angular/${file}`);

@Injectable()
export class AngularMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		if (req.url.includes('/api')) {
			next();
		} else if (req.url.startsWith('/assets') || allowedExt.some(v => req.url.includes(v))) {
			res.sendFile(decodeURI(resolvePath(req.url)));
		} else {
			res.sendFile(resolvePath('index.html'));
		}

	}
}

