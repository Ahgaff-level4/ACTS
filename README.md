# Autism Children Technical System (ACTS)

## Setup

- ### NodeJs

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

- ### MySQL

  1. Install MySQL.
  2. Open MySQL Workbench.
  3. Create New Connection.
  4. Test the connection.
  5. Change the host and port in the file `.env` in the `backend-nest` folder to the same port and hostname used by MySQL.

- ### Angular

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

- ### NestJs

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

- ### **Naming**

  #### **1. No hard coded text string.**

  There should be a way to convert all static text string to Arabic.
  >`var title = R.lang.titleName`

  #### **2. Address path of HTML page should be identical to its most used table name.**

  > field page will have address path as: `domain.com/field`

  #### **3. Address path of JSON API will have prefix of `api` .**

  >`domain.com/api/...`

  #### **4. Address path of JSON API should be identical to its most used table name.**

  >`domain.com/api/field` for all operations: GET, POST, PATCH, DELETE.

  #### **5. All table names and their columns should be identical in coding BUT in camelCase.**

  > Table `Performance(ID, Name, FieldId)` will be `performance(id, name, fieldId)`

  #### **6. Foreign key name is the refereed table name with suffix of `id` .**

    > `performance(..., fieldId)`

- ### **API**

  #### **1. Each table will have 5 calls base on params and operations:**
  
  - Create, with `POST` operation passing an object as in request body.
    > `http.post("domain.com/api/field", fieldObject)`

  - Update, with `PATCH` operation passing updated object in request body, and the item id in the request param.
    > `http.patch("domain.com/api/field/"+fieldObject.id, fieldObject)`

  - Delete, with `DELETE` operation passing the id of the deleted item in request param.
    > `http.delete("domain.com/api/field/"+fieldObject.id)`

  - Read, with `GET` operation optionally passing id as param if not passed will return all.
    > `http.get("domain.com/api/field")` will return all fields

    > `http.get("domain.com/api/field/1")` will return the field with `id == 1`

  #### **2. Request a path with table name (e.g., `.../api/field/1` ) will return an object its properties is exactly its columns.**

    This is not practical when dealing with object that has foreign key because we won't have data. (e.g., `goal(..., performanceId)` ) but we want to show the performance name! We will let the frontend developer solve this problem as a homework 🙂 (See: number 4)

  > Table `goal(id, performanceId, ...)` will has path `.../api/goal` and will respond -for GET operation- with an array of goals object structure as `[{id:1, performanceId:9,...}, ...]`

  #### **3. Each request should provide a token in the request header. And authorization of user privilege should be in the server before any respond.**
  
  > `headers:{'Authorization': 'Bearer a876d8a5dd79a79f6f'}`

  #### **4. Some API path will combine two or more table names. That mean there is join query. These paths only has GET operation. First table name is the main table left joined with following table names.**
  
  > `.../api/goalPerformance/[id]` will return the goal with id specified and left joined with performance. Object structure will be `{id, performanceId,...goal, performance}` where performance is an object containing all performance columns as properties.

<br/>

## Versions

<table>
  <tr>
  <th>
  Package</th>
  <th>
  Version</th></tr>
  <tr><td>NodeJs</td><td>18.13.0</td></tr>
  <tr><td>npm (Package Manager)</td><td>8.19.3</td></tr>
  <tr><td>yarn(Package Manager)</td><td>3.3.1</td></tr>
  <tr><td>Angular CLI</td><td>15.0.5</td></tr>
  <tr><td>@anSet-ExecutionPolicy -ExecutionPolicy RemoteSignedgular-devkit/architect</td><td>0.1500.5 (cli-only)</td></tr>
  <tr><td>@angular-devkit/core</td><td>15.0.4</td></tr>
  <tr><td>@angular-devkit/schematics</td><td>15.0.4</td></tr>
  <tr><td>@schematics/angular</td><td>15.0.5 (cli-only)</td></tr>
  <tr><td>Nest CLI</td><td>9.1.8</td></tr>
</table>
