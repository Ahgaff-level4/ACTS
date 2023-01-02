# Autism Children Technical System (ACTS)

# Convention:
- ## **Naming**:
  ### **1.** No hard coded text string;  
        There should be a way to convert all static text string to Arabic.
    > `var title = R.lang.titleName`

  ### **2.** Address path of HTML page should be identical to its most used table name.
    > field page will have address path as: `domain.com/field`

  ### **3.** Address path of JSON API will have prefix of `api`.
    > `domain.com/api/...`
    
  ### **4.** Address path of JSON API should be identical to its most used table name.
    > `domain.com/api/field` for all operations: GET, POST, PATCH, DELETE.
  
  ### **5.** All table names and their columns should be identical in coding BUT in camelCase.
    > Table `Performance(ID, Name, FieldId)` will be `performance(id, name, fieldId)`

  ### **6.** Foreign key name is the refereed table name with suffix of `id`.
    > `performance(..., fieldId)`
    
  <br/>
- ## **API**:
  ### **1.** Each table will have 5 calls base on params and operations as:
    - Create, with `POST` operation passing an object as in request body.
      > `http.post("domain.com/api/field", fieldObject)`
    - Update, with `PATCH` operation passing updated object in request body, and the item id in the request param.
      > `http.patch("domain.com/api/field/"+fieldObject.id, fieldObject)`
    - Delete, with `DELETE` operation passing the id of the deleted item in request param.
      > `http.delete("domain.com/api/field/"+fieldObject.id)`
    - Read, with `GET` operation optionally passing id as param if not passed will return all.
      > `http.get("domain.com/api/field")` will return all fields
      
      > `http.get("domain.com/api/field/1")` will return the field with `id == 1`
      
  ### **2.** Request a path with table name (e.g., `.../api/field/1`) will return an object its properties is exactly its columns.
      This is not practical when dealing with object that has foreign key because we won't have data. (e.g., `goal(..., performanceId)`) but we want to show the performance name! We will let the frontend developer solve this problem as a homework 🙂
  > Table `goal(id, performanceId, ...)` will has path `.../api/goal` and will respond -for GET operation- with an array of goals object structure as `[{id:1, performanceId:9,...}, ...]`
  
  ### **3.** Each request should provide a token in the request header.
  > `