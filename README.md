# Autism Children Technical System (ACTS)

The project manages the state of the autistic children and children with special needs. It enables the assignment of goals for children and tracking how the child performs the goal by evaluating the goal with a description by the trainer. The project shows weekly, monthly, or annual reports on the child’s goals' progress. These reports and other information can be shown by the child’s parents online. ACTS transfers the manual management and education system into an integrated computer system that facilitates the many written and complex processes for easier operations (e.g., children's information, goals, evaluations, …etc.).

In conclusion, Children with autism or special needs are trained with complex processes and overwhelming duplicated written papers. Therefore, ACTS is cost-effective in the sense that it has eliminated the paperwork. Also, the system is time effective because the calculations are automated and are made to the trainer's requirements. Finally, ACTS is easy to use and learn due to its simple attractive interface. Trainers do not require special training to operate the system.

# Setup

### NodeJs

1. Install NodeJs. Preferred version 18.13.0
2. Check the installation by typing in the CMD:

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

1. Pre-condition: Installing NodeJs.
2. Open this project by the CMD. Preferred using VisualCode open the Terminal.
3. Navigate to the `frontend-angular` folder. So, the terminal will look like this:

```cmd
.../ACTS/frontend-angular>
```

4. Then type:

```cmd
.../ACTS/frontend-angular> npm install
```

So that all dependencies in `package.json` will be downloaded and installed.
>See the `README.md` file in the `frontend-angular` folder for more information on how to run the application.

### NestJs

1. Pre-condition: Installing NodeJs.
2. Open this project by the CMD. Preferred using VisualCode open the Terminal.
3. Navigate to the `backend-nest` folder. So, the terminal will look like this:

```cmd
.../ACTS/backend-nest>
```

4. Then type:

```cmd
.../ACTS/backend-nest> npm install
```

So that all dependencies in `package.json` will be downloaded and installed.
>See the `README.md` file in the `backend-nest` folder for more information on how to run the application.

## Debug process

- Angular project as front end. Debug will be in the localhost of angular (it is a server but temporary).
- NestJS project as backend. Debug will be in the localhost of nestJs (it is another and main server).
- These two projects will be in the same repository; to share common files (e.g., classes).
- To debug Angular with NestJs API we need to run both servers. Then, solve the Cross-Origin problem. After that, in Angular, we use Nest API by addressing the full path (e.g., `localhost:NestPort/api/...` ).
- When finish debugging we will build the Angular project, and take the resulting files. After that, it will be hosting in NestJs. Then deploy NestJs.

## Convention

### **Naming**

#### **1. No hard coded text.**

You should pass the text to the global pipe `translate` to convert all static text strings to Arabic.
>`var title = this.ut.translate('Hello World!')`
>`<h1>{{'Hello World!'|translate}}</h1>`

#### **2. The address path of the HTML page should be identical to its most used table name.**

> field page will have the address path as: `domain.com/field`

#### **3. The address path of JSON API will have a prefix `api` .**

>`domain.com/api/...`

#### **4. The address path of JSON API should be identical to its most used table name.**

>`domain.com/api/field` for all operations: GET, POST, PATCH, DELETE.

#### **5. All table names and their columns should be identical in coding BUT in camelCase.**

> Table `Activity(ID, Name, FieldId)` will be `activity(id, name, fieldId)`

#### **6. The foreign key name is the refereed table name with the suffix of `id`.**

> `activity(..., fieldId)`

#### **7. Foreign key attributes have their object with the same attribute name subtract `Id`.**

> `goal(..., activityId)` Will has `goal(..., activityId, activity)` where `activity` is an object of type Activity, corresponding to activityId. This is true only by retrieving data from the server. And the child attribute `activity` in our example has nothing to do with deleting or updating. It job only to show the `activityId` information. We will let the frontend developer solve this issue as homework 🙂

#### **8. Any attribute of type `Date` -in javascript- its name should contain `Date`, or `Datetime` if time is concerned.**

Because JSON format does not have the type `Date`. But the database has different types for `DATE` and `DATETIME`.
> `person(..., birthDate, createdDatetime)` Here we can know `birthDate` is a type of `string` -in javascript- because time is NOT concerned (e.g., `2023-11-15`). `createdDatetime` is a type of `Date` because time is concerned.

### **API**

#### **1. Each table will have 5 calls base on params and operations:**
  
Create, with a `POST` operation passing an object as in the request body.
> `http.post("domain.com/api/field", fieldObject)`

Update, with the `PATCH` operation passing the updated object in the request body, and the item id in the request param.
> `http.patch("domain.com/api/field/"+fieldObject.id, fieldObject)`

Delete, with the `DELETE` operation passing the id of the deleted item in the request param.
> `http.delete("domain.com/api/field/"+fieldObject.id)`

Read, with the `GET` operation optionally passing id as param if not passed will return all.
> `http.get("domain.com/api/field")` will return all fields.
    
> `http.get("domain.com/api/field/1")` will return an array of length one -if exist or zero- of the field with `id == 1`

Tables may have a foreign key to get an object instead only a foreign key id. We pass true to the `FK` query
> `http.get("domain.com/api/child?FK=true")` will return all children with `person` property has a person object that corresponds to `personId`.

#### **2. GET request of a path with table name (e.g., `.../api/field` or `.../api/field/1`) will return an object whose properties are exactly its columns. And foreign key will be as said in (`Convention` > `Naming` > `7`)**

> Table `goal(id, activityId, ...)` will have path `.../api/goal` and will respond -for GET operation- with an array of goals object structure as `[{id:1, activityId:9, activity:{...,minAge:4,maxAge:6}...}, ...]`

#### **3. Each request should provide a token in the request header. And authorization of user privilege should be in the server before any response.**

> `headers:{'Authorization': 'Bearer a876d8a5dd79a79f6f'}`

#### **4. Properties of type `Date` should send to the server with the type string and its value is in ISO format.**

> We can easily convert a variable of type `Date` to a string of ISO format by `new Date().toISOString()`




## **Versions**

  Package | Version
  :--- | :---
  NodeJs | 18.13.0
  npm (Package Manager) | 8.19.3
  MySQL Workbench | 8.0 CE
  Angular CLI | 15.0.5
  @anSet-ExecutionPolicy -ExecutionPolicy RemoteSignedgular-devkit/architect | 0.1500.5 (CLI-only)
  @angular-devkit/core | 15.0.4
  @angular-devkit/schematics | 15.0.4
  @schematics/angular | 15.0.5 (CLI-only)
  Nest CLI | 9.1.8



## **Local deployment steps**
1. Build a front-end project.
2. Clone `backend-nest` from Github to the new computer which will be the Server.
3. Run `npm install` to install all packages needed.
4. Install `MySQL` and make sure its service starts when the Server starts up.
5. Run the `database-mysql/schema.sql` file by `MySQL` to create the Database and its schema.
6. Change the `.env` file to the database settings (port, user).
7. Check the router DHCP IPs scope, then assign the Server to static IP that is not in DHCP scope.
8. Change the `HOST_SERVER` variable in the `.env` file to the Server static IP.
9. Run the NodeJs. (Can be accessed by `http://ip:port` where `ip` is the Server IP and `port` is the NodeJs port).


## **Tips**
1. Create a file that runs the NodeJs. (CMD shortcut with the run command).
2. Create Edge Application.
