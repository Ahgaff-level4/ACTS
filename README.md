# Autism Children Technical System (ACTS)

# Setup

### NodeJs

1. Install NodeJs. Preferred version 18.13.0
2. Check installation by typing in the CMD:

 ```cmd
 node -v
 ```

Also

```cmd
npm -v
```

You should get the version number

### MySQL

1. Install MySQL.
2. Open MySQL Workbench.
3. Create New Connection.
4. Test the connection.
5. Change the host and port in the file `.env` in the `backend-nest` folder to the same port and hostname used by MySQL.
   
### Angular

1. Pre-condition: installing NodeJs.
2. Open this project by the CMD. Preferred using VisualCode open the Terminal.
3. Navigate to `frontend-angular` folder. So, the terminal will look like:

```cmd
.../ACTS/frontend-angular>
```

4. Then type:

```cmd
.../ACTS/frontend-angular> npm install
```

So that all dependencies in `package.json` will be downloaded and installed.
>See `README.md` file in `frontend-angular` folder for more information of how to run the application.

### NestJs

1. Pre-condition: installing NodeJs.
2. Open this project by the CMD. Preferred using VisualCode open the Terminal.
3. Navigate to `backend-nest` folder. So, the terminal will look like:

```cmd
.../ACTS/backend-nest>
```

4. Then type:

```cmd
.../ACTS/backend-nest> npm install
```

So that all dependencies in `package.json` will be downloaded and installed.
>See `README.md` file in `backend-nest` folder for more information of how to run the application.

## Debug process

- Angular project as frontend. Debug will be in localhost of angular (it is a server but temporary).
- NestJS project as backend. Debug will be in localhost of nestJs (it is another and main server).
- These two projects will be in the same repository; to share common files (e.g., classes).
- To debug Angular with NestJs api we need to run both servers. Then, solve Cross-Origin problem. After that, in Angular we use Nest api by addressing full path (e.g., `localhost:NestPort/api/...` ).
- When finish debugging we will build the Angular project, take resulting files. After that, it will be hosing in NestJs. Then deploy NestJs.

## Convention

### **Naming**

#### **1. No hard coded text string.**

There should be a way to convert all static text string to Arabic.
>`var title = this.ut.translate('Hello World!')`
>`<h1>{{'Hello World!'|translate}}</h1>`

#### **2. Address path of HTML page should be identical to its most used table name.**

> field page will have address path as: `domain.com/field`

#### **3. Address path of JSON API will have prefix of `api` .**

>`domain.com/api/...`

#### **4. Address path of JSON API should be identical to its most used table name.**

>`domain.com/api/field` for all operations: GET, POST, PATCH, DELETE.

#### **5. All table names and their columns should be identical in coding BUT in camelCase.**

> Table `Activity(ID, Name, FieldId)` will be `activity(id, name, fieldId)`

#### **6. Foreign key name is the refereed table name with suffix of `id`.**

> `activity(..., fieldId)`

#### **7. Foreign key attribute have its object with same attribute name subtract `Id`.**

> `goal(..., activityId)` Will has `goal(..., activityId, activity)` where `activity` is object of type Activity, correspond of activityId. This is true only by retrieving data from the server. And the child attribute `activity` in our example has nothing to do in deleting or updating. Its job only to show the `activityId` information. We will let the frontend developer solve this issue as a homework 🙂

#### **8. Any attribute of type `Date` -in javascript- its name should contains `Date`, or `Datetime` if time is concerned.**

Because JSON format dose not has type `Date`. But the database has different types for `DATE` and `DATETIME`.
> `person(..., birthDate, createdDatetime)` Here we can know `birthDate` is type of `string` -in javascript- because time is NOT concerned (e.g., `2023-11-15`). `createdDatetime` is type of `Date` because time is concerned.

### **API**

#### **1. Each table will have 5 calls base on params and operations:**
  
Create, with `POST` operation passing an object as in request body.
> `http.post("domain.com/api/field", fieldObject)`

Update, with `PATCH` operation passing updated object in request body, and the item id in the request param.
> `http.patch("domain.com/api/field/"+fieldObject.id, fieldObject)`

Delete, with `DELETE` operation passing the id of the deleted item in request param.
> `http.delete("domain.com/api/field/"+fieldObject.id)`

Read, with `GET` operation optionally passing id as param if not passed will return all.
> `http.get("domain.com/api/field")` will return all fields.
    
> `http.get("domain.com/api/field/1")` will return array of length one -if exist or zero- of the field with `id == 1`

Tables may have foreign key so to get an object instead only foreign key id. We pass true to `FK` query
> `http.get("domain.com/api/child?FK=true")` will return all children with `person` property has person object that correspond to `personId`.

#### **2. GET request of path with table name (e.g., `.../api/field` or `.../api/field/1`) will return an object its properties is exactly its columns. And foreign key will be as said in (`Convention` > `Naming` > `7`)**

> Table `goal(id, activityId, ...)` will has path `.../api/goal` and will respond -for GET operation- with an array of goals object structure as `[{id:1, activityId:9, activity:{...,minAge:4,maxAge:6}...}, ...]`

#### **3. Each request should provide a token in the request header. And authorization of user privilege should be in the server before any respond.**

> `headers:{'Authorization': 'Bearer a876d8a5dd79a79f6f'}`

#### **4. Properties of type `Date` should send to the server with type string and its value is in ISO format.**

> we can easily convert variable of type `Date` to string of ISO format by `new Date().toISOString()`




## **Versions**

  Package | Version
  :--- | :---
  NodeJs | 18.13.0
  npm (Package Manager) | 8.19.3
  MySQL Workbench | 8.0 CE
  Angular CLI | 15.0.5
  @anSet-ExecutionPolicy -ExecutionPolicy RemoteSignedgular-devkit/architect | 0.1500.5 (cli-only)
  @angular-devkit/core | 15.0.4
  @angular-devkit/schematics | 15.0.4
  @schematics/angular | 15.0.5 (cli-only)
  Nest CLI | 9.1.8



## **Local deployment steps**
1. Build frontend project.
2. Clone `backend-nest` from Github to the new computer which will be the Server.
3. Run `npm install` to install all packages needed.
4. Install `MySQL` and make sure its service start when the Server start up.
5. Run `database-mysql/schema.sql` file by `MySQL` to create the Database and its schema.
6. Change `.env` file to the database settings (port, user).
7. Check the router DHCP IPs scope, then assign the Server to static IP that is not in DHCP scope.
8. Change `HOST_SERVER` variable in `.env` file to the Server static IP.
9. Run the NodeJs. (Can be access by `http://ip:port` where `ip` is the Server IP and `port` is the NodeJs port).


## **Tips**
1. Create file that runs the NodeJs. (CMD shortcut with the run command).
2. Create Edge Application.
3. 