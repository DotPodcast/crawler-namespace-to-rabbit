let runCommand = require('./makeBlockstackRequest');

const getPageForNamespace = (ns, page) => {
  return runCommand('get_names_in_namespace', ns, page)}

const getZonefileForName = (name) => {
  return runCommand('get_name_zonefile', name);
}

const scrape = (ns, cb) => {
  console.log('Initiating Scraper');


  let successCount = 0;
  let errorCount = 0;

  let totalPages = 1;
  let pagePromises = [];

  console.log(`Scraping ${totalPages} pages of names in ${ns}`);

  for(var page = 0; page < totalPages; page++) {
    pagePromises.push(getPageForNamespace(ns, page)
      .then((namesWrapper) => {
        if(namesWrapper.json) {
          names = namesWrapper.json;
          promises = names.map((name) => {
            return getZonefileForName(name).then((zf) => {
              if( !zf.json && zf.txt.indexOf('$ORIGIN') === 0 ) {
                successCount++;
                cb({name, zonefileText: zf.txt});
              } else {
                errorCount++;
                console.log(`Unexpected zonefile result for ${name}`);
              }
            });
          });

          return Promise.all(promises);
        }
      }))
  }
  return Promise.all(pagePromises).then(() => {
    console.log(`Successes: ${successCount}\nErrors: ${errorCount}`);
  });
};

module.exports = scrape;
