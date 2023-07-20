/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
import { Logger } from "@nestjs/common";
import { DataSource, DeepPartial, EntityManager, EntityTarget, ObjectLiteral } from "typeorm";
import { ChildEntity, CreateChild } from "./management/child/child.entity";
import { faker as fakerEN, fakerAR, Faker } from '@faker-js/faker'
import { PersonEntity } from "./management/person/person.entity";
import { AccountEntity } from "./management/account/account.entity";
import { ICreateAccount, ICreateActivity, ICreateEvaluation, ICreateField, ICreateGoal, ICreatePerson, ICreateProgram } from "../../interfaces";
import { ProgramEntity } from "./management/program/program.entity";
import { FieldEntity } from "./management/field/field.entity";
import { ActivityEntity } from "./management/activity/activity.entity";
import { GoalEntity } from "./management/goal/Goal.entity";
import { EvaluationEntity } from "./management/evaluation/evaluation.entity";
const faker: Faker = process.env.FAKER_LANG == 'ar' ? fakerAR : fakerEN;

function log(msg: string) {
	Logger.debug(msg, 'FAKER');
}
/**
 * Faker will generate random data if:
 * 1. environment is not production. AND
 * 2. children table is empty; because user can't delete a child we sure the database is empty if children table is empty.
 * Note: faker should run after `schema.sql` have been run. So, roles won't be added and will be assigned as written in the file.
 * Also, all faker's accounts has one password which is `asdf`; because passwords are hashed you won't be able to access any account if it was random.
 */
export async function generateFakeData(dataSource: DataSource) {
	if (process.env.PRODUCTION == 'true') {
		log('Production environment! Faker closed')
		return;
	}
	log('Checking database is empty...');
	const isEmpty: boolean = (await dataSource.getRepository(ChildEntity).count()) == 0;
	if (!isEmpty) {
		log(`Database is not empty. Faker closed`);
		return;
	}
	log(`Database is empty. Generating Fake data in '${process.env.FAKER_LANG}' language after three seconds...`);
	setTimeout(() => {
		dataSource.transaction(async manager => {
			log('Generating begin...')
			log('Generating persons...')
			let createPersons: ICreatePerson[] = new Array(700).fill(null).map(() => {
				const gender: 'Male' | 'Female' = faker.helpers.arrayElement(['Male', 'Female'])
				return {
					name: faker.person.fullName({ sex: gender.toLowerCase() as 'female' | 'male' }),
					gender,
					createdDatetime: faker.date.recent({ days: 10000 }),
					birthDate: optional(toDate(faker.date.birthdate())),
					image: optional(faker.image.avatar()),
				}
			});
			const persons: PersonEntity[] = await saveArray(manager, PersonEntity, createPersons, 'image' as any);
			log(persons.length + ' persons generated');

			log('Generating accounts...')
			let createAccounts: ICreateAccount[] = new Array(300).fill(null).map((v, i) => {
				return {
					personId: persons[i].id,
					phone0: optional(faker.phone.number('+############')),
					phone1: optional(faker.phone.number('+############')),
					phone2: optional(faker.phone.number('+############')),
					phone3: optional(faker.phone.number('+############')),
					phone4: optional(faker.phone.number('+############')),
					phone5: optional(faker.phone.number('+############')),
					phone6: optional(faker.phone.number('+############')),
					phone7: optional(faker.phone.number('+############')),
					phone8: optional(faker.phone.number('+############')),
					phone9: optional(faker.phone.number('+############')),
					username: faker.internet.userName({ firstName: persons[i].name }).substring(0, 32),
					password: '$2b$10$fjYy8Y5t7UWcV8I7LF6bj..N.Ua9wer/mzFBNB7ieNWz8cror6vM6',//asdf
					address: optional(faker.location.streetAddress(true)),
					roles: [],//will be assigned later
					rolesEntities: faker.helpers.arrayElements([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }], { min: 1, max: 4 })
				}
			});
			const accounts: AccountEntity[] = await saveArray(manager, AccountEntity, createAccounts, 'username');
			log(accounts.length + ' accounts generated')


			log('Generating programs...')
			let createPrograms: ICreateProgram[] = new Array(20).fill(null).map(() => ({
				name: faker.word.noun(),
				createdDatetime: faker.date.recent({ days: 1000 }),
			}));

			const programs: ProgramEntity[] = await saveArray(manager, ProgramEntity, createPrograms, 'name');
			log(programs.length + ' programs generated')


			log('Generating fields...')
			let createFields: ICreateField[] = new Array(20).fill(null).map(() => ({
				name: faker.word.adjective({ length: { min: 4, max: 20 } }),
				createdDatetime: faker.date.recent({ days: 1000 }),
			}));

			const fields: FieldEntity[] = await saveArray(manager, FieldEntity, createFields, 'name');
			log(fields.length + ' fields generated')

			log('Generating children...')
			const createChildren: CreateChild[] = new Array(persons.length - 300).fill(null).map((v, i) => {
				const maleFamilyMembers = optional(faker.number.int({ min: 0, max: 20 }));
				const femaleFamilyMembers = optional(faker.number.int({ min: 0, max: 20 }));
				return {
					personId: persons[i + 300].id,
					behaviors: optional(faker.lorem.sentence()),
					maleFamilyMembers,
					femaleFamilyMembers,
					birthOrder: optional(faker.number.int({ min: 0, max: (maleFamilyMembers ?? 0) + (femaleFamilyMembers ?? 0) })),
					birthState: optional(faker.lorem.sentences()),
					medicine: optional(faker.lorem.sentences()),
					diagnostic: optional(faker.lorem.sentences()),
					diagnosticDate: optional(toDate(faker.date.past({ years: 4 }))),
					parentsKinship: optional(faker.lorem.sentences()),
					pregnancyState: optional(faker.lorem.sentences()),
					programId: optional(faker.helpers.arrayElement(programs).id),
					growthState: optional(faker.lorem.sentences()),
					isArchive: faker.helpers.arrayElement([true, false, false, false, false, false]),//increase `false` probability
					parentId: optional(faker.helpers.arrayElement(accounts.filter(a => a.rolesEntities.map(r => r.id).includes(2))).id),//parent role is id=2
					prioritySkills: optional(faker.lorem.sentence()),
					teachers: optional(faker.helpers.arrayElements(accounts.filter(a => a.rolesEntities.map(r => r.id).includes(3))))//teacher role is id=3
				};
			});

			const children: ChildEntity[] = await saveArray(manager, ChildEntity, createChildren);
			log(children.length + ' children generated');


			log('Generating activities...')
			const createActivities: ICreateActivity[] = new Array(500).fill(null).map(() => {
				const minAge = faker.number.int({ min: 0, max: 20 })
				return {
					name: faker.lorem.sentence(),
					createdDatetime: faker.date.recent({ days: 1000 }),
					fieldId: faker.helpers.arrayElement(fields).id,
					minAge,
					maxAge: faker.number.int({ min: minAge, max: 20 }),
					programId: optional(faker.helpers.arrayElement(programs).id),
				}
			});

			const activities: ActivityEntity[] = await saveArray(manager, ActivityEntity, createActivities, 'name');
			log(activities.length + ' activities generated');


			log('Generating goals...')
			const createGoals: ICreateGoal[] = new Array(20000).fill(null).map(() => {
				return {
					activityId: faker.helpers.arrayElement(activities).id,
					childId: faker.helpers.arrayElement(children).id,
					state: faker.helpers.arrayElement(['continual', "strength", "completed"]),
					teacherId: faker.helpers.arrayElement(accounts.filter(a => a.rolesEntities.map(r => r.id).includes(3))).id,
					assignDatetime: faker.date.recent({ days: 1000 }),
					note: optional(faker.lorem.sentences()),
				}
			});

			const goals: GoalEntity[] = await saveArray(manager, GoalEntity, createGoals);
			log(goals.length + ' goals generated')


			log('Finally generating evaluations...')
			const createEvaluations: ICreateEvaluation[] = new Array(100000).fill(null).map(() => {
				return {
					description: faker.lorem.sentences(),
					goalId: faker.helpers.arrayElement(goals).id,
					rate: faker.helpers.arrayElement(['continual', 'excellent']),
					teacherId: faker.helpers.arrayElement(accounts.filter(a => a.rolesEntities.map(r => r.id).includes(3))).id,
					evaluationDatetime: faker.date.recent({ days: 1000 }),
					mainstream: optional(faker.lorem.sentences()),
					note: optional(faker.lorem.sentences()),
				}
			});
			const evaluations: EvaluationEntity[] = await saveArray(manager, EvaluationEntity, createEvaluations);
			log(evaluations.length + ' evaluations generated')
		}).then(() => log('DONE! Faker changes have been applied to the Database.'))
			.catch((e) => {
				log('Error occur. Rollback Faker changes');
				console.trace(e)
			});
	}, 3000);

}

/**
 * example: [{username:'ali'},{username:'ali'}] => [{username:'ali'}]
 * @param uniqueKey is the unique property.
 * @returns unique array of objects.
 * */
function uniquify<T>(arr: T[], uniqueKey: keyof T): T[] {
	const values = arr.map(v => v[uniqueKey]);
	const uniqueValues = [];
	for (let v of values)
		if (!uniqueValues.includes(v))
			uniqueValues.push(v);
	return arr.filter(v => uniqueValues.includes(v[uniqueKey]));
}

function optional<T>(value: T): T | null {
	return faker.number.int({ min: 0, max: 6 }) == 1 ? null : value;
}

/** 2002-02-22T22:..etc => 2002-02-22*/
function toDate(datetime: Date) {
	return datetime.toISOString().split('T')[0]
}

async function saveArray<Entity extends ObjectLiteral, T extends DeepPartial<Entity>>(manager: EntityManager, entityTarget: EntityTarget<Entity>, arr: T[], uniqueColumn?: keyof T): Promise<(T & Entity)[]> {
	if (!uniqueColumn)
		return manager.getRepository(entityTarget).save(arr);
	arr = uniquify(arr, uniqueColumn);
	const savedArr: (T & Entity)[] = [];
	for (let a of arr) {//MySQL is broken sometimes it throws an error of duplicate entry while there is no duplication so we ignore these by catching
		let saved = await manager.getRepository(entityTarget).save(a).catch(() => { });
		if (saved)
			savedArr.push(saved);
	}
	return savedArr;
}