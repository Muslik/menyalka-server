/* import { Injectable } from '@nestjs/common'; */
/* import { InjectRepository } from '@nestjs/typeorm'; */
/* import { Role } from '../roles/entities/role.entity'; */
/* import { Permission } from '../permissions/entities/permission.entity'; */
/**/
/* @Injectable() */
/* export class SeederService { */
/*   constructor( */
/*   ) {} */
/**/
/*   async seedAccessControl() {} */
/**/
/*   async seed() { */
/*     // Define the roles and permissions you want to seed */
/*     const rolesData = [ */
/*       { name: 'Admin' }, */
/*       { name: 'User' }, */
/*       { name: 'Moderator' }, */
/*     ]; */
/**/
/*     const permissionsData = [ */
/*       { name: 'READ' }, */
/*       { name: 'WRITE' }, */
/*       { name: 'DELETE' }, */
/*     ]; */
/**/
/*     // Check if data already exists to avoid duplicates */
/*     const existingRoles = await this.roleRepository.find(); */
/*     const existingPermissions = await this.permissionRepository.find(); */
/**/
/*     if (existingRoles.length === 0) { */
/*       await this.roleRepository.save(rolesData); */
/*       console.log('Roles seeded successfully.'); */
/*     } else { */
/*       console.log('Roles already exist, skipping seed.'); */
/*     } */
/**/
/*     if (existingPermissions.length === 0) { */
/*       await this.permissionRepository.save(permissionsData); */
/*       console.log('Permissions seeded successfully.'); */
/*     } else { */
/*       console.log('Permissions already exist, skipping seed.'); */
/*     } */
/*   } */
/* } */
