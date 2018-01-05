const winston = require('winston');
const blockstackd = require('./blockstackd');

const PAGE_SIZE = 100;

const getNames = async (ns, cb, pageLimit) => {
  winston.log('info', 'Getting Names');

  let successCount = 0;
  let errorCount = 0;
  const pagePromises = [];

  const totalNamesResponse = await blockstackd.getNumNamesInNamespace(ns);
  if (totalNamesResponse.error) {
    return Promise.reject(totalNamesResponse.error);
  }

  const totalNames = totalNamesResponse.count;
  winston.log('info', `${totalNames} total names in the ${ns} namespace`);

  const maxPages = Math.ceil(totalNames / PAGE_SIZE);

  let actualPageLimit = pageLimit;

  if (!pageLimit) {
    // No limit, get them all
    actualPageLimit = Math.ceil(totalNames / PAGE_SIZE);
  } else {
    // Limit set, but don't let the limit exceed the actual number of pages available
    actualPageLimit = Math.min(pageLimit, maxPages);
  }

  winston.log('info', `Scraping ${actualPageLimit} pages of names in ${ns}`);

  const handleNamesCall = (namesWrapper) => {
    if (namesWrapper.names) {
      const { names } = namesWrapper;
      successCount += names.length;
      names.forEach((name) => {
        cb({ name });
      });
    } else if (namesWrapper.error) {
      errorCount += PAGE_SIZE;
    }
  };

  for (let currentPage = 0; currentPage < actualPageLimit; currentPage += 1) {
    const pagePromise = blockstackd.getNamesInNamespace(ns, currentPage * PAGE_SIZE, PAGE_SIZE)
      .then(handleNamesCall).catch((e) => {
        winston.log('info', e);
        winston.log('info', 'Error processing names on page');
      });

    pagePromises.push(pagePromise);
  }

  return Promise.all(pagePromises).then(() => {
    winston.log('info', `Successes: ${successCount}\nErrors: ${errorCount}`);
  });
};

module.exports = getNames;
