/* eslint-disable prefer-const */
/* eslint-disable no-var */
import { Injectable } from '@nestjs/common';
import { resolve } from 'path';
import { IPersonEntity } from '../../../../../interfaces';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
/** Should be an instance for each request; so that a global contentRootPath(depends on person entity) is used in varies functions */
//todo change every function to arrow function
//todo change Sync to promise
//todo fix conflict of local `location` and global nodejs location
export class FileManagerService {
  private readonly pattern = /(\.\.\/)/g;
  private size = 0;
  private copyName = "";
  private location = "";
  private isRenameChecking = false;
  private accessDetails: null | AccessDetails = null;

  /**undefined vars */
  private response: any = {};
  private permission: any = {};
  private rootName = '';

  constructor(private contentRootPath: string) {
    (async () => {
      await this.createFolderIfNotExist(contentRootPath);
    })()
  }

  public async fileOperations(req: Request, res: Response) {
    this.replaceRequestParams(req, res);
    req.setTimeout(0);
    const getRules = async () => {
      var details = new AccessDetails();
      var accessRuleFile = "accessRules.json";
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

    this.accessDetails = await getRules();

    // Action for getDetails
    if (req.body.action == "details") {
      this.getFileDetails(req, res, this.contentRootPath + req.body.path, req.body.data[0].filterPath);
    }
    // Action for copying files
    if (req.body.action == "copy") {
      this.CopyFiles(req, res, this.contentRootPath);
    }
    // Action for movinh files
    if (req.body.action == "move") {
      this.MoveFiles(req, res, this.contentRootPath);
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

    const addSearchList = async (filename, contentRootPath, fileList, files, index) => {
      var cwd: any = {};
      var stats = await fs.promises.stat(filename);
      cwd.name = path.basename(filename);
      cwd.size = stats.size;
      cwd.isFile = stats.isFile();
      cwd.dateModified = stats.mtime;
      cwd.dateCreated = stats.ctime;
      cwd.type = path.extname(filename);
      cwd.filterPath = filename.substr((this.contentRootPath.length), filename.length).replace(files[index], "");
      cwd.permission = this.getPermission(filename.replace(/\\/g, "/"), cwd.name, cwd.isFile, this.contentRootPath, cwd.filterPath);
      var permission = parentsHavePermission(filename, this.contentRootPath, cwd.isFile, cwd.name, cwd.filterPath);
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

    const parentsHavePermission = (filepath, contentRootPath, isFile, name, filterPath) => {
      var parentPath = filepath.substr(this.contentRootPath.length, filepath.length - 1).replace(/\\/g, "/");
      parentPath = parentPath.substr(0, parentPath.indexOf(name)) + (isFile ? "" : "/");
      var parents = parentPath.split('/');
      var currPath = "/";
      var hasPermission = true;
      var pathPermission;
      for (var i = 0; i <= parents.length - 2; i++) {
        currPath = (parents[i] == "") ? currPath : (currPath + parents[i] + "/");
        pathPermission = this.getPathPermission(parentPath, false, parents[i], this.contentRootPath + (currPath == "/" ? "" : "/"), this.contentRootPath, filterPath);
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

    const checkForSearchResult = (casesensitive, filter, isFile, fileName, searchString) => {
      var isAddable = false;
      if (searchString.substr(0, 1) == "*" && searchString.substr(searchString.length - 1, 1) == "*") {
        if (casesensitive ? fileName.indexOf(filter) >= 0 : (fileName.indexOf(filter.toLowerCase()) >= 0 || fileName.indexOf(filter.toUpperCase()) >= 0)) {
          isAddable = true
        }
      } else if (searchString.substr(searchString.length - 1, 1) == "*") {
        if (casesensitive ? fileName.startsWith(filter) : (fileName.startsWith(filter.toLowerCase()) || fileName.startsWith(filter.toUpperCase()))) {
          isAddable = true
        }
      } else {
        if (casesensitive ? fileName.endsWith(filter) : (fileName.endsWith(filter.toLowerCase()) || fileName.endsWith(filter.toUpperCase()))) {
          isAddable = true
        }
      }
      return isAddable;
    }

    const fromDir = async (startPath, filter, contentRootPath, casesensitive, searchString) => {
      try {
        await fs.promises.access(startPath);
      } catch {
        return;
      }
      var files = await fs.promises.readdir(startPath);
      for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath, files[i]);
        var stat = await fs.promises.lstat(filename);
        if (stat.isDirectory()) {
          if (checkForSearchResult(casesensitive, filter, false, files[i], searchString)) {
            await addSearchList(filename, this.contentRootPath, fileList, files, i);
          }
          await fromDir(filename, filter, this.contentRootPath, casesensitive, searchString); //recurse
        }
        else if (checkForSearchResult(casesensitive, filter, true, files[i], searchString)) {
          await addSearchList(filename, this.contentRootPath, fileList, files, i);
        }
      }
    }

    // Action to search a file
    if (req.body.action === 'search') {
      var fileList = [];
      await fromDir(this.contentRootPath + req.body.path, req.body.searchString.replace(/\*/g, ""), this.contentRootPath, req.body.caseSensitive, req.body.searchString);
      (async () => {
        const tes: any = await this.FileManagerDirectoryContent(req, res, this.contentRootPath + req.body.path);
        if (tes.permission != null && !tes.permission.read) {
          var errorMsg: any = new Error();
          errorMsg.message = (this.permission.message !== "") ? this.permission.message :
            "'" + /*getFileName*/(this.contentRootPath + (req.body.path.substring(0, req.body.path.length - 1))) + "' is not accessible. You need permission to perform the read action.";
          errorMsg.code = "401";
          this.response = { error: errorMsg };
          this.response = JSON.stringify(this.response);
          res.setHeader('Content-Type', 'application/json');
          res.json(this.response);
        } else {
          this.response = { cwd: tes, files: fileList };
          this.response = JSON.stringify(this.response);
          res.setHeader('Content-Type', 'application/json');
          res.json(this.response);
        }
      })();
    }

    const ReadDirectories = (file) => {
      var myCwd: any = {};
      var directoryList = [];
      const stats = (file) => {
        return new Promise(async (resolve, reject) => {
          const cwd = await fs.promises.stat(file);
          myCwd.name = path.basename(this.contentRootPath + req.body.path + file);
          myCwd.size = (cwd.size);
          myCwd.isFile = cwd.isFile();
          myCwd.dateModified = cwd.ctime;
          myCwd.dateCreated = cwd.mtime;
          myCwd.filterPath = this.getRelativePath(this.contentRootPath, this.contentRootPath + req.body.path,)//req);
          myCwd.type = path.extname(this.contentRootPath + req.body.path + file);
          myCwd.permission = this.getPermission(this.contentRootPath + req.body.path + myCwd.name, myCwd.name, cwd.isFile, this.contentRootPath, myCwd.filterPath);
          if ((await fs.promises.lstat(file)).isDirectory()) {
            (await fs.promises.readdir(file)).forEach(async (items) => {
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
          resolve(cwd);
        });
      }
      var promiseList = [];
      for (var i = 0; i < file.length; i++) {
        promiseList.push(stats(path.join(this.contentRootPath + req.body.path.replace(this.pattern, ""), file[i])));
      }
      return Promise.all(promiseList);
    }

    // Action to read a file
    if (req.body.action == "read") {
      (async () => {
        const filesList = await this.GetFiles(req, res);
        const cwdFiles: any = await this.FileManagerDirectoryContent(req, res, this.contentRootPath + req.body.path);
        cwdFiles.name = req.body.path == "/" ? this.rootName = (path.basename(this.contentRootPath + req.body.path)) : path.basename(this.contentRootPath + req.body.path)
        var response = {};
        if (cwdFiles.permission != null && !cwdFiles.permission.read) {
          var errorMsg: any = new Error();
          errorMsg.message = (cwdFiles.permission.message !== "") ? cwdFiles.permission.message :
            "'" + cwdFiles.name + "' is not accessible. You need permission to perform the read action.";
          errorMsg.code = "401";
          response = { cwd: cwdFiles, files: null, error: errorMsg };
          response = JSON.stringify(response);
          res.setHeader('Content-Type', 'application/json');
          res.json(response);
        }
        else {
          ReadDirectories(filesList).then(data => {
            response = { cwd: cwdFiles, files: data };
            response = JSON.stringify(response);
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
          });
        }
      })();
    }

  }

  private replaceRequestParams(req, res) {
    req.body.path = (req.body.path && req.body.path.replace(this.pattern, ""));
  }

  private getFileDetails(req, res, contentRootPath, filterPath) {
    var isNamesAvailable = req.body.names.length > 0 ? true : false;
    if (req.body.names.length == 0 && req.body.data != 0) {
      var nameValues = [];
      req.body.data.forEach((item) => {
        nameValues.push(item.name);
      });
      req.body.names = nameValues;
    }
    if (req.body.names.length == 1) {
      this.fileDetails(req, res, this.contentRootPath + (isNamesAvailable ? req.body.names[0] : "")).then((data: any) => {
        if (!data.isFile) {
          this.getFolderSize(req, res, this.contentRootPath + (isNamesAvailable ? req.body.names[0] : ""), 0);
          data.size = this.getSize(this.size);
          this.size = 0;
        }
        if (filterPath == "") {
          data.location = path.join(filterPath, req.body.names[0]).substr(0, path.join(filterPath, req.body.names[0]).length);
        } else {
          data.location = path.join(this.rootName, filterPath, req.body.names[0]);
        }
        this.response = { details: data };
        this.response = JSON.stringify(this.response);
        res.setHeader('Content-Type', 'application/json');
        res.json(this.response);
      });
    } else {
      var isMultipleLocations = false;
      isMultipleLocations = this.checkForMultipleLocations(req, this.contentRootPath);
      req.body.names.forEach(async (item) => {
        if ((await fs.promises.lstat(this.contentRootPath + item)).isDirectory()) {
          await this.getFolderSize(req, res, this.contentRootPath + item, this.size);
        } else {
          const stats = (await fs.promises.stat(this.contentRootPath + item));
          this.size = this.size + stats.size;
        }
      });
      this.fileDetails(req, res, this.contentRootPath + req.body.names[0]).then((data: any) => {
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
        data.size = this.getSize(this.size);
        this.size = 0;
        if (filterPath == "") {
          data.location = path.join(this.rootName, filterPath).substr(0, path.join(this.rootName, filterPath).length - 1);
        } else {
          data.location = path.join(this.rootName, filterPath).substr(0, path.join(this.rootName, filterPath).length - 1);
        }
        this.response = { details: data };
        this.response = JSON.stringify(this.response);
        res.setHeader('Content-Type', 'application/json');
        isMultipleLocations = false;
        this.location = "";
        res.json(this.response);
      });
    }
  }

  /**
 * function copyfile and folder
 */
  private CopyFiles(req, res, contentRootPath) {
    var fileList = [];
    var replaceFileList = [];
    var permission; var pathPermission; var permissionDenied = false;
    pathPermission = this.getPathPermission(req.path, false, req.body.targetData.name, this.contentRootPath + req.body.targetPath, this.contentRootPath, req.body.targetData.filterPath);
    req.body.data.forEach((item) => {
      var fromPath = this.contentRootPath + item.filterPath;
      permission = this.getPermission(fromPath, item.name, item.isFile, this.contentRootPath, item.filterPath);
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
        this.response = { error: errorMsg };
        this.response = JSON.stringify(this.response);
        res.setHeader('Content-Type', 'application/json');
        res.json(this.response);
      }
    });
    if (!permissionDenied) {
      req.body.data.forEach(async (item) => {
        var fromPath = this.contentRootPath + item.filterPath + item.name;
        var toPath = this.contentRootPath + req.body.targetPath + item.name;
        await this.checkForFileUpdate(fromPath, toPath, item, this.contentRootPath, req);
        if (!this.isRenameChecking) {
          toPath = this.contentRootPath + req.body.targetPath + this.copyName;
          if (item.isFile) {
            fs.promises.copyFile(path.join(fromPath), path.join(toPath)).catch(e => { throw e });
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
      });
      if (replaceFileList.length == 0) {
        this.copyName = "";
        this.response = { files: fileList };
        this.response = JSON.stringify(this.response);
        res.setHeader('Content-Type', 'application/json');
        res.json(this.response);
      } else {
        this.isRenameChecking = false;
        var errorMsg: any = new Error();
        errorMsg.message = "File Already Exists.";
        errorMsg.code = "400";
        errorMsg.fileExists = replaceFileList;
        this.response = { error: errorMsg, files: [] };
        this.response = JSON.stringify(this.response);
        res.setHeader('Content-Type', 'application/json');
        res.json(this.response);
      }
    }
  }

  /**
 * function move files and folder
 */
  private MoveFiles(req, res, contentRootPath) {
    var fileList = [];
    var replaceFileList = [];
    var permission; var pathPermission; var permissionDenied = false;
    pathPermission = this.getPathPermission(req.path, false, req.body.targetData.name, this.contentRootPath + req.body.targetPath, this.contentRootPath, req.body.targetData.filterPath);
    req.body.data.forEach((item) => {
      var fromPath = this.contentRootPath + item.filterPath;
      permission = this.getPermission(fromPath, item.name, item.isFile, this.contentRootPath, item.filterPath);
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
        this.response = { error: errorMsg };
        this.response = JSON.stringify(this.response);
        res.setHeader('Content-Type', 'application/json');
        res.json(this.response);
      }
    });
    if (!permissionDenied) {
      req.body.data.forEach(async (item) => {
        var fromPath = this.contentRootPath + item.filterPath + item.name;
        var toPath = this.contentRootPath + req.body.targetPath + item.name;
        await this.checkForFileUpdate(fromPath, toPath, item, this.contentRootPath, req);
        if (!this.isRenameChecking) {
          toPath = this.contentRootPath + req.body.targetPath + this.copyName;
          if (item.isFile) {
            var source = fs.createReadStream(path.join(fromPath));
            var desti = fs.createWriteStream(path.join(toPath));
            source.pipe(desti);
            source.on('end', () => {
              fs.promises.unlink(path.join(fromPath)).catch(e => { throw e })
            });
          }
          else {
            await this.MoveFolder(fromPath, toPath);
            await fs.promises.rmdir(fromPath);
          }
          var list = item;
          list.name = this.copyName;
          list.filterPath = req.body.targetPath;
          fileList.push(list);
        } else {
          replaceFileList.push(item.name);
        }
      });
      if (replaceFileList.length == 0) {
        this.copyName = "";
        this.response = { files: fileList };
        this.response = JSON.stringify(this.response);
        res.setHeader('Content-Type', 'application/json');
        res.json(this.response);
      }
      else {
        this.isRenameChecking = false;
        var errorMsg: any = new Error();
        errorMsg.message = "File Already Exists.";
        errorMsg.code = "400";
        errorMsg.fileExists = replaceFileList;
        this.response = { error: errorMsg, files: [] };
        this.response = JSON.stringify(this.response);
        res.setHeader('Content-Type', 'application/json');
        res.json(this.response);
      }
    }
  }

  /**
 * function to create the folder
 */
  private async createFolder(req, res, filepath, contentRootPath) {
    var newDirectoryPath = path.join(this.contentRootPath + req.body.path, req.body.name);
    var pathPermission = this.getPathPermission(req.path, false, req.body.data[0].name, filepath, this.contentRootPath, req.body.data[0].filterPath);
    if (pathPermission != null && (!pathPermission.read || !pathPermission.writeContents)) {
      var errorMsg: any = new Error();
      errorMsg.message = (this.permission.message !== "") ? this.permission.message : req.body.data[0].name + " is not accessible. You need permission to perform the writeContents action.";
      errorMsg.code = "401";
      this.response = { error: errorMsg };
      this.response = JSON.stringify(this.response);
      res.setHeader('Content-Type', 'application/json');
      res.json(this.response);
    }
    else {
      try {
        await fs.promises.access(newDirectoryPath);
        var errorMsg: any = new Error();
        errorMsg.message = "A file or folder with the name " + req.body.name + " already exists.";
        errorMsg.code = "400";
        this.response = { error: errorMsg };

        this.response = JSON.stringify(this.response);
        res.setHeader('Content-Type', 'application/json');
        res.json(this.response);
      } catch (e) {
        await fs.promises.mkdir(newDirectoryPath);
        await this.FileManagerDirectoryContent(req, res, newDirectoryPath).then(data => {
          this.response = { files: data };
          this.response = JSON.stringify(this.response);
          res.setHeader('Content-Type', 'application/json');
          res.json(this.response);
        });

      }
    }
  }

  /**
   * function to delete the folder
   */
  private async deleteFolder(req, res, contentRootPath) {
    var deleteFolderRecursive = async (path) => {
      try {
        await fs.promises.access(path);
        (await fs.promises.readdir(path)).forEach(async (file, index) => {
          var curPath = path + "/" + file;
          curPath = curPath.replace("../", "");
          if ((await fs.promises.lstat(curPath)).isDirectory()) { // recurse
            await deleteFolderRecursive(curPath);
          } else { // delete file
            await fs.promises.unlink(curPath);
          }
        });
        await fs.promises.rmdir(path);
      } catch (e) {

      }
    }
    var permission; var permissionDenied = false;
    req.body.data.forEach((item) => {
      var fromPath = this.contentRootPath + item.filterPath;
      permission = this.getPermission(fromPath, item.name, item.isFile, this.contentRootPath, item.filterPath);
      if (permission != null && (!permission.read || !permission.write)) {
        permissionDenied = true;
        var errorMsg: any = new Error();
        errorMsg.message = (permission.message !== "") ? permission.message : item.name + " is not accessible. You need permission to perform the write action.";
        errorMsg.code = "401";
        this.response = { error: errorMsg };
        this.response = JSON.stringify(this.response);
        res.setHeader('Content-Type', 'application/json');
        res.json(this.response);
      }
    });
    if (!permissionDenied) {
      var promiseList = [];
      for (var i = 0; i < req.body.data.length; i++) {
        var newDirectoryPath = path.join(this.contentRootPath + req.body.data[i].filterPath, req.body.data[i].name);
        if ((await fs.promises.lstat(newDirectoryPath)).isFile()) {
          promiseList.push(this.FileManagerDirectoryContent(req, res, newDirectoryPath, req.body.data[i].filterPath));
        } else {
          promiseList.push(this.FileManagerDirectoryContent(req, res, newDirectoryPath + "/", req.body.data[i].filterPath));
        }
      }
      Promise.all(promiseList).then(data => {
        data.forEach(async (files) => {
          if ((await fs.promises.lstat(path.join(this.contentRootPath + files.filterPath, files.name))).isFile()) {
            fs.promises.unlink(path.join(this.contentRootPath + files.filterPath, files.name));
          } else {
            await deleteFolderRecursive(path.join(this.contentRootPath + files.filterPath, files.name));
          }
        });
        this.response = { files: data };
        this.response = JSON.stringify(this.response);
        res.setHeader('Content-Type', 'application/json');
        res.json(this.response);
      });
    }
  }

  /**
 * function to rename the folder
 */
  private async renameFolder(req, res) {
    var oldName = req.body.data[0].name.split("/")[req.body.data[0].name.split("/").length - 1];
    var newName = req.body.newName.split("/")[req.body.newName.split("/").length - 1];
    var permission = this.getPermission((this.contentRootPath + req.body.data[0].filterPath), oldName, req.body.data[0].isFile, this.contentRootPath, req.body.data[0].filterPath);
    if (permission != null && (!permission.read || !permission.write)) {
      var errorMsg: any = new Error();
      errorMsg.message = (permission.message !== "") ? permission.message : /*getFileName*/(this.contentRootPath + req.body.data[0].filterPath + oldName) + " is not accessible.  is not accessible. You need permission to perform the write action.";
      errorMsg.code = "401";
      this.response = { error: errorMsg };
      this.response = JSON.stringify(this.response);
      res.setHeader('Content-Type', 'application/json');
      res.json(this.response);
    } else {
      var oldDirectoryPath = path.join(this.contentRootPath + req.body.data[0].filterPath, oldName);
      var newDirectoryPath = path.join(this.contentRootPath + req.body.data[0].filterPath, newName);
      if (this.checkForDuplicates(this.contentRootPath + req.body.data[0].filterPath, newName, req.body.data[0].isFile)) {
        var errorMsg: any = new Error();
        errorMsg.message = "A file or folder with the name " + req.body.name + " already exists.";
        errorMsg.code = "400";
        this.response = { error: errorMsg };

        this.response = JSON.stringify(this.response);
        res.setHeader('Content-Type', 'application/json');
        res.json(this.response);
      } else {
        await fs.promises.rename(oldDirectoryPath, newDirectoryPath);
        (async () => {
          await this.FileManagerDirectoryContent(req, res, newDirectoryPath + "/").then(data => {
            this.response = { files: data };
            this.response = JSON.stringify(this.response);
            res.setHeader('Content-Type', 'application/json');
            res.json(this.response);
          });
        })();
      }
    }
  }


  private getPermission(filepath, name, isFile, contentRootPath, filterPath) {
    var filePermission = new AccessPermission(true, true, true, true, true, true, "");
    if (this.accessDetails == null) {
      return null;
    } else {
      this.accessDetails.rules.forEach((accessRule) => {
        if (isFile && accessRule.isFile) {
          var nameExtension = name.substr(name.lastIndexOf("."), name.length - 1).toLowerCase();
          var fileName = name.substr(0, name.lastIndexOf("."));
          var currentPath = contentRootPath + filterPath;
          if (accessRule.isFile && isFile && accessRule.path != "" && accessRule.path != null && (accessRule.role == null || accessRule.role == this.accessDetails.role)) {
            if (accessRule.path.indexOf("*.*") > -1) {
              var parentPath = accessRule.path.substr(0, accessRule.path.indexOf("*.*"));
              if (currentPath.indexOf(contentRootPath + parentPath) == 0 || parentPath == "") {
                filePermission = this.updateRules(filePermission, accessRule);
              }
            }
            else if (accessRule.path.indexOf("*.") > -1) {
              var pathExtension = accessRule.path.substr(accessRule.path.lastIndexOf("."), accessRule.path.length - 1).toLowerCase();
              var parentPath = accessRule.path.substr(0, accessRule.path.indexOf("*."));
              if (((contentRootPath + parentPath) == currentPath || parentPath == "") && nameExtension == pathExtension) {
                filePermission = this.updateRules(filePermission, accessRule);
              }
            }
            else if (accessRule.path.indexOf(".*") > -1) {
              var pathName = accessRule.path.substr(0, accessRule.path.lastIndexOf(".")).substr(accessRule.path.lastIndexOf("/") + 1, accessRule.path.length - 1);
              var parentPath = accessRule.path.substr(0, accessRule.path.indexOf(pathName + ".*"));
              if (((contentRootPath + parentPath) == currentPath || parentPath == "") && fileName == pathName) {
                filePermission = this.updateRules(filePermission, accessRule);
              }
            }
            else if (contentRootPath + accessRule.path == filepath) {
              filePermission = this.updateRules(filePermission, accessRule);
            }
          }
        } else {
          if (!accessRule.isFile && !isFile && accessRule.path != null && (accessRule.role == null || accessRule.role == this.accessDetails.role)) {
            var parentFolderpath = contentRootPath + filterPath;
            if (accessRule.path.indexOf("*") > -1) {
              var parentPath = accessRule.path.substr(0, accessRule.path.indexOf("*"));
              if (((parentFolderpath + (parentFolderpath[parentFolderpath.length - 1] == "/" ? "" : "/") + name).lastIndexOf(contentRootPath + parentPath) == 0) || parentPath == "") {
                filePermission = this.updateRules(filePermission, accessRule);
              }
            } else if (path.join(contentRootPath, accessRule.path) == path.join(parentFolderpath, name) || path.join(contentRootPath, accessRule.path) == path.join(parentFolderpath, name + "/")) {
              filePermission = this.updateRules(filePermission, accessRule);
            }
            else if (path.join(parentFolderpath, name).lastIndexOf(path.join(contentRootPath, accessRule.path)) == 0) {
              filePermission.write = this.hasPermission(accessRule.writeContents);
              filePermission.writeContents = this.hasPermission(accessRule.writeContents);
              filePermission.message = this.getMessage(accessRule);
            }
          }
        }
      });
      return filePermission;
    }
  }

  private getPathPermission(path, isFile, name, filepath, contentRootPath, filterPath) {
    return this.getPermission(filepath, name, isFile, contentRootPath, filterPath);
  }

  /**
 * returns the current working directories
 */
  private FileManagerDirectoryContent(req, res, filepath, searchFilterPath?) {
    return new Promise(async (resolve, reject) => {
      var cwd: any = {};
      this.replaceRequestParams(req, res);
      const stats = await fs.promises.stat(filepath);
      cwd.name = path.basename(filepath);
      cwd.size = this.getSize(stats.size);
      cwd.isFile = stats.isFile();
      cwd.dateModified = stats.ctime;
      cwd.dateCreated = stats.mtime;
      cwd.type = path.extname(filepath);
      if (searchFilterPath) {
        cwd.filterPath = searchFilterPath;
      } else {
        cwd.filterPath = req.body.data.length > 0 ? this.getRelativePath(this.contentRootPath, this.contentRootPath + req.body.path.substring(0, req.body.path.indexOf(req.body.data[0].name))) : "";
      }
      cwd.permission = this.getPathPermission(req.path, cwd.isFile, (req.body.path == "/") ? "" : cwd.name, filepath, this.contentRootPath, cwd.filterPath);
      if ((await fs.promises.lstat(filepath)).isFile()) {
        cwd.hasChild = false;
        resolve(cwd);
      }
      if ((await fs.promises.lstat(filepath)).isDirectory()) {
        const stats = await fs.promises.readdir(filepath)
        stats.forEach(async stat => {
          if ((await fs.promises.lstat(filepath + stat)).isDirectory()) {
            cwd.hasChild = true
          } else {
            cwd.hasChild = false;
          }
          if (cwd.hasChild) return;
        });
        resolve(cwd);
      }
    });
  }


  private getRelativePath(rootDirectory, fullPath) {
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

  /**
 * Reads text from the file asynchronously and returns a Promise.
 */
  private async GetFiles(req, res): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      const files = await fs.promises.readdir(this.contentRootPath + req.body.path.replace(this.pattern, ""));
      resolve(files);
    });
  }

  /**
 * function to get the file details like path, name and size
 */
  private fileDetails(req, res, filepath) {
    return new Promise(async (resolve, reject) => {
      var cwd: any = {};
      const stats = await fs.promises.stat(filepath);
      cwd.name = path.basename(filepath);
      cwd.size = this.getSize(stats.size);
      cwd.isFile = stats.isFile();
      cwd.modified = stats.ctime;
      cwd.created = stats.mtime;
      cwd.type = path.extname(filepath);
      cwd.location = req.body.data[0].filterPath
      resolve(cwd);
    });
  }


  /** 
   * function to get the folder size
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

  /**
  * function to get the size in kb, MB
  */
  private getSize(size) {
    var hz;
    if (size < 1024) hz = size + ' B';
    else if (size < 1024 * 1024) hz = (size / 1024).toFixed(2) + ' KB';
    else if (size < 1024 * 1024 * 1024) hz = (size / 1024 / 1024).toFixed(2) + ' MB';
    else hz = (size / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    return hz;
  }

  private checkForMultipleLocations(req, contentRootPath) {
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


  private async copyFolder(source, dest: string) {
    this.createFolderIfNotExist(dest);
    var files = await fs.promises.readdir(source);
    files.forEach(async (file) => {
      var curSource = path.join(source, file);
      curSource = curSource.replace("../", "");
      if ((await fs.promises.lstat(curSource)).isDirectory()) {
        await this.copyFolder(curSource, path.join(dest, file)); source
      } else {
        fs.promises.copyFile(path.join(source, file), path.join(dest, file)).catch(e => { throw e; })
      }
    });
  }

  private async updateCopyName(path, name, count, isFile) {
    var subName = "", extension = "";
    if (isFile) {
      extension = name.substr(name.lastIndexOf('.'), name.length - 1);
      subName = name.substr(0, name.lastIndexOf('.'));
    }
    this.copyName = !isFile ? name + "(" + count + ")" : (subName + "(" + count + ")" + extension);
    if (await this.checkForDuplicates(path, this.copyName, isFile)) {
      count = count + 1;
      await this.updateCopyName(path, name, count, isFile);
    }
  }

  private async checkForFileUpdate(fromPath, toPath, item, contentRootPath, req) {
    var count = 1;
    var name = this.copyName = item.name;
    if (fromPath == toPath) {
      if (await this.checkForDuplicates(contentRootPath + req.body.targetPath, name, item.isFile)) {
        await this.updateCopyName(contentRootPath + req.body.targetPath, name, count, item.isFile);
      }
    } else {
      if (req.body.renameFiles.length > 0 && req.body.renameFiles.indexOf(item.name) >= 0) {
        await this.updateCopyName(contentRootPath + req.body.targetPath, name, count, item.isFile);
      } else {
        if (await this.checkForDuplicates(contentRootPath + req.body.targetPath, name, item.isFile)) {
          this.isRenameChecking = true;
        }
      }
    }
  }

  private async createFolderIfNotExist(path: string) {
    try {
      await fs.promises.access(path);
    } catch {
      await fs.promises.mkdir(path);
    }
  }

  private async MoveFolder(source, dest) {
    await this.createFolderIfNotExist(dest);
    var files = await fs.promises.readdir(source);
    files.forEach(async (file) => {
      var curSource = path.join(source, file);
      curSource = curSource.replace("../", "");
      if ((await fs.promises.lstat(curSource)).isDirectory()) {
        await this.MoveFolder(curSource, path.join(dest, file));
        await fs.promises.rmdir(curSource);
      } else {
        await fs.promises.copyFile(path.join(source, file), path.join(dest, file)).catch(e => { throw e })
        await fs.promises.unlink(path.join(source, file)).catch(e => { throw e });
      }
    });
  }

  /**
 * 
 * function to check for exising folder or file
 */
  private async checkForDuplicates(directory, name, isFile) {
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

  private updateRules(filePermission, accessRule) {
    filePermission.download = this.hasPermission(accessRule.read) && this.hasPermission(accessRule.download);
    filePermission.write = this.hasPermission(accessRule.read) && this.hasPermission(accessRule.write);
    filePermission.writeContents = this.hasPermission(accessRule.read) && this.hasPermission(accessRule.writeContents);
    filePermission.copy = this.hasPermission(accessRule.read) && this.hasPermission(accessRule.copy);
    filePermission.read = this.hasPermission(accessRule.read);
    filePermission.upload = this.hasPermission(accessRule.read) && this.hasPermission(accessRule.upload);
    filePermission.message = this.getMessage(accessRule);
    return filePermission;
  }

  private hasPermission(rule) {
    return ((rule == undefined) || (rule == null) || (rule == Permission.Allow)) ? true : false;
  }

  private getMessage(rule) {
    return ((rule.message == undefined) || (rule.message == null)) ? "" : rule.message;
  }
}
//====================================================================================
const Permission = {
  Allow: "allow",
  Deny: "deny"
};

class AccessDetails {
  constructor(public role?: any, public rules?: any) {
  }
}

class AccessPermission {
  constructor(public read?: any, public write?: any, public writeContents?: any, public copy?: any, public download?: any, public upload?: any, public message?: any) {
  }
}

class AccessRules {
  constructor(public path?: any, public role?: any, public read?: any, public write?: any, public writeContents?: any, public copy?: any, public download?: any, public upload?: any, public isFile?: any, public message?: any) {
  }
}

