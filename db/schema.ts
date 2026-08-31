import { sqliteTable,text,integer } from 'drizzle-orm/sqlite-core';
export const studioOwner=sqliteTable('studio_owner',{id:integer('id').primaryKey(),userId:text('user_id').notNull(),createdAt:text('created_at').notNull()});
export const media=sqliteTable('media',{id:text('id').primaryKey(),objectKey:text('object_key').notNull().unique(),filename:text('filename').notNull(),mime:text('mime').notNull(),bytes:integer('bytes').notNull(),alt:text('alt').notNull().default(''),createdAt:text('created_at').notNull()});
export const placements=sqliteTable('placements',{slot:text('slot').primaryKey(),mediaId:text('media_id').notNull().references(()=>media.id),updatedAt:text('updated_at').notNull()});
export const settings=sqliteTable('settings',{id:integer('id').primaryKey(),contactEmail:text('contact_email').notNull().default(''),location:text('location').notNull().default(''),linkedin:text('linkedin').notNull().default('')});
