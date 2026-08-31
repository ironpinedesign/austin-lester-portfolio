import { sqliteTable,text,integer } from 'drizzle-orm/sqlite-core';
export const studioOwner=sqliteTable('studio_owner',{id:integer('id').primaryKey(),userId:text('user_id').notNull(),createdAt:text('created_at').notNull()});
export const media=sqliteTable('media',{id:text('id').primaryKey(),objectKey:text('object_key').notNull().unique(),filename:text('filename').notNull(),mime:text('mime').notNull(),bytes:integer('bytes').notNull(),alt:text('alt').notNull().default(''),createdAt:text('created_at').notNull()});
export const placements=sqliteTable('placements',{slot:text('slot').primaryKey(),mediaId:text('media_id').notNull().references(()=>media.id),updatedAt:text('updated_at').notNull()});
export const settings=sqliteTable('settings',{id:integer('id').primaryKey(),contactEmail:text('contact_email').notNull().default(''),location:text('location').notNull().default(''),linkedin:text('linkedin').notNull().default('')});
export const contentState=sqliteTable('content_state',{id:integer('id').primaryKey(),revision:integer('revision').notNull().default(0),valuesJson:text('values_json').notNull().default('{}'),previousJson:text('previous_json'),updatedAt:text('updated_at').notNull().default('')});
export const contentMigration=sqliteTable('content_migration',{name:text('name').primaryKey()});
