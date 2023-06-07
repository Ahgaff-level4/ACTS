import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response,Request } from "express";
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
			// it starts with /api --> continue with execution
			console.log(req.url,'starts with /api')
			next();
		} else if (allowedExt.filter(ext => req.url.indexOf(ext) > 0).length > 0) {
			// it has a file extension --> resolve the file
			console.log(req.url,'it has a file extension');
			res.sendFile(resolvePath(req.url));
		} else {
			// in all other cases, redirect to the index.html! So that Angular handle the rest...
			console.log(req.url,'redirect to index.html')
			res.sendFile(resolvePath('index.html'));
		}

	}
}

