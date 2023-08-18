<div align="center"><img src="./frontend-angular/src/assets/img/logo.png" \></div>


# Autism Children Technical System (ACTS)

The project manages the state of the autistic children and children with special needs. It enables the assignment of goals for children and tracking how the child performs the goal by evaluating the goal with a description by the trainer. The project shows weekly, monthly, or annual reports on the child’s goals' progress. These reports and other information can be shown by the child’s parents online. ACTS transfers the manual management and education system into an integrated computer system that facilitates the many written and complex processes for easier operations (e.g., children's information, goals, evaluations, …etc.).

In conclusion, Children with autism or special needs are trained with complex processes and overwhelming duplicated written papers. Therefore, ACTS is cost-effective in the sense that it has eliminated the paperwork. Also, the system is time effective because the calculations are automated and are made to the trainer's requirements. Finally, ACTS is easy to use and learn due to its simple attractive interface. Trainers do not require special training to operate the system.


[Full documentation PDF file](./documentation/Final%20Report%2007-06-2023.pdf)





## **Local deployment steps**
3. Run `npm install` inside the `frontend-angular` and `backend-nest` directories to install all packages needed.
1. Build the `front-end` project.
4. Install `MySQL` and make sure its service starts when the Server starts up.
5. Run the `database-mysql/schema.sql` file by `MySQL` to create the Database and its schema.
6. Change the environment variables of `.env` file to the database settings (port, user).
7. Check the router DHCP IPs scope, then assign the Server to static IP that is not in DHCP scope.
8. Change the `HOST_SERVER` variable in the `.env` file to the Server static IP.
9. Run the NodeJs. (Can be accessed by `http://ip:port` where `ip` is the Server IP and `port` is the NodeJs port). `ip` and `port` can be changed from `.env` file.


## **Tips**
1. Create a file that runs the NodeJs. (CMD shortcut with the run command).
2. Create an Edge Application of the local website to run it as a Desktop application.



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
