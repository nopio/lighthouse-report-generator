const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const printer = require("lighthouse/lighthouse-cli/printer");
const fs = require("fs");

const config = require("./config.json");
const reportList = require(config.reportListPath);

const args = process.argv.slice(2);
const argPassed = args.filter(el => el.includes("chromePort"));
const chromePort =
  argPassed.length > 0
    ? parseInt(argPassed[0].replace("chromePort=", ""))
    : undefined;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function launchChromeAndRunLighthouse(url, opts, config = null) {
  //if chromePort is passed as argument in CLI use existing Chrome instance, else run new using Chrome Launcher
  opts.port = chromePort;
  return chromePort
    ? new Promise(resolve => resolve(runLighthouse(url, opts, config)))
    : chromeLauncher.launch(opts).then(chrome => {
        opts.port = chrome.port;
        return runLighthouse(url, opts, config, chrome);
      });
}

function runLighthouse(url, opts, config, chrome) {
  return lighthouse(url, opts, config).then(results => {
    return chrome
      ? chrome.kill().then(() => results)
      : new Promise(resolve => resolve(results));
  });
}

const opts = {
  output: config.output,
  chromeFlags: config.headless ? ["--headless", "--disable-gpu"] : undefined
};
const d = new Date();

//self invoke this async function
(async () => {
  const dirPath = config.outputPath
    .replace("%DD%", d.getDate())
    .replace("%M%", d.getMonth() + 1);
  const mainDir = config.outputPath.replace("/%DD%.%M%", "");

  let generalResults = {};
  await asyncForEach(reportList, async l => {
    const [k, v] = Object.entries(l)[0];
    console.log(`Auditing ${k} page: ${v}`);
    const { reports, lhr } = await launchChromeAndRunLighthouse(v, opts);
    generalResults[k] = lhr.categories.performance.score;

    if (!fs.existsSync(mainDir)) {
      fs.mkdirSync(mainDir);
    }
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    const filePath = `${dirPath}/${k}.${config.output}`;
    printer.write(reports, config.output, filePath).then(() => {
      console.log(`The ${k} page report generated and saved as ${filePath}!`);
    });
  });
  const csvString = "Page, Score \n" +Object.entries(generalResults).map(el=>el.join(",")).join("\n");
  fs.writeFile(`${dirPath}/_general.csv`, csvString, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log("All reports generated.");
  });
})();
