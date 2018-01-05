const runCommand = require('./makeBlockstackRequest');
const blockstackd = require('./blockstackd');

const PAGE_SIZE = 100;

const getNames = async (ns, cb, pageLimit) => {
  console.log('Getting Names');

  let successCount = 0;
  let errorCount = 0;
  const pagePromises = [];

  const totalNamesResponse = await blockstackd.getNumNamesInNamespace(ns);
  if (totalNamesResponse.error) {
    return Promise.reject(totalNamesResponse.error);
  }

  const totalNames = totalNamesResponse.count;
  console.log(`${totalNames} total names in the ${ns} namespace`);

  maxPages = Math.ceil(totalNames / PAGE_SIZE);

  if (!pageLimit) {
    // No limit, get them all
    pageLimit = Math.ceil(totalNames / PAGE_SIZE);
  } else {
    // Limit set, but don't let the limit exceed the actual number of pages available
    pageLimit = Math.min(pageLimit, maxPages);
  }

  console.log(`Scraping ${pageLimit} pages of names in ${ns}`);

  for (let currentPage = 0; currentPage < pageLimit; currentPage++) {
    const pagePromise = blockstackd.getNamesInNamespace(ns, currentPage * PAGE_SIZE, PAGE_SIZE)
      .then((namesWrapper) => {
        if (namesWrapper.names) {
          names = namesWrapper.names;
          successCount += names.length;
          names.forEach((name) => {
            cb({ name });
          });
        } else if (namesWrapper.error) {
          errorCount += PAGE_SIZE;
        }
      }).catch((e) => {
        console.log(e);
        console.log('Error processing names on page');
      });

    pagePromises.push(pagePromise);
  }

  return Promise.all(pagePromises).then(() => {
    console.log(`Successes: ${successCount}\nErrors: ${errorCount}`);
  });
};

module.exports = getNames;
