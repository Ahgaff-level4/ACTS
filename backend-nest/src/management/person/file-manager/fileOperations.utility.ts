/* eslint-disable prefer-const */
/* eslint-disable no-var */
import { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';
/**Titlecase functions are built-in by syncfusion nodejs example. 
 * Although they've been changed to promises to increase performance for parallel users requests*/
export const pattern = /(\.\.\/)/g;

export const GetRules: () => Promise<null | AccessDetails> = async () => {
	const details = new AccessDetails();
	const accessRuleFile = "accessRules.json";
	try {
		await fs.promises.access(accessRuleFile);
		var rawData = await fs.promises.readFile(accessRuleFile);
		if (rawData.length === 0) { return null; }
		var parsedData = JSON.parse(rawData.toString());
		var data = parsedData.rules;
		var accessRules = [];
		for (var i = 0; i < data.length; i++) {
			var rule = new AccessRules(data[i].path, data[i].role, data[i].read, data[i].write, data[i].writeContents, data[i].copy, data[i].download, data[i].upload, data[i].isFile, data[i].message);
			accessRules.push(rule);
		}
		if (accessRules.length == 1 && accessRules[0].path == undefined) {
			return null;
		} else {
			details.rules = accessRules;
			details.role = parsedData.role;
			return details;
		}
	} catch {
		return null;
	}
}
const HasPermission = (rule) => {
	return ((rule == undefined) || (rule == null) || (rule == Permission.Allow)) ? true : false;
}

const GetMessage = (rule) => {
	return ((rule.message == undefined) || (rule.message == null)) ? "" : rule.message;
}

const UpdateRules = (filePermission, accessRule) => {
	filePermission.download = HasPermission(accessRule.read) && HasPermission(accessRule.download);
	filePermission.write = HasPermission(accessRule.read) && HasPermission(accessRule.write);
	filePermission.writeContents = HasPermission(accessRule.read) && HasPermission(accessRule.writeContents);
	filePermission.copy = HasPermission(accessRule.read) && HasPermission(accessRule.copy);
	filePermission.read = HasPermission(accessRule.read);
	filePermission.upload = HasPermission(accessRule.read) && HasPermission(accessRule.upload);
	filePermission.message = GetMessage(accessRule);
	return filePermission;
}



export const GetPermission = (filepath: string, name: string, isFile: boolean, contentRootPath: string, filterPath: string, accessDetails: AccessDetails | null): null | AccessPermission => {
	var filePermission = new AccessPermission(true, true, true, true, true, true, "");
	if (accessDetails == null) {
		return null;
	} else {
		accessDetails.rules.forEach((accessRule) => {
			if (isFile && accessRule.isFile) {
				var nameExtension = name.substr(name.lastIndexOf("."), name.length - 1).toLowerCase();
				var fileName = name.substr(0, name.lastIndexOf("."));
				var currentPath = contentRootPath + filterPath;
				if (accessRule.isFile && isFile && accessRule.path != "" && accessRule.path != null && (accessRule.role == null || accessRule.role == accessDetails.role)) {
					if (accessRule.path.indexOf("*.*") > -1) {
						var parentPath = accessRule.path.substr(0, accessRule.path.indexOf("*.*"));
						if (currentPath.indexOf(contentRootPath + parentPath) == 0 || parentPath == "") {
							filePermission = UpdateRules(filePermission, accessRule);
						}
					}
					else if (accessRule.path.indexOf("*.") > -1) {
						var pathExtension = accessRule.path.substr(accessRule.path.lastIndexOf("."), accessRule.path.length - 1).toLowerCase();
						var parentPath = accessRule.path.substr(0, accessRule.path.indexOf("*."));
						if (((contentRootPath + parentPath) == currentPath || parentPath == "") && nameExtension == pathExtension) {
							filePermission = UpdateRules(filePermission, accessRule);
						}
					}
					else if (accessRule.path.indexOf(".*") > -1) {
						var pathName = accessRule.path.substr(0, accessRule.path.lastIndexOf(".")).substr(accessRule.path.lastIndexOf("/") + 1, accessRule.path.length - 1);
						var parentPath = accessRule.path.substr(0, accessRule.path.indexOf(pathName + ".*"));
						if (((contentRootPath + parentPath) == currentPath || parentPath == "") && fileName == pathName) {
							filePermission = UpdateRules(filePermission, accessRule);
						}
					}
					else if (contentRootPath + accessRule.path == filepath) {
						filePermission = UpdateRules(filePermission, accessRule);
					}
				}
			} else {
				if (!accessRule.isFile && !isFile && accessRule.path != null && (accessRule.role == null || accessRule.role == accessDetails.role)) {
					var parentFolderpath = contentRootPath + filterPath;
					if (accessRule.path.indexOf("*") > -1) {
						var parentPath = accessRule.path.substr(0, accessRule.path.indexOf("*"));
						if (((parentFolderpath + (parentFolderpath[parentFolderpath.length - 1] == "/" ? "" : "/") + name).lastIndexOf(contentRootPath + parentPath) == 0) || parentPath == "") {
							filePermission = UpdateRules(filePermission, accessRule);
						}
					} else if (path.join(contentRootPath, accessRule.path) == path.join(parentFolderpath, name) || path.join(contentRootPath, accessRule.path) == path.join(parentFolderpath, name + "/")) {
						filePermission = UpdateRules(filePermission, accessRule);
					}
					else if (path.join(parentFolderpath, name).lastIndexOf(path.join(contentRootPath, accessRule.path)) == 0) {
						filePermission.write = HasPermission(accessRule.writeContents);
						filePermission.writeContents = HasPermission(accessRule.writeContents);
						filePermission.message = GetMessage(accessRule);
					}
				}
			}
		});
		return filePermission;
	}
}

export const GetRelativePath = (rootDirectory: string, fullPath: string): string => {
	if (rootDirectory.substring(rootDirectory.length - 1) == "/") {
		if (fullPath.indexOf(rootDirectory) >= 0) {
			return fullPath.substring(rootDirectory.length - 1);
		}
	}
	else if (fullPath.indexOf(rootDirectory + "/") >= 0) {
		return "/" + fullPath.substring(rootDirectory.length + 1);
	}
	else {
		return "";
	}
}

export const ReadDirectories = (files: string[], contentRootPath: string, req: Request, accessDetails: AccessDetails | null) => {
	var directoryList = [];
	const stats = (file: string) => {
		return new Promise(async (resolve, reject) => {
			var myCwd: any = {};
			const cwd = await fs.promises.stat(file);
			myCwd.name = path.basename(contentRootPath + req.body.path + file);
			myCwd.size = cwd.size;
			myCwd.isFile = cwd.isFile();
			myCwd.dateModified = cwd.ctime;
			myCwd.dateCreated = cwd.mtime;
			myCwd.filterPath = GetRelativePath(contentRootPath, contentRootPath + req.body.path,)//req);
			myCwd.type = path.extname(contentRootPath + req.body.path + file);
			myCwd.permission = GetPermission(contentRootPath + req.body.path + myCwd.name, myCwd.name, myCwd.isFile, contentRootPath, myCwd.filterPath, accessDetails);
			if ((await fs.promises.lstat(file)).isDirectory()) {
				await (await fs.promises.readdir(file)).forEach(async (items) => {
					if ((await fs.promises.stat(path.join(file, items))).isDirectory()) {
						directoryList.push(items[i]);
					}
					if (directoryList.length > 0) {
						myCwd.hasChild = true;
					} else {
						myCwd.hasChild = false;
						directoryList = [];
					}
				});
			} else {
				myCwd.hasChild = false;
				// dir = [];
			}
			directoryList = [];
			resolve(myCwd);
		});
	}
	var promiseList = [];
	for (var i = 0; i < files.length; i++) {
		promiseList.push(stats(path.join(contentRootPath + req.body.path.replace(pattern, ""), files[i])));
	}
	return Promise.all(promiseList);
}

/**true if exists. false otherwise */
export const fileExists = async (fileFolderPath: string): Promise<boolean> => {
	try {
		await fs.promises.access(fileFolderPath);
		return true;
	} catch {
		return false;
	}
}

/**true if created successfully. false otherwise*/
const makeDirectory = async (path: string): Promise<boolean> => {
	try {
		await fs.promises.mkdir(path);
		return true;
	} catch {
		return false;
	}
}

/**true if created. false otherwise */
export const createFolderIfNotExists = async (path: string): Promise<boolean> => {
	try {
		if (!(await fileExists(path))) {
			await makeDirectory(path);
			return true;
		} else return false;
	} catch {
		return false;
	}
}

/**
* Reads text from the file asynchronously and returns a Promise.
*/
export const GetFiles = async (req: Request, contentRootPath: string): Promise<string[]> => {
	await createFolderIfNotExists(contentRootPath);
	return fs.promises.readdir(contentRootPath + req.body.path.replace(pattern, ""));
}

/**
* func to get the file details like path, name and size
*/
export const FileDetails = async (req, res, filepath): Promise<CWD1> => {
	var cwd: any = {};
	const stats = await fs.promises.stat(filepath);
	cwd.name = path.basename(filepath);
	cwd.size = GetSize(stats.size);
	cwd.isFile = stats.isFile();
	cwd.modified = stats.ctime;
	cwd.created = stats.mtime;
	cwd.type = path.extname(filepath);
	cwd.location = req.body.data[0].filterPath
	return cwd;
}

/**
* func to get the size in kb, MB
*/
export const GetSize = (size: number): string => {
	if (size < 1024) return size + ' B';
	else if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
	else if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + ' MB';
	else return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}


export const MoveFolder = async (source, dest) => {
	await createFolderIfNotExists(dest);

	var files = await fs.promises.readdir(source);
	await files.forEach(async (file) => {
		var curSource = path.join(source, file);
		curSource = curSource.replace("../", "");
		if ((await fs.promises.lstat(curSource)).isDirectory()) {
			await MoveFolder(curSource, path.join(dest, file));
			await fs.promises.rmdir(curSource);
		} else {
			await fs.promises.copyFile(path.join(source, file), path.join(dest, file)).catch(e => { throw e })
			await fs.promises.unlink(path.join(source, file)).catch(e => { throw e });
		}
	});
}

export const GetPathPermission = (path: string, isFile: boolean, name: string, filepath: string, contentRootPath: string, filterPath: string, accessDetails: null | AccessDetails) => {
	return GetPermission(filepath, name, isFile, contentRootPath, filterPath, accessDetails);
}

export const ParentsHavePermission = (filepath: string, contentRootPath: string, isFile: boolean, name: string, filterPath: string, accessDetails: AccessDetails | null): boolean => {
	var parentPath = filepath.substr(contentRootPath.length, filepath.length - 1).replace(/\\/g, "/");
	parentPath = parentPath.substr(0, parentPath.indexOf(name)) + (isFile ? "" : "/");
	var parents = parentPath.split('/');
	var currPath = "/";
	var hasPermission = true;
	var pathPermission;
	for (var i = 0; i <= parents.length - 2; i++) {
		currPath = (parents[i] == "") ? currPath : (currPath + parents[i] + "/");
		pathPermission = GetPathPermission(parentPath, false, parents[i], contentRootPath + (currPath == "/" ? "" : "/"), contentRootPath, filterPath, accessDetails);
		if (pathPermission == null) {
			break;
		}
		else if (pathPermission != null && !pathPermission.read) {
			hasPermission = false;
			break;
		}
	}
	return hasPermission;
}

export const AddSearchList = async (filename: string, contentRootPath: string, fileList: string[], files: string[], index: number, accessDetails: null | AccessDetails) => {
	var cwd: any = {};
	var stats = await fs.promises.stat(filename);
	cwd.name = path.basename(filename);
	cwd.size = stats.size;
	cwd.isFile = stats.isFile();
	cwd.dateModified = stats.mtime;
	cwd.dateCreated = stats.ctime;
	cwd.type = path.extname(filename);
	cwd.filterPath = filename.substr((contentRootPath.length), filename.length).replace(files[index], "");
	cwd.permission = GetPermission(filename.replace(/\\/g, "/"), cwd.name, cwd.isFile, contentRootPath, cwd.filterPath, accessDetails);
	var permission = ParentsHavePermission(filename, contentRootPath, cwd.isFile, cwd.name, cwd.filterPath, accessDetails);
	if (permission) {
		if ((await fs.promises.lstat(filename)).isFile()) {
			cwd.hasChild = false;
		}
		if ((await fs.promises.lstat(filename)).isDirectory()) {
			var statsRead = await fs.promises.readdir(filename);
			cwd.hasChild = statsRead.length > 0;
		}
		fileList.push(cwd);
	}
}

/**
* 
* func to check for exising folder or file
*/
export const CheckForDuplicates = async (directory: string, name: string, isFile: boolean): Promise<boolean> => {
	var filenames = await fs.promises.readdir(directory);
	if (filenames.indexOf(name) == -1) {
		return false;
	} else {
		for (var i = 0; i < filenames.length; i++) {
			if (filenames[i] === name) {
				if (!isFile && (await fs.promises.lstat(directory + "/" + filenames[i])).isDirectory()) {
					return true;
				} else if (isFile && !(await fs.promises.lstat(directory + "/" + filenames[i])).isDirectory()) {
					return true;
				} else {
					return false;
				}
			}
		}
	}
}

/**@returns the updated `copyName` */
export const UpdateCopyName = async (path: string, name: string, count: number, isFile: boolean, copyName: string): Promise<string> => {
	var subName = "", extension = "";
	if (isFile) {
		extension = name.substr(name.lastIndexOf('.'), name.length - 1);
		subName = name.substr(0, name.lastIndexOf('.'));
	}
	copyName = !isFile ? name + "(" + count + ")" : (subName + "(" + count + ")" + extension);
	if (await CheckForDuplicates(path, copyName, isFile)) {
		count = count + 1;
		return await UpdateCopyName(path, name, count, isFile, copyName);
	} return copyName;
}
export const ReplaceRequestParams = (req: Request) => {
	req.body.path = (req.body.path && req.body.path.replace(pattern, ""));
}
export const Permission = {
	Allow: "allow",
	Deny: "deny"
};

export class AccessDetails {
	constructor(public role?: any, public rules?: any) {
	}
}

export class AccessPermission {
	constructor(public read?: any, public write?: any, public writeContents?: any, public copy?: any, public download?: any, public upload?: any, public message?: any) {
	}
}

export class AccessRules {
	constructor(public path?: any, public role?: any, public read?: any, public write?: any, public writeContents?: any, public copy?: any, public download?: any, public upload?: any, public isFile?: any, public message?: any) {
	}
}

export interface CWD1 {
	name: string;
	size: string;
	isFile: boolean;
	modified: number
	created: number
	type: string;
	location: string;
	multipleFiles?: boolean;
}
export interface CWD2 {
	name: string;
	size: string;
	isFile: boolean;
	dateModified: Date;
	dateCreated: Date;
	type: string;
	hasChild: boolean;
	permission: null | AccessPermission;
	filterPath: string;
}