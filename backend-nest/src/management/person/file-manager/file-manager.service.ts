/* eslint-disable prefer-const */
/* eslint-disable no-var */
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import {
  AccessDetails, CWD2, FileDetails, GetFiles, GetPathPermission,
  GetPermission, GetRelativePath, GetSize, ReadDirectories,
  createFolderIfNotExists, fileExists, GetRules,
  CheckForDuplicates,
  UpdateCopyName,
  ReplaceRequestParams,
  MoveFolder,
  transferFile,
  fromDir
} from './fileOperations.utility';
/** Should be an instance for each request; so that a global contentRootPath(depends on person entity) is used in varies functions */
//todo change every func to arrow func
//todo change Sync to promise
//todo fix conflict of local `location` and global nodejs location
export class FileManagerService {
  private size = 0;
  private copyName = "";
  private location = "";
  private isRenameChecking = false;
  private accessDetails: null | AccessDetails = null;
  // //Multer to upload the files to the server
  // private fileName = [];

  /**undefined vars */
  private response: any = {};
  private permission: any = {};
  private rootName = '';

  constructor(private contentRootPath: string) {
  }

  public async upload(req: Request, res: Response) {
    if (!Array.isArray(req['fileName']))
      req['fileName'] = [];
    ReplaceRequestParams(req,);
    var pathPermission = req.body.data != null ? GetPathPermission(req.path, true, JSON.parse(req.body.data).name, this.contentRootPath + req.body.path, this.contentRootPath, JSON.parse(req.body.data).filterPath, this.accessDetails) : null;
    if (pathPermission != null && (!pathPermission.read || !pathPermission.upload)) {
      var errorMsg: any = new Error();
      errorMsg.message = (this.permission.message !== "") ? this.permission.message :
        JSON.parse(req.body.data).name + " is not accessible. You need permission to perform the upload action.";
      errorMsg.code = "401";
      res.setHeader('Content-Type', 'application/json');
      res.json({ error: errorMsg });
    } else if (req.body != null && req.body.path != null) {
      var errorValue: any = new Error();
      if (req.body.action === 'save') {
        var folders = (req.body.filename).split('/');
        var filepath = req.body.path;
        var uploadedFileName = folders[folders.length - 1];
        // checking the folder upload
        if (folders.length > 1) {
          for (var i = 0; i < folders.length - 1; i++) {
            var newDirectoryPath = path.join(this.contentRootPath + filepath, folders[i]);
            if (!(await createFolderIfNotExists(newDirectoryPath))) {
              const data = await this.FileManagerDirectoryContent(req, res, newDirectoryPath);
              this.response = { files: data };
            }
            filepath += folders[i] + "/";
          }
          transferFile(path.join(path.resolve('cache'), uploadedFileName), path.join(this.contentRootPath, filepath + uploadedFileName)).catch(err => {
            if (err && err.code != 'EBUSY') {
              errorValue.message = err.message;
              errorValue.code = err.code;
            }
          })
        } else {
          for (var i = 0; i < req['fileName'].length; i++) {
            const fromPath = path.join(path.resolve('cache'), req['fileName'][i]);
            const toPath = path.join(this.contentRootPath, filepath + req['fileName'][i]);
            //without await to increase the performance
            transferFile(fromPath, toPath).catch(err => {
              if (err && err.code != 'EBUSY') {
                errorValue.message = err.message;
                errorValue.code = err.code;
              }
            });
          }
        }
      } else if (req.body.action === 'remove') {
        if (await fileExists(path.join(this.contentRootPath, req.body.path + req.body["cancel-uploading"]))) {
          await fs.promises.unlink(path.join(this.contentRootPath, req.body.path + req.body["cancel-uploading"]));
        }
      }
      if (errorValue != null) {
        this.response = { error: errorValue };
        res.setHeader('Content-Type', 'application/json');
      }
      res.send('Success');
      req['fileName'] = [];
    }
  }

  public async getImage(req: Request, res: Response) {
    ReplaceRequestParams(req);
    var image = req.query.path.toString().split("/").length > 1 ? req.query.path.toString() : "/" + req.query.path.toString();
    var pathPermission = GetPermission(this.contentRootPath + image.substr(0, image.lastIndexOf("/")), image.substr(image.lastIndexOf("/") + 1, image.length - 1), true, this.contentRootPath, image.substr(0, image.lastIndexOf("/")), this.accessDetails);
    if (pathPermission != null && !pathPermission.read) {
      return null;
    }
    else {
      fs.promises.readFile(this.contentRootPath + image)
        .then(content => {
          //specify the content type in the response will be an image
          res.writeHead(200, { 'Content-type': 'image/jpg' });
          res.end(content);
        })
        .catch(e => {
          res.writeHead(400, { 'Content-type': 'text/html' });
          res.end("No such image");
        })
    }
  }

  public async download(req: Request, res: Response) {
    ReplaceRequestParams(req);
    var downloadObj = JSON.parse(req.body.downloadInput);
    var permission; var permissionDenied = false;
    downloadObj.data.forEach((item) => {
      var filepath = (this.contentRootPath + item.filterPath).replace(/\\/g, "/");
      permission = GetPermission(filepath + item.name, item.name, item.isFile, this.contentRootPath, item.filterPath, this.accessDetails);
      if (permission != null && (!permission.read || !permission.download)) {
        permissionDenied = true;
        var errorMsg: any = new Error();
        errorMsg.message = (permission.message !== "") ? permission.message : (this.contentRootPath + item.filterPath + item.name) + " is not accessible. You need permission to perform the download action.";
        errorMsg.code = "401";
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: errorMsg });
      }
    });
    if (!permissionDenied) {
      if (downloadObj.names.length === 1 && downloadObj.data[0].isFile) {
        var file = this.contentRootPath + downloadObj.path + downloadObj.names[0];
        res.download(file);
      } else {
        var archive = archiver('zip', {
          gzip: true,
          zlib: { level: 9 } // Sets the compression level.
        });
        var output = fs.createWriteStream('./Files.zip');
        downloadObj.data.forEach((item) => {
          archive.on('error', (err) => {
            throw err;
          });
          if (item.isFile) {
            archive.file(this.contentRootPath + item.filterPath + item.name, { name: item.name });
          }
          else {
            archive.directory(this.contentRootPath + item.filterPath + item.name + "/", item.name);
          }
        });
        archive.pipe(output);
        archive.finalize();
        output.on('close', async () => {
          var stat = await fs.promises.stat(output.path);
          res.writeHead(200, {
            'Content-disposition': 'attachment; filename=Files.zip; filename*=UTF-8',
            'Content-Type': 'APPLICATION/octet-stream',
            'Content-Length': stat.size
          });
          var filestream = fs.createReadStream(output.path);
          filestream.pipe(res);
          res.on('close', () => fs.promises.unlink('./Files.zip'));
        });
      }
    }
  }

  public async fileOperations(req: Request, res: Response) {
    ReplaceRequestParams(req);
    req.setTimeout(10 * 60 * 1000);

    this.accessDetails = await GetRules();

    // Action for getDetails
    if (req.body.action == "details") {
      await this.getFileDetails(req, res, this.contentRootPath + req.body.path, req.body.data[0].filterPath);
    }
    // Action for copying files
    if (req.body.action == "copy") {
      await this.CopyFiles(req, res, this.contentRootPath);
    }
    // Action for movinh files
    if (req.body.action == "move") {
      await this.MoveFiles(req, res, this.contentRootPath);
    }
    // Action to create a new folder
    if (req.body.action == "create") {
      await this.createFolder(req, res, this.contentRootPath + req.body.path, this.contentRootPath);
    }
    // Action to remove a file
    if (req.body.action == "delete") {
      await this.deleteFolder(req, res, this.contentRootPath);
    }
    // Action to rename a file
    if (req.body.action === "rename") {
      await this.renameFolder(req, res,)//this.contentRootPath + req.body.path);
    }

    // Action to search a file
    if (req.body.action === 'search') {
      var fileList = await fromDir(path.join(this.contentRootPath, req.body.path), req.body.searchString.replace(/\*/g, ""), this.contentRootPath, req.body.caseSensitive, req.body.searchString, this.accessDetails);
      const tes: any = await this.FileManagerDirectoryContent(req, res, this.contentRootPath + req.body.path);
      if (tes.permission != null && !tes.permission.read) {
        var errorMsg: any = new Error();
        errorMsg.message = (this.permission.message !== "") ? this.permission.message :
          "'" + /*getFileName*/(this.contentRootPath + (req.body.path.substring(0, req.body.path.length - 1))) + "' is not accessible. You need permission to perform the read action.";
        errorMsg.code = "401";
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: errorMsg });
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.json({ cwd: tes, files: fileList });
      }
    }
    
    // Action to read a file
    if (req.body.action == "read") {
      const filesList = await GetFiles(req, this.contentRootPath);
      const cwdFiles: any = await this.FileManagerDirectoryContent(req, res, this.contentRootPath + req.body.path);
      cwdFiles.name = req.body.path == "/" ? this.rootName = (path.basename(this.contentRootPath + req.body.path)) : path.basename(this.contentRootPath + req.body.path)
      if (cwdFiles.permission != null && !cwdFiles.permission.read) {
        var errorMsg: any = new Error();
        errorMsg.message = (cwdFiles.permission.message !== "") ? cwdFiles.permission.message :
          "'" + cwdFiles.name + "' is not accessible. You need permission to perform the read action.";
        errorMsg.code = "401";
        res.setHeader('Content-Type', 'application/json');
        res.json({ cwd: cwdFiles, files: null, error: errorMsg });
      }
      else {
        const data = await ReadDirectories(filesList, this.contentRootPath, req, this.accessDetails);
        res.setHeader('Content-Type', 'application/json');
        res.json({ cwd: cwdFiles, files: data });
      }
    }
  }


  private async getFileDetails(req, res, contentRootPath, filterPath) {
    var isNamesAvailable = req.body.names.length > 0 ? true : false;
    if (req.body.names.length == 0 && req.body.data != 0) {
      var nameValues = [];
      req.body.data.forEach((item) => {
        nameValues.push(item.name);
      });
      req.body.names = nameValues;
    }
    if (req.body.names.length == 1) {
      const data = await FileDetails(req, res, contentRootPath + (isNamesAvailable ? req.body.names[0] : ""));
      if (!data.isFile) {
        await this.getFolderSize(req, res, contentRootPath + (isNamesAvailable ? req.body.names[0] : ""), 0);
        data.size = GetSize(this.size);
        this.size = 0;
      }
      if (filterPath == "") {
        data.location = path.join(filterPath, req.body.names[0]).substr(0, path.join(filterPath, req.body.names[0]).length);
      } else {
        data.location = path.join(this.rootName, filterPath, req.body.names[0]);
      }
      res.setHeader('Content-Type', 'application/json');
      res.json({ details: data });
    } else {
      var isMultipleLocations = this.checkForMultipleLocations(req, contentRootPath);
      for (let item of req.body.names as string[]) {
        if ((await fs.promises.lstat(contentRootPath + item)).isDirectory()) {
          await this.getFolderSize(req, res, contentRootPath + item, this.size);
        } else {
          const stats = (await fs.promises.stat(contentRootPath + item));
          this.size = this.size + stats.size;
        }
      }
      const data = await FileDetails(req, res, contentRootPath + req.body.names[0]);
      var names = [];
      req.body.names.forEach((name) => {
        if (name.split("/").length > 0) {
          names.push(name.split("/")[name.split("/").length - 1]);
        }
        else {
          names.push(name);
        }
      });
      data.name = names.join(", ");
      data.multipleFiles = true;
      data.size = GetSize(this.size);
      this.size = 0;
      if (filterPath == "") {
        data.location = path.join(this.rootName, filterPath).substr(0, path.join(this.rootName, filterPath).length - 1);
      } else {
        data.location = path.join(this.rootName, filterPath).substr(0, path.join(this.rootName, filterPath).length - 1);
      }
      res.setHeader('Content-Type', 'application/json');
      isMultipleLocations = false;
      this.location = "";
      res.json({ details: data });
    }
  }

  /**
 * func copyfile and folder
 */
  private async CopyFiles(req, res, contentRootPath) {
    var fileList = [];
    var replaceFileList = [];
    var permission; var pathPermission; var permissionDenied = false;
    pathPermission = GetPathPermission(req.path, false, req.body.targetData.name, contentRootPath + req.body.targetPath, this.contentRootPath, req.body.targetData.filterPath, this.accessDetails);
    req.body.data.forEach((item: CWD2) => {
      var fromPath = contentRootPath + item.filterPath;
      permission = GetPermission(fromPath, item.name, item.isFile, contentRootPath, item.filterPath, this.accessDetails);
      var fileAccessDenied = (permission != null && (!permission.read || !permission.copy));
      var pathAccessDenied = (pathPermission != null && (!pathPermission.read || !pathPermission.writeContents));
      if (fileAccessDenied || pathAccessDenied) {
        permissionDenied = true;
        var errorMsg: any = new Error();
        errorMsg.message = fileAccessDenied ? ((permission.message !== "") ? permission.message :
          item.name + " is not accessible. You need permission to perform the copy action.") :
          ((pathPermission.message !== "") ? pathPermission.message :
            req.body.targetData.name + " is not accessible. You need permission to perform the writeContents action.");
        errorMsg.code = "401";
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: errorMsg });
      }
    });
    if (!permissionDenied) {
      for (let item of (req.body.data as CWD2[])) {
        var fromPath = contentRootPath + item.filterPath + item.name;
        var toPath = contentRootPath + req.body.targetPath + item.name;
        await this.checkForFileUpdate(fromPath, toPath, item, contentRootPath, req);
        if (!this.isRenameChecking) {
          // toPath = contentRootPath + req.body.targetPath + this.copyName;
          if (item.isFile) {
            await fs.promises.copyFile(fromPath, toPath);
          }
          else {
            await this.copyFolder(fromPath, toPath)
          }
          var list = item;
          list.filterPath = req.body.targetPath;
          list.name = this.copyName;
          fileList.push(list);
        } else {
          replaceFileList.push(item.name);
        }
      }
      if (replaceFileList.length == 0) {
        this.copyName = "";
        res.setHeader('Content-Type', 'application/json');
        res.json({ files: fileList });
      } else {
        this.isRenameChecking = false;
        var errorMsg: any = new Error();
        errorMsg.message = "File Already Exists.";
        errorMsg.code = "400";
        errorMsg.fileExists = replaceFileList;
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: errorMsg, files: [] });
      }
    }
  }


  /**
 * func move files and folder
 */
  private async MoveFiles(req, res, contentRootPath) {
    var fileList = [];
    var replaceFileList = [];
    var permission; var pathPermission; var permissionDenied = false;
    pathPermission = GetPathPermission(req.path, false, req.body.targetData.name, contentRootPath + req.body.targetPath, this.contentRootPath, req.body.targetData.filterPath, this.accessDetails);
    req.body.data.forEach((item) => {
      var fromPath = contentRootPath + item.filterPath;
      permission = GetPermission(fromPath, item.name, item.isFile, contentRootPath, item.filterPath, this.accessDetails);
      var fileAccessDenied = (permission != null && (!permission.read || !permission.write));
      var pathAccessDenied = (pathPermission != null && (!pathPermission.read || !pathPermission.writeContents));
      if (fileAccessDenied || pathAccessDenied) {
        permissionDenied = true;
        var errorMsg: any = new Error();
        errorMsg.message = fileAccessDenied ? ((permission.message !== "") ? permission.message :
          item.name + " is not accessible. You need permission to perform the write action.") :
          ((pathPermission.message !== "") ? pathPermission.message :
            req.body.targetData.name + " is not accessible. You need permission to perform the writeContents action.");
        errorMsg.code = "401";
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: errorMsg });
      }
    });
    if (!permissionDenied) {
      for (let item of req.body.data) {
        var fromPath = contentRootPath + item.filterPath + item.name;
        var toPath = contentRootPath + req.body.targetPath + item.name;
        await this.checkForFileUpdate(fromPath, toPath, item, contentRootPath, req);
        if (!this.isRenameChecking) {
          // toPath = this.contentRootPath + req.body.targetPath + this.copyName;
          if (item.isFile) {
            //user won't be able to move files from different disk partition so we can confidently just rename the file path
            await fs.promises.rename(fromPath, toPath);
          } else {
            await MoveFolder(fromPath, toPath);
            await fs.promises.rmdir(fromPath);
          }
          // await createFolderIfNotExists(toPath);
          // await fs.promises.rename(fromPath, toPath);
          var list = item;
          list.name = this.copyName;
          list.filterPath = req.body.targetPath;
          fileList.push(list);
        } else {
          replaceFileList.push(item.name);
        }
      }
      if (replaceFileList.length == 0) {
        this.copyName = "";
        res.setHeader('Content-Type', 'application/json');
        res.json({ files: fileList });
      }
      else {
        this.isRenameChecking = false;
        var errorMsg: any = new Error();
        errorMsg.message = "File Already Exists.";
        errorMsg.code = "400";
        errorMsg.fileExists = replaceFileList;
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: errorMsg, files: [] });
      }
    }
  }


  /**
 * func to create the folder
 */
  private async createFolder(req, res, filepath, contentRootPath) {
    var newDirectoryPath = path.join(this.contentRootPath + req.body.path, req.body.name);
    var pathPermission = GetPathPermission(req.path, false, req.body.data[0].name, filepath, this.contentRootPath, req.body.data[0].filterPath, this.accessDetails);
    if (pathPermission != null && (!pathPermission.read || !pathPermission.writeContents)) {
      var errorMsg: any = new Error();
      errorMsg.message = (this.permission.message !== "") ? this.permission.message : req.body.data[0].name + " is not accessible. You need permission to perform the writeContents action.";
      errorMsg.code = "401";
      res.setHeader('Content-Type', 'application/json');
      res.json({ error: errorMsg });
    }
    else {
      try {
        await fs.promises.access(newDirectoryPath);
        var errorMsg: any = new Error();
        errorMsg.message = "A file or folder with the name " + req.body.name + " already exists.";
        errorMsg.code = "400";
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: errorMsg });
      } catch (e) {
        await fs.promises.mkdir(newDirectoryPath);
        await this.FileManagerDirectoryContent(req, res, newDirectoryPath).then(data => {
          res.setHeader('Content-Type', 'application/json');
          res.json({ files: data });
        });

      }
    }
  }


  /**
   * func to delete the folder
   */
  private async deleteFolder(req, res, contentRootPath) {
    var deleteFolderRecursive = async (path) => {
      try {
        await fs.promises.access(path);
        const files = await fs.promises.readdir(path);
        for (let file of files) {
          var curPath = path + "/" + file;
          curPath = curPath.replace("../", "");
          if ((await fs.promises.lstat(curPath)).isDirectory()) { // recurse
            await deleteFolderRecursive(curPath);
          } else { // delete file
            await fs.promises.unlink(curPath);
          }
        }
        await fs.promises.rmdir(path);
      } catch (e) {

      }
    }
    var permission; var permissionDenied = false;
    req.body.data.forEach((item) => {
      var fromPath = this.contentRootPath + item.filterPath;
      permission = GetPermission(fromPath, item.name, item.isFile, this.contentRootPath, item.filterPath, this.accessDetails);
      if (permission != null && (!permission.read || !permission.write)) {
        permissionDenied = true;
        var errorMsg: any = new Error();
        errorMsg.message = (permission.message !== "") ? permission.message : item.name + " is not accessible. You need permission to perform the write action.";
        errorMsg.code = "401";
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: errorMsg });
      }
    });
    if (!permissionDenied) {
      var promiseList = [];
      for (var i = 0; i < req.body.data.length; i++) {
        var newDirectoryPath = path.join(contentRootPath + req.body.data[i].filterPath, req.body.data[i].name);
        if ((await fs.promises.lstat(newDirectoryPath)).isFile()) {
          promiseList.push(this.FileManagerDirectoryContent(req, res, newDirectoryPath, req.body.data[i].filterPath));
        } else {
          promiseList.push(this.FileManagerDirectoryContent(req, res, newDirectoryPath + "/", req.body.data[i].filterPath));
        }
      }
      const data = await Promise.all(promiseList);
      for (let files of data) {
        if ((await fs.promises.lstat(path.join(contentRootPath + files.filterPath, files.name))).isFile()) {
          await fs.promises.unlink(path.join(contentRootPath + files.filterPath, files.name));
        } else {
          await deleteFolderRecursive(path.join(contentRootPath + files.filterPath, files.name));
        }
      }
      res.setHeader('Content-Type', 'application/json');
      res.json({ files: data });
    }
  }

  /**
 * func to rename the folder
 */
  private async renameFolder(req, res) {
    var oldName = req.body.data[0].name.split("/")[req.body.data[0].name.split("/").length - 1];
    var newName = req.body.newName.split("/")[req.body.newName.split("/").length - 1];
    var permission = GetPermission((this.contentRootPath + req.body.data[0].filterPath), oldName, req.body.data[0].isFile, this.contentRootPath, req.body.data[0].filterPath, this.accessDetails);
    if (permission != null && (!permission.read || !permission.write)) {
      var errorMsg: any = new Error();
      errorMsg.message = (permission.message !== "") ? permission.message : /*getFileName*/(this.contentRootPath + req.body.data[0].filterPath + oldName) + " is not accessible.  is not accessible. You need permission to perform the write action.";
      errorMsg.code = "401";
      res.setHeader('Content-Type', 'application/json');
      res.json({ error: errorMsg });
    } else {
      var oldDirectoryPath = path.join(this.contentRootPath + req.body.data[0].filterPath, oldName);
      var newDirectoryPath = path.join(this.contentRootPath + req.body.data[0].filterPath, newName);
      if (await CheckForDuplicates(this.contentRootPath + req.body.data[0].filterPath, newName, req.body.data[0].isFile)) {
        var errorMsg: any = new Error();
        errorMsg.message = "A file or folder with the name " + req.body.name + " already exists.";
        errorMsg.code = "400";
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: errorMsg });
      } else {
        await fs.promises.rename(oldDirectoryPath, newDirectoryPath);
        await this.FileManagerDirectoryContent(req, res, newDirectoryPath + "/").then(data => {
          res.setHeader('Content-Type', 'application/json');
          res.json({ files: data });
        });
      }
    }
  }


  /**
 * returns the current working directories
 */
  private async FileManagerDirectoryContent(req, res, filepath, searchFilterPath?): Promise<CWD2> {
    ReplaceRequestParams(req);
    const stats = await fs.promises.stat(filepath);
    var cwd: any = {
      name: path.basename(filepath),
      size: GetSize(stats.size),
      isFile: stats.isFile(),
      dateModified: stats.ctime,
      dateCreated: stats.mtime,
      type: path.extname(filepath),
    };
    if (searchFilterPath) {
      cwd.filterPath = searchFilterPath;
    } else {
      cwd.filterPath = req.body.data.length > 0 ? GetRelativePath(this.contentRootPath, this.contentRootPath + req.body.path.substring(0, req.body.path.indexOf(req.body.data[0].name))) : "";
    }
    cwd.permission = GetPathPermission(req.path, cwd.isFile, (req.body.path == "/") ? "" : cwd.name, filepath, this.contentRootPath, cwd.filterPath, this.accessDetails);
    if ((await fs.promises.lstat(filepath)).isFile()) {
      cwd.hasChild = false;
      return cwd;
    }
    if ((await fs.promises.lstat(filepath)).isDirectory()) {
      const stats = await fs.promises.readdir(filepath)
      for (let stat of stats) {
        if ((await fs.promises.lstat(filepath + stat)).isDirectory()) {
          cwd.hasChild = true
        } else {
          cwd.hasChild = false;
        }
        //if (cwd.hasChild) return; called in forEach function so it is used to continue..
        if (cwd.hasChild) continue;
      }
      return cwd;
    }
  }


  /** 
   * func to get the folder size
   */
  private async getFolderSize(req, res, directory, sizeValue) {
    this.size = sizeValue;
    var filenames = await fs.promises.readdir(directory);
    for (var i = 0; i < filenames.length; i++) {
      if ((await fs.promises.lstat(directory + "/" + filenames[i])).isDirectory()) {
        await this.getFolderSize(req, res, directory + "/" + filenames[i], this.size);
      } else {
        const stats = await fs.promises.stat(directory + "/" + filenames[i]);
        this.size = this.size + stats.size;
      }
    }
  }


  private checkForMultipleLocations(req, contentRootPath): boolean {
    var previousLocation = "";
    var isMultipleLocation = false;
    req.body.data.forEach((item) => {
      if (previousLocation == "") {
        previousLocation = item.filterPath;
        this.location = item.filterPath;
      } else if (previousLocation == item.filterPath && !isMultipleLocation) {
        isMultipleLocation = false;
        this.location = item.filterPath;
      } else {
        isMultipleLocation = true;
        this.location = "Various Location";
      }
    });
    if (!isMultipleLocation) {
      this.location = contentRootPath.split("/")[contentRootPath.split("/").length - 1] + this.location.substr(0, this.location.length - 2);
    }
    return isMultipleLocation;
  }

  private async copyFolder(source: string, dest: string) {
    await createFolderIfNotExists(dest);
    var files = await fs.promises.readdir(source);
    for (let file of files) {
      var curSource = path.join(source, file);
      curSource = curSource.replace("../", "");
      if ((await fs.promises.lstat(curSource)).isDirectory()) {
        await this.copyFolder(curSource, path.join(dest, file)); source
      } else {
        fs.promises.copyFile(path.join(source, file), path.join(dest, file)).catch(e => { throw e; })
      }
    }
  }

  private async checkForFileUpdate(fromPath: string, toPath: string, item: CWD2, contentRootPath: string, req: Request) {
    var count = 1;
    var name = this.copyName = item.name;
    if (fromPath == toPath) {
      if (await CheckForDuplicates(contentRootPath + req.body.targetPath, name, item.isFile)) {
        this.copyName = await UpdateCopyName(contentRootPath + req.body.targetPath, name, count, item.isFile, this.copyName);
      }
    } else {
      if (req.body.renameFiles.length > 0 && req.body.renameFiles.indexOf(item.name) >= 0) {
        this.copyName = await UpdateCopyName(contentRootPath + req.body.targetPath, name, count, item.isFile, this.copyName);
      } else {
        if (await CheckForDuplicates(contentRootPath + req.body.targetPath, name, item.isFile)) {
          this.isRenameChecking = true;
        }
      }
    }
  }

}
