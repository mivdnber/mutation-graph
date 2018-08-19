const pg = require('pg-promise')();
pg.pg.defaults.ssl = true;
const db = pg(process.env.DATABASE_URL, { ssl: true });

const getNodesQuery = `
select * from node
`;
const getLinksQuery = `
select * from link
`;
const createLinkQuery = `
insert into link(source, target) values($1, $2)
returning *
`;

const getNodes = async () => {
  return db.any(getNodesQuery);
};

const getLinks = async () => {
  return db.any(getLinksQuery);
};

const createLink = async (source, target) => {
  return db.one(createLinkQuery, [source, target]);
};

module.exports = {
  getNodes,
  getLinks,
  createLink,
};