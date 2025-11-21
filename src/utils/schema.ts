import z from 'zod';

export const objectId = z.coerce.string();

export const itemId = z.string();

export const integer = z.number().int();

export const datetime = z.coerce.date();
