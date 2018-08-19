const pg = require('pg-promise')();
pg.pg.defaults.ssl = true;
const db = pg(process.env.DATABASE_URL, { ssl: true});
const dropNode = `drop table if exists node`
const dropLink = `drop table if exists link`
const createNode = `
create table node (
    id serial primary key,
    cluster integer not null
)
`;
const createLink = `
create table link (
    id serial primary key,
    source integer references node(id),
    target integer references node(id),
    created_at timestamp not null default now()
)
`;
const insertNode = `
insert into node(cluster)
values ($1)
returning id
`;
const init = async () => {
    await db.any(dropLink);
    await db.any(dropNode);
    await db.any(createNode);
    await db.any(createLink);

    for (let i = 0; i < 200; i++) {
        await db.one(insertNode, [i % 4]);
    }
};

init()