import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response, Request } from "express";
import { resolve } from "path";
import sanitize = require('sanitize-filename');

const allowedExt = [
	'js', 'ico', 'css', 'png', 'jpg', 'woff2', 'woff', 'ttf', 'svg', 'mp4', 'pdf',
	'gif', 'jpeg', 'tiff', 'bmp', 'cur', 'apng', 'webp', 'avif', 'otf', 'webmanifest'
];

const resolvePath = (path: string) => resolve(`./dist-angular/${path}`);

@Injectable()
export class AngularMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		if (req.url.includes('/api')) {
			next();
		} else if (req.url.startsWith('/assets') || allowedExt.some(v => req.url.split('.')[req.url.split('.').length - 1] == v)) {
			res.sendFile(resolvePath(sanitize(decodeURI(req.url))));
		} else {
			res.sendFile(resolvePath('index.html'));
		}

	}
}

