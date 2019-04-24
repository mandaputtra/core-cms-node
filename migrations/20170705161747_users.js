exports.up = (knex, Promise) => Promise.all([
  knex.schema.dropTableIfExists('users'),
  knex.schema.createTableIfNotExists('users', (t) => {
    t.increments('user_id').primary();
    t.string('first_name');
    t.string('last_name');
    t.string('phone').unique();
    t.string('email').defaultTo('').unique().notNullable();
    t.integer('status').unsigned().notNullable();
    t.string('password').notNullable();
    t.string('username').unique().nullable();
    t.timestamps(true);
  }),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.dropTableIfExists('users'),
]);
